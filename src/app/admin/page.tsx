'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { checkAccess } from '@/lib/panel-auth';
import { 
  Users, Crown, BarChart3, Settings, Search, Trash2, Ban, 
  CheckCircle, XCircle, Shield, Activity, Database, Mail,
  DollarSign, Server, AlertCircle, TrendingUp
} from 'lucide-react';

export default function AdminPanel() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview'|'users'|'roles'|'system'>('overview');

  useEffect(() => {
    checkAccess(['admin']).then(r => {
      setAuthorized(r.hasAccess);
      setLoading(false);
      if (r.hasAccess) loadUsers();
    });
  }, []);

  async function loadUsers() {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
  }

  async function updateUser(id: string, updates: any) {
    await supabase.from('users').update(updates).eq('id', id);
    loadUsers();
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">⏳ Loading...</div>;
  
  if (!authorized) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-red-400 mb-2">Admin Only</h1>
        <p className="text-gray-400 mb-4">এই page শুধু Admin দের জন্য। তুমি admin নও।</p>
        <a href="/user" className="btn-primary inline-block">Go to Your Dashboard</a>
      </div>
    </div>
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    editors: users.filter(u => u.role === 'editor').length,
    normal: users.filter(u => u.role === 'normal').length,
    paid: users.filter(u => u.role === 'paid').length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.role === 'pending').length,
    banned: users.filter(u => u.status === 'banned').length,
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-black gradient-text flex items-center gap-2">
              <Crown size={28} className="text-gold-500" /> Admin Control
            </h1>
            <p className="text-gray-400 text-sm">Full system access • সবকিছু control করুন</p>
          </div>
          <a href="/user" className="btn-secondary text-sm">← My Dashboard</a>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'All Users', icon: Users },
            { id: 'roles', label: 'Role Manager', icon: Shield },
            { id: 'system', label: 'System', icon: Server }
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm whitespace-nowrap ${
                tab === t.id ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-400'
              }`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total', value: stats.total, color: 'purple' },
                { label: 'Active', value: stats.active, color: 'green' },
                { label: 'Pending', value: stats.pending, color: 'gold' },
                { label: 'Banned', value: stats.banned, color: 'red' }
              ].map((s, i) => (
                <div key={i} className="glass-card p-4">
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className={`text-3xl font-black text-${s.color}-400 mt-1`}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Admins', value: stats.admins, color: 'gold', icon: Crown },
                { label: 'Managers', value: stats.managers, color: 'pink', icon: Shield },
                { label: 'Editors', value: stats.editors, color: 'purple', icon: Settings },
                { label: 'Paid', value: stats.paid, color: 'green', icon: DollarSign },
                { label: 'Normal', value: stats.normal, color: 'blue', icon: Users }
              ].map((s, i) => (
                <div key={i} className="glass-card p-4 text-center">
                  <s.icon className={`mx-auto text-${s.color}-400 mb-2`} size={20} />
                  <p className={`text-2xl font-black text-${s.color}-400`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div className="glass-card p-4 overflow-x-auto">
            <div className="flex gap-2 mb-3">
              <input type="text" placeholder="🔍 Search..." className="input-field flex-1" />
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-white/10">
                  <th className="p-2">User</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-2">
                      <p className="font-semibold">{u.name || u.email.split('@')[0]}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="p-2">
                      <select value={u.role} onChange={(e) => updateUser(u.id, { role: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs">
                        <option value="admin">admin</option>
                        <option value="manager">manager</option>
                        <option value="editor">editor</option>
                        <option value="paid">paid</option>
                        <option value="normal">normal</option>
                        <option value="pending">pending</option>
                        <option value="banned">banned</option>
                      </select>
                    </td>
                    <td className="p-2"><span className="badge badge-purple">{u.status}</span></td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        {u.role !== 'banned' && (
                          <button onClick={() => updateUser(u.id, { role: 'banned', status: 'banned' })}
                            className="p-1 hover:bg-red-500/20 rounded text-red-400"><Ban size={14} /></button>
                        )}
                        {u.role === 'banned' && (
                          <button onClick={() => updateUser(u.id, { role: 'normal', status: 'active' })}
                            className="p-1 hover:bg-green-500/20 rounded text-green-400"><CheckCircle size={14} /></button>
                        )}
                        <button onClick={() => supabase.from('users').delete().eq('id', u.id).then(() => loadUsers())}
                          className="p-1 hover:bg-red-500/20 rounded text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ROLES */}
        {tab === 'roles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { role: 'admin', title: '👑 Admin', desc: 'Full system control', color: 'gold' },
              { role: 'manager', title: '🛡️ Manager', desc: 'User & content management', color: 'pink' },
              { role: 'editor', title: '✏️ Editor', desc: 'Content editing access', color: 'purple' },
              { role: 'paid', title: '💎 Paid', desc: 'Premium features', color: 'green' },
              { role: 'normal', title: '👤 Normal', desc: 'Standard user', color: 'blue' }
            ].map(r => (
              <div key={r.role} className="glass-card p-5">
                <h3 className={`text-lg font-bold text-${r.color}-400 mb-1`}>{r.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{r.desc}</p>
                <p className="text-xs">Active: <span className="font-bold">{users.filter(u => u.role === r.role).length}</span></p>
              </div>
            ))}
          </div>
        )}

        {/* SYSTEM */}
        {tab === 'system' && (
          <div className="space-y-4">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Server size={20} /> System Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-white/5 rounded"><span>Version</span><span>v15.0 Ultimate</span></div>
                <div className="flex justify-between p-2 bg-white/5 rounded"><span>Database</span><span className="text-green-400">Supabase ✓</span></div>
                <div className="flex justify-between p-2 bg-white/5 rounded"><span>AI</span><span className="text-green-400">Gemini Active ✓</span></div>
                <div className="flex justify-between p-2 bg-white/5 rounded"><span>Hosting</span><span>Vercel</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
