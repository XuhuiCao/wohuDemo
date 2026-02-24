import React, { useState } from 'react';
import { 
  MoreVertical, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Plus,
  Box,
  Database,
  Clock,
  Settings2,
  BookOpen
} from 'lucide-react';
import { MOCK_DOCS } from '../constants';

interface KnowledgeBasePageProps {
  onBack: () => void;
}

export const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'summary'>('content');
  const [globalEnable, setGlobalEnable] = useState(true);

  return (
    <div className="flex-1 h-full bg-[#FAFAFA] flex flex-col font-sans overflow-hidden">
      {/* Header - Simplified breadcrumb as per feedback */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-2">
             <div className="w-5 h-5 rounded-md bg-sage-50 text-sage-600 flex items-center justify-center">
                <BookOpen size={14} />
             </div>
             <span className="text-sm font-bold text-gray-900">我的知识库</span>
        </div>
        <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="font-medium">对话默认启用</span>
                <div 
                    className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors relative ${globalEnable ? 'bg-sage-500' : 'bg-stone-300'}`}
                    onClick={() => setGlobalEnable(!globalEnable)}
                >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${globalEnable ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
             </div>
        </div>
      </div>

      {/* Tabs area */}
      <div className="h-11 bg-white border-b border-gray-100 flex items-center px-8 gap-8 shrink-0">
          <button 
              onClick={() => setActiveTab('content')}
              className={`h-full text-xs font-bold border-b-2 transition-all px-1 ${activeTab === 'content' ? 'text-gray-900 border-sage-600' : 'text-stone-400 border-transparent hover:text-stone-600'}`}
          >
              知识库内容
          </button>
          <button 
              onClick={() => setActiveTab('summary')}
              className={`h-full text-xs font-bold border-b-2 transition-all px-1 ${activeTab === 'summary' ? 'text-gray-900 border-sage-600' : 'text-stone-400 border-transparent hover:text-stone-600'}`}
          >
              知识库总结
          </button>
      </div>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white">
        <div className="max-w-5xl mx-auto">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-300" size={14}/>
                    <input 
                        type="text" 
                        placeholder="搜索相关文字" 
                        className="w-full pl-10 pr-4 py-2 bg-stone-50/50 border border-stone-200 rounded-lg focus:ring-1 focus:ring-sage-500 focus:border-sage-500 outline-none text-sm transition-all shadow-inner placeholder:text-stone-300"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-50 text-xs font-bold shadow-sm transition-all flex items-center gap-2">
                        <Filter size={14} className="text-stone-400"/> 高级筛选
                    </button>
                    <button className="px-5 py-2 bg-[#55635C] text-white rounded-lg hover:bg-[#444F49] text-xs font-bold shadow-sm transition-all flex items-center gap-2">
                        <Plus size={16} /> 添加知识内容
                    </button>
                    <button className="p-2 text-stone-400 hover:text-stone-900 bg-stone-50 border border-stone-200 rounded-lg transition-all shadow-sm">
                        <Settings2 size={16} />
                    </button>
                </div>
            </div>

            {/* List Content */}
            <div className="space-y-4 pb-8">
                {MOCK_DOCS.map((doc) => (
                    <div key={doc.id} className="bg-white p-4 px-5 rounded-xl border border-stone-200 hover:shadow-md hover:border-sage-200 transition-all flex items-center justify-between group cursor-pointer shadow-sm">
                        {/* Left: Info */}
                        <div className="flex items-center gap-5 flex-1 min-w-0 pr-8">
                            <div className="w-10 h-10 bg-white border border-stone-100 rounded-lg flex items-center justify-center text-stone-400 flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                <FileText size={20} />
                            </div>
                            <div className="min-w-0">
                                 <div className="flex items-center gap-3 mb-1">
                                     <h3 className="text-sm font-bold text-gray-900 truncate">{doc.title}</h3>
                                     <div className="flex gap-1.5">
                                        {doc.tags?.map(tag => (
                                            <span key={tag} className="px-1.5 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-bold rounded border border-stone-200 uppercase tracking-tight">
                                                {tag.replace('#', '')}
                                            </span>
                                        ))}
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-3 text-[11px] text-stone-400 font-medium">
                                     <span className="flex items-center gap-1"><Database size={11}/> {doc.source}</span>
                                     <span className="text-stone-200">•</span>
                                     <span>{doc.size}</span>
                                     <span className="text-stone-200">•</span>
                                     <span className="flex items-center gap-1"><Clock size={11}/> {doc.date}</span>
                                 </div>
                            </div>
                        </div>

                        {/* Right: Actions and Stats */}
                        <div className="flex items-center gap-8 flex-shrink-0">
                            <div className="flex flex-col items-end w-20">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter mb-0.5">召回命中</span>
                                <span className="font-mono text-xl font-bold text-gray-800 leading-none">{doc.hits}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 w-24 justify-end">
                                <span className={`text-[11px] font-bold transition-colors ${doc.status ? 'text-gray-900' : 'text-stone-400'}`}>
                                    {doc.status ? '已启用' : '已禁用'}
                                </span>
                                <div 
                                    className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors relative ${doc.status ? 'bg-sage-500' : 'bg-stone-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${doc.status ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pl-4 border-l border-stone-100">
                                <button className="px-4 py-1.5 text-xs font-bold text-gray-700 bg-white border border-stone-200 rounded-lg hover:border-sage-500 hover:text-sage-700 transition-all shadow-sm">内容详情</button>
                                <button className="p-1.5 text-stone-300 hover:text-stone-900 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      {/* Footer Pagination */}
      <div className="h-14 bg-[#FAFAFA] border-t border-stone-200 flex items-center justify-between px-8 shrink-0">
         <div className="text-[11px] text-stone-400 font-medium">
            共计 <span className="text-stone-700 font-bold">48</span> 个文档
         </div>
         <div className="flex items-center gap-1.5">
            <button className="w-7 h-7 flex items-center justify-center text-stone-400 hover:bg-stone-100 rounded-md transition-colors">
                <ChevronLeft size={16}/>
            </button>
            <button className="w-7 h-7 flex items-center justify-center bg-stone-200/50 text-gray-900 rounded-md font-bold text-xs shadow-sm">
                1
            </button>
            <button className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-100 rounded-md font-bold text-xs transition-colors">
                2
            </button>
            <button className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-100 rounded-md font-bold text-xs transition-colors">
                3
            </button>
            <button className="w-7 h-7 flex items-center justify-center text-stone-400 hover:bg-stone-100 rounded-md transition-colors">
                <ChevronRight size={16}/>
            </button>
            
            <div className="h-4 w-px bg-stone-200 mx-2"></div>
            
            <button className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-[11px] font-bold text-stone-600 flex items-center gap-2 hover:bg-stone-50 transition-all shadow-sm">
                10 条/页
                <ChevronDown size={14} className="text-stone-300" />
            </button>
         </div>
      </div>
    </div>
  );
};