
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Bot, 
  MoreHorizontal, 
  ChevronRight, 
  ChevronLeft, 
  Box, 
  Clock, 
  BarChart3, 
  MessageSquare, 
  History, 
  Settings2, 
  Play, 
  Edit3, 
  ExternalLink,
  ShieldCheck,
  Cpu,
  Globe,
  Database,
  ArrowUpRight,
  Filter,
  RefreshCcw,
  CheckCircle2,
  MessageCircle,
  Puzzle,
  Server,
  BookOpen,
  X,
  FileText,
  User,
  GitBranch,
  Smartphone,
  Terminal,
  Copy,
  Layers,
  FlaskConical,
  Activity,
  AlertCircle,
  Code,
  ArrowUp,
  HelpCircle,
  Tag,
  Undo2,
  FileCode,
  ChevronDown,
  Upload,
  ArrowRight,
  Zap,
  LayoutGrid
} from 'lucide-react';
import { MOCK_AGENTS, OFFICIAL_SKILLS, OFFICIAL_MCPS, MOCK_DOCS } from '../constants';
import { Agent, Message, ViewState } from '../types';
import { createPortal } from 'react-dom';
import { InputArea } from './InputArea';

interface AgentCenterProps {
  onBack: () => void;
  initialAgent?: Agent | null;
  onEditAgent?: (agent: Agent) => void;
  onQuickBuild?: (prompt: string) => void;
  onProCodeBuild?: (enName: string, cnName: string) => void;
}

const getStatusConfig = (status: string) => {
    switch(status) {
        case 'published': return { label: '已发布', className: 'bg-sage-50 text-sage-600 border-sage-200' };
        case 'publishing': return { label: '发布中', className: 'bg-blue-50 text-blue-600 border-blue-200' };
        case 'draft': return { label: '草稿', className: 'bg-stone-50 text-stone-500 border-stone-200' };
        default: return { label: '未知', className: 'bg-gray-50 text-gray-500 border-gray-200' };
    }
}

const TypeBadge = ({ type }: { type: 'quick' | 'code' }) => (
  <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold inline-flex items-center leading-none ${type === 'code' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-sage-50 text-sage-600 border-sage-100'}`}>
    {type === 'code' ? '编码模式' : '快速模式'}
  </span>
);

const MOCK_LOGS = Array.from({ length: 15 }).map((_, i) => ({
    id: `75421${1000 + i}`,
    sessionId: `75421${5000 + i}`,
    userId: '366672',
    input: i % 3 === 0 ? '帮我写一个 Python 脚本...' : '系统需求分析报告...',
    output: i % 3 === 0 ? '好的，这是一个基于...' : '流程图如下所示...',
    inputTokens: '5,236',
    outputTokens: '236',
    startTime: '2025-08-24 21:45:14',
    latency: '1965 ms',
    endTime: '2025-08-24 21:45:14',
    duration: '27818 ms',
    status: i === 4 ? 'failed' : 'success'
}));

const MOCK_SESSION_MESSAGES: Message[] = [
    { id: '1', role: 'user', content: '我想查询一下最近三个月关于办公桌的订单记录，特别是那些金额超过 5000 元的。', timestamp: Date.now() - 1000000 },
    { id: '2', role: 'model', content: '好的，正在为您查询最近三个月金额超过 5000 元的办公桌订单记录...\n\n查询结果如下：\n1. 订单号 OD-20241215-01，金额 12,500 元，状态：已完成。\n2. 订单号 OD-20250105-08，金额 6,800 元，状态：已发货。\n\n需要查看具体详情吗？', timestamp: Date.now() - 950000 },
    { id: '3', role: 'user', content: '查看第一个订单的物流信息。', timestamp: Date.now() - 900000 },
    { id: '4', role: 'model', content: '订单 OD-20241215-01 的物流信息如下：\n- 12月16日：仓库已出库\n- 12月17日：由上海分拨中心发出\n- 12月18日：已到达北京配送中心\n- 12月19日：买家已签收', timestamp: Date.now() - 850000 },
];

export const AgentCenter: React.FC<AgentCenterProps> = ({ onBack, initialAgent, onEditAgent, onQuickBuild, onProCodeBuild }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyMyCreated, setOnlyMyCreated] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(initialAgent || null);
  const [activeDetailTab, setActiveDetailTab] = useState('概览');
  
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const createButtonRef = useRef<HTMLDivElement>(null);
  
  const [showQuickBuildModal, setShowQuickBuildModal] = useState(false);
  const [showProCodeModal, setShowProCodeModal] = useState(false);
  const [quickBuildPrompt, setQuickBuildPrompt] = useState('');
  const [proCodeEnName, setProCodeEnName] = useState('');
  const [proCodeCnName, setProCodeCnName] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'test'>('test');
  const [selectedSessionTitle, setSelectedSessionTitle] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [consumptionTab, setConsumptionTab] = useState<'method' | 'basic'>('method');
  
  const [showDingTalkModal, setShowDingTalkModal] = useState(false);
  const [showAntCodeModal, setShowAntCodeModal] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [debugChannel, setDebugChannel] = useState<'DingTalk' | 'AntCode' | null>(null);

  const [previewMessages, setPreviewMessages] = useState<Message[]>([]);

  const filteredAgents = MOCK_AGENTS.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = Array.from({ length: 45 }).map((_, i) => Math.floor(Math.random() * 40) + 10);
  const mockSessions = [
    { id: 's1', title: '办公桌订单查询', time: '刚刚', status: 'completed' },
    { id: 's2', title: '更换桌椅申请', time: '12分钟前', status: 'completed' },
    { id: 's3', title: '家具采购咨询', time: '2小时前', status: 'processing' },
    { id: 's4', title: '供应商入驻流程', time: '18分钟前', status: 'failed' },
    { id: 's5', title: '显示器支架选购', time: '2小时前', status: 'failed' },
  ];

  const handleOpenTest = () => {
    setActiveDetailTab('试运行');
  };

  const handleViewSession = (session: any) => {
    setDrawerMode('view');
    setSelectedSessionTitle(session.title);
    setDrawerOpen(true);
  };

  const handlePreviewSend = (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() };
    setPreviewMessages(prev => [...prev, userMsg]);
    setTimeout(() => {
        const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: `这是智能体的回复：${text}`, timestamp: Date.now() };
        setPreviewMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  const handleQuickBuildSubmit = () => {
      if (!quickBuildPrompt.trim()) return;
      if (onQuickBuild) onQuickBuild(quickBuildPrompt);
      setShowQuickBuildModal(false);
      setQuickBuildPrompt('');
  };

  const handleProCodeSubmit = () => {
      if (!proCodeCnName.trim() || !proCodeEnName.trim()) return;
      if (onProCodeBuild) onProCodeBuild(proCodeEnName, proCodeCnName);
      setShowProCodeModal(false);
      setProCodeEnName('');
      setProCodeCnName('');
  };

  const renderTabContent = () => {
    switch (activeDetailTab) {
        case '概览':
            return (
                <div className="flex-1 flex overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                        <div className="max-w-5xl mx-auto space-y-8">
                            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-warm-xs">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded bg-sage-500 flex items-center justify-center">
                                            <ArrowUpRight size={12} className="text-white"/>
                                        </div>
                                        <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2 tracking-tight">
                                          {selectedAgent?.name}
                                          <TypeBadge type={selectedAgent?.type || 'quick'} />
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 bg-stone-50 px-2.5 py-1 rounded uppercase tracking-widest border border-stone-100">
                                        <span>最近 90 天</span>
                                        <ChevronDown size={10} />
                                    </div>
                                </div>
                                <div className="mb-8">
                                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">总会话数</div>
                                    <div className="text-4xl font-bold text-stone-900 tracking-tighter">12,405</div>
                                    <div className="text-sage-600 text-xs font-medium mt-1">今日新增 213 个会话</div>
                                </div>
                                <div className="h-40 flex items-end gap-1.5 px-2">
                                    {chartData.map((val, i) => (
                                        <div key={i} className="flex-1 rounded-t bg-sage-500/80 hover:bg-sage-600 transition-all-200 cursor-pointer" style={{ height: `${val}%` }}></div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-[10px] text-stone-300 mt-2 px-1 uppercase font-bold tracking-widest">
                                    <span>7月 13日</span>
                                    <span>10月 13日</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-stone-200 shadow-warm-xs overflow-hidden">
                                <div className="px-6 py-4 border-b border-stone-50 flex items-center justify-between bg-stone-50/30">
                                    <div className="flex gap-4">
                                        <button className="text-xs font-bold text-stone-900 border-b-2 border-sage-600 pb-3 -mb-[17px] uppercase tracking-widest">全部会话</button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Filter size={14} className="text-stone-400" />
                                        <Search size={14} className="text-stone-400" />
                                    </div>
                                </div>
                                <div className="divide-y divide-stone-50">
                                    {mockSessions.map(session => (
                                        <div key={session.id} className="px-6 py-4 flex items-center justify-between hover:bg-stone-50 cursor-pointer group transition-all-200" onClick={() => handleViewSession(session)}>
                                            <div className="flex items-center gap-4">
                                                {session.status === 'completed' && <CheckCircle2 size={18} className="text-sage-300" />}
                                                {session.status === 'processing' && <RefreshCcw size={18} className="text-sage-400 animate-spin" />}
                                                {session.status === 'failed' && <Clock size={18} className="text-red-200" />}
                                                <span className="text-sm font-medium text-stone-700 group-hover:text-sage-700 transition-colors">{session.title}</span>
                                            </div>
                                            <span className="text-xs text-stone-400 font-medium">{session.time}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-6 py-4 bg-stone-50/50 flex justify-center">
                                    <button 
                                        onClick={() => setActiveDetailTab('日志')}
                                        className="text-[11px] font-bold text-stone-400 hover:text-stone-900 uppercase tracking-widest transition-colors"
                                    >
                                        查看全部会话记录
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-[400px] border-l border-stone-200 bg-white overflow-y-auto custom-scrollbar flex flex-col shrink-0 shadow-warm-xs z-10">
                        <div className="p-6 space-y-8">
                            <div className="bg-stone-50/50 rounded-2xl border border-stone-200 p-6 relative overflow-hidden shadow-warm-xs">
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-warm-xs border border-stone-100 flex items-center justify-center text-sage-600 mb-4">
                                        <Bot size={24} />
                                    </div>
                                    <h2 className="text-xl font-bold text-stone-900 mb-2 flex items-center gap-2 tracking-tight">
                                      {selectedAgent?.name} Agent
                                      <TypeBadge type={selectedAgent?.type || 'quick'} />
                                    </h2>
                                    <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                                        {selectedAgent?.description}
                                    </p>
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-stone-200 shadow-sm overflow-hidden">
                                                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${i * 123}`} className="w-full h-full" alt="avatar"/>
                                                </div>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={handleOpenTest}
                                            className="px-4 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-50 shadow-warm-xs flex items-center gap-1.5 transition-all hover-lift active-press"
                                        >
                                            <Play size={12} fill="currentColor" className="text-sage-500"/> 试运行
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-sage-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            </div>

                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">提示词 (Instructions)</h4>
                                </div>
                                <div className="bg-stone-50/30 rounded-xl border border-stone-100 p-4 text-xs text-stone-600 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar italic shadow-inner">
                                    # 角色设定<br/>
                                    你是一个专业的智能助手，致力于提供高质量的问题解答服务。你的语气应该是专业且友好的。<br/><br/>
                                    # 核心目标<br/>
                                    1. 快速识别用户意图<br/>
                                    2. 利用知识库提供精准回答
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">集成技能 (Skills)</h4>
                                    <span className="text-[10px] text-stone-300 font-bold">2 项</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between group cursor-pointer hover:bg-stone-50 p-2 rounded-lg transition-all-200 border border-transparent hover:border-stone-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100 shadow-warm-xs">
                                                <Globe size={14}/>
                                            </div>
                                            <span className="text-sm text-stone-700 font-medium">联网搜索服务</span>
                                        </div>
                                        <span className="text-[10px] bg-sage-50 text-sage-600 px-1.5 py-0.5 rounded border border-sage-100 font-bold">已启用</span>
                                    </div>
                                    <div className="flex items-center justify-between group cursor-pointer hover:bg-stone-50 p-2 rounded-lg transition-all-200 border border-transparent hover:border-stone-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 border border-orange-100 shadow-warm-xs">
                                                <Zap size={14}/>
                                            </div>
                                            <span className="text-sm text-stone-700 font-medium">工作流集成</span>
                                        </div>
                                        <span className="text-[10px] bg-stone-50 text-stone-400 px-1.5 py-0.5 rounded border border-stone-100 font-bold">只读</span>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">MCP 工具</h4>
                                    <span className="text-[10px] text-stone-300 font-bold">1 项</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between group cursor-pointer hover:bg-stone-50 p-2 rounded-lg transition-all-200 border border-transparent hover:border-stone-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 border-purple-100 shadow-warm-xs">
                                                <Server size={14}/>
                                            </div>
                                            <span className="text-sm text-stone-700 font-medium">GitHub MCP</span>
                                        </div>
                                        <span className="text-[10px] bg-sage-50 text-sage-600 px-1.5 py-0.5 rounded border border-sage-100 font-bold">已启用</span>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">关联知识 (Knowledge)</h4>
                                    <span className="text-[10px] text-stone-300 font-bold">2 项</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between group cursor-pointer hover:bg-stone-50 p-2 rounded-lg transition-all-200 border border-transparent hover:border-stone-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-stone-50 rounded-lg flex items-center justify-center text-stone-500 border border-stone-200 shadow-warm-xs">
                                                <BookOpen size={14}/>
                                            </div>
                                            <span className="text-sm text-stone-700 font-medium">产品文档库 v2</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between group cursor-pointer hover:bg-stone-50 p-2 rounded-lg transition-all-200 border border-transparent hover:border-stone-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-stone-50 rounded-lg flex items-center justify-center text-stone-500 border border-stone-200 shadow-warm-xs">
                                                <FileText size={14}/>
                                            </div>
                                            <span className="text-sm text-stone-700 font-medium">QA 对话集</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Session Detail Drawer */}
                    {drawerOpen && drawerMode === 'view' && (
                        <div className="absolute inset-0 z-[100] flex justify-end bg-stone-900/20 backdrop-blur-[2px] animate-in fade-in duration-300">
                            <div className="w-[600px] h-full bg-white shadow-warm-lg flex flex-col animate-in slide-in-from-right duration-300 border-l border-stone-200">
                                <div className="h-14 border-b border-stone-100 flex items-center justify-between px-6 bg-white shrink-0">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setDrawerOpen(false)} className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-900 transition-colors">
                                            <ChevronLeft size={20} />
                                        </button>
                                        <h3 className="text-sm font-bold text-stone-900 truncate max-w-[400px]">{selectedSessionTitle}</h3>
                                    </div>
                                    <button onClick={() => setDrawerOpen(false)} className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-900 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/50 custom-scrollbar">
                                    {MOCK_SESSION_MESSAGES.map((msg) => (
                                        <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.role === 'model' && (
                                                <div className="w-8 h-8 rounded bg-sage-600 flex items-center justify-center text-white shrink-0 shadow-warm-xs">
                                                    <Bot size={16}/>
                                                </div>
                                            )}
                                            <div className={`p-4 rounded-xl text-sm leading-relaxed shadow-warm-xs max-w-[85%] ${msg.role === 'user' ? 'bg-sage-500 text-white rounded-tr-none' : 'bg-white border border-stone-200 text-stone-700 rounded-tl-none'}`}>
                                                {msg.content}
                                            </div>
                                            {msg.role === 'user' && (
                                                <div className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center text-stone-400 shrink-0 border border-stone-200">
                                                    <User size={16}/>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t border-stone-100 bg-white text-center">
                                    <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">只读会话记录 · 卧虎平台</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        case '试运行':
            return (
                <div className="flex-1 flex flex-col bg-stone-50/50 relative overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="flex gap-4 animate-in fade-in duration-300">
                                <div className="w-8 h-8 rounded-full bg-sage-600 flex items-center justify-center text-white shrink-0 shadow-warm-xs">
                                    <Bot size={16}/>
                                </div>
                                <div className="bg-white p-4 rounded-xl rounded-tl-none border border-stone-200 text-sm text-stone-700 shadow-warm-xs leading-relaxed max-w-[85%]">
                                    您好！我是 {selectedAgent?.name} 智能体。您可以随时开始一段对话来测试我的表现。
                                </div>
                            </div>
                            {previewMessages.map(msg => (
                                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    {msg.role === 'model' && (
                                        <div className="w-8 h-8 rounded-full bg-sage-600 flex items-center justify-center text-white shrink-0 shadow-warm-xs">
                                            <Bot size={16}/>
                                        </div>
                                    )}
                                    <div className={`p-4 rounded-xl text-sm leading-relaxed shadow-warm-xs max-w-[85%] ${msg.role === 'user' ? 'bg-sage-500 text-white rounded-tr-none shadow-sage-btn' : 'bg-white border border-stone-200 text-stone-700 rounded-tl-none'}`}>
                                        {msg.content}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 shrink-0 border border-stone-200 shadow-inner">
                                            <User size={16}/>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 bg-white border-t border-stone-100 shadow-warm-lg z-20">
                        <div className="max-w-3xl mx-auto">
                            <InputArea onSendMessage={handlePreviewSend} mode="standard" placeholder="在此测试智能体效果..." disableConfig={true} />
                        </div>
                    </div>
                </div>
            );
        case '运行记录':
            return (
                <div className="flex-1 bg-white overflow-hidden flex flex-col relative">
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1200px]">
                            <thead className="bg-stone-50/50 sticky top-0 z-10 text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100">
                                <tr>
                                    <th className="p-4 w-10"></th>
                                    <th className="p-4">Trace ID</th>
                                    <th className="p-4">用户输入</th>
                                    <th className="p-4">输出内容</th>
                                    <th className="p-4 text-right">Tokens</th>
                                    <th className="p-4">耗时</th>
                                    <th className="p-4">开始时间</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs text-stone-700">
                                {MOCK_LOGS.map((log) => (
                                    <tr key={log.id} onClick={() => setSelectedLog(log)} className={`hover:bg-stone-50 cursor-pointer border-b border-stone-50 transition-all-200 ${selectedLog?.id === log.id ? 'bg-stone-50' : ''}`}>
                                        <td className="p-4">
                                            {log.status === 'success' ? <CheckCircle2 size={16} className="text-sage-500"/> : <AlertCircle size={16} className="text-red-400"/>}
                                        </td>
                                        <td className="p-4 font-mono text-stone-400 font-medium">{log.id}</td>
                                        <td className="p-4 font-mono text-stone-400 font-medium">{log.id}</td>
                                        <td className="p-4 truncate max-w-[200px] font-medium">{log.input}</td>
                                        <td className="p-4 truncate max-w-[200px] text-stone-500">{log.output}</td>
                                        <td className="p-4 text-right font-mono text-stone-400">5,472</td>
                                        <td className="p-4 font-mono text-sage-600 font-bold">1965 ms</td>
                                        <td className="p-4 whitespace-nowrap text-stone-400">{log.startTime}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        default: return <div className="flex-1 p-10 text-stone-400 text-xs font-bold uppercase tracking-widest text-center">Module Under Construction</div>;
    }
  };

  if (selectedAgent) {
      return (
          <div className="flex-1 h-full bg-stone-50 flex flex-col font-sans overflow-hidden">
               <div className="h-14 bg-white border-b border-stone-200 flex items-center px-6 justify-between shrink-0 shadow-warm-xs z-10">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                        <Box size={14} className="text-stone-300" />
                        <span className="hover:text-stone-900 cursor-pointer transition-colors" onClick={() => setSelectedAgent(null)}>空间</span>
                        <ChevronRight size={10} className="text-stone-200 mx-1" />
                        <span className="hover:text-stone-900 cursor-pointer transition-colors" onClick={() => setSelectedAgent(null)}>智能体</span>
                        <ChevronRight size={10} className="text-stone-200 mx-1" />
                        <div className="flex items-center gap-2">
                          <span className="text-stone-900 truncate max-w-[200px] tracking-tight">{selectedAgent.name}</span>
                          <TypeBadge type={selectedAgent.type} />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 border border-stone-200 rounded-lg text-[10px] font-bold text-stone-400 bg-white flex items-center gap-1.5 transition-colors uppercase tracking-widest">
                            <span>版本</span>
                            <span className="font-mono text-stone-900">v{selectedAgent.version}</span>
                        </div>
                        <button 
                            onClick={() => onEditAgent && onEditAgent(selectedAgent)}
                            className="px-4 py-1.5 bg-sage-500 text-white rounded-lg text-xs font-bold hover:bg-sage-600 flex items-center gap-1.5 transition-all-200 shadow-sage-btn active-press"
                        >
                            <Edit3 size={14} /> 编辑
                        </button>
                    </div>
               </div>

               <div className="h-11 bg-white border-b border-stone-100 flex items-center px-8 gap-8 shrink-0 shadow-warm-xs z-10">
                   {['概览', '试运行', '运行记录', '评测实验', '部署记录', '配置'].map(tab => (
                       <button 
                        key={tab}
                        onClick={() => setActiveDetailTab(tab)}
                        className={`h-full text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all px-1 ${activeDetailTab === tab ? 'text-sage-700 border-sage-600' : 'text-stone-400 border-transparent hover:text-stone-600'}`}
                       >
                           {tab}
                       </button>
                   ))}
               </div>

               <div className="flex-1 flex overflow-hidden">
                   {renderTabContent()}
               </div>
          </div>
      )
  }

  return (
    <div className="flex-1 h-full bg-stone-50 flex flex-col font-sans overflow-hidden">
      <div className="h-14 bg-white border-b border-stone-200 flex items-center px-6 justify-between shrink-0 shadow-warm-xs z-10">
        <div className="flex items-center gap-2 text-[11px] font-bold text-stone-400 uppercase tracking-widest">
             <LayoutGrid size={14} className="text-stone-300" />
             <span>崇启的空间</span>
             <ChevronRight size={10} className="text-stone-200 mx-1" />
             <span className="text-stone-900 tracking-tight">智能体中心</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white">
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-96 group">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-300 group-focus-within:text-sage-500 transition-colors" size={14}/>
                        <input 
                            type="text" 
                            placeholder="搜索智能体..." 
                            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-1 focus:ring-sage-500 outline-none text-sm transition-all shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-8">
                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                        <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-stone-300 text-sage-600 focus:ring-sage-500"
                            checked={onlyMyCreated}
                            onChange={(e) => setOnlyMyCreated(e.target.checked)}
                        />
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest group-hover:text-stone-700 transition-colors">我创建的</span>
                    </label>
                    <div className="relative" ref={createButtonRef} onMouseEnter={() => setShowCreateDropdown(true)} onMouseLeave={() => setShowCreateDropdown(false)}>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-sage-500 text-white rounded-lg hover:bg-sage-600 text-xs font-bold shadow-sage-btn transition-all-200 active-press uppercase tracking-widest">
                            <Plus size={16} /> 
                            <span>新建智能体</span>
                        </button>
                        
                        {showCreateDropdown && (
                          <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-stone-200 rounded-xl shadow-warm-lg z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                             <button 
                                onClick={() => { setShowQuickBuildModal(true); setShowCreateDropdown(false); }}
                                className="w-full text-left px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-3 transition-colors group"
                             >
                                <Zap size={16} className="text-sage-500 group-hover:scale-110 transition-transform" />
                                <div>
                                  <div className="font-bold">快速构建</div>
                                  <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">基于 AI 辅助快速生成</div>
                                </div>
                             </button>
                             <div className="h-px bg-stone-100 mx-1.5 mt-1.5"></div>
                             <button 
                                onClick={() => { setShowProCodeModal(true); setShowCreateDropdown(false); }}
                                className="w-full text-left px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-3 transition-colors group"
                             >
                                <Code size={16} className="text-stone-400 group-hover:scale-110 transition-transform" />
                                <div>
                                  <div className="font-bold">编码构建</div>
                                  <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">手动配置各模块参数</div>
                                </div>
                             </button>
                          </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
                {filteredAgents.map(agent => {
                    const statusConfig = getStatusConfig(agent.status);
                    return (
                    <div 
                        key={agent.id} 
                        onClick={() => setSelectedAgent(agent)} 
                        className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-warm-md hover:border-sage-200 transition-all-200 cursor-pointer flex flex-col h-[220px] relative group shadow-warm-xs hover-lift"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 bg-stone-50 text-sage-600 border-stone-100 transition-all-200 group-hover:bg-sage-50 group-hover:shadow-inner">
                                    <Bot size={24} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-col gap-1">
                                      <h3 className="font-bold text-stone-900 truncate text-sm tracking-tight">{agent.name}</h3>
                                      <TypeBadge type={agent.type} />
                                    </div>
                                </div>
                            </div>
                            <button className="text-stone-300 hover:text-stone-500 p-1 transition-colors">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>

                        <p className="text-xs text-stone-400 font-medium line-clamp-2 mb-4 flex-1 leading-relaxed">
                            {agent.description}
                        </p>
                        
                        <div className="flex flex-col gap-2 pt-4 border-t border-stone-50 mt-auto">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                <div className="text-stone-400 flex items-center gap-2 truncate flex-1 mr-2">
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Clock size={12} className="text-stone-300" />
                                        <span>{agent.lastEditedBy || '崇启'} · {agent.lastOperatedAt || '01-21'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    {statusConfig && (
                                        <span className={`px-2 py-0.5 rounded border ${statusConfig.className}`}>
                                            {statusConfig.label}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest overflow-hidden">
                                <Box size={12} className="text-stone-300 shrink-0" />
                                <span className="truncate" title={agent.space || '默认空间'}>{agent.space || '默认空间'}</span>
                            </div>
                        </div>
                    </div>
                )})}
            </div>
        </div>
      </div>

      <div className="h-16 bg-white border-t border-stone-200 flex items-center justify-end px-10 gap-2 shrink-0 shadow-warm-xs">
          <button className="w-8 h-8 flex items-center justify-center text-stone-300 hover:bg-stone-50 hover:text-stone-900 rounded-md transition-all-200">
              <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-xs font-bold bg-sage-50 border border-sage-100 text-sage-700 rounded-md shadow-inner">1</button>
          <button className="w-8 h-8 flex items-center justify-center text-xs font-bold text-stone-400 hover:bg-stone-50 rounded-md transition-all-200">2</button>
          <button className="w-8 h-8 flex items-center justify-center text-stone-300 hover:bg-stone-50 hover:text-stone-900 rounded-md transition-all-200">
              <ChevronRight size={16} />
          </button>
      </div>
    </div>
  );
};
