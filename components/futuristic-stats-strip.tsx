export default function FuturisticStatsStrip() {
  const stats = [
    { label: "AI Tutors", value: "08+" },
    { label: "Subjects", value: "15+" },
    { label: "Adaptive Paths", value: "∞" },
    { label: "Reward Layer", value: "GENI" }
  ];

  return (
    <section className="fg-shell mb-6">
      <div className="fg-grid fg-grid-4">
        {stats.map((item) => (
          <div key={item.label} className="fg-kpi fg-neon-ring">
            <div className="text-xs uppercase tracking-[0.22em] text-white/60">
              {item.label}
            </div>
            <div className="fg-metric mt-3">{item.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

