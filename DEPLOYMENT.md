# LinkSnap Deployment Guide (Vercel + Turso)

This guide covers how to deploy the full LinkSnap application (both the frontend dashboard and backend API) natively onto **Vercel** with a **Turso Edge SQLite** database!

---

## 1. Prepare Your GitHub Repository

Before you deploy to Vercel, your code must be pushed to a GitHub repository.

1. Create a new repository on [GitHub](https://github.com/new).
2. Open your terminal in the root of the LinkSnap project.
3. Initialize Git and push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of LinkSnap"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

---

## 2. Set Up Turso SQLite Database

Turso is a fast edge SQLite database. We use it to store API keys and log API usage globally.

### 2.1 Install and Authenticate
1. Open your terminal and install the Turso CLI:
   - **Mac/Linux:** `curl -sSfL https://get.tur.so/install.sh | bash`
   - **Windows:** `iwr -useb https://get.tur.so/install.ps1 | iex`
2. Log in to your Turso account (this will open a browser window):
   ```bash
   turso auth login
   ```

### 2.2 Create the Database & Get Credentials
1. Create a new database specifically for LinkSnap:
   ```bash
   turso db create linksnap-db
   ```
2. Retrieve your `TURSO_DATABASE_URL`:
   ```bash
   turso db show linksnap-db --url
   ```
   *(Save this URL somewhere safe. It will look like `libsql://linksnap-db-username.turso.io`)*
3. Generate your `TURSO_AUTH_TOKEN`:
   ```bash
   turso db tokens create linksnap-db
   ```
   *(Save this Token somewhere safe. It is a very long string)*

### 2.3 Initialize the Tables
We have already written the SQL statements required in `lib/schema.sql`. Push them to Turso:
```bash
turso db shell linksnap-db < lib/schema.sql
```
*You can verify it worked by typing `turso db shell linksnap-db` then `.tables`. You should see `api_keys` and `api_usage_logs`.*

---

## 3. Deploy to Vercel

Vercel will seamlessly host both the React UI and securely compile the `/api/preview` Next.js routes into serverless Edge functions.

1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your LinkSnap GitHub repository.
4. In the "Configure Project" screen:
   - Framework Preset should automatically be detected as **Next.js**.
   - Open **Environment Variables**.
   - Add exactly these variables:
     - `TURSO_DATABASE_URL` = *(Your URL from step 2.2)*
     - `TURSO_AUTH_TOKEN` = *(Your Token from step 2.2)*
5. Click **Deploy**.

*(Note: Vercel handles all internal routing natively, so you do not need to set `NEXT_PUBLIC_API_URL` or configure CORS!)*

---

## 4. Final Verification

Once Vercel finishes deploying, visit your live Vercel URL (e.g. `https://linksnap.vercel.app`).

**Test the UI:**
1. Navigate to the **Dashboard** via the top navigation bar.
2. Paste any URL into the Preview Builder and hit "Generate".
3. Check that the preview card generates successfully.

**Test the Database & Backend:**
1. Hit your live Vercel API endpoint from your terminal using the key you added to your Turso database:
   ```bash
   curl -X GET "https://linksnap.vercel.app/api/preview?url=https://github.com&api_key=YOUR_TURSO_KEY"
   ```
2. You can verify your database logs natively from your terminal to ensure it tracked the API call:
   ```bash
   turso db shell linksnap-db "SELECT * FROM api_usage_logs;"
   ```

**Congratulations! Your full-stack Link Preview Service is live on Vercel!**
