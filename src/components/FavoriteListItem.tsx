import { Card } from "./Card";
import { Star } from "@/components/icons";
import { formatLastCompleted } from "@/lib/date-utils";
import type { SavedWorkoutSummary } from "@/lib/favorites-api";

interface FavoriteListItemProps {
  favorite: SavedWorkoutSummary;
  onClick: () => void;
  showLeftColumn?: boolean;
}

export function FavoriteListItem({ favorite, onClick, showLeftColumn }: FavoriteListItemProps) {
  return (
    <Card onClick={onClick} padding="md" showLeftColumn={showLeftColumn}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p
            className="text-label-sm"
            style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-card-header)' }}
          >
            {favorite.title}
          </p>
          <p
            className="text-paragraph-sm"
            style={{ textTransform: 'uppercase', marginTop: 'var(--spacing-100)', color: 'var(--text-paragraph)' }}
          >
            {favorite.anchor && `${favorite.anchor} \u2022 `}
            {favorite.durationMins && `${favorite.durationMins} min \u2022 `}
            Int. {favorite.intensity}
          </p>
          <p
            className="text-paragraph-sm"
            style={{ marginTop: 'var(--spacing-100)', color: 'var(--text-paragraph)' }}
          >
            {favorite.timesCompleted}× completed {'\u2022'} {formatLastCompleted(favorite.lastCompletedAt)}
          </p>
        </div>
        <Star size={16} style={{ color: 'var(--icon-badge)' }} />
      </div>
    </Card>
  );
}
