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
  // Add missing MessageSquare icon
  MessageSquare
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

  // Agent Building State
  const [isAgentGenerating, setIsAgentGenerating] = useState(false);
  const [agentConfig, setAgentConfig] = useState<AgentConfig | null>(null);

  // Builder Panel Resize State
  const [builderWidth, setBuilderWidth] = useState(650);
  const [isResizing, setIsResizing] = useState(false);

  // Selection State
  const [selectionPosition, setSelectionPosition] = useState<{top: number, left: number} | null>(null);
  const [selectedText, setSelectedText] = useState("");

  // Determine if we are in "Home" state (no active session yet)
  const isHome = !chatSession && messages.length === 0;

  // Sync state with prop
  useEffect(() => {
    if (chatSession) {
        setMessages(chatSession.messages);
        setChatTitle(chatSession.title);
        setIsCreating(false);
    } else if (!isCreating) {
        setMessages([]);
        setChatTitle("新对话");
    }
  }, [chatSession?.id, chatSession?.messages.length]);

  // Set up agent to edit if provided
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

  // Resizing Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      // Constraints
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
      document.body.style.userSelect = 'none'; // Prevent text selection while resizing
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [isResizing]);

  // Handle Text Selection
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
          geminiService.refreshClient();
          alert("API Key 已更新，请重新发送消息。");
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
      let fullResponse = "";
      const modelMsgId = (Date.now() + 1).toString();
      
      const modelMsg: Message = {
          id: modelMsgId,
          role: 'model',
          content: "",
          timestamp: Date.now()
      };

      setMessages(prev => [...prev, modelMsg]);

      const stream = await geminiService.sendMessageStream(text);
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
      const isKeyNotFoundError = error.message?.includes("Requested entity was not found");

      let displayMessage = error.message || "抱歉，遇到了一些问题。请检查网络或 API Key。";
      
      if (isKeyNotFoundError) {
          displayMessage = "API Key 校验失败。请点击下方按钮重新选择有效的 API Key。";
      }

      const errorMsg: Message = {
          id: Date.now().toString(),
          role: 'model',
          content: displayMessage,
          timestamp: Date.now()
      };
      
      setMessages(prev => {
          const baseMsgs = prev.filter(m => m.content !== ""); // Remove the empty streaming placeholder
          const newMsgs = [...baseMsgs, errorMsg];
          if (currentChatId && onUpdateChat) {
             onUpdateChat(currentChatId, newMsgs);
          }
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
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-white">
      {/* Top Breadcrumb Bar (Contextual Header) */}
      {agentToEdit && (
          <div className="h-14 border-b border-gray-100 flex items-center px-6 shrink-0 bg-white z-10">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Box size={16} className="text-gray-400" />
                    <span>崇启的空间</span>
                    <ChevronRight size={14} className="text-gray-300 mx-1" />
                    <span className="hover:text-gray-900 cursor-pointer" onClick={() => onNavigate(ViewState.AGENT_CENTER)}>智能体</span>
                    <ChevronRight size={14} className="text-gray-300 mx-1" />
                    <span className="font-medium text-gray-900 truncate max-w-[200px]">{agentToEdit.name}</span>
                </div>
          </div>
      )}

      <div className="flex-1 flex h-full relative overflow-hidden">
        {/* Left Panel: Chat Area */}
        <div 
          className={`flex flex-col h-full transition-all duration-75 ease-linear bg-[#F7F8FA] relative
              ${isBuilderOpen 
                  ? (chatPanelCollapsed ? 'w-0 opacity-0 overflow-hidden border-none' : 'flex-1 min-w-[350px] border-r border-gray-200') 
                  : 'flex-1 min-w-0 bg-white'}
          `}
        >
          
          {/* Chat Header (Title/Tools) - Only shown if not in breadcrumb context or if breadcrumb is above */}
          {((!isHome || isCreating) && !agentToEdit) && (
              <div className={`h-14 border-b border-gray-100 flex items-center justify-between px-6 z-10 flex-shrink-0 ${isBuilderOpen ? 'bg-[#F7F8FA]/50 backdrop-blur-sm' : 'bg-white'}`}>
                  <div className="flex items-center gap-2 group flex-1 min-w-0">
                      <h1 className="font-semibold text-gray-800 truncate text-sm">{chatTitle}</h1>
                      <button 
                          className="p-1 text-gray-300 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-gray-600 transition-colors" 
                          onClick={() => {
                              const newTitle = prompt("重命名对话", chatTitle);
                              if (newTitle) setChatTitle(newTitle);
                          }}
                          title="重命名对话"
                      >
                          <Edit3 size={14} />
                      </button>
                      <button 
                          className="p-1 text-gray-300 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-purple-600 transition-colors" 
                          onClick={autoGenerateTitle} 
                          title="自动生成标题"
                      >
                          <Wand2 size={14} />
                      </button>
                  </div>
                  <div className="flex items-center gap-2">
                      {!isBuilderOpen && (
                          <button onClick={() => setIsBuilderOpen(true)} className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-100 text-gray-600">
                              打开构建器
                          </button>
                      )}
                      
                      {isBuilderOpen && (
                          <>
                              <button onClick={() => setChatPanelCollapsed(true)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg" title="收起对话">
                                  <PanelLeftClose size={18} />
                              </button>
                          </>
                      )}

                      {!isBuilderOpen && (
                          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                              <Share2 size={16} />
                          </button>
                      )}
                  </div>
              </div>
          )}

          {/* Chat Content */}
          {isHome && !isCreating && !agentToEdit ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white">
                  <div className="mb-14 text-center relative z-10">
                      <h2 className="text-4xl font-bold text-[#333] tracking-tight drop-shadow-sm font-sans mb-12">你只管说，剩下的交给卧虎。</h2>
                  </div>
                  
                  <InputArea 
                      ref={inputAreaRef} 
                      onSendMessage={handleSendMessage} 
                      disabled={loading} 
                      mode="centered" 
                      onNavigate={onNavigate}
                  />
                  
                  <div className="absolute bottom-8 text-xs text-gray-300 font-medium">
                      AI For Frontend, Frontend For AI.
                  </div>
              </div>
          ) : (
              <div className="flex-1 flex flex-col min-h-0">
                  {agentToEdit && !chatPanelCollapsed && (
                      <div className="h-10 px-4 flex items-center border-b border-gray-200 bg-white shrink-0">
                           <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                               <MessageSquare size={12}/> 测试预览
                           </h2>
                      </div>
                  )}
                  <div className={`flex-1 overflow-y-auto p-4 custom-scrollbar ${isBuilderOpen ? 'bg-[#F7F8FA]' : 'bg-white'}`}>
                      <div className={`mx-auto pb-4 ${isBuilderOpen ? 'max-w-full px-4' : 'max-w-4xl px-8'}`}>
                          {messages.length === 0 && agentToEdit && (
                              <div className="py-20 flex flex-col items-center justify-center text-gray-300">
                                  <Bot size={48} className="mb-4 opacity-20" />
                                  <p className="text-sm font-medium">在此测试正在编辑的智能体效果...</p>
                              </div>
                          )}
                          {messages.map((msg, idx) => {
                              const isError = msg.content.includes("配额已耗尽") || msg.content.includes("校验失败") || msg.content.includes("遇到了一些问题");
                              return (
                                  <div key={msg.id} className={`flex gap-4 mb-8 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                      {msg.role === 'model' && (
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white mt-1 flex-shrink-0 shadow-sm ${isError ? 'bg-red-500' : 'bg-[#55635C]'}`}>
                                              {isError ? <ShieldAlert size={16} /> : <Bot size={16} />}
                                          </div>
                                      )}
                                      
                                      <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start w-full'}`}>
                                          <div className={`text-sm leading-relaxed whitespace-pre-wrap shadow-sm transition-all duration-300 ${
                                              msg.role === 'user' 
                                                  ? 'px-5 py-3 bg-[#55635C] text-white rounded-2xl rounded-tr-sm' 
                                                  : isError 
                                                      ? 'w-full px-5 py-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl rounded-tl-sm' 
                                                      : 'w-full text-gray-800'
                                          }`}>
                                              {msg.content}
                                              
                                              {isError && (
                                                  <div className="mt-4 flex gap-3">
                                                      {msg.content.includes("配额") ? (
                                                          <a 
                                                              href="https://ai.google.dev/gemini-api/docs/billing" 
                                                              target="_blank" 
                                                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
                                                          >
                                                              查看账单文档 <Share2 size={12} />
                                                          </a>
                                                      ) : msg.content.includes("API Key") ? (
                                                          <button 
                                                              onClick={handleSelectKey}
                                                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
                                                          >
                                                              重新选择 API Key
                                                          </button>
                                                      ) : null}
                                                      <button 
                                                          onClick={() => handleSendMessage(messages[messages.length - 2]?.content || "")}
                                                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                                                      >
                                                          <RefreshCw size={12} /> 重试
                                                      </button>
                                                  </div>
                                              )}
                                          </div>

                                          {msg.role === 'model' && !loading && !isError && (
                                              <div className="flex items-center gap-4 mt-2 pl-0 animate-in fade-in duration-300">
                                                  <div className="flex items-center gap-1">
                                                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="复制" onClick={() => copyToClipboard(msg.content)}>
                                                          <Copy size={14} />
                                                      </button>
                                                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="复制 Markdown">
                                                          <FileText size={14} />
                                                      </button>
                                                  </div>
                                                  <div className="h-3 w-px bg-gray-200"></div>
                                                  <div className="flex items-center gap-1">
                                                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="好评">
                                                          <ThumbsUp size={14} />
                                                      </button>
                                                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="差评">
                                                          <ThumbsDown size={14} />
                                                      </button>
                                                  </div>
                                                  <div className="h-3 w-px bg-gray-200"></div>
                                                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="重新生成">
                                                      <RefreshCw size={14} />
                                                  </button>
                                                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="分享">
                                                      <Share2 size={14} />
                                                  </button>
                                                  <button 
                                                      className="p-1.5 text-gray-400 hover:text-[#55635C] hover:bg-gray-100 rounded transition-colors flex items-center gap-1 group" 
                                                      title="加入知识库"
                                                      onClick={() => addToKnowledgeBase(msg.content)}
                                                  >
                                                      <BookPlus size={14} />
                                                      <span className="text-xs w-0 overflow-hidden group-hover:w-auto transition-all">存为知识</span>
                                                  </button>
                                              </div>
                                          )}

                                          {msg.role === 'model' && idx === messages.length - 1 && !loading && !isError && (
                                              <div className="flex flex-wrap gap-2 mt-4 animate-in slide-in-from-bottom-2 duration-500">
                                                  <button onClick={() => handleSendMessage("这个怎么实现？")} className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-full text-xs text-gray-500 hover:text-gray-800 transition-colors">
                                                      这个怎么实现？
                                                  </button>
                                                  <button onClick={() => handleSendMessage("举个具体的例子")} className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-full text-xs text-gray-500 hover:text-gray-800 transition-colors">
                                                      举个具体的例子
                                                  </button>
                                              </div>
                                          )}
                                      </div>

                                      {msg.role === 'user' && (
                                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mt-1 flex-shrink-0 border border-gray-200">
                                              <User size={16} />
                                          </div>
                                      )}
                                  </div>
                              );
                          })}
                          {loading && (
                              <div className="flex gap-4">
                                  <div className="w-8 h-8 rounded-full bg-[#55635C] flex items-center justify-center text-white mt-1 flex-shrink-0 animate-pulse">
                                      <Bot size={16} />
                                  </div>
                                  <div className="flex items-center gap-1 h-10">
                                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                  </div>
                              </div>
                          )}
                          <div ref={messagesEndRef} />
                      </div>
                  </div>
                  <div className={`${isBuilderOpen ? 'bg-white border-t border-gray-200' : 'bg-white border-t border-gray-100'} z-20`}>
                      <InputArea 
                          ref={inputAreaRef}
                          onSendMessage={handleSendMessage} 
                          disabled={loading} 
                          mode="standard" 
                          placeholder={isBuilderOpen ? "分配任务或向我咨询任何问题吧~" : undefined}
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
                    className="p-2 bg-white border border-gray-200 shadow-lg rounded-lg text-gray-600 hover:text-brand-600 hover:border-brand-200 transition-all"
                    title="展开对话"
                >
                    <PanelLeftOpen size={20} />
                </button>
            </div>
        )}

        {selectionPosition && createPortal(
            <div 
              className="fixed z-[9999] bg-gray-900 text-white rounded-lg shadow-xl px-2 py-1 flex items-center gap-1 animate-in zoom-in-95 duration-200 transform -translate-x-1/2"
              style={{ top: selectionPosition.top, left: selectionPosition.left }}
              onMouseDown={(e) => e.preventDefault()}
            >
                <button onClick={handleCopySelection} className="p-1.5 hover:bg-gray-700 rounded transition-colors flex items-center gap-1 text-xs font-medium">
                    <Copy size={14} /> 复制
                </button>
                <div className="w-px h-3 bg-gray-700"></div>
                <button onClick={handleQuote} className="p-1.5 hover:bg-gray-700 rounded transition-colors flex items-center gap-1 text-xs font-medium">
                    <Quote size={14} /> 引用
                </button>
            </div>,
            document.body
        )}

        {/* Resize Handle */}
        {isBuilderOpen && !chatPanelCollapsed && (
          <div
              className="w-1 bg-gray-100 hover:bg-brand-500 cursor-col-resize transition-colors z-30 flex items-center justify-center group flex-shrink-0"
              onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
          >
              <div className="w-1 h-8 bg-gray-300 rounded-full group-hover:bg-brand-600 transition-colors"></div>
          </div>
        )}

        {/* Right Panel: Agent Builder */}
        {isBuilderOpen && (
            <div 
              style={{ width: chatPanelCollapsed ? '100%' : `${builderWidth}px` }}
              className="h-full bg-white flex flex-col flex-shrink-0 animate-in slide-in-from-right-4 duration-300 shadow-xl"
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