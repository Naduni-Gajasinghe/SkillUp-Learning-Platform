import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import {
  fetchAdminPaymentWorkflow,
  fetchPendingTutorApplications,
  fetchPlatformAnalytics,
  updatePaymentStatus,
  updateTutorVerificationStatus,
} from '../services/adminService';

const paymentActions = [
  { status: 'COMPLETED', label: 'Mark completed', tone: 'primary' },
  { status: 'FAILED', label: 'Mark failed', tone: 'secondary' },
  { status: 'REFUNDED', label: 'Refund', tone: 'danger' },
];

export default function AdminDashboardPage() {
  const [platformStats, setPlatformStats] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [pendingTutors, setPendingTutors] = useState([]);

  const load = async () => {
    const [platformData, workflowData, tutorsData] = await Promise.all([
      fetchPlatformAnalytics(),
      fetchAdminPaymentWorkflow(),
      fetchPendingTutorApplications(),
    ]);

    setPlatformStats(platformData);
    setWorkflow(workflowData);
    setPendingTutors(tutorsData);
  };

  useEffect(() => {
    load();
  }, []);

  const onTutorAction = async (userId, verificationStatus) => {
    await updateTutorVerificationStatus(userId, verificationStatus);
    await load();
  };

  const onPaymentAction = async (paymentId, status) => {
    await updatePaymentStatus(paymentId, status);
    await load();
  };

  const bookingsByStatus = platformStats?.bookingsByStatus || [];
  const paymentSummary = workflow?.summary || {};
  const subscriptions = workflow?.subscriptions || [];
  const recentPayments = workflow?.recentPayments || [];
  const paymentReviewQueue = workflow?.pendingReview || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-skill-dark">Admin Dashboard</h1>
        <p className="text-sm text-skill-dark/80">Monitor tutor approvals, platform health, and payment gateway activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users" value={platformStats?.totalUsers || 0} tone="cyan" />
        <StatCard label="Lessons" value={platformStats?.totalLessons || 0} tone="amber" />
        <StatCard label="Avg tutor rate" value={platformStats?.averageTutorRate || 0} tone="emerald" />
        <StatCard label="Pending payments" value={paymentSummary?.pendingPayments || 0} tone="rose" />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-skill-dark">Tutor approval queue</h2>
            <p className="text-sm text-skill-dark/70">Review applications before they can teach on the platform.</p>
          </div>
          <div className="text-sm text-skill-dark/70">{pendingTutors.length} pending application(s)</div>
        </div>

        <div className="mt-4 space-y-3">
          {pendingTutors.map((tutor) => (
            <div key={tutor.id} className="rounded-ui border border-skill-border bg-[#fbfdfc] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-skill-dark">{tutor.user?.fullName || 'Tutor applicant'}</p>
                  <p className="text-sm text-skill-dark/75">{tutor.user?.email}</p>
                  <p className="mt-1 text-sm text-skill-dark/85">Expertise: {tutor.expertise || 'Not provided'}</p>
                  <p className="text-sm text-skill-dark/85">Experience: {tutor.experience ?? 'N/A'} years</p>
                  <p className="text-sm text-skill-dark/85">Hourly rate: {tutor.hourlyRate ?? 'N/A'}</p>
                  <p className="text-xs uppercase tracking-wide text-skill-dark/70">Status: {tutor.verificationStatus}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => onTutorAction(tutor.userId, 'APPROVED')}>Approve</Button>
                  <Button variant="danger" onClick={() => onTutorAction(tutor.userId, 'REJECTED')}>
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {pendingTutors.length === 0 ? <p className="text-sm text-skill-dark/70">No pending tutor applications.</p> : null}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.4fr,0.9fr]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-skill-dark">Payment gateway workflow</h2>
              <p className="text-sm text-skill-dark/70">Review pending transactions and finalize gateway status.</p>
            </div>
            <div className="text-sm text-skill-dark/70">Revenue: {paymentSummary?.totalRevenue || 0}</div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Transactions" value={paymentSummary?.totalTransactions || 0} />
            <StatCard label="Completed" value={paymentSummary?.completedPayments || 0} tone="emerald" />
            <StatCard label="Failed" value={paymentSummary?.failedPayments || 0} tone="rose" />
            <StatCard label="Refunded" value={paymentSummary?.refundedPayments || 0} tone="amber" />
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-skill-dark/65">Pending review</h3>
            {paymentReviewQueue.map((payment) => (
              <div key={payment.id} className="rounded-ui border border-skill-border bg-[#fbfdfc] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-skill-dark">{payment.purpose}</p>
                    <p className="text-sm text-skill-dark/75">{payment.user?.fullName || payment.user?.email}</p>
                    <p className="text-sm text-skill-dark/85">Amount: {payment.amount}</p>
                    <p className="text-xs text-skill-dark/65">Gateway: {payment.paymentMethod}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {paymentActions.map((action) => (
                      <Button
                        key={action.status}
                        variant={action.tone}
                        onClick={() => onPaymentAction(payment.id, action.status)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {paymentReviewQueue.length === 0 ? <p className="text-sm text-skill-dark/70">No pending payment reviews.</p> : null}
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-skill-dark/65">Recent payments</h3>
            {recentPayments.map((payment) => (
              <div key={payment.id} className="rounded-ui border border-skill-border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-skill-dark">{payment.purpose}</p>
                    <p className="text-skill-dark/75">{payment.user?.fullName || payment.user?.email}</p>
                  </div>
                  <span className="rounded-full bg-[#edf3ef] px-3 py-1 text-xs font-semibold text-skill-dark/85">
                    {payment.status}
                  </span>
                </div>
                <p className="mt-2 text-skill-dark/85">{payment.paymentMethod} · {payment.amount}</p>
              </div>
            ))}
            {recentPayments.length === 0 ? <p className="text-sm text-skill-dark/70">No payment history yet.</p> : null}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-skill-dark">Platform snapshot</h2>
          <div className="mt-4 space-y-3 text-sm text-skill-dark/85">
            <p>Subscription plans</p>
            <div className="space-y-2">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="rounded-ui border border-skill-border p-3">
                  <p className="font-medium text-skill-dark">{subscription.user?.fullName || 'User'}</p>
                  <p className="text-skill-dark/75">Plan: {subscription.plan}</p>
                  <p className="text-skill-dark/75">Status: {subscription.status}</p>
                </div>
              ))}
              {subscriptions.length === 0 ? <p className="text-skill-dark/70">No subscriptions yet.</p> : null}
            </div>

            <div>
              <p className="mb-2 font-medium text-skill-dark">Bookings by status</p>
              <div className="space-y-2">
                {bookingsByStatus.map((entry) => (
                  <div key={entry.status} className="flex items-center justify-between rounded-ui bg-[#edf3ef] px-3 py-2">
                    <span>{entry.status}</span>
                    <span className="font-semibold text-skill-dark">{entry._count?._all || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 font-medium text-skill-dark">Gateway breakdown</p>
              <div className="space-y-2">
                {Object.entries(paymentSummary?.gatewayBreakdown || {}).map(([gateway, count]) => (
                  <div key={gateway} className="flex items-center justify-between rounded-ui bg-[#edf3ef] px-3 py-2">
                    <span>{gateway}</span>
                    <span className="font-semibold text-skill-dark">{count}</span>
                  </div>
                ))}
                {Object.keys(paymentSummary?.gatewayBreakdown || {}).length === 0 ? (
                  <p className="text-skill-dark/70">No gateway activity yet.</p>
                ) : null}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}