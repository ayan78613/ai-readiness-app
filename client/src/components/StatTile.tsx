import type { LucideIcon } from 'lucide-react';

export function StatTile({
  label,
  value,
  sub,
  icon: Icon
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="stat-tile">
      <div className="stat-tile-top">
        <div className="stat-label">{label}</div>
        {Icon && (
          <div className="stat-icon">
            <Icon size={15} />
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
