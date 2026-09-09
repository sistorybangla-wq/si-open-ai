'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { checkAccess } from '@/lib/panel-auth';
import { Edit, FileText, Save, Eye, Sparkles, BookOpen, Wand2 } from 'lucide-react';

export default function EditorPanel() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    checkAccess(['admin', 'manager', 'editor']).then(r => {
      setAuthorized(r.hasAccess);
      setLoading(false);
      if (r.hasAccess) loadChats();
    });
  }, []);

  async function loadChats() {
    const { data } = await supabase.from('chats').select('*').order('updated_at', { ascending: false }).limit(20);
    if (data) setChats(data);
  }

  async function loadMessages(chatId: string) {
    const { data } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at');
    if (data) setMessages(data);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">⏳ Loading...</div>;
  
  if (!authorized) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-red-400 mb-2">Editor Access Required</h1>
        <p className="text-gray-400 mb-4">এই page Editor, Manager, Admin দের জন্য।</p>
        <a href="/user" className="btn-primary inline-block">My Dashboard</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-black text-purple-400 flex items-center gap-2">
              <Edit size={28} /> Editor Panel
            </h1>
            <p className="text-gray-400 text-sm">Content editing & curation • কন্টেন্ট editing</p>
          </div>
          <a href="/user" className="btn-secondary text-sm">← My Dashboard</a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chat List */}
          <div className="glass-card p-4 md:col-span-1">
            <h3 className="font-bold mb-3 flex items-center gap-2"><BookOpen size={16} /> Recent Chats</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {chats.map(c => (
                <button key={c.id} onClick={() => { setSelectedChat(c); loadMessages(c.id); }}
                  className={`w-full text-left p-2 rounded text-sm ${
                    selectedChat?.id === c.id ? 'bg-purple-500/30' : 'bg-white/5 hover:bg-white/10'
                  }`}>
                  <p className="font-semibold truncate">{c.title}</p>
                  <p className="text-xs text-gray-400">{new Date(c.updated_at).toLocaleDateString()}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Viewer */}
          <div className="glass-card p-4 md:col-span-2">
            {selectedChat ? (
              <>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                  <h3 className="font-bold">{selectedChat.title}</h3>
                  <button className="btn-secondary text-xs flex items-center gap-1">
                    <Save size={12} /> Save Changes
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {messages.map(m => (
                    <div key={m.id} className={`p-3 rounded ${m.role === 'user' ? 'bg-purple-500/10' : 'bg-white/5'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">{m.role}</span>
                        <div className="flex gap-1">
                          <button className="p-1 hover:bg-white/10 rounded text-xs text-blue-400">
                            <Wand2 size={12} />
                          </button>
                          <button className="p-1 hover:bg-white/10 rounded text-xs text-yellow-400">
                            <Edit size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FileText size={48} className="mx-auto mb-3 opacity-30" />
                <p>Select a chat to view & edit</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
