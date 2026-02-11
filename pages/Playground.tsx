import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Message, ViewState, ChatSession, Agent } from '../types';
import { InputArea, InputAreaRef } from '../components/InputArea';
import { AgentBuilder, AgentConfig } from '../components/AgentBuilder';
import { 
  Share2, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  RefreshCw, 
  MoreHorizontal, 
  Bot, 
  User, 
  Edit3, 
  Box, 
  Palette, 
  PanelLeftClose, 
  PanelLeftOpen,
  Wand2,
  BookPlus,
  Quote,
  Check,
  FileText,
  AlertCircle,
  ShieldAlert,
  ChevronRight,
  List,
  MessageSquare,
  ExternalLink,
  Settings
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

interface PlaygroundProps {
  initialMode?: 'chat' | 'builder';
  onNavigate: (view: ViewState) => void;
  chatSession?: ChatSession | null;
  onUpdateChat?: (chatId: string, messages: Message[]) => void;
  onCreateChat?: (initialMessage: string) => string;
  agentToEdit?: Agent | null;
}

export const Playground: React.FC<PlaygroundProps> = ({ 
    initialMode = 'chat', 
    onNavigate, 
    chatSession, 
    onUpdateChat, 
    onCreateChat,
    agentToEdit
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isBuilderOpen, setIsBuilderOpen] = useState(initialMode === 'builder');
  const [chatPanelCollapsed, setChatPanelCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatTitle, setChatTitle] = useState("新对话");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const inputAreaRef = useRef<InputAreaRef>(null);

  const [isAgentGenerating, setIsAgentGenerating] = useState(false);
  const [agentConfig, setAgentConfig] = useState<AgentConfig | null>(null);

  const [builderWidth, setBuilderWidth] = useState(650);
  const [isResizing, setIsResizing] = useState(false);

  const [selectionPosition, setSelectionPosition] = useState<{top: number, left: number} | null>(null);
  const [selectedText, setSelectedText] = useState("");

  const isHome = !chatSession && messages.length === 0;

  useEffect(() => {
    if (chatSession) {
        setMessages(chatSession.messages);
        setChatTitle(chatSession.title);
        setIsCreating(false);
    } else if (!isCreating) {
        setMessages([]);
        setChatTitle("新对话");
    }
  }, [chatSession?.id, chatSession?.messages.length, isCreating]);

  useEffect(() => {
      if (agentToEdit) {
          setAgentConfig({
              name: agentToEdit.name,
              description: agentToEdit.description,
              systemPrompt: `# 角色设定\n您是一个名为 ${agentToEdit.name} 的专业助手。\n\n# 核心能力\n1. 理解用户意图\n2. 提供专业解答`,
              model: "gemini-3-flash-preview"
          });
          setIsBuilderOpen(true);
      } else {
          setIsBuilderOpen(initialMode === 'builder');
      }
  }, [agentToEdit, initialMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, loading]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 400 && newWidth <= window.innerWidth - 350) {
        setBuilderWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const handleSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setSelectionPosition({ 
                top: rect.top - 40 + window.scrollY, 
                left: rect.left + (rect.width / 2) 
            });
            setSelectedText(selection.toString());
        } else {
            setSelectionPosition(null);
            setSelectedText("");
        }
    };
    
    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  const handleSelectKey = async () => {
      if (typeof window !== 'undefined' && (window as any).aistudio) {
          await (window as any).aistudio.openSelectKey();
          alert("API Key 已更新，请尝试重新发送消息。");
      }
  };

  const handleSendMessage = async (text: string) => {
    const isBuildIntent = text.toLowerCase().includes('build') || text.includes('构建') || text.includes('智能体');
    
    if (isBuildIntent) {
        setIsBuilderOpen(true);
        setIsAgentGenerating(true); 
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    
    let currentChatId = chatSession?.id;

    if (!currentChatId && onCreateChat) {
        setIsCreating(true);
        currentChatId = onCreateChat(text);
    } else if (currentChatId && onUpdateChat) {
        onUpdateChat(currentChatId, updatedMessages);
    }

    setLoading(true);

    try {
      // Re-map current messages for Gemini history format
      const history = updatedMessages.slice(0, -1).map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
      }));

      let fullResponse = "";
      const modelMsgId = (Date.now() + 1).toString();
      const modelMsg: Message = {
          id: modelMsgId,
          role: 'model',
          content: "",
          timestamp: Date.now()
      };

      setMessages(prev => [...prev, modelMsg]);

      const stream = await geminiService.sendMessageStream(text, history);
      if (stream) {
          for await (const chunk of stream) {
              const content = (chunk as GenerateContentResponse).text || "";
              fullResponse += content;
              
              setMessages(prev => {
                  const newMsgs = prev.map(m => m.id === modelMsgId ? { ...m, content: fullResponse } : m);
                  return newMsgs;
              });
          }
          
          if (currentChatId && onUpdateChat) {
              const finalMessages = [...updatedMessages, { ...modelMsg, content: fullResponse }];
              onUpdateChat(currentChatId, finalMessages);
          }
      }

      if (isBuildIntent) {
          setTimeout(() => {
              setAgentConfig({
                  name: "根据对话生成的智能体",
                  description: "基于您的需求自动配置的智能助手",
                  systemPrompt: `# 角色设定\n基于用户需求：${text}\n\n${fullResponse.slice(0, 200)}...\n\n# 核心能力\n1. 理解用户意图\n2. 提供专业解答\n3. 严格遵循输出格式`,
                  model: "gemini-3-flash-preview"
              });
              setIsAgentGenerating(false);
          }, 800);
      }

    } catch (error: any) {
      console.error("Chat error", error);
      const isQuotaError = error.message?.includes("配额已耗尽") || error.status === 429;
      const isKeyError = error.message?.includes("重新选择") || error.message?.includes("entity was not found") || error.status === 404;

      let displayMessage = error.message || "抱歉，遇到了一些问题。请检查网络或 API Key。";

      const errorMsg: Message = {
          id: Date.now().toString(),
          role: 'model',
          content: displayMessage,
          timestamp: Date.now()
      };
      
      setMessages(prev => {
          const baseMsgs = prev.filter(m => m.content !== "");
          const newMsgs = [...baseMsgs, errorMsg];
          if (currentChatId && onUpdateChat) onUpdateChat(currentChatId, newMsgs);
          return newMsgs;
      });
      setIsAgentGenerating(false);
    } finally {
      setLoading(false);
    }
  };

  const handleQuote = () => {
      if (selectedText && inputAreaRef.current) {
          inputAreaRef.current.append(`> ${selectedText}\n\n`);
          setSelectionPosition(null);
          window.getSelection()?.removeAllRanges();
      }
  };

  const handleCopySelection = () => {
      navigator.clipboard.writeText(selectedText);
      setSelectionPosition(null);
      window.getSelection()?.removeAllRanges();
      alert("已复制内容");
  };

  const autoGenerateTitle = () => {
      const newTitle = "关于 " + (messages[0]?.content.substring(0, 10) || "新对话") + " 的讨论";
      setChatTitle(newTitle);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("已复制全文");
  };

  const addToKnowledgeBase = (text: string) => {
      alert("已将内容添加到个人知识库");
  };

  const handleAiDevFromBuilder = (prompt: string) => {
      setIsBuilderOpen(false);
      if (inputAreaRef.current) {
          inputAreaRef.current.setInput(prev => prev + prompt);
          setTimeout(() => inputAreaRef.current?.focus(), 50);
      }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-white font-sans">
      {agentToEdit && (
          <div className="h-14 border-b border-stone-100 flex items-center px-6 shrink-0 bg-white z-10 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase tracking-widest">
                    <Box size={14} className="text-stone-300" />
                    <span>崇启的空间</span>
                    <ChevronRight size={12} className="text-stone-200" />
                    <span className="hover:text-stone-900 cursor-pointer transition-colors" onClick={() => onNavigate(ViewState.AGENT_CENTER)}>智能体</span>
                    <ChevronRight size={12} className="text-stone-200" />
                    <span className="text-stone-900 truncate max-w-[200px]">{agentToEdit.name}</span>
                </div>
          </div>
      )}

      <div className="flex-1 flex h-full relative overflow-hidden">
        <div 
          className={`flex flex-col h-full transition-all duration-150 ease-out bg-stone-50 relative
              ${isBuilderOpen 
                  ? (chatPanelCollapsed ? 'w-0 opacity-0 overflow-hidden border-none' : 'flex-1 min-w-[350px] border-r border-stone-200') 
                  : 'flex-1 min-w-0 bg-white'}
          `}
        >
          
          {((!isHome || isCreating) && !agentToEdit) && (
              <div className={`h-14 border-b border-stone-100 flex items-center justify-between px-6 z-10 flex-shrink-0 bg-white shadow-sm`}>
                  <div className="flex items-center gap-2 group flex-1 min-w-0">
                      <h1 className="font-bold text-stone-900 truncate text-sm tracking-tight">{chatTitle}</h1>
                      <button 
                          className="p-1.5 text-stone-300 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-stone-600 transition-all hover:bg-stone-50 rounded" 
                          onClick={() => {
                              const newTitle = prompt("重命名对话", chatTitle);
                              if (newTitle) setChatTitle(newTitle);
                          }}
                          title="重命名对话"
                      >
                          <Edit3 size={14} />
                      </button>
                      <button 
                          className="p-1.5 text-stone-300 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-sage-600 transition-all hover:bg-sage-50 rounded" 
                          onClick={autoGenerateTitle} 
                          title="自动生成标题"
                      >
                          <Wand2 size={14} />
                      </button>
                  </div>
                  <div className="flex items-center gap-2">
                      {!isBuilderOpen && (
                          <button onClick={() => setIsBuilderOpen(true)} className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all shadow-inner">
                              Open Builder
                          </button>
                      )}
                      
                      {isBuilderOpen && (
                          <button onClick={() => setChatPanelCollapsed(true)} className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded transition-all" title="收起对话">
                              <PanelLeftClose size={18} />
                          </button>
                      )}

                      {!isBuilderOpen && (
                          <button className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded transition-all">
                              <Share2 size={16} />
                          </button>
                      )}
                  </div>
              </div>
          )}

          {isHome && !isCreating && !agentToEdit ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white relative">
                  <div className="mb-14 text-center relative z-10">
                      <h2 className="text-5xl font-bold text-stone-900 tracking-tighter drop-shadow-sm mb-4 leading-tight">你只管说，剩下的交给卧虎。</h2>
                      <p className="text-stone-400 text-lg font-medium">Sophisticated AI Infrastructure for Modern Teams.</p>
                  </div>
                  
                  <InputArea 
                      ref={inputAreaRef} 
                      onSendMessage={handleSendMessage} 
                      disabled={loading} 
                      mode="centered" 
                      onNavigate={onNavigate}
                  />
                  
                  <div className="absolute bottom-8 text-[10px] text-stone-300 font-bold uppercase tracking-[0.2em] select-none">
                      AI For Frontend • Frontend For AI
                  </div>
              </div>
          ) : (
              <div className="flex-1 flex flex-col min-h-0">
                  {agentToEdit && !chatPanelCollapsed && (
                      <div className="h-10 px-4 flex items-center border-b border-stone-200 bg-white shrink-0">
                           <h2 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em] flex items-center gap-2">
                               <MessageSquare size={12} className="text-sage-500"/> 测试预览模式
                           </h2>
                      </div>
                  )}
                  <div className={`flex-1 overflow-y-auto p-6 custom-scrollbar ${isBuilderOpen ? 'bg-stone-50' : 'bg-white'}`}>
                      <div className={`mx-auto pb-4 ${isBuilderOpen ? 'max-w-full px-2' : 'max-w-4xl px-8'}`}>
                          {messages.length === 0 && agentToEdit && (
                              <div className="py-24 flex flex-col items-center justify-center text-stone-200 select-none animate-in fade-in duration-500">
                                  <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center mb-6">
                                      <Bot size={32} className="opacity-30" />
                                  </div>
                                  <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Ready for testing...</p>
                              </div>
                          )}
                          {messages.map((msg, idx) => {
                              const isError = msg.content.includes("配额已耗尽") || msg.content.includes("校验失败") || msg.content.includes("遇到了一些问题");
                              return (
                                  <div key={msg.id} className={`flex gap-4 mb-8 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                      {msg.role === 'model' && (
                                          <div className={`w-8 h-8 rounded-md flex items-center justify-center text-white mt-1 flex-shrink-0 shadow-sm transition-transform ${isError ? 'bg-red-500' : 'bg-sage-600'}`}>
                                              {isError ? <ShieldAlert size={16} /> : <Bot size={16} />}
                                          </div>
                                      )}
                                      
                                      <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start w-full'}`}>
                                          <div className={`text-[14px] leading-relaxed whitespace-pre-wrap shadow-sm transition-all duration-200 ${
                                              msg.role === 'user' 
                                                  ? 'px-5 py-3 bg-sage-500 text-white rounded-md rounded-tr-sm shadow-md' 
                                                  : isError 
                                                      ? 'w-full px-6 py-5 bg-red-50 border border-red-200 text-red-900 rounded-lg rounded-tl-sm flex flex-col gap-4 shadow-sm' 
                                                      : 'w-full text-stone-900 bg-white border border-stone-200 rounded-md shadow-sm p-5'
                                          }`}>
                                              {isError && <div className="flex items-center gap-2 font-bold text-red-600"><AlertCircle size={16}/> 系统通知</div>}
                                              <div className={isError ? 'opacity-80 leading-relaxed' : ''}>
                                                  {msg.content}
                                              </div>
                                              
                                              {isError && (
                                                  <div className="flex flex-wrap gap-3 pt-2">
                                                      <button 
                                                          onClick={handleSelectKey}
                                                          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-md text-[11px] font-bold hover:bg-red-700 transition-colors shadow-sm uppercase tracking-wider"
                                                      >
                                                          <Settings size={12} /> 更换 API Key
                                                      </button>
                                                      <button 
                                                          onClick={() => handleSendMessage(messages[messages.length - 2]?.content || "")}
                                                          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-md text-[11px] font-bold hover:bg-red-50 transition-colors shadow-sm uppercase tracking-wider"
                                                      >
                                                          <RefreshCw size={12} /> 重试发送
                                                      </button>
                                                      <a 
                                                          href="https://ai.google.dev/gemini-api/docs/billing" 
                                                          target="_blank" 
                                                          className="flex items-center gap-1.5 px-4 py-2 bg-transparent text-red-600 hover:text-red-800 transition-colors text-[11px] font-bold uppercase tracking-wider"
                                                      >
                                                          <ExternalLink size={12} /> 账单文档
                                                      </a>
                                                  </div>
                                              )}
                                          </div>

                                          {msg.role === 'model' && !loading && !isError && (
                                              <div className="flex items-center gap-4 mt-2 pl-0.5 animate-in fade-in duration-300">
                                                  <div className="flex items-center gap-1">
                                                      <button className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded transition-all" title="复制" onClick={() => copyToClipboard(msg.content)}>
                                                          <Copy size={14} />
                                                      </button>
                                                  </div>
                                                  <div className="h-3 w-px bg-stone-200"></div>
                                                  <div className="flex items-center gap-1">
                                                      <button className="p-1.5 text-stone-400 hover:text-sage-600 hover:bg-sage-50 rounded transition-all" title="好评">
                                                          <ThumbsUp size={14} />
                                                      </button>
                                                      <button className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-all" title="差评">
                                                          <ThumbsDown size={14} />
                                                      </button>
                                                  </div>
                                              </div>
                                          )}
                                      </div>

                                      {msg.role === 'user' && (
                                          <div className="w-8 h-8 rounded-md bg-stone-100 flex items-center justify-center text-stone-400 mt-1 flex-shrink-0 border border-stone-200 shadow-inner">
                                              <User size={16} />
                                          </div>
                                      )}
                                  </div>
                              );
                          })}
                          {loading && (
                              <div className="flex gap-4 animate-in fade-in duration-300">
                                  <div className="w-8 h-8 rounded-md bg-sage-500 flex items-center justify-center text-white mt-1 flex-shrink-0 animate-pulse shadow-sm">
                                      <Bot size={16} />
                                  </div>
                                  <div className="flex items-center gap-1.5 h-10 px-4 bg-white border border-stone-100 rounded-md shadow-sm">
                                      <span className="w-1.5 h-1.5 bg-sage-300 rounded-full animate-bounce"></span>
                                      <span className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                                      <span className="w-1.5 h-1.5 bg-sage-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                  </div>
                              </div>
                          )}
                          <div ref={messagesEndRef} />
                      </div>
                  </div>
                  <div className={`${isBuilderOpen ? 'bg-white border-t border-stone-200' : 'bg-white border-t border-stone-100'} z-20 transition-colors`}>
                      <InputArea 
                          ref={inputAreaRef}
                          onSendMessage={handleSendMessage} 
                          disabled={loading} 
                          mode="standard" 
                          placeholder={isBuilderOpen ? "向预览智能体发送指令..." : undefined}
                          onNavigate={onNavigate}
                      />
                  </div>
              </div>
          )}
        </div>

        {isBuilderOpen && chatPanelCollapsed && (
            <div className="absolute left-4 top-4 z-50 animate-in fade-in duration-300">
                <button 
                    onClick={() => setChatPanelCollapsed(false)} 
                    className="p-2 bg-white border border-stone-200 shadow-md rounded-md text-stone-400 hover:text-stone-900 transition-all hover:-translate-y-px active:translate-y-0"
                    title="展开对话"
                >
                    <PanelLeftOpen size={20} />
                </button>
            </div>
        )}

        {selectionPosition && createPortal(
            <div 
              className="fixed z-[9999] bg-stone-900 text-white rounded-md shadow-xl px-2 py-1 flex items-center gap-1 animate-in zoom-in-95 duration-200 transform -translate-x-1/2 border border-stone-700"
              style={{ top: selectionPosition.top, left: selectionPosition.left }}
              onMouseDown={(e) => e.preventDefault()}
            >
                <button onClick={handleCopySelection} className="p-1.5 hover:bg-stone-800 rounded transition-colors flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
                    <Copy size={14} /> Copy
                </button>
                <div className="w-px h-3 bg-stone-700"></div>
                <button onClick={handleQuote} className="p-1.5 hover:bg-stone-800 rounded transition-colors flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
                    <Quote size={14} /> Quote
                </button>
            </div>,
            document.body
        )}

        {isBuilderOpen && !chatPanelCollapsed && (
          <div
              className="w-1 bg-stone-100 hover:bg-sage-500 cursor-col-resize transition-colors z-30 flex items-center justify-center group flex-shrink-0"
              onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
          >
              <div className="w-1 h-12 bg-stone-300 rounded-full group-hover:bg-sage-600 transition-colors"></div>
          </div>
        )}

        {isBuilderOpen && (
            <div 
              style={{ width: chatPanelCollapsed ? '100%' : `${builderWidth}px` }}
              className="h-full bg-white flex flex-col flex-shrink-0 animate-in slide-in-from-right-4 duration-300 shadow-2xl z-20"
            >
                <AgentBuilder 
                    onClose={() => {
                        if (agentToEdit) {
                            onNavigate(ViewState.AGENT_CENTER);
                        } else {
                            setIsBuilderOpen(false);
                        }
                    }} 
                    isLoading={isAgentGenerating}
                    initialConfig={agentConfig}
                    onNavigate={onNavigate}
                    onAiDevelop={handleAiDevFromBuilder}
                    isEditMode={!!agentToEdit}
                    agentNameDisplay={agentToEdit?.name}
                />
            </div>
        )}
      </div>
    </div>
  );
};