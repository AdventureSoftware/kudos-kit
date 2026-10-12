
interface DailyChartProps {
  data: Array<{ date: string; count: number }>;
}

const W = 1040;
const H = 200;
const PAD = { top: 20, right: 8, bottom: 26, left: 28 };
const GAP = 2;
const RADIUS = 4;

const dayFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const fmt = (iso: string) => dayFmt.format(new Date(`${iso}T00:00:00Z`));

export function DailyChart({ data }: DailyChartProps) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const slot = plotW / data.length;
  const barW = Math.max(4, Math.min(28, slot - GAP * 2));
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;
  const baseline = PAD.top + plotH;

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={`Feedback per day, last ${data.length} days. Peak ${max}.`}
      >

        <line x1={PAD.left} x2={W - PAD.right} y1={y(max)} y2={y(max)} className="stroke-border" strokeDasharray="3 3" />
        <line x1={PAD.left} x2={W - PAD.right} y1={baseline} y2={baseline} className="stroke-border" />
        <text x={PAD.left - 6} y={y(max) + 4} textAnchor="end" className="fill-muted text-[11px]">{max}</text>
        <text x={PAD.left - 6} y={baseline + 4} textAnchor="end" className="fill-muted text-[11px]">0</text>

        {data.map((d, i) => {
          const cx = PAD.left + slot * i + slot / 2;
          const top = y(d.count);
          const h = baseline - top;
          return (
            <g key={d.date} className="group">
              <rect x={PAD.left + slot * i} y={PAD.top} width={slot} height={plotH} className="fill-transparent group-hover:fill-surface-muted" />
              {d.count > 0 && (
                <path
                  d={roundedTopBar(cx - barW / 2, top, barW, h, Math.min(RADIUS, h))}
                  className="fill-accent opacity-85 group-hover:opacity-100"
                />
              )}
              <text x={cx} y={Math.min(top, baseline) - 6} textAnchor="middle" className="hidden fill-text text-[12px] font-medium group-hover:block">
                {d.count}
              </text>
              <title>{`${fmt(d.date)}: ${d.count} ${d.count === 1 ? 'item' : 'items'}`}</title>
            </g>
          );
        })}

        {[0, Math.floor(data.length / 2), data.length - 1].map((i) => (
          <text
            key={i}
            x={PAD.left + slot * i + slot / 2}
            y={H - 6}
            textAnchor="middle"
            className="fill-muted text-[11px]"
          >
            {i === data.length - 1 ? 'Today' : fmt(data[i].date)}
          </text>
        ))}
      </svg>

      <table className="sr-only">
        <caption>Feedback per day</caption>
        <thead><tr><th>Date</th><th>Items</th></tr></thead>
        <tbody>
          {data.map((d) => <tr key={d.date}><td>{fmt(d.date)}</td><td>{d.count}</td></tr>)}
        </tbody>
      </table>
    </figure>
  );
}


function roundedTopBar(x: number, y: number, w: number, h: number, r: number): string {
  return [
    `M${x},${y + h}`,
    `V${y + r}`,
    `Q${x},${y} ${x + r},${y}`,
    `H${x + w - r}`,
    `Q${x + w},${y} ${x + w},${y + r}`,
    `V${y + h}`,
    'Z',
  ].join(' ');
}
