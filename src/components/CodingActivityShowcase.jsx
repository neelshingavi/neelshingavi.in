import { useState } from 'react';
import { GitCommit, Code2, Trophy } from 'lucide-react';
import { GitHubActivity } from './GitHubActivity.jsx';
import { LeetCodeActivity } from './LeetCodeActivity.jsx';
import { CodeforcesActivity } from './CodeforcesActivity.jsx';

export function CodingActivityShowcase() {
  const [activePlatform, setActivePlatform] = useState('github'); // 'github' | 'leetcode' | 'codeforces'

  const platforms = [
    {
      id: 'github',
      label: 'GitHub',
      icon: GitCommit,
      highlight: 'Open Source Cadence',
      tone: 'lime',
    },
    {
      id: 'leetcode',
      label: 'LeetCode',
      icon: Code2,
      highlight: 'Algorithmic Problem Solving',
      tone: 'amber',
    },
    {
      id: 'codeforces',
      label: 'Codeforces',
      icon: Trophy,
      highlight: 'Div. 2 Competitive Contests',
      tone: 'cyan',
    },
  ];

  return (
    <div className="coding-activity-showcase-shell" aria-label="Developer Velocity & Coding Activity Signals">
      {/* Top Section Heading + Platform Switcher Tabs */}
      <div className="activity-tabs-header">
        <div className="section-heading activity-tabs-intro">
          <p className="eyebrow">04 / VERIFIED ENGINEERING CADENCE</p>
          <h2 id="cadence-heading">Development &amp; Algorithmic <em className="fx-accent">Track Record.</em></h2>
        </div>

        <div className="activity-platform-tabs" role="tablist" aria-label="Coding platform selectors">
          {platforms.map((p) => {
            const Icon = p.icon;
            const isActive = activePlatform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                id={`tab-${p.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${p.id}`}
                tabIndex={isActive ? 0 : -1}
                className={`platform-tab tone-${p.tone} ${isActive ? 'is-active' : ''}`}
                onClick={() => setActivePlatform(p.id)}
              >
                <div className="platform-tab-top">
                  <Icon size={14} className="platform-tab-icon" aria-hidden="true" />
                  <span className="platform-tab-name">{p.label}</span>
                </div>
                <span className="platform-tab-badge">{p.highlight}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Platform Content */}
      <div className="activity-panels-container">
        {activePlatform === 'github' && (
          <div id="panel-github" role="tabpanel" aria-labelledby="tab-github" className="activity-panel-wrap">
            <GitHubActivity />
          </div>
        )}

        {activePlatform === 'leetcode' && (
          <div id="panel-leetcode" role="tabpanel" aria-labelledby="tab-leetcode" className="activity-panel-wrap">
            <LeetCodeActivity />
          </div>
        )}

        {activePlatform === 'codeforces' && (
          <div id="panel-codeforces" role="tabpanel" aria-labelledby="tab-codeforces" className="activity-panel-wrap">
            <CodeforcesActivity />
          </div>
        )}
      </div>
    </div>
  );
}
