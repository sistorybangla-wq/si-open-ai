'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { checkAccess } from '@/lib/panel-auth';
import { DollarSign, Sparkles, Crown, Zap, Image as ImageIcon, Code2, Mic, Brain, Star } from 'lucide-react';

export default function PaidPanel() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    checkAccess(['admin', 'paid']).then(r => {
      setAuthorized(r.hasAccess);
      setLoading(false);
      setUserData(r.userData);
    });
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">⏳ Loading...</div>;
  
  if (!authorized) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md text-center">
        <div className="text-6xl mb-4">💎</div>
        <h1 className="text-2xl font-bold text-gold-500 mb-2">Paid Feature</h1>
        <p className="text-gray-400 mb-4">এই page শুধু Paid ও Admin দের জন্য। Upgrade করুন!</p>
        <a href="/user" className="btn-primary inline-block">Back to Dashboard</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-black text-gold-500 flex items-center gap-2">
              <Crown size={28} /> Paid Premium
            </h1>
            <p className="text-gray-400 text-sm">Premium features • সব premium features unlocked</p>
          </div>
          <a href="/user" className="btn-secondary text-sm">← My Dashboard</a>
        </div>

        <div className="glass-card p-6 mb-6 bg-gradient-to-br from-gold-500/10 to-purple-500/10 border-gold-500/20">
          <div className="flex items-center gap-3">
            <Sparkles className="text-gold-500" size={32} />
            <div>
              <h2 className="text-xl font-bold text-gold-500">Welcome Premium Member!</h2>
              <p className="text-sm text-gray-400">সব premium features available for you</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: Zap, label: 'Unlimited Messages', desc: 'কোনো daily limit নাই', color: 'gold' },
            { icon: Brain, label: 'GPT-4 / Claude', desc: 'সবচেয়ে smart models', color: 'purple' },
            { icon: ImageIcon, label: 'HD Image Gen', desc: 'High quality images', color: 'pink' },
            { icon: Code2, label: 'Advanced Code', desc: '40+ languages', color: 'green' },
            { icon: Mic, label: 'Voice AI', desc: 'TTS + STT', color: 'blue' },
            { icon: Star, label: 'Priority Support', desc: '24/7 priority help', color: 'gold' }
          ].map((f, i) => (
            <div key={i} className="glass-card p-4">
              <f.icon className={`text-${f.color}-400 mb-2`} size={24} />
              <h3 className="font-bold text-sm">{f.label}</h3>
              <p className="text-xs text-gray-400 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
