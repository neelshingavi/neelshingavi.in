import { ExternalLink, RefreshCw } from 'lucide-react';

/**
 * Shared header row for Verified Engineering Cadence cards (GitHub, LeetCode, Codeforces).
 * Keeps badge, top-right actions, full-width heading, and single-line subtitle consistent.
 */
export function CodingActivityHeader({
  badgeIcon: BadgeIcon,
  badgeClassName = '',
  badgeText,
  heading,
  subtext,
  onRefresh,
  isRefreshing,
  isLoading,
  refreshClassName = '',
  refreshTitle,
  refreshAriaLabel,
  profileUrl,
  profileClassName = '',
  profileTitle,
  profileLabel,
}) {
  return (
    <div className="gh-header">
      <div className="gh-header-top">
        <div className={`gh-badge ${badgeClassName}`.trim()}>
          {BadgeIcon && <BadgeIcon size={14} aria-hidden="true" />}
          <span>{badgeText}</span>
        </div>

        <div className="gh-header-actions">
          <button
            type="button"
            className={`gh-refresh-btn ${refreshClassName}`.trim()}
            onClick={onRefresh}
            disabled={isRefreshing || isLoading}
            title={refreshTitle}
            aria-label={refreshAriaLabel}
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin-icon' : ''} aria-hidden="true" />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`gh-profile-btn ${profileClassName}`.trim()}
            title={profileTitle}
          >
            <span>{profileLabel}</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="gh-title-group">
        <h3 className="gh-heading">{heading}</h3>
        <p className="gh-sub">{subtext}</p>
      </div>
    </div>
  );
}

