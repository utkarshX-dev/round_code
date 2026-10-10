'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import UserAvatar from '@/components/common/UserAvatar';
import { ClipLoader } from 'react-spinners';
import { RoleBadge } from '@/components/common/Badge';
import {
  User,
  Lock,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  Award,
  Flame,
  LockKeyhole,
  Rocket,
  Sparkles,
  Target,
  Zap,
  Trophy,
  Camera,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const PROFILE_BADGES = [
  { key: 'first_submission', name: 'First Step', icon: Rocket, color: 'text-lime-300', bg: 'bg-lime-300/15', border: 'border-lime-300/30' },
  { key: 'five_potws', name: 'Consistent Coder', icon: Target, color: 'text-cyan-300', bg: 'bg-cyan-300/15', border: 'border-cyan-300/30' },
  { key: 'perfect_score', name: 'Perfect 6', icon: Sparkles, color: 'text-amber-300', bg: 'bg-amber-300/15', border: 'border-amber-300/30' },
  { key: 'three_week_streak', name: 'On Fire', icon: Flame, color: 'text-orange-300', bg: 'bg-orange-300/15', border: 'border-orange-300/30' },
  { key: 'four_week_streak', name: 'Unstoppable', icon: Zap, color: 'text-violet-300', bg: 'bg-violet-300/15', border: 'border-violet-300/30' },
];

export default function MyProfilePage() {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('profile'); // profile, projects, password, history
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    branch: '',
    batch: '',
    skills: [],
    codingProfiles: {
      leetcode: '',
      codeforces: '',
      codechef: '',
      geeksforgeeks: '',
      hackerrank: '',
      github: '',
      linkedin: '',
      portfolio: '',
    },
    projects: [],
  });

  const [skillInput, setSkillInput] = useState('');
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    techStack: '',
    githubLink: '',
    liveLink: '',
  });

  // Change password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [ratingHistory, setRatingHistory] = useState([]);
  const [achievements, setAchievements] = useState({
    badges: [],
    currentStreak: 0,
    longestStreak: 0,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const res = await api.get('/users/me');
        if (res.success && res.data) {
          setAchievements({
            badges: res.data.badges || [],
            currentStreak: res.data.currentStreak || 0,
            longestStreak: res.data.longestStreak || 0,
          });
          setProfileData({
            name: res.data.name || '',
            bio: res.data.bio || '',
            branch: res.data.branch || '',
            batch: res.data.batch || '',
            skills: res.data.skills || [],
            codingProfiles: {
              leetcode: res.data.codingProfiles?.leetcode || '',
              codeforces: res.data.codingProfiles?.codeforces || '',
              codechef: res.data.codingProfiles?.codechef || '',
              geeksforgeeks: res.data.codingProfiles?.geeksforgeeks || '',
              hackerrank: res.data.codingProfiles?.hackerrank || '',
              github: res.data.codingProfiles?.github || '',
              linkedin: res.data.codingProfiles?.linkedin || '',
              portfolio: res.data.codingProfiles?.portfolio || '',
            },
            projects: res.data.projects || [],
          });
        }

        // Fetch rating history
        const profileFull = await api.get(`/users/${user._id || user.id}`);
        if (profileFull.success && profileFull.data?.ratingHistory) {
          setRatingHistory(profileFull.data.ratingHistory);
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (user) loadData();
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await api.patch('/users/me', profileData);
      if (res.success) {
        setMsg({ type: 'success', text: 'Profile updated successfully!' });
        refreshUser();
      } else {
        setMsg({ type: 'error', text: res.message || 'Failed to update profile.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMsg({ type: 'error', text: 'Choose a JPG, PNG, or WebP image.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'Profile photos must be 5MB or smaller.' });
      return;
    }

    setPhotoUploading(true);
    setMsg({ type: '', text: '' });
    try {
      const image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read that image.'));
        reader.readAsDataURL(file);
      });
      const res = await api.post('/users/me/profile-photo', { image });
      if (!res.success) throw new Error(res.message || 'Could not update profile photo.');
      await refreshUser();
      setMsg({ type: 'success', text: 'Profile photo updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Could not update profile photo.' });
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    if (!profileData.skills.includes(skillInput.trim())) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    const formatted = {
      name: newProject.name.trim(),
      description: newProject.description.trim(),
      techStack: newProject.techStack
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      githubLink: newProject.githubLink.trim(),
      liveLink: newProject.liveLink.trim(),
    };

    setProfileData((prev) => ({
      ...prev,
      projects: [...prev.projects, formatted],
    }));

    setNewProject({
      name: '',
      description: '',
      techStack: '',
      githubLink: '',
      liveLink: '',
    });
  };

  const handleRemoveProject = (index) => {
    setProfileData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (res.success) {
        setMsg({ type: 'success', text: 'Password updated successfully!' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMsg({ type: 'error', text: res.message || 'Password update failed.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Password update failed.' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <LoadingSpinner text="Loading profile..." />;
  if (!user) return null;

  // Chart data
  const chartData = ratingHistory.map((h, i) => ({
    name: h.potwId ? `POTW #${h.potwId.weekNumber}` : `Adj #${i + 1}`,
    rating: h.newRating,
    change: h.ratingChange,
  }));
  if (chartData.length > 0) {
    chartData.unshift({ name: 'Start', rating: 0, change: 0 });
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div className="flex items-center gap-4">
          <div className="relative">
            <UserAvatar user={user} size="lg" />
            <label
              htmlFor="profile-photo"
              className="absolute -right-2 -bottom-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-[#a3ff20]/50 bg-[#12131b] text-[#a3ff20] shadow-lg transition hover:bg-[#a3ff20] hover:text-black"
              title="Change profile photo"
            >
              {photoUploading ? <ClipLoader color="currentColor" size={13} /> : <Camera className="h-4 w-4" />}
            </label>
            <input
              id="profile-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              disabled={photoUploading}
              className="sr-only"
            />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                Manage Profile
              </h1>
              <RoleBadge role={user.role} />
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Update your developer details, skills, handles, and showcase projects.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/members/${user._id || user.id}`}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-zinc-900 border border-[#a3ff20]/40 hover:border-[#a3ff20] hover:text-[#a3ff20] transition-all flex items-center gap-2"
          >
            <User className="w-4 h-4 text-[#a3ff20]" />
            <span>View Public Profile</span>
          </Link>
        </div>
      </div>

      {msg.text && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-xs font-medium ${
            msg.type === 'success'
              ? 'bg-[#a3ff20]/10 border-[#a3ff20]/30 text-[#a3ff20]'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#a3ff20] flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap p-1.5 bg-[#14151e] border border-zinc-800 rounded-2xl gap-1.5">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-[#a3ff20] text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          Profile & Skills
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'projects'
              ? 'bg-[#a3ff20] text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          Projects ({profileData.projects.length})
        </button>
        <button
          onClick={() => setActiveTab('rating')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'rating'
              ? 'bg-[#a3ff20] text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          Rating History ({ratingHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'password'
              ? 'bg-[#a3ff20] text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          Change Password
        </button>
      </div>

      {/* Tab: Profile & Skills */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSave} className="space-y-6">
          <div className="bg-[#14151e] p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Basic Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full bg-[#0b0c10] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#a3ff20] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  DTU Email (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.dtuEmail}
                  className="w-full bg-[#0b0c10]/60 border border-zinc-900 rounded-xl px-4 py-2.5 text-xs text-zinc-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Branch / Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science Engineering"
                  value={profileData.branch}
                  onChange={(e) => setProfileData({ ...profileData, branch: e.target.value })}
                  className="w-full bg-[#0b0c10] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#a3ff20] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Batch / Passing Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2026"
                  value={profileData.batch}
                  onChange={(e) => setProfileData({ ...profileData, batch: e.target.value })}
                  className="w-full bg-[#0b0c10] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#a3ff20] transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Bio / Summary
                </label>
                <textarea
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell peers about your focus areas, interests, and background..."
                  className="w-full bg-[#0b0c10] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Achievement snapshot */}
          <section className="relative overflow-hidden rounded-2xl border border-[#303346] bg-gradient-to-br from-[#171b23] via-[#12141d] to-[#0d1017] p-6 sm:p-8">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-lime-300/10 blur-3xl" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-lime-300" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Achievements</h3>
                </div>
                <p className="mt-1 text-xs text-zinc-400">Your progress, streaks, and earned platform badges.</p>
              </div>
              <Link
                href="/badges"
                className="inline-flex items-center gap-2 self-start rounded-xl border border-lime-300/30 bg-lime-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-lime-300 transition hover:bg-lime-300/20 sm:self-auto"
              >
                Open achievement vault
                <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-orange-300/25 bg-orange-300/10 p-3">
                <Flame className="mb-2 h-4 w-4 text-orange-300" />
                <p className="text-xl font-black text-white">{achievements.currentStreak}</p>
                <p className="text-[9px] font-black uppercase tracking-wider text-orange-200/70">Current streak</p>
              </div>
              <div className="rounded-xl border border-violet-300/25 bg-violet-300/10 p-3">
                <Zap className="mb-2 h-4 w-4 text-violet-300" />
                <p className="text-xl font-black text-white">{achievements.longestStreak}</p>
                <p className="text-[9px] font-black uppercase tracking-wider text-violet-200/70">Longest streak</p>
              </div>
              <div className="col-span-2 rounded-xl border border-lime-300/25 bg-lime-300/10 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black uppercase tracking-wider text-lime-200/70">Badges unlocked</p>
                  <p className="text-xl font-black text-white">{achievements.badges.length}<span className="text-zinc-500">/{PROFILE_BADGES.length}</span></p>
                </div>
                <div className="mt-3 flex gap-1">
                  {PROFILE_BADGES.map((badge) => (
                    <span key={badge.key} className={`h-1.5 flex-1 rounded-full ${achievements.badges.some((earned) => earned.key === badge.key) ? 'bg-lime-300' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className="relative mt-5 flex flex-wrap gap-2">
              {PROFILE_BADGES.map((badge) => {
                const earned = achievements.badges.some((item) => item.key === badge.key);
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.key}
                    title={earned ? `${badge.name} unlocked` : `${badge.name} locked`}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${earned ? `${badge.bg} ${badge.border} ${badge.color}` : 'border-[#252838] bg-[#0b0d13] text-zinc-600'}`}
                  >
                    {earned ? <Icon className="h-4 w-4" /> : <LockKeyhole className="h-3.5 w-3.5" />}
                    <span className="text-[10px] font-bold">{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Skills Management */}
          <div className="bg-[#14151e] p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Skills & Technologies</h3>
            <p className="text-xs text-zinc-400">
              Add programming languages, frameworks, or algorithmic topics you work with.
            </p>

            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g. C++, Python, Next.js, Docker"
                className="flex-1 bg-[#0b0c10] border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#a3ff20] transition-colors"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-black bg-[#a3ff20] hover:bg-[#b8ff3d] transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {profileData.skills.length === 0 ? (
                <p className="text-xs text-zinc-500">No skills added yet.</p>
              ) : (
                profileData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1f202c] text-[#b4a2f8] border border-[#b4a2f8]/30"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-zinc-400 hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Coding Platforms */}
          <div className="bg-[#14151e] p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Coding Handles & Socials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'leetcode', label: 'LeetCode URL', placeholder: 'https://leetcode.com/u/...' },
                { key: 'codeforces', label: 'Codeforces URL', placeholder: 'https://codeforces.com/profile/...' },
                { key: 'codechef', label: 'CodeChef URL', placeholder: 'https://www.codechef.com/users/...' },
                { key: 'github', label: 'GitHub Profile', placeholder: 'https://github.com/...' },
                { key: 'linkedin', label: 'LinkedIn Profile', placeholder: 'https://linkedin.com/in/...' },
                { key: 'portfolio', label: 'Portfolio Website', placeholder: 'https://...' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {f.label}
                  </label>
                  <input
                    type="url"
                    value={profileData.codingProfiles[f.key] || ''}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        codingProfiles: {
                          ...profileData.codingProfiles,
                          [f.key]: e.target.value,
                        },
                      })
                    }
                    placeholder={f.placeholder}
                    className="w-full bg-[#0b0c10] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20] transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-3 rounded-xl text-xs font-extrabold text-black bg-[#a3ff20] hover:bg-[#b8ff3d] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="bg-[#14151e] p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add New Project</h3>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="e.g. Distributed Key-Value Store"
                    className="w-full bg-[#0b0c10] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#a3ff20] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Tech Stack (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newProject.techStack}
                    onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                    placeholder="e.g. Go, Docker, Raft, gRPC"
                    className="w-full bg-[#0b0c10] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#a3ff20] transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Description</label>
                  <textarea
                    rows={2}
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Describe problem solved, technical choices, and features..."
                    className="w-full bg-[#0b0c10] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#a3ff20] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={newProject.githubLink}
                    onChange={(e) => setNewProject({ ...newProject, githubLink: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full bg-[#0b0c10] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#a3ff20] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={newProject.liveLink}
                    onChange={(e) => setNewProject({ ...newProject, liveLink: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#0b0c10] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#a3ff20] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-black bg-[#a3ff20] hover:bg-[#b8ff3d] transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Projects List</span>
              </button>
            </form>
          </div>

          {/* Existing projects list */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Your Showcase Projects</h4>
            {profileData.projects.length === 0 ? (
              <p className="text-xs text-zinc-500">No projects listed yet.</p>
            ) : (
              profileData.projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="bg-[#14151e] p-5 rounded-2xl border border-zinc-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h5 className="text-sm font-bold text-white">{proj.name}</h5>
                    <p className="text-xs text-zinc-400">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {proj.techStack?.map((t, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2.5 py-0.5 rounded-lg bg-[#1f202c] text-[#b4a2f8] border border-[#b4a2f8]/20 font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(idx)}
                    className="text-zinc-500 hover:text-rose-400 p-1"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleProfileSave}
              disabled={saving}
              className="px-7 py-3 rounded-xl text-xs font-extrabold text-black bg-[#a3ff20] hover:bg-[#b8ff3d] transition-all shadow-sm"
            >
              Save Project Changes
            </button>
          </div>
        </div>
      )}

      {/* Tab: Rating History Chart */}
      {activeTab === 'rating' && (
        <div className="bg-[#14151e] p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Your Rating Progression</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Current platform rating:{' '}
                <span className="text-[#a3ff20] font-black text-sm">{user.rating} pts</span>
              </p>
            </div>
          </div>

          {chartData.length > 0 ? (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232534" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#14151e',
                      borderColor: '#232534',
                      borderRadius: '0.75rem',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#a3ff20"
                    strokeWidth={3}
                    dot={{ fill: '#b4a2f8', r: 4 }}
                    activeDot={{ r: 6, fill: '#a3ff20' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-zinc-500">
              Complete weekly POTW challenges to view your progress graph.
            </div>
          )}
        </div>
      )}

      {/* Tab: Change Password */}
      {activeTab === 'password' && (
        <div className="bg-[#14151e] p-6 sm:p-8 rounded-2xl border border-zinc-800 max-w-md space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Change Password</h3>
            <p className="text-xs text-zinc-400">
              Ensure your account is protected with a secure password of at least 6 characters.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                className="w-full bg-[#0b0c10] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#a3ff20] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                className="w-full bg-[#0b0c10] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#a3ff20] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                className="w-full bg-[#0b0c10] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#a3ff20] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-2 py-3 rounded-xl text-xs font-extrabold text-black bg-[#a3ff20] hover:bg-[#b8ff3d] transition-all disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
