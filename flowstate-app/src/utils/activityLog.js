// ─── Activity Log Utility ───────────────────────────────
// Records every action (complete, miss, add, etc.) with timestamps.
// Used by UserDashboard for recent activity feed + heatmap.

const KEY = 'fs_activity_log';

function loadLog() {
  try { const v = localStorage.getItem(KEY); return v ? JSON.parse(v) : []; }
  catch { return []; }
}

function saveLog(log) {
  try {
    // Keep only last 500 entries
    const trimmed = log.slice(-500);
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {}
}

export function logActivity(action, title, category = 'daily') {
  const log = loadLog();
  log.push({
    id: Date.now(),
    action,     // 'completed' | 'unchecked' | 'added' | 'deleted' | 'plus' | 'minus'
    title,
    category,   // 'daily' | 'habit' | 'todo' | 'weekly' | 'monthly'
    timestamp: new Date().toISOString(),
  });
  saveLog(log);
}

export function getActivityLog(limit = 20) {
  return loadLog().reverse().slice(0, limit);
}

// Build heatmap: map of "YYYY-MM-DD" → count of completed actions
export function getHeatmapData(days = 91) {
  const log = loadLog();
  const map = {};

  // Only count 'completed' and 'plus' actions
  log.forEach(entry => {
    if (entry.action === 'completed' || entry.action === 'plus') {
      const day = entry.timestamp.slice(0, 10);
      map[day] = (map[day] || 0) + 1;
    }
  });

  // Build array for last N days
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: map[key] || 0 });
  }

  return result;
}

// Get today's date string
export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
