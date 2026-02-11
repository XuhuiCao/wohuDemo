import React from 'react';
import { Search, Pencil, Trash2, Sparkles } from 'lucide-react';
import { ChatSession, Group } from '../types';
import { InputArea } from './InputArea';

interface GroupPageProps {
  group: Group;
  chats: ChatSession[];
  onOpenChat: (chatId: string) => void;
  onNewChatInGroup: (initialMessage: string) => void;
  onBack: () => void;
}

export const GroupPage: React.FC<GroupPageProps> = ({ 
  group, 
  chats, 
  onOpenChat, 
  onNewChatInGroup,
  onBack 
}) => {
  const groupChats = chats.filter(c => c.groupId === group.id);

  return (
    <div className="flex-1 h-full bg-white flex flex-col font-sans relative">
      {/* Header */}
      <div className="pt-8 pb-4 px-8 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
             <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{group.name}</h2>
             <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 text-xs hover:bg-gray-50 transition-colors">
                <Sparkles size={12} /> 添加指令
             </button>
        </div>
        <div className="flex items-center gap-5 text-gray-400">
             <button className="hover:text-gray-600 transition-colors"><Search size={20}/></button>
             <button className="hover:text-gray-600 transition-colors"><Pencil size={20}/></button>
             <button className="hover:text-gray-600 transition-colors"><Trash2 size={20}/></button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar">
        {groupChats.length > 0 ? (
            <div className="space-y-8 py-4">
                {groupChats.map(chat => (
                    <div 
                        key={chat.id} 
                        onClick={() => onOpenChat(chat.id)}
                        className="group cursor-pointer block"
                    >
                        <div className="flex justify-between items-baseline mb-2">
                            <h3 className="text-base font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{chat.title}</h3>
                            <span className="text-xs text-gray-400 font-normal">
                                {new Date(chat.updatedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '月').replace(' ', '日 ')}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed font-light">
                            {chat.messages.length > 0 
                                ? chat.messages[chat.messages.length - 1].content.substring(0, 100) + (chat.messages[chat.messages.length - 1].content.length > 100 ? '...' : '')
                                : "暂无消息内容..."}
                        </p>
                    </div>
                ))}
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300">
                <p>暂无历史对话</p>
            </div>
        )}
      </div>

      {/* Input Area (Bottom Fixed) */}
      <div className="p-8 bg-white z-20 pb-6">
           <InputArea 
               onSendMessage={onNewChatInGroup} 
               mode="standard" 
               placeholder={`给 ${group.name} 发送消息`}
           />
           <div className="text-center text-[10px] text-gray-300 mt-3">内容由干问AI生成，仅供参考</div>
      </div>
    </div>
  );
};