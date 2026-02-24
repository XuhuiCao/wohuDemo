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
    <div className="flex-1 h-full bg-stone-50 flex flex-col font-sans overflow-hidden">
      <div className="h-14 bg-white border-b border-stone-200 flex items-center px-6 justify-between shrink-0 shadow-warm-xs z-10">
        <h2 className="text-sm font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <LayoutGrid size={16} className="text-stone-400" />
            我的内容
        </h2>
        <button onClick={onBack} className="text-xs text-stone-500 hover:text-stone-900 transition-colors">返回</button>
      </div>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white">
        <div className="max-w-7xl mx-auto">
            {/* Tabs & Controls */}
            <div className="flex justify-between items-center mb-10">
                <div className="flex p-1 bg-stone-100 rounded-lg shadow-inner">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-md text-xs font-bold transition-all-200 ${activeTab === tab.id ? 'bg-white text-stone-900 shadow-warm-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'}`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
                
                <div className="flex gap-2">
                    <button className="p-2 bg-white border border-stone-200 rounded-lg text-stone-400 hover:text-stone-900 transition-all shadow-warm-xs active-press">
                        <Filter size={16} />
                    </button>
                </div>
            </div>

            {/* Content Grid - Matching AgentCenter gap and layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
                {displayItems.length > 0 ? displayItems.map(item => {
                    const isItemAgent = isAgent(item);
                    const statusConfig = isItemAgent ? getStatusConfig(item.status) : null;
                    
                    return (
                    <div 
                        key={item.id} 
                        onClick={() => handleItemClick(item)}
                        className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-warm-md hover:border-sage-200 transition-all-200 cursor-pointer flex flex-col h-[220px] relative group shadow-warm-xs hover-lift"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 transition-all-200 group-hover:shadow-inner ${
                                    isItemAgent 
                                    ? 'bg-stone-50 text-sage-600 border-stone-100 group-hover:bg-stone-50' 
                                    : 'bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-50'
                                }`}>
                                    {isItemAgent ? <Bot size={24} /> : <Palette size={24} />}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-col gap-1">
                                      <h3 className="font-bold text-stone-900 truncate text-sm tracking-tight">{item.name}</h3>
                                      {isItemAgent ? (
                                          <TypeBadge type={item.type} />
                                      ) : (
                                          <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">{item.framework || 'STYLE'}</span>
                                      )}
                                    </div>
                                </div>
                            </div>
                            <button className="text-stone-300 hover:text-stone-500 p-1 transition-colors">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-stone-400 font-medium line-clamp-2 mb-4 flex-1 leading-relaxed">
                            {item.description}
                        </p>
                        
                        {/* Footer Meta */}
                        <div className="flex flex-col gap-2 pt-4 border-t border-stone-50 mt-auto">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                <div className="text-stone-400 flex items-center gap-2 overflow-hidden flex-1 mr-2">
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Clock size={12} className="text-stone-300" />
                                        <span>
                                            {isItemAgent 
                                                ? `${item.lastEditedBy || '崇启'} · ${item.lastOperatedAt || '01-21'}`
                                                : item.lastOperatedAt || '01-21'
                                            }
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 shrink-0">
                                    {isItemAgent ? (
                                        <>
                                            <span className="text-stone-300 font-mono">v{item.version}</span>
                                            {statusConfig && (
                                                <span className={`px-2 py-0.5 rounded border ${statusConfig.className}`}>
                                                    {statusConfig.label}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-stone-400 font-bold">
                                            <span>{item.framework || 'STYLE'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest overflow-hidden">
                                <Box size={12} className="text-stone-300 shrink-0" />
                                <span className="truncate" title={item.space || '默认空间'}>{item.space || '默认空间'}</span>
                            </div>
                        </div>
                    </div>
                )}) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-stone-300">
                        <div className="w-16 h-16 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center mb-6">
                            <FileBox size={32} className="opacity-20" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest">暂无内容</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};