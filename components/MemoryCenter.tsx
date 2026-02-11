import React from 'react';
import { 
  Search, 
  Plus, 
  LayoutGrid, 
  List, 
  ChevronRight,
  BrainCircuit,
  BookOpen
} from 'lucide-react';

interface MemoryCenterProps {
  onBack: () => void;
}

export const MemoryCenter: React.FC<MemoryCenterProps> = ({ onBack }) => {
  return (
    <div className="flex-1 h-full bg-white flex flex-col font-sans">
      {/* Header / Breadcrumb */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6 justify-between flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-gray-500">
             <div className="w-5 h-5 rounded bg-gray-400"></div>
             <span>崇启的空间</span>
             <ChevronRight size={14} className="text-gray-300 mx-1" />
             <span className="font-medium text-gray-900">记忆中心</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-[#FDF4F4]/20 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-[#FFF2F2] p-6 rounded-xl border border-[#FBEAEA] shadow-sm flex flex-col gap-4">
                    <div className="text-sm font-medium text-gray-600">知识库数量</div>
                    <div className="text-3xl font-bold text-gray-800">48</div>
                </div>
            </div>

            {/* List Header / Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">知识库</span>
                    <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-bold">16</span>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            className="pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-lg text-sm w-72 focus:ring-1 focus:ring-[#55635C] outline-none shadow-sm transition-all" 
                            placeholder="搜索知识库" 
                        />
                    </div>
                    
                    <div className="flex p-0.5 bg-gray-50 border border-gray-100 rounded-lg">
                        <button className="p-1.5 text-[#55635C] bg-white rounded-md shadow-sm"><LayoutGrid size={16}/></button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"><List size={16}/></button>
                    </div>

                    <button className="flex items-center gap-1.5 px-4 py-2 bg-[#55635C] text-white rounded-lg hover:bg-[#444F49] text-sm font-medium shadow-sm transition-all">
                        <Plus size={16} /> 新建
                    </button>
                </div>
            </div>

            {/* Empty State Area */}
            <div className="min-h-[500px] bg-[#FDF4F4]/30 rounded-2xl border border-dashed border-[#FBEAEA] flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 rounded-full bg-white border border-[#FBEAEA] flex items-center justify-center mb-4 shadow-sm">
                    <BookOpen size={32} className="text-gray-200" />
                </div>
                <p className="text-sm">暂无知识库内容，快去新建一个吧</p>
            </div>
        </div>
      </div>
    </div>
  );
};
