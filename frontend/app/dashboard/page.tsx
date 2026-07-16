'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { getMeetings, cancelMeeting, updateProfile } from '../../services/api';
import { User, Phone, MapPin, Award, Link2, Calendar, FileText, Bot, Edit3, Settings, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserDashboard() {
  const { user, loginWithToken, logout } = useAuth();
  const router = useRouter();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    address: '',
    skills: '',
    linkedin: '',
    github: '',
    twitter: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        address: user.address || '',
        skills: user.skills ? user.skills.join(', ') : '',
        linkedin: user.socialLinks?.linkedin || '',
        github: user.socialLinks?.github || '',
        twitter: user.socialLinks?.twitter || ''
      });
      fetchMeetings();
    }
  }, [user]);

  const fetchMeetings = async () => {
    setLoadingMeetings(true);
    try {
      const res = await getMeetings();
      if (res.success) {
        setMeetings(res.data);
      }
    } catch (err) {
      console.warn('Failed to load meetings list:', err);
    } finally {
      setLoadingMeetings(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const res = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        address: formData.address,
        skills: skillsArray,
        socialLinks: {
          linkedin: formData.linkedin,
          github: formData.github,
          twitter: formData.twitter
        }
      });

      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
        setEditMode(false);
        // Refresh session token/user details
        const token = localStorage.getItem('token');
        if (token) {
          await loginWithToken(token);
        }
      }
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  const handleCancelMeeting = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return;
    try {
      const res = await cancelMeeting(id);
      if (res.success) {
        setSuccessMsg('Meeting cancelled successfully');
        fetchMeetings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-10">
      <div className="absolute top-[10%] left-[-5%] w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Welcome Card */}
      <section className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
            <CheckCircle size={12} />
            <span>Outpro Portal Verified</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Welcome Back, {user.name}!
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            You are logged in as a <span className="text-primary font-bold capitalize">{user.role}</span>. Manage your schedules, optimize resume files, or configure profile preferences below.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => router.push('/ai-assistant')}
            className="px-5 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 shadow-md flex items-center gap-2"
          >
            <Bot size={18} />
            <span>AI Assistant</span>
          </button>
          <button 
            onClick={() => router.push('/meetings')}
            className="px-5 py-2.5 text-sm font-bold text-foreground bg-secondary hover:bg-accent border border-border/40 rounded-xl flex items-center gap-2"
          >
            <Calendar size={18} />
            <span>Book Meeting</span>
          </button>
        </div>
      </section>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-sm font-semibold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card / Form */}
        <section className="lg:col-span-2 glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex justify-between items-center border-b border-border/40 pb-4">
            <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <User size={20} className="text-primary" />
              <span>Profile Settings</span>
            </h2>
            <button
              onClick={() => setEditMode(!editMode)}
              className="p-2 bg-secondary text-foreground hover:bg-accent rounded-lg border border-border/40 text-xs font-bold flex items-center gap-1.5"
            >
              <Edit3 size={14} />
              <span>{editMode ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>

          {!editMode ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Full Name</span>
                  <p className="text-base font-semibold text-foreground">{user.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Email Address</span>
                  <p className="text-base font-semibold text-foreground">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Phone</span>
                  <p className="text-base font-semibold text-foreground">{user.phone || 'Not added'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Address</span>
                  <p className="text-base font-semibold text-foreground">{user.address || 'Not added'}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Bio</span>
                <p className="text-sm text-foreground leading-relaxed font-medium bg-secondary/20 p-4 rounded-xl border border-border/20">
                  {user.bio || 'Add a bio to describe yourself...'}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((s: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-full">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground font-semibold">No skills added yet.</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Social Channels</span>
                <div className="flex gap-4">
                  {user.socialLinks?.linkedin && (
                    <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                      <Link2 size={12} />
                      LinkedIn
                    </a>
                  )}
                  {user.socialLinks?.github && (
                    <a href={user.socialLinks.github} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                      <Link2 size={12} />
                      GitHub
                    </a>
                  )}
                  {user.socialLinks?.twitter && (
                    <a href={user.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                      <Link2 size={12} />
                      Twitter
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background/50 text-foreground"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background/50 text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Bio Description</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background/50 text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Location Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background/50 text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Skills (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Docker"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background/50 text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border/40 pt-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background/50 text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">GitHub Profile</label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background/50 text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Twitter (X) Profile</label>
                  <input
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background/50 text-foreground"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                Save Profile Changes
              </button>
            </form>
          )}
        </section>

        {/* Meetings / Schedules Panel */}
        <section className="glass-panel p-8 rounded-3xl space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-foreground mb-4 flex items-center gap-2">
              <Calendar className="text-primary" size={20} />
              <span>Upcoming Bookings</span>
            </h3>
            
            {loadingMeetings ? (
              <div className="space-y-3 py-4">
                <div className="h-14 w-full bg-secondary/50 rounded-xl animate-pulse" />
                <div className="h-14 w-full bg-secondary/50 rounded-xl animate-pulse" />
              </div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-8 bg-secondary/15 rounded-xl border border-border/20 space-y-2">
                <ShieldAlert size={24} className="text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground font-semibold">No scheduled calls found</p>
                <button
                  onClick={() => router.push('/meetings')}
                  className="text-xs text-primary font-bold underline hover:no-underline"
                >
                  Book your slot now
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {meetings.map((meet) => (
                  <div key={meet._id} className="p-4 bg-secondary/35 rounded-xl border border-border/40 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{meet.title}</h4>
                        <span className="text-[10px] text-muted-foreground font-bold">{meet.date} at {meet.time}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        meet.status === 'scheduled' ? 'bg-primary/10 text-primary' :
                        meet.status === 'rescheduled' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {meet.status}
                      </span>
                    </div>
                    {meet.status !== 'cancelled' && (
                      <div className="flex gap-2 pt-2 border-t border-border/10 justify-between items-center">
                        <a href={meet.googleMeetLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary hover:underline">
                          Join Call
                        </a>
                        <button
                          onClick={() => handleCancelMeeting(meet._id)}
                          className="text-[10px] font-bold text-destructive hover:underline"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground flex justify-between items-center">
            <span>Last checked just now</span>
            <button onClick={fetchMeetings} className="p-1 hover:bg-secondary rounded">
              <RefreshCw size={12} />
            </button>
          </div>
        </section>
      </div>

      {/* Career & Resume Analysis section */}
      {user.role === 'candidate' || user.role === 'user' && (
        <section className="glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-2">
            <FileText className="text-primary" size={22} />
            <h3 className="font-extrabold text-xl text-foreground">AI Career Portal Tools</h3>
          </div>
          <p className="text-sm text-muted-foreground max-w-3xl">
            As a registered candidate, you can access our automated **AI Resume Screening** pipeline. Upload your resume and analyze the keywords, skill gaps, and ATS compliance scores instantly.
          </p>
          <button
            onClick={() => router.push('/resume-analyzer')}
            className="px-5 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Open Resume Analyzer Dashboard
          </button>
        </section>
      )}
    </div>
  );
}
