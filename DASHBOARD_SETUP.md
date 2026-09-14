# Admin dashboard — Firebase setup

The code is wired end-to-end (Auth, Firestore, Storage), but it can't run
until you provision a real Firebase project — that part needs your own
Google account, so it isn't something that can be done for you. Steps below.

## 1. Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. Once created, go to **Build → Authentication → Get started → Sign-in method** and enable **Email/Password**.
3. Go to **Build → Firestore Database → Create database** (production mode, any region).
4. Go to **Build → Storage → Get started** (default bucket is fine).

## 2. Get the client config

**Project settings** (gear icon) → **General** → scroll to **Your apps** → **Add app → Web**. Register it (no hosting needed), then copy the `firebaseConfig` values into `.env.local` (copy `.env.local.example` first):

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## 3. Get the Admin SDK credentials

**Project settings → Service accounts → Generate new private key**. This downloads a JSON file. Copy three fields from it into `.env.local`:

```
FIREBASE_ADMIN_PROJECT_ID=<project_id>
FIREBASE_ADMIN_CLIENT_EMAIL=<client_email>
FIREBASE_ADMIN_PRIVATE_KEY="<private_key, keep the \n escapes as-is, wrap in quotes>"
```

**Never commit this JSON file or its values** — `.env.local` is already gitignored.

## 4. Create your first admin user

There's no public sign-up page by design — this is an admin-only panel. Create the first account yourself: **Authentication → Users → Add user**, enter an email and password.

## 5. Deploy the security rules

Two rules files are already written for you at the project root: `firestore.rules` and `storage.rules`. Paste each into the Firebase Console's **Firestore → Rules** and **Storage → Rules** tabs and click **Publish** (or use the Firebase CLI if you have it set up: `firebase deploy --only firestore:rules,storage:rules`).

They lock everything down except one thing: the public contact form can **create** a document in `contacts` (and nothing else) — the dashboard reads/writes everything through the Admin SDK, which always bypasses rules.

## 6. Seed the public inventory (optional)

The homepage's "Modelos populares" grid reads live from Firestore's `cars`
collection — it starts empty. `scripts/seedCars.mts` loads 10 local
pre-owned listings into it:

```
npm run seed:cars
```

It's safe to re-run — it checks for existing docs first and skips if
`cars` already has data. Delete the collection in the Firebase console if
you want to re-seed from scratch.

## 7. Run it

```
npm run dev
```

Visit `/login`, sign in with the user from step 4, and you'll land on `/dashboard`. Visit `/` to see the public site read from Firestore.

## What's wired vs. what's a stretch goal

**Done:**
- `/login` — Firebase Auth email/password sign-in, exchanges the ID token for an httpOnly session cookie (`app/login/actions.ts`)
- `proxy.ts` — verifies the session cookie server-side for every `/dashboard/*` request; each mutating Server Action re-verifies too (defense in depth)
- `/dashboard` — 4 KPIs (vehicle count, contact count, user count, this month's inquiries) + recent vehicles/contacts, all from Firestore/Auth via the Admin SDK
- `/dashboard/inventario` — list + add (`components/AddCarModal.tsx`, multi-photo upload straight to Storage from the browser) + delete
- `/dashboard/usuarios` — list + create + delete Firebase Auth users
- `/dashboard/contactos` — list + delete leads
- The public contact form (`components/ContactSection.tsx`) writes real leads to Firestore's `contacts` collection
- The public homepage (`app/(marketing)/page.tsx`) and the dashboard's Inventario page both read/write the **same** Firestore `cars` collection via `lib/public-inventory.ts` / `lib/dashboard-data.ts` — one inventory, not two. (An earlier pass kept a separate `vehicles` collection for the dashboard; that's gone now.) Shape: `make, model, year, price, mileage, transmission, fuelType, color, image, images[], imagePaths[], features[], description, featured, createdAt`.
- Adding a car writes to Firestore/Storage **client-side**, authorized by `firestore.rules`/`storage.rules`'s `request.auth != null` check under `/cars` — that's why `AddCarModal` waits for Firebase's client auth state to resolve before allowing submit. Deleting stays a Server Action (Admin SDK), so no client-facing delete rule was needed.

**Not done (flagging rather than guessing you want it):**
- No edit/update forms (cars and users are create/delete only, no in-place edit).
- The trade-in form (`components/TradeInForm.tsx`) still simulates its submit — it doesn't write to Firestore. Only the main contact form does.
- No pagination — list pages fetch everything, fine at small scale but worth revisiting once inventory/contacts grow.
- `CarCard`/`Hero` on the public site still only use the first image and ignore `features`/`description` — the car detail page is where those actually get displayed.
