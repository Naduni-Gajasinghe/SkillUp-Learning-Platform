import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { fetchTutorOverview } from '../services/adminService';

export default function AdminTutorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchTutorOverview(id);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Tutor not found.</div>;

  const { profile, stats } = data;
  const tutor = profile.tutorProfile || profile;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tutor Overview</h1>
        <Button onClick={() => navigate('/admin/dashboard')}>Back</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Profile</h2>
          <div className="mt-4 space-y-2 text-sm">
            <p><strong>Name:</strong> {profile.user?.fullName || profile.user?.email}</p>
            <p><strong>Email:</strong> {profile.user?.email}</p>
            <p><strong>Expertise:</strong> {tutor.expertise || '—'}</p>
            <p><strong>Hourly rate:</strong> {tutor.hourlyRate ?? '—'}</p>
            <p><strong>Verification:</strong> {tutor.verificationStatus}</p>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Work Analytics</h2>
          <div className="mt-4 space-y-2 text-sm">
            <p><strong>Lessons:</strong> {stats?.lessonCount || 0}</p>
            <p><strong>Bookings:</strong> {stats?.totalBookings || 0}</p>
            <p><strong>Views:</strong> {stats?.totalViews || 0}</p>
            <p><strong>Total earnings:</strong> {stats?.totalEarnings ?? 0}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
