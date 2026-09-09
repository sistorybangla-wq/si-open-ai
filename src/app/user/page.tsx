'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User as UserIcon, MessageSquare, Calendar, Star, TrendingUp } from 'lucide-react';

export default function UserPanel() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '/'; return; }
    setUser(session.user);
    const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
    setUserData(profile);
    const { data: chats } = await supabase.from('chats').select('*').eq('user_id', session.user.id).order('updated_at', { ascending: false }).limit(5);
    setRecentChats(chats || []);
    setLoading(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">⏳ Loading...</div>;

  const isAdmin = userData?.role === 'admin';
  const isManager = userData?.role === 'manager';
  const isEditor = userData?.role === 'editor';
  const isPaid = userData?.role === 'paid';

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-gold-500 flex items-center justify-center text-2xl font-black">
              {(userData?.name || userData?.email)?.[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black gradient-text">Hello, {userData?.name || userData?.email?.split('@')[0]}! 👋</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {isAdmin && <span className="badge badge-gold">👑 Admin</span>}
                {isManager && <span className="badge badge-pink">🛡️ Manager</span>}
                {isEditor && <span className="badge badge-purple">✏️ Editor</span>}
                {isPaid && <span className="badge badge-gold">💎 Paid</span>}
                {!isAdmin && !isManager && !isEditor && !isPaid && <span className="badge badge-purple">👤 User</span>}
                <span className="text-xs text-gray-400">Member since {new Date(userData?.created_at || '').toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <a href="/" className="btn-primary text-sm flex items-center gap-2"><MessageSquare size={14} /> Chat</a>
              <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
                className="btn-secondary text-sm">Sign Out</button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Chats', value: recentChats.length, icon: MessageSquare, color: 'purple' },
            { label: 'Messages', value: userData?.total_messages || 0, icon: TrendingUp, color: 'pink' },
            { label: 'Plan', value: userData?.tier || 'free', icon: Star, color: 'gold' },
            { label: 'Days', value: Math.ceil((Date.now() - new Date(userData?.created_at || '').getTime()) / 86400000), icon: Calendar, color: 'green' }
          ].map((s, i) => (
            <div key={i} className="glass-card p-4 text-center">
              <s.icon className={`mx-auto text-${s.color}-400 mb-1`} size={20} />
              <p className={`text-xl font-black text-${s.color}-400`}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Access Links - Dynamic based on role */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-bold mb-3">🚀 Your Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <a href="/" className="glass-card p-3 hover:bg-white/10 text-center">
              <MessageSquare className="mx-auto text-purple-400 mb-1" size={20} />
              <p className="text-sm font-semibold">Chat App</p>
              <p className="text-xs text-gray-400">সবার জন্য</p>
            </a>
            {isAdmin && (
              <a href="/admin" className="glass-card p-3 hover:bg-white/10 text-center border border-gold-500/30">
                <span className="text-2xl">👑</span>
                <p className="text-sm font-semibold text-gold-500">Admin</p>
                <p className="text-xs text-gray-400">শুধু admin</p>
              </a>
            )}
            {(isAdmin || isManager) && (
              <a href="/manager" className="glass-card p-3 hover:bg-white/10 text-center border border-pink-500/30">
                <span className="text-2xl">🛡️</span>
                <p className="text-sm font-semibold text-pink-400">Manager</p>
                <p className="text-xs text-gray-400">Manager+Admin</p>
              </a>
            )}
            {(isAdmin || isManager || isEditor) && (
              <a href="/editor" className="glass-card p-3 hover:bg-white/10 text-center border border-purple-500/30">
                <span className="text-2xl">✏️</span>
                <p className="text-sm font-semibold text-purple-400">Editor</p>
                <p className="text-xs text-gray-400">Editor+up</p>
              </a>
            )}
            {(isAdmin || isPaid) && (
              <a href="/paid" className="glass-card p-3 hover:bg-white/10 text-center border border-gold-500/30">
                <span className="text-2xl">💎</span>
                <p className="text-sm font-semibold text-gold-500">Premium</p>
                <p className="text-xs text-gray-400">Paid+Admin</p>
              </a>
            )}
            {userData?.tier === 'free' && (
              <div className="glass-card p-3 text-center bg-gradient-to-br from-gold-500/10 to-purple-500/10">
                <span className="text-2xl">⬆️</span>
                <p className="text-sm font-semibold text-gold-500">Upgrade</p>
                <p className="text-xs text-gray-400">Pro plan</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Chats */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold mb-3">💬 Your Recent Chats</h2>
          {recentChats.length === 0 ? (
            <p className="text-center text-gray-400 py-6">No chats yet. <a href="/" className="text-purple-400 underline">Start your first chat!</a></p>
          ) : (
            <div className="space-y-2">
              {recentChats.map(c => (
                <a key={c.id} href="/" className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10">
                  <p className="font-semibold text-sm">{c.title}</p>
                  <p className="text-xs text-gray-400">{new Date(c.updated_at).toLocaleString()}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
