import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  LayoutGrid, 
  List, 
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Clock,
  User,
  Files,
  Lightbulb,
  Beaker
} from 'lucide-react';

interface EvaluationCenterProps {
  onBack: () => void;
}

export const EvaluationCenter: React.FC<EvaluationCenterProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('数据集');

  const stats = [
    { label: '数据集数量', count: 48 },
    { label: '评估器数量', count: 1 },
    { label: '评测实验数量', count: 3 },
  ];

  const tabs = [
    { name: '数据集', count: 16 },
    { name: '评估器', count: 1 },
    { name: '评测实验', count: 1 },
  ];

  const items = Array.from({ length: 4 }).map((_, i) => ({
    id: i,
    name: '${数据集名称}',
    editor: '${编辑人}',
    date: '01-21',
    description: '可自动生成简介描述可自动生成简介描述可自动生成简介描述可自动生成简介描述'
  }));

  return (
    <div className="flex-1 h-full bg-[#FAFAFA] flex flex-col font-sans">
      {/* Header / Breadcrumb */}
      <div className="h-14 bg-white border-b border-gray-100 flex items-center px-6 justify-between flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-gray-500">
             <div className="w-5 h-5 rounded bg-gray-400"></div>
             <span>崇启的空间</span>
             <ChevronRight size={14} className="text-gray-300 mx-1" />
             <span className="font-medium text-gray-900">评测中心</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-6">
                        <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                        <div className="text-3xl font-bold text-gray-800">{stat.count}</div>
                    </div>
                ))}
            </div>

            {/* List Header / Tabs & Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {tabs.map(tab => (
                        <button 
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`flex items-center gap-2 pb-1 transition-all border-b-2 font-medium text-sm ${activeTab === tab.name ? 'border-[#55635C] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab.name}
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeTab === tab.name ? 'bg-[#55635C] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm w-72 focus:ring-1 focus:ring-[#55635C] outline-none shadow-sm transition-all" 
                            placeholder="搜索项目" 
                        />
                    </div>
                    
                    <div className="flex p-0.5 bg-gray-100 border border-gray-200 rounded-lg">
                        <button className="p-1.5 text-[#55635C] bg-white rounded-md shadow-sm"><LayoutGrid size={16}/></button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"><List size={16}/></button>
                    </div>

                    <button className="flex items-center gap-1.5 px-4 py-2 bg-[#55635C] text-white rounded-lg hover:bg-[#444F49] text-sm font-medium shadow-sm transition-all">
                        <Plus size={16} /> 新建
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map(item => (
                    <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all group cursor-pointer h-[180px] flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                            <button className="text-gray-300 hover:text-gray-600"><MoreHorizontal size={16}/></button>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3">
                            <span>{item.editor}</span>
                            <span>最新编辑 {item.date}</span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="h-16 bg-white border-t border-gray-100 flex items-center justify-end px-8 gap-2 shrink-0">
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-50 rounded transition-colors">
              <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-sm text-gray-500 hover:bg-gray-50 rounded transition-colors">1</button>
          <span className="text-gray-300 text-sm mx-1 select-none">...</span>
          <button className="w-8 h-8 flex items-center justify-center text-sm bg-white border border-gray-200 text-[#55635C] font-bold rounded shadow-sm">5</button>
          <button className="w-8 h-8 flex items-center justify-center text-sm text-gray-500 hover:bg-gray-50 rounded transition-colors">6</button>
          <button className="w-8 h-8 flex items-center justify-center text-sm text-gray-500 hover:bg-gray-50 rounded transition-colors">7</button>
          <span className="text-gray-300 text-sm mx-1 select-none">...</span>
          <button className="w-8 h-8 flex items-center justify-center text-sm text-gray-500 hover:bg-gray-50 rounded transition-colors">10</button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-50 rounded transition-colors">
              <ChevronRight size={16} />
          </button>
      </div>
    </div>
  );
};
