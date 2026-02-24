import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  MessageSquarePlus, 
  BookOpen, 
  LayoutGrid, 
  MoreHorizontal, 
  Folder,
  Pencil,
  Trash2,
  ChevronLeft, 
  ChevronRight,
  Bot,
  BrainCircuit,
  Zap,
  TestTube,
  Store,
  Code2,
  FlaskConical,
  Plus,
  FolderPlus,
  X,
  MessageSquare,
  FileText,
  Users,
  Settings,
  HelpCircle,
  AlertTriangle,
  ArrowRightLeft,
  Search,
  Database,
  Calculator,
  ImageIcon,
  Layout,
  Home,
  Tags,
  BarChart3,
  Lightbulb,
  Beaker,
  Activity,
  Files,
  Puzzle,
  Server,
  Layers,
  Box
} from 'lucide-react';
import { ViewState, ChatSession, Group } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onNewChat: () => void;
  
  chats: ChatSession[];
  groups: Group[];
  selectedChatId: string | null;
  
  onSelectChat: (id: string) => void;
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: (name: string) => void;
  onRenameGroup: (id: string, name: string) => void;
  onDeleteGroup: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  onDeleteChat: (id: string) => void;
  onAddChatToGroup: (chatId: string, groupId: string) => void;
}

interface ModalState {
  isOpen: boolean;
  type: 'group' | 'chat';
  mode: 'create' | 'rename';
  title: string;
  value: string;
  targetId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    currentView, 
    onChangeView, 
    onNewChat,
    chats,
    groups,
    selectedChatId,
    onSelectChat,
    onSelectGroup,
    onCreateGroup,
    onRenameGroup,
    onDeleteGroup,
    onRenameChat,
    onDeleteChat,
    onAddChatToGroup
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeGroupMenu, setActiveGroupMenu] = useState<string | null>(null);
  const [activeChatMenu, setActiveChatMenu] = useState<string | null>(null);
  const [chatMenuStep, setChatMenuStep] = useState<'main' | 'groups'>('main');

  const isAgentCenterMode = currentView === ViewState.AGENT_CENTER || currentView === ViewState.AGENT_BUILDER;
  const isGenerationCenterMode = currentView === ViewState.GENERATION_CENTER;
  const isMemoryCenterMode = currentView === ViewState.MEMORY_CENTER;
  const isEvaluationCenterMode = currentView === ViewState.EVALUATION_CENTER;
  const isAssetMarketMode = currentView === ViewState.ASSET_MARKET;
  
  const isSpecialMode = isAgentCenterMode || isGenerationCenterMode || isMemoryCenterMode || isEvaluationCenterMode || isAssetMarketMode;

  const recentChats = chats.filter(chat => !chat.groupId);

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: 'group',
    mode: 'create',
    title: '',
    value: ''
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const [showCapabilityMenu, setShowCapabilityMenu] = useState(false);
  const [capabilityMenuPos, setCapabilityMenuPos] = useState({ top: 0, left: 0 });
  const capabilityButtonRef = useRef<HTMLButtonElement>(null);
  const capabilityTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const handleClickOutside = () => {
        setActiveGroupMenu(null);
        setActiveChatMenu(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (modalState.isOpen && inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [modalState.isOpen]);

  useEffect(() => {
      if (!activeChatMenu) setChatMenuStep('main');
  }, [activeChatMenu]);

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleModalSubmit = () => {
    const value = modalState.value.trim();
    if (!value) return;

    if (modalState.type === 'group') {
        if (modalState.mode === 'create') {
            onCreateGroup(value);
        } else if (modalState.mode === 'rename' && modalState.targetId) {
            onRenameGroup(modalState.targetId, value);
        }
    } else if (modalState.type === 'chat') {
        if (modalState.mode === 'rename' && modalState.targetId) {
            onRenameChat(modalState.targetId, value);
        }
    }
    closeModal();
  };

  const openCreateGroupModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalState({
        isOpen: true,
        type: 'group',
        mode: 'create',
        title: '新建分组',
        value: ''
    });
  };

  const openRenameGroupModal = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveGroupMenu(null);
    setModalState({
        isOpen: true,
        type: 'group',
        mode: 'rename',
        title: '重命名分组',
        value: currentName,
        targetId: id
    });
  };

  const handleDeleteGroup = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveGroupMenu(null);
    if (window.confirm("确定要删除此分组吗？")) {
        onDeleteGroup(id);
    }
  };

  const openRenameChatModal = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveChatMenu(null);
    setModalState({
        isOpen: true,
        type: 'chat',
        mode: 'rename',
        title: '重命名对话',
        value: currentTitle,
        targetId: id
    });
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveChatMenu(null);
    if (window.confirm("确定要删除此对话吗？")) {
        onDeleteChat(id);
    }
  };

  const handleAddChatToGroup = (chatId: string, groupId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveChatMenu(null);
      onAddChatToGroup(chatId, groupId);
  };

  const handleCapabilityEnter = () => {
    if (capabilityTimeoutRef.current) clearTimeout(capabilityTimeoutRef.current);
    if (capabilityButtonRef.current) {
        const rect = capabilityButtonRef.current.getBoundingClientRect();
        setCapabilityMenuPos({ top: rect.top - 310, left: rect.left - 10 });
    }
    setShowCapabilityMenu(true);
  };

  const handleCapabilityLeave = () => {
    capabilityTimeoutRef.current = setTimeout(() => {
        setShowCapabilityMenu(false);
    }, 150);
  };

  const capabilityItems = [
    { view: ViewState.AGENT_CENTER, label: '智能体中心', icon: Bot, color: 'text-sage-500' },
    { view: ViewState.MEMORY_CENTER, label: '记忆中心', icon: BrainCircuit, color: 'text-sage-500' },
    { view: ViewState.GENERATION_CENTER, label: '生成中心', icon: Zap, color: 'text-sage-500' },
    { view: ViewState.EVALUATION_CENTER, label: '评测中心', icon: TestTube, color: 'text-sage-500' },
    { view: ViewState.ASSET_MARKET, label: '资产市场', icon: Store, color: 'text-stone-400', divider: true },
    { view: ViewState.ALGORITHM_SERVICE, label: '算法服务', icon: Code2, color: 'text-stone-400' },
    { view: ViewState.LABORATORY, label: '实验室', icon: FlaskConical, color: 'text-stone-400' },
  ];

  const isCapabilityActive = capabilityItems.some(item => item.view === currentView);

  const renderCapabilityMenu = () => (
     <div className="bg-white shadow-warm-lg border border-stone-200 rounded-lg py-2 w-56 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="px-4 py-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-50 mb-1">
            能力矩阵
        </div>
        {capabilityItems.map((item) => (
            <React.Fragment key={item.view}>
                {item.divider && <div className="border-t border-stone-100 my-1"></div>}
                <div 
                    className={`px-4 py-2.5 hover:bg-stone-50 flex items-center gap-3 text-sm cursor-pointer transition-colors ${currentView === item.view ? 'bg-sage-50 text-sage-700 font-semibold' : 'text-stone-600'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onChangeView(item.view);
                        setShowCapabilityMenu(false);
                    }}
                >
                    <item.icon size={16} className={item.color}/> 
                    {item.label}
                </div>
            </React.Fragment>
        ))}
     </div>
  );

  const renderAgentCenterSidebar = () => (
    <div className="flex-1 flex flex-col pt-2">
        <div className="px-4 mb-6">
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-stone-100 cursor-pointer group transition-all-200 border border-transparent hover:border-stone-200 shadow-warm-xs">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-stone-200 flex items-center justify-center text-stone-600 shadow-inner">
                        <Users size={16} />
                    </div>
                    <span className="text-sm font-medium text-stone-900">崇启的空间</span>
                </div>
                <ArrowRightLeft size={14} className="text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>

        <div className="px-2 space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold text-stone-400 uppercase tracking-widest">研发管理</div>
            <button 
                onClick={() => onChangeView(ViewState.AGENT_CENTER)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all-200 font-medium ${isAgentCenterMode ? 'bg-sage-50 text-sage-700 shadow-warm-xs border border-sage-100' : 'text-stone-600 hover:bg-stone-100'}`}
            >
                <Bot size={18} className={isAgentCenterMode ? 'text-sage-600' : 'text-stone-400'} />
                智能体
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-stone-600 hover:bg-stone-100 transition-all-200">
                <MessageSquare size={18} className="text-stone-400" />
                提示词
            </button>
        </div>

        <div className="px-2 space-y-1 mt-6">
            <div className="px-3 py-2 text-[11px] font-semibold text-stone-400 uppercase tracking-widest">空间信息</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-stone-600 hover:bg-stone-100 transition-all-200">
                <Users size={18} className="text-stone-400" />
                空间成员
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-stone-600 hover:bg-stone-100 transition-all-200">
                <Settings size={18} className="text-stone-400" />
                空间配置
            </button>
        </div>
        
        <div className="flex-1"></div>

        <div className="px-2 space-y-1 pb-4">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-stone-500 hover:bg-stone-100 transition-all-200">
                <HelpCircle size={18} />
                帮助文档
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-stone-500 hover:bg-stone-100 transition-all-200">
                <AlertTriangle size={18} />
                需求缺陷
            </button>
        </div>
    </div>
  );

  const renderChatSidebar = () => (
    <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        <div className="px-4 mb-4">
          <button 
            onClick={onNewChat}
            className="w-full flex items-center space-x-3 px-4 py-2.5 bg-sage-500 text-white hover:bg-sage-600 rounded-md transition-all-200 shadow-sage-btn active-press"
          >
            <Plus size={18} />
            <span className="font-medium text-sm">新对话</span>
          </button>
        </div>

        <div className="px-2">
            <button 
                onClick={() => onChangeView(ViewState.KNOWLEDGE_BASE)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all-200 text-left ${currentView === ViewState.KNOWLEDGE_BASE ? 'bg-sage-50 text-sage-700 font-medium shadow-warm-xs' : 'text-stone-600 hover:bg-stone-100'}`}
            >
                <BookOpen size={18} className={currentView === ViewState.KNOWLEDGE_BASE ? 'text-sage-600' : 'text-stone-400'} />
                我的知识库
            </button>
        </div>

        <div className="px-2 mt-1">
            <button 
                onClick={() => onChangeView(ViewState.MY_CONTENT)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all-200 text-left ${currentView === ViewState.MY_CONTENT ? 'bg-sage-50 text-sage-700 font-medium shadow-warm-xs' : 'text-stone-600 hover:bg-stone-100'}`}
            >
                <LayoutGrid size={18} className={currentView === ViewState.MY_CONTENT ? 'text-sage-600' : 'text-stone-400'} />
                我的内容
            </button>
        </div>

        <div className="border-t border-stone-200 my-4 mx-4"></div>

        <div className="px-4">
           <div className="flex justify-between items-center mb-2 group">
            <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">分组</h3>
            <button onClick={openCreateGroupModal} className="text-stone-400 hover:text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity" title="新建分组">
                <Plus size={14} />
            </button>
           </div>
           <div className="space-y-0.5">
             {groups.map(group => (
                 <div 
                    key={group.id} 
                    onClick={() => onSelectGroup(group.id)}
                    className="relative group flex items-center justify-between text-sm text-stone-600 hover:bg-stone-100 px-2 py-1.5 rounded-md cursor-pointer transition-all-200"
                 >
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Folder size={14} className="text-stone-400 flex-shrink-0"/> 
                        <span className="truncate">{group.name}</span>
                    </div>
                    
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveGroupMenu(activeGroupMenu === group.id ? null : group.id);
                        }}
                        className={`text-stone-400 hover:text-stone-900 p-0.5 rounded ${activeGroupMenu === group.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                        <MoreHorizontal size={14} />
                    </button>

                    {activeGroupMenu === group.id && (
                        <div className="absolute right-0 top-8 w-32 bg-white border border-stone-200 rounded-md shadow-warm-lg z-50 overflow-hidden py-1 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                            <button 
                                onClick={(e) => openRenameGroupModal(group.id, group.name, e)}
                                className="px-3 py-2 text-left text-xs hover:bg-stone-50 flex items-center gap-2 text-stone-700"
                            >
                                <Pencil size={12}/> 重命名
                            </button>
                            <button 
                                onClick={(e) => handleDeleteGroup(group.id, e)}
                                className="px-3 py-2 text-left text-xs hover:bg-red-50 flex items-center gap-2 text-red-600"
                            >
                                <Trash2 size={12}/> 删除
                            </button>
                        </div>
                    )}
                 </div>
             ))}
           </div>
        </div>

        <div className="px-4 mt-6">
            <h3 className="text-[11px] font-bold text-stone-400 mb-2 uppercase tracking-widest">最近对话</h3>
            <div className="space-y-0.5 pb-4">
                {recentChats.map(chat => (
                    <div 
                        key={chat.id} 
                        onClick={() => onSelectChat(chat.id)}
                        className={`group relative flex items-center justify-between px-2 py-2 rounded-md cursor-pointer transition-all-200 ${selectedChatId === chat.id ? 'bg-stone-200 text-stone-900 font-medium shadow-warm-xs border border-stone-300/20' : 'text-stone-600 hover:bg-stone-100'}`}
                    >
                        <span className="text-sm truncate max-w-[140px]">{chat.title}</span>
                        
                        <button 
                             onClick={(e) => {
                                e.stopPropagation();
                                if (activeChatMenu === chat.id) {
                                    setActiveChatMenu(null);
                                } else {
                                    setActiveChatMenu(chat.id);
                                    setChatMenuStep('main');
                                }
                            }}
                            className={`text-stone-400 hover:text-stone-900 p-0.5 rounded ${activeChatMenu === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                            <MoreHorizontal size={14} />
                        </button>

                        {activeChatMenu === chat.id && (
                            <div className="absolute right-0 top-8 w-40 bg-white border border-stone-200 rounded-md shadow-warm-lg z-50 overflow-hidden py-1 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                                {chatMenuStep === 'main' ? (
                                    <>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setChatMenuStep('groups');
                                            }}
                                            className="px-3 py-2 text-left text-xs hover:bg-stone-50 flex items-center gap-2 text-stone-700 w-full"
                                        >
                                            <FolderPlus size={12}/> 添加到分组
                                        </button>
                                        <button 
                                            onClick={(e) => openRenameChatModal(chat.id, chat.title, e)}
                                            className="px-3 py-2 text-left text-xs hover:bg-stone-50 flex items-center gap-2 text-stone-700 w-full"
                                        >
                                            <Pencil size={12}/> 重命名
                                        </button>
                                        <button 
                                            onClick={(e) => handleDeleteChat(chat.id, e)}
                                            className="px-3 py-2 text-left text-xs hover:bg-red-50 flex items-center gap-2 text-red-600 w-full"
                                        >
                                            <Trash2 size={12}/> 删除
                                        </button>
                                    </>
                                ) : (
                                    <>
                                         <div className="px-3 py-1.5 text-[10px] text-stone-400 font-bold border-b border-stone-100 mb-1 flex justify-between items-center uppercase tracking-widest">
                                            选择分组
                                            <span onClick={(e) => {e.stopPropagation(); setChatMenuStep('main')}} className="cursor-pointer hover:text-stone-900 transition-colors">←</span>
                                         </div>
                                         <div className="max-h-32 overflow-y-auto custom-scrollbar">
                                            {groups.map(g => (
                                                <button
                                                    key={g.id}
                                                    onClick={(e) => handleAddChatToGroup(chat.id, g.id, e)}
                                                    className="px-3 py-2 text-left text-xs hover:bg-stone-50 flex items-center gap-2 text-stone-700 w-full truncate"
                                                >
                                                    <Folder size={12} className="text-stone-400"/> {g.name}
                                                </button>
                                            ))}
                                         </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  const handleLogoClick = () => {
    onChangeView(ViewState.HOME);
  };

  if (collapsed) {
    return (
      <div className="w-16 h-full bg-stone-50 border-r border-stone-200 flex flex-col items-center py-4 space-y-6 transition-all duration-300 z-50">
        <button onClick={() => setCollapsed(false)} className="p-2 hover:bg-stone-200 rounded-md text-stone-400 hover:text-stone-900 transition-all-200">
          <ChevronRight size={20} />
        </button>
        <button onClick={onNewChat} className="p-2 bg-sage-500 text-white rounded-md hover:bg-sage-600 shadow-sage-btn transition-all active-press" title="新对话">
          <MessageSquarePlus size={20} />
        </button>
        
        <div className="relative group flex justify-center w-full">
            <button className={`p-2 rounded-md transition-all-200 ${isCapabilityActive ? 'text-sage-600 bg-sage-50 border border-sage-100 shadow-warm-xs' : 'text-stone-400 hover:bg-stone-200'}`}>
               <MoreHorizontal size={20} />
            </button>
             <div className="hidden group-hover:block absolute left-full top-0 pl-2 z-50">
                 {renderCapabilityMenu()}
             </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="w-64 h-full bg-stone-50 border-r border-stone-200 flex flex-col transition-all duration-300 flex-shrink-0 font-sans z-50">
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={handleLogoClick}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${isSpecialMode ? 'bg-sage-50 text-sage-600 shadow-warm-xs border border-sage-100' : 'bg-sage-500 text-white shadow-warm-xs'}`}>
                {isAgentCenterMode ? <Bot size={16}/> 
                  : isGenerationCenterMode ? <Zap size={16}/> 
                  : isMemoryCenterMode ? <BrainCircuit size={16}/> 
                  : isEvaluationCenterMode ? <TestTube size={16}/>
                  : isAssetMarketMode ? <Store size={16}/>
                  : <Bot size={16}/>}
            </div>
            <span className="font-bold text-lg text-stone-900 tracking-tight">卧虎</span>
            {isSpecialMode && <ChevronRight size={14} className="text-stone-300" />}
            {isSpecialMode && <span className="text-xs font-semibold text-stone-500 shrink-0 tracking-tight">
                {isAgentCenterMode ? '智能体中心' 
                  : isGenerationCenterMode ? '生成中心' 
                  : isMemoryCenterMode ? '记忆中心'
                  : isEvaluationCenterMode ? '评测中心'
                  : '资产市场'}
            </span>}
        </div>
        <button onClick={() => setCollapsed(true)} className="p-1 hover:bg-stone-200 rounded text-stone-400 hover:text-stone-900 transition-all-200">
          <ChevronLeft size={18} />
        </button>
      </div>

      {isAgentCenterMode ? renderAgentCenterSidebar() 
        : isGenerationCenterMode ? (
            <div className="flex-1 flex flex-col pt-10 text-stone-400 items-center gap-4">
                 <Zap size={32} className="opacity-20" />
                 <span className="text-xs uppercase tracking-widest font-bold">生成中心</span>
            </div>
        ) : isMemoryCenterMode ? (
            <div className="flex-1 flex flex-col pt-10 text-stone-400 items-center gap-4">
                 <BrainCircuit size={32} className="opacity-20" />
                 <span className="text-xs uppercase tracking-widest font-bold">记忆中心</span>
            </div>
        ) : isEvaluationCenterMode ? (
            <div className="flex-1 flex flex-col pt-10 text-stone-400 items-center gap-4">
                 <TestTube size={32} className="opacity-20" />
                 <span className="text-xs uppercase tracking-widest font-bold">评测中心</span>
            </div>
        ) : isAssetMarketMode ? (
            <div className="flex-1 flex flex-col pt-10 text-stone-400 items-center gap-4">
                 <Store size={32} className="opacity-20" />
                 <span className="text-xs uppercase tracking-widest font-bold">资产市场</span>
            </div>
        ) : renderChatSidebar()}
      
      <div className="p-4 border-t border-stone-200">
        <div 
          onMouseEnter={handleCapabilityEnter}
          onMouseLeave={handleCapabilityLeave}
          className={`flex items-center gap-3 hover:bg-stone-100 p-2 rounded-md cursor-pointer transition-all-200 border border-transparent hover:border-stone-200 group ${isCapabilityActive || showCapabilityMenu ? 'bg-stone-100 border-stone-200' : ''}`}
        >
            <div className="w-8 h-8 rounded-full bg-stone-200 border border-stone-300 shadow-inner flex items-center justify-center overflow-hidden">
                <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix" alt="User" />
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="text-sm font-semibold text-stone-900 truncate">崇启</div>
            </div>
            <button 
              ref={capabilityButtonRef}
              className={`p-1 rounded hover:bg-stone-200 transition-all-200 ${showCapabilityMenu ? 'text-sage-600 bg-stone-200' : 'text-stone-400 group-hover:text-stone-900'}`}
            >
              <MoreHorizontal size={16} />
            </button>
        </div>
      </div>

      {modalState.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/20 backdrop-blur-[2px] animate-in fade-in duration-200" onClick={closeModal}>
            <div 
                className="bg-white rounded-md shadow-warm-lg w-80 p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200 border border-stone-200" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-sm font-bold text-stone-900">{modalState.title}</h3>
                    <button onClick={closeModal} className="text-stone-400 hover:text-stone-900 transition-colors">
                        <X size={16} />
                    </button>
                </div>
                
                <input 
                    ref={inputRef}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-sage-500 focus:border-sage-500 mb-6 text-stone-900 bg-stone-50 focus:bg-white transition-all shadow-inner"
                    value={modalState.value}
                    onChange={e => setModalState({...modalState, value: e.target.value})}
                    onKeyDown={e => e.key === 'Enter' && handleModalSubmit()}
                    placeholder="请输入名称..."
                />
                
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={closeModal} 
                        className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded-md transition-colors"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleModalSubmit} 
                        className="px-6 py-2 text-xs font-bold bg-sage-500 text-white rounded-md hover:bg-sage-600 shadow-sage-btn transition-all active-press"
                    >
                        确定
                    </button>
                </div>
            </div>
          </div>
      )}

      {showCapabilityMenu && createPortal(
          <div 
             className="fixed z-[9999] animate-in fade-in slide-in-from-bottom-2 duration-200"
             style={{ top: capabilityMenuPos.top, left: capabilityMenuPos.left }}
             onMouseEnter={() => {
                 if (capabilityTimeoutRef.current) clearTimeout(capabilityTimeoutRef.current);
             }}
             onMouseLeave={handleCapabilityLeave}
          >
              <div className="pl-4 pb-2">
                 {renderCapabilityMenu()}
              </div>
          </div>,
          document.body
      )}
    </div>
    </>
  );
};