import React, { useState } from 'react';
import { 
  MoreVertical, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { MOCK_DOCS } from '../constants';

interface KnowledgeBasePageProps {
  onBack: () => void;
}

export const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'summary'>('content');
  const [globalEnable, setGlobalEnable] = useState(true);

  return (
    <div className="flex-1 h-full bg-[#FAFAFA] flex flex-col font-sans">
      {/* Header Tabs */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6 justify-between flex-shrink-0">
        <div className="flex gap-8 h-full">
            <button 
                onClick={() => setActiveTab('content')}
                className={`text-sm font-bold h-full border-b-2 px-1 transition-colors ${activeTab === 'content' ? 'text-orange-500 border-orange-500' : 'text-gray-600 border-transparent hover:text-gray-900'}`}
            >
                知识库内容
            </button>
            <button 
                onClick={() => setActiveTab('summary')}
                className={`text-sm font-bold h-full border-b-2 px-1 transition-colors ${activeTab === 'summary' ? 'text-orange-500 border-orange-500' : 'text-gray-600 border-transparent hover:text-gray-900'}`}
            >
                知识库总结
            </button>
        </div>
        
        <div className="flex items-center gap-4">
             {/* Global Toggle requested */}
             <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <span>对话默认启用</span>
                <div 
                    className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${globalEnable ? 'bg-orange-500' : 'bg-gray-300'}`}
                    onClick={() => setGlobalEnable(!globalEnable)}
                >
                    <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${globalEnable ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
             </div>
             <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-900 md:hidden">返回</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Toolbar */}
        <div className="flex justify-end items-center mb-4 gap-3">
             <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-all">
                高级筛选
            </button>
            <button className="px-4 py-2 bg-[#FF9800] text-white rounded-lg hover:bg-[#F57C00] text-sm font-medium shadow-md transition-all flex items-center gap-2">
                添加知识内容
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <MoreVertical size={20} />
            </button>
        </div>

        {/* List Content */}
        <div className="space-y-3 pb-8">
            {MOCK_DOCS.map((doc) => (
                <div key={doc.id} className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-shadow flex items-center justify-between group">
                    {/* Left: Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0 pr-8">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 flex-shrink-0">
                            <FileText size={20} />
                            <div className="absolute bottom-0 right-0 text-[8px] font-bold bg-gray-200 px-0.5 rounded-tl">DOC</div>
                        </div>
                        <div className="min-w-0">
                             <div className="flex items-center gap-2 mb-1">
                                 <h3 className="text-base font-medium text-gray-900 truncate">{doc.title}</h3>
                                 {doc.tags?.map(tag => (
                                     <span key={tag} className="text-sm text-gray-500 truncate">{tag}</span>
                                 ))}
                             </div>
                             <div className="flex items-center gap-2 text-xs text-gray-400">
                                 <span>语雀源</span>
                                 <span>·</span>
                                 <span>{doc.source}</span>
                                 <span>·</span>
                                 <span>{doc.date}</span>
                             </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-8 flex-shrink-0">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>召回命中:</span>
                            <span className="font-mono">{doc.hits}</span>
                        </div>
                        
                        <div 
                            className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${doc.status ? 'bg-orange-400' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${doc.status ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>

                        <button className="text-sm text-gray-600 hover:text-gray-900">内容详情</button>
                        <button className="text-sm text-gray-600 hover:text-gray-900">查看原文件</button>
                        <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
        
      </div>
      
      {/* Footer Pagination */}
      <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-end px-6 gap-4">
         <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg">
             <ChevronLeft size={16}/>
         </button>
         <button className="w-8 h-8 flex items-center justify-center text-orange-500 bg-orange-50 border border-orange-200 rounded-lg font-medium text-sm">
             1
         </button>
         <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm">
             2
         </button>
         <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm">
             3
         </button>
         <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm">
             4
         </button>
         <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg">
             <ChevronRight size={16}/>
         </button>
         
         <div className="flex items-center gap-2 ml-2">
             <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 flex items-center gap-2 hover:bg-gray-50">
                 10 条/页
                 <ChevronDown size={14} />
             </button>
         </div>
      </div>
    </div>
  );
};