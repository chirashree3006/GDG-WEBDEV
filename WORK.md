# Work Log

Everything changed in this pass, grouped by category, with the reasoning behind each change. Written for round-2 review / interview reference.

---

## 1. Security & authorization (the core bug)

### 1.1 Missing auth checks on admin-only API routes
**Files:** `app/api/admin/applicants/route.js`, `app/api/shortlist/[id]/route.js`, `app/api/send-email/route.js`

Before: these three routes did **no session check at all**. Anyone who knew (or guessed) the URL — logged in or not — could:
- `GET /api/admin/applicants` → dump every applicant's full record (name, registration number, phone, email, essay answers)
- `PATCH /api/shortlist/:id` → flip any applicant's shortlist status
- `POST /api/send-email` → send arbitrary HTML emails to any address list, through the app's own Gmail credentials (open relay)

Fix: all three now call `auth.api.getSession()` and require `session.user.role === "admin"`, returning 401/403 otherwise, before touching Firestore or sending anything.

### 1.2 Admin page leaked all applicant data via SSR, even to logged-out visitors
**File:** `app/(pages)/admin/page.jsx`

Before: this is a React Server Component. It fetched **every** applicant from Firestore unconditionally, then passed the full array as a prop to `AdminContent`, which did a **client-side** `role === "admin"` check to decide whether to render the table. That check only hid the UI — the complete dataset had already been embedded in the page's RSC payload and sent to the browser for anyone who loaded `/admin`, authenticated or not. View-source or the network tab would show it.

Fix: the server component now checks the session and role *before* querying Firestore. Unauthorized/unauthenticated requests get an empty `applicants` array — the data is never fetched, let alone sent, unless the server has already verified `role === "admin"`.

### 1.3 Firestore security rules were wide open
**File:** `firestore.rules`

Before: `allow read, write: if true` for every document — anyone with the project's public Firebase config (which is not a secret for Firebase apps) could read or write the `formData`/`users` collections directly from their own client, bypassing every check the API routes enforce (auth, per-department dedup, 2-application cap, submission deadline).

Verified nothing in the codebase uses the client Firestore SDK (`grep` across `app/`, `components/`, `lib/`, `constants/` for `firebase/firestore`/`firebase/app`/`initializeApp` outside the two server-only files came back empty) — all reads/writes go through `firebase-admin` server-side, which authenticates via the service account and isn't subject to these rules anyway.

Fix: rules changed to `allow read, write: if false`. This closes the direct-access hole with zero functional impact.

### 1.4 Race condition in the submission limit/dedup check
**File:** `app/api/submit-form/route.js`

Before: the "already applied to this department" and "max 2 applications" checks were a plain `.get()` query followed later by a plain `.add()` — not atomic. The client's own submit flow (`FormComp.jsx`) fires both chosen departments' submissions **in parallel** via `Promise.allSettled`, so two POSTs for the same user land at the server nearly simultaneously. Both could read "0/2 used" before either write committed, letting a user slip past the cap or double-submit to the same department under a race.

Fix: wrapped the read + write in a Firestore transaction (`db.runTransaction`), so Firestore serializes (and retries) concurrent attempts against the latest committed state instead of a stale read.

### 1.5 Minor correctness bug in shortlist route
**File:** `app/api/shortlist/[id]/route.js`

Before: called `docRef.update()` *before* checking `snapshot.exists`. Firestore's `update()` throws on a missing document, so the intended "Applicant not found" 404 branch was unreachable dead code — a bad ID would instead surface a raw Firestore error via the catch block.

Fix: existence is checked first; update only runs if the doc exists.

### 1.6 send-email crash on unrecognized department
**File:** `app/api/send-email/route.js`

Before: `reviews.find(item => item.name === depart)` could return `undefined` for a recipient whose department doesn't match the known list (reachable via a URL-validation gap noted in 4.2), and the next line (`dept.name`) would throw, aborting the **entire** loop — so one bad record silently killed the whole bulk-email send.

Fix: skip and log that one recipient, continue sending to the rest.

---

## 1a. Sign-in bypassed the entire identity check

**Files:** `app/auth/signin/page.jsx`, `lib/auth.js`

This is arguably the most significant functional bug found. Everything about this app assumes applicants are verified via Google OAuth on their VIT email (`.env.example` literally labels the Google credentials section "VIT Email Auth", the README describes it that way, and a correctly-built, Google-only `SignInButton.jsx` component already existed in the codebase) — but the actual `/auth/signin` page never used it. Instead it shipped a fully open **email + password sign-up form**: `authClient.signUp.email({ email, password, name })`, with no domain restriction, no verification, nothing. `emailAndPassword: { enabled: true }` was set server-side in `lib/auth.js` to make this work.

Net effect: anyone, VIT student or not, could create an account with any email address and password and go submit applications, completely bypassing the identity check the rest of the system is designed around. The shadcn `Card`/`Button`/`Input`/`Label` components and custom fonts were even imported into that page and left unused — the page reads like a Google-OAuth screen that had its actual sign-in logic swapped out for a generic email/password form at some point.

Fix:
- `lib/auth.js`: `emailAndPassword.enabled` set to `false`. Self-registration with an arbitrary email is no longer possible even by calling the auth API directly.
- `app/auth/signin/page.jsx`: rewritten as a Google-only sign-in screen (`authClient.signIn.social({ provider: "google" })`), using the shadcn `Card`/`Button` components that were already imported but unused, matching the site's dark theme.
- `components/SignInButton.jsx` (the already-correct, but likewise unwired, Google sign-in button) confirms this was the intended pattern all along — it just was never used anywhere either.

---

## 2. Dependency / build health

### 2.1 `npm install` failed outright for a fresh clone
**File:** `package.json`

`typescript: "^7.0.2"` (root devDependency) conflicted with `better-auth-firestore@1.2.8`'s peer requirement of `typescript@^5.0.0`, producing an unresolvable `ERESOLVE` error. Verified by running the install; fixed by pinning `typescript` to `^5.6.3`. Re-verified with a clean dependency resolution (1,215 packages, zero conflicts).

### 2.2 Next.js pinned to a version with a disclosed vulnerability
**File:** `package.json`

`next@14.2.5` — npm's own install output flags this exact version as having a known security advisory. Bumped to `14.2.35` (latest patch release in the same `14.2.x` line — no breaking changes) and matched `eslint-config-next` to the same version.

### 2.3 Stale lockfile removed
**File:** `bun.lock` (deleted)

Still pinned the old, conflicting `typescript` version. Since it couldn't be regenerated in this environment (bun's installer is blocked by network egress rules here), it was removed rather than left inconsistent with `package.json` — a stale lockfile that doesn't match `package.json` is worse than no lockfile, since `bun install` would otherwise silently reinstall the broken version. Run `npm install` or `bun install` locally to regenerate a correct lockfile.

---

## 3. Dead code removed

- `lib/actions/form.action.js`, `lib/actions/data.action.js`, `lib/actions/user.action.js`, `lib/modals/user.modal.js`, `lib/modals/form.modal.ts` — old Mongoose-style model/action scaffolding, confirmed unused via `grep` (nothing under `app/`/`components/` imports them; the real data access is the `firebase-admin` calls directly in the API routes).
- `coverage/` directory — stray test-coverage output sitting in the working tree (already `.gitignore`d, just clutter).

---

## 4. Client-side performance: removed a pattern of no-op "telemetry" computation

A large number of components contained the same pattern: a tight loop doing tens to hundreds of thousands of iterations of `Math.sin`/`cos`/`sqrt`/modulo arithmetic per render, whose result fed a `data-*` attribute nothing reads or a piece of state nothing renders — plus, often, live event listeners (`mousemove`, `scroll`, `resize`) wired up only to feed that same dead computation. None of it affected behavior or appearance; all of it burned CPU on every render, in some cases on every keystroke or every pixel of scroll.

Removed / simplified in:
- **`components/FormComp.jsx`** — a 200,000-iteration regex-test loop ran on **every render**, including every keystroke (the form uses `useWatch`, which re-renders on each field change). Also removed a scroll listener whose state was never read, and a redundant `/api/check-applications` fetch that duplicated what `SubmissionsProvider` already fetches and shares via context.
- **`components/AdminContent.jsx`** — an 80,000-iteration loop plus several layers of "audit sequence"/"security token" state that did nothing beyond gating the same `role === "admin"` check a single `if` already made.
- **`components/DataTable.jsx`** (admin table) — a `tableData.length × 500` nested loop; four chained `useEffect`s computing counts/telemetry that were **never rendered anywhere** in the returned JSX.
- **`app/(pages)/departments/page.jsx`** — a 100,000-iteration loop, plus a pointless `JSON.parse(JSON.stringify(...))` clone of a static constant stored in state via its own effect.
- **`app/page.jsx`** (homepage) — a 300,000-iteration loop, live `mousemove`/`scroll`/`resize` listeners tracking cursor position and viewport size that were never used for layout, and a dead `localStorage.getItem("portal_settings")` read.
- **`components/Card.jsx`** — a 50,000-iteration loop on every hover, plus hover/contrast/elevation state that only fed unused `data-*` attributes (the actual hover visual effect is pure CSS via Tailwind's `group-hover:`, unaffected by removing this).
- **`components/Footer.jsx`** (rendered on every page) — a 40,000-iteration loop and five effects to compute a static copyright line.
- **`components/AllDepartments.jsx`** — a 35,000-iteration loop plus resize-driven state that was never read.
- **`components/Departments.jsx`** — a six-step `useEffect` pipeline to compute two arrays that only need to be computed once, plus a hand-written bubble sort whose result was discarded (never assigned anywhere).

### 4.1 `Math.random()` used as React `key`
**Files:** `components/DataTable.jsx`, `app/(pages)/departments/page.jsx`, `components/BlurFadeGrid.jsx`, `components/Departments.jsx`

A new random key on every render defeats React's reconciliation — every row/cell/list item is fully unmounted and remounted on *every* render, not just when the underlying data changes. On the admin table specifically (potentially hundreds of applicant rows × 9 columns) this meant a full DOM teardown/rebuild on every keystroke in the search box, every sort click, every filter change. Replaced with stable keys (`row.id`, `header.id`, `department.id`, etc.).

### 4.2 Broken links (missing `/join/` prefix)
**Files:** `app/(pages)/development/page.jsx`, `components/BlurFadeGrid.jsx`, `components/Departments.jsx`

Several places linked to `/${review.id}` (a bare UUID at the site root) instead of `/join/${review.id}` (the actual application route). Every such link 404'd. In `development/page.jsx` the two IDs also didn't match any department in `constants/index.js` at all, so even with the prefix fixed those two specific links have no valid target — flagged rather than guessed at, since I can't tell from the code alone which two of the twelve departments they were meant to point to.

### 4.3 Dead feature reconnected: bulk email composer was unreachable
**File:** `components/DataTable.jsx`

`MailComposer` — a fully built rich-text editor (Tiptap) for composing bulk emails to selected applicants — was imported into `DataTable.jsx` along with a `handleRowSelection` handler to wire it up, but neither was ever rendered. The "Send Custom Mail" trigger button never appeared anywhere in the UI, so the whole feature was unreachable. Rendered `<MailComposer recipients={selectedFlatRows.length} handleRowSelection={handleRowSelection} />` in the table toolbar next to "View Responses".

### 4.4 `NavBar.jsx` re-rendering the entire site 5×/second
A `setInterval` updated a live clock display every 200ms, forcing a re-render of the navbar (present on every page) five times a second for a value with no functional purpose in a recruitment portal. Removed.

### 4.5 Correctness bug: shortlist status appeared to revert under a filter
**File:** `components/DataTable.jsx`

The department/shortlist filters (`filterFunc`/`shortlistedFilterFunc`) re-derived their results from the original `data` **prop** (the initial server fetch), not from the live `tableData` state that `handleShortlist` updates after a successful PATCH. So: shortlist an applicant → apply any filter → the applicant's status visually reverts to its pre-shortlist value, even though the database was updated correctly. Refactored to a single `masterData` state (updated in place by `handleShortlist`) with filters computed via `useMemo` over it, so any filter combination always reflects the latest known state.

---

## 5. Housekeeping / repo readiness

- Added `README.md` — setup instructions, env var reference, feature list, tech stack, project structure, customization notes.
- Added `LICENSE` (MIT).
- Removed a stray `console.log("Connected to Firestore")` and other leftover debug logs picked up during the API-route cleanup above (kept `console.error` calls — those are legitimate error logging).
- Removed 5 unused `lucide-react` icon imports left over in `components/FormComp.jsx` from earlier edits.
- This file (`WORK.md`).

---

## Known content placeholders — intentionally left alone

`constants/index.js`'s department `name`/`description` fields, and "Organization Name" placeholders in `app/layout.js`, `components/Footer.jsx`, and `components/FormComp.jsx`, are template placeholders, not bugs — replace them with your actual club name and department content before deploying. I did not fabricate replacement content for these since I have no way to know the real values from the code alone.

---

## 6. "Make it perfect" pass — more real bugs found, plus a full UI/UX design system

Prompted by being asked directly whether everything necessary was done, I went back through every file I hadn't yet manually reviewed. Found several more real, previously-undiscovered bugs, then built out the visual design the brief also asked for.

### 6.1 Sign-in never actually offered Google OAuth (see section 1a above)
The most significant one — covered in detail above. Anyone could self-register with any email/password, bypassing the VIT-email identity check the whole app assumes.

### 6.2 The entire visual theme was undefined
**File:** `app/globals.css`

This is the reason nearly every page "looked bare" despite the app already depending on shadcn/ui, Tailwind, framer-motion, and several magicui components. `globals.css` only had the three `@tailwind` directives and a body reset — **none** of the CSS custom properties (`--background`, `--foreground`, `--primary`, `--border`, `--card`, etc.) that shadcn's components and `tailwind.config.js`'s color tokens (`hsl(var(--background))` etc.) depend on were ever defined. Every `bg-background`, `text-foreground`, `border-border`, `bg-primary` class anywhere in the app was resolving to `hsl( )` — invalid CSS, silently dropped by the browser. Added the full light/dark token set (slate base, matching `components.json`'s configured base color), with `--primary` customized to a blue accent, plus a few custom utilities (`.text-gradient`, `.glow-ring`, `.grid-bg`, `.glass`) for the redesign.

### 6.3 `ThemeProvider` was imported but never mounted
**File:** `app/layout.js`

`import { ThemeProvider } from "@/components/theme-provider"` was present but the component was never rendered — `children` was wrapped only in `<SubmissionsProvider>`. Without it, `next-themes` was never initialized: `useTheme()` calls in `ThemeToggle.jsx` and `MagicCardComp.jsx` had no provider context, and the `dark` class controlling every `dark:` Tailwind variant across the app was never being applied. Now properly wraps the tree with `attribute="class" defaultTheme="dark" enableSystem={false}`.

### 6.4 A pattern of components that were built correctly but never wired into any page
Beyond the Google sign-in button and bulk-email composer found earlier, the same thing turned up repeatedly:
- **`ThemeToggle.jsx`** — a complete, correct light/dark switch — never rendered anywhere. Added to `NavBar`.
- **`CountdownTimer.jsx`** — imported into both `FormComp.jsx` and `NavBar.jsx`, rendered in neither. Now shown on the homepage hero and inside the application form (also fixed: it hardcoded `text-white`/`text-gray-*` instead of theme tokens, which would've been invisible on a light background once the theme toggle above actually started working).
- **`PopupComp.jsx`** — imported the real shadcn `Dialog` components and then rendered a plain bordered `<div>` instead of using them. Rewired to use the actual `Dialog`.
- **`UserButton.jsx`** — imported `Avatar` and `DropdownMenu` components, rendered a bare `<span>` + `<button>` instead. Rebuilt to actually use them.
- **`app/auth/signin/page.jsx`** — see 1a; imported `Card`/`Button`/`Input`/`Label` and two custom fonts, used none of them.

### 6.5 `DeptHero` crashed the `/development` page
**File:** `components/DeptHero.jsx`, used from `app/(pages)/development/page.jsx`

`DeptHero` unconditionally called `setIsLoading(false)` in a `useEffect`. The `/development` page renders `<DeptHero dept={{ name: "..." }} />` without passing `setIsLoading` at all, so this threw `setIsLoading is not a function` on every load of that page (the same missing-prop pattern also exists, commented out, in `BentoGridComp.jsx`). Guarded the call so it's a no-op when the prop isn't supplied.

### 6.6 `app/_error.js` used the Pages Router API in an App Router project
This project only has an `app/` directory (no `pages/`), i.e. it's on the App Router. `_error.js` with `Error.getInitialProps` is a **Pages Router** convention — Next's App Router doesn't recognize that filename or API at all, so this file was 100% dead: it never ran, for any error, ever. Removed it and added the real App Router equivalents: `app/error.jsx` (a client-component error boundary with `error`/`reset` props) and `app/not-found.jsx` (a styled site-wide 404 — previously only `/join/[...joinIds]` had a scoped one; every other bad URL fell through to Next's unstyled default).

### 6.7 Dead state/effects in the join page
**File:** `app/(pages)/join/[...joinIds]/page.jsx`

`resolvedDepartment1`/`resolvedDepartment2` were computed via `useEffect` from `departmentParamIds` and then never used — the actual render recomputed the same thing again, directly, via `reviews.filter(...)`. `validationScore` and `pageMountTimestamp` were tracked and never read anywhere. Removed all four plus their effects; the page behaves identically, with about half as much state.

### 6.8 Design system + full visual pass
With the token/provider foundation fixed, rebuilt the site's presentation layer:
- **Global**: wired in the "Product Sans" font files that were already sitting in `public/assets/fonts/` (Google's brand typeface, used across GDG-branded material) via `next/font/local`, applied site-wide through `tailwind.config.js`'s `fontFamily.sans` — replacing four different, inconsistently-applied Google Fonts across different pages (Inter, DM Sans, Space Grotesk, Bricolage Grotesque, mixed arbitrarily per file) with one consistent typeface.
- **`NavBar`**: sticky glass header on scroll, gradient wordmark, animated underline nav links, wired-in theme toggle, avatar dropdown.
- **`Hero`** (homepage): grid-pattern + particle background, radial glow, framer-motion staggered entrance, gradient headline, live countdown to the deadline, glowing CTA.
- **`/departments`**: full redesign from a bare checkbox `<ul>` to an animated card grid — each card colored by its department's existing `tone` value and icon (`constants/index.js` already had both, unused by the old list view), selection state with a ring + check-mark, staggered entrance, sticky "continue" bar with live count.
- **`FormComp`** (application form): wrapped in bordered card sections ("About You" / per-department questions), styled every state (loading, sign-in-required, checking-status, closed, error banner) instead of plain text, added the countdown timer for urgency.
- **Admin dashboard**: styled sign-in-required / access-denied / loading states as cards instead of plain text; swapped the table's hardcoded `bg-[#121212]` for the theme's `bg-card` token so it actually respects light/dark mode; added a page header.
- **`PopupComp`, `UserButton`, `Footer`, `DeptHero`, `GDGLoader`, `not-found` pages, `development` page**: brought in line with the same token/spacing system.

### 6.9 Still not done
- I did not restyle `MailComposer.jsx`'s toolbar (it already uses real shadcn `Button`/`Select`/`Dialog` components, so it inherits the new theme automatically without needing a rewrite) or `BentoGridComp.jsx` (611 lines, appears to be an alternate/unused homepage layout — not touched since nothing currently renders it).
- Still no full `npm run build` completed end-to-end in this environment (see section 2) — a visual/build check on your own machine is worth doing before treating this as final.
