'use client';

import React, { useEffect, useState } from 'react';
import { getMeetings, bookMeeting, rescheduleMeeting, cancelMeeting } from '../../services/api';
import { Calendar, Video, Clock, XCircle, ArrowLeft, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Book Form
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    title: 'Outpro Consultation Call',
    description: 'B2B software engineering architecture consult call.',
    date: '',
    time: ''
  });

  // Reschedule state
  const [activeReschedule, setActiveReschedule] = useState<any | null>(null);
  const [reschedDate, setReschedDate] = useState('');
  const [reschedTime, setReschedTime] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchMeetingsList = async () => {
    setLoading(true);
    try {
      const res = await getMeetings();
      if (res.success) {
        setMeetings(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingsList();
  }, []);

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await bookMeeting(formData);
      if (res.success) {
        setSuccessMsg('Meeting booked successfully! Google Meet link generated.');
        setFormData({
          userName: '',
          userEmail: '',
          title: 'Outpro Consultation Call',
          description: 'B2B software engineering architecture consult call.',
          date: '',
          time: ''
        });
        fetchMeetingsList();
      }
    } catch (err) {
      setErrorMsg('Failed to process meeting booking request.');
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReschedule || !reschedDate || !reschedTime) return;

    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await rescheduleMeeting(activeReschedule._id, reschedDate, reschedTime);
      if (res.success) {
        setSuccessMsg('Call rescheduled successfully!');
        setActiveReschedule(null);
        setReschedDate('');
        setReschedTime('');
        fetchMeetingsList();
      }
    } catch (err) {
      setErrorMsg('Failed to reschedule the meeting slot.');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return;
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await cancelMeeting(id);
      if (res.success) {
        setSuccessMsg('Meeting cancelled successfully');
        fetchMeetingsList();
      }
    } catch (err) {
      setErrorMsg('Failed to cancel the meeting.');
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-8">
      <div className="absolute top-[5%] right-[-5%] w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Page Header */}
      <section className="flex justify-between items-center border-b border-border/40 pb-6">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <Calendar className="text-primary" size={26} />
              <span>Meeting Scheduler</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Book consultation slot meetings, download confirmation details, and connect with Google Meet templates.
            </p>
          </div>
        </div>
        <button
          onClick={fetchMeetingsList}
          className="p-2 bg-secondary text-foreground border border-border/40 rounded-lg hover:bg-accent transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </section>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-sm font-semibold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-semibold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Book Meeting Form */}
        <section className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-6 self-start">
          <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <span>Select Call Slot</span>
          </h3>

          <form onSubmit={handleBookSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Your Full Name</label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Email Address</label>
              <input
                type="email"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Meeting Subject</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Description / Details</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Target Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Time Slot</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Confirm Booking
            </button>
          </form>
        </section>

        {/* Bookings directory */}
        <section className="lg:col-span-3 space-y-6">
          
          {/* Reschedule Overlay box */}
          {activeReschedule && (
            <div className="glass-panel p-6 rounded-3xl border-2 border-primary/40 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-sm text-foreground uppercase tracking-wider text-primary">Reschedule Meeting Call</h4>
                <button onClick={() => setActiveReschedule(null)} className="text-xs hover:underline text-muted-foreground">Cancel</button>
              </div>
              <form onSubmit={handleRescheduleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">New Date</label>
                  <input
                    type="date"
                    value={reschedDate}
                    onChange={(e) => setReschedDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">New Time</label>
                  <input
                    type="time"
                    value={reschedTime}
                    onChange={(e) => setReschedTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                    required
                  />
                </div>
                <button type="submit" className="py-2.5 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-95 text-xs">
                  Reschedule Slot
                </button>
              </form>
            </div>
          )}

          <div className="glass-panel p-6 rounded-3xl min-h-[400px]">
            <h3 className="font-extrabold text-lg text-foreground mb-6">Scheduled Consultations</h3>

            {loading ? (
              <div className="text-center py-10 animate-pulse text-muted-foreground">Fetching booked consultation records...</div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="h-16 w-16 bg-secondary/50 rounded-full flex items-center justify-center text-muted-foreground mx-auto">
                  <Video size={32} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-foreground text-base">No scheduled meetings</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">Booked schedules will show up here, with direct Google Meet launch links.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {meetings.map((meet) => (
                  <div key={meet._id} className="p-5 bg-secondary/20 border border-border/40 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          meet.status === 'scheduled' ? 'bg-primary/10 text-primary' :
                          meet.status === 'rescheduled' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {meet.status}
                        </span>
                        <span className="text-xs text-muted-foreground font-bold">{meet.date} at {meet.time}</span>
                      </div>
                      <h4 className="font-extrabold text-base text-foreground">{meet.title}</h4>
                      <p className="text-xs text-muted-foreground max-w-md">{meet.description}</p>
                      
                      {meet.status !== 'cancelled' && (
                        <a 
                          href={meet.googleMeetLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                        >
                          <Video size={14} />
                          <span>Google Meet Connection</span>
                        </a>
                      )}
                    </div>

                    {meet.status !== 'cancelled' && (
                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto self-stretch sm:self-center justify-between border-t border-border/10 sm:border-0 pt-3 sm:pt-0">
                        <button
                          onClick={() => {
                            setActiveReschedule(meet);
                            setReschedDate(meet.date);
                            setReschedTime(meet.time);
                          }}
                          className="px-4 py-2 bg-secondary text-foreground hover:bg-accent border border-border/40 rounded-xl text-xs font-bold text-center"
                        >
                          Reschedule Call
                        </button>
                        <button
                          onClick={() => handleCancel(meet._id)}
                          className="px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl text-xs font-bold text-center flex items-center gap-1"
                        >
                          <XCircle size={12} />
                          <span>Cancel Slot</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

      </div>
    </div>
  );
}
