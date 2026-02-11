import React, { useState } from 'react';
import { LayoutGrid, Bot, Palette, FileBox, Filter, MoreHorizontal, Clock, Box } from 'lucide-react';
import { MOCK_AGENTS, MOCK_UI_STYLES } from '../constants';
import { Agent, UIStyle } from '../types';

interface MyContentPageProps {
  onBack: () => void;
  onSelectAgent?: (agent: Agent) => void;
}

const getStatusConfig = (status: string) => {
    switch(status) {
        case 'published': return { label: '已发布', className: 'bg-green-50 text-green-600 border-green-200' };
        case 'publishing': return { label: '发布中', className: 'bg-blue-50 text-blue-600 border-blue-200' };
        case 'draft': return { label: '修改未发布', className: 'bg-yellow-50 text-yellow-600 border-yellow-200' };
        default: return { label: '未知', className: 'bg-gray-50 text-gray-500 border-gray-200' };
    }
}

// Type Guard
const isAgent = (item: any): item is Agent => {
    return 'version' in item;
}

export const MyContentPage: React.FC<MyContentPageProps> = ({ onBack, onSelectAgent }) => {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
      { id: 'all', label: '全部', icon: LayoutGrid },
      { id: 'agents', label: '智能体', icon: Bot },
      { id: 'ui', label: 'UI 样式', icon: Palette },
      { id: 'other', label: '其他', icon: FileBox },
  ];

  let displayItems: (Agent | UIStyle)[] = [];
  if (activeTab === 'all') {
      displayItems = [...MOCK_AGENTS, ...MOCK_UI_STYLES];
  } else if (activeTab === 'agents') {
      displayItems = MOCK_AGENTS;
  } else if (activeTab === 'ui') {
      displayItems = MOCK_UI_STYLES;
  }

  const handleItemClick = (item: Agent | UIStyle) => {
    if (isAgent(item) && onSelectAgent) {
        onSelectAgent(item);
    }
  };

  return (
    <div className="flex-1 h-full bg-[#F5F7FA] flex flex-col font-sans">
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between shadow-sm">
        <h2 className="text-lg font-bold text-gray-800">我的内容</h2>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-900 md:hidden">返回</button>
      </div>

      <div className="p-6">
        {/* Tabs & Controls */}
        <div className="flex justify-between items-center mb-6">
            <div className="flex p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[#55635C] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>
            
            <div className="flex gap-2">
                 <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 shadow-sm">
                    <Filter size={18} />
                 </button>
            </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayItems.length > 0 ? displayItems.map(item => {
                 const isItemAgent = isAgent(item);
                 // Agent specific visual configs
                 const statusConfig = isItemAgent ? getStatusConfig(item.status) : null;
                 
                 return (
                 <div 
                    key={item.id} 
                    onClick={() => handleItemClick(item)}
                    className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-lg hover:border-[#55635C]/30 transition-all cursor-pointer flex flex-col h-[200px] relative group"
                 >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                            {/* Icon Distinction */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${
                                isItemAgent 
                                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 text-[#55635C] border-blue-100' 
                                : 'bg-gradient-to-br from-purple-50 to-pink-50 text-purple-600 border-purple-100'
                            }`}>
                                {isItemAgent ? <Bot size={20} /> : <Palette size={20} />}
                            </div>
                            
                            <div className="min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate text-sm">{item.name}</h3>
                                <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                    <Box size={10} />
                                    <span className="truncate">{item.space || '默认空间'}</span>
                                </div>
                            </div>
                        </div>
                        <button className="text-gray-300 hover:text-gray-500 p-1 -mr-2 -mt-2">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2 flex-1">{item.description}</p>
                    
                    {/* Footer Meta */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs mt-auto">
                        <div className="text-gray-400 flex items-center gap-1">
                            <Clock size={12} />
                            <span>{item.lastOperatedAt} 操作</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {isItemAgent ? (
                                <>
                                    <span className="text-gray-300 font-mono">v{item.version}</span>
                                    {statusConfig && (
                                        <span className={`px-1.5 py-0.5 rounded border text-[10px] font-medium ${statusConfig.className}`}>
                                            {statusConfig.label}
                                        </span>
                                    )}
                                </>
                            ) : (
                                // UI Style Footer
                                <span className="px-1.5 py-0.5 rounded border border-purple-100 bg-purple-50 text-purple-600 text-[10px] font-medium">
                                    {item.framework || 'UI'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FileBox size={24} />
                    </div>
                    <p>暂无内容</p>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};