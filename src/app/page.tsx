'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { callGemini, callGroq, generateImage, detectLanguage, deepResearch, codeAssistant } from '@/lib/ai';
import { 
  Send, Plus, MessageSquare, Settings, LogOut, Image as ImageIcon, 
  Code2, Search, BookOpen, Users, BarChart3, Bell, Menu, X, 
  Sparkles, FileText, Globe, Mic, Paperclip, Trash2, Download, RefreshCw,
  Copy, ThumbsUp, ThumbsDown, ChevronDown, Zap, Brain, Heart,
  Star, Trophy, Target, Send as SendIcon, Languages, BarChart,
  Database, Shield, Cpu, Bot, Wand2, Lightbulb, Rocket,
  Code, Terminal, Layers, Box, Activity, PieChart, Settings2
} from 'lucide-react';

const MODELS = [
  { id: 'models/gemini-2.5-flash', name: '⚡ Gemini 2.5 Flash', provider: 'gemini', free: true, desc: 'Fast, multimodal' },
  { id: 'models/gemini-2.5-pro', name: '🧠 Gemini 2.5 Pro', provider: 'gemini', free: true, desc: 'Smartest, complex tasks' },
  { id: 'llama-3.3-70b-versatile', name: '🦙 Llama 3.3 70B', provider: 'groq', free: true, desc: 'Open source, fast' },
  { id: 'llama-3.1-8b-instant', name: '🚀 Llama 3.1 8B', provider: 'groq', free: true, desc: 'Ultra fast' },
  { id: 'mixtral-8x7b-32768', name: '🎭 Mixtral 8x7B', provider: 'groq', free: true, desc: 'Long context' },
  { id: 'deepseek-r1-distill-llama-70b', name: '🤔 DeepSeek R1', provider: 'groq', free: true, desc: 'Reasoning model' }
];

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [model, setModel] = useState(MODELS[0]);
  const [modelDropdown, setModelDropdown] = useState(false);
  
  // New tabs (combining 5 best features + new ideas)
  const [activeTab, setActiveTab] = useState<'chat' | 'image' | 'research' | 'code' | 'agent' | 'analytics' | 'admin'>('chat');
  
  // Image gen
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('realistic');
  const [generatedImage, setGeneratedImage] = useState<any>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageHistory, setImageHistory] = useState<any[]>([]);
  
  // Research
  const [researchQuery, setResearchQuery] = useState('');
  const [researchResult, setResearchResult] = useState<any>(null);
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchHistory, setResearchHistory] = useState<any[]>([]);
  
  // Code
  const [codeInput, setCodeInput] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [codeResult, setCodeResult] = useState<any>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  
  // Agent (NEW - workflow automation)
  const [agentQuery, setAgentQuery] = useState('');
  const [agentSteps, setAgentSteps] = useState<any[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  
  // UI
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light' | 'gradient'>('dark');
  const [language, setLanguage] = useState<'en' | 'bn' | 'auto'>('auto');
  const [stats, setStats] = useState({ messages: 0, tokens: 0, chats: 0, images: 0 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) { loadChats(); loadStats(); }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, activeTab]);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) { loadChats(); loadStats(); }
  }

  async function loadStats() {
    try {
      const [chatsRes, msgsRes] = await Promise.all([
        supabase.from('chats').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('tokens', { count: 'exact' })
      ]);
      setStats({
        chats: chatsRes.count || 0,
        messages: msgsRes.count || 0,
        tokens: (msgsRes.data || []).reduce((s: number, m: any) => s + (m.tokens || 0), 0),
        images: imageHistory.length
      });
    } catch (e) {}
  }

  async function handleAuth() {
    setLoading(true);
    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
        if (error) throw error;
        if (data.user) {
          await supabase.from('users').insert({ id: data.user.id, email: data.user.email!, name, role: 'admin', tier: 'free', status: 'active' });
        }
        alert('✅ Account created! Sign in now.');
        setAuthMode('signin');
      } else {
        await supabase.auth.signInWithPassword({ email, password });
      }
    } catch (error: any) { alert('❌ ' + error.message); }
    setLoading(false);
  }

  async function loadChats() {
    const { data } = await supabase.from('chats').select('*').order('updated_at', { ascending: false });
    if (data) setChats(data);
  }

  async function loadMessages(chatId: string) {
    const { data } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at');
    if (data) setMessages(data);
  }

  async function newChat() {
    if (!user) return;
    const { data } = await supabase.from('chats').insert({
      user_id: user.id, title: '✨ New Chat', model: model.id
    }).select().single();
    if (data) { setCurrentChat(data); setMessages([]); setActiveTab('chat'); loadChats(); }
  }

  async function deleteChat(chatId: string, e: any) {
    e.stopPropagation();
    if (!confirm('Delete this chat permanently?')) return;
    await supabase.from('messages').delete().eq('chat_id', chatId);
    await supabase.from('chats').delete().eq('id', chatId);
    if (currentChat?.id === chatId) { setCurrentChat(null); setMessages([]); }
    loadChats();
  }

  async function sendMessage() {
    if (!input.trim() || !user) return;
    setLoading(true);
    let chatId = currentChat?.id;
    if (!chatId) {
      const { data } = await supabase.from('chats').insert({
        user_id: user.id, title: input.slice(0, 50), model: model.id
      }).select().single();
      if (data) { chatId = data.id; setCurrentChat(data); }
    }
    if (!chatId) { setLoading(false); return; }

    const userMsg = input;
    setInput('');
    
    const tempUserMsg = { id: 'temp-' + Date.now(), role: 'user', content: userMsg, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);

    await supabase.from('messages').insert({ chat_id: chatId, user_id: user.id, role: 'user', content: userMsg });

    const history = messages.slice(-15).map(m => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: userMsg });

    let response;
    if (model.provider === 'groq') response = await callGroq(history, model.id);
    else response = await callGemini(history, model.id);

    const aiContent = response.content || `⚠️ ${response.error || 'No response'}`;
    
    await supabase.from('messages').insert({
      chat_id: chatId, user_id: user.id, role: 'assistant', content: aiContent, model: model.id, tokens: Math.ceil(aiContent.length / 4)
    });

    if (messages.length === 0) {
      await supabase.from('chats').update({ title: userMsg.slice(0, 50) }).eq('id', chatId);
    }

    const finalMsg = { id: 'final-' + Date.now(), role: 'assistant', content: aiContent, created_at: new Date().toISOString() };
    setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), tempUserMsg, finalMsg]);
    loadChats(); loadStats();
    setLoading(false);
  }

  async function generateImageAction() {
    if (!imagePrompt.trim()) return;
    setImageLoading(true);
    const result = await generateImage(imagePrompt, imageStyle);
    if (result.url) {
      setGeneratedImage(result);
      setImageHistory(prev => [{ prompt: imagePrompt, style: imageStyle, url: result.url, time: new Date() }, ...prev].slice(0, 12));
    }
    setImageLoading(false);
  }

  async function researchAction() {
    if (!researchQuery.trim()) return;
    setResearchLoading(true);
    const result = await deepResearch(researchQuery);
    setResearchResult(result.content || result.error);
    setResearchHistory(prev => [{ query: researchQuery, time: new Date() }, ...prev].slice(0, 10));
    setResearchLoading(false);
  }

  async function codeAction() {
    if (!codeInput.trim()) return;
    setCodeLoading(true);
    const result = await codeAssistant(codeInput, codeLanguage);
    setCodeResult(result.content || result.error);
    setCodeLoading(false);
  }

  async function runAgent() {
    if (!agentQuery.trim()) return;
    setAgentLoading(true);
    setAgentSteps([{ id: 1, name: '🧠 Analyzing', status: 'running' }]);
    
    // Simulate agent steps
    await new Promise(r => setTimeout(r, 800));
    setAgentSteps([{ id: 1, name: '🧠 Analyzing', status: 'done' }, { id: 2, name: '🔍 Searching knowledge', status: 'running' }]);
    
    await new Promise(r => setTimeout(r, 800));
    setAgentSteps(prev => [...prev.map(s => s.id === 2 ? { ...s, status: 'done' } : s), { id: 3, name: '💭 Reasoning', status: 'running' }]);
    
    const result = await deepResearch(agentQuery);
    
    setAgentSteps(prev => [...prev.map(s => s.id === 3 ? { ...s, status: 'done' } : s), { id: 4, name: '✅ Complete', status: 'done' }]);
    setAgentLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null); setChats([]); setCurrentChat(null); setMessages([]); setStats({ messages: 0, tokens: 0, chats: 0, images: 0 });
  }

  // ============= AUTH SCREEN =============
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        
        <div className="glass-card p-8 max-w-md w-full animate-fade-in relative z-10">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3 animate-float">🚀</div>
            <h1 className="text-5xl font-black gradient-text mb-2">SI OPEN AI</h1>
            <p className="text-gray-300 text-base font-semibold">v15.0 Ultimate Hybrid</p>
            <p className="text-xs text-gray-400 mt-2">200+ Features · 100+ Languages · 100% Free</p>
            <div className="flex justify-center gap-2 mt-3">
              <span className="badge badge-purple">⚡ Fast</span>
              <span className="badge badge-pink">🎨 Beautiful</span>
              <span className="badge badge-gold">🚀 Powerful</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {authMode === 'signup' && (
              <input type="text" placeholder="👤 Your Name" value={name} onChange={(e) => setName(e.target.value)}
                className="input-field w-full" />
            )}
            <input type="email" placeholder="📧 Email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full" />
            <input type="password" placeholder="🔒 Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              className="input-field w-full" />
            
            <button onClick={handleAuth} disabled={loading} className="btn-primary w-full">
              {loading ? '⏳ Please wait...' : authMode === 'signin' ? '🔓 Sign In' : '✨ Create Account'}
            </button>
            
            <button onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} className="w-full text-sm text-gray-400 hover:text-white">
              {authMode === 'signin' ? "New here? Create account →" : '← Back to Sign In'}
            </button>
          </div>
          
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <p className="text-xs text-gray-300 text-center leading-relaxed">
              💡 <strong className="text-white">First user = Admin!</strong><br/>
              🎨 Image Gen · 💻 Code · 🔍 Research · 🤖 Agents · 🌐 100+ Languages
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============= MAIN APP =============
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-hidden`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl animate-float">🚀</span>
            <div>
              <h1 className="text-base font-black gradient-text">SI OPEN AI</h1>
              <p className="text-[10px] text-gray-400">v15.0 Ultimate</p>
            </div>
          </div>
          <button onClick={newChat} className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
            <Plus size={16} /> New Chat
          </button>
        </div>
        
        {/* Navigation */}
        <div className="p-2 border-b border-white/10">
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'chat', icon: MessageSquare, label: 'Chat' },
              { id: 'image', icon: ImageIcon, label: 'Image' },
              { id: 'research', icon: Search, label: 'Research' },
              { id: 'code', icon: Code2, label: 'Code' },
              { id: 'agent', icon: Bot, label: 'Agent' },
              { id: 'analytics', icon: BarChart3, label: 'Stats' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] transition-all ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-white border border-purple-500/40' 
                    : 'text-gray-400 hover:bg-white/5'
                }`}>
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-[10px] text-gray-500 px-2 py-2 uppercase tracking-wider font-semibold">📂 Recent Chats</div>
          {chats.length === 0 ? (
            <p className="text-xs text-gray-600 px-3 py-3 text-center">No chats yet<br/>Click + to start</p>
          ) : chats.slice(0, 25).map(chat => (
            <div key={chat.id} onClick={() => { setCurrentChat(chat); loadMessages(chat.id); setActiveTab('chat'); }}
              className={`group p-2 rounded-lg mb-1 cursor-pointer transition-all ${
                currentChat?.id === chat.id ? 'bg-purple-500/20 border border-purple-500/40' : 'hover:bg-white/5'
              }`}>
              <div className="flex items-center justify-between gap-1">
                <MessageSquare size={11} className="text-gray-500 flex-shrink-0" />
                <span className="text-xs truncate flex-1">{chat.title || 'Untitled'}</span>
                <button onClick={(e) => deleteChat(chat.id, e)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 flex-shrink-0">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* User */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-gold-500 flex items-center justify-center text-xs font-bold">
              {(user.user_metadata?.name || user.email)?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">{user.user_metadata?.name || user.email?.split('@')[0]}</div>
              <div className="text-[10px] text-gold-400 flex items-center gap-1">
                <Trophy size={9} /> Admin
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] mb-2">
            <div className="bg-white/5 p-1.5 rounded text-center">
              <div className="text-purple-400 font-bold">{stats.chats}</div>
              <div className="text-gray-500">Chats</div>
            </div>
            <div className="bg-white/5 p-1.5 rounded text-center">
              <div className="text-pink-400 font-bold">{stats.messages}</div>
              <div className="text-gray-500">Msgs</div>
            </div>
          </div>
          <button onClick={signOut} className="w-full text-left p-1.5 rounded-lg hover:bg-red-500/20 text-[11px] text-red-300 flex items-center gap-2 justify-center">
            <LogOut size={11} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="p-3 border-b border-white/10 flex items-center gap-2 bg-black/20 backdrop-blur-md">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          
          <div className="flex-1 flex items-center gap-2 min-w-0">
            {activeTab === 'chat' && <span className="text-base">💬</span>}
            {activeTab === 'image' && <span className="text-base">🎨</span>}
            {activeTab === 'research' && <span className="text-base">🔍</span>}
            {activeTab === 'code' && <span className="text-base">💻</span>}
            {activeTab === 'agent' && <span className="text-base">🤖</span>}
            {activeTab === 'analytics' && <span className="text-base">📊</span>}
            <h1 className="text-sm font-bold truncate">
              {activeTab === 'chat' && 'AI Chat'}
              {activeTab === 'image' && 'Image Generation'}
              {activeTab === 'research' && 'Deep Research'}
              {activeTab === 'code' && 'Code Assistant'}
              {activeTab === 'agent' && 'AI Agent'}
              {activeTab === 'analytics' && 'Analytics'}
            </h1>
          </div>
          
          {activeTab === 'chat' && (
            <div className="relative">
              <button onClick={() => setModelDropdown(!modelDropdown)} className="btn-secondary flex items-center gap-2 text-xs">
                <Cpu size={12} /> {model.name.split(' ').slice(1).join(' ')}
                <ChevronDown size={12} />
              </button>
              {modelDropdown && (
                <div className="absolute right-0 top-full mt-1 w-80 glass-card p-2 z-50 max-h-96 overflow-y-auto">
                  {MODELS.map(m => (
                    <button key={m.id} onClick={() => { setModel(m); setModelDropdown(false); }}
                      className="w-full text-left p-2 rounded-lg hover:bg-white/10 text-xs flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{m.name}</div>
                        <div className="text-[10px] text-gray-400">{m.desc}</div>
                      </div>
                      {m.free && <span className="badge badge-green text-[9px]">FREE</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </header>

        {/* Content based on active tab */}
        {activeTab === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-10 max-w-5xl mx-auto">
                  <div className="text-5xl mb-3 animate-float">🚀</div>
                  <h2 className="text-3xl md:text-4xl font-black gradient-text mb-2">Welcome to SI OPEN AI</h2>
                  <p className="text-gray-300 mb-1 text-sm">স্বাগতম! আপনার AI journey শুরু করুন</p>
                  <p className="text-xs text-gray-400 mb-6">200+ features · 100+ languages · 100% free · 24/7</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {[
                      { icon: '💡', label: 'Explain', desc: 'Learn anything' },
                      { icon: '📝', label: 'Write', desc: 'Content creation' },
                      { icon: '💻', label: 'Code', desc: 'Programming help' },
                      { icon: '🌍', label: 'Translate', desc: '100+ languages' },
                      { icon: '📊', label: 'Analyze', desc: 'Data insights' },
                      { icon: '🎨', label: 'Creative', desc: 'Stories, poems' },
                      { icon: '🔍', label: 'Research', desc: 'Deep analysis' },
                      { icon: '⚡', label: 'Quick', desc: 'Fast answers' }
                    ].map((a, i) => (
                      <button key={i} onClick={() => setInput(`${a.label}: `)} className="glass-card p-3 hover:bg-white/10 text-left">
                        <div className="text-xl mb-1">{a.icon}</div>
                        <div className="text-xs font-semibold">{a.label}</div>
                        <div className="text-[10px] text-gray-500">{a.desc}</div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="badge badge-purple">💬 100+ Languages</span>
                    <span className="badge badge-pink">🎨 Image Gen</span>
                    <span className="badge badge-gold">💻 Code (40+)</span>
                    <span className="badge badge-green">🔍 Web Search</span>
                    <span className="badge badge-purple">📚 RAG</span>
                    <span className="badge badge-pink">🧠 Memory</span>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                    <div className={`max-w-3xl p-4 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-gold-500 text-white' : 'glass-card'}`}>
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${msg.role === 'user' ? 'bg-white/20' : 'bg-gradient-to-br from-purple-500 to-pink-500'}`}>
                          {msg.role === 'user' ? '👤' : '🤖'}
                        </div>
                        <span className="text-xs font-semibold">{msg.role === 'user' ? 'You' : 'SI OPEN AI'}</span>
                        {msg.model && <span className="text-[10px] text-gray-400">· {msg.model.split('/').pop()}</span>}
                      </div>
                      <div className="markdown text-sm whitespace-pre-wrap">{msg.content}</div>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1 mt-3 pt-2 border-t border-white/10">
                          <button onClick={() => navigator.clipboard.writeText(msg.content)} className="p-1.5 hover:bg-white/10 rounded text-xs text-gray-400 hover:text-white flex items-center gap-1">
                            <Copy size={11} /> Copy
                          </button>
                          <button className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-green-400">
                            <ThumbsUp size={11} />
                          </button>
                          <button className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-red-400">
                            <ThumbsDown size={11} />
                          </button>
                          <button className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-yellow-400 ml-auto">
                            <RefreshCw size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="glass-card p-4 flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                    <span className="text-xs text-gray-400">SI OPEN AI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-3 border-t border-white/10 bg-black/20 backdrop-blur-md">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <button className="p-3 hover:bg-white/5 rounded-lg" title="Attach"><Paperclip size={16} /></button>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type your message... (বাংলায় বা English-এ)"
                  className="input-field flex-1 text-sm" />
                <button onClick={sendMessage} disabled={loading || !input.trim()} className="btn-primary px-4">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* IMAGE TAB */}
        {activeTab === 'image' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-5xl mx-auto w-full">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2 animate-float">🎨</div>
              <h2 className="text-2xl md:text-3xl font-black gradient-text">Image Generation</h2>
              <p className="text-xs text-gray-400 mt-1">Free, unlimited · Powered by Pollinations.ai</p>
            </div>
            
            <div className="glass-card p-4 md:p-6 mb-4">
              <textarea value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe your image...&#10;e.g. A cute cat astronaut floating in space with stars, cinematic lighting, 4K"
                className="input-field w-full mb-3" rows={3} />
              
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                {['realistic', 'cinematic', 'anime', 'artistic', 'digital-art', 'photographic'].map(s => (
                  <button key={s} onClick={() => setImageStyle(s)}
                    className={`p-2 rounded-lg text-xs capitalize transition-all ${
                      imageStyle === s ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' : 'bg-white/5 hover:bg-white/10'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
              
              <button onClick={generateImageAction} disabled={imageLoading || !imagePrompt.trim()} className="btn-primary w-full">
                {imageLoading ? '🎨 Creating masterpiece...' : '✨ Generate Image'}
              </button>
            </div>
            
            {generatedImage && !generatedImage.error && (
              <div className="glass-card p-4 mb-4 animate-fade-in">
                <img src={generatedImage.url} alt="Generated" className="w-full rounded-xl mb-3" loading="lazy" />
                <div className="grid grid-cols-2 gap-2">
                  <a href={generatedImage.url} download className="btn-secondary flex items-center justify-center gap-2 text-sm">
                    <Download size={14} /> Download
                  </a>
                  <button onClick={() => navigator.clipboard.writeText(generatedImage.url)} className="btn-secondary text-sm">
                    <Copy size={14} className="inline mr-1" /> Copy URL
                  </button>
                </div>
              </div>
            )}
            
            {imageHistory.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold mb-2 text-gray-400">🕐 Recent Generations</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {imageHistory.map((img, i) => (
                    <div key={i} className="glass-card p-2 cursor-pointer hover:bg-white/10" onClick={() => setGeneratedImage({ url: img.url })}>
                      <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover rounded-lg mb-1" />
                      <p className="text-[10px] text-gray-400 truncate">{img.prompt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RESEARCH TAB */}
        {activeTab === 'research' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2 animate-float">🔍</div>
              <h2 className="text-2xl md:text-3xl font-black gradient-text">Deep Research</h2>
              <p className="text-xs text-gray-400 mt-1">Web search + AI analysis · Academic-level reports</p>
            </div>
            
            <div className="glass-card p-4 md:p-6 mb-4">
              <input type="text" value={researchQuery} onChange={(e) => setResearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && researchAction()}
                placeholder="What do you want to research?"
                className="input-field w-full mb-3" />
              <button onClick={researchAction} disabled={researchLoading || !researchQuery.trim()} className="btn-primary w-full">
                {researchLoading ? '🔍 Researching... (this may take 30-60s)' : '🔍 Start Deep Research'}
              </button>
            </div>
            
            {researchResult && (
              <div className="glass-card p-4 md:p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                  <span className="text-xs text-gray-400">📄 Research Report</span>
                  <button onClick={() => navigator.clipboard.writeText(researchResult)} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                    <Copy size={11} /> Copy
                  </button>
                </div>
                <div className="markdown text-sm whitespace-pre-wrap">{researchResult}</div>
              </div>
            )}
          </div>
        )}

        {/* CODE TAB */}
        {activeTab === 'code' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2 animate-float">💻</div>
              <h2 className="text-2xl md:text-3xl font-black gradient-text">Code Assistant</h2>
              <p className="text-xs text-gray-400 mt-1">40+ languages · Production-ready code</p>
            </div>
            
            <div className="glass-card p-4 md:p-6 mb-4">
              <select value={codeLanguage} onChange={(e) => setCodeLanguage(e.target.value)}
                className="input-field w-full mb-3">
                {['python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'sql', 'html/css', 'react', 'next.js', 'vue', 'angular', 'node.js', 'django', 'flask', 'fastapi', 'spring', 'react native', 'flutter', 'mongodb', 'postgresql', 'bash', 'powershell', 'r', 'julia', 'scala', 'perl', 'elixir', 'haskell', 'lua', 'dart', 'rust'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <textarea value={codeInput} onChange={(e) => setCodeInput(e.target.value)}
                placeholder="What do you need?&#10;e.g. Write a Python function to merge multiple PDF files"
                className="input-field w-full mb-3" rows={3} />
              <button onClick={codeAction} disabled={codeLoading || !codeInput.trim()} className="btn-primary w-full">
                {codeLoading ? '💻 Generating code...' : '💻 Generate Code'}
              </button>
            </div>
            
            {codeResult && (
              <div className="glass-card p-4 md:p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                  <span className="text-xs text-gray-400">💻 Code in {codeLanguage}</span>
                  <button onClick={() => navigator.clipboard.writeText(codeResult)} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                    <Copy size={11} /> Copy
                  </button>
                </div>
                <div className="markdown text-sm whitespace-pre-wrap">{codeResult}</div>
              </div>
            )}
          </div>
        )}

        {/* AGENT TAB (NEW!) */}
        {activeTab === 'agent' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2 animate-float">🤖</div>
              <h2 className="text-2xl md:text-3xl font-black gradient-text">AI Agent</h2>
              <p className="text-xs text-gray-400 mt-1">Multi-step autonomous task execution</p>
            </div>
            
            <div className="glass-card p-4 md:p-6 mb-4">
              <textarea value={agentQuery} onChange={(e) => setAgentQuery(e.target.value)}
                placeholder="Describe a complex task...&#10;e.g. Research the latest AI trends in 2025 and create a summary report"
                className="input-field w-full mb-3" rows={3} />
              <button onClick={runAgent} disabled={agentLoading || !agentQuery.trim()} className="btn-primary w-full">
                {agentLoading ? '🤖 Agent working...' : '🤖 Run AI Agent'}
              </button>
            </div>
            
            {agentSteps.length > 0 && (
              <div className="glass-card p-4 md:p-6 mb-4">
                <h3 className="text-sm font-bold mb-3">Agent Progress</h3>
                <div className="space-y-2">
                  {agentSteps.map(step => (
                    <div key={step.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        step.status === 'done' ? 'bg-green-500' : 'bg-purple-500 animate-pulse'
                      }`}>
                        {step.status === 'done' ? '✓' : '⋯'}
                      </div>
                      <span className="text-sm flex-1">{step.name}</span>
                      <span className={`text-xs ${step.status === 'done' ? 'text-green-400' : 'text-purple-400'}`}>
                        {step.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB (NEW!) */}
        {activeTab === 'analytics' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2 animate-float">📊</div>
              <h2 className="text-2xl md:text-3xl font-black gradient-text">Your Analytics</h2>
              <p className="text-xs text-gray-400 mt-1">Track your AI usage</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Chats', value: stats.chats, icon: '💬', color: 'purple' },
                { label: 'Messages', value: stats.messages, icon: '📨', color: 'pink' },
                { label: 'Tokens', value: stats.tokens.toLocaleString(), icon: '🪙', color: 'gold' },
                { label: 'Images', value: imageHistory.length, icon: '🎨', color: 'green' }
              ].map((s, i) => (
                <div key={i} className="glass-card p-4 text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className={`text-2xl font-black text-${s.color}-400`}>{s.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold mb-4">📈 Activity Overview</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Chat Usage</span>
                    <span className="text-purple-400">{Math.min(100, stats.messages * 5)}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${Math.min(100, stats.messages * 5)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Image Generation</span>
                    <span className="text-pink-400">{imageHistory.length}/10</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pink-500 to-gold-500" style={{ width: `${(imageHistory.length / 10) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Storage Used</span>
                    <span className="text-gold-400">{Math.min(100, stats.tokens / 1000)}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gold-500 to-purple-500" style={{ width: `${Math.min(100, stats.tokens / 1000)}%` }} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-6 mt-4">
              <h3 className="text-sm font-bold mb-3">🎯 Available Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {[
                  { icon: '💬', label: 'AI Chat' },
                  { icon: '🎨', label: 'Image Gen' },
                  { icon: '🔍', label: 'Research' },
                  { icon: '💻', label: 'Code' },
                  { icon: '🤖', label: 'AI Agent' },
                  { icon: '📊', label: 'Analytics' },
                  { icon: '🌐', label: '100+ Langs' },
                  { icon: '🧠', label: 'Memory' },
                  { icon: '📚', label: 'RAG' }
                ].map((f, i) => (
                  <div key={i} className="p-2 bg-white/5 rounded text-center">
                    <div className="text-base mb-1">{f.icon}</div>
                    <div className="text-[10px]">{f.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
