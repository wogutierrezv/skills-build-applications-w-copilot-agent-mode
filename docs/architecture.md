# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep route-level views in React and use the shared API client for relative `/api` requests. Each capability view owns its loading, empty, error, and populated states, with accessible status and alert announcements.
- Logic tier decision: Keep HTTP handling and status codes in Express routes, and put validation, persistence workflows, and derived results in `octofitService.ts`. Return deliberate 4xx responses for invalid input or missing resources; do not expose Mongoose cast errors as 500 responses.
- Data tier decision: Use Mongoose models for required fields, references, defaults, and value constraints. Keep seed data representative and idempotent; update only the exercise's fixtures and preserve unrelated records.
- Activity tracking approach: Validate the request shape, ObjectId formats, and existence of the referenced user and team before creating an activity. Store the submitted references, type, and minutes with computed points and an occurrence timestamp.
- Team management approach: Require a team name, preserve the submitted name and mascot, and expose its members on create and list. Default omitted members to an empty array in the model.
- Leaderboard approach: Aggregate activity points by team, sort by total points descending, and assign 1-based ranks in the logic tier.
- Workout suggestions approach: Find the user by email, consider their fitness goal and recent activity when selecting a workout, and include a reason for the top suggestion. Return a deliberate 4xx response when no user matches.

## Test plan

- Data tier: `npm run test:data --prefix octofit-tracker/backend`. Failures indicate model validation/defaults or seed behavior is out of contract; preserve the idempotency and unrelated-record assertions.
- API logic: `npm run test:api --prefix octofit-tracker/backend`. Failures indicate endpoint behavior, validation/status codes, serialization, point totals/ranking, or workout selection/reasons do not match the API contract.
- Presentation: `npm test --prefix octofit-tracker/frontend`. Failures indicate a view does not request or render API data, or is missing an accessible loading, empty, or error state.
- Backend build: `npm run build --prefix octofit-tracker/backend`. Failures indicate TypeScript errors in the backend.
- Frontend build: `npm run build --prefix octofit-tracker/frontend`. Failures indicate frontend TypeScript or Vite build errors.
- Baseline observed before implementation: `npm test --prefix octofit-tracker/backend` had 8 failures and 1 pass; `npm test --prefix octofit-tracker/frontend` had 15 failures. Re-run the targeted suites after each tier, then both builds before considering the work complete.
