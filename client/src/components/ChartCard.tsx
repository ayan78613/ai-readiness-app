import { ReactNode, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  table?: ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, icon: Icon, children, table, className }: Props) {
  const [showTable, setShowTable] = useState(false);
  return (
    <div className={`card chart-card ${className ?? ''}`}>
      <div className="chart-card-header">
        <div className="chart-card-heading">
          {Icon && (
            <div className="chart-card-icon">
              <Icon size={15} />
            </div>
          )}
          <div>
            <div className="card-title" style={{ margin: 0 }}>{title}</div>
            {subtitle && <div className="chart-card-subtitle">{subtitle}</div>}
          </div>
        </div>
        {table && (
          <button className="toggle-table-btn" onClick={() => setShowTable((s) => !s)}>
            {showTable ? 'View chart' : 'View as table'}
          </button>
        )}
      </div>
      {showTable && table ? table : children}
    </div>
  );
}
