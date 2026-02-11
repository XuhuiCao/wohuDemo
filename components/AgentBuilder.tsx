import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ChevronRight, 
  Activity, 
  Globe, 
  Smartphone,
  Plus,
  Maximize,
  Sliders,
  Bot,
  RotateCcw,
  Sparkles, 
  Image as ImageIcon,
  Video,
  Mic,
  Network,
  BookOpen,
  FileText,
  HardDrive,
  Database,
  Send,
  Store,
  LayoutGrid,
  Library,
  Box,
  GitBranch,
  ListTodo,
  MessageSquare,
  Server,
  Star,
  Download,
  Clock,
  Upload,
  Code,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Cpu,
  Timer,
  Search,
  ChevronLeft,
  FileCode,
  ArrowLeft,
  ExternalLink,
  Copy,
  Terminal,
  Layers,
  HelpCircle,
  MessageCircle,
  ArrowUp,
  Tag,
  Undo2,
  ChevronDown,
  History,
  User as UserIcon,
  CheckCircle,
  Info
} from 'lucide-react';
import { InputArea } from './InputArea';
import { Message, Skill, MCP, KnowledgeDoc, ViewState } from '../types';
import { OFFICIAL_SKILLS, MY_SKILLS, OFFICIAL_MCPS, MY_MCPS, MOCK_DOCS } from '../constants';

export interface AgentConfig {
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
}

interface AgentBuilderProps {
  onClose: () => void;
  isLoading?: boolean;
  initialConfig?: AgentConfig | null;
  onNavigate?: (view: ViewState) => void;
  onAiDevelop?: (prompt: string) => void;
  isEditMode?: boolean;
  agentNameDisplay?: string;
}

type Tab = 'preview' | 'logs' | 'deploy' | 'config';
type ConfigSubTab = 'skills' | 'mcp' | 'knowledge';
type ConsumptionTab = 'method' | 'basic';

const IconMap: Record<string, any> = {
    Bot: Bot,
    Image: ImageIcon,
    Video: Video,
    Mic: Mic,
    Network: Network,
    Globe: Globe,
    BookOpen: BookOpen,
    FileText: FileText,
    HardDrive: HardDrive,
    Database: Database,
    Send: Send,
    GitBranch: GitBranch,
    ListTodo: ListTodo,
    MessageSquare: MessageSquare,
    Server: Server
};

interface LogEntry {
  id: string;
  sessionId: string;
  userId: string;
  input: string;
  output: string;
  inputTokens: string;
  outputTokens: string;
  startTime: string;
  latency: string;
  endTime: string;
  duration: string;
  status: 'success' | 'failed';
}

const MOCK_LOGS: LogEntry[] = Array.from({ length: 15 }).map((_, i) => ({
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
    id: string; // hash
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
        version: 'v1.0.1',
        diffs: [
            {
                fileName: 'requirements.txt',
                additions: 2,
                deletions: 22,
                lines: [
                    { lineOld: 15, lineNew: 15, content: 'charset-normalizer==3.4.4', type: 'normal' },
                    { lineOld: 16, lineNew: 16, content: 'click==8.3.1', type: 'normal' },
                    { lineOld: 17, lineNew: 17, content: 'coverage==7.13.1', type: 'normal' },
                    { lineOld: 18, content: 'coze-coding-dev-sdk==0.5.9', type: 'del' },
                    { lineNew: 18, content: 'coze-coding-dev-sdk==0.5.6', type: 'add' },
                    { lineOld: 19, content: 'coze-coding-utils==0.2.4', type: 'del' },
                    { lineNew: 19, content: 'coze-coding-utils==0.2.2', type: 'add' },
                    { lineOld: 20, lineNew: 20, content: 'coze-workload-identity==0.1.4', type: 'normal' },
                    { lineOld: 21, lineNew: 21, content: 'cozeloop==0.1.21', type: 'normal' },
                    { lineOld: 22, lineNew: 22, content: 'cryptography==46.0.3', type: 'normal' },
                    { lineOld: 23, lineNew: 23, content: 'cssselect==1.3.0', type: 'normal' },
                    { lineOld: 24, lineNew: 24, content: 'dbus-python==1.3.2', type: 'normal' },
                    { lineOld: 25, content: 'deprecation==2.1.0', type: 'del' },
                    { lineOld: 26, lineNew: 25, content: 'dill==0.4.0', type: 'normal' },
                    { lineOld: 27, lineNew: 26, content: 'distro==1.9.0', type: 'normal' },
                    { lineOld: 28, lineNew: 27, content: 'docx2python==3.5.0', type: 'normal' },
                    { lineOld: 29, lineNew: 28, content: 'et_xmlfile==2.0.0', type: 'normal' },
                    { lineOld: 30, lineNew: 29, content: 'fastapi==0.121.2', type: 'normal' },
                    { lineOld: 31, content: 'fsspec==2026.2.0', type: 'del' },
                    { lineOld: 32, lineNew: 30, content: 'gitdb==4.0.12', type: 'normal' },
                ]
            }
        ]
    },
    { 
        id: '543a72e', 
        message: 'auto saved your changes before restore', 
        userId: '崇启', 
        time: '5 小时前',
        version: 'v1.0.0'
    },
    { 
        id: '1f5af1e', 
        message: 'auto saved your changes before deploy', 
        userId: '崇启', 
        time: '8 天前',
        version: 'v0.9.2'
    },
    { 
        id: '45cd236', 
        message: 'feat: 创建旅行规划大师 Agent，支持联网搜索获取实时旅游信息并提供个性化旅行建议', 
        userId: '崇启', 
        time: '12 天前',
        version: 'v0.9.1'
    },
    { 
        id: '6a1cd96', 
        message: 'Initial commit', 
        userId: '崇启', 
        time: '12 天前',
        version: 'v0.9.0'
    },
];

export const AgentBuilder: React.FC<AgentBuilderProps> = ({ onClose, isLoading = false, initialConfig, onNavigate, onAiDevelop, isEditMode = false, agentNameDisplay }) => {
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [configSubTab, setConfigSubTab] = useState<ConfigSubTab>('skills');
  const [consumptionTab, setConsumptionTab] = useState<ConsumptionTab>('method');
  
  // Config State
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState("gemini-3-flash-preview");
  const [agentName, setAgentName] = useState(agentNameDisplay || "新智能体");
  
  // Resource State
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [selectedMCPs, setSelectedMCPs] = useState<MCP[]>([]);
  const [selectedKnowledge, setSelectedKnowledge] = useState<KnowledgeDoc[]>([]);

  // Selector Modal State
  const [showSelector, setShowSelector] = useState(false);
  const [selectorType, setSelectorType] = useState<ConfigSubTab | null>(null);
  const [selectorTab, setSelectorTab] = useState<'official' | 'mine'>('official');
  const [previewItem, setPreviewItem] = useState<Skill | MCP | KnowledgeDoc | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Consumption Modals State
  const [showDingTalkModal, setShowDingTalkModal] = useState(false);
  const [showAntCodeModal, setShowAntCodeModal] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [debugChannel, setDebugChannel] = useState<'DingTalk' | 'AntCode' | null>(null);

  // ProCode Modal State
  const [showProCodeModal, setShowProCodeModal] = useState(false);
  const [proCodeEnName, setProCodeEnName] = useState("");
  const [proCodeCnName, setProCodeCnName] = useState("");

  // Version History state
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const versionTriggerRef = useRef<HTMLDivElement>(null);

  // Release Drawer State
  const [showReleaseDrawer, setShowReleaseDrawer] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState<'dev' | 'staging' | 'prod'>('dev');
  const [selectedSpace, setSelectedSpace] = useState('个人空间');
  const [releaseVersion, setReleaseVersion] = useState('v1.1.0');
  const [isDeployed, setIsDeployed] = useState(false);
  const [changeDesc, setChangeDesc] = useState(`基于当前配置自动生成变更：\n1. 更新了系统提示词以更好地支持多模态交互\n2. 优化了模型推理策略\n3. 新增了 2 项核心技能集成`);

  // Preview Mode State
  const [previewMode, setPreviewMode] = useState<'simulation' | 'debug'>('simulation');

  // Logs State
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  // Deploy State
  const [selectedDeployRecord, setSelectedDeployRecord] = useState<DeployRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update state when initialConfig provided and not loading
  useEffect(() => {
      if (!isLoading && initialConfig) {
          setSystemPrompt(initialConfig.systemPrompt);
          setAgentName(initialConfig.name);
          setProCodeCnName(initialConfig.name);
          if (initialConfig.model) setSelectedModel(initialConfig.model);
      }
  }, [isLoading, initialConfig]);
  
  // Preview Chat State
  const [previewMessages, setPreviewMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [previewMessages, previewMode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
        if (showVersionHistory && versionTriggerRef.current && !versionTriggerRef.current.contains(e.target as Node)) {
            setShowVersionHistory(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showVersionHistory]);

  const handlePreviewSend = (text: string) => {
      const userMsg: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: text,
          timestamp: Date.now()
      };
      setPreviewMessages(prev => [...prev, userMsg]);

      // Mock Response
      setTimeout(() => {
          const aiMsg: Message = {
              id: (Date.now() + 1).toString(),
              role: 'model',
              content: `这是智能体的预览回复。\n您输入了：${text}\n(当前为模拟调试模式)`,
              timestamp: Date.now()
          };
          setPreviewMessages(prev => [...prev, aiMsg]);
      }, 1000);
  };

  const toggleSkill = (skill: Skill) => {
      setSelectedSkills(prev => {
          const exists = prev.find(s => s.id === skill.id);
          return exists ? prev.filter(s => s.id !== skill.id) : [...prev, skill];
      });
  };

  const toggleMCP = (mcp: MCP) => {
      setSelectedMCPs(prev => {
          const exists = prev.find(m => m.id === mcp.id);
          return exists ? prev.filter(m => m.id !== mcp.id) : [...prev, mcp];
      });
  };

  const toggleKnowledge = (doc: KnowledgeDoc) => {
      setSelectedKnowledge(prev => {
          const exists = prev.find(d => d.id === doc.id);
          return exists ? prev.filter(d => d.id !== doc.id) : [...prev, doc];
      });
  };

  const openSelector = (type: ConfigSubTab) => {
      setSelectorType(type);
      setSelectorTab('official');
      setPreviewItem(null);
      setIsCreating(false);
      setShowSelector(true);
  };

  const handleCreateClick = () => {
      if (selectorType === 'skills') {
          setIsCreating(true);
          setPreviewItem(null);
      } else if (selectorType === 'mcp') {
          window.open('https://github.com/modelcontextprotocol', '_blank');
      } else if (selectorType === 'knowledge') {
          setShowSelector(false);
          if (onNavigate) {
              onNavigate(ViewState.MEMORY_CENTER);
          }
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          alert(`已上传技能文件: ${e.target.files[0].name}`);
          setIsCreating(false);
      }
  };

  const handleAiDev = () => {
      setShowSelector(false);
      if (onAiDevelop) {
          onAiDevelop("开发技能：");
      }
  };

  const handleDeploy = () => {
      const envName = selectedEnv === 'dev' ? '开发环境' : selectedEnv === 'staging' ? '预发环境' : '生产环境';
      alert(`已开始在 ${envName} 部署版本 ${releaseVersion}！`);
      setIsDeployed(true);
  };

  const handleUpgradeToProCode = () => {
      // Simulate upgrade and redirect to agent center detail
      alert(`智能体 "${proCodeCnName}" 已成功升级为 ProCode 模式。`);
      setShowProCodeModal(false);
      if (onNavigate) {
          onNavigate(ViewState.AGENT_CENTER);
      }
  };

  const renderContent = () => {
    switch(activeTab) {
        case 'preview':
            return (
                 <div className="flex h-full overflow-hidden">
                    {/* Left: Chat Preview Area */}
                    <div className="flex-1 flex flex-col bg-[#FAFAFA] relative border-r border-gray-200">
                        {/* Simulation / Debug Toggle */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-sm p-1 rounded-lg flex text-xs font-medium shadow-sm border border-gray-200">
                            <button
                                onClick={() => setPreviewMode('simulation')}
                                className={`px-4 py-1.5 rounded-md transition-all ${previewMode === 'simulation' ? 'bg-[#55635C] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                            >
                                模拟
                            </button>
                            <button
                                onClick={() => setPreviewMode('debug')}
                                className={`px-4 py-1.5 rounded-md transition-all ${previewMode === 'debug' ? 'bg-[#55635C] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                            >
                                调试
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pt-16">
                            {previewMessages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 select-none">
                                    <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center text-xs text-center p-2 mb-6 cursor-pointer hover:bg-gray-300 transition-colors shadow-inner">
                                        <span className="leading-relaxed text-gray-500 font-medium">自动生成<br/>智能体头像</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">分配任务或向我咨询任何问题吧~</p>
                                </div>
                            ) : (
                                <div className={`space-y-6 ${previewMode === 'debug' ? 'max-w-2xl mx-auto' : ''}`}>
                                    {previewMessages.map((msg, index) => {
                                        if (previewMode === 'simulation') {
                                            // Simulation Mode (Classic Chat)
                                            return (
                                                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    {msg.role === 'model' && (
                                                        <div className="w-8 h-8 rounded-full bg-[#55635C] flex items-center justify-center text-white mt-1 flex-shrink-0 shadow-sm">
                                                            <Bot size={16} />
                                                        </div>
                                                    )}
                                                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[85%] shadow-sm ${
                                                        msg.role === 'user' 
                                                        ? 'bg-[#55635C] text-white rounded-tr-sm' 
                                                        : 'bg-white border border-gray-100 text-gray-800'
                                                    }`}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            // Debug Mode (Trace View)
                                            return (
                                                <div key={msg.id} className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                    {msg.role === 'user' ? (
                                                         <div className="flex flex-col items-end">
                                                            <span className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider mr-1">User Input</span>
                                                            <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm text-sm text-gray-800 max-w-full">
                                                                 {msg.content}
                                                            </div>
                                                         </div>
                                                    ) : (
                                                        <div className="flex flex-col items-start w-full mt-4">
                                                             <span className="text-[10px] font-bold text-blue-500 mb-1.5 uppercase tracking-wider ml-1 flex items-center gap-1">
                                                                <Bot size={12}/> Agent Trace
                                                             </span>
                                                             <div className="w-full bg-[#F8F9FA] rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                                                 {/* Trace Header */}
                                                                 <div className="px-4 py-2 bg-white border-b border-gray-200 flex justify-between items-center">
                                                                     <span className="text-[10px] font-mono text-gray-400">ID: {msg.id}</span>
                                                                     <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-1"><Star size={10}/> Completed</span>
                                                                 </div>
                                                                 
                                                                 {/* Trace Body */}
                                                                 <div className="p-4 space-y-5">
                                                                     {/* Step 1: Thinking */}
                                                                     <div className="flex gap-3">
                                                                         <div className="flex flex-col items-center">
                                                                             <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-100"></div>
                                                                             <div className="w-px h-full bg-gray-200 my-1"></div>
                                                                         </div>
                                                                         <div className="flex-1 pb-2">
                                                                             <div className="text-xs font-bold text-gray-700 mb-1">Thinking Process</div>
                                                                             <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs font-mono text-gray-500 leading-relaxed shadow-sm">
                                                                                 Thinking...<br/>
                                                                                 User Query: "{previewMessages[index - 1]?.content.substring(0, 30)}..."<br/>
                                                                                 Intent: General conversation.<br/>
                                                                                 Strategy: Provide direct answer based on system prompt.
                                                                             </div>
                                                                         </div>
                                                                     </div>

                                                                     {/* Step 2: Action (Optional based on content) */}
                                                                     <div className="flex gap-3">
                                                                         <div className="flex flex-col items-center">
                                                                             <div className="w-2.5 h-2.5 rounded-full bg-orange-400 ring-4 ring-orange-100"></div>
                                                                             <div className="w-px h-full bg-gray-200 my-1"></div>
                                                                         </div>
                                                                         <div className="flex-1 pb-2">
                                                                             <div className="text-xs font-bold text-gray-700 mb-1">Tool Execution</div>
                                                                             <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs font-mono text-gray-500 shadow-sm">
                                                                                <span className="text-orange-600 font-bold">No Tool Called</span><br/>
                                                                                Direct response generated.
                                                                             </div>
                                                                         </div>
                                                                     </div>

                                                                     {/* Step 3: Output */}
                                                                     <div className="flex gap-3">
                                                                         <div className="flex flex-col items-center">
                                                                             <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-green-100"></div>
                                                                         </div>
                                                                         <div className="flex-1">
                                                                             <div className="text-xs font-bold text-gray-700 mb-1">Final Response</div>
                                                                             <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-800 shadow-sm leading-relaxed">
                                                                                 {msg.content}
                                                                             </div>
                                                                         </div>
                                                                     </div>
                                                                 </div>
                                                             </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-gray-200">
                             <InputArea 
                                onSendMessage={handlePreviewSend} 
                                mode="standard" 
                                placeholder="在此测试智能体效果..."
                                disableConfig={true}
                            />
                        </div>
                    </div>

                    {/* Right: Config Panel (Fixed width within flex container) */}
                    <div className="w-[400px] bg-white flex flex-col h-full overflow-hidden flex-shrink-0 shadow-[ -4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 relative">
                         {isLoading && (
                             <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                                 <div className="relative">
                                     <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                                     <div className="absolute inset-0 flex items-center justify-center">
                                         <Sparkles size={16} className="text-brand-600 animate-pulse"/>
                                     </div>
                                 </div>
                                 <div className="text-center">
                                     <h3 className="text-sm font-bold text-gray-800 mb-1">正在构建智能体</h3>
                                     <p className="text-xs text-gray-500">正在解析需求并生成配置...</p>
                                 </div>
                             </div>
                         )}

                         <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
                            {/* Header inside Panel */}
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    配置信息
                                </label>
                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors" title="重置配置">
                                    <RotateCcw size={14}/>
                                </button>
                            </div>

                            {/* Model Config */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wide">模型</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative group">
                                        <select 
                                            value={selectedModel}
                                            onChange={(e) => setSelectedModel(e.target.value)}
                                            className="w-full appearance-none p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#55635C] focus:ring-1 focus:ring-[#55635C] transition-all text-gray-700 pr-8 shadow-sm group-hover:border-gray-300"
                                        >
                                            <option value="gemini-3-flash-preview">Claude Sonnet 3.5</option>
                                            <option value="gemini-3-pro-preview">Gemini 3.0 Pro</option>
                                            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                        </select>
                                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={14}/>
                                    </div>
                                    <button className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-800 font-medium whitespace-nowrap flex items-center gap-1 transition-colors">
                                        <Sliders size={14}/>
                                    </button>
                                </div>
                            </div>

                            {/* System Prompt */}
                            <div className="flex-1 flex flex-col min-h-[400px]">
                                <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wide">系统提示词</label>
                                <div className="relative group flex-1 flex flex-col h-full">
                                    <textarea 
                                        className="w-full flex-1 p-4 border border-gray-200 rounded-xl text-sm focus:border-[#55635C] focus:ring-1 focus:ring-[#55635C] outline-none resize-none bg-gray-50/50 leading-relaxed text-gray-700 custom-scrollbar font-mono text-[13px] shadow-inner transition-colors h-[400px]"
                                        value={systemPrompt}
                                        onChange={(e) => setSystemPrompt(e.target.value)}
                                        placeholder="输入提示词，定义智能体的行为..."
                                    />
                                    <button className="absolute right-3 bottom-3 p-1.5 bg-white border border-gray-200 rounded-md shadow-sm text-gray-400 hover:text-[#55635C] opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Maximize size={14}/>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Skills / MCP / KB Tabs */}
                            <div className="pt-2">
                                <div className="flex items-center gap-6 border-b border-gray-100 mb-4">
                                    <button 
                                        onClick={() => setConfigSubTab('skills')}
                                        className={`text-xs font-bold pb-2 -mb-[1px] transition-colors ${configSubTab === 'skills' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-400 hover:text-gray-600 border-transparent'}`}
                                    >
                                        Skills
                                    </button>
                                    <button 
                                        onClick={() => setConfigSubTab('mcp')}
                                        className={`text-xs font-bold pb-2 -mb-[1px] transition-colors ${configSubTab === 'mcp' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-400 hover:text-gray-600 border-transparent'}`}
                                    >
                                        MCP
                                    </button>
                                    <button 
                                        onClick={() => setConfigSubTab('knowledge')}
                                        className={`text-xs font-bold pb-2 -mb-[1px] transition-colors ${configSubTab === 'knowledge' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-400 hover:text-gray-600 border-transparent'}`}
                                    >
                                        知识库
                                    </button>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    <button 
                                        onClick={() => openSelector(configSubTab)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-dashed border-gray-300 rounded-md text-xs text-gray-500 hover:border-[#55635C] hover:text-[#55635C] transition-colors hover:bg-gray-50"
                                    >
                                        <Plus size={14}/> 添加{configSubTab === 'skills' ? '技能' : configSubTab === 'mcp' ? '工具' : '知识'}
                                    </button>
                                    
                                    {configSubTab === 'skills' && selectedSkills.map(skill => (
                                        <div key={skill.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-700 group cursor-default shadow-sm">
                                            {skill.name}
                                            <button onClick={() => toggleSkill(skill)} className="text-blue-400 hover:text-blue-600 transition-colors ml-1"><X size={12}/></button>
                                        </div>
                                    ))}

                                    {configSubTab === 'mcp' && selectedMCPs.map(mcp => (
                                        <div key={mcp.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-md text-xs text-purple-700 group cursor-default shadow-sm">
                                            {mcp.name}
                                            <button onClick={() => toggleMCP(mcp)} className="text-purple-400 hover:text-purple-600 transition-colors ml-1"><X size={12}/></button>
                                        </div>
                                    ))}

                                    {configSubTab === 'knowledge' && selectedKnowledge.map(doc => (
                                        <div key={doc.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-md text-xs text-orange-700 group cursor-default shadow-sm">
                                            {doc.title}
                                            <button onClick={() => toggleKnowledge(doc)} className="text-orange-400 hover:text-orange-600 transition-colors ml-1"><X size={12}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                         </div>
                    </div>
                 </div>
            )
        case 'logs': return (
            <div className="h-full flex flex-col bg-white relative">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead className="bg-gray-50 sticky top-0 z-10 text-xs font-semibold text-gray-500">
                            <tr>
                                <th className="p-3 whitespace-nowrap border-b border-gray-200 w-10"></th>
                                <th className="p-3 whitespace-nowrap border-b border-gray-200">Trace ID</th>
                                <th className="p-3 whitespace-nowrap border-b border-gray-200">会话 ID</th>
                                <th className="p-3 whitespace-nowrap border-b border-gray-200">用户 ID</th>
                                <th className="p-3 whitespace-nowrap border-b border-gray-200 max-w-[200px]">用户输入</th>
                                <th className="p-3 whitespace-nowrap border-b border-gray-200 max-w-[200px]">输出</th>
                                <th className="p-3 whitespace-nowrap border-b border-gray-200 text-right">模型输入 Token</th>
                                <th className="p-3 whitespace-nowrap border-b border-gray-200 text-right">模型输出 Token</th>
                                <th className="p-3 whitespace-nowrap border-b border-gray-200">开始时间</th>
                                <th className="p-3 whitespace-nowrap border-b border-gray-200 text-right">延迟</th>
                                <th className="p-3 whitespace-nowrap border-b border-gray-200">结束时间</th>
                                <th className="p-3 whitespace-nowrap border-b border-gray-200 text-right">整体耗时</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs text-gray-700">
                            {MOCK_LOGS.map((log) => (
                                <tr 
                                    key={log.id} 
                                    onClick={() => setSelectedLog(log)} 
                                    className={`hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors ${selectedLog?.id === log.id ? 'bg-blue-50/50' : ''}`}
                                >
                                    <td className="p-3">
                                        {log.status === 'success' ? (
                                            <CheckCircle2 size={16} className="text-green-500"/>
                                        ) : (
                                            <AlertCircle size={16} className="text-red-500"/>
                                        )}
                                    </td>
                                    <td className="p-3 font-mono text-gray-500">{log.id}</td>
                                    <td className="p-3 font-mono text-gray-500">{log.sessionId}</td>
                                    <td className="p-3 font-mono text-gray-500">{log.userId}</td>
                                    <td className="p-3 truncate max-w-[200px]" title={log.input}>{log.input}</td>
                                    <td className="p-3 truncate max-w-[200px]" title={log.output}>{log.output}</td>
                                    <td className="p-3 text-right font-mono">{log.inputTokens}</td>
                                    <td className="p-3 text-right font-mono">{log.outputTokens}</td>
                                    <td className="p-3 whitespace-nowrap">{log.startTime}</td>
                                    <td className="p-3 text-right font-mono">{log.latency}</td>
                                    <td className="p-3 whitespace-nowrap">{log.endTime}</td>
                                    <td className="p-3 text-right font-mono">{log.duration}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {selectedLog && (
                    <div className="absolute inset-y-0 right-0 w-[600px] bg-white shadow-2xl border-l border-gray-200 z-20 flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
                             <div className="flex items-center gap-3">
                                 <h3 className="font-bold text-gray-800 text-lg">Trace 详情</h3>
                                 <span className="font-mono text-xs text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">{selectedLog.id}</span>
                             </div>
                             <button onClick={() => setSelectedLog(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"><X size={20}/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-[#F8F9FA]">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-2"><Clock size={12}/> 整体耗时</div>
                                    <div className="text-lg font-bold text-gray-800">{selectedLog.duration}</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-2"><Cpu size={12}/> 总 Token</div>
                                    <div className="text-lg font-bold text-gray-800">5,472</div>
                                </div>
                            </div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-1">执行链路</h4>
                            <div className="space-y-6">
                                 <div className="flex gap-4">
                                     <div className="flex flex-col items-center pt-1">
                                         <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 border border-gray-300 shadow-sm z-10">
                                            <MessageSquare size={14}/>
                                         </div>
                                         <div className="w-px h-full bg-gray-200 my-1"></div>
                                     </div>
                                     <div className="flex-1 pb-4">
                                         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                             <div className="text-xs font-bold text-gray-900 mb-2">User Input</div>
                                             <div className="text-sm text-gray-700 leading-relaxed">{selectedLog.input}</div>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="flex gap-4">
                                     <div className="flex flex-col items-center pt-1">
                                         <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 shadow-sm z-10">
                                            <Activity size={14}/>
                                         </div>
                                         <div className="w-px h-full bg-gray-200 my-1"></div>
                                     </div>
                                     <div className="flex-1 pb-4">
                                         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                             <div className="text-xs font-bold text-gray-900 mb-2 flex justify-between">
                                                <span>Reasoning</span>
                                                <span className="text-gray-400 font-normal">1.2s</span>
                                             </div>
                                             <div className="text-xs font-mono text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                 Analyze request intention...<br/>
                                                 Determine domain: {selectedLog.id.slice(0,2) === '75' ? 'Coding' : 'General'}<br/>
                                                 Retrieve relevant context from memory...
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="flex gap-4">
                                     <div className="flex flex-col items-center pt-1">
                                         <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 border border-green-200 shadow-sm z-10">
                                            <CheckCircle2 size={14}/>
                                         </div>
                                     </div>
                                     <div className="flex-1">
                                         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                             <div className="text-xs font-bold text-gray-900 mb-2">Final Response</div>
                                             <div className="text-sm text-gray-700 leading-relaxed">{selectedLog.output}</div>
                                         </div>
                                     </div>
                                 </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
        case 'deploy': {
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
                         <div className="flex-1 overflow-y-auto p-6">
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
                <div className="p-6 h-full flex flex-col bg-white">
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
                    <div className="relative border-l border-gray-200 ml-3 space-y-4 pl-8 py-2 flex-1 overflow-y-auto">
                        {MOCK_DEPLOY_RECORDS.map((record, idx) => (
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
        }
        case 'config': {
            return (
                <div className="h-full flex flex-col bg-white overflow-hidden">
                    {/* Sub-Tabs Header */}
                    <div className="flex items-center gap-8 px-6 border-b border-gray-100 shrink-0">
                        <button 
                            onClick={() => setConsumptionTab('method')}
                            className={`py-3 text-sm font-bold border-b-2 transition-all ${consumptionTab === 'method' ? 'border-[#55635C] text-[#55635C]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            消费方式
                        </button>
                        <button 
                            onClick={() => setConsumptionTab('basic')}
                            className={`py-3 text-sm font-bold border-b-2 transition-all ${consumptionTab === 'basic' ? 'border-[#55635C] text-[#55635C]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            基础配置
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {consumptionTab === 'method' ? (
                            <div className="p-6 space-y-8">
                                {/* Consumption Channels */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Layers size={16}/> 消费渠道
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* DingTalk */}
                                        <div className="p-4 border border-gray-200 rounded-xl bg-white hover:border-[#55635C]/50 transition-all cursor-pointer group shadow-sm hover:shadow-md flex flex-col">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                                                        <Smartphone size={20}/>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">钉钉机器人</div>
                                                        <div className="text-xs text-gray-400">在钉钉群内通过机器人交互</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mt-auto">
                                                <button 
                                                    onClick={() => setShowDingTalkModal(true)}
                                                    className="py-1.5 text-xs text-[#55635C] border border-[#55635C]/20 rounded-lg hover:bg-[#55635C] hover:text-white transition-all font-medium"
                                                >
                                                    配置机器人
                                                </button>
                                                <button 
                                                    onClick={() => { setDebugChannel('DingTalk'); setShowDebugModal(true); }}
                                                    className="py-1.5 text-xs text-[#55635C] border border-[#55635C]/20 rounded-lg hover:bg-[#55635C] hover:text-white transition-all font-medium flex items-center justify-center gap-1"
                                                >
                                                    <MessageSquare size={12}/> 调试
                                                </button>
                                            </div>
                                        </div>

                                        {/* AntCode */}
                                        <div className="p-4 border border-gray-200 rounded-xl bg-white hover:border-[#55635C]/50 transition-all cursor-pointer group shadow-sm hover:shadow-md flex flex-col">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-700">
                                                        <GitBranch size={20}/>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">AntCode 插件</div>
                                                        <div className="text-xs text-gray-400">作为 IDE 或 代码评审工具使用</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mt-auto">
                                                <button 
                                                    onClick={() => setShowAntCodeModal(true)}
                                                    className="py-1.5 text-xs text-[#55635C] border border-[#55635C]/20 rounded-lg hover:bg-[#55635C] hover:text-white transition-all font-medium"
                                                >
                                                    配置插件
                                                </button>
                                                <button 
                                                    onClick={() => { setDebugChannel('AntCode'); setShowDebugModal(true); }}
                                                    className="py-1.5 text-xs text-[#55635C] border border-[#55635C]/20 rounded-lg hover:bg-[#55635C] hover:text-white transition-all font-medium flex items-center justify-center gap-1"
                                                >
                                                    <MessageSquare size={12}/> 调试
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* HTTP API Guidance */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <Terminal size={16}/> HTTP API
                                        </h3>
                                        <a href="https://web.postman.co" target="_blank" className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                                            <ExternalLink size={12}/> Postman 测试链接
                                        </a>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 bg-gray-800 text-gray-400 hover:text-white rounded transition-colors"><Copy size={14}/></button>
                                        </div>
                                        <div className="p-4 bg-gray-900 text-gray-300 rounded-xl font-mono text-[11px] overflow-x-auto border border-gray-800 leading-loose shadow-inner">
                                            <span className="text-gray-500"># 使用 cURL 直接调用</span><br/>
                                            curl -X POST https://api.wohu.ai/v1/chat \<br/>
                                            &nbsp;&nbsp;-H "Authorization: Bearer sk-your-key" \<br/>
                                            &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
                                            &nbsp;&nbsp;-d '<span className="text-green-400">{"message": "你好", "agent_id": "wohu-123"}</span>'
                                        </div>
                                    </div>
                                </div>

                                {/* SDK Guidance */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Code size={16}/> SDK 使用引导
                                    </h3>
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
                            <div className="p-6 space-y-6">
                                {/* ProCode Upgrade Banner */}
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Info size={18}/>
                                        </div>
                                        <p className="text-[13px] text-blue-700 font-medium">
                                            当前模式构建的智能体代码文件仅可读，若需高度自定义编码可升级为 ProCode 模式。
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setShowProCodeModal(true)}
                                        className="text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                                    >
                                        升级为 ProCode <ChevronRight size={14}/>
                                    </button>
                                </div>

                                {/* Basic Properties First */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-4">基础属性</h3>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                                        <div className="col-span-2 space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">智能体名称</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    value={agentName}
                                                    onChange={(e) => setAgentName(e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#55635C] outline-none transition-shadow"
                                                    placeholder="请输入智能体名称"
                                                />
                                                <button 
                                                    onClick={() => alert('保存成功')}
                                                    className="px-4 py-2 bg-[#55635C] text-white rounded-lg text-[10px] font-bold hover:bg-[#444F49] transition-colors shadow-sm"
                                                >
                                                    保存
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Agent ID</label>
                                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-700 flex items-center min-h-[34px]">wohu-75421-a3</div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">所属组织</label>
                                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 flex items-center min-h-[34px]">个人空间</div>
                                        </div>
                                    </div>
                                </div>

                                {/* API Key Management Second */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-4">API Key 管理</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white rounded border border-gray-200 flex items-center justify-center text-gray-400 font-mono text-[10px]">SK</div>
                                                <div>
                                                    <div className="text-xs font-bold text-gray-800">Production Key</div>
                                                    <div className="text-[10px] text-gray-400 font-mono">sk-••••••••••••••••3a2f</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="p-1.5 text-gray-400 hover:text-gray-600"><Copy size={14}/></button>
                                                <button className="p-1.5 text-gray-400 hover:text-red-500"><RotateCcw size={14}/></button>
                                            </div>
                                        </div>
                                        <button className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-[#55635C] hover:text-[#55635C] transition-all flex items-center justify-center gap-2">
                                            <Plus size={14}/> 创建新的 API Key
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
    }
  }

  const renderSelector = () => {
      let itemsToDisplay: any[] = [];
      let toggleFunc: (item: any) => void = () => {};
      let selectedList: any[] = [];
      let typeLabel = '';
      
      if (selectorType === 'skills') {
          itemsToDisplay = selectorTab === 'official' ? OFFICIAL_SKILLS : MY_SKILLS;
          toggleFunc = toggleSkill;
          selectedList = selectedSkills;
          typeLabel = '技能';
      } else if (selectorType === 'mcp') {
          itemsToDisplay = selectorTab === 'official' ? OFFICIAL_MCPS : MY_MCPS;
          toggleFunc = toggleMCP;
          selectedList = selectedMCPs;
          typeLabel = 'MCP';
      } else if (selectorType === 'knowledge') {
          itemsToDisplay = MOCK_DOCS;
          toggleFunc = toggleKnowledge;
          selectedList = selectedKnowledge;
          typeLabel = '知识';
      }

      const renderDetailPanel = () => {
        if (!previewItem) return null;
        // @ts-ignore - Dynamic icon handling
        const Icon = IconMap[previewItem.icon] || (selectorType === 'knowledge' ? FileText : Box);
        const isSelected = selectedList.some(s => s.id === previewItem.id);
        const mockInfo = {
            version: 'v1.0.2',
            updated: '2天前',
            downloads: '1.2k',
            // @ts-ignore
            author: previewItem.author || 'Wohu Official',
            // @ts-ignore
            title: previewItem.name || previewItem.title,
            // @ts-ignore
            description: previewItem.description || `来源: ${(previewItem as KnowledgeDoc).source}`
        };
    
        return (
            <div className="w-80 h-full bg-gray-50 border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-200 z-10 shrink-0">
                <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                    <span className="font-bold text-gray-800 text-sm">详情</span>
                    <button onClick={() => setPreviewItem(null)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                     <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 mb-3">
                              <Icon size={32} />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 leading-tight px-2">{mockInfo.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">{mockInfo.author}</p>
                     </div>
                     <button 
                        onClick={() => { toggleFunc(previewItem); }}
                        className={`w-full py-2.5 rounded-lg text-xs font-bold transition-colors shadow-sm ${isSelected ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-[#55635C] text-white hover:bg-[#444F49]'}`}
                     >
                        {isSelected ? '移除此项' : '添加此项'}
                     </button>
                     <div>
                         <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">简介</h4>
                         <p className="text-xs text-gray-600 leading-relaxed bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                            {mockInfo.description || "暂无详细描述。该项功能可以帮助您完成特定的任务，提高工作效率。"}
                         </p>
                     </div>
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
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${!isCreating && selectorTab === 'official' ? 'bg-blue-50 text-brand-600 font-medium' : 'text-gray-600 border-transparent hover:text-gray-900'}`}
                        >
                            <Library size={18} className={!isCreating && selectorTab === 'official' ? 'text-brand-600' : 'text-gray-400'} /> 
                            官方{typeLabel}
                        </button>
                        <button 
                            onClick={() => { setSelectorTab('mine'); setIsCreating(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${!isCreating && selectorTab === 'mine' ? 'bg-blue-50 text-brand-600 font-medium' : 'text-gray-600 border-transparent hover:text-gray-900'}`}
                        >
                            <LayoutGrid size={18} className={!isCreating && selectorTab === 'mine' ? 'text-brand-600' : 'text-gray-400'} /> 
                            我的{typeLabel}
                        </button>
                    </div>
                </div>
                <div className="flex-1 flex min-w-0">
                    {isCreating ? (
                         <div className="flex-1 flex flex-col">
                             <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white flex-shrink-0">
                                 <h3 className="text-sm font-bold text-gray-800">技能列表</h3>
                                 <button onClick={() => setShowSelector(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                     <X size={20} />
                                 </button>
                             </div>
                             <div className="flex-1 p-8 flex items-center justify-center bg-white">
                                 <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50/50">
                                     <div className="w-16 h-16 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-6 shadow-sm">
                                         <Plus size={32} className="text-gray-400" />
                                     </div>
                                     <h3 className="text-gray-900 font-bold mb-8 text-lg">暂无我的技能</h3>
                                     <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                                     <div className="flex gap-6">
                                         <button onClick={() => fileInputRef.current?.click()} className="px-8 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"><Upload size={16}/> 本地上传</button>
                                         <button onClick={handleAiDev} className="px-8 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"><Code size={16}/> AI 开发</button>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    ) : (
                        <>
                            <div className="flex-1 flex flex-col min-w-0">
                                <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white flex-shrink-0">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">已选 <span className="font-bold text-[#55635C]">{selectedList.length}</span>/50</div>
                                    <button onClick={() => setShowSelector(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
                                    <div className="space-y-4">
                                        {itemsToDisplay.map(item => {
                                            const Icon = IconMap[item.icon] || (selectorType === 'knowledge' ? FileText : Box);
                                            const isSelected = selectedList.some(s => s.id === item.id);
                                            const title = item.name || item.title;
                                            const desc = item.description || `大小: ${item.size} • 来源: ${item.source}`;
                                            const isPreviewing = previewItem?.id === item.id;
                                            return (
                                                <div key={item.id} onClick={() => setPreviewItem(item)} className={`flex items-center justify-between p-4 rounded-xl border transition-all group cursor-pointer ${isPreviewing ? 'border-[#55635C] bg-gray-50 shadow-sm' : 'border-gray-100 hover:shadow-md hover:border-gray-200'}`}>
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'} group-hover:scale-105 transition-transform`}><Icon size={24} /></div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-bold text-gray-800 text-sm mb-1 truncate">{title}</h4>
                                                            <p className="text-xs text-gray-500 truncate">{desc}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={(e) => { e.stopPropagation(); toggleFunc(item); }} className={`ml-4 px-4 py-2 rounded-lg text-xs font-medium transition-all shrink-0 ${isSelected ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-white border border-gray-200 text-gray-700 hover:border-[#55635C] hover:text-[#55635C] shadow-sm'}`}>{isSelected ? '已添加' : '添加'}</button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end shrink-0"><button className="flex items-center gap-1 text-xs text-blue-600 hover:underline"><Store size={14} /> 前往资产市场发现更多{typeLabel}</button></div>
                            </div>
                            {renderDetailPanel()}
                        </>
                    )}
                </div>
            </div>
        </div>
      )
  }

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
                                        <code className="text-xs text-gray-500 break-all Fish-relaxed flex-1 font-mono">
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

  const renderProCodeModal = () => {
      if (!showProCodeModal) return null;
      return createPortal(
          <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl w-[500px] p-8 animate-in zoom-in-95 duration-200 relative">
                  <button onClick={() => setShowProCodeModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">升级为 ProCode 模式</h2>
                  <p className="text-sm text-gray-500 leading-relaxed mb-8">
                      将当前模式构建的智能体升级为 ProCode 模式，将支持用户高度自定义编码。但升级后，将仅支持编码修改发布，不可回退至当前模式。
                  </p>
                  
                  <div className="space-y-6 mb-10">
                      <div className="space-y-2">
                          <label className="text-sm text-gray-700 font-medium flex items-center gap-1">
                              <span className="text-red-500">*</span>智能体英文名称
                          </label>
                          <input 
                              value={proCodeEnName}
                              onChange={(e) => setProCodeEnName(e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#55635C] outline-none"
                              placeholder="默认代入支持修改"
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm text-gray-700 font-medium flex items-center gap-1">
                              <span className="text-red-500">*</span>智能体中文名称
                          </label>
                          <input 
                              value={proCodeCnName}
                              onChange={(e) => setProCodeCnName(e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#55635C] outline-none"
                              placeholder="默认代入支持修改"
                          />
                      </div>
                  </div>

                  <div className="flex justify-end gap-4">
                      <button 
                        onClick={() => setShowProCodeModal(false)}
                        className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                          取消
                      </button>
                      <button 
                        onClick={handleUpgradeToProCode}
                        className="px-8 py-2 bg-[#55635C] text-white rounded-lg text-sm font-bold hover:bg-[#444F49] shadow-md transition-all"
                      >
                          升级
                      </button>
                  </div>
              </div>
          </div>,
          document.body
      );
  };

  const renderReleaseDrawer = () => {
    if (!showReleaseDrawer) return null;

    return createPortal(
        <div className="fixed inset-0 z-[300] flex justify-end bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-300">
            <div 
                className="w-[850px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button Inside Drawer Top Left */}
                <button 
                    onClick={() => setShowReleaseDrawer(false)}
                    className="absolute left-6 top-4 p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all z-10"
                >
                    <X size={20} />
                </button>

                {/* Header Actions */}
                <div className="h-16 flex items-center justify-between px-20 border-b border-gray-100 bg-white shrink-0">
                    <h2 className="text-lg font-bold text-gray-800">智能体部署发布</h2>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowReleaseDrawer(false)}
                            className="px-6 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            取消发布
                        </button>
                        <button 
                            onClick={handleDeploy}
                            className="px-6 py-2 bg-[#55635C] text-white rounded-lg text-sm font-medium hover:bg-[#444F49] shadow-sm transition-all flex items-center gap-2"
                        >
                            {selectedEnv === 'dev' ? '部署开发' : selectedEnv === 'staging' ? '部署预发' : '部署生产'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
                    {/* Environments Section */}
                    <div className="grid grid-cols-3 gap-4">
                        <div 
                            onClick={() => setSelectedEnv('dev')}
                            className={`p-6 rounded-xl border-2 transition-all cursor-pointer relative ${selectedEnv === 'dev' ? 'border-[#55635C] bg-[#55635C]/5 shadow-md' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                        >
                            <div className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">开发环境</div>
                            <div className="flex flex-col gap-2">
                                <span className="inline-flex items-center w-fit px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold">已部署</span>
                                <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-1">
                                    <UserIcon size={12}/> 崇启
                                </div>
                                <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                                    <Clock size={12}/> 21 小时前
                                </div>
                            </div>
                            {selectedEnv === 'dev' && <div className="absolute top-2 right-2"><CheckCircle size={16} className="text-[#55635C] fill-[#55635C]/10"/></div>}
                        </div>

                        <div 
                            onClick={() => setSelectedEnv('staging')}
                            className={`p-6 rounded-xl border-2 transition-all cursor-pointer relative ${selectedEnv === 'staging' ? 'border-[#55635C] bg-[#55635C]/5 shadow-md' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                        >
                            <div className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">预发环境</div>
                            <div className="flex flex-col gap-2 h-full">
                                <span className="inline-flex items-center w-fit px-2 py-0.5 rounded bg-gray-200 text-gray-500 text-[10px] font-bold">未部署</span>
                            </div>
                            {selectedEnv === 'staging' && <div className="absolute top-2 right-2"><CheckCircle size={16} className="text-[#55635C] fill-[#55635C]/10"/></div>}
                        </div>

                        <div 
                            onClick={() => setSelectedEnv('prod')}
                            className={`p-6 rounded-xl border-2 transition-all cursor-pointer relative ${selectedEnv === 'prod' ? 'border-[#55635C] bg-[#55635C]/5 shadow-md' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                        >
                            <div className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">生产环境</div>
                            <div className="flex flex-col gap-2">
                                <span className="inline-flex items-center w-fit px-2 py-0.5 rounded bg-gray-200 text-gray-500 text-[10px] font-bold">未部署</span>
                            </div>
                            {selectedEnv === 'prod' && <div className="absolute top-2 right-2"><CheckCircle size={16} className="text-[#55635C] fill-[#55635C]/10"/></div>}
                        </div>
                    </div>

                    {/* Version Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-800 flex items-center gap-1">
                            <span className="text-red-500">*</span>版本号
                        </label>
                        <div className="max-w-sm">
                            <input 
                                type="text"
                                value={releaseVersion}
                                onChange={(e) => setReleaseVersion(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#55635C] hover:border-gray-300 transition-colors"
                                placeholder="例如 v1.1.0"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">默认推荐版本号比当前已发布版本 (v1.0.0) 高一个次版本。</p>
                        </div>
                    </div>

                    {/* Attribution Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-800 flex items-center gap-1">
                            <span className="text-red-500">*</span>归属空间
                        </label>
                        <div className="relative group max-w-sm">
                            <select 
                                value={selectedSpace}
                                onChange={(e) => setSelectedSpace(e.target.value)}
                                className="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#55635C] pr-10 hover:border-gray-300 transition-colors"
                            >
                                <option value="个人空间">默认个人空间，支持切换</option>
                                <option value="团队空间 A">研发团队 A</option>
                                <option value="数据组">数据分析组</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600"/>
                        </div>
                    </div>

                    {/* Change Description Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-800">变更说明</label>
                        <textarea 
                            value={changeDesc}
                            onChange={(e) => setChangeDesc(e.target.value)}
                            readOnly={isDeployed}
                            className={`w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm leading-relaxed text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#55635C] resize-none custom-scrollbar transition-all ${isDeployed ? 'bg-gray-100 cursor-not-allowed opacity-80' : 'hover:border-gray-300 focus:bg-white'}`}
                            placeholder="请描述本次发布的变更点..."
                        />
                    </div>

                    {/* Diff Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-800">变更 diff</h3>
                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-gray-50">
                             <div className="bg-white px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                                    <FileCode size={14} /> agents/config.json
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold">
                                    <span className="text-green-600">+12</span>
                                    <span className="text-red-600">-4</span>
                                </div>
                             </div>
                             <div className="p-0 overflow-x-auto">
                                <table className="w-full text-xs font-mono border-collapse">
                                    <tbody>
                                        <tr>
                                            <td className="w-10 text-right text-gray-300 bg-gray-50/50 p-1 border-r border-gray-100 select-none">42</td>
                                            <td className="p-1 pl-4 text-gray-600 bg-white">"name": "智能体助手",</td>
                                        </tr>
                                        <tr className="bg-red-50">
                                            <td className="w-10 text-right text-red-300 p-1 border-r border-red-100 select-none">-</td>
                                            <td className="p-1 pl-4 text-red-600">"version": "v1.0.0",</td>
                                        </tr>
                                        <tr className="bg-green-50">
                                            <td className="w-10 text-right text-green-300 p-1 border-r border-green-100 select-none">+</td>
                                            <td className="p-1 pl-4 text-green-600">"version": "v1.1.0",</td>
                                        </tr>
                                        <tr className="bg-green-50">
                                            <td className="w-10 text-right text-green-300 p-1 border-r border-green-100 select-none">+</td>
                                            <td className="p-1 pl-4 text-green-600">"version": "v1.1.0",</td>
                                        </tr>
                                        <tr className="bg-green-50">
                                            <td className="w-10 text-right text-green-300 p-1 border-r border-green-100 select-none">+</td>
                                            <td className="p-1 pl-4 text-green-600">"model": "gemini-3-flash",</td>
                                        </tr>
                                        <tr>
                                            <td className="w-10 text-right text-gray-300 bg-gray-50/50 p-1 border-r border-gray-100 select-none">46</td>
                                            <td className="p-1 pl-4 text-gray-600 bg-white">"description": "专业对话助手"</td>
                                        </tr>
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
  };

  return (
    <div className="w-full h-full bg-white flex flex-col z-20 border-l border-gray-200 relative font-sans">
      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white flex-shrink-0">
        <div className="flex gap-4">
            <button onClick={() => setActiveTab('preview')} className={`py-4 text-xs font-semibold border-b-2 transition-all ${activeTab === 'preview' ? 'border-[#55635C] text-[#55635C]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>预览调试</button>
            <button onClick={() => setActiveTab('logs')} className={`py-4 text-xs font-semibold border-b-2 transition-all ${activeTab === 'logs' ? 'border-[#55635C] text-[#55635C]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>运行记录</button>
            <button onClick={() => setActiveTab('deploy')} className={`py-4 text-xs font-semibold border-b-2 transition-all ${activeTab === 'deploy' ? 'border-[#55635C] text-[#55635C]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>部署记录</button>
            <button onClick={() => setActiveTab('config')} className={`py-4 text-xs font-semibold border-b-2 transition-all ${activeTab === 'config' ? 'border-[#55635C] text-[#55635C]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>消费配置</button>
        </div>
        <div className="flex items-center gap-3">
             <div className="relative" ref={versionTriggerRef}>
                 <div 
                    onClick={() => setShowVersionHistory(!showVersionHistory)}
                    className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors"
                >
                    <span className="text-gray-400">版本号</span>
                    <span className="font-mono text-gray-700 bg-gray-100 px-1.5 rounded flex items-center gap-1">
                        v1.0.0
                        <ChevronDown size={10} className={`transition-transform ${showVersionHistory ? 'rotate-180' : ''}`}/>
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 ml-1"></span>
                    <span className="text-gray-500">修改未发布</span>
                 </div>

                 {showVersionHistory && (
                     <div className="absolute top-full right-0 mt-2 w-[340px] bg-white border border-gray-100 rounded-xl shadow-2xl z-[100] py-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                         <div className="px-5 mb-3 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 text-sm">历史版本</h3>
                            <button onClick={() => setShowVersionHistory(false)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                         </div>
                         <div className="max-h-[400px] overflow-y-auto custom-scrollbar px-3 space-y-2">
                            {MOCK_DEPLOY_RECORDS.map(record => (
                                <div key={record.id} className="group relative p-3 rounded-lg hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                                    <div className="flex items-start justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="font-bold text-gray-800 text-xs">版本 {record.id}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400">{record.time}</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-3 pr-2">
                                        {record.message}
                                    </p>
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            title="回到该版本"
                                            onClick={(e) => { e.stopPropagation(); alert(`正在回滚到版本 ${record.id}`); }}
                                            className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-[#55635C] hover:border-[#55635C] hover:bg-gray-50 shadow-sm transition-all"
                                        >
                                            <Undo2 size={14}/>
                                        </button>
                                        <button 
                                            title="查看详情"
                                            onClick={(e) => { e.stopPropagation(); setSelectedDeployRecord(record); setActiveTab('deploy'); setShowVersionHistory(false); }}
                                            className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-[#55635C] hover:border-[#55635C] hover:bg-gray-50 shadow-sm transition-all"
                                        >
                                            <FileCode size={14}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                         </div>
                     </div>
                 )}
             </div>
             <button 
                onClick={() => setShowReleaseDrawer(true)}
                className="px-4 py-1.5 bg-[#55635C] text-white text-xs font-semibold rounded-lg hover:bg-[#444F49] shadow-sm transition-colors"
            >
                发布
            </button>
             <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 ml-2" title="退出构建"><X size={18}/></button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">{renderContent()}</div>
      {showSelector && createPortal(renderSelector(), document.body)}
      {renderConsumptionModals()}
      {renderProCodeModal()}
      {renderReleaseDrawer()}
    </div>
  );
};