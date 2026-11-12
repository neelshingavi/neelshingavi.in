/**
 * Computes topological ordering and longest-path critical path over a task DAG
 * using Kahn's algorithm + dynamic programming.
 * Detects circular dependencies before committing graph edges.
 */
export function criticalPath(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return { cycle: false, path: [], total: 0 };
  }

  const out = new Map();
  const indeg = new Map();
  const dur = new Map();

  for (const task of tasks) {
    out.set(task.id, []);
    indeg.set(task.id, 0);
    dur.set(task.id, Number(task.dur) || 0);
  }

  for (const task of tasks) {
    for (const depId of task.deps || []) {
      if (!out.has(depId)) continue;
      out.get(depId).push(task.id);
      indeg.set(task.id, (indeg.get(task.id) || 0) + 1);
    }
  }

  const queue = [];
  for (const [id, degree] of indeg.entries()) {
    if (degree === 0) queue.push(id);
  }

  const dist = new Map(tasks.map((t) => [t.id, Number(t.dur) || 0]));
  const prev = new Map();
  const order = [];

  while (queue.length > 0) {
    const u = queue.shift();
    order.push(u);

    for (const v of out.get(u) || []) {
      const candidate = (dist.get(u) || 0) + (dur.get(v) || 0);
      if (candidate > (dist.get(v) || 0)) {
        dist.set(v, candidate);
        prev.set(v, u);
      }
      const nextDegree = (indeg.get(v) || 0) - 1;
      indeg.set(v, nextDegree);
      if (nextDegree === 0) {
        queue.push(v);
      }
    }
  }

  if (order.length !== tasks.length) {
    return { cycle: true, path: [], total: 0 };
  }

  let endNode = order[0];
  let maxDist = -Infinity;
  for (const [id, totalDur] of dist.entries()) {
    if (totalDur > maxDist) {
      maxDist = totalDur;
      endNode = id;
    }
  }

  const path = [];
  let cursor = endNode;
  while (cursor) {
    path.unshift(cursor);
    cursor = prev.get(cursor);
  }

  return { cycle: false, path, total: maxDist };
}

