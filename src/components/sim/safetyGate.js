const BLOCKED_KEYWORDS = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'EXEC'];

/**
 * Deterministic read-only SQL guardrail mirroring QueryPilot's validation layer.
 * Allows strictly a single read-only SELECT statement without destructive DDL/DML tokens.
 */
export function safetyGate(sql) {
  if (typeof sql !== 'string') {
    return { pass: false, reason: 'empty query' };
  }

  const clean = sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();

  if (!clean) {
    return { pass: false, reason: 'empty query' };
  }

  const statements = clean
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  if (statements.length !== 1) {
    return { pass: false, reason: 'multiple statements' };
  }

  if (!/^select\b/i.test(statements[0])) {
    return { pass: false, reason: 'statement is not SELECT' };
  }

  const hit = BLOCKED_KEYWORDS.find((keyword) =>
    new RegExp(`\\b${keyword}\\b`, 'i').test(statements[0])
  );

  if (hit) {
    return { pass: false, reason: `blocked token: ${hit}` };
  }

  return { pass: true, reason: 'read-only SELECT' };
}

