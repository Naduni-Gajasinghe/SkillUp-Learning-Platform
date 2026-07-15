import Card from './Card';

export default function StatCard({ label, value, tone = 'default' }) {
  const toneClass = {
    default: 'from-[#f5f8f4] to-[#edf3ef]',
    cyan: 'from-[#e7f5ef] to-[#d9efe6]',
    amber: 'from-[#fff6df] to-[#fff0cb]',
    emerald: 'from-[#e7f5ef] to-[#d7ecdf]',
    rose: 'from-[#fdecea] to-[#f9ddd9]',
  };

  return (
    <Card className={`bg-gradient-to-br ${toneClass[tone] || toneClass.default}`}>
      <p className="text-xs uppercase tracking-[0.08em] text-skill-dark/70">{label}</p>
      <p className="mt-2 text-3xl font-bold leading-none text-skill-dark">{value ?? '--'}</p>
    </Card>
  );
}
