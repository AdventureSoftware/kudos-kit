# Google and Apple sign-in

Both are optional. Each one switches on by itself when its settings are in `.env` (or `server/.env` for local development),
and its button appears on the sign-in page. After changing it: `docker compose up -d` (or restart the dev server).

Kudos Kit stays **invite-only** with either one:

- The sign-in page never creates accounts. Someone without an account who clicks
  "Continue with Google" is told to ask for an invitation.
- The invite page offers "Join with Google". It only works with the Google account whose
  email matches the invitation.
- Someone who already has a password account connects Google or Apple on their
  **Account** page. Signing in with Google joins a password account with the same email
  automatically only after that email has been confirmed (for example, by using a
  "Forgot password" link once).
- Apple is not offered on the invite page, because with "Hide My Email" Apple gives a
  random address that can't match the invitation. People join first, then connect Apple
  on their Account page. After that it works whatever address Apple shows.

The addresses below use `https://kudoskit.io`. Replace it with your own
address (`DOMAIN` in `.env`).

---

## Google (free, works on localhost)

1. Go to <https://console.cloud.google.com/> and create a project (e.g. "Kudos Kit").
2. **APIs & Services → OAuth consent screen** (also called "Google Auth Platform"):
   - User type: **External**
   - App name: `Kudos Kit`, support email: yours
   - Scopes: only `openid`, `email`, `profile` (the defaults). These need no review by Google.
   - When everything works, set the publishing status to **In production**. While it says
     "Testing", only the test users you list there can sign in.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `http://localhost:3001`
     - `https://kudoskit.io`
   - Authorized redirect URIs:
     - `http://localhost:3001/api/auth/callback/google`
     - `https://kudoskit.io/api/auth/callback/google`
4. Copy the client ID and secret into `.env` on the server (`server/.env` for local development):

   ```env
   GOOGLE_CLIENT_ID=1234567890-abc.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-...
   ```

---

## Apple (paid Apple Developer membership, needs the real domain over HTTPS)

Apple does not accept `localhost`, so this can only be tried on the deployed site.

1. <https://developer.apple.com/account> → **Certificates, Identifiers & Profiles**.
2. **Identifiers → +  → App IDs → App**:
   - Description `Kudos Kit`, Bundle ID e.g. `io.kudoskit.app`
   - Tick **Sign in with Apple**. Continue, Register.
3. **Identifiers → + → Services IDs**:
   - Description `Kudos Kit web`, Identifier e.g. `io.kudoskit.app.web`
     (this is your `APPLE_SERVICES_ID`)
   - Register, open it again, tick **Sign in with Apple → Configure**:
     - Primary App ID: the App ID from step 2
     - Domains: `kudoskit.io`
     - Return URLs: `https://kudoskit.io/api/auth/callback/apple`
   - Save.
4. **Keys → +**:
   - Name `Kudos Kit sign in`, tick **Sign in with Apple → Configure** → the App ID from step 2
   - Register and **download the `.p8` file**. Apple lets you download it only once.
   - Note the **Key ID** shown next to it.
5. Your **Team ID** is at the top right of the developer site (10 characters).
6. Put the key in the `secrets/` folder next to `docker-compose.yml` (it is in `.gitignore`;
   see DEPLOY.md step 2b for its permissions), and add to `.env`:

   ```env
   APPLE_SERVICES_ID=io.kudoskit.app.web
   APPLE_TEAM_ID=ABCDE12345
   APPLE_KEY_ID=ABC123DEFG
   APPLE_PRIVATE_KEY_PATH=/app/secrets/AuthKey_ABC123DEFG.p8
   ```

   `/app/secrets/` is where that folder appears inside the container.

Apple's "client secret" is a token signed with this key that expires after 6 months.
Kudos Kit creates it from the key and renews it by itself, so there is nothing to renew by hand.

---

## Checking

- `GET /v1/setup/status` lists the providers that are on, e.g. `"providers":["google"]`.
- The sign-in page shows a "Continue with …" button for each one.
- A provider whose settings are incomplete stays off, silently. If the Apple key file
  can't be read, the server refuses to start and says which setting to fix.
