export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  groupId?: string; 
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'publishing' | 'published';
  avatar?: string;
  type: 'quick' | 'code';
  space?: string;
  lastOperatedAt?: string;
  lastEditedBy?: string;
  lastEditedDate?: string;
}

export interface UIStyle {
  id: string;
  name: string;
  description: string;
  space?: string;
  lastOperatedAt?: string;
  framework?: string;
}

export enum ViewState {
  HOME = 'HOME',
  PLAYGROUND = 'PLAYGROUND',
  GROUP_DETAILS = 'GROUP_DETAILS', 
  AGENT_CENTER = 'AGENT_CENTER',
  AGENT_BUILDER = 'AGENT_BUILDER', 
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE',
  MY_CONTENT = 'MY_CONTENT',
  MEMORY_CENTER = 'MEMORY_CENTER',
  GENERATION_CENTER = 'GENERATION_CENTER',
  EVALUATION_CENTER = 'EVALUATION_CENTER',
  ASSET_MARKET = 'ASSET_MARKET',
  ALGORITHM_SERVICE = 'ALGORITHM_SERVICE',
  LABORATORY = 'LABORATORY'
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  type: string;
  size: string;
  tags?: string[];
  source?: string;
  date?: string;
  hits?: number;
  status?: boolean;
}

export interface Group {
  id: string;
  name: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  category?: string;
  author?: string;
  type: 'official' | 'custom';
}

export interface MCP {
  id: string;
  name: string;
  description: string;
  icon: string;
  category?: string;
  author?: string;
  type: 'official' | 'custom';
}
