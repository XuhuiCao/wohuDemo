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
  Image as ImageIcon,
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

  // Logic: AgentBuilder view also counts as AgentCenter context for sidebar
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
        setCapabilityMenuPos({ top: rect.top, left: rect.right });
    }
    setShowCapabilityMenu(true);
  };

  const handleCapabilityLeave = () => {
    capabilityTimeoutRef.current = setTimeout(() => {
        setShowCapabilityMenu(false);
    }, 150);
  };

  const capabilityItems = [
    { view: ViewState.AGENT_CENTER, label: '智能体中心', icon: Bot, color: 'text-blue-500' },
    { view: ViewState.MEMORY_CENTER, label: '记忆中心', icon: BrainCircuit, color: 'text-purple-500' },
    { view: ViewState.GENERATION_CENTER, label: '生成中心', icon: Zap, color: 'text-yellow-500' },
    { view: ViewState.EVALUATION_CENTER, label: '评测中心', icon: TestTube, color: 'text-red-500' },
    { view: ViewState.ASSET_MARKET, label: '资产市场', icon: Store, color: 'text-gray-400', divider: true },
    { view: ViewState.ALGORITHM_SERVICE, label: '算法服务', icon: Code2, color: 'text-gray-400' },
    { view: ViewState.LABORATORY, label: '实验室', icon: FlaskConical, color: 'text-gray-400' },
  ];

  const isCapabilityActive = capabilityItems.some(item => item.view === currentView);

  const renderCapabilityMenu = () => (
     <div className="bg-white shadow-xl border border-gray-100 rounded-lg py-2 w-56">
        {capabilityItems.map((item) => (
            <React.Fragment key={item.view}>
                {item.divider && <div className="border-t border-gray-100 my-1"></div>}
                <div 
                    className={`px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm cursor-pointer transition-colors ${currentView === item.view ? 'bg-blue-50/50 text-blue-700' : 'text-gray-700'}`}
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
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer group transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                        <Users size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">崇启的空间</span>
                </div>
                <ArrowRightLeft size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>

        <div className="px-2 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">研发管理</div>
            <button 
                onClick={() => onChangeView(ViewState.AGENT_CENTER)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors font-medium ${isAgentCenterMode ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <Bot size={18} className={isAgentCenterMode ? 'text-gray-800' : 'text-gray-500'} />
                智能体
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                <MessageSquare size={18} className="text-gray-500" />
                提示词
            </button>
        </div>

        <div className="px-2 space-y-1 mt-6">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">空间信息</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Users size={18} className="text-gray-500" />
                空间成员
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Settings size={18} className="text-gray-500" />
                空间配置
            </button>
        </div>
        
        <div className="flex-1"></div>

        <div className="px-2 space-y-1 pb-4">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <HelpCircle size={18} className="text-gray-500" />
                帮助文档
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <AlertTriangle size={18} className="text-gray-500" />
                需求缺陷
            </button>
        </div>
    </div>
  );

  const renderGenerationCenterSidebar = () => (
    <div className="flex-1 flex flex-col pt-2 overflow-y-auto custom-scrollbar">
        <div className="px-4 mb-6">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer group transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                        <Users size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">崇启的空间</span>
                </div>
                <ArrowRightLeft size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>

        <div className="px-2 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-gray-200 text-gray-900 font-medium">
                <Home size={18} className="text-gray-800" />
                首页
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Layout size={18} className="text-gray-500" />
                UI 资产
            </button>
        </div>

        <div className="px-2 mt-6">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">提示词</div>
            <div className="px-3 mb-2">
                <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className="w-full pl-8 pr-2 py-1.5 bg-gray-100 border-none rounded-lg text-xs focus:ring-1 focus:ring-gray-300 outline-none" placeholder="搜索项目" />
                </div>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                {['01', '02', '03', '04', '05'].map(num => (
                    <button key={num} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 truncate text-left">
                        <MessageSquare size={16} className="text-gray-400 shrink-0" />
                        <span className="truncate">提示词名称 {num}</span>
                    </button>
                ))}
            </div>
        </div>

        <div className="px-2 space-y-1 mt-6">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">辅助材料</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Database size={18} className="text-gray-500" />
                数据集
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Calculator size={18} className="text-gray-500" />
                评估器
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <ImageIcon size={18} className="text-gray-500" />
                素材管理
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <FileText size={18} className="text-gray-500" />
                提示词模板
            </button>
        </div>

        <div className="px-2 space-y-1 mt-6">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">空间信息</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Users size={18} className="text-gray-500" />
                空间成员
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Settings size={18} className="text-gray-500" />
                空间配置
            </button>
        </div>
        
        <div className="flex-1 mt-10"></div>

        <div className="px-2 space-y-1 pb-4">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <HelpCircle size={18} className="text-gray-500" />
                帮助文档
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <AlertTriangle size={18} className="text-gray-500" />
                需求缺陷
            </button>
        </div>
    </div>
  );

  const renderMemoryCenterSidebar = () => (
    <div className="flex-1 flex flex-col pt-2 overflow-y-auto custom-scrollbar">
        <div className="px-4 mb-6">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer group transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                        <Users size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">崇启的空间</span>
                </div>
                <ArrowRightLeft size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>

        <div className="px-2 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-gray-200 text-gray-900 font-medium">
                <Home size={18} className="text-gray-800" />
                首页
            </button>
        </div>

        <div className="px-2 space-y-1 mt-6">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">知识管理</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <BookOpen size={18} className="text-gray-500" />
                知识库
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Tags size={18} className="text-gray-500" />
                标签
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <BarChart3 size={18} className="text-gray-500" />
                数据报表
            </button>
        </div>

        <div className="px-2 space-y-1 mt-6">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">空间信息</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Users size={18} className="text-gray-500" />
                空间成员
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Settings size={18} className="text-gray-500" />
                空间配置
            </button>
        </div>
        
        <div className="flex-1 mt-20"></div>

        <div className="px-2 space-y-1 pb-4">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <HelpCircle size={18} className="text-gray-500" />
                帮助文档
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <AlertTriangle size={18} className="text-gray-500" />
                需求缺陷
            </button>
        </div>
    </div>
  );

  const renderEvaluationCenterSidebar = () => (
    <div className="flex-1 flex flex-col pt-2 overflow-y-auto custom-scrollbar">
        <div className="px-4 mb-6">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer group transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                        <Users size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">崇启的空间</span>
                </div>
                <ArrowRightLeft size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>

        <div className="px-2 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-gray-200 text-gray-900 font-medium">
                <Home size={18} className="text-gray-800" />
                首页
            </button>
        </div>

        <div className="px-2 space-y-1 mt-6">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">评测</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Files size={18} className="text-gray-500" />
                评测集
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Lightbulb size={18} className="text-gray-500" />
                评估器
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Beaker size={18} className="text-gray-500" />
                评测实验
            </button>
        </div>

        <div className="px-2 space-y-1 mt-6">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">观测</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Activity size={18} className="text-gray-500" />
                Trace
            </button>
        </div>

        <div className="px-2 space-y-1 mt-6">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">空间信息</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Users size={18} className="text-gray-500" />
                空间成员
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Settings size={18} className="text-gray-500" />
                空间配置
            </button>
        </div>
        
        <div className="flex-1 mt-10"></div>

        <div className="px-2 space-y-1 pb-4">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <HelpCircle size={18} className="text-gray-500" />
                帮助文档
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <AlertTriangle size={18} className="text-gray-500" />
                需求缺陷
            </button>
        </div>
    </div>
  );

  const renderAssetMarketSidebar = () => (
    <div className="flex-1 flex flex-col pt-2 overflow-y-auto custom-scrollbar">
        <div className="px-2 space-y-1 mt-4">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Layers size={18} className="text-gray-500" />
                智能体市场
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-gray-200 text-gray-900 font-medium">
                <Puzzle size={18} className="text-gray-800" />
                Skill 市场
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Server size={18} className="text-gray-500" />
                MCP 市场
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Lightbulb size={18} className="text-gray-500" />
                评估器市场
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Database size={18} className="text-gray-500" />
                数据集市场
            </button>
        </div>
        
        <div className="flex-1 mt-20"></div>

        <div className="px-2 space-y-1 pb-4">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <HelpCircle size={18} className="text-gray-500" />
                帮助文档
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <AlertTriangle size={18} className="text-gray-500" />
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
            className="w-full flex items-center space-x-3 px-4 py-2.5 bg-[#55635C] text-white hover:bg-[#444F49] rounded-lg transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="font-medium text-sm">新对话</span>
          </button>
        </div>

        <div className="px-2">
            <button 
                onClick={() => onChangeView(ViewState.KNOWLEDGE_BASE)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${currentView === ViewState.KNOWLEDGE_BASE ? 'bg-gray-200 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <BookOpen size={18} className={currentView === ViewState.KNOWLEDGE_BASE ? 'text-gray-800' : 'text-gray-500'} />
                我的知识库
            </button>
        </div>

        <div className="px-2 mt-1">
            <button 
                onClick={() => onChangeView(ViewState.MY_CONTENT)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${currentView === ViewState.MY_CONTENT ? 'bg-gray-200 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <LayoutGrid size={18} className={currentView === ViewState.MY_CONTENT ? 'text-gray-800' : 'text-gray-500'} />
                我的内容
            </button>
        </div>

        <div className="px-4 mt-4">
             <button 
                ref={capabilityButtonRef}
                onMouseEnter={handleCapabilityEnter}
                onMouseLeave={handleCapabilityLeave}
                className={`w-full flex items-center justify-between py-2 rounded-lg -mx-2 px-2 transition-colors ${isCapabilityActive || showCapabilityMenu ? 'bg-white text-blue-600 border border-blue-100 shadow-sm' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
             >
                <div className="flex items-center gap-3">
                    <MoreHorizontal size={16} className={isCapabilityActive || showCapabilityMenu ? 'text-blue-500' : 'text-gray-500'}/>
                    <span className="text-sm font-medium">更多能力</span>
                </div>
                <ChevronRight size={14} className={isCapabilityActive || showCapabilityMenu ? 'text-blue-400' : 'text-gray-400'}/>
             </button>
        </div>

        <div className="border-t border-gray-200 my-4 mx-4"></div>

        <div className="px-4">
           <div className="flex justify-between items-center mb-2 group">
            <h3 className="text-xs font-semibold text-gray-400">分组</h3>
            <button onClick={openCreateGroupModal} className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" title="新建分组">
                <Plus size={14} />
            </button>
           </div>
           <div className="space-y-1">
             {groups.map(group => (
                 <div 
                    key={group.id} 
                    onClick={() => onSelectGroup(group.id)}
                    className="relative group flex items-center justify-between text-sm text-gray-600 hover:bg-gray-100 px-2 py-1.5 rounded cursor-pointer transition-colors"
                 >
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Folder size={14} className="text-gray-400 flex-shrink-0"/> 
                        <span className="truncate">{group.name}</span>
                    </div>
                    
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveGroupMenu(activeGroupMenu === group.id ? null : group.id);
                        }}
                        className={`text-gray-400 hover:text-gray-600 p-0.5 rounded ${activeGroupMenu === group.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                        <MoreHorizontal size={14} />
                    </button>

                    {activeGroupMenu === group.id && (
                        <div className="absolute right-0 top-8 w-24 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden py-1 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                            <button 
                                onClick={(e) => openRenameGroupModal(group.id, group.name, e)}
                                className="px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-700"
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
             {groups.length === 0 && (
                <div className="text-xs text-gray-400 italic px-2">暂无分组</div>
             )}
           </div>
        </div>

        <div className="px-4 mt-6">
            <h3 className="text-xs font-semibold text-gray-400 mb-2">最近对话</h3>
            <div className="space-y-1 pb-4">
                {recentChats.map(chat => (
                    <div 
                        key={chat.id} 
                        onClick={() => onSelectChat(chat.id)}
                        className={`group relative flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer transition-colors ${selectedChatId === chat.id ? 'bg-gray-200 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
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
                            className={`text-gray-400 hover:text-gray-600 p-0.5 rounded ${activeChatMenu === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                            <MoreHorizontal size={14} className="" />
                        </button>

                        {activeChatMenu === chat.id && (
                            <div className="absolute right-0 top-8 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden py-1 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                                {chatMenuStep === 'main' ? (
                                    <>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setChatMenuStep('groups');
                                            }}
                                            className="px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-700 w-full"
                                        >
                                            <FolderPlus size={12}/> 添加到分组
                                        </button>
                                        <button 
                                            onClick={(e) => openRenameChatModal(chat.id, chat.title, e)}
                                            className="px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-700 w-full"
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
                                         <div className="px-3 py-1.5 text-[10px] text-gray-400 font-semibold border-b border-gray-100 mb-1 flex justify-between items-center">
                                            选择分组
                                            <span onClick={(e) => {e.stopPropagation(); setChatMenuStep('main')}} className="cursor-pointer hover:text-gray-600">←</span>
                                         </div>
                                         <div className="max-h-32 overflow-y-auto custom-scrollbar">
                                            {groups.length > 0 ? groups.map(g => (
                                                <button
                                                    key={g.id}
                                                    onClick={(e) => handleAddChatToGroup(chat.id, g.id, e)}
                                                    className="px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-700 w-full truncate"
                                                >
                                                    <Folder size={12} className="text-gray-400"/> {g.name}
                                                </button>
                                            )) : (
                                                <div className="px-3 py-2 text-xs text-gray-400 text-center">无可用分组</div>
                                            )}
                                         </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {recentChats.length === 0 && (
                     <div className="text-xs text-gray-400 italic px-2">暂无最近对话</div>
                )}
            </div>
        </div>
    </div>
  );

  const handleLogoClick = () => {
    onChangeView(ViewState.HOME);
  };

  if (collapsed) {
    return (
      <div className="w-16 h-full bg-[#FAFAFA] border-r border-gray-200 flex flex-col items-center py-4 space-y-6 transition-all duration-300 z-50">
        <button onClick={() => setCollapsed(false)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500">
          <ChevronRight size={20} />
        </button>
        <button onClick={onNewChat} className="p-2 bg-[#55635C] text-white rounded-lg hover:bg-[#444F49]" title="新对话">
          <MessageSquarePlus size={20} />
        </button>
        
        <div className="relative group flex justify-center w-full">
            <button className={`p-2 hover:bg-gray-200 rounded-lg ${isCapabilityActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}>
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
    <div className="w-64 h-full bg-[#FAFAFA] border-r border-gray-200 flex flex-col transition-all duration-300 flex-shrink-0 font-sans z-50">
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={handleLogoClick}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${isSpecialMode ? 'bg-gray-100 text-gray-600' : 'bg-black text-white'}`}>
                {isAgentCenterMode ? <Bot size={16}/> 
                  : isGenerationCenterMode ? <Zap size={16}/> 
                  : isMemoryCenterMode ? <BrainCircuit size={16}/> 
                  : isEvaluationCenterMode ? <TestTube size={16}/>
                  : isAssetMarketMode ? <Store size={16}/>
                  : <Bot size={16}/>}
            </div>
            <span className="font-bold text-lg text-gray-800 tracking-tight">卧虎</span>
            {!isSpecialMode && <span className="text-[10px] bg-[#FFF3E0] text-[#FF9800] px-1.5 py-0.5 rounded font-bold">NEW</span>}
            {isSpecialMode && <ChevronRight size={14} className="text-gray-400" />}
            {isSpecialMode && <span className="text-sm font-medium text-gray-600 shrink-0">
                {isAgentCenterMode ? '智能体中心' 
                  : isGenerationCenterMode ? '生成中心' 
                  : isMemoryCenterMode ? '记忆中心'
                  : isEvaluationCenterMode ? '评测中心'
                  : '资产市场'}
            </span>}
        </div>
        <button onClick={() => setCollapsed(true)} className="p-1 hover:bg-gray-200 rounded text-gray-400">
          <ChevronLeft size={18} />
        </button>
      </div>

      {isAgentCenterMode ? renderAgentCenterSidebar() 
        : isGenerationCenterMode ? renderGenerationCenterSidebar() 
        : isMemoryCenterMode ? renderMemoryCenterSidebar()
        : isEvaluationCenterMode ? renderEvaluationCenterSidebar()
        : isAssetMarketMode ? renderAssetMarketSidebar()
        : renderChatSidebar()}
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-lg cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-[url('https://api.dicebear.com/9.x/avataaars/svg?seed=Felix')] bg-cover border border-gray-200"></div>
            <div className="flex-1 overflow-hidden">
                <div className="text-sm font-medium text-gray-700">崇启</div>
            </div>
            <MoreHorizontal size={16} className="text-gray-400"/>
        </div>
      </div>

      {modalState.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200" onClick={closeModal}>
            <div 
                className="bg-white rounded-xl shadow-2xl w-80 p-5 transform transition-all scale-100 animate-in zoom-in-95 duration-200" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-800">{modalState.title}</h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                        <X size={16} />
                    </button>
                </div>
                
                <input 
                    ref={inputRef}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#55635C] focus:border-transparent mb-5 text-gray-700 bg-gray-50 focus:bg-white transition-all"
                    value={modalState.value}
                    onChange={e => setModalState({...modalState, value: e.target.value})}
                    onKeyDown={e => e.key === 'Enter' && handleModalSubmit()}
                    placeholder="请输入名称..."
                />
                
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={closeModal} 
                        className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleModalSubmit} 
                        className="px-4 py-2 text-xs font-medium bg-[#55635C] text-white rounded-lg hover:bg-[#444F49] shadow-sm transition-all"
                    >
                        确定
                    </button>
                </div>
            </div>
          </div>
      )}

      {showCapabilityMenu && createPortal(
          <div 
             className="fixed z-[9999] animate-in fade-in slide-in-from-left-2 duration-200"
             style={{ top: capabilityMenuPos.top, left: capabilityMenuPos.left }}
             onMouseEnter={() => {
                 if (capabilityTimeoutRef.current) clearTimeout(capabilityTimeoutRef.current);
             }}
             onMouseLeave={handleCapabilityLeave}
          >
              <div className="pl-2">
                 {renderCapabilityMenu()}
              </div>
          </div>,
          document.body
      )}
    </div>
    </>
  );
};