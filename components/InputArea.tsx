import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { 
  Paperclip, 
  Globe, 
  Command, 
  AtSign, 
  ArrowUp, 
  Zap, 
  Plus, 
  ChevronDown, 
  Check, 
  Image as ImageIcon, 
  RefreshCw, 
  FileText, 
  PenTool, 
  Sparkles, 
  Bot,
  Blocks,
  Server,
  Code2,
  Database,
  GitBranch,
  ListTodo,
  Puzzle,
  Box,
  Palette,
  X,
  Library,
  LayoutGrid,
  Store,
  MessageSquare,
  Clock,
  Download,
  Star,
  Upload,
  Code
} from 'lucide-react';
import { MOCK_DOCS, MOCK_AGENTS, OFFICIAL_SKILLS, MY_SKILLS, OFFICIAL_MCPS, MY_MCPS } from '../constants';
import { Skill, MCP, ViewState } from '../types';

export interface InputAreaRef {
  setInput: (value: string | ((prev: string) => string)) => void;
  focus: () => void;
  append: (text: string) => void;
}

interface InputAreaProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  mode?: 'centered' | 'standard';
  placeholder?: string;
  onNavigate?: (view: ViewState) => void;
  disableConfig?: boolean;
}

const MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash', tags: ['多模态', '官方推荐'] },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro', tags: ['多模态', '推理增强'] },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tags: ['多模态', '轻量级'] },
  { id: 'deepseek-r1', name: 'DeepSeek R1', tags: ['外部模型', '开源', '推理'] },
  { id: 'gpt-4o', name: 'GPT-4o', tags: ['外部模型', '通用'] },
];

const SLASH_COMMANDS = [
  { id: 'reset', label: '重置对话', desc: '清除当前上下文', icon: RefreshCw },
  { id: 'summarize', label: '总结', desc: '总结当前对话内容', icon: FileText },
  { id: 'polish', label: '润色', desc: '优化文本表达', icon: PenTool },
  { id: 'expand', label: '扩写', desc: '丰富内容细节', icon: Sparkles },
];

const IconMap: Record<string, any> = {
    Bot: Bot,
    Image: ImageIcon,
    Video: ImageIcon, // Reused
    Mic: ImageIcon, // Reused
    Network: Globe,
    Globe: Globe,
    BookOpen: FileText,
    FileText: FileText,
    HardDrive: Database,
    Database: Database,
    Send: ArrowUp,
    GitBranch: GitBranch,
    ListTodo: ListTodo,
    MessageSquare: MessageSquare,
    Server: Server,
    Code2: Code2
};

export const InputArea = forwardRef<InputAreaRef, InputAreaProps>(({ onSendMessage, disabled, mode = 'standard', placeholder, onNavigate, disableConfig = false }, ref) => {
  const [input, setInput] = useState('');
  const [showAtMenu, setShowAtMenu] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [showModelMenu, setShowModelMenu] = useState(false);
  
  // Tools State (Modal)
  const [activeSkills, setActiveSkills] = useState<Skill[]>([]);
  const [activeMcps, setActiveMcps] = useState<MCP[]>([]);
  const [showSelectorModal, setShowSelectorModal] = useState<'skills' | 'mcp' | null>(null);
  const [selectorTab, setSelectorTab] = useState<'official' | 'mine'>('official');
  const [previewItem, setPreviewItem] = useState<Skill | MCP | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolFileInputRef = useRef<HTMLInputElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    setInput: setInput,
    focus: () => textareaRef.current?.focus(),
    append: (text: string) => {
        setInput(prev => prev + text);
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
                textareaRef.current.focus();
            }
        }, 10);
    }
  }));

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
        textareaRef.current.style.height = input ? `${newHeight}px` : (mode === 'centered' ? '140px' : '44px');
    }
  }, [input, mode]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setShowModelMenu(false);
      }
      const target = event.target as HTMLElement;
      if (!target.closest('.popup-menu') && !target.closest('.tool-trigger')) {
          setShowAtMenu(false);
          setShowSlashMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset preview item when modal closes
  useEffect(() => {
    if (!showSelectorModal) {
      setPreviewItem(null);
      setIsCreating(false);
    }
  }, [showSelectorModal]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (showAtMenu || showSlashMenu) {
          e.preventDefault();
          setShowAtMenu(false);
          setShowSlashMenu(false);
          return;
      }
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    
    const lastChar = val.slice(-1);
    if (lastChar === '@') {
        setShowAtMenu(true);
        setShowSlashMenu(false);
    } else if (lastChar === '/') {
        setShowSlashMenu(true);
        setShowAtMenu(false);
    } else {
        if (!val.includes('@')) setShowAtMenu(false);
        if (!val.includes('/')) setShowSlashMenu(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSendMessage(input);
    setInput('');
    setShowAtMenu(false);
    setShowSlashMenu(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const insertText = (text: string, trigger: string) => {
      const lastIndex = input.lastIndexOf(trigger);
      if (lastIndex !== -1) {
          setInput(prev => prev.substring(0, lastIndex) + text + ' ');
      } else {
          setInput(prev => prev + text + ' ');
      }
      setShowAtMenu(false);
      setShowSlashMenu(false);
      textareaRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          alert(`已选择文件: ${e.target.files[0].name}`);
      }
  };

  const toggleSkill = (skill: Skill) => {
      setActiveSkills(prev => {
          const exists = prev.find(s => s.id === skill.id);
          return exists ? prev.filter(s => s.id !== skill.id) : [...prev, skill];
      });
  };

  const toggleMCP = (mcp: MCP) => {
      setActiveMcps(prev => {
          const exists = prev.find(m => m.id === mcp.id);
          return exists ? prev.filter(m => m.id !== mcp.id) : [...prev, mcp];
      });
  };

  const handleCreateClick = () => {
      if (showSelectorModal === 'skills') {
          setIsCreating(true);
          setPreviewItem(null);
      } else if (showSelectorModal === 'mcp') {
          window.open('https://github.com/modelcontextprotocol', '_blank');
      }
  };

  const handleToolFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          alert(`已上传技能文件: ${e.target.files[0].name}`);
          setIsCreating(false);
      }
  };

  const handleAiDev = () => {
      setShowSelectorModal(null);
      setInput(prev => prev + "开发技能：");
      setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const renderSelectorModal = () => {
    if (!showSelectorModal) return null;

    let itemsToDisplay: any[] = [];
    let toggleFunc: (item: any) => void = () => {};
    let selectedList: any[] = [];
    let typeLabel = '';
    
    if (showSelectorModal === 'skills') {
        itemsToDisplay = selectorTab === 'official' ? OFFICIAL_SKILLS : MY_SKILLS;
        toggleFunc = toggleSkill;
        selectedList = activeSkills;
        typeLabel = '技能';
    } else if (showSelectorModal === 'mcp') {
        itemsToDisplay = selectorTab === 'official' ? OFFICIAL_MCPS : MY_MCPS;
        toggleFunc = toggleMCP;
        selectedList = activeMcps;
        typeLabel = 'MCP';
    }

    const renderDetailPanel = () => {
      if (!previewItem) return null;
      // @ts-ignore
      const Icon = IconMap[previewItem.icon] || Box;
      const isSelected = selectedList.some(s => s.id === previewItem.id);
      const mockInfo = {
          version: 'v1.0.2',
          updated: '2天前',
          downloads: '1.2k',
          // @ts-ignore
          author: previewItem.author || 'Wohu Official',
          title: previewItem.name,
          description: previewItem.description
      };
  
      return (
          <div className="w-80 h-full bg-gray-50 border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-200 z-10 shrink-0">
              <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                  <span className="font-bold text-gray-800 text-sm">详情</span>
                  <button onClick={() => setPreviewItem(null)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                   {/* Header Info */}
                   <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 mb-3">
                            <Icon size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight px-2">{mockInfo.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{mockInfo.author}</p>
                   </div>
                   
                   {/* Action */}
                   <button 
                      onClick={() => { toggleFunc(previewItem); }}
                      className={`w-full py-2.5 rounded-lg text-xs font-bold transition-colors shadow-sm ${isSelected ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-[#55635C] text-white hover:bg-[#444F49]'}`}
                   >
                      {isSelected ? '移除此项' : '添加此项'}
                   </button>
  
                   {/* Description */}
                   <div>
                       <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">简介</h4>
                       <p className="text-xs text-gray-600 leading-relaxed bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                          {mockInfo.description || "暂无详细描述。该项功能可以帮助您完成特定的任务，提高工作效率。"}
                       </p>
                   </div>
  
                   {/* Meta Info Grid */}
                   <div className="grid grid-cols-2 gap-3">
                       <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                           <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1"><GitBranch size={10}/> 版本</div>
                           <div className="text-xs font-medium text-gray-800">{mockInfo.version}</div>
                       </div>
                       <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                           <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1"><Clock size={10}/> 更新时间</div>
                           <div className="text-xs font-medium text-gray-800">{mockInfo.updated}</div>
                       </div>
                       <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                           <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1"><Download size={10}/> 使用量</div>
                           <div className="text-xs font-medium text-gray-800">{mockInfo.downloads}</div>
                       </div>
                       <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                           <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1"><Star size={10}/> 评分</div>
                           <div className="text-xs font-medium text-gray-800">4.9/5.0</div>
                       </div>
                   </div>
                   
                   {/* Capabilities / API (Mock) */}
                   <div>
                       <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">能力范畴</h4>
                       <div className="flex flex-wrap gap-2">
                           {['文本处理', '数据分析', '格式转换'].map(tag => (
                               <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] border border-blue-100">{tag}</span>
                           ))}
                       </div>
                   </div>
  
              </div>
          </div>
      )
    }

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-[900px] h-[600px] flex overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Sidebar */}
              <div className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col p-4 shrink-0">
                  <button 
                      onClick={handleCreateClick}
                      className="w-full flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-[#55635C] hover:text-[#55635C] transition-all shadow-sm mb-6 mt-1"
                  >
                      <Plus size={16} /> 创建{typeLabel}
                  </button>

                  <div className="space-y-1 flex-1">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-400">分类</div>
                      <button 
                          onClick={() => { setSelectorTab('official'); setIsCreating(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${!isCreating && selectorTab === 'official' ? 'bg-blue-50 text-brand-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                          <Library size={18} className={!isCreating && selectorTab === 'official' ? 'text-brand-600' : 'text-gray-400'} /> 
                          官方{typeLabel}
                      </button>
                      <button 
                          onClick={() => { setSelectorTab('mine'); setIsCreating(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${!isCreating && selectorTab === 'mine' ? 'bg-blue-50 text-brand-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                          <LayoutGrid size={18} className={!isCreating && selectorTab === 'mine' ? 'text-brand-600' : 'text-gray-400'} /> 
                          我的{typeLabel}
                      </button>
                  </div>
              </div>

              {/* Main Content Area (Flex Row) */}
              <div className="flex-1 flex min-w-0">
                  {isCreating ? (
                         <div className="flex-1 flex flex-col">
                             <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white flex-shrink-0">
                                 <h3 className="text-sm font-bold text-gray-800">技能列表</h3>
                                 <button onClick={() => setShowSelectorModal(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                     <X size={20} />
                                 </button>
                             </div>
                             <div className="flex-1 p-8 flex items-center justify-center bg-white">
                                 <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50/50">
                                     <div className="w-16 h-16 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-6 shadow-sm">
                                         <Plus size={32} className="text-gray-400" />
                                     </div>
                                     <h3 className="text-gray-900 font-bold mb-8 text-lg">暂无我的技能</h3>
                                     
                                     <input type="file" ref={toolFileInputRef} className="hidden" onChange={handleToolFileUpload} />
                                     
                                     <div className="flex gap-6">
                                         <button 
                                             onClick={() => toolFileInputRef.current?.click()}
                                             className="px-8 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                                         >
                                             <Upload size={16}/> 本地上传
                                         </button>
                                         <button 
                                             onClick={handleAiDev}
                                             className="px-8 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                                         >
                                             <Code size={16}/> AI 开发
                                         </button>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    ) : (
                      <>
                        {/* List Column */}
                        <div className="flex-1 flex flex-col min-w-0">
                              <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white flex-shrink-0">
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                      已选 <span className="font-bold text-[#55635C]">{selectedList.length}</span>/50
                                  </div>
                                  <button onClick={() => setShowSelectorModal(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                      <X size={20} />
                                  </button>
                              </div>
              
                              <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
                                  <div className="space-y-4">
                                      {itemsToDisplay.map(item => {
                                          const Icon = IconMap[item.icon] || Box;
                                          const isSelected = selectedList.some(s => s.id === item.id);
                                          const isPreviewing = previewItem?.id === item.id;
              
                                          return (
                                              <div 
                                                  key={item.id} 
                                                  onClick={() => setPreviewItem(item)}
                                                  className={`flex items-center justify-between p-4 rounded-xl border transition-all group cursor-pointer ${isPreviewing ? 'border-[#55635C] bg-gray-50 shadow-sm' : 'border-gray-100 hover:shadow-md hover:border-gray-200'}`}
                                              >
                                                  <div className="flex items-center gap-4 min-w-0">
                                                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'} group-hover:scale-105 transition-transform`}>
                                                          <Icon size={24} />
                                                      </div>
                                                      <div className="min-w-0">
                                                          <h4 className="font-bold text-gray-800 text-sm mb-1 truncate">{item.name}</h4>
                                                          <p className="text-xs text-gray-500 truncate">{item.description}</p>
                                                      </div>
                                                  </div>
                                                  
                                                  <button 
                                                      onClick={(e) => { e.stopPropagation(); toggleFunc(item); }}
                                                      className={`ml-4 px-4 py-2 rounded-lg text-xs font-medium transition-all shrink-0 ${
                                                          isSelected 
                                                          ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' 
                                                          : 'bg-white border border-gray-200 text-gray-700 hover:border-[#55635C] hover:text-[#55635C] shadow-sm'
                                                      }`}
                                                  >
                                                      {isSelected ? '已添加' : '添加'}
                                                  </button>
                                              </div>
                                          )
                                      })}
                                  </div>
                              </div>
                              
                              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end shrink-0">
                                  <button className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                      <Store size={14} /> 前往资产市场发现更多{typeLabel}
                                  </button>
                              </div>
                        </div>

                        {/* Details Panel */}
                        {renderDetailPanel()}
                      </>
                    )}
              </div>
          </div>
      </div>
    )
  }

  const isCentered = mode === 'centered';
  
  // Default placeholders
  const defaultPlaceholder = isCentered 
     ? "分配任务或向我咨询任何问题吧~" 
     : "输入消息... 使用 '/' 输入指令, '@' 引用知识库";

  return (
    <div className={`w-full ${isCentered ? 'max-w-[800px]' : 'max-w-4xl'} mx-auto ${isCentered ? '' : 'px-4 pb-6'}`}>
      <div 
        className={`relative bg-white transition-all duration-300
        ${isCentered 
            ? 'rounded-2xl border-[6px] border-[#F2F1EF]/50 shadow-sm' 
            : 'rounded-xl border border-gray-200 shadow-lg'
        }`}
      >
        <div className={`${isCentered ? 'bg-white rounded-xl border border-gray-100' : ''}`}>
            {/* Text Area */}
            <textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || defaultPlaceholder}
            className={`w-full outline-none resize-none text-gray-700 bg-transparent custom-scrollbar block
                ${isCentered ? 'p-6 text-base' : 'p-3 text-sm'}
            `}
            style={{ minHeight: isCentered ? '140px' : '44px' }}
            disabled={disabled}
            />

            {/* Popover Menus */}
            {/* @ Menu */}
            {showAtMenu && (
                <div className="popup-menu absolute left-4 bottom-14 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 bg-gray-50/50 uppercase tracking-wider">知识库</div>
                    {MOCK_DOCS.map(doc => (
                        <div key={doc.id} onClick={() => insertText(`@${doc.title}`, '@')} className="px-3 py-2 hover:bg-gray-50 text-sm cursor-pointer flex items-center gap-2 text-gray-700">
                            <Paperclip size={14} className="text-gray-400"/> {doc.title}
                        </div>
                    ))}
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 bg-gray-50/50 uppercase tracking-wider mt-1">智能体</div>
                    {MOCK_AGENTS.map(agent => (
                         <div key={agent.id} onClick={() => insertText(`@${agent.name}`, '@')} className="px-3 py-2 hover:bg-gray-50 text-sm cursor-pointer flex items-center gap-2 text-gray-700">
                            <Bot size={14} className="text-gray-400"/> {agent.name}
                        </div>
                    ))}
                </div>
            )}

            {/* Slash Menu */}
            {showSlashMenu && (
                <div className="popup-menu absolute left-4 bottom-14 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                     <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 bg-gray-50/50 uppercase tracking-wider">快捷指令</div>
                     {SLASH_COMMANDS.map(cmd => (
                        <div key={cmd.id} onClick={() => insertText(cmd.label, '/')} className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 group">
                            <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:text-[#55635C] transition-colors border border-transparent group-hover:border-gray-200">
                                <cmd.icon size={14} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-700">{cmd.label}</div>
                                <div className="text-xs text-gray-400">{cmd.desc}</div>
                            </div>
                        </div>
                     ))}
                </div>
            )}

            {/* Bottom Toolbar */}
            <div className={`flex justify-between items-center ${isCentered ? 'px-4 py-3' : 'px-2 py-2'}`}>
                <div className="flex items-center gap-2">
                    {/* File Input (Hidden) */}
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} multiple />
                    
                    {/* Plus Button - Now handles Uploads */}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all mr-1
                            ${isCentered 
                                ? 'w-8 h-8 rounded-full border border-gray-200 shadow-sm' 
                                : 'w-8 h-8 rounded-lg'
                            }`}
                        title="上传文件"
                    >
                        <Plus size={isCentered ? 16 : 18} />
                    </button>
                    
                    {!disableConfig && (
                        <>
                            {/* Model Selector */}
                            <div className="relative" ref={modelMenuRef}>
                                <button 
                                    onClick={() => setShowModelMenu(!showModelMenu)}
                                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer text-xs font-medium text-gray-600 transition-colors border border-transparent hover:border-gray-200 ${showModelMenu ? 'bg-gray-100' : ''}`}
                                >
                                <Zap size={14} className="text-[#55635C]"/>
                                <span>{selectedModel.name}</span>
                                <ChevronDown size={12} className="text-gray-400"/>
                                </button>

                                {showModelMenu && (
                                    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 flex flex-col animate-in fade-in zoom-in-95 duration-100 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {MODELS.map(model => (
                                            <button
                                                key={model.id}
                                                onClick={() => {
                                                    setSelectedModel(model);
                                                    setShowModelMenu(false);
                                                }}
                                                className="text-left px-4 py-3 text-xs hover:bg-gray-50 flex flex-col gap-1.5 border-b border-gray-50 last:border-0 w-full transition-colors group"
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span className={`font-medium text-sm ${selectedModel.id === model.id ? 'text-[#55635C]' : 'text-gray-700'}`}>{model.name}</span>
                                                    {selectedModel.id === model.id && <Check size={14} className="text-[#55635C]"/>}
                                                </div>
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {model.tags.map(tag => (
                                                        <span key={tag} className={`px-1.5 py-0.5 rounded text-[10px] border ${
                                                            tag === '外部模型' 
                                                                ? 'bg-orange-50 text-orange-600 border-orange-100' 
                                                                : tag.includes('模态') 
                                                                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                                    : 'bg-gray-100 text-gray-500 border-gray-200'
                                                        }`}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="h-4 w-px bg-gray-200 mx-1"></div>

                            {/* Search Toggle */}
                            <div 
                                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer text-xs transition-colors select-none font-medium ${webSearch ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                                onClick={() => setWebSearch(!webSearch)}
                            >
                                <Globe size={14} />
                                <span className="hidden sm:inline">联网</span>
                            </div>

                            {/* Skills Toggle (Opens Modal) */}
                            <div 
                                className={`tool-trigger flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer text-xs transition-colors select-none font-medium ${activeSkills.length > 0 ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                                onClick={() => {
                                    setShowSelectorModal('skills');
                                    setSelectorTab('official');
                                }}
                            >
                                <Puzzle size={14} />
                                <span className="hidden sm:inline">技能</span>
                                {activeSkills.length > 0 && <span className="bg-blue-100 text-blue-700 px-1 rounded-full text-[10px]">{activeSkills.length}</span>}
                            </div>

                            {/* MCP Toggle (Opens Modal) */}
                            <div 
                                className={`tool-trigger flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer text-xs transition-colors select-none font-medium ${activeMcps.length > 0 ? 'bg-purple-50 text-purple-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                                onClick={() => {
                                    setShowSelectorModal('mcp');
                                    setSelectorTab('official');
                                }}
                            >
                                <Server size={14} />
                                <span className="hidden sm:inline">MCP</span>
                                {activeMcps.length > 0 && <span className="bg-purple-100 text-purple-700 px-1 rounded-full text-[10px]">{activeMcps.length}</span>}
                            </div>
                        </>
                    )}
                </div>
                
                <div className="flex items-center gap-1">
                    {!isCentered && (
                        <>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg hidden sm:block"><Command size={18} /></button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg hidden sm:block"><AtSign size={18} /></button>
                        </>
                    )}

                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || disabled}
                        className={`w-9 h-9 rounded-lg transition-all flex items-center justify-center ml-1
                            ${input.trim() && !disabled ? 'bg-[#55635C] text-white hover:bg-[#444F49] shadow-md' : 'bg-[#F2F1EF] text-white'}
                        `}
                    >
                        <ArrowUp size={18} />
                    </button>
                </div>
            </div>
        </div>

        {/* Recommended Actions (Chips) - Displayed below input area */}
        {isCentered && (
            <div className="flex gap-3 mt-3 px-2">
                <button 
                    onClick={() => setInput(prev => prev + '我想构建一个智能体 ')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                    <Box size={12} className="text-[#55635C]"/>
                    构建智能体
                </button>
                <button 
                    onClick={() => setInput(prev => prev + '生成 UI 界面 ')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                    <Palette size={12} className="text-[#55635C]"/>
                    生成 UI
                </button>
            </div>
        )}
      </div>

      {showSelectorModal && createPortal(renderSelectorModal(), document.body)}
    </div>
  );
});