import { useState } from 'react';
import { GitCommit, Code2, Trophy, Layers } from 'lucide-react';
import { GitHubActivity } from './GitHubActivity.jsx';
import { LeetCodeActivity } from './LeetCodeActivity.jsx';
import { CodeforcesActivity } from './CodeforcesActivity.jsx';

export function CodingActivityShowcase() {
  const [activePlatform, setActivePlatform] = useState('github'); // 'github' | 'leetcode' | 'codeforces' | 'all'

  const platforms = [
    {
      id: 'github',
      label: 'GitHub',
      icon: GitCommit,
      highlight: '21 Repos · 1000 Commits',
      tone: 'lime',
    },
    {
      id: 'leetcode',
      label: 'LeetCode',
      icon: Code2,
      highlight: '169 Solved · 83E/78M/8H',
      tone: 'amber',
    },
    {
      id: 'codeforces',
      label: 'Codeforces',
      icon: Trophy,
      highlight: '1279 Rating · Pupil',
      tone: 'cyan',
    },
    {
      id: 'all',
      label: 'All Signals',
      icon: Layers,
      highlight: 'Full Proof Suite',
      tone: 'violet',
    },
  ];

  return (
    <div className="coding-activity-showcase-shell" aria-label="Developer Velocity & Coding Activity Signals">
      {/* Top Platform Switcher Tabs */}
      <div className="activity-tabs-header">
        <div className="activity-tabs-intro">
          <span className="activity-tabs-tag">VERIFIED ENGINEERING CADENCE</span>
          <h3 className="activity-tabs-title">Development & Algorithmic Track Record</h3>
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
                tabIndex={0}
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

        {activePlatform === 'all' && (
          <div id="panel-all" role="tabpanel" aria-labelledby="tab-all" className="activity-panel-wrap stacked-all">
            <GitHubActivity />
            <LeetCodeActivity />
            <CodeforcesActivity />
          </div>
        )}
      </div>
    </div>
  );
}

