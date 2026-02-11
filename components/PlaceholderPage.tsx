import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  icon: LucideIcon;
  onBack: () => void;
  color?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, icon: Icon, onBack, color = "text-gray-500" }) => {
  return (
    <div className="flex-1 h-full bg-[#F5F7FA] flex flex-col font-sans">
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 cursor-pointer" onClick={onBack}>
            <div className={`p-1.5 rounded-lg bg-gray-50 ${color}`}>
                <Icon size={20}/>
            </div>
            {title}
        </h2>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-900 md:hidden">返回</button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
        <div className="w-24 h-24 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-6 shadow-sm">
            <Icon size={48} className={color} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="max-w-md text-gray-400">该功能模块正在建设中，我们将很快为您呈现更丰富的能力。</p>
        <button onClick={onBack} className="mt-8 px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium">
            返回首页
        </button>
      </div>
    </div>
  );
};