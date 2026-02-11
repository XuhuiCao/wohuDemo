import React, { useState, useEffect } from 'react';
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
  FileCode
} from 'lucide-react';
import { MOCK_AGENTS, OFFICIAL_SKILLS, OFFICIAL_MCPS, MOCK_DOCS } from '../constants';
import { Agent, Message } from '../types';
import { createPortal } from 'react-dom';
import { InputArea } from './InputArea';

interface AgentCenterProps {
  onBack: () => void;
  initialAgent?: Agent | null;
  onEditAgent?: (agent: Agent) => void;
}

// Mock Log Data
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
    status: 'success'
}));

interface DiffLine {
    lineOld?: number;
    lineNew?: number;
    content: string;
    type: 'normal' | 'add' | 'del';
}

interface FileDiff {
    fileName: string;
    additions: number;
    deletions: number;
    lines: DiffLine[];
}

interface DeployRecord {
    id: string; 
    message: string;
    userId: string;
    time: string;
    diffs?: FileDiff[];
    version?: string;
}

const MOCK_DEPLOY_RECORDS: DeployRecord[] = [
    { 
        id: 'cc057c0', 
        message: "Restored to '45cd236a2fdbe3d7326547c982740c4bf51cce7c'", 
        userId: '崇启', 
        time: '5 小时前',
        version: 'v1.0.2',
        diffs: [
            {
                fileName: 'agents/config.json',
                additions: 2,
                deletions: 1,
                lines: [
                    { lineOld: 15, lineNew: 15, content: '"version": "v1.0.1",', type: 'del' },
                    { lineNew: 16, content: '"version": "v1.0.2",', type: 'add' },
                    { lineOld: 17, lineNew: 17, content: '"description": "已更新核心推理逻辑",', type: 'normal' },
                ]
            }
        ]
    },
    { 
        id: '543a72e', 
        message: 'feat: 优化了知识库检索的相关性阈值', 
        userId: '崇启', 
        time: '21 小时前',
        version: 'v1.0.1'
    },
    { 
        id: '1f5af1e', 
        message: 'chore: 升级基础模型至 Gemini 3.0 Pro', 
        userId: '崇启', 
        time: '2 天前',
        version: 'v1.0.0'
    },
];

const getStatusConfig = (status: string) => {
    switch(status) {
        case 'published': return { label: '已发布', className: 'bg-green-50 text-green-600 border-green-200' };
        case 'publishing': return { label: '发布中', className: 'bg-blue-50 text-blue-600 border-blue-200' };
        case 'draft': return { label: '修改未发布', className: 'bg-yellow-50 text-yellow-600 border-yellow-200' };
        default: return { label: '未知', className: 'bg-gray-50 text-gray-500 border-gray-200' };
    }
}

export const AgentCenter: React.FC<AgentCenterProps> = ({ onBack, initialAgent, onEditAgent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyMyCreated, setOnlyMyCreated] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(initialAgent || null);
  const [activeDetailTab, setActiveDetailTab] = useState('智能体概览');
  
  // Update internal selectedAgent if initialAgent changes
  useEffect(() => {
    if (initialAgent) {
        setSelectedAgent(initialAgent);
    }
  }, [initialAgent]);

  // Drawer/Details State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'test'>('test');
  const [selectedSessionTitle, setSelectedSessionTitle] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [selectedDeployRecord, setSelectedDeployRecord] = useState<DeployRecord | null>(null);
  const [consumptionTab, setConsumptionTab] = useState<'method' | 'basic'>('method');
  
  // Consumption Modals State
  const [showDingTalkModal, setShowDingTalkModal] = useState(false);
  const [showAntCodeModal, setShowAntCodeModal] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [debugChannel, setDebugChannel] = useState<'DingTalk' | 'AntCode' | null>(null);

  // Preview Messages State for Try-out Tab
  const [previewMessages, setPreviewMessages] = useState<Message[]>([]);

  const filteredAgents = MOCK_AGENTS.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = Array.from({ length: 45 }).map((_, i) => Math.floor(Math.random() * 40) + 10);
  const mockSessions = [
    { id: 's1', title: '新办公桌订单查询', time: '刚刚', status: 'completed' },
    { id: 's2', title: '更换桌椅申请', time: '12分钟前', status: 'completed' },
    { id: 's3', title: '办公家具采购咨询', time: '2小时前', status: 'processing' },
    { id: 's4', title: '供应商入驻流程', time: '18分钟前', status: 'failed' },
    { id: 's5', title: '显示器支架配件选购', time: '2小时前', status: 'failed' },
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

  const renderConsumptionModals = () => {
    return (
        <>
            {/* DingTalk Config Modal */}
            {showDingTalkModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-[500px] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                绑定钉钉机器人 <HelpCircle size={16} className="text-gray-400"/>
                            </h3>
                            <button onClick={() => setShowDingTalkModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-6 text-sm">
                            <div className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-gray-100 text-[10px] flex items-center justify-center font-bold text-gray-500 shrink-0 mt-0.5">1</span>
                                <p className="text-gray-700">前往 <a href="#" className="text-blue-600 hover:underline">蚂蚁钉开放平台</a>，进入需要绑定的机器人设置页面。</p>
                            </div>
                            <div className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-gray-100 text-[10px] flex items-center justify-center font-bold text-gray-500 shrink-0 mt-0.5">2</span>
                                <div className="space-y-2 flex-1">
                                    <p className="text-gray-700">复制下方 URL 粘贴到消息接收地址。</p>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-start gap-2 relative group">
                                        <code className="text-xs text-gray-500 break-all leading-relaxed flex-1 font-mono">
                                            https://csmobile.alipay.com/mypa/dingtalk.json?scene=lx_app_agent513f9084664bf50e8ded11f3982
                                        </code>
                                        <button className="p-1.5 text-gray-400 hover:text-gray-600 shrink-0"><Copy size={14}/></button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-gray-100 text-[10px] flex items-center justify-center font-bold text-gray-500 shrink-0 mt-0.5">3</span>
                                <p className="text-gray-700">在钉钉中与当前机器人对话即可。</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AntCode Config Modal */}
            {showAntCodeModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-[500px] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                绑定 AntCode Webhooks <HelpCircle size={16} className="text-gray-400"/>
                            </h3>
                            <button onClick={() => setShowAntCodeModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-6 text-sm">
                            <div className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-gray-100 text-[10px] flex items-center justify-center font-bold text-gray-500 shrink-0 mt-0.5">1</span>
                                <div className="space-y-2 flex-1">
                                    <p className="text-gray-700">配置评论 @ 唤起当前智能体的唯一名称</p>
                                    <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#55635C] outline-none" placeholder="请输入"/>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-gray-100 text-[10px] flex items-center justify-center font-bold text-gray-500 shrink-0 mt-0.5">2</span>
                                <p className="text-gray-700">前往 <a href="#" className="text-blue-600 hover:underline">AntCode</a>，进入仓库权限页面。</p>
                            </div>
                            <div className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-gray-100 text-[10px] flex items-center justify-center font-bold text-gray-500 shrink-0 mt-0.5">3</span>
                                <div className="space-y-2 flex-1">
                                    <p className="text-gray-700">复制下方 URL 粘贴到仓库 URL 中。</p>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-start gap-2 relative group">
                                        <code className="text-xs text-gray-500 break-all leading-relaxed flex-1 font-mono">
                                            https://dcs.alipay.com/api/lx/agent/stream_chat?agentCode=Agenticmoban_83d6
                                        </code>
                                        <button className="p-1.5 text-gray-400 hover:text-gray-600 shrink-0"><Copy size={14}/></button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-gray-100 text-[10px] flex items-center justify-center font-bold text-gray-500 shrink-0 mt-0.5">4</span>
                                <p className="text-gray-700">在对应仓库 @ 当前智能体名称即可。</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Debug Chat Modal */}
            {showDebugModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#FAFAFA] rounded-xl shadow-2xl w-[600px] h-[700px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${debugChannel === 'DingTalk' ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-600'}`}>
                                    {debugChannel === 'DingTalk' ? <Smartphone size={18}/> : <GitBranch size={18}/>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm">渠道调试: {debugChannel === 'DingTalk' ? '钉钉机器人' : 'AntCode'}</h3>
                                    <p className="text-[10px] text-gray-400">正在以该渠道的上下文进行实时测试</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDebugModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#55635C] flex items-center justify-center text-white shrink-0">
                                    <Bot size={16}/>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100 text-sm text-gray-700 max-w-[85%] shadow-sm leading-relaxed">
                                    你好！我是你正在构建的智能体。当前我正在通过 <b>{debugChannel === 'DingTalk' ? '钉钉' : 'AntCode'}</b> 渠道进行模拟对话。你可以尝试发送 any 指令来测试我的表现。
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="relative group">
                                <textarea 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:ring-1 focus:ring-[#55635C] outline-none min-h-[50px] resize-none transition-all"
                                    placeholder="输入测试消息..."
                                />
                                <button className="absolute right-3 bottom-3 p-1.5 bg-[#55635C] text-white rounded-lg hover:bg-[#444F49] transition-colors shadow-sm">
                                    <ArrowUp size={16}/>
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-gray-400 mt-2">调试消息不会计入正式运行日志</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
  };

  const renderTabContent = () => {
    switch (activeDetailTab) {
        case '智能体概览':
            return (
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Column: Analytics & List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                        <div className="max-w-5xl mx-auto space-y-8">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
                                            <ArrowUpRight size={12} className="text-white"/>
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg">{selectedAgent?.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                        <span>最近 90 天</span>
                                        <ChevronRight size={12} className="rotate-90" />
                                    </div>
                                </div>
                                <div className="mb-8">
                                    <div className="text-xs text-gray-400 mb-1">总会话数</div>
                                    <div className="text-4xl font-bold text-gray-900 tracking-tight">12,405</div>
                                    <div className="text-blue-500 text-xs font-medium mt-1">今日新增 213 个会话</div>
                                </div>
                                <div className="h-40 flex items-end gap-1.5 px-2">
                                    {chartData.map((val, i) => (
                                        <div key={i} className="flex-1 rounded-t-sm bg-blue-500/90 hover:bg-blue-600 transition-all cursor-pointer" style={{ height: `${val}%` }}></div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-300 mt-2 px-1 uppercase font-bold tracking-wider">
                                    <span>7月 13日</span>
                                    <span>10月 13日</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <button className="text-sm font-bold text-gray-900 border-b-2 border-[#55635C] pb-3 -mb-[17px]">全部会话</button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Filter size={16} className="text-gray-400" />
                                        <Search size={16} className="text-gray-400" />
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {mockSessions.map(session => (
                                        <div key={session.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer group transition-colors" onClick={() => handleViewSession(session)}>
                                            <div className="flex items-center gap-4">
                                                {session.status === 'completed' && <CheckCircle2 size={18} className="text-gray-300" />}
                                                {session.status === 'processing' && <RefreshCcw size={18} className="text-blue-400 animate-spin" />}
                                                {session.status === 'failed' && <Clock size={18} className="text-red-300" />}
                                                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{session.title}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">{session.time}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-6 py-4 bg-gray-50 flex justify-center">
                                    <button className="text-xs text-gray-500 hover:text-gray-800 font-medium">查看全部会话记录</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Configuration Summary - Now inside Overview Tab Only & Read Only */}
                    <div className="w-[400px] border-l border-gray-200 bg-white overflow-y-auto custom-scrollbar flex flex-col shrink-0">
                        <div className="p-6 space-y-8">
                            {/* Agent Card Preview */}
                            <div className="bg-[#F8FAFC] rounded-2xl border border-gray-200 p-6 relative overflow-hidden shadow-sm">
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-[#55635C] mb-4">
                                        <Bot size={24} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedAgent?.name} Agent</h2>
                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                        {selectedAgent?.description}
                                    </p>
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200"></div>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={handleOpenTest}
                                            className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm flex items-center gap-1.5 transition-all"
                                        >
                                            <Play size={12} fill="currentColor"/> 试运行
                                        </button>
                                    </div>
                                </div>
                                {/* Decor */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            </div>

                            {/* Instructions / Prompt */}
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">提示词 (Instructions)</h4>
                                </div>
                                <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-4 text-xs text-gray-600 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar italic shadow-inner">
                                    # 角色设定<br/>
                                    你是一个专业的智能助手，致力于提供高质量的问题解答服务。你的语气应该是专业且友好的。<br/><br/>
                                    # 核心目标<br/>
                                    1. 快速识别用户意图<br/>
                                    2. 利用知识库提供精准回答<br/>
                                    3. 在必要时调用外部工具
                                </div>
                                <div className="mt-3 flex items-center justify-end text-[10px] text-gray-400">
                                    <div className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                                        <CheckCircle2 size={10}/> 4 条改进建议
                                    </div>
                                </div>
                            </section>

                            {/* Skills Integration */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">技能 (SKILLS)</h4>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                                                <Globe size={14}/>
                                            </div>
                                            <span className="text-sm text-gray-700 font-medium">联网搜索服务</span>
                                        </div>
                                        <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-100 font-bold">已启用</span>
                                    </div>
                                    <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                                                <Puzzle size={14}/>
                                            </div>
                                            <span className="text-sm text-gray-700 font-medium">Google 日历集成</span>
                                        </div>
                                        <span className="text-[10px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded border border-gray-100 font-bold">只读</span>
                                    </div>
                                </div>
                            </section>

                            {/* MCP Protocol */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">工具 (MCP)</h4>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 border border-purple-100 shadow-sm">
                                                <Server size={14}/>
                                            </div>
                                            <span className="text-sm text-gray-700 font-medium">Salesforce 工具包</span>
                                        </div>
                                        <ExternalLink size={12} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                                    </div>
                                </div>
                            </section>

                            {/* Knowledge Base */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">知识库 (KNOWLEDGE BASE)</h4>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 border border-orange-100 shadow-sm">
                                                <BookOpen size={14}/>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-800 font-medium">企业百科知识库</span>
                                                <span className="text-[10px] text-gray-400 font-bold">1.2 GB • 45 个文档</span>
                                            </div>
                                        </div>
                                        <CheckCircle2 size={14} className="text-green-500" />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            );
        case '试运行':
            return (
                <div className="flex-1 flex flex-col bg-[#F9FAFB] relative overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-[#55635C] flex items-center justify-center text-white shrink-0">
                                    <Bot size={16}/>
                                </div>
                                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 text-sm text-gray-700 shadow-sm leading-relaxed max-w-[85%]">
                                    您好！我是 {selectedAgent?.name} 智能体。您可以随时开始一段对话来测试我的表现。当前处于实时调试模式。
                                </div>
                            </div>
                            {previewMessages.map(msg => (
                                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'model' && (
                                        <div className="w-8 h-8 rounded-full bg-[#55635C] flex items-center justify-center text-white shrink-0">
                                            <Bot size={16}/>
                                        </div>
                                    )}
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm max-w-[85%] ${msg.role === 'user' ? 'bg-[#55635C] text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none'}`}>
                                        {msg.content}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0 border border-gray-300">
                                            <User size={16}/>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 bg-white border-t border-gray-200">
                        <div className="max-w-3xl mx-auto">
                            <InputArea onSendMessage={handlePreviewSend} mode="standard" placeholder="在此测试智能体效果..." disableConfig={true} />
                            <p className="text-[10px] text-center text-gray-400 mt-2">预览环境仅用于调试，对话内容不计入正式统计</p>
                        </div>
                    </div>
                </div>
            );
        case '运行记录':
            return (
                <div className="flex-1 bg-white overflow-hidden flex flex-col relative">
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse min-w-[1200px]">
                            <thead className="bg-gray-50 sticky top-0 z-10 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 border-b border-gray-200 w-10"></th>
                                    <th className="p-4 border-b border-gray-200">Trace ID</th>
                                    <th className="p-4 border-b border-gray-200">会话 ID</th>
                                    <th className="p-4 border-b border-gray-200">用户 ID</th>
                                    <th className="p-4 border-b border-gray-200 max-w-[200px]">用户输入</th>
                                    <th className="p-4 border-b border-gray-200 max-w-[200px]">输出内容</th>
                                    <th className="p-4 border-b border-gray-200 text-right">Tokens</th>
                                    <th className="p-4 border-b border-gray-200">耗时</th>
                                    <th className="p-4 border-b border-gray-200">开始时间</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs text-gray-700">
                                {MOCK_LOGS.map((log) => (
                                    <tr key={log.id} onClick={() => setSelectedLog(log)} className={`hover:bg-blue-50/50 cursor-pointer border-b border-gray-100 transition-colors ${selectedLog?.id === log.id ? 'bg-blue-50' : ''}`}>
                                        <td className="p-4">
                                            {log.status === 'success' ? <CheckCircle2 size={16} className="text-green-500"/> : <AlertCircle size={16} className="text-red-500"/>}
                                        </td>
                                        <td className="p-4 font-mono text-gray-400">{log.id}</td>
                                        <td className="p-4 font-mono text-gray-400">{log.sessionId}</td>
                                        <td className="p-4 font-mono text-gray-400">{log.userId}</td>
                                        <td className="p-4 truncate max-w-[200px]">{log.input}</td>
                                        <td className="p-4 truncate max-w-[200px]">{log.output}</td>
                                        <td className="p-4 text-right font-mono">5,472</td>
                                        <td className="p-4 font-mono">1965 ms</td>
                                        <td className="p-4 whitespace-nowrap">{log.startTime}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {selectedLog && (
                        <div className="absolute inset-y-0 right-0 w-[600px] bg-white shadow-2xl border-l border-gray-200 z-20 flex flex-col animate-in slide-in-from-right duration-300">
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
                                 <h3 className="font-bold text-gray-800">Trace 详情: <span className="font-mono text-gray-400">{selectedLog.id}</span></h3>
                                 <button onClick={() => setSelectedLog(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-400"><X size={20}/></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 bg-[#F8F9FA] space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Latency</div>
                                        <div className="text-lg font-bold text-gray-800">1965 ms</div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Total Tokens</div>
                                        <div className="text-lg font-bold text-gray-800">5,472</div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-900 uppercase">执行路径</h4>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100"><Activity size={12}/></div>
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-gray-700">Intent Analysis</div>
                                                <div className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 p-2 rounded">Determined user is asking about order status.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        case '评测实验':
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F9FAFB] text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-300 shadow-sm border border-gray-200 mb-6">
                        <FlaskConical size={40}/>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">评测实验正在建设中</h3>
                    <p className="text-gray-400 max-w-sm">该模块将很快为您呈现，敬请期待更专业、全方位的智能体能力评测工具。</p>
                </div>
            );
        case '部署记录':
            if (selectedDeployRecord) {
                return (
                    <div className="flex flex-col h-full bg-[#F7F8FA]">
                         <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 shrink-0">
                             <button onClick={() => setSelectedDeployRecord(null)} className="flex items-center text-sm text-gray-500 hover:text-gray-800">
                                 <ChevronLeft size={16}/> Back
                             </button>
                             <div className="h-4 w-px bg-gray-200"></div>
                             <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                 <GitBranch size={16}/> Main
                             </div>
                         </div>
                         <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                              <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
                                  <div className="flex justify-between items-start mb-2">
                                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                          <span className="font-mono text-base text-gray-500">{selectedDeployRecord.id}</span>
                                          {selectedDeployRecord.message}
                                      </h2>
                                      <span className="text-xs text-gray-500">{selectedDeployRecord.userId} · {selectedDeployRecord.time}</span>
                                  </div>
                                  <div className="text-sm text-gray-900 font-bold">
                                      变更文件数：{selectedDeployRecord.diffs?.length || 0}
                                  </div>
                              </div>
                              {selectedDeployRecord.diffs?.map((file, idx) => (
                                  <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                                          <div className="flex items-center gap-2 font-medium text-sm text-gray-700">
                                              <FileCode size={16} className="text-gray-400"/>
                                              {file.fileName}
                                          </div>
                                          <div className="flex items-center gap-3 text-xs font-mono">
                                              <span className="text-green-600">+{file.additions}</span>
                                              <span className="text-red-600">-{file.deletions}</span>
                                              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-[10px] font-sans">修改</span>
                                          </div>
                                      </div>
                                      <div className="overflow-x-auto">
                                          <table className="w-full text-xs font-mono border-collapse">
                                              <tbody>
                                                  {file.lines.map((line, lIdx) => (
                                                      <tr key={lIdx} className={`${line.type === 'add' ? 'bg-[#E6FFEC]' : line.type === 'del' ? 'bg-[#FFEBE9]' : ''}`}>
                                                          <td className="w-10 text-right text-gray-400 select-none p-1 border-r border-gray-100 bg-[#F6F8FA] px-2">{line.lineOld || ''}</td>
                                                          <td className="w-10 text-right text-gray-400 select-none p-1 border-r border-gray-200 bg-[#F6F8FA] px-2">{line.lineNew || ''}</td>
                                                          <td className="p-1 px-4 whitespace-pre-wrap break-all relative">
                                                              {line.type === 'add' && <span className="absolute left-1 top-1 text-green-600 font-bold select-none">+</span>}
                                                              {line.type === 'del' && <span className="absolute left-1 top-1 text-red-600 font-bold select-none">-</span>}
                                                              <span className={`pl-2 ${line.type === 'add' ? 'bg-[#ACF2BD]/40 block w-full -my-1 py-1' : line.type === 'del' ? 'bg-[#FFCECB]/40 block w-full -my-1 py-1' : ''}`}>
                                                                  {line.content}
                                                              </span>
                                                          </td>
                                                      </tr>
                                                  ))}
                                              </tbody>
                                          </table>
                                      </div>
                                  </div>
                              ))}
                         </div>
                    </div>
                );
            }
            return (
                <div className="p-6 h-full flex flex-col bg-white overflow-hidden">
                    <div className="flex justify-between items-center mb-6 shrink-0">
                        <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
                             <GitBranch size={20}/>
                             Main
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
                            <input className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-1 focus:ring-gray-300" placeholder="搜索内容"/>
                        </div>
                    </div>
                    <div className="relative border-l border-gray-200 ml-3 space-y-4 pl-8 py-2 flex-1 overflow-y-auto custom-scrollbar">
                        {MOCK_DEPLOY_RECORDS.map((record) => (
                             <div key={record.id} className="relative cursor-pointer group" onClick={() => setSelectedDeployRecord(record)}>
                                <div className="absolute -left-[39px] top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-800 rounded-full border-2 border-white ring-1 ring-gray-200 group-hover:scale-125 transition-transform z-10"></div>
                                <div className="bg-white hover:bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm group-hover:shadow-md transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {record.version && (
                                            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1 shrink-0">
                                                <Tag size={10}/>
                                                {record.version}
                                            </span>
                                        )}
                                        <span className="font-mono text-sm font-bold text-gray-900 w-16">{record.id}</span>
                                        <span className="text-sm text-gray-700 font-medium line-clamp-1 max-w-md" title={record.message}>{record.message}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span>{record.userId}</span>
                                        <span>{record.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case '消费配置':
            return (
                <div className="flex-1 bg-white overflow-hidden flex flex-col">
                    <div className="h-12 border-b border-gray-100 flex items-center px-8 gap-8 shrink-0">
                        <button onClick={() => setConsumptionTab('method')} className={`h-full text-xs font-bold border-b-2 transition-all ${consumptionTab === 'method' ? 'text-[#55635C] border-[#55635C]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>消费渠道</button>
                        <button onClick={() => setConsumptionTab('basic')} className={`h-full text-xs font-bold border-b-2 transition-all ${consumptionTab === 'basic' ? 'text-[#55635C] border-[#55635C]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>基础配置</button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {consumptionTab === 'method' ? (
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-5 border border-gray-200 rounded-2xl bg-white hover:border-[#55635C]/50 transition-all shadow-sm flex flex-col">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500"><Smartphone size={20}/></div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">钉钉机器人</div>
                                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">DingTalk Bot</div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-auto">
                                            <button 
                                                onClick={() => setShowDingTalkModal(true)}
                                                className="w-full py-2 bg-[#55635C] text-white rounded-lg text-xs font-bold hover:bg-[#444F49] transition-colors shadow-sm"
                                            >
                                                配置渠道
                                            </button>
                                            <button 
                                                onClick={() => { setDebugChannel('DingTalk'); setShowDebugModal(true); }}
                                                className="w-full py-2 bg-white border border-[#55635C]/20 text-[#55635C] rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-1"
                                            >
                                                <MessageSquare size={12}/> 调试
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-5 border border-gray-200 rounded-2xl bg-white hover:border-[#55635C]/50 transition-all shadow-sm flex flex-col">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700"><GitBranch size={20}/></div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">AntCode 插件</div>
                                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Git Extension</div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-auto">
                                            <button 
                                                onClick={() => setShowAntCodeModal(true)}
                                                className="w-full py-2 bg-[#55635C] text-white rounded-lg text-xs font-bold hover:bg-[#444F49] transition-colors shadow-sm"
                                            >
                                                配置渠道
                                            </button>
                                            <button 
                                                onClick={() => { setDebugChannel('AntCode'); setShowDebugModal(true); }}
                                                className="w-full py-2 bg-white border border-[#55635C]/20 text-[#55635C] rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-1"
                                            >
                                                <MessageSquare size={12}/> 调试
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Terminal size={16}/> HTTP 调用示例</h3>
                                    <div className="bg-gray-900 p-5 rounded-2xl text-xs font-mono text-gray-300 leading-relaxed shadow-inner">
                                        <span className="text-gray-500"># 发起流式对话</span><br/>
                                        curl -X POST https://api.wohu.ai/v1/chat \<br/>
                                        &nbsp;&nbsp;-H "Authorization: Bearer sk-••••" \<br/>
                                        &nbsp;&nbsp;-d '<span className="text-green-400">{"message": "你好", "agent_id": "wohu-123"}</span>'
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Code size={16}/> SDK 使用引导</h3>
                                    <div className="relative group">
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 bg-gray-800 text-gray-400 hover:text-white rounded transition-colors"><Copy size={14}/></button>
                                        </div>
                                        <div className="p-4 bg-gray-900 text-gray-300 rounded-xl font-mono text-[11px] overflow-x-auto border border-gray-800 leading-loose shadow-inner">
                                            <span className="text-blue-400">import</span> {' { WohuAI } '} <span className="text-blue-400">from</span> <span className="text-green-400">'@wohu/sdk'</span>;<br/><br/>
                                            <span className="text-blue-400">const</span> client = <span className="text-blue-400">new</span> <span className="text-yellow-400">WohuAI</span>({'{'} apiKey: <span className="text-green-400">'YOUR_SK'</span> {'}'});<br/><br/>
                                            <span className="text-gray-500">// 发起对话</span><br/>
                                            <span className="text-blue-400">const</span> response = <span className="text-blue-400">await</span> client.chat.send({'{'}<br/>
                                            &nbsp;&nbsp;agentId: <span className="text-green-400">'wohu-123'</span>,<br/>
                                            &nbsp;&nbsp;message: <span className="text-green-400">'分析这个文档'</span><br/>
                                            {'}'});
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 space-y-8 max-w-4xl">
                                <section className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-900">基础属性</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">智能体名称</label>
                                            <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50" value={selectedAgent?.name} readOnly />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Agent ID</label>
                                            <div className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono text-gray-500 bg-gray-50">wohu-75421-a3</div>
                                        </div>
                                    </div>
                                </section>
                                <section className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-900">API Key 管理</h3>
                                    <div className="p-4 border border-gray-200 rounded-2xl bg-gray-50 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white rounded border border-gray-200 flex items-center justify-center font-mono text-[10px] text-gray-400">SK</div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-800">Default Production Key</div>
                                                <div className="text-[10px] font-mono text-gray-400">sk-••••••••••••••••3a2f</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-1.5 hover:bg-white rounded transition-colors text-gray-400"><Copy size={14}/></button>
                                            <button className="p-1.5 hover:bg-white rounded transition-colors text-gray-400"><RefreshCcw size={14}/></button>
                                        </div>
                                    </div>
                                    <button className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 hover:border-[#55635C] hover:text-[#55635C] transition-all flex items-center justify-center gap-2 font-bold"><Plus size={14}/> 生成新的 API Key</button>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            );
        default: return null;
    }
  };

  if (selectedAgent) {
      return (
          <div className="flex-1 h-full bg-[#F9FAFB] flex flex-col font-sans overflow-hidden">
               {/* Detail Header */}
               <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6 justify-between shrink-0">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Box size={16} className="text-gray-400" />
                        <span className="hover:text-gray-900 cursor-pointer" onClick={() => setSelectedAgent(null)}>崇启的空间</span>
                        <ChevronRight size={14} className="text-gray-300 mx-1" />
                        <span className="hover:text-gray-900 cursor-pointer" onClick={() => setSelectedAgent(null)}>智能体</span>
                        <ChevronRight size={14} className="text-gray-300 mx-1" />
                        <span className="font-medium text-gray-900">{selectedAgent.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 bg-white flex items-center gap-1.5 transition-colors">
                            <span>版本号</span>
                            <span className="font-mono font-bold text-gray-900">v{selectedAgent.version}</span>
                        </div>
                        <button 
                            onClick={() => onEditAgent && onEditAgent(selectedAgent)}
                            className="px-4 py-1.5 bg-[#55635C] text-white rounded-lg text-sm font-medium hover:bg-[#444F49] flex items-center gap-1.5 transition-all shadow-sm"
                        >
                            <Edit3 size={14} /> 编辑
                        </button>
                    </div>
               </div>

               {/* Detail Tabs */}
               <div className="h-12 bg-white border-b border-gray-100 flex items-center px-8 gap-8 shrink-0">
                   {['智能体概览', '试运行', '运行记录', '评测实验', '部署记录', '消费配置'].map(tab => (
                       <button 
                        key={tab}
                        onClick={() => setActiveDetailTab(tab)}
                        className={`h-full text-sm font-medium border-b-2 transition-all px-1 ${activeDetailTab === tab ? 'text-[#55635C] border-[#55635C]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                       >
                           {tab}
                       </button>
                   ))}
               </div>

               {/* Detail Content */}
               <div className="flex-1 flex overflow-hidden">
                   {renderTabContent()}
               </div>

               {/* Session Drawer Implementation */}
               {drawerOpen && createPortal(
                   <div className="fixed inset-0 z-[100] flex justify-end">
                       <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setDrawerOpen(false)}></div>
                       <div className="w-[600px] h-full bg-white shadow-2xl relative z-10 flex flex-col animate-in slide-in-from-right duration-300">
                           <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white flex-shrink-0">
                               <div className="flex items-center gap-2">
                                   <Bot size={18} className="text-[#55635C]"/>
                                   <h3 className="font-bold text-gray-800">{drawerMode === 'test' ? '智能体试运行' : '历史会话详情'}: {selectedSessionTitle}</h3>
                               </div>
                               <button onClick={() => setDrawerOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                                   <ChevronRight size={20} />
                               </button>
                           </div>
                           
                           <div className="flex-1 overflow-y-auto p-6 bg-[#F9FAFB] custom-scrollbar">
                               <div className="flex gap-4 mb-8">
                                   <div className="w-8 h-8 rounded-full bg-[#55635C] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                                       <Bot size={16} />
                                   </div>
                                   <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 text-sm text-gray-700 shadow-sm max-w-[85%] leading-relaxed">
                                       {drawerMode === 'test' 
                                            ? `您好！我是 ${selectedAgent.name} 智能体。您可以随时开始一段对话来测试我的表现。`
                                            : `这是会话 "${selectedSessionTitle}" 的历史记录。当前处于只读模式，无法继续对话。`
                                       }
                                   </div>
                               </div>

                               {/* Mock history if in view mode */}
                               {drawerMode === 'view' && (
                                   <div className="space-y-8 pb-10">
                                       <div className="flex gap-4 justify-end">
                                           <div className="bg-[#55635C] p-4 rounded-2xl rounded-tr-none text-sm text-white shadow-sm max-w-[85%] leading-relaxed">
                                               你好，帮我查询一下我的办公桌订单状态。
                                           </div>
                                           <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0 border border-gray-300">
                                               <User size={16} />
                                           </div>
                                       </div>
                                       <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-[#55635C] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                                                <Bot size={16} />
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 text-sm text-gray-700 shadow-sm max-w-[85%] leading-relaxed">
                                                好的，正在为您查询您的订单状态。系统显示您的订单 #DE-20230824 已于今日上午 10:30 完成拣货，目前正在等待快递揽收。预计将在 24 小时内发出。
                                            </div>
                                       </div>
                                       <div className="flex gap-4 justify-end">
                                           <div className="bg-[#55635C] p-4 rounded-2xl rounded-tr-none text-sm text-white shadow-sm max-w-[85%] leading-relaxed">
                                               好的，大概什么时候能送到？
                                           </div>
                                           <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0 border border-gray-300">
                                               <User size={16} />
                                           </div>
                                       </div>
                                       <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-[#55635C] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                                                <Bot size={16} />
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 text-sm text-gray-700 shadow-sm max-w-[85%] leading-relaxed">
                                                根据您的收货地址，快递发出后预计 2-3 个工作日送达。您可以在稍后收到的物流短信中点击链接实时查看进度。
                                            </div>
                                       </div>
                                   </div>
                               )}
                           </div>

                           {/* Conditional Footer - NO input area for 'view' mode as requested */}
                           {drawerMode === 'test' && (
                               <div className="p-4 bg-white border-t border-gray-100">
                                   <InputArea onSendMessage={() => {}} mode="standard" placeholder="输入测试消息..." disableConfig={true} />
                                   <p className="text-[10px] text-center text-gray-300 mt-2">预览环境仅用于调试，对话内容不计入正式统计</p>
                               </div>
                           )}
                       </div>
                   </div>,
                   document.body
               )}
               {renderConsumptionModals()}
          </div>
      )
  }

  return (
    <div className="flex-1 h-full bg-[#FAFAFA] flex flex-col font-sans">
      {/* Header Breadcrumb area */}
      <div className="h-14 bg-white border-b border-gray-100 flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-2 text-sm text-gray-500">
             <div className="w-5 h-5 rounded bg-gray-400"></div>
             <span>崇启的空间</span>
             <ChevronRight size={14} className="text-gray-300 mx-1" />
             <span className="font-medium text-gray-900">智能体中心</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
        <div className="p-8">
            {/* Controls */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16}/>
                        <input 
                            type="text" 
                            placeholder="搜索智能体" 
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#55635C] outline-none text-sm transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 text-[#55635C] focus:ring-[#55635C]"
                            checked={onlyMyCreated}
                            onChange={(e) => setOnlyMyCreated(e.target.checked)}
                        />
                        <span className="text-sm text-gray-600">我创建的</span>
                    </label>
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-[#55635C] text-white rounded-lg hover:bg-[#444F49] text-sm font-medium shadow-sm transition-all">
                        <Plus size={16} /> 新建智能体
                    </button>
                </div>
            </div>

            {/* Grid - Matching MyContent style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAgents.map(agent => {
                    const statusConfig = getStatusConfig(agent.status);
                    return (
                    <div 
                        key={agent.id} 
                        onClick={() => setSelectedAgent(agent)} 
                        className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-lg hover:border-[#55635C]/30 transition-all cursor-pointer flex flex-col h-[200px] relative group shadow-sm"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 bg-gradient-to-br from-blue-50 to-indigo-50 text-[#55635C] border-blue-100 transition-transform group-hover:scale-105">
                                    <Bot size={20} />
                                </div>
                                
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate text-sm">{agent.name}</h3>
                                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                        <Box size={10} />
                                        <span className="truncate">{agent.space || '崇启的空间'}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-gray-300 hover:text-gray-500 p-1 -mr-2 -mt-2 transition-colors">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2 flex-1 leading-relaxed">
                            {agent.description}
                        </p>
                        
                        {/* Footer Meta */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs mt-auto">
                            <div className="text-gray-400 flex items-center gap-1">
                                <Clock size={12} />
                                <span>{agent.lastEditedBy || '崇启'} 最新编辑 {agent.lastEditedDate || '01-21'}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-gray-300 font-mono">v{agent.version}</span>
                                {statusConfig && (
                                    <span className={`px-1.5 py-0.5 rounded border text-[10px] font-medium ${statusConfig.className}`}>
                                        {statusConfig.label}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )})}
            </div>
        </div>
      </div>

      {/* Pagination - Refined style */}
      <div className="h-16 bg-white border-t border-gray-100 flex items-center justify-end px-8 gap-2 flex-shrink-0">
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded transition-colors">
              <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-sm text-gray-500 hover:bg-gray-50 rounded transition-colors">1</button>
          <span className="text-gray-300 text-sm mx-1 select-none">...</span>
          <button className="w-8 h-8 flex items-center justify-center text-sm bg-white border border-gray-200 text-[#55635C] font-bold rounded shadow-sm">5</button>
          <button className="w-8 h-8 flex items-center justify-center text-sm text-gray-500 hover:bg-gray-50 rounded transition-colors">6</button>
          <button className="w-8 h-8 flex items-center justify-center text-sm text-gray-500 hover:bg-gray-50 rounded transition-colors">7</button>
          <span className="text-gray-300 text-sm mx-1 select-none">...</span>
          <button className="w-8 h-8 flex items-center justify-center text-sm text-gray-500 hover:bg-gray-50 rounded transition-colors">10</button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded transition-colors">
              <ChevronRight size={16} />
          </button>
      </div>
    </div>
  );
};