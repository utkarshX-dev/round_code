/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import UserAvatar from '@/components/common/UserAvatar';

export default function PostsPage() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [comment, setComment] = useState({});
  const [loading, setLoading] = useState(true);
  const load = async () => {
    try { const res = await api.get('/posts'); setPosts(res.data || []); } catch (error) { console.error(error); } finally { setLoading(false); }
  };
  useEffect(() => { if (user) load(); }, [user]);
  const submitComment = async (id) => {
    if (!comment[id]?.trim()) return;
    try {
      await api.post(`/posts/${id}/comments`, { body: comment[id] });
      setComment((value) => ({ ...value, [id]: '' }));
      await load();
    } catch (error) { alert(error.message); }
  };
  if (authLoading || loading) return <LoadingSpinner text="Loading posts..." />;
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="border-b border-[#202230] pb-5"><h1 className="text-2xl font-black uppercase text-white">Community Posts</h1><p className="text-xs text-zinc-400">Announcements, learning notes, and discussions from Round Table DTU.</p></div>
      {!posts.length && <div className="rounded-2xl border border-[#202230] bg-[#12131b] p-10 text-center text-sm text-zinc-400">No posts yet.</div>}
      {posts.map((post) => (
        <article key={post._id} className="rounded-2xl border border-[#202230] bg-[#12131b] p-5">
          <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-3"><UserAvatar user={post.authorId} size="sm" /><div><h2 className="text-lg font-bold text-white">{post.title}</h2><p className="text-[11px] text-zinc-500">By {post.authorId?.name || 'Admin'} · {new Date(post.createdAt).toLocaleString()}</p></div></div>{post.isPinned && <span className="rounded-full bg-[#a3ff20]/15 px-2 py-1 text-[10px] font-bold text-[#a3ff20]">PINNED</span>}</div>
          <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-300">{post.body}</p>
          <div className="mt-5 space-y-3 border-t border-[#202230] pt-4"><p className="flex items-center gap-2 text-xs font-bold uppercase text-zinc-400"><MessageCircle className="h-4 w-4" /> {post.comments?.length || 0} comments</p>{(post.comments || []).map((item) => <div key={item._id} className="flex items-start gap-2 rounded-xl bg-[#090a0f] p-3"><UserAvatar user={item.userId} size="sm" /><div><p className="text-xs font-bold text-[#a3ff20]">{item.userId?.name || 'Member'}</p><p className="mt-1 text-sm text-zinc-300">{item.body}</p></div></div>)}<div className="flex gap-2"><input value={comment[post._id] || ''} onChange={(e) => setComment((value) => ({ ...value, [post._id]: e.target.value }))} placeholder="Write a comment..." className="min-w-0 flex-1 rounded-xl border border-[#202230] bg-[#090a0f] px-3 py-2 text-sm text-white outline-none focus:border-[#a3ff20]" /><button onClick={() => submitComment(post._id)} className="rounded-xl bg-[#a3ff20] px-3 text-black"><Send className="h-4 w-4" /></button></div></div>
        </article>
      ))}
    </div>
  );
}
