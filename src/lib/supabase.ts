import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gahzybgfsfdwfbedsfpp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_-NSuF0LeJ_RUtUbaCIm4fA_Z5ymDFo-';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string; email: string; name?: string;
  role: 'admin' | 'user' | 'moderator' | 'pending' | 'banned';
  tier: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  total_messages: number; total_tokens: number;
  storage_used: number; created_at: string; last_login?: string;
};

export type Chat = {
  id: string; user_id: string; title: string; model: string;
  pinned: boolean; archived: boolean; tags: string[];
  created_at: string; updated_at: string;
};

export type Message = {
  id: string; chat_id: string; user_id: string;
  role: 'user' | 'assistant' | 'system'; content: string;
  model?: string; tokens: number; attachments?: any[];
  created_at: string;
};

export type KnowledgeDoc = {
  id: string; user_id: string; filename: string;
  file_type: string; file_size: number; content?: string;
  chunks?: any[]; status: 'processing' | 'ready' | 'error';
  created_at: string;
};
