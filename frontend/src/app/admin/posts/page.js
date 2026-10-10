/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AdminPostsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', isPinned: false });
  const [saving, setSaving] = useState(false);
  const load = async () => { const res = await api.get('/posts'); setPosts(res.data || []); };
  useEffect(() => { if (!authLoading && (!user || !isAdmin)) router.push(user ? '/dashboard' : '/login'); if (isAdmin) load().catch(console.error); }, [user, isAdmin, authLoading, router]);
  const create = async (event) => { event.preventDefault(); setSaving(true); try { await api.post('/posts', form); setForm({ title: '', body: '', isPinned: false }); await load(); } catch (error) { alert(error.message); } finally { setSaving(false); } };
  const remove = async (id) => { if (!window.confirm('Delete this post?')) return; await api.delete(`/posts/${id}`); await load(); };
  if (authLoading || !isAdmin) return <LoadingSpinner text="Loading post management..." />;
  return <div className="mx-auto max-w-4xl space-y-7"><div><h1 className="text-2xl font-black uppercase text-white">Manage Posts</h1><p className="text-xs text-zinc-400">Publish announcements and moderate community discussions.</p></div><form onSubmit={create} className="space-y-3 rounded-2xl border border-[#202230] bg-[#12131b] p-5"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Post title" className="w-full rounded-xl border border-[#202230] bg-[#090a0f] px-3 py-2 text-sm text-white outline-none focus:border-[#a3ff20]" /><textarea required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Write your announcement..." rows={6} className="w-full rounded-xl border border-[#202230] bg-[#090a0f] px-3 py-2 text-sm text-white outline-none focus:border-[#a3ff20]" /><label className="flex items-center gap-2 text-xs text-zinc-300"><input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} /> Pin this post</label><button disabled={saving} className="rounded-xl bg-[#a3ff20] px-4 py-2 text-xs font-black uppercase text-black">{saving ? 'Publishing...' : 'Publish Post'}</button></form><div className="space-y-3">{posts.map((post) => <div key={post._id} className="flex items-center justify-between rounded-xl border border-[#202230] bg-[#12131b] p-4"><div><p className="font-bold text-white">{post.title}</p><p className="text-xs text-zinc-500">{post.comments?.length || 0} comments · {new Date(post.createdAt).toLocaleDateString()}</p></div><button onClick={() => remove(post._id)} className="text-xs font-bold text-rose-400">Delete</button></div>)}</div></div>;
}
