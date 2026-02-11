import React from 'react';
import { 
  Search, 
  ChevronRight,
  ArrowRight,
  Download,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';

interface AssetMarketProps {
  onBack: () => void;
}

const FEATURED_SKILLS = [
  {
    id: 's1',
    name: '@antskill/wohu-knowledge-base',
    description: '调用卧虎知识库，通过知识召回提高 Agent 返回结果的准确度',
    author: '子之',
    version: '1.3.6',
    installs: 310,
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix'
  },
  {
    id: 's2',
    name: '@antskill/ant-skill-creator',
    description: 'Skill 之母。用于创建发布到 tnpm 的 Claude Code Skill。提供从技能设计、本地安装到发布的完整工作流。',
    author: '不理',
    version: '1.1.1',
    installs: 157,
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Mittens'
  },
  {
    id: 's3',
    name: '@antskill/dataphin',
    description: '以「本地优先」的风格，和 LLM 协作开发 Dataphin / MaxCompute 项目，帮你写到不得了的 SQL。',
    author: '四盘',
    version: '1.1.2',
    installs: 94,
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Oscar'
  },
  {
    id: 's4',
    name: '@antskill/send-ding',
    description: '通过 AppleScript 自动发送蚂蚁钉/钉钉消息，支持向个人（工号）或群组发送消息。',
    author: '不理',
    version: '1.0.0',
    installs: 184,
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Misty'
  }
];

export const AssetMarket: React.FC<AssetMarketProps> = ({ onBack }) => {
  return (
    <div className="flex-1 h-full bg-white flex flex-col font-sans overflow-hidden">
      {/* Header / Breadcrumb */}
      <div className="h-14 bg-white border-b border-gray-100 flex items-center px-6 justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-2 text-sm text-gray-500">
             <div className="w-5 h-5 rounded bg-gray-400"></div>
             <span>资产市场</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
             <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-[url('https://mdn.alipayobjects.com/huamei_f7xjsv/afts/img/A*P8aJTK-X_zwAAAAAWjAAAAgAeiSqAQ/original?hm_biz=yfd_air_portal')] bg-contain bg-no-repeat bg-center"></div>
        </div>

        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-8 pt-20 pb-16 text-center relative z-10">
            <h1 className="text-6xl font-bold text-gray-900 mb-6 font-serif italic">
                AI Agent Skills, <br/>
                <span className="text-[#325244]">开箱即用</span>
            </h1>
            <p className="text-gray-400 text-lg mb-10 font-medium">为 AI 编码工具提供开箱即用的技能包，一行命令即可安装。</p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#325244] transition-colors" size={20}/>
                <input 
                    className="w-full pl-16 pr-6 py-5 bg-white border border-gray-100 rounded-full text-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-[#325244]/10 focus:border-[#325244]/20 transition-all placeholder:text-gray-300" 
                    placeholder="回车搜索技能，例如：知识库" 
                />
            </div>
        </div>

        {/* Featured Content */}
        <div className="max-w-7xl mx-auto px-10 pb-20 relative z-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">精选技能</h2>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <CheckCircle2 size={14} className="text-blue-500" /> 经过验证的优质技能
                    </div>
                </div>
                <button className="flex items-center gap-1 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
                    查看全部 <ArrowRight size={16}/>
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {FEATURED_SKILLS.map(skill => (
                    <div key={skill.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-gray-50 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all cursor-pointer flex flex-col group h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm">
                                <img src={skill.avatar} alt={skill.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 px-2 py-1 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">{skill.version}</span>
                        </div>
                        
                        <h3 className="text-sm font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-[#325244] transition-colors">{skill.name}</h3>
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 mb-6 flex-1">{skill.description}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                                    <img src={`https://api.dicebear.com/9.x/initials/svg?seed=${skill.author}`} alt={skill.author} className="w-full h-full rounded-full" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-500">{skill.author}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                    <Download size={10}/> {skill.installs}
                                </div>
                                <button className="px-3 py-1.5 bg-[#F2F4F3] text-gray-700 rounded-lg text-[10px] font-bold hover:bg-[#325244] hover:text-white transition-all shadow-sm">安装</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Decorative Bottom Area */}
        <div className="h-[400px] bg-[#FDF4F4]/20 border-t border-[#FBEAEA]/50 mt-10"></div>
      </div>
    </div>
  );
};
