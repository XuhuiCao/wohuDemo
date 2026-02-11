import { Agent, ChatSession, KnowledgeDoc, UIStyle, Skill, MCP } from './types';

export const MOCK_AGENTS: Agent[] = [
  { 
      id: '1', 
      name: '${智能体名称}', 
      description: '可自动生成简介描述可自动生成简介描述可自动生成简介描述', 
      version: '1.0.2', 
      status: 'publishing', 
      type: 'quick', 
      space: '崇启的空间', 
      lastOperatedAt: '10分钟前',
      lastEditedBy: '${编辑人}',
      lastEditedDate: '01-21'
  },
  { 
      id: '2', 
      name: '${智能体名称}', 
      description: '可自动生成简介描述可自动生成简介描述可自动生成简介描述', 
      version: '0.9.0', 
      status: 'draft', 
      type: 'code', 
      space: '崇启的空间', 
      lastOperatedAt: '2小时前',
      lastEditedBy: '${编辑人}',
      lastEditedDate: '01-21'
  },
  { 
      id: '3', 
      name: '${智能体名称}', 
      description: '可自动生成简介描述可自动生成简介描述可自动生成简介描述', 
      version: '2.1.0', 
      status: 'published', 
      type: 'code', 
      space: '崇启的空间', 
      lastOperatedAt: '刚刚',
      lastEditedBy: '${编辑人}',
      lastEditedDate: '01-21'
  },
  { 
      id: '4', 
      name: '${智能体名称}', 
      description: '可自动生成简介描述可自动生成简介描述可自动生成简介描述', 
      version: '1.0.0', 
      status: 'publishing', 
      type: 'quick', 
      space: '崇启的空间', 
      lastEditedBy: '${编辑人}',
      lastEditedDate: '01-21'
  },
  { 
      id: '5', 
      name: '${智能体名称}', 
      description: '可自动生成简介描述可自动生成简介描述可自动生成简介描述', 
      version: '1.0.0', 
      status: 'draft', 
      type: 'quick', 
      space: '崇启的空间', 
      lastEditedBy: '${编辑人}',
      lastEditedDate: '01-21'
  },
  { 
      id: '6', 
      name: '${智能体名称}', 
      description: '可自动生成简介描述可自动生成简介描述可自动生成简介描述', 
      version: '1.0.0', 
      status: 'published', 
      type: 'quick', 
      space: '崇启的空间', 
      lastEditedBy: '${编辑人}',
      lastEditedDate: '01-21'
  },
  { 
      id: '7', 
      name: '${智能体名称}', 
      description: '可自动生成简介描述可自动生成简介描述可自动生成简介描述', 
      version: '1.0.0', 
      status: 'publishing', 
      type: 'quick', 
      space: '崇启的空间', 
      lastEditedBy: '${编辑人}',
      lastEditedDate: '01-21'
  },
  { 
      id: '8', 
      name: '${智能体名称}', 
      description: '可自动生成简介描述可自动生成简介描述可自动生成简介描述', 
      version: '1.0.0', 
      status: 'draft', 
      type: 'quick', 
      space: '崇启的空间', 
      lastEditedBy: '${编辑人}',
      lastEditedDate: '01-21'
  },
];

export const MOCK_UI_STYLES: UIStyle[] = [
  { 
      id: 'u1', 
      name: '极简个人主页', 
      description: '响应式个人作品集主页，包含 Hero section 和项目展示网格', 
      space: '个人空间', 
      lastOperatedAt: '5小时前',
      framework: 'React'
  },
  { 
      id: 'u2', 
      name: 'SaaS 登录表单', 
      description: '包含社交登录、表单验证和密码找回功能的现代化登录界面', 
      space: 'UI 组件库', 
      lastOperatedAt: '1天前',
      framework: 'Vue'
  },
  { 
      id: 'u3', 
      name: '数据看板布局', 
      description: '三栏式布局，左侧导航，顶部搜索，中间内容区，适配 Tailwind CSS', 
      space: '后台系统', 
      lastOperatedAt: '3天前',
      framework: 'HTML/CSS'
  },
];

export const MOCK_DOCS: KnowledgeDoc[] = [
  { id: '1', title: '基础功能实现', tags: ['#minifish-step2'], type: 'Doc', size: '2.4MB', source: '语雀文档', date: '2025/12/10 10:31', hits: 73, status: true },
  { id: '2', title: '[deprecated]@ali/mini 小程序命令行研发工具', tags: ['#mini'], type: 'Doc', size: '45KB', source: '语雀文档', date: '2025/12/10 10:31', hits: 35, status: true },
  { id: '3', title: '课后考试', tags: ['#minifish-step4'], type: 'Doc', size: '1.2MB', source: '语雀文档', date: '2025/12/10 10:31', hits: 10, status: true },
  { id: '4', title: '应用发布', tags: ['#minifish-step3'], type: 'Doc', size: '1.2MB', source: '语雀文档', date: '2025/12/10 10:31', hits: 1, status: true },
  { id: '5', title: '培训课程', tags: ['#courses'], type: 'Doc', size: '1.2MB', source: '语雀文档', date: '2025/12/10 10:31', hits: 19, status: true },
  { id: '6', title: '应用发布', tags: ['#smallfish-step3'], type: 'Doc', size: '1.2MB', source: '语雀文档', date: '2025/12/10 10:31', hits: 10, status: true },
];

export const MOCK_CHATS: ChatSession[] = [
  { id: 'c1', title: 'React 组件重构', messages: [], updatedAt: Date.now() - 100000, groupId: '1' },
  { id: 'c2', title: '营销文案生成', messages: [], updatedAt: Date.now() - 500000, groupId: '2' },
];

export const OFFICIAL_SKILLS: Skill[] = [
  { id: 'llm', name: '大语言模型', description: '支持豆包、DeepSeek、Kimi 等主流模型', icon: 'Bot', category: '官方技能', type: 'official' },
  { id: 'img_gen', name: '生图大模型', description: '基于文字与图片，生成高质量图片', icon: 'Image', category: '官方技能', type: 'official' },
  { id: 'video_gen', name: '视频生成大模型', description: '基于文字与图片，生成高清流畅的影视级视频', icon: 'Video', category: '官方技能', type: 'official' },
  { id: 'voice', name: '语音大模型', description: '具备语音识别、合成等语音能力', icon: 'Mic', category: '官方技能', type: 'official' },
  { id: 'embedding', name: '向量大模型', description: '基于embedding实现语义分析与检索', icon: 'Network', category: '官方技能', type: 'official' },
  { id: 'search', name: '联网搜索', description: '全网的公开网页信息搜索', icon: 'Globe', category: '官方技能', type: 'official' },
  { id: 'knowledge', name: '知识库', description: '关联并检索私有知识库内容', icon: 'BookOpen', category: '官方技能', type: 'official' },
  { id: 'content', name: '内容处理', description: '支持多模态的内容处理', icon: 'FileText', category: '官方技能', type: 'official' },
  { id: 'storage', name: '对象存储', description: '提供云端文件存储能力', icon: 'HardDrive', category: '官方技能', type: 'official' },
];

export const MY_SKILLS: Skill[] = [
    { id: 'custom_1', name: '查询销售数据', description: '连接内部 CRM 查询当日销售额', icon: 'Database', category: '我的技能', author: 'Me', type: 'custom' },
    { id: 'custom_2', name: '发送飞书通知', description: '通过 Webhook 发送消息到飞书群', icon: 'Send', category: '我的技能', author: 'Me', type: 'custom' },
];

export const OFFICIAL_MCPS: MCP[] = [
  { id: 'mcp_gh', name: 'GitHub MCP', description: '管理仓库、Issues 和 PR', icon: 'GitBranch', category: '官方 MCP', type: 'official' },
  { id: 'mcp_linear', name: 'Linear MCP', description: '查看和管理 Linear 任务', icon: 'ListTodo', category: '官方 MCP', type: 'official' },
  { id: 'mcp_postgres', name: 'PostgreSQL', description: '只读访问生产数据库', icon: 'Database', category: '官方 MCP', type: 'official' },
  { id: 'mcp_slack', name: 'Slack', description: '读取和发送 Slack 消息', icon: 'MessageSquare', category: '官方 MCP', type: 'official' },
];

export const MY_MCPS: MCP[] = [
  { id: 'mcp_custom_1', name: '内部 API 网关', description: '访问公司内部微服务接口', icon: 'Server', category: '我的 MCP', author: 'Me', type: 'custom' },
];
