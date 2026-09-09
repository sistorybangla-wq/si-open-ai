'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { checkAccess } from '@/lib/panel-auth';
import { Shield, Users, MessageSquare, Flag, Eye, Edit, Trash2, CheckCircle, BarChart3 } from 'lucide-react';

export default function ManagerPanel() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [tab, setTab] = useState<'users'|'chats'|'reports'>('users');

  useEffect(() => {
    checkAccess(['admin', 'manager']).then(r => {
      setAuthorized(r.hasAccess);
      setLoading(false);
      if (r.hasAccess) loadData();
    });
  }, []);

  async function loadData() {
    const [u, c] = await Promise.all([
      supabase.from('users').select('*').neq('role', 'admin').order('created_at', { ascending: false }),
      supabase.from('chats').select('*').order('updated_at', { ascending: false }).limit(50)
    ]);
    if (u.data) setUsers(u.data);
    if (c.data) setChats(c.data);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">⏳ Loading...</div>;
  
  if (!authorized) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-red-400 mb-2">Manager Access Required</h1>
        <p className="text-gray-400 mb-4">এই page শুধু Manager ও Admin দের জন্য।</p>
        <a href="/user" className="btn-primary inline-block">My Dashboard</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-black text-pink-400 flex items-center gap-2">
              <Shield size={28} /> Manager Panel
            </h1>
            <p className="text-gray-400 text-sm">User & content management • ব্যবহারকারী ও কন্টেন্ট management</p>
          </div>
          <a href="/user" className="btn-secondary text-sm">← My Dashboard</a>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { id: 'users', label: 'Users', icon: Users, count: users.length },
            { id: 'chats', label: 'Recent Chats', icon: MessageSquare, count: chats.length },
            { id: 'reports', label: 'Reports', icon: BarChart3 }
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${
                tab === t.id ? 'bg-pink-500/30 text-pink-300' : 'bg-white/5 hover:bg-white/10 text-gray-400'
              }`}>
              <t.icon size={14} /> {t.label} {t.count !== undefined && `(${t.count})`}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <div className="glass-card p-4">
            <h3 className="font-bold mb-3">Manage Non-Admin Users</h3>
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <div>
                    <p className="font-semibold text-sm">{u.name || u.email.split('@')[0]}</p>
                    <p className="text-xs text-gray-400">{u.email} • Role: {u.role}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-white/10 rounded text-blue-400"><Eye size={14} /></button>
                    <button className="p-1 hover:bg-white/10 rounded text-yellow-400"><Edit size={14} /></button>
                    <button className="p-1 hover:bg-white/10 rounded text-green-400"><CheckCircle size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'chats' && (
          <div className="glass-card p-4">
            <h3 className="font-bold mb-3">Recent Chats (last 50)</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {chats.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2 bg-white/5 rounded text-sm">
                  <div>
                    <p className="font-semibold">{c.title}</p>
                    <p className="text-xs text-gray-400">{new Date(c.updated_at).toLocaleString()}</p>
                  </div>
                  <button className="text-red-400 hover:text-red-300"><Flag size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'reports' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Users', value: users.length },
              { label: 'Active Today', value: users.filter(u => u.last_login && new Date(u.last_login).toDateString() === new Date().toDateString()).length },
              { label: 'Total Chats', value: chats.length },
              { label: 'Reported', value: 0 }
            ].map((s, i) => (
              <div key={i} className="glass-card p-4">
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="text-2xl font-black text-pink-400 mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
