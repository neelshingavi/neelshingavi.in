# **Production latency audit — PASC Bonus**

I inspected the uploaded source tree, including the React frontend, Express API, Prisma schema, database access paths, authentication middleware, leaderboard calculations, learning flows, coding verification clients, social features, and admin reports.

**The repository contains several identifiable latency bottlenecks.** The most important are not cosmetic optimizations: some requests perform repeated database work that grows with the number of students, tasks, or progress records. There are also frontend decisions that make users wait for the backend even when the page itself could be displayed immediately.

A key limitation: source code can identify inefficient request paths, but it cannot prove which one dominates production latency without runtime measurements. I do not have your production traces, database execution plans, hosting region, database tier, or traffic profile. I’ll distinguish confirmed code-level problems from improvements that should be validated under production-like load.

## **1. Executive summary: highest-priority findings**

| Priority | Finding                                                                                                           | Where it occurs                                                                                               | Likely impact                         |
| -------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| P0       | Leaderboard fully aggregates and sorts scoring records on every request; pagination happens afterwards            | `backend/src/routes/leaderboard.ts`                                                                           | Very high as data grows               |
| P0       | Day-detail endpoint executes prerequisite checks serially, with repeated task and progress queries                | `backend/src/routes/learn.ts`                                                                                 | High on learning-page loads           |
| P0       | Public routes wait for an API session check before rendering                                                      | `frontend/src/App.tsx`, `frontend/src/pages/auth/SessionContext.tsx`                                          | High for initial page display         |
| P1       | Authenticated API calls query the student in middleware, and some handlers query the same student again           | `backend/src/middleware/studentAuth.ts`, `backend/src/routes/studentAuth.ts`, `backend/src/routes/profile.ts` | High when requests are frequent       |
| P1       | Admin module reports load large populations of progress and reward data into Node.js and aggregate them in memory | `backend/src/routes/adminReports.ts`                                                                          | Very high for large cohorts           |
| P1       | Learning mutations perform multiple database-backed rate-limit increments before business logic                   | `backend/src/middleware/rateLimiters.ts`, `backend/src/middleware/postgresRateLimitStore.ts`                  | Medium–high for write-heavy traffic   |
| P1       | Coding verification performs several sequential database checks before contacting external providers              | `backend/src/routes/codingTasks.ts`, `backend/src/lib/sharedVerificationState.ts`                             | High for coding verification          |
| P2       | Social search uses substring matching without a matching search index                                             | `backend/src/routes/social.ts`, `backend/prisma/schema.prisma`                                                | Medium as the student directory grows |
| P2       | Frontend statically imports many route-specific modules and heavy dependencies                                    | `frontend/src/App.tsx`                                                                                        | Medium for initial load               |
| P2       | Font requests are duplicated across HTML and CSS; some page images are relatively large and not lazy-loaded       | `frontend/index.html`, `frontend/src/index.css`, `frontend/src/pages/CrewPage.tsx`                            | Medium for affected pages             |

**My recommended order:** instrument the application first, then fix the leaderboard and learning prerequisite logic, remove the public-route session-rendering block, optimize admin reports, and address database/authentication round trips. These changes can retain the existing API contracts, scoring rules, authorization checks, and reward semantics.

## **2. Measure before optimizing: establish where the latency actually occurs**

This is the most important operational step. A slow page can be caused by a slow API, several sequential API requests, database connection waiting, external-provider latency, JavaScript execution, or a slow first render. Optimizing the wrong layer may produce little visible improvement.

### **2.1 Instrument each API request**

Add request-level timing middleware in `backend/src/index.ts`.

For each request, record:

| Metric                | What it tells you                                        |
| --------------------- | -------------------------------------------------------- |
| `request_duration_ms` | Total API response time                                  |
| `route`               | Which endpoint is slow                                   |
| `status_code`         | Whether failures and retries correlate with latency      |
| `db_query_count`      | Whether a route has an unusually large number of queries |
| `db_total_ms`         | Time spent waiting for database queries                  |
| `db_max_query_ms`     | Whether one query dominates the request                  |
| `external_api_ms`     | Time spent waiting for LeetCode or Codeforces            |
| `event_loop_delay_ms` | Whether Node.js is busy with CPU work                    |
| `request_id`          | Allows frontend, API and database logs to be correlated  |

Use `performance.now()` for elapsed-time measurements. Avoid logging request bodies, authentication cookies, tokens, or other sensitive data.

A useful structured log would look like:

```
{
  "request_id": "generated-request-id",
  "method": "GET",
  "route": "/api/leaderboard",
  "status_code": 200,
  "request_duration_ms": 840,
  "db_query_count": 6,
  "db_total_ms": 690,
  "db_max_query_ms": 310,
  "external_api_ms": 0
}
```

The values above are illustrative, not measured values from your deployment.

**Important:** don't leave verbose per-query logging enabled for every production request indefinitely. Use sampling, aggregate statistics, or an observability platform to avoid turning instrumentation into another source of latency.

### **2.2 Measure frontend performance separately**

Track the following browser metrics:

| Metric | What to investigate                                      |
| ------ | -------------------------------------------------------- |
| TTFB   | Backend response, geographic distance, database waits    |
| FCP    | Initial HTML, CSS, font loading, initial React rendering |
| LCP    | Largest visible content, images, loading dependencies    |
| INP    | Expensive JavaScript, React rerenders, synchronous work  |
| CLS    | Missing image dimensions, late-loading fonts and content |

Add Real User Monitoring rather than relying only on Lighthouse. Lighthouse measures a controlled environment; real users may have slower networks, older devices, and different geographic routes to the API.

Also record API request start/end times in the browser. This helps establish whether the page takes a long time because it performs many sequential requests or because one request is slow.

### **2.3 Inspect PostgreSQL**

Enable `pg_stat_statements` if your database supports it. It gives you query-level aggregate execution statistics.

Investigate:

- Total time spent per normalized query.
- Mean and maximum execution time.
- Calls per query.
- Rows returned compared with rows scanned.
- Buffer hits versus disk reads.
- Active and waiting database connections.
- Lock waits and transaction duration.

For the expensive leaderboard and admin report queries, examine:

```
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT ...;
```

Run expensive `EXPLAIN ANALYZE` investigations against representative staging data or a suitable production replica. It actually executes the query, so do not run an arbitrary heavy query against your production database without considering its load.

**The critical distinction:** a query taking 30 ms while waiting 500 ms for a connection is not a query optimization problem. It is a connection-pool or database-capacity problem.

## **3. Backend optimizations**

### **3.1 P0 — Rewrite the leaderboard aggregation**



Highest priority

High potential impact



**Files:**

- `backend/src/routes/leaderboard.ts`
- `frontend/src/pages/Leaderboard.tsx`

#### **Current implementation**

The leaderboard calculates student scores using:

1. `TaskProgress.groupBy()` for awarded task points.
2. `McqQuestionProgress.groupBy()` for awarded MCQ points.
3. A merge of the two datasets in Node.js.
4. A student lookup for branch information.
5. In-memory filtering.
6. In-memory sorting and ranking.
7. Pagination after the full ranking has already been constructed.
8. Another student lookup for the displayed page.

The branch leaderboard performs another full aggregation of the progress data.

This has an important consequence: **requesting page 1 does not mean the database calculates only page 1.** Most of the expensive work is performed before pagination.

As the number of students and progress records grows, this endpoint can become increasingly expensive.

#### **Recommended architecture: aggregate and paginate in PostgreSQL**

Move the aggregation, sorting, ranking, and pagination into SQL.

The score calculation can begin with a CTE similar to this:

```
WITH score_events AS (
    SELECT
        "studentId",
        "pointsAwarded" AS points,
        "completedAt" AS scored_at
    FROM "TaskProgress"
    WHERE "pointsAwarded" > 0

    UNION ALL

    SELECT
        "studentId",
        "pointsAwarded" AS points,
        "correctAt" AS scored_at
    FROM "McqQuestionProgress"
    WHERE "pointsAwarded" > 0
),

student_totals AS (
    SELECT
        "studentId",
        SUM(points) AS total_points,
        MAX(scored_at) AS last_scored_at
    FROM score_events
    GROUP BY "studentId"
)

SELECT *
FROM student_totals;
```

This is an architectural example of the aggregation stage, not a complete replacement query.

The final query should join the aggregate to `Student` and `MemberRoster`, apply the selected filters, calculate ranks and return only the requested page.

Use a deterministic ordering equivalent to the existing implementation:

```
ORDER BY
    total_points DESC,
    last_scored_at ASC NULLS LAST,
    student_id ASC
```

The exact ordering is important. The current code uses points, scoring time, and student ID as ordering criteria. Reproducing those rules avoids changing the ranking users see.

#### **Preserve these existing business rules**

A SQL rewrite must preserve all of the following:

| Existing behavior      | Required behavior after optimization                                                  |
| ---------------------- | ------------------------------------------------------------------------------------- |
| Task points            | Continue using awarded task points                                                    |
| MCQ points             | Continue using awarded MCQ points                                                     |
| Latest scoring time    | Use the latest timestamp across the two progress sources                              |
| Branch selection       | Prefer the roster branch, then the student branch                                     |
| Branch comparison      | Preserve trimming and case normalization                                              |
| Normal overall ranking | Include students with positive scores                                                 |
| Friends ranking        | Preserve the viewer and followed students, including the existing zero-point behavior |
| Tie-breaking           | Preserve points, scoring timestamp and student ID order                               |
| Pagination             | Return exactly the expected page and total count                                      |

The friends mode deserves particular attention: the existing code deliberately handles friends differently from a normal overall ranking. Do not accidentally filter out friends with zero points when moving the operation into SQL.

#### **Further improvement: maintain a score projection**

A more scalable design is to maintain a separate aggregate table:

```
StudentScore
------------
studentId
totalPoints
lastScoredAt
updatedAt
```

Whenever a student receives task or MCQ points, update their aggregate in the same transaction as the existing source-of-truth write.

Conceptually:

```
INSERT INTO "StudentScore" (
    "studentId",
    "totalPoints",
    "lastScoredAt",
    "updatedAt"
)
VALUES (...)
ON CONFLICT ("studentId")
DO UPDATE SET
    "totalPoints" = "StudentScore"."totalPoints" + EXCLUDED."totalPoints",
    "lastScoredAt" = GREATEST(
        "StudentScore"."lastScoredAt",
        EXCLUDED."lastScoredAt"
    ),
    "updatedAt" = NOW();
```

This is illustrative SQL. The actual implementation must also handle nullable timestamps, point corrections, administrative overrides, and any operation that reverses or changes previously awarded points.

**Why this helps:** the leaderboard no longer needs to aggregate every historical task and MCQ progress record for every request.

However, introduce the projection carefully:

1. Backfill it from the existing progress tables.
2. Make updates atomic with the existing point-awarding transaction.
3. Add reconciliation logic to compare the projection with the source data.
4. Run the old and new leaderboard implementations in parallel in staging.
5. Compare their output before switching the production endpoint.

A materialized view is another possible solution, but PostgreSQL materialized views are not automatically updated when the underlying records change. A transactionally maintained projection table is more appropriate when points must remain reasonably fresh.

#### **Cache only after fixing the query**

A Redis cache can further reduce repeated leaderboard work.

Possible cache keys:

```
leaderboard:overall:page:1
leaderboard:branch:computer:page:1
leaderboard:friends:<student-id>:page:1
```

Use a short TTL, for example 5–15 seconds, as an initial experiment. This is a tuning suggestion, not a guaranteed optimal value.

Invalidate or update relevant cached values when:

- A student receives points.
- Points are corrected or reversed.
- A follow relationship changes.
- A student's effective branch changes.
- Roster data changes.

Do not use a shared cache key for personalized friends results without including the viewer identity and relevant filters.

**Recommendation:** move aggregation into SQL first. Then consider a projection table if the leaderboard remains expensive. Caching should be an additional optimization, not a substitute for fixing the current full-table aggregation.

### **3.2 P0 — Eliminate the serial N+1 prerequisite checks**



Highest priority

High potential impact



**File:** `backend/src/routes/learn.ts`

The day-detail endpoint already loads:

- The selected day.
- Its ordered tasks.
- MCQ questions belonging to the tasks.
- The current student's task progress.
- The current student's MCQ progress.

Despite having this data, it subsequently iterates through the tasks and calls `areTaskPrerequisitesComplete()` for individual tasks.

The helper then performs more database lookups, including:

- Fetching task details.
- Fetching earlier tasks.
- Checking task progress.
- Checking MCQ completion counts.

This is a serial N+1 pattern.

For a day with many tasks, the route can execute repeated queries that could have been answered from the information already fetched.

#### **Recommended replacement: in-memory prerequisite evaluation**

Build lookup maps once:

```
const taskProgressByTaskId = new Map(
  taskProgress.map((progress) => [
    progress.taskId,
    progress,
  ])
);
```

Build an equivalent lookup for MCQ progress, indexed by question ID or task ID.

Next, iterate through the already ordered tasks and calculate whether each task is complete using the exact existing rules:

- Reading task completion should use the existing completion criterion.
- Coding task completion should use the existing completion criterion.
- MCQ completion should use the same correct-answer requirement as the current `isTaskComplete()` implementation.
- An MCQ task with no questions must retain the current behavior.

Then maintain a cumulative prerequisite state:

```
let allPreviousTasksComplete = true;

for (const task of orderedTasks) {
  const isCompleted = completedByTaskId.get(task.id) ?? false;

  // Preserve the endpoint's current closed/completed-task
  // prerequisite bypass behavior.

  const prerequisitesComplete = allPreviousTasksComplete;

  // Calculate the task's existing lock state here.

  allPreviousTasksComplete =
    allPreviousTasksComplete && isCompleted;
}
```

This is a structural illustration. The final code must retain the actual route's conditions for closed days, already completed tasks, and locked tasks.

#### **Expected architectural improvement**

| Current approach                                   | Recommended approach                   |
| -------------------------------------------------- | -------------------------------------- |
| Query prerequisite status separately for each task | Build progress maps once               |
| Re-fetch task metadata                             | Reuse loaded day tasks                 |
| Query progress for each earlier task               | Check in-memory completion state       |
| Serial asynchronous loop                           | Synchronous ordered evaluation         |
| Repeated database round trips                      | Constant number of queries for the day |

The important benefit is not simply reducing SQL execution time. It is eliminating the network round-trip delay between the backend and PostgreSQL.

This change should not alter the unlock logic at all. It should change only how the already available data is evaluated.

**Regression tests to add:** test reading, coding, and MCQ tasks; incomplete prerequisites; fully completed prerequisites; completed tasks with earlier incomplete tasks; closed days; and MCQ tasks with multiple questions.

### **3.3 P0 — Stop blocking public pages on authentication**



High priority

Low functional risk when implemented carefully



**Files:**

- `frontend/src/App.tsx`
- `frontend/src/pages/auth/SessionContext.tsx`

The application currently initializes the session in a loading state.

The session provider invokes `refresh()` and contacts either:

- `/api/student-auth/me`
- The admin equivalent.

During the loading state, `AppRoutes` returns `null`.

Consequently, public routes such as the landing page and crew page can remain blank while the backend authentication request is running.

That is an avoidable dependency.

#### **Recommended approach**

Separate public-page rendering from protected-route authorization.

Use these states:

```
type SessionStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";
```

For public routes:

```
Render the public page
        |
        v
Check session in background
        |
        v
Update session state
        |
        v
Redirect only when required
```

For protected routes:

```
Enter protected route
        |
        v
Session loading?
   /          \
 Yes          No
  |            |
Show loader    Authenticated?
               /          \
             Yes           No
              |             |
          Render page    Redirect
```

This can make public pages appear immediately even when the backend is slow.

#### **Additional improvement**

The session provider currently reruns the refresh when the route switches between session categories, such as student and admin routes.

Avoid unnecessary revalidation on ordinary page navigation. Revalidate when:

- The user logs in or logs out.
- The user changes authentication context.
- An explicit refresh is requested.
- A protected route requires a fresh server-side session check.
- A defined session-expiry event occurs.

Do not trust the frontend session state as an authorization mechanism. The server must continue to verify authentication and authorization for protected APIs.

**Important:** preserve the existing HTTP-only cookie, CSRF and authentication behavior. The optimization is to improve rendering and avoid unnecessary requests, not to weaken session security.

### **3.4 P1 — Avoid duplicate student lookups in authentication flows**

**Files:**

- `backend/src/middleware/studentAuth.ts`
- `backend/src/routes/studentAuth.ts`
- `backend/src/routes/profile.ts`

The student authentication middleware verifies the token and queries PostgreSQL to confirm that the student exists.

That is useful because it allows the backend to reject requests for deleted accounts.

However, some handlers then issue another student query immediately afterwards.

One explicit example is the student `/me` flow:

```
GET /student-auth/me
        |
        v
studentAuthMiddleware
        |
        v
Student lookup
        |
        v
/me route handler
        |
        v
Another Student lookup
        |
        v
Return profile
```

#### **Recommendation: reuse the authenticated student context**

Expand the middleware's authenticated context so it can provide the fields needed by the `/me` route.

For example:

```
interface AuthenticatedStudent {
  id: string;
  name: string | null;
  prn: string | null;
  email: string | null;
  branch: string | null;
}
```

The middleware can select only the fields required by the relevant downstream handler.

The `/me` route can then return those fields without re-fetching the same row.

Do not place large relational objects into the request context. Keep the selected fields small and specific.

#### **Reduce authentication database round trips more broadly**

The same principle can be applied to endpoints that call `assertVerifiedHandle()` or fetch student profile information after authentication.

Reuse information already present in the authenticated request context when it is guaranteed to be current enough for that operation.

#### **Optional: short-lived authentication cache**

For high request volumes, a shared cache can reduce repeated database reads for account existence or session-version checks.

A possible approach:

```
Redis key: auth:student:<student-id>
TTL: short
Value: active status + auth version
```

When a student is deleted or their access is revoked, invalidate the key.

There is a trade-off: cached authorization information may remain valid briefly after a revocation event. Choose the TTL based on your security requirements, and use a shared cache rather than process-local memory when the backend has multiple replicas.

**Do not simply remove the student lookup from authentication middleware.** The existing database lookup protects against deleted or invalidated users.

### **3.5 P1 — Reduce PostgreSQL work performed by rate limiters**

**Files:**

- `backend/src/middleware/rateLimiters.ts`
- `backend/src/middleware/postgresRateLimitStore.ts`

The learning mutation routes apply both student-level and IP-level rate limiters.

Each limiter uses the PostgreSQL-backed store, which increments its counter through a database write.

That means a learning action can involve:

1. Authentication database lookup.
2. Student-level rate-limit increment.
3. IP-level rate-limit increment.
4. Actual business query.
5. Transactional mutation.
6. Any additional reads or writes.

The limiters are valuable and should not be casually removed, but their storage mechanism may be adding measurable overhead.

#### **Option A — Move shared rate-limit storage to Redis**

Redis supports atomic counter operations and expiration.

A common pattern is:

```
INCR rate_limit_key
EXPIRE rate_limit_key window_seconds
```

Use a Lua script or an appropriately atomic Redis operation to ensure counter initialization and expiration cannot race.

Keep both dimensions:

```
rate-limit:student:<student-id>
rate-limit:ip:<ip-address>
```

This preserves the existing abuse protection while avoiding a PostgreSQL write for each limit check.

#### **Option B — Combine both checks into one operation**

If staying with PostgreSQL, design a custom store that checks and updates both dimensions within one database round trip.

This requires careful handling of independent thresholds and reset windows. Do not make the two limits share a counter or reset time unless that is already the intended behavior.

#### **Option C — Retain PostgreSQL but inspect cleanup overhead**

The custom store also schedules cleanup of expired rate-limit records.

The cleanup process should run at a controlled frequency and should not create redundant timers or repeated large deletes when multiple store instances are initialized.

The existing `resetAt` index is useful. Monitor table growth and cleanup duration.

**My preference:** use Redis if your deployment already operates a Redis instance. Otherwise, benchmark a combined PostgreSQL operation before introducing new infrastructure.

### **3.6 P1 — Reduce latency in coding verification**

**Files:**

- `backend/src/routes/codingTasks.ts`
- `backend/src/lib/sharedVerificationState.ts`
- `backend/src/services/verification/leetcodeClient.ts`
- `backend/src/services/verification/codeforcesClient.ts`

Coding verification is a different latency category from normal CRUD operations because it depends on external providers.

The current request performs several operations before provider verification begins:

- Authentication.
- Student and IP rate-limit increments.
- Shared error-retry-state lookup.
- Shared cooldown lookup.
- Shared lease acquisition.
- Task retrieval.
- Prerequisite checks.
- Task progress lookup.
- Verified-handle checks.
- External provider requests.

Some of these are necessary. Others can be made cheaper.

#### **Improvement A — Run independent cooldown lookups concurrently**

The route checks shared retry and cooldown state sequentially.

Where the checks are independent, use:

```
const [retryState, cooldownState] = await Promise.all([
  getSharedErrorRetryState(...),
  getSharedCooldownState(...),
]);
```

This changes the total waiting time from approximately the sum of the two lookups to the maximum of the two lookup times, assuming both can execute independently.

An even better option is one database query that retrieves both state keys.

#### **Improvement B — Eliminate repeated prerequisite queries**

The coding verification endpoint has a similar prerequisite pattern to the learning day-detail endpoint.

The parent task query already loads its day and the associated tasks. Reuse the loaded task order and task IDs, then batch the relevant progress records.

Avoid fetching task metadata and progress separately for every prerequisite.

Be particularly careful to preserve the current rule for MCQ completion and the current behavior for previously completed tasks.

#### **Improvement C — Reuse verified handle details**

The route calls `assertVerifiedHandle()`, which fetches student information.

Where the authentication context already contains the relevant verified handle and verification state, reuse it if the data freshness and security semantics are identical.

Do not trust an old client-supplied handle or skip the verification-state check.

#### **Improvement D — Keep external provider throttling**

The Codeforces client uses a shared provider request schedule and a queue. The code includes a global scheduling constraint of approximately one request every two seconds.

Do not remove this constraint simply to reduce application latency.

The throttle protects the application from sending requests too quickly to an upstream service. Removing it can cause provider throttling, transient errors, and ultimately *higher* user-visible latency.

Likewise, do not remove pagination logic that ensures submissions within the relevant release window are examined.

#### **Improvement E — Fix the timeout boundary around response-body parsing**

The provider clients create an abort timeout around `fetch()`, but the timeout is cleared after receiving the response object and before fully parsing the response body.

A response can arrive with headers but then stall while its body is being transferred.

Keep the abort deadline active through body consumption and JSON parsing:

```
const controller = new AbortController();

const timer = setTimeout(() => {
  controller.abort();
}, timeoutMs);

try {
  const response = await fetch(url, {
    signal: controller.signal,
  });

  const bodyText = await response.text();

  if (!response.ok) {
    throw new Error(`Provider returned ${response.status}`);
  }

  return JSON.parse(bodyText);
} finally {
  clearTimeout(timer);
}
```

This is a simplified pattern; retain the clients' existing response validation, error classification and retry semantics.

#### **Improvement F — Coalesce duplicate verification requests**

Two requests for the same student, handle and problem may arrive near each other.

Consider an in-flight request registry or distributed deduplication mechanism:

```
verification:<platform>:<handle>:<problem-ref>
```

The second request may reuse the first request's result while the first is still executing, subject to the existing authentication and authorization checks.

Do not permanently cache `NOT_SOLVED` results. A student's submission history can change.

#### **Improvement G — Consider asynchronous verification as a later architectural change**

When provider calls remain slow even after internal optimizations, a background verification job can make the user interface more responsive:

```
POST /coding-tasks/:id/done
           |
           v
Create verification job
           |
           v
Return job ID
           |
           v
Worker checks provider
           |
           v
Persist result
           |
           v
Frontend polls or receives result
```

This changes the API and user interaction model, so it is not my first recommendation. First optimize the existing synchronous path without changing its contract.

### **3.7 P1 — Rewrite admin reports to aggregate in the database**

Potentially very expensive for larger cohorts

**File:** `backend/src/routes/adminReports.ts`

This is another major scalability issue.

#### **Problem A — Module overview**

The module overview route loads module structures and then retrieves large progress and reward datasets for aggregation.

It performs substantial calculation in Node.js.

As the number of students and tasks increases, this causes:

- Larger database responses.
- More memory consumption.
- More JavaScript iteration.
- More garbage collection.
- Greater request duration.
- Potential event-loop blocking.

#### **Problem B — Individual module report**

The `/modules/:moduleId` route calls:

```
computeModuleStudentStats(moduleId, now);
```

The helper's default `studentPage` is empty, so this report loads all students unless an explicit filter or pagination limit is provided.

It subsequently retrieves task progress, reward ledger entries and MCQ progress for the module.

Then the route separately calculates day-by-day metrics.

#### **Problem C — Repeated per-day queries**

For each day, the handler performs queries for:

- Task progress.
- Reward ledger entries.
- MCQ questions.
- MCQ question progress.

Those day queries are executed concurrently with `Promise.all`, but the number of queries still grows with the number of days.

This is a query fan-out pattern.

#### **Recommended replacement**

Use one of two approaches.

**Approach 1: Aggregate all module metrics in SQL**

Run aggregate queries grouped by student, day, task type or other report dimensions.

Examples:

```
SELECT
    p."studentId",
    COUNT(*) FILTER (
        WHERE p."completedAt" IS NOT NULL
    ) AS completed_count
FROM "TaskProgress" p
JOIN "Task" t ON t.id = p."taskId"
JOIN "Day" d ON d.id = t."dayId"
WHERE d."moduleId" = $1
GROUP BY p."studentId";
```

This is only an example of a metric query. The actual implementation must reproduce the existing definitions of completion, rewarded status, CCA and MCQ awards.

**Approach 2: Precompute admin report summaries**

Maintain a reporting projection with summaries such as:

```
ModuleReportSummary
-------------------
moduleId
totalStudents
completedStudents
inProgressStudents
totalAwardedPoints
totalAwardedCca
updatedAt
```

And a day summary:

```
DayReportSummary
----------------
dayId
studentsStarted
studentsCompleted
awardedPoints
awardedCca
updatedAt
```

Update the summaries transactionally where practical, or recompute them through a controlled background process.

The trade-off is freshness. If you choose scheduled recomputation, document the maximum acceptable reporting delay.

#### **Keep the existing CSV export pattern**

The student export path already streams data in batches of 200 and respects response backpressure. This is a good existing implementation.

Do not replace it with one enormous `findMany()` call.

For very large tables, consider keyset pagination instead of large `skip` offsets. Keyset pagination is generally more stable when the dataset changes during an export and avoids scanning increasingly large offsets.

### **3.8 P2 — Optimize profile and streak calculations**

**Files:**

- `backend/src/routes/profile.ts`
- `backend/src/services/streakService.ts`

There is one good implementation worth preserving.

For the default `ANY_TASK` streak rule, `streakService.ts` uses SQL to retrieve distinct active dates from task and MCQ progress. This reduces the amount of data transferred to Node.js.

Do not replace this with fetching every progress record and computing all distinct dates in application memory.

There are two areas worth improving.

#### **Improvement A — Remove redundant student existence lookup when already authenticated**

`getStreak()` first queries the student table to ensure that the student exists.

The profile route has already passed through authentication middleware, which performs a student lookup.

Consider adding a helper for an already authenticated student:

```
getStreakForExistingStudent(studentId, now)
```

Keep the current existence-checking helper for callers that do not have a prevalidated student context.

This preserves the public behavior while avoiding one redundant database round trip in the profile request.

#### **Improvement B — Optimize&#x20;**`ALL_TASKS`**&#x20;streak queries**

When the `ALL_TASKS` rule is enabled, the service loads published days and their tasks and nested progress.

A database-side aggregation can calculate task completion counts by day and determine the final completion time.

Only implement this after confirming that the SQL preserves the existing rule:

- A day counts only if all its tasks are complete.
- The active day is determined from the latest completion timestamp.
- Dates are interpreted in the intended IST calendar-day convention.

### **3.9 P2 — Fix social search and follow-list query patterns**

**Files:**

- `backend/src/routes/social.ts`
- `backend/prisma/schema.prisma`

The current `Follow` model has:

```
@@unique([followerId, followedId])
```

This is useful for finding follows by `followerId`, but it does not efficiently support every query pattern.

For example, the followers page filters by `followedId`, and follow lists are sorted by creation time.

#### **Add the missing compound indexes**

Possible additions:

```
model Follow {
  // Existing fields and relations...

  @@unique([followerId, followedId])

  @@index([followerId, createdAt(sort: Desc)])
  @@index([followedId, createdAt(sort: Desc)])
}
```

Depending on the actual query and execution plan, adding the other user ID as an included or trailing index field may further improve coverage.

Do not add multiple nearly identical indexes without checking the query plan and write overhead.

#### **Accelerate substring name search**

The social search uses case-insensitive substring matching.

A normal B-tree index generally does not help much with a condition equivalent to:

```
WHERE "name" ILIKE '%search-term%'
```

For PostgreSQL, a trigram GIN index is a suitable option:

```
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY student_name_trgm_idx
ON "Student"
USING GIN ("name" gin_trgm_ops);
```

This is an example migration operation, not something to execute blindly.

Use a controlled index-creation process on production because index creation can consume substantial resources. `CREATE INDEX CONCURRENTLY` also has special transaction restrictions; verify how the migration is executed.

An alternative is to switch to prefix matching:

```
WHERE "name" ILIKE 'search-term%'
```

Prefix matching is cheaper to index with an appropriate normalized index, but it changes search behavior. Use it only if losing arbitrary substring matching is acceptable.

#### **Frontend improvements for social search**

- Debounce the search input, initially around 250–350 ms.
- Cancel obsolete requests with `AbortController`.
- Do not issue a request for every keystroke.
- Require a sensible minimum query length.
- Cache recent search results for a short period.
- Preserve the current follower/following state when refreshing results.

## **4. Database indexing and query design**

Your Prisma schema already includes several useful indexes:

- Unique student/task progress pair.
- Unique student/question progress pair.
- Task ID indexes on task progress and reward ledger.
- Question ID index on MCQ progress.
- Rate-limit reset timestamp index.
- Shared verification expiry index.
- Day status/release index.

This is important: **do not blindly add indexes to every frequently queried field.** Each index increases storage and adds work to database writes.

The following are the most relevant additions to investigate.

### **4.1 Index recommendations**

| Table                 | Candidate index                                   | Why                                         |
| --------------------- | ------------------------------------------------- | ------------------------------------------- |
| `Follow`              | `(followerId, createdAt DESC)`                    | Following list ordered by creation date     |
| `Follow`              | `(followedId, createdAt DESC)`                    | Followers list ordered by creation date     |
| `Student`             | Trigram GIN on `name`                             | Case-insensitive substring search           |
| `TaskProgress`        | Partial covering index for positive point records | Potentially helps leaderboard aggregate     |
| `McqQuestionProgress` | Partial covering index for positive point records | Potentially helps leaderboard aggregate     |
| `TaskProgress`        | Existing `(taskId)`                               | Already supports task-based progress access |
| `RewardLedger`        | Existing `(taskId)`                               | Already supports task-based reward access   |

For the leaderboard, candidate partial indexes could look like:

```
CREATE INDEX CONCURRENTLY task_progress_awarded_idx
ON "TaskProgress" ("studentId")
INCLUDE ("pointsAwarded", "completedAt")
WHERE "pointsAwarded" > 0;
```

```
CREATE INDEX CONCURRENTLY mcq_progress_awarded_idx
ON "McqQuestionProgress" ("studentId")
INCLUDE ("pointsAwarded", "correctAt")
WHERE "pointsAwarded" > 0;
```

These indexes may help depending on the ratio of positive-point rows to total rows, visibility-map state, and the actual query plan.

They are not guaranteed to make a whole-table aggregate cheap. A query that needs to process nearly every awarded row can still be expensive.

### **4.2 Check duplicate indexes**

The `Module` model contains both:

```
order Int @unique
```

and:

```
@@index([order])
```

The uniqueness constraint normally already creates an index on `order`.

Check the actual PostgreSQL indexes and constraints. If there is a genuinely redundant additional index, removing it can slightly reduce insert/update work and storage.

This is a low-priority cleanup, not a major latency fix.

### **4.3 Keep result sets narrow**

The code generally uses `select` in many of its data retrieval paths, which is good.

Continue to avoid loading:

```
include: {
  // Every relation, every field
}
```

when only a handful of fields are required.

Use narrow selections for:

- Student identity and display data.
- Task prerequisite evaluation.
- Leaderboard output.
- Admin report data.
- MCQ progress.
- Profile statistics.

The rule should be: fetch only what the current operation consumes.

### **4.4 Avoid excessive concurrent database queries**

`Promise.all()` is useful for independent queries, and the project already uses it in several routes.

However, converting every sequential query into an unbounded `Promise.all()` is not a universal optimization.

A request that launches 50 expensive queries at once can increase database connection contention and slow down other requests.

Prefer:

1. One grouped query.
2. One batched query.
3. A bounded number of concurrent queries.
4. Sequential execution only when the next step actually depends on the previous result.

## **5. Frontend performance optimizations**

### **5.1 P1 — Introduce route-based code splitting**

Medium–high impact

**File:** `frontend/src/App.tsx`

The application statically imports many pages and admin modules.

This can put code into the initial JavaScript dependency graph even when a user only opens the landing page.

Candidates for lazy loading include:

- Admin modules.
- Admin students.
- Admin reports.
- Admin roster.
- Profile.
- Social hub.
- Leaderboard.
- Learning module pages.
- Day-detail pages.
- Crew page.

Use `React.lazy()` and `Suspense`:

```
import { lazy, Suspense } from "react";

const LeaderboardPage = lazy(
  () => import("./pages/Leaderboard")
);

const ProfilePage = lazy(
  () => import("./pages/Profile")
);

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      {/* Existing route definitions */}
    </Suspense>
  );
}
```

Retain the existing protected-route behavior and error boundaries.

This does not speed up PostgreSQL or API response time. It reduces the JavaScript that must be downloaded, parsed and executed before a route can become interactive.

### **5.2 Load Excel dependencies only when needed**

The frontend dependency graph contains `xlsx`, and the admin student area imports Excel-related utilities.

Excel import/export functionality is not required for normal student navigation.

Dynamically import the library when the user requests an import or export:

```
async function exportStudents() {
  const XLSX = await import("xlsx");

  // Existing export functionality
}
```

This keeps the dependency out of the initial page load where the bundler can split it into a separate chunk.

Also verify that the package is not imported elsewhere through another static dependency path.

### **5.3 Remove unnecessary initial requests on the leaderboard page**

**File:** `frontend/src/pages/Leaderboard.tsx`

The page loads branch data on mount regardless of whether the user is viewing the branch leaderboard.

It can also load the overall leaderboard separately.

If the first visible tab does not require branch data, defer the branch request until:

- The user opens the branch tab.
- The user opens the branch filter.
- The branch options are genuinely needed.

Cache the branch list after the first fetch.

This is especially valuable because the branch endpoint itself performs an expensive aggregation in its current implementation.

### **5.4 Deduplicate requests and cache reusable data**

The project has a custom API client in:

```
frontend/src/api/client.ts
```

Consider adding a small request cache or adopting a query library such as TanStack Query.

Useful behaviors include:

- Deduplication of identical in-flight requests.
- Reusing recent successful responses.
- Cancelling obsolete searches.
- Refetching after relevant mutations.
- Avoiding repeated fetches when navigating back to a page.
- Separating cached server data from local UI state.

Suggested cache categories:

| Data                       | Suggested treatment                              |
| -------------------------- | ------------------------------------------------ |
| Published module structure | Cache with version or ETag                       |
| Module/day task metadata   | Short cache, invalidate on admin content changes |
| Student profile            | User-scoped cache                                |
| Leaderboard                | Short TTL, update after point changes            |
| Social search              | Short TTL and query-specific cache               |
| Reward eligibility         | Always validate server-side                      |
| Coding verification result | Do not blindly cache negative results            |

For user-specific responses, use appropriate private caching. Never allow a shared CDN cache to serve one student's profile or friends list to another student.

### **5.5 Add loading states without changing business behavior**

A slow API should not necessarily leave the whole application blank.

Use skeleton loaders and local loading states for:

- Leaderboard tables.
- Profile information.
- Learning module lists.
- Admin report tables.
- Social user lists.

Where it is safe, display cached or previously loaded content while refreshing it in the background.

For time-sensitive features, such as rewards, task windows and task unlocks, the backend must remain authoritative. A cached display must not allow a reward to be claimed outside the permitted window.

## **6. Static assets, fonts and browser rendering**

### **6.1 Remove duplicate font loading**

**Files:**

- `frontend/index.html`
- `frontend/src/index.css`

There are font imports in both the HTML and CSS.

The HTML links request Baloo 2 and Manrope, while the CSS import requests Newsreader, Plus Jakarta Sans, Baloo 2 and Manrope.

Consolidate the font-loading strategy.

Recommended approach:

1. Keep one font-loading mechanism.
2. Request only the font families actually used.
3. Request only the weights actually used.
4. Avoid loading multiple unnecessary variants.
5. Add `font-display: swap` where appropriate.
6. Retain preconnects to the required font origins.
7. Consider self-hosting critical fonts if the external request introduces a measurable delay.

The important objective is to avoid duplicate network work and prevent a font request from delaying the initial visual presentation.

### **6.2 Compress large images**

The Crew page includes a particularly large image:

```
frontend/public/shreeya.jpeg — approximately 1.66 MB
```

Some other crew images are also substantial.

Convert large assets into WebP or AVIF where browser support and your build pipeline permit.

Example:

```
<img
  src="/images/shreeya.webp"
  alt="Crew member"
  loading="lazy"
  decoding="async"
  width="..."
  height="..."
/>
```

Use realistic dimensions rather than copying the placeholders literally.

For responsive rendering, use `<picture>` and `srcSet` to provide smaller assets for smaller screens.

Use lazy loading for images below the initial viewport, and avoid lazy-loading the actual LCP image if it is visible immediately.

### **6.3 Set explicit image dimensions**

Set `width` and `height`, or an appropriate `aspect-ratio`.

This reduces layout shifts and helps the browser reserve space before image downloads complete.

### **6.4 Remove unnecessary frontend dependencies**

The frontend declares Axios, while the API client uses the Fetch API.

Verify the entire frontend import graph. If Axios is genuinely unused, remove it.

This is a minor optimization compared with route splitting and lazy-loading `xlsx`, but it helps keep the dependency graph clean.

## **7. Network and deployment optimizations**

The source code cannot establish your actual production hosting provider, API location, PostgreSQL region, instance size, or whether the deployment scales to zero. These should be checked against your actual infrastructure.

### **7.1 Keep the API and database geographically close**

A database query requires a network round trip between the backend process and PostgreSQL.

If the backend is in one region and the database is in another, each sequential Prisma query pays the additional network latency.

This is particularly damaging in routes that perform many small queries.

**Recommendation:** deploy the backend and PostgreSQL in the same region, ideally within the same cloud region and a suitably close network placement.

The frontend can be distributed through a CDN. It does not need to be in the same region as PostgreSQL.

### **7.2 Verify connection pooling**

**Files:**

- `backend/src/lib/prisma.ts`
- `backend/prisma/schema.prisma`
- `backend/.env.example`

The application correctly uses a singleton Prisma client, avoiding the obvious problem of creating a new database client for every request.

Preserve this.

However, the environment examples use direct PostgreSQL URLs, and there is no visible evidence of a managed connection pooler configuration.

Investigate:

- PostgreSQL connection limit.
- Number of backend replicas.
- Prisma connection-pool size per replica.
- Connection acquisition wait time.
- Idle connection count.
- Active versus waiting queries.
- Whether the database provider offers a connection pooler.

A practical connection-budget equation is:

\\[ C\_{\text{total}} = N\_{\text{instances}} \times C\_{\text{per instance}} + C\_{\text{other clients}} \\]

The total should remain comfortably within the database's connection capacity, leaving headroom for migrations, administration and monitoring.

If using a managed pooler:

- Configure the application's runtime URL to use it where appropriate.
- Keep the direct connection URL for migrations and administrative operations.
- Verify Prisma 5.22 compatibility with the specific pooler mode.
- Do not increase connection limits without checking database capacity.

**Increasing the connection pool is not automatically an optimization.** Too many concurrent connections can make PostgreSQL slower.

### **7.3 Avoid scale-to-zero cold starts for the API**

The project documentation expects a long-lived Node process.

If your actual host suspends the backend while idle, the first request after inactivity may pay cold-start and connection-initialization costs.

Where the deployment supports it, investigate:

- Minimum active instance count.
- Startup/readiness behavior.
- Database connection warm-up.
- Instance scaling thresholds.
- CPU and memory allocation.

Do not assume this is happening; verify whether cold starts correlate with slow requests.

### **7.4 Put the static frontend behind a CDN**

Serve Vite's generated static assets from a CDN or equivalent static hosting service.

Recommended cache behavior:

| Resource                   | Suggested cache behavior                       |
| -------------------------- | ---------------------------------------------- |
| Hashed JS/CSS assets       | Long-lived immutable cache                     |
| Images and fonts           | Long-lived cache when versioned                |
| HTML entry point           | Revalidate or use a short cache                |
| Personalized API responses | Private; never publicly cache                  |
| Public curriculum content  | Short cache or ETag, if freshness rules permit |

A typical hashed asset policy is:

```
Cache-Control: public, max-age=31536000, immutable
```

Use it only for fingerprinted assets whose filenames change when their content changes.

### **7.5 Enable API response compression**

`backend/src/index.ts` does not configure application-level compression middleware.

The hosting proxy may already compress responses, so verify the actual response headers before adding another layer.

For JSON responses, gzip or Brotli compression can significantly reduce transfer size.

Pay particular attention to:

- Leaderboard responses.
- Admin reports.
- Module listings.
- Student lists.
- Large profile payloads.

Compression trades CPU for reduced transfer time. Configure a minimum response size and test under realistic traffic.

### **7.6 Reduce cross-origin network overhead where appropriate**

The frontend API client uses credentials.

If your frontend and API are on different origins, review:

- DNS lookup time.
- TLS setup.
- Connection reuse.
- CORS preflight.
- Cookie `SameSite` configuration.
- Secure cookie behavior.
- CSRF validation.

Your backend already sets a CORS preflight cache age of 24 hours, which is useful.

Where practical, serving the API through a same-site domain or reverse proxy can simplify browser networking. Do not remove credential handling or CSRF protections to achieve this.

### **7.7 Preserve HTTP connection reuse**

Check that your hosting proxy does not unnecessarily terminate connections between the frontend/API or API/database.

For external API calls, Node's built-in Fetch implementation uses connection pooling mechanisms. Do not introduce a custom client that opens a new connection for every request without a reason.

## **8. API response and caching design**

There is an opportunity to cache relatively static learning content independently of student-specific progress.

For example, the learning module endpoints return information derived from:

- Module content.
- Day structure.
- Task metadata.
- Student-specific progress.

These two categories have different freshness requirements.

### **Recommended separation**

```
Curriculum configuration
        |
        | Cacheable / versioned
        v
Modules, days, task metadata

Student progress
        |
        | User-specific, freshly validated
        v
Completion, MCQ state, reward state
```

A potential future API shape is:

```
GET /api/learn/curriculum
GET /api/learn/progress
```

This is an optional refactoring, not a mandatory API change.

It allows curriculum metadata to be cached while student-specific information is fetched separately.

If you keep the existing response shape, you can still apply caching internally to the shared module/day metadata.

### **Use ETags where appropriate**

For relatively stable public curriculum content, an ETag can avoid sending an entire response when the content has not changed.

```
ETag: "<version-or-content-hash>"
```

The client then sends:

```
If-None-Match: "<version-or-content-hash>"
```

Return `304 Not Modified` when the relevant content has not changed.

Be careful with the learning schedule. Day release and closing status can change because of time, even when the stored task content is unchanged. Keep the time-dependent authorization and availability checks on the backend.

## **9. Node.js and backend execution**

Not every delay is caused by PostgreSQL.

The code also performs application-side aggregation and sorting, especially in leaderboard and admin report endpoints.

As datasets grow, this can increase event-loop delay and garbage collection.

### **9.1 Monitor the event loop**

Capture:

- Event-loop delay.
- CPU usage.
- Heap usage.
- Garbage collection duration.
- Request throughput.
- Active handles.
- Memory growth over time.

If the event loop is blocked, an otherwise healthy API can become slow even for routes that perform very little database work.

### **9.2 Avoid large in-memory aggregation**

The largest candidates in the repository are:

- Leaderboard aggregation and sorting.
- Admin module report calculations.
- Admin overview calculations.
- Large profile progress processing.

Move these operations into PostgreSQL wherever that preserves the existing calculations.

If some computation is genuinely CPU-intensive, consider a worker thread or background job. Do not add worker threads merely to move normal database work elsewhere.

### **9.3 Reuse expensive initialization**

The Prisma client is already a singleton.

Apply the same principle to other expensive shared resources:

- Firebase Admin initialization.
- Redis clients, if introduced.
- Observability SDK initialization.
- External HTTP connection configuration.

Avoid creating clients repeatedly inside route handlers.

## **10. Additional backend improvements**

These are smaller optimizations, but they are worth considering after the larger problems.

### **10.1 Readiness endpoint**

**File:** `backend/src/index.ts`

The readiness endpoint executes several database probes concurrently and races them against a timeout.

`Promise.race()` does not cancel the underlying database queries when the timeout wins.

If readiness probes are frequent and the database is unhealthy, these unfinished probes can add load.

Consider a single lightweight database readiness query with a database-side statement timeout, while maintaining separate liveness and readiness semantics.

Keep readiness dependent on the services necessary to safely receive traffic.

### **10.2 Avoid unnecessary profile tree loading**

In `profile.ts`, inspect whether the module tree and progress relations are loading information that the response does not use.

Reduce unnecessary relation fields, reuse existing authenticated student data, and aggregate counts in SQL where possible.

### **10.3 Control report concurrency**

Admin report routes can launch multiple queries concurrently.

Limit concurrency for very large reports and prefer aggregate queries.

A report that launches dozens of simultaneous queries can compete with normal student traffic. Consider separate database workload capacity or a reporting replica if admin analytics becomes a major load source.

### **10.4 Add request cancellation where safe**

When the browser navigates away from a page, cancel obsolete requests.

This is especially helpful for:

- Social search.
- Leaderboard filter changes.
- Admin student search.
- Repeated page navigation.

For state-changing requests, do not assume that aborting the browser request means the backend transaction was rolled back. Keep all server-side mutation and idempotency protections.

## **11. Changes I would avoid because they can compromise functionality**

Some apparent performance optimizations would create more serious correctness or security problems.

| Avoid this change                                          | Why                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------ |
| Remove task reward transactions                            | Can introduce duplicate or inconsistent rewards        |
| Remove database uniqueness constraints                     | Can permit duplicate progress or reward records        |
| Skip prerequisite checks                                   | Can unlock tasks incorrectly                           |
| Trust the client for task release or close times           | Can permit actions outside valid windows               |
| Remove live account validity checks without an alternative | Can delay account deletion or revocation               |
| Remove Codeforces throttling                               | Can increase provider errors and rate-limit violations |
| Permanently cache failed coding verification               | A later valid submission may be missed                 |
| Cache personalized API responses publicly                  | Can expose one student's data to another               |
| Return every student and paginate in the browser           | Increases memory and transfer costs                    |
| Increase database connection count without measurement     | Can overload PostgreSQL                                |
| Cache reward eligibility without server validation         | Can permit incorrect reward claims                     |
| Run huge admin report queries synchronously without limits | Can degrade normal student requests                    |

Your reward, progress, authentication and verification flows already contain important correctness protections. The goal should be to remove redundant work around those protections, not remove the protections themselves.

## **12. Prioritized implementation roadmap**

I would implement the optimizations in the following sequence.

**Phase 1 — Instrumentation and baseline**

Do first

Add request timing, query metrics, browser Web Vitals, and PostgreSQL query analysis. Establish p50/p95/p99 for the important endpoints.

No intended business-logic changes.

**Phase 2 — High-impact code fixes**

1. Move leaderboard aggregation and pagination into PostgreSQL.
2. Replace serial day prerequisite queries with in-memory evaluation.
3. Allow public pages to render without waiting for session validation.
4. Defer the leaderboard branch request until needed.

High potential improvement without changing the API contract or learning/reward rules.

**Phase 3 — Database and admin reports**

1. Optimize module overview aggregates.
2. Rewrite per-day admin report queries.
3. Add measured `Follow` indexes.
4. Evaluate leaderboard partial indexes.
5. Add trigram index for social name search if substring search must remain.

Requires query-plan validation and careful production index deployment.

**Phase 4 — Authentication and verification**

1. Reuse authenticated student context.
2. Reduce repeated shared verification lookups.
3. Batch coding prerequisite checks.
4. Fix external response-body timeout coverage.
5. Evaluate Redis for distributed rate limiting.

Preserve revocation, provider throttling, verification and abuse-protection rules.

**Phase 5 — Frontend and deployment**

1. Add route-based code splitting.
2. Lazy-load Excel dependencies.
3. Consolidate font loading.
4. Convert large images to modern formats.
5. Verify CDN caching and response compression.
6. Verify API/database region and connection-pool configuration.

Improves initial loading and reduces unnecessary network and JavaScript work.

**Phase 6 — Scale-dependent architecture**

1. Add a transactionally maintained student score projection if needed.
2. Add short-lived shared caches.
3. Precompute admin report summaries.
4. Consider asynchronous coding verification.
5. Consider a reporting replica if analytics competes with student traffic.

Introduce only after measuring the need and deciding acceptable freshness requirements.

## **13. Regression testing requirements**

Performance work should be measured against the current behavior, not just against how fast the revised endpoint runs.

I would specifically add the following tests before deploying the high-impact changes.

| Area        | Required test                                                              |
| ----------- | -------------------------------------------------------------------------- |
| Leaderboard | New SQL results exactly match old results for representative datasets      |
| Leaderboard | Equal-point students retain the same tie-breaking order                    |
| Leaderboard | Latest scoring time is correct across task and MCQ sources                 |
| Leaderboard | Friends mode preserves zero-point and viewer behavior                      |
| Leaderboard | Branch resolution still prefers roster branch                              |
| Learning    | Tasks unlock only when the existing prerequisite rules allow it            |
| Learning    | MCQ completion logic is identical for all question configurations          |
| Learning    | Closed-day and completed-task behavior is unchanged                        |
| Rewards     | Concurrent claim requests do not produce duplicate rewards                 |
| Rewards     | Retry and transaction handling retain idempotency                          |
| Auth        | Deleted, invalidated or demoted accounts remain unauthorized               |
| Coding      | Codeforces and LeetCode verification retain the existing correctness rules |
| Coding      | Provider timeout, retry and cooldown behavior still works                  |
| Social      | Search and follow results preserve the expected filters and ordering       |
| Admin       | Module/day totals and awarded CCA match the previous implementation        |

### **Safe rollout strategy**

For the most sensitive changes, use a staged rollout:

1. Capture baseline output and latency.
2. Deploy the new query or calculation behind a feature flag.
3. Compare old and new results in staging.
4. Where practical, execute shadow calculations in production without returning the shadow result to the user.
5. Investigate discrepancies.
6. Enable the new path for a small portion of traffic.
7. Monitor p95/p99 latency, database load and error rate.
8. Expand only after results are consistent.
9. Keep a rollback path until the new implementation has been validated.

For schema changes, create indexes with a production-safe deployment process. Verify index validity and query plans after deployment.

## **14. What I would fix first**

My ranking based on the actual code paths is:

| Rank | Change                                                           | Expected benefit                       | Risk       |
| ---- | ---------------------------------------------------------------- | -------------------------------------- | ---------- |
| 1    | SQL-based leaderboard aggregation and pagination                 | Very high for leaderboard scalability  | Medium     |
| 2    | In-memory day prerequisite evaluation                            | High for learning-page latency         | Low–medium |
| 3    | Render public pages during background session validation         | High for perceived initial loading     | Low–medium |
| 4    | SQL aggregation for admin module reports                         | Very high for admin analytics at scale | Medium     |
| 5    | Remove duplicate student lookups                                 | Medium across authenticated requests   | Low        |
| 6    | Reduce rate-limiter database round trips                         | Medium for mutation-heavy usage        | Medium     |
| 7    | Batch coding verification prerequisites and shared-state lookups | Medium–high for coding workflows       | Low–medium |
| 8    | Add missing social indexes                                       | Medium for larger student directories  | Low–medium |
| 9    | Route splitting and lazy-load `xlsx`                             | Medium for initial frontend load       | Low        |
| 10   | CDN, image, font and compression optimizations                   | Medium for browser load                | Low        |

### **Final technical assessment**

The most concerning architectural pattern is **performing broad data aggregation in the API process on every request**, particularly in the leaderboard and admin reporting paths. These endpoints will become increasingly expensive as records accumulate.

The second major issue is **serial database round trips for information that the request has already loaded**, particularly the learning prerequisite path.

The third is **unnecessary coupling between frontend rendering and backend authentication availability**. Public pages should not be hidden behind an authentication round trip.

I would not start by increasing database resources, increasing connection limits or introducing Redis everywhere. First remove the known redundant work and measure the remaining bottlenecks. Otherwise, additional infrastructure may only make an inefficient query slightly less noticeable.

**One final measurement rule:** compare p95 and p99 latency, not only average response time. A project can have a reasonable average while a subset of users experiences very long waits due to database contention, provider throttling or expensive report queries.

The highest-value next step is to obtain production timing data for `/api/leaderboard`, the learning day-detail endpoint, `/api/admin-reports/modules/:moduleId`, and the coding verification endpoint. Those measurements will establish how much of the observed latency is attributable to the code-level problems identified here versus deployment, database capacity and external-provider response time.