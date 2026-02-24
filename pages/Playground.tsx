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
  Settings,
  X,
  Link,
  Eye,
  Lock,
  ChevronDown
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

interface PlaygroundProps {
  initialMode?: 'chat' | 'builder';
  onNavigate: (view: ViewState) => void;
  chatSession?: ChatSession | null;
  onUpdateChat?: (chatId: string, messages: Message[]) => void;
  onCreateChat?: (initialMessage: string) => string;
  onToggleShare?: (chatId: string, isShared: boolean) => void;
  agentToEdit?: Agent | null;
}

export const Playground: React.FC<PlaygroundProps> = ({ 
    initialMode = 'chat', 
    onNavigate, 
    chatSession, 
    onUpdateChat, 
    onCreateChat,
    onToggleShare,
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

  // Sharing states
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const shareButtonRef = useRef<HTMLButtonElement>(null);

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
    // Exit preview mode if session changes
    setIsPreviewMode(false);
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareMenuOpen && shareButtonRef.current && !shareButtonRef.current.contains(e.target as Node)) {
        setShareMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [shareMenuOpen]);

  const handleSelectKey = async () => {
      if (typeof window !== 'undefined' && (window as any).aistudio) {
          await (window as any).aistudio.openSelectKey();
          alert("API Key 已更新，请尝试重新发送消息。");
      }
  };

  const handleSendMessage = async (text: string) => {
    if (isPreviewMode) return;

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

  const handleAiDevFromBuilder = (prompt: string) => {
      setIsBuilderOpen(false);
      if (inputAreaRef.current) {
          inputAreaRef.current.setInput(prev => prev + prompt);
          setTimeout(() => inputAreaRef.current?.focus(), 50);
      }
  };

  const handleToggleShare = () => {
      if (chatSession && onToggleShare) {
          onToggleShare(chatSession.id, !chatSession.isShared);
      }
  };

  const renderSharePanel = () => {
      if (!chatSession) return null;
      const shareUrl = `${window.location.origin}/share/${chatSession.id}`;

      return (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-stone-200 rounded-xl shadow-warm-lg z-[100] py-5 px-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-bold text-stone-900">分享对话</h3>
                  <div 
                      className={`w-10 h-5.5 rounded-full p-0.5 cursor-pointer transition-colors relative ${chatSession.isShared ? 'bg-sage-500' : 'bg-stone-200'}`}
                      onClick={handleToggleShare}
                  >
                      <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${chatSession.isShared ? 'translate-x-4.5' : 'translate-x-0'}`}></div>
                  </div>
              </div>

              {chatSession.isShared ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="text-[11px] text-stone-500 font-medium">任何拥有链接的人都可以查看此对话的只读版本。</p>
                      
                      <div className="relative group">
                          <input 
                              readOnly 
                              value={shareUrl}
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-3 pr-10 py-2.5 text-xs text-stone-600 font-mono focus:outline-none"
                          />
                          <button 
                              onClick={() => {
                                  navigator.clipboard.writeText(shareUrl);
                                  alert("链接已复制到剪贴板");
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-900 transition-colors"
                          >
                              <Copy size={14} />
                          </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                          <button 
                              onClick={() => {
                                  setIsPreviewMode(true);
                                  setShareMenuOpen(false);
                              }}
                              className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-lg text-[11px] font-bold text-stone-700 hover:bg-stone-50 transition-all shadow-warm-xs"
                          >
                              <Eye size={14} /> 预览页面
                          </button>
                          <button 
                              onClick={() => {
                                  window.open(shareUrl, '_blank');
                              }}
                              className="flex items-center justify-center gap-2 px-3 py-2 bg-sage-500 text-white rounded-lg text-[11px] font-bold hover:bg-sage-600 transition-all shadow-sage-btn"
                          >
                              <ExternalLink size={14} /> 打开链接
                          </button>
                      </div>
                  </div>
              ) : (
                  <div className="py-2 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in duration-200">
                      <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-300">
                          <Lock size={20} />
                      </div>
                      <p className="text-[11px] text-stone-400 font-medium px-4">分享已关闭。当前的分享链接已失效，他人无法再通过链接查看对话。</p>
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className={`flex-1 flex flex-col h-full relative overflow-hidden font-sans ${isPreviewMode ? 'bg-[#FAFAF9]' : 'bg-white'}`}>
      {agentToEdit && (
          <div className="h-14 border-b border-stone-100 flex items-center px-6 shrink-0 bg-white z-10 shadow-warm-xs">
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

      {isPreviewMode && (
          <div className="bg-sage-600 text-white px-6 py-2 flex items-center justify-between z-50 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                  <Eye size={14} /> 这是该对话的只读分享预览
              </div>
              <button 
                  onClick={() => setIsPreviewMode(false)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5"
              >
                  返回编辑 <X size={12} />
              </button>
          </div>
      )}

      <div className="flex-1 flex h-full relative overflow-hidden">
        <div 
          className={`flex flex-col h-full transition-all duration-300 ease-out bg-stone-50 relative
              ${isBuilderOpen 
                  ? (chatPanelCollapsed ? 'w-0 opacity-0 overflow-hidden border-none' : 'flex-1 min-w-[350px] border-r border-stone-200') 
                  : 'flex-1 min-w-0 bg-white'}
          `}
        >
          
          {((!isHome || isCreating) && !agentToEdit) && (
              <div className={`h-14 border-b border-stone-100 flex items-center justify-between px-6 z-10 flex-shrink-0 bg-white shadow-warm-xs`}>
                  <div className="flex items-center gap-2 group flex-1 min-w-0">
                      <h1 className="font-bold text-stone-900 truncate text-sm tracking-tight">{chatTitle}</h1>
                      {!isPreviewMode && (
                        <>
                          <button 
                              className="p-1.5 text-stone-300 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-stone-600 transition-all-200 hover:bg-stone-50 rounded" 
                              onClick={() => {
                                  const newTitle = prompt("重命名对话", chatTitle);
                                  if (newTitle) setChatTitle(newTitle);
                              }}
                              title="重命名对话"
                          >
                              <Edit3 size={14} />
                          </button>
                          <button 
                              className="p-1.5 text-stone-300 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-sage-600 transition-all-200 hover:bg-sage-50 rounded" 
                              onClick={autoGenerateTitle} 
                              title="自动生成标题"
                          >
                              <Wand2 size={14} />
                          </button>
                        </>
                      )}
                      {isPreviewMode && <span className="text-[10px] bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest ml-2">READ ONLY</span>}
                  </div>
                  <div className="flex items-center gap-2">
                      {!isPreviewMode && (
                          <div className="relative" ref={shareButtonRef}>
                              <button 
                                onClick={() => setShareMenuOpen(!shareMenuOpen)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${shareMenuOpen ? 'bg-sage-50 text-sage-600 border border-sage-200' : 'text-stone-400 hover:bg-stone-50 hover:text-stone-900'}`}
                              >
                                  <Share2 size={16} />
                                  <span>Share</span>
                                  {chatSession?.isShared && <div className="w-2 h-2 rounded-full bg-sage-500 shadow-sm animate-pulse"></div>}
                              </button>
                              {shareMenuOpen && renderSharePanel()}
                          </div>
                      )}

                      {!isPreviewMode && !isBuilderOpen && (
                          <button onClick={() => setIsBuilderOpen(true)} className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all shadow-inner active-press">
                              Open Builder
                          </button>
                      )}
                      
                      {!isPreviewMode && isBuilderOpen && (
                          <button onClick={() => setChatPanelCollapsed(true)} className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded transition-all-200" title="收起对话">
                              <PanelLeftClose size={18} />
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
                      AI For Infrastructure • 卧虎藏龙
                  </div>
              </div>
          ) : (
              <div className="flex-1 flex flex-col min-h-0">
                  {agentToEdit && !chatPanelCollapsed && !isPreviewMode && (
                      <div className="h-10 px-4 flex items-center border-b border-stone-200 bg-white shrink-0">
                           <h2 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em] flex items-center gap-2">
                               <MessageSquare size={12} className="text-sage-500"/> 测试预览模式
                           </h2>
                      </div>
                  )}
                  <div className={`flex-1 overflow-y-auto p-6 custom-scrollbar ${isBuilderOpen || isPreviewMode ? 'bg-stone-50' : 'bg-white'}`}>
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
                                          <div className={`w-8 h-8 rounded-md flex items-center justify-center text-white mt-1 flex-shrink-0 shadow-warm-xs transition-transform ${isError ? 'bg-red-500' : 'bg-sage-600'}`}>
                                              {isError ? <ShieldAlert size={16} /> : <Bot size={16} />}
                                          </div>
                                      )}
                                      
                                      <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start w-full'}`}>
                                          <div className={`text-[14px] leading-relaxed whitespace-pre-wrap shadow-warm-xs transition-all duration-200 ${
                                              msg.role === 'user' 
                                                  ? 'px-5 py-3 bg-sage-500 text-white rounded-md rounded-tr-sm shadow-sage-btn' 
                                                  : isError 
                                                      ? 'w-full px-6 py-5 bg-red-50 border border-red-200 text-red-900 rounded-lg rounded-tl-sm flex flex-col gap-4' 
                                                      : 'w-full text-stone-900 bg-white border border-stone-200 rounded-md p-5'
                                          }`}>
                                              {isError && <div className="flex items-center gap-2 font-bold text-red-600"><AlertCircle size={16}/> 系统通知</div>}
                                              <div className={isError ? 'opacity-80 leading-relaxed' : ''}>
                                                  {msg.content}
                                              </div>
                                              
                                              {isError && !isPreviewMode && (
                                                  <div className="flex flex-wrap gap-3 pt-2">
                                                      <button 
                                                          onClick={handleSelectKey}
                                                          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-md text-[11px] font-bold hover:bg-red-700 transition-colors shadow-warm-xs uppercase tracking-wider"
                                                      >
                                                          <Settings size={12} /> 更换 API Key
                                                      </button>
                                                      <button 
                                                          onClick={() => handleSendMessage(messages[messages.length - 2]?.content || "")}
                                                          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-md text-[11px] font-bold hover:bg-red-50 transition-colors shadow-warm-xs uppercase tracking-wider"
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
                                                      <button className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded transition-all-200" title="复制" onClick={() => copyToClipboard(msg.content)}>
                                                          <Copy size={14} />
                                                      </button>
                                                  </div>
                                                  <div className="h-3 w-px bg-stone-200"></div>
                                                  <div className="flex items-center gap-1">
                                                      <button className="p-1.5 text-stone-400 hover:text-sage-600 hover:bg-sage-50 rounded transition-all-200" title="好评">
                                                          <ThumbsUp size={14} />
                                                      </button>
                                                      <button className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-all-200" title="差评">
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
                                  <div className="w-8 h-8 rounded-md bg-sage-500 flex items-center justify-center text-white mt-1 flex-shrink-0 animate-pulse shadow-warm-xs">
                                      <Bot size={16} />
                                  </div>
                                  <div className="flex items-center gap-1.5 h-10 px-4 bg-white border border-stone-100 rounded-md shadow-warm-xs">
                                      <span className="w-1.5 h-1.5 bg-sage-300 rounded-full animate-bounce"></span>
                                      <span className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                                      <span className="w-1.5 h-1.5 bg-sage-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                  </div>
                              </div>
                          )}
                          <div ref={messagesEndRef} />
                      </div>
                  </div>
                  {!isPreviewMode && (
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
                  )}
                  {isPreviewMode && (
                      <div className="h-20 bg-white border-t border-stone-100 flex items-center justify-center text-stone-400 text-xs font-bold uppercase tracking-[0.2em] shadow-inner z-20">
                          Shared via Wohu AI Platform
                      </div>
                  )}
              </div>
          )}
        </div>

        {isBuilderOpen && chatPanelCollapsed && (
            <div className="absolute left-4 top-4 z-50 animate-in fade-in duration-300">
                <button 
                    onClick={() => setChatPanelCollapsed(false)} 
                    className="p-2 bg-white border border-stone-200 shadow-warm-md rounded-md text-stone-400 hover:text-stone-900 transition-all hover-lift active-press"
                    title="展开对话"
                >
                    <PanelLeftOpen size={20} />
                </button>
            </div>
        )}

        {selectionPosition && createPortal(
            <div 
              className="fixed z-[9999] bg-stone-900 text-white rounded-md shadow-warm-lg px-2 py-1 flex items-center gap-1 animate-in zoom-in-95 duration-200 transform -translate-x-1/2 border border-stone-700"
              style={{ top: selectionPosition.top, left: selectionPosition.left }}
              onMouseDown={(e) => e.preventDefault()}
            >
                <button onClick={handleCopySelection} className="p-1.5 hover:bg-stone-800 rounded transition-colors flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
                    <Copy size={14} /> Copy
                </button>
                {!isPreviewMode && (
                    <>
                        <div className="w-px h-3 bg-stone-700"></div>
                        <button onClick={handleQuote} className="p-1.5 hover:bg-stone-800 rounded transition-colors flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
                            <Quote size={14} /> Quote
                        </button>
                    </>
                )}
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
              className="h-full bg-white flex flex-col flex-shrink-0 animate-in slide-in-from-right-4 duration-300 shadow-warm-lg z-20"
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