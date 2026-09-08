# Recruitment Portal

A recruitment/application portal built for a college club — applicants sign in with their VIT email, apply to up to two departments, and answer department-specific questions. Admins get a dashboard to review, shortlist, and email applicants.

## Features

**Applicants**
- Google OAuth sign-in (VIT email)
- Pick up to 2 departments, fill a form per department with dynamic, department-specific questions
- Registration number format validated client- and server-side
- Draft answers autosaved to the browser so a refresh doesn't lose progress
- Submission deadline enforced server-side
- Duplicate/over-limit submissions blocked atomically (Firestore transaction)

**Admins**
- Table of all applicants: sort, filter by department/shortlist status, global search, pagination
- Shortlist/unshortlist with one click
- View an applicant's full question responses
- Export the current view to CSV
- Compose and send bulk HTML emails (rich-text editor) to selected applicants

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router) + React 18
- [Firebase Firestore](https://firebase.google.com/docs/firestore) via `firebase-admin` (server-only — no client-side Firestore access)
- [better-auth](https://www.better-auth.com/) with a Firestore adapter, Google OAuth
- Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/) components
- [Tiptap](https://tiptap.dev/) for the rich-text email composer
- [react-table](https://react-table-v7.tanstack.com/) for the admin data table
- Nodemailer for email delivery

## Getting started

### 1. Prerequisites

- Node.js 18+
- A [Firebase](https://console.firebase.google.com/) project with Firestore enabled
- A Google Cloud OAuth client (for sign-in)
- (Optional) a Gmail account with an [app password](https://support.google.com/accounts/answer/185833) for sending emails

### 2. Install

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Service account credentials for `firebase-admin` (Project Settings → Service Accounts → Generate new private key) |
| `NEXT_PUBLIC_FIREBASE_*` | Your Firebase web app config (Project Settings → General → Your apps) |
| `BETTER_AUTH_SECRET` | A random 32+ character secret (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | `http://localhost:3000` locally, your deployed URL in production |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | OAuth client credentials from Google Cloud Console |
| `EMAIL_USERNAME`, `EMAIL_PASSWORD` | Gmail address + app password used to send bulk emails (optional — only needed for the admin email feature) |

### 4. Deploy Firestore rules

```bash
npx firebase deploy --only firestore:rules
```

The included `firestore.rules` denies all direct client access by design — every read/write goes through the Next.js API routes using the Firebase Admin SDK (which isn't subject to these rules), authenticated and authorized server-side. There's no legitimate reason for a browser to talk to Firestore directly in this app; keep it that way.

### 5. Run

```bash
npm run dev
```

Visit `http://localhost:3000`.

### 6. Make yourself an admin

Sign in once, then set your user's `role` field to `admin` in the `user` collection in Firestore (via the Firebase console, or the `better-auth` admin plugin). Only users with `role: "admin"` can reach `/admin` or its API routes.

## Project structure

```
app/
  (pages)/
    admin/         # admin dashboard (server-gated by role)
    departments/    # department picker
    join/[...joinIds]/  # application form
    development/
  api/
    submit-form/    # applicant submission (transactional, deadline-checked)
    admin/applicants/  # admin-only: list all applicants
    shortlist/[id]/    # admin-only: toggle shortlist status
    send-email/     # admin-only: bulk email
    check-applications/, check-department-submission/, get-submissions/
  auth/             # sign-in / sign-out pages
components/         # UI components (shadcn/ui in components/ui, magicui in components/magicui)
lib/
  db.ts             # Firestore admin connection
  auth.js           # better-auth config
constants/          # department catalog, questionnaire definitions, email templates
```

## Notes on customizing

- Department names, descriptions, and per-department questions live in `constants/index.js`. Replace the placeholder content there with your own.
- "Organization Name" placeholders in `app/layout.js`, `components/Footer.jsx`, and `components/FormComp.jsx` should be replaced with your club/organization's actual name before deploying.
- Only `firebase-admin` (server-side) touches Firestore in this codebase — if you ever add client-side Firestore access, you'll need to write real security rules for it; the current deny-all rules assume you won't.

## License

MIT — see [LICENSE](./LICENSE).
