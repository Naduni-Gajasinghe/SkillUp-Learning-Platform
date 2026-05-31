import { useState } from 'react';
import { toast } from 'react-toastify';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { applyForTutor } from '../services/profileService';
import { useNavigate } from 'react-router-dom';

export default function BecomeTutorPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ expertise: '', qualification: '', experience: '', hourlyRate: '', profileImage: null, isAvailable: true });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (field) => (e) => {
    const value = field === 'isAvailable' ? e.target.checked : field === 'profileImage' ? e.target.files?.[0] || null : e.target.value;
    setForm((p) => ({ ...p, [field]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await applyForTutor(form);
      toast.success('Tutor application submitted. Awaiting admin approval.');
      navigate('/app');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Become a tutor</h1>
        <p className="text-sm text-slate-500">Apply to teach on SkillUp. Admin will review your submission.</p>
      </div>

      <Card>
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Expertise</span>
            <input value={form.expertise} onChange={onChange('expertise')} className="w-full rounded-lg border px-3 py-2" />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium">Qualification</span>
            <input value={form.qualification} onChange={onChange('qualification')} className="w-full rounded-lg border px-3 py-2" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium">Experience (years)</span>
              <input type="number" value={form.experience} onChange={onChange('experience')} className="w-full rounded-lg border px-3 py-2" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Hourly rate</span>
              <input type="number" value={form.hourlyRate} onChange={onChange('hourlyRate')} className="w-full rounded-lg border px-3 py-2" />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-sm font-medium">Profile image / supporting file</span>
            <input type="file" onChange={onChange('profileImage')} className="w-full" />
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isAvailable} onChange={onChange('isAvailable')} /> Available for bookings
          </label>

          <div>
            <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Apply to become tutor'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
