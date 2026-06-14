import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { clearAuthError } from '../store/authSlice';
import { fetchMyProfile, updateMyProfile } from '../services/profileService';
import { fetchMyAvailability, createAvailability, updateAvailability, deleteAvailability } from '../services/tutorService';

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const emptyForm = {
  fullName: '',
  bio: '',
  interests: '',
  learningGoals: '',
  expertise: '',
  qualification: '',
  experience: '',
  hourlyRate: '',
  isAvailable: true,
  profileImage: null,
};

export default function ProfilePage() {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [availabilities, setAvailabilities] = useState([]);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });
  const [editingSlot, setEditingSlot] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const roles = useMemo(() => profile?.userRoles?.map((entry) => entry.role?.name).filter(Boolean) || authUser?.roles || [], [authUser?.roles, profile?.userRoles]);
  const isTutor = roles.includes('TUTOR');
  const isLearner = roles.includes('LEARNER');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const profileData = await fetchMyProfile();
        setProfile(profileData);
        setForm({
          fullName: profileData?.fullName || '',
          bio: profileData?.bio || '',
          interests: profileData?.learnerProfile?.interests || '',
          learningGoals: profileData?.learnerProfile?.learningGoals || '',
          expertise: profileData?.tutorProfile?.expertise || '',
          qualification: profileData?.tutorProfile?.qualification || '',
          experience: profileData?.tutorProfile?.experience ?? '',
          hourlyRate: profileData?.tutorProfile?.hourlyRate ?? '',
          isAvailable: profileData?.tutorProfile?.isAvailable ?? true,
          profileImage: null,
        });

        if (profileData?.tutorProfile) {
          try {
            setLoadingAvailability(true);
            const slots = await fetchMyAvailability();
            setAvailabilities(slots);
          } catch (err) {
            console.error('Failed to load availability:', err);
          } finally {
            setLoadingAvailability(false);
          }
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const onChange = (field) => (event) => {
    const value = field === 'isAvailable' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      dispatch(clearAuthError());
      const updatedProfile = await updateMyProfile(form);
      setProfile((prev) => ({ ...prev, ...updatedProfile }));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profile update failed');
    } finally {
      setSaving(false);
    }
  };

  const onAddSlot = async () => {
    try {
      setLoadingAvailability(true);
      const slot = await createAvailability(newSlot);
      setAvailabilities((prev) => [...prev, slot]);
      setNewSlot({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });
      setShowAddSlot(false);
      toast.success('Availability slot added');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add slot');
    } finally {
      setLoadingAvailability(false);
    }
  };

  const onUpdateSlot = async () => {
    try {
      setLoadingAvailability(true);
      const updated = await updateAvailability(editingSlot.id, {
        dayOfWeek: editingSlot.dayOfWeek,
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
      });
      setAvailabilities((prev) => prev.map((s) => (s.id === editingSlot.id ? updated : s)));
      setEditingSlot(null);
      toast.success('Availability slot updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update slot');
    } finally {
      setLoadingAvailability(false);
    }
  };

  const onDeleteSlot = async (id) => {
    if (window.confirm('Delete this availability slot?')) {
      try {
        setLoadingAvailability(true);
        await deleteAvailability(id);
        setAvailabilities((prev) => prev.filter((s) => s.id !== id));
        toast.success('Availability slot deleted');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete slot');
      } finally {
        setLoadingAvailability(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
      </div>
    );
  }

  const inputClasses = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-indigo-500/20 transition-all focus:border-indigo-500 focus:ring-4";
  const labelClasses = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8 text-slate-900">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="mt-2 text-slate-600">Update your personal information and manage your teaching schedule.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative group">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-indigo-50 text-3xl font-bold text-indigo-600 border-2 border-indigo-100 transition-colors group-hover:bg-indigo-100">
                  {profile?.fullName?.slice(0, 1)?.toUpperCase() || 'U'}
                </div>
                <label className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-md border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                  <CameraIcon />
                  <input type="file" className="hidden" onChange={(e) => setForm((prev) => ({ ...prev, profileImage: e.target.files?.[0] || null }))} />
                </label>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{profile?.fullName || 'User Profile'}</h2>
                <p className="text-slate-500 font-medium">{profile?.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <span key={role} className="inline-flex items-center rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-slate-600 tracking-wide">
                      {role}
                    </span>
                  ))}
                  {profile?.tutorProfile?.verificationStatus === 'VERIFIED' && (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-600 tracking-wide border border-emerald-100">
                      VERIFIED TUTOR
                    </span>
                  )}
                </div>
              </div>
            </div>

            <form className="mt-10 space-y-6" onSubmit={onSubmit}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className={labelClasses}>Full Name</label>
                  <input className={inputClasses} value={form.fullName} onChange={onChange('fullName')} placeholder="Enter your full name" />
                </div>
                <div>
                  <label className={labelClasses}>Email Address</label>
                  <input className={`${inputClasses} bg-slate-50 cursor-not-allowed`} value={profile?.email} disabled />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Biography</label>
                <textarea className={inputClasses} rows={4} value={form.bio} onChange={onChange('bio')} placeholder="Tell us about yourself..." />
              </div>

              {isLearner && (
                <div className="grid gap-6 sm:grid-cols-2 pt-4 border-t border-slate-100">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-bold mb-4">Learner Preferences</h3>
                  </div>
                  <div>
                    <label className={labelClasses}>Interests</label>
                    <input className={inputClasses} value={form.interests} onChange={onChange('interests')} placeholder="e.g. React, UI Design" />
                  </div>
                  <div>
                    <label className={labelClasses}>Learning Goals</label>
                    <input className={inputClasses} value={form.learningGoals} onChange={onChange('learningGoals')} placeholder="What do you want to achieve?" />
                  </div>
                </div>
              )}

              {isTutor && (
                <div className="pt-6 border-t border-slate-100 space-y-6">
                  <h3 className="text-lg font-bold">Tutor Details</h3>
                  <div>
                    <label className={labelClasses}>Area of Expertise</label>
                    <input className={inputClasses} value={form.expertise} onChange={onChange('expertise')} placeholder="e.g. Fullstack Web Development" />
                  </div>
                  <div className="grid gap-6 sm:grid-cols-3">
                    <div>
                      <label className={labelClasses}>Qualification</label>
                      <input className={inputClasses} value={form.qualification} onChange={onChange('qualification')} placeholder="e.g. B.Sc in CS" />
                    </div>
                    <div>
                      <label className={labelClasses}>Exp. (Years)</label>
                      <input type="number" className={inputClasses} value={form.experience} onChange={onChange('experience')} />
                    </div>
                    <div>
                      <label className={labelClasses}>Hourly Rate ($)</label>
                      <input type="number" className={inputClasses} value={form.hourlyRate} onChange={onChange('hourlyRate')} />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={form.isAvailable} onChange={onChange('isAvailable')} />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Available for new bookings</span>
                  </label>
                </div>
              )}

              <div className="pt-6 flex justify-end">
                <button type="submit" disabled={saving} className="min-w-[140px] rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 active:scale-[0.98]">
                  {saving ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </section>

          {isLearner && (
            <section className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-indigo-900">Want to share your knowledge?</h3>
                <p className="text-sm text-indigo-700 mt-1">Join our community of tutors and start earning today.</p>
              </div>
              <Link to="/learner/become-tutor" className="whitespace-nowrap rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-700 shadow-sm active:scale-[0.98]">
                Become a Tutor
              </Link>
            </section>
          )}
        </div>

        <div className="space-y-8">
          {isTutor && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Availability</h3>
                {!showAddSlot && (
                  <button onClick={() => setShowAddSlot(true)} className="text-sm font-bold text-indigo-600 hover:text-indigo-500">
                    Add Slot
                  </button>
                )}
              </div>

              {loadingAvailability && (
                <div className="flex justify-center py-6">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                </div>
              )}

              {!loadingAvailability && availabilities.length === 0 && !showAddSlot && (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                    <ClockIcon />
                  </div>
                  <p className="text-sm text-slate-500">No schedule set up yet.</p>
                </div>
              )}

              <div className="space-y-3">
                {availabilities.map((slot) => (
                  <div key={slot.id} className="group relative flex items-center justify-between rounded-xl border border-slate-100 p-4 transition-all hover:border-indigo-100 hover:bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-900">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][slot.dayOfWeek]}
                      </p>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-tighter">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingSlot(slot)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => onDeleteSlot(slot.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {(showAddSlot || editingSlot) && (
                <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <h4 className="font-bold text-sm mb-4">{editingSlot ? 'Edit Schedule' : 'New Schedule'}</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-1">Day</label>
                      <select
                        value={editingSlot ? editingSlot.dayOfWeek : newSlot.dayOfWeek}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (editingSlot) setEditingSlot({ ...editingSlot, dayOfWeek: val });
                          else setNewSlot({ ...newSlot, dayOfWeek: val });
                        }}
                        className={inputClasses}
                      >
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => (
                          <option key={i} value={i}>{day}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-1">Start</label>
                        <input
                          type="time"
                          value={editingSlot ? editingSlot.startTime : newSlot.startTime}
                          onChange={(e) => {
                            if (editingSlot) setEditingSlot({ ...editingSlot, startTime: e.target.value });
                            else setNewSlot({ ...newSlot, startTime: e.target.value });
                          }}
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-1">End</label>
                        <input
                          type="time"
                          value={editingSlot ? editingSlot.endTime : newSlot.endTime}
                          onChange={(e) => {
                            if (editingSlot) setEditingSlot({ ...editingSlot, endTime: e.target.value });
                            else setNewSlot({ ...newSlot, endTime: e.target.value });
                          }}
                          className={inputClasses}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={editingSlot ? onUpdateSlot : onAddSlot}
                        disabled={loadingAvailability}
                        className="flex-1 rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
                      >
                        {editingSlot ? 'Update' : 'Add'}
                      </button>
                      <button
                        onClick={() => { setShowAddSlot(false); setEditingSlot(null); }}
                        className="flex-1 rounded-lg bg-white border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
