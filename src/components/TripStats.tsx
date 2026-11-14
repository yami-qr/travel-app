import type { Trip } from "../types/trip";
import { formatNumber, tripStats } from "../utils/stats";

interface TripStatsProps {
  trips: Trip[];
}

/** Four summary tiles with totals across every trip. */
export default function TripStats({ trips }: TripStatsProps) {
  const stats = tripStats(trips);

  const tiles = [
    { label: "Trips planned", value: formatNumber(stats.trips), tone: "green" },
    { label: "Days on the road", value: formatNumber(stats.days), tone: "amber" },
    { label: "Activities lined up", value: formatNumber(stats.activities), tone: "lavender" },
    {
      label: "Spent of total budget",
      value: `${formatNumber(stats.spent)} / ${formatNumber(stats.budget)}`,
      tone: "pink",
    },
  ];

  return (
    <dl className="stat-grid">
      {tiles.map((tile) => (
        <div key={tile.label} className={`stat-tile stat-${tile.tone}`}>
          <dt>{tile.label}</dt>
          <dd>{tile.value}</dd>
        </div>
      ))}
    </dl>
  );
}
