# Complete Backend Migration to Supabase

You've provided the SQL schema and the Supabase API keys to migrate our robust platform fully to a serverless architecture! This plan outlines how we will completely rip out the existing Node.js + Express + MongoDB `backend/` and shift all data processing, authentication, and logic to the Next.js frontend using the `@supabase/supabase-js` client.

## User Review Required

> [!WARNING]  
> **Major Architectural Shift**  
> Approving this plan means we will completely abandon the `backend/` directory (Express/MongoDB). The frontend will directly interface with your Supabase Postgres database.

> [!IMPORTANT]  
> **Client-Side AI Computation**  
> We currently process the Cosine Similarity and Greedy Team Clustering via server-side Node.js algorithms. Because we are moving away from traditional custom servers, I will port the math functions (vector mapping, dot products, grouping) directly into the Next.js client (`frontend/lib/matchEngine.js`). When a user asks for matches, the client will fetch the raw profiles from Supabase and perform the complex math natively in the browser. *This works beautifully for hackathon-scale audiences and requires zero setup of Deno Edge Functions.*

## Proposed Changes

---

### Phase 1: Core Setup & Authentication (`frontend/`)

We will introduce the Supabase client and replace traditional JWT logic.

#### [NEW] [supabase.js](file:///c:/Users/jites/OneDrive/Desktop/MatchDev 4/frontend/lib/supabase.js)
Initialize the Supabase client using the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` provided.

#### [MODIFY] [.env.local](file:///c:/Users/jites/OneDrive/Desktop/MatchDev 4/frontend/.env.local)
Store the environment variables securely.

#### [MODIFY] [api.js](file:///c:/Users/jites/OneDrive/Desktop/MatchDev 4/frontend/lib/api.js)
We'll tear down the Axios interceptors and replace `loginUser`, `registerUser`, and `getMe` to utilize `supabase.auth.signInWithPassword()` and `supabase.auth.signUp()`. 

#### [MODIFY] Auth Pages (Login/Register)
Adjust component state to expect Supabase session structures instead of raw token strings.

---

### Phase 2: Core Data Migration (CRUD)

We'll convert the existing MongoDB routes into direct Supabase ORM calls.

#### [MODIFY] [api.js](file:///c:/Users/jites/OneDrive/Desktop/MatchDev 4/frontend/lib/api.js)
- **Profile:** Rewrite `updateProfile` and `getUserById` to utilize `supabase.from('profiles')`.
- **Teams:** Rewrite `getTeams`, `createTeam`, and `sendJoinRequest` to interface with the `teams` and `join_requests` tables, utilizing Postgres relational queries.
- **Swipes:** Refactor the `recordSwipe` system to use SQL array operations (e.g., appending UUIDs to the `swiped_right` array field in `profiles`).

#### [MODIFY] [page.js (Profile)](file:///c:/Users/jites/OneDrive/Desktop/MatchDev 4/frontend/app/profile/page.js)
Refactor the `ProfileImageUpload` UI block to utilize Supabase Storage buckets rather than the `multipart/form-data` Express upload. *(Note: you will need to ensure a public storage bucket named `avatars` exists in your Supabase project).*

---

### Phase 3: Porting the AI Match Engine

We will migrate the AI logic from Node.js to client-side JS utilities.

#### [NEW] [matchEngine.js](file:///c:/Users/jites/OneDrive/Desktop/MatchDev 4/frontend/lib/matchEngine.js)
I will copy `backend/algorithms/cosineSimilarity.js` into this new frontend utility file.

#### [MODIFY] [api.js](file:///c:/Users/jites/OneDrive/Desktop/MatchDev 4/frontend/lib/api.js)
Rewrite the `getMatches`, `getHackathonMatches`, and `getSuggestedTeams` functions. 
Instead of making an HTTP GET request to a backend, these functions will:
1. Fire a `supabase.from('profiles').select('*')` request.
2. Feed the results into `matchEngine.js`.
3. Resolve the finalized, mathematically-sorted payload exactly as the frontend components currently expect it, meaning our 3D UI cards won't even notice the backend disappeared!

---

### Phase 4: Supabase Realtime Channels

#### [MODIFY] [page.js (Teams Chat)](file:///c:/Users/jites/OneDrive/Desktop/MatchDev 4/frontend/app/teams/[id]/page.js)
We will strip out `Socket.io-client` completely. Real-time typing indicators and instant messaging will be hooked into `supabase.channel('messages')` relying on the database trigger/realtime broadcasts set up in your SQL.

## Open Questions

1. **Storage Bucket**: The `profiles` table points to `profile_picture`. I plan to use Supabase Storage. Have you created a public storage bucket named `avatars` in your Supabase project? If not, the image upload will fail, though the rest of the app will work.
2. **Client-side Logic**: Porting the Cosine Similarity math to run entirely in the browser using Supabase queries is the fastest path forward. Are you comfortable with this approach, or did you specifically want me to write and deploy a Supabase Edge Function (Deno) via CLI?

## Verification Plan

### Automated/Manual Testing
1. **Auth Test**: Ensure we can sign up via the frontend and land in the `profiles` table automatically via your `on_auth_user_created` trigger.
2. **Team Building Test**: Create a team on the frontend, ensuring the user UUID is injected into `leader_id`, and that RLS policies allow insertion.
3. **AI Accuracy Test**: Ensure that Hackathon Mode successfully pulls data from Supabase, runs the identical Greedy Clustering loops locally, and paints the DOM accurately.
