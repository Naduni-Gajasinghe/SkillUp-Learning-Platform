import Card from './Card';

export default function StatCard({ label, value, tone = 'default' }) {
  const toneClass = {
    default: 'from-slate-50 to-slate-100',
    cyan: 'from-cyan-50 to-cyan-100',
    amber: 'from-amber-50 to-amber-100',
    emerald: 'from-emerald-50 to-emerald-100',
  };

  return (
    <Card className={`bg-gradient-to-br ${toneClass[tone] || toneClass.default}`}>
      <p className="text-xs uppercase tracking-wide text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value ?? '--'}</p>
    </Card>
  );
}
