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
  RefreshCw, 
  FileText, 
  PenTool, 
  Sparkles, 
  Bot,
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

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
        textareaRef.current.style.height = input ? `${newHeight}px` : (mode === 'centered' ? '140px' : '44px');
    }
  }, [input, mode]);

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
      const Icon = IconMap[previewItem.icon] || Box;
      const isSelected = selectedList.some(s => s.id === previewItem.id);
      const mockInfo = {
          version: 'v1.0.2',
          updated: '2天前',
          downloads: '1.2k',
          author: (previewItem as any).author || '卧虎官方',
          title: previewItem.name,
          description: previewItem.description
      };
  
      return (
          <div className="w-80 h-full bg-stone-50 border-l border-stone-200 flex flex-col animate-in slide-in-from-right duration-200 z-10 shrink-0">
              <div className="p-4 border-b border-stone-200 bg-white flex items-center justify-between shrink-0">
                  <span className="font-bold text-stone-900 text-sm">详情</span>
                  <button onClick={() => setPreviewItem(null)} className="text-stone-400 hover:text-stone-900 transition-colors"><X size={16}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                   <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-white rounded-md shadow-warm-sm border border-stone-200 flex items-center justify-center text-stone-600 mb-3">
                            <Icon size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 leading-tight px-2">{mockInfo.title}</h3>
                        <p className="text-xs text-stone-500 mt-1">{mockInfo.author}</p>
                   </div>
                   
                   <button 
                      onClick={() => { toggleFunc(previewItem); }}
                      className={`w-full py-2.5 rounded-md text-xs font-bold transition-all-200 shadow-warm-xs ${isSelected ? 'bg-stone-200 text-stone-600 hover:bg-stone-300' : 'bg-sage-500 text-white hover:bg-sage-600'}`}
                   >
                      {isSelected ? '移除此项' : '添加此项'}
                   </button>
  
                   <div>
                       <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">简介</h4>
                       <p className="text-xs text-stone-600 leading-relaxed bg-white p-3 rounded-md border border-stone-200 shadow-warm-xs">
                          {mockInfo.description || "暂无详细描述。该项功能可以帮助您完成特定的任务，提高工作效率。"}
                       </p>
                   </div>
  
                   <div className="grid grid-cols-2 gap-3">
                       <div className="bg-white p-3 rounded-md border border-stone-100 shadow-warm-xs">
                           <div className="text-[10px] text-stone-400 mb-1 flex items-center gap-1 uppercase font-bold">Version</div>
                           <div className="text-xs font-medium text-stone-900">{mockInfo.version}</div>
                       </div>
                       <div className="bg-white p-3 rounded-md border border-stone-100 shadow-warm-xs">
                           <div className="text-[10px] text-stone-400 mb-1 flex items-center gap-1 uppercase font-bold">Updated</div>
                           <div className="text-xs font-medium text-stone-900">{mockInfo.updated}</div>
                       </div>
                   </div>
              </div>
          </div>
      )
    }

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-md shadow-warm-lg w-[900px] h-[600px] flex overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200">
              <div className="w-56 bg-stone-50 border-r border-stone-200 flex flex-col p-4 shrink-0">
                  <button 
                      onClick={handleCreateClick}
                      className="w-full flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-md text-sm font-semibold text-stone-700 hover:border-sage-500 hover:text-sage-700 transition-all shadow-warm-xs mb-6 mt-1 active-press"
                  >
                      <Plus size={16} /> 创建{typeLabel}
                  </button>

                  <div className="space-y-0.5 flex-1">
                      <div className="px-3 py-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">分类</div>
                      <button 
                          onClick={() => { setSelectorTab('official'); setIsCreating(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all-200 text-left ${!isCreating && selectorTab === 'official' ? 'bg-sage-50 text-sage-700 font-semibold shadow-warm-xs border border-sage-100' : 'text-stone-600 hover:bg-stone-100'}`}
                      >
                          <Library size={18} className={!isCreating && selectorTab === 'official' ? 'text-sage-600' : 'text-stone-400'} /> 
                          官方{typeLabel}
                      </button>
                      <button 
                          onClick={() => { setSelectorTab('mine'); setIsCreating(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all-200 text-left ${!isCreating && selectorTab === 'mine' ? 'bg-sage-50 text-sage-700 font-semibold shadow-warm-xs border border-sage-100' : 'text-stone-600 hover:bg-stone-100'}`}
                      >
                          <LayoutGrid size={18} className={!isCreating && selectorTab === 'mine' ? 'text-sage-600' : 'text-stone-400'} /> 
                          我的{typeLabel}
                      </button>
                  </div>
              </div>

              <div className="flex-1 flex min-w-0">
                  {isCreating ? (
                         <div className="flex-1 flex flex-col bg-white">
                             <div className="h-16 border-b border-stone-200 flex items-center justify-between px-6 shrink-0">
                                 <h3 className="text-sm font-bold text-stone-900">技能列表</h3>
                                 <button onClick={() => setShowSelectorModal(null)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-900 transition-colors">
                                     <X size={20} />
                                 </button>
                             </div>
                             <div className="flex-1 p-8 flex items-center justify-center">
                                 <div className="w-full h-full border-2 border-dashed border-stone-200 rounded-md flex flex-col items-center justify-center bg-stone-50/50">
                                     <div className="w-16 h-16 bg-white rounded-md border border-stone-200 flex items-center justify-center mb-6 shadow-warm-xs">
                                         <Plus size={32} className="text-stone-300" />
                                     </div>
                                     <h3 className="text-stone-900 font-bold mb-8 text-lg">暂无我的技能</h3>
                                     
                                     <input type="file" ref={toolFileInputRef} className="hidden" onChange={handleToolFileUpload} />
                                     
                                     <div className="flex gap-6">
                                         <button 
                                             onClick={() => toolFileInputRef.current?.click()}
                                             className="px-8 py-3 bg-white border border-stone-200 rounded-md text-sm font-bold text-stone-700 hover:border-stone-400 hover:bg-white transition-all shadow-warm-xs flex items-center gap-2 active-press"
                                         >
                                             <Upload size={16}/> 本地上传
                                         </button>
                                         <button 
                                             onClick={handleAiDev}
                                             className="px-8 py-3 bg-white border border-stone-200 rounded-md text-sm font-bold text-stone-700 hover:border-stone-400 hover:bg-white transition-all shadow-warm-xs flex items-center gap-2 active-press"
                                         >
                                             <Code size={16}/> AI 开发
                                         </button>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    ) : (
                      <>
                        <div className="flex-1 flex flex-col min-w-0 bg-white">
                              <div className="h-16 border-b border-stone-200 flex items-center justify-between px-6 shrink-0">
                                  <div className="flex items-center gap-2 text-sm text-stone-500 font-medium">
                                      已选择 <span className="font-bold text-sage-600">{selectedList.length}</span> / 50
                                  </div>
                                  <button onClick={() => setShowSelectorModal(null)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-900 transition-colors">
                                      <X size={20} />
                                  </button>
                              </div>
              
                              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                  {itemsToDisplay.map(item => {
                                      const Icon = IconMap[item.icon] || Box;
                                      const isSelected = selectedList.some(s => s.id === item.id);
                                      const isPreviewing = previewItem?.id === item.id;
              
                                      return (
                                          <div 
                                              key={item.id} 
                                              onClick={() => setPreviewItem(item)}
                                              className={`flex items-center justify-between p-4 rounded-md border transition-all-200 group cursor-pointer ${isPreviewing ? 'border-sage-500 bg-sage-50/30 shadow-warm-xs' : 'border-stone-100 hover:shadow-warm-md hover:border-stone-200 bg-white'}`}
                                          >
                                              <div className="flex items-center gap-4 min-w-0">
                                                  <div className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${isSelected ? 'bg-sage-50 text-sage-600 border border-sage-100' : 'bg-stone-50 text-stone-400 border border-stone-100'}`}>
                                                      <Icon size={24} />
                                                  </div>
                                                  <div className="min-w-0">
                                                      <h4 className="font-bold text-stone-900 text-sm mb-0.5 truncate">{item.name}</h4>
                                                      <p className="text-xs text-stone-500 truncate font-medium">{item.description}</p>
                                                  </div>
                                              </div>
                                              
                                              <button 
                                                  onClick={(e) => { e.stopPropagation(); toggleFunc(item); }}
                                                  className={`ml-4 px-4 py-2 rounded-md text-xs font-bold transition-all-200 shrink-0 ${
                                                      isSelected 
                                                      ? 'bg-stone-100 text-stone-400 shadow-inner' 
                                                      : 'bg-white border border-stone-200 text-stone-700 hover:border-sage-500 hover:text-sage-600 shadow-warm-xs'
                                                  }`}
                                              >
                                                  {isSelected ? '已添加' : '添加'}
                                              </button>
                                          </div>
                                      )
                                  })}
                              </div>
                              
                              <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end shrink-0">
                                  <button className="flex items-center gap-1.5 text-xs text-sage-600 font-bold hover:text-sage-800 transition-colors">
                                      <Store size={14} /> 前往资产市场发现更多{typeLabel}
                                  </button>
                              </div>
                        </div>
                        {renderDetailPanel()}
                      </>
                    )}
              </div>
          </div>
      </div>
    )
  }

  const isCentered = mode === 'centered';
  const defaultPlaceholder = isCentered 
     ? "分配任务或向我咨询任何问题吧~" 
     : "输入消息... 使用 '/' 输入指令, '@' 引用知识库";

  return (
    <div className={`w-full ${isCentered ? 'max-w-[800px]' : 'max-w-4xl'} mx-auto ${isCentered ? '' : 'px-4 pb-6'}`}>
      <div 
        className={`relative bg-white transition-all-200
        ${isCentered 
            ? 'rounded-md border border-stone-200 shadow-warm-xs' 
            : 'rounded-md border border-stone-200 shadow-warm-lg'
        }`}
      >
        <div className="bg-white rounded-md">
            <textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || defaultPlaceholder}
            className={`w-full outline-none resize-none text-stone-900 bg-transparent custom-scrollbar block placeholder:text-stone-300 leading-relaxed
                ${isCentered ? 'p-6 text-base' : 'p-4 text-sm'}
            `}
            style={{ minHeight: isCentered ? '140px' : '44px' }}
            disabled={disabled}
            />

            {showAtMenu && (
                <div className="popup-menu absolute left-4 bottom-14 w-64 bg-white border border-stone-200 rounded-md shadow-warm-lg z-[100] py-1 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-stone-400 bg-stone-50/50 uppercase tracking-widest border-b border-stone-100 mb-1">知识库</div>
                    {MOCK_DOCS.map(doc => (
                        <div key={doc.id} onClick={() => insertText(`@${doc.title}`, '@')} className="px-3 py-2 hover:bg-stone-50 text-sm cursor-pointer flex items-center gap-2 text-stone-700">
                            <Paperclip size={14} className="text-stone-300"/> {doc.title}
                        </div>
                    ))}
                    <div className="px-3 py-1.5 text-[10px] font-bold text-stone-400 bg-stone-50/50 uppercase tracking-widest border-b border-stone-100 my-1">智能体</div>
                    {MOCK_AGENTS.slice(0, 3).map(agent => (
                         <div key={agent.id} onClick={() => insertText(`@${agent.name}`, '@')} className="px-3 py-2 hover:bg-stone-50 text-sm cursor-pointer flex items-center gap-2 text-stone-700">
                            <Bot size={14} className="text-stone-300"/> {agent.name}
                        </div>
                    ))}
                </div>
            )}

            {showSlashMenu && (
                <div className="popup-menu absolute left-4 bottom-14 w-64 bg-white border border-stone-200 rounded-md shadow-warm-lg z-[100] py-1 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                     <div className="px-3 py-1.5 text-[10px] font-bold text-stone-400 bg-stone-50/50 uppercase tracking-widest border-b border-stone-100 mb-1">快捷指令</div>
                     {SLASH_COMMANDS.map(cmd => (
                        <div key={cmd.id} onClick={() => insertText(cmd.label, '/')} className="px-3 py-2 hover:bg-stone-50 cursor-pointer flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-white group-hover:text-sage-600 transition-all-200 border border-transparent group-hover:border-stone-200">
                                <cmd.icon size={14} />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-stone-900">{cmd.label}</div>
                                <div className="text-[11px] text-stone-500">{cmd.desc}</div>
                            </div>
                        </div>
                     ))}
                </div>
            )}

            <div className={`flex justify-between items-center bg-stone-50/50 border-t border-stone-100 transition-colors ${isCentered ? 'px-4 py-3' : 'px-3 py-2'}`}>
                <div className="flex items-center gap-1">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} multiple />
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-200/50 transition-all-200 rounded-md
                            ${isCentered ? 'w-8 h-8' : 'w-7 h-7'}`}
                        title="上传文件"
                    >
                        <Plus size={18} />
                    </button>
                    
                    {!disableConfig && (
                        <>
                            <div className="relative" ref={modelMenuRef}>
                                <button 
                                    onClick={() => setShowModelMenu(!showModelMenu)}
                                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-stone-200/50 cursor-pointer text-xs font-bold text-stone-600 transition-all-200 border border-transparent hover:border-stone-200 ${showModelMenu ? 'bg-stone-200/50 border-stone-200' : ''}`}
                                >
                                <Zap size={14} className="text-sage-500"/>
                                <span>{selectedModel.name}</span>
                                <ChevronDown size={12} className="text-stone-300"/>
                                </button>

                                {showModelMenu && (
                                    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-stone-200 rounded-md shadow-warm-lg z-[110] py-1 flex flex-col animate-in fade-in zoom-in-95 duration-100 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {MODELS.map(model => (
                                            <button
                                                key={model.id}
                                                onClick={() => {
                                                    setSelectedModel(model);
                                                    setShowModelMenu(false);
                                                }}
                                                className="text-left px-4 py-3 text-xs hover:bg-stone-50 flex flex-col gap-1.5 border-b border-stone-50 last:border-0 w-full transition-colors group"
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span className={`font-bold text-sm ${selectedModel.id === model.id ? 'text-sage-600' : 'text-stone-700'}`}>{model.name}</span>
                                                    {selectedModel.id === model.id && <Check size={14} className="text-sage-500"/>}
                                                </div>
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {model.tags.map(tag => (
                                                        <span key={tag} className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold border ${
                                                            tag === '官方推荐' 
                                                                ? 'bg-sage-50 text-sage-600 border-sage-100' 
                                                                : 'bg-stone-50 text-stone-400 border-stone-100'
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

                            <div className="h-4 w-px bg-stone-200 mx-1"></div>

                            <div 
                                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer text-xs transition-all-200 select-none font-bold ${webSearch ? 'bg-sage-50 text-sage-700 shadow-warm-xs border border-sage-100' : 'text-stone-400 hover:bg-stone-200/50 hover:text-stone-700'}`}
                                onClick={() => setWebSearch(!webSearch)}
                            >
                                <Globe size={14} />
                                <span className="hidden sm:inline">联网</span>
                            </div>

                            <div 
                                className={`tool-trigger flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer text-xs transition-all-200 select-none font-bold ${activeSkills.length > 0 ? 'bg-sage-50 text-sage-700 shadow-warm-xs border border-sage-100' : 'text-stone-400 hover:bg-stone-200/50 hover:text-stone-700'}`}
                                onClick={() => {
                                    setShowSelectorModal('skills');
                                    setSelectorTab('official');
                                }}
                            >
                                <Puzzle size={14} />
                                <span className="hidden sm:inline">技能</span>
                                {activeSkills.length > 0 && <span className="bg-sage-100 text-sage-700 px-1.5 rounded-full text-[10px] ml-1">{activeSkills.length}</span>}
                            </div>
                        </>
                    )}
                </div>
                
                <div className="flex items-center gap-1">
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || disabled}
                        className={`w-8 h-8 rounded-md transition-all-200 flex items-center justify-center ml-1
                            ${input.trim() && !disabled ? 'bg-sage-500 text-white hover:bg-sage-600 shadow-sage-btn active-press' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}
                        `}
                    >
                        <ArrowUp size={18} />
                    </button>
                </div>
            </div>
        </div>

        {isCentered && (
            <div className="flex gap-2 mt-4 px-1">
                <button 
                    onClick={() => setInput(prev => prev + '我想构建一个智能体 ')}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs font-semibold text-stone-600 hover:bg-white hover:border-sage-300 hover:text-sage-700 transition-all-200 shadow-warm-xs hover-lift active-press"
                >
                    <Box size={14} className="text-sage-500"/>
                    构建智能体
                </button>
                <button 
                    onClick={() => setInput(prev => prev + '生成 UI 界面 ')}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs font-semibold text-stone-600 hover:bg-white hover:border-sage-300 hover:text-sage-700 transition-all-200 shadow-warm-xs hover-lift active-press"
                >
                    <Palette size={14} className="text-sage-500"/>
                    生成 UI
                </button>
            </div>
        )}
      </div>

      {showSelectorModal && createPortal(renderSelectorModal(), document.body)}
    </div>
  );
});