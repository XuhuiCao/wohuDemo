import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { AgentCenter } from './components/AgentCenter';
import { KnowledgeBasePage } from './components/KnowledgeBasePage';
import { MyContentPage } from './components/MyContentPage';
import { PlaceholderPage } from './components/PlaceholderPage';
import { GroupPage } from './components/GroupPage';
import { GenerationCenter } from './components/GenerationCenter';
import { MemoryCenter } from './components/MemoryCenter';
import { EvaluationCenter } from './components/EvaluationCenter';
import { AssetMarket } from './components/AssetMarket';
import { Playground } from './pages/Playground';
import { ViewState, ChatSession, Group, Message, Agent } from './types';
import { BrainCircuit, Zap, TestTube, Store, Code2, FlaskConical } from 'lucide-react';
import { MOCK_CHATS } from './constants';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [selectedAgentForCenter, setSelectedAgentForCenter] = useState<Agent | null>(null);
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null);
  
  // Lifted State
  const [chats, setChats] = useState<ChatSession[]>(() => [...MOCK_CHATS].sort((a, b) => b.updatedAt - a.updatedAt));
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([
    { id: '1', name: '工作项目' },
    { id: '2', name: '个人' }
  ]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Handlers
  const handleSelectGroup = (groupId: string) => {
      setSelectedGroupId(groupId);
      setCurrentView(ViewState.GROUP_DETAILS);
  };

  const handleSelectChat = (id: string) => {
      setActiveChatId(id);
      setCurrentView(ViewState.PLAYGROUND);
  };

  const handleUpdateChat = (chatId: string, messages: Message[]) => {
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages, updatedAt: Date.now() } : c));
  };

  const handleCreateChat = (initialMessage: string) => {
      const newId = Date.now().toString();
      const newChat: ChatSession = {
          id: newId,
          title: initialMessage.slice(0, 15) + (initialMessage.length > 15 ? '...' : ''),
          messages: [{
              id: Date.now().toString(),
              role: 'user',
              content: initialMessage,
              timestamp: Date.now()
          }],
          updatedAt: Date.now(),
          groupId: undefined
      };
      
      setChats(prev => [newChat, ...prev]);
      setActiveChatId(newId);
      setCurrentView(ViewState.PLAYGROUND);
      return newId;
  };

  const handleCreateGroup = (name: string) => {
      setGroups([...groups, { id: Date.now().toString(), name }]);
  };

  const handleRenameGroup = (id: string, name: string) => {
      setGroups(groups.map(g => g.id === id ? { ...g, name } : g));
  };

  const handleDeleteGroup = (id: string) => {
      setGroups(groups.filter(g => g.id !== id));
      if (selectedGroupId === id) {
          setCurrentView(ViewState.HOME);
          setSelectedGroupId(null);
      }
  };

  const handleRenameChat = (id: string, title: string) => {
      setChats(chats.map(c => c.id === id ? { ...c, title } : c));
  };

  const handleDeleteChat = (id: string) => {
      setChats(chats.filter(c => c.id !== id));
      if (activeChatId === id) {
          setActiveChatId(null);
          setCurrentView(ViewState.HOME);
      }
  };

  const handleAddChatToGroup = (chatId: string, groupId: string) => {
     setChats(prev => prev.map(c => c.id === chatId ? { ...c, groupId } : c));
     alert("已移动到分组");
  };

  const handleNewChatInGroup = (text: string) => {
      const newChat: ChatSession = {
          id: Date.now().toString(),
          title: text.substring(0, 15) || '新对话',
          messages: [{
              id: Date.now().toString(),
              role: 'user',
              content: text,
              timestamp: Date.now()
          }],
          updatedAt: Date.now(),
          groupId: selectedGroupId || undefined
      };
      
      setChats([newChat, ...chats]);
      setActiveChatId(newChat.id);
      setCurrentView(ViewState.PLAYGROUND);
  };

  const handleViewChange = (view: ViewState) => {
    if (view === ViewState.AGENT_CENTER) {
        setSelectedAgentForCenter(null);
    }
    if (view === ViewState.HOME || view === ViewState.MY_CONTENT) {
        setAgentToEdit(null);
    }
    setCurrentView(view);
  };

  const handleSelectAgentFromContent = (agent: Agent) => {
      setSelectedAgentForCenter(agent);
      setCurrentView(ViewState.AGENT_CENTER);
  };

  const handleEditAgent = (agent: Agent) => {
      setAgentToEdit(agent);
      setCurrentView(ViewState.AGENT_BUILDER);
  };

  // Logic to handle navigation
  const renderContent = () => {
    switch (currentView) {
      case ViewState.AGENT_CENTER:
        return <AgentCenter 
            initialAgent={selectedAgentForCenter} 
            onBack={() => {
                setSelectedAgentForCenter(null);
                setCurrentView(ViewState.HOME);
            }} 
            onEditAgent={handleEditAgent}
        />;
      case ViewState.GENERATION_CENTER:
        return <GenerationCenter onBack={() => setCurrentView(ViewState.HOME)} />;
      case ViewState.MEMORY_CENTER:
        return <MemoryCenter onBack={() => setCurrentView(ViewState.HOME)} />;
      case ViewState.EVALUATION_CENTER:
        return <EvaluationCenter onBack={() => setCurrentView(ViewState.HOME)} />;
      case ViewState.ASSET_MARKET:
        return <AssetMarket onBack={() => setCurrentView(ViewState.HOME)} />;
      case ViewState.KNOWLEDGE_BASE:
        return <KnowledgeBasePage onBack={() => setCurrentView(ViewState.HOME)} />;
      case ViewState.MY_CONTENT:
        return <MyContentPage 
            onBack={() => setCurrentView(ViewState.HOME)} 
            onSelectAgent={handleSelectAgentFromContent}
        />;
      
      case ViewState.GROUP_DETAILS:
        const currentGroup = groups.find(g => g.id === selectedGroupId);
        if (!currentGroup) return <PlaceholderPage title="未找到分组" icon={BrainCircuit} onBack={() => setCurrentView(ViewState.HOME)} />;
        return <GroupPage 
            group={currentGroup} 
            chats={chats} 
            onOpenChat={handleSelectChat}
            onNewChatInGroup={handleNewChatInGroup}
            onBack={() => setCurrentView(ViewState.HOME)} 
        />;

      // New Capabilities
      case ViewState.ALGORITHM_SERVICE:
        return <PlaceholderPage title="算法服务" icon={Code2} color="text-cyan-500" onBack={() => setCurrentView(ViewState.HOME)} />;
      case ViewState.LABORATORY:
        return <PlaceholderPage title="实验室" icon={FlaskConical} color="text-pink-500" onBack={() => setCurrentView(ViewState.HOME)} />;

      case ViewState.HOME:
        return <Playground 
            initialMode="chat" 
            onNavigate={handleViewChange} 
            chatSession={null}
            onUpdateChat={handleUpdateChat}
            onCreateChat={handleCreateChat}
        />;
      case ViewState.PLAYGROUND:
        const activeChat = chats.find(c => c.id === activeChatId);
        return <Playground 
            initialMode="chat" 
            onNavigate={handleViewChange} 
            chatSession={activeChat}
            onUpdateChat={handleUpdateChat}
            onCreateChat={handleCreateChat}
        />;
      case ViewState.AGENT_BUILDER:
        return <Playground 
            initialMode="builder" 
            onNavigate={handleViewChange} 
            agentToEdit={agentToEdit} 
            onUpdateChat={handleUpdateChat}
            onCreateChat={handleCreateChat}
        />;
      default:
        return <Playground initialMode="chat" onNavigate={handleViewChange} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-white text-gray-900 font-sans overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onChangeView={handleViewChange} 
        onNewChat={() => {
            setActiveChatId(null);
            setAgentToEdit(null);
            setCurrentView(ViewState.HOME);
            window.location.hash = ''; 
        }}
        // Passed Data
        chats={chats}
        groups={groups}
        selectedChatId={activeChatId}
        // Passed Actions
        onSelectChat={handleSelectChat}
        onSelectGroup={handleSelectGroup}
        onCreateGroup={handleCreateGroup}
        onRenameGroup={handleRenameGroup}
        onDeleteGroup={handleDeleteGroup}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        onAddChatToGroup={handleAddChatToGroup}
      />
      <main className="flex-1 h-full min-w-0 flex flex-col relative overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;