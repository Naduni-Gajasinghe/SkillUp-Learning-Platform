import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { clearAuthError } from '../store/authSlice';
import { fetchMyProfile, updateMyProfile } from '../services/profileService';
import { fetchMyAvailability, createAvailability, updateAvailability, deleteAvailability } from '../services/tutorService';

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

        // Load availability for tutors
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
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading profile...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500">Manage your account and role-specific profile details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr,0.9fr]">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan-100 text-xl font-bold text-cyan-700">
              {profile?.fullName?.slice(0, 1)?.toUpperCase() || 'S'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{profile?.fullName || 'Profile'}</h2>
              <p className="text-sm text-slate-500">{profile?.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {roles.map((role) => (
                  <span key={role} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    {role}
                  </span>
                ))}
                {profile?.tutorProfile?.verificationStatus ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                    {profile.tutorProfile.verificationStatus}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700">Full name</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.fullName} onChange={onChange('fullName')} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700">Profile image</span>
                <input
                  type="file"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  onChange={(e) => setForm((prev) => ({ ...prev, profileImage: e.target.files?.[0] || null }))}
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Bio</span>
              <textarea className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={4} value={form.bio} onChange={onChange('bio')} />
            </label>

            {isLearner ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm font-medium text-slate-700">Interests</span>
                  <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.interests} onChange={onChange('interests')} />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium text-slate-700">Learning goals</span>
                  <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.learningGoals} onChange={onChange('learningGoals')} />
                </label>
              </div>
            ) : null}

            {isLearner ? (
              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">Want to teach on SkillUp?</h3>
                    <p className="text-sm text-slate-600">Apply to become a tutor and get reviewed by an admin.</p>
                  </div>
                  <Link
                    to="/learner/become-tutor"
                    className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
                  >
                    Become a tutor
                  </Link>
                </div>
              </div>
            ) : null}

            {isTutor ? (
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-900">Tutor profile</h3>
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-slate-700">Expertise</span>
                  <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.expertise} onChange={onChange('expertise')} />
                </label>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-slate-700">Qualification</span>
                    <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.qualification} onChange={onChange('qualification')} />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-slate-700">Experience</span>
                    <input type="number" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.experience} onChange={onChange('experience')} />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-slate-700">Hourly rate</span>
                    <input type="number" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.hourlyRate} onChange={onChange('hourlyRate')} />
                  </label>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={form.isAvailable} onChange={onChange('isAvailable')} />
                  Available for bookings
                </label>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</Button>
            </div>
          </form>
        </Card>

        {isTutor && (
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Available Time Slots</h3>
              {!showAddSlot && <Button onClick={() => setShowAddSlot(true)}>Add slot</Button>}
            </div>

            {loadingAvailability && (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
              </div>
            )}

            {!loadingAvailability && availabilities.length === 0 && !showAddSlot && (
              <p className="text-sm text-slate-500">No availability slots yet. Add one to start accepting bookings.</p>
            )}

            {!loadingAvailability && availabilities.length > 0 && !editingSlot && (
              <div className="space-y-2">
                {availabilities.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div>
                      <p className="font-medium text-slate-900">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][slot.dayOfWeek] || 'Day'}
                      </p>
                      <p className="text-sm text-slate-600">{slot.startTime} – {slot.endTime}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingSlot(slot)}
                        className="rounded-lg bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-700 hover:bg-cyan-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteSlot(slot.id)}
                        className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(showAddSlot || editingSlot) && (
              <div className="space-y-3 rounded-lg bg-slate-50 p-4">
                <h4 className="font-medium text-slate-900">{editingSlot ? 'Edit' : 'Add new'} time slot</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="space-y-1">
                    <span className="text-xs font-medium text-slate-600">Day of week</span>
                    <select
                      value={editingSlot ? editingSlot.dayOfWeek : newSlot.dayOfWeek}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (editingSlot) setEditingSlot({ ...editingSlot, dayOfWeek: val });
                        else setNewSlot({ ...newSlot, dayOfWeek: val });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => (
                        <option key={i} value={i}>{day}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-medium text-slate-600">Start time</span>
                    <input
                      type="time"
                      value={editingSlot ? editingSlot.startTime : newSlot.startTime}
                      onChange={(e) => {
                        if (editingSlot) setEditingSlot({ ...editingSlot, startTime: e.target.value });
                        else setNewSlot({ ...newSlot, startTime: e.target.value });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-medium text-slate-600">End time</span>
                    <input
                      type="time"
                      value={editingSlot ? editingSlot.endTime : newSlot.endTime}
                      onChange={(e) => {
                        if (editingSlot) setEditingSlot({ ...editingSlot, endTime: e.target.value });
                        else setNewSlot({ ...newSlot, endTime: e.target.value });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={editingSlot ? onUpdateSlot : onAddSlot}
                    disabled={loadingAvailability}
                  >
                    {loadingAvailability ? 'Saving...' : editingSlot ? 'Update slot' : 'Add slot'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowAddSlot(false);
                      setEditingSlot(null);
                    }}
                    disabled={loadingAvailability}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
