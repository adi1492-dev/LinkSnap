# Complete LinkSnap Deployment Guide: Turso + Railway + Vercel

This comprehensive, step-by-step guide covers how to deploy the LinkSnap application. LinkSnap uses a **Split Architecture**: 
1. **Frontend UI & Dashboard** hosted on **Vercel** for optimal global CDN delivery.
2. **Backend API (`/api/preview`)** hosted on **Railway** to handle compute-heavy DOM parsing.
3. **Database** hosted on **Turso** (SQLite at the edge) for incredibly fast data reads and usage tracking.

---

## 1. Prepare Your GitHub Repository

Before you deploy to any platform, your code must be pushed to a GitHub repository.

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

Turso is a fast edge SQLite database. We use it to store API keys and log API usage.

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

## 3. Deploy the Backend API to Railway

Railway will host the `/api/preview` route. We are deploying the entire Next.js app to Railway, but Railway will only be responsible for executing the API server.

1. Log into your [Railway Dashboard](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your LinkSnap repository.
4. **Important:** Click **Add Variables** on the setup screen (or go to the **Variables** tab on your deployed service). Add exactly these variables:
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = *(Your Vercel Domain, e.g. https://linksnap.vercel.app - this secures your CORS!)*
   - `TURSO_DATABASE_URL` = *(Your URL from step 2.2)*
   - `TURSO_AUTH_TOKEN` = *(Your Token from step 2.2)*
5. Wait for the build to finish. Railway will read the `railway.toml` file automatically, run `npm run build`, and execute `npm start`.
6. Once the build is green, go to the **Settings** tab.
7. Scroll down to **Networking** -> **Public Networking**.
8. Click **Generate Domain**.
   *(Railway will give you a domain like `linksnap-api-production.up.railway.app`. Copy this domain!)*

---

## 4. Connect the Vercel Frontend to Railway

Before we deploy to Vercel, we need to tell Vercel to route all API calls to the Railway domain you just generated. This uses Next.js `rewrites` to completely bypass CORS issues.

1. Open your code editor and find the `vercel.json` file in the root directory.
2. Replace `YOUR_RAILWAY_APP_DOMAIN.up.railway.app` with the domain you generated in Step 3.8.
   ```json
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "framework": "nextjs",
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://linksnap-api-production.up.railway.app/api/$1"
       }
     ],
     "env": {
       "NEXT_PUBLIC_API_URL": "https://linksnap-api-production.up.railway.app"
     }
   }
   ```
3. Save the file.
4. Commit and push this change to GitHub:
   ```bash
   git add vercel.json
   git commit -m "Configure Railway backend routing"
   git push origin main
   ```

---

## 5. Deploy Frontend to Vercel

Vercel will host the beautiful static landing page and interactive React dashboard.

1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your LinkSnap GitHub repository.
4. In the "Configure Project" screen:
   - Framework Preset should automatically be detected as **Next.js**.
   - Open **Environment Variables**.
   - Add Name: `NEXT_PUBLIC_API_URL`
   - Add Value: `https://linksnap-api-production.up.railway.app` *(Use your specific Railway domain!)*
5. Click **Deploy**.

---

## 6. Final Verification

Once Vercel finishes deploying, visit your live Vercel URL (e.g. `https://linksnap.vercel.app`).

**Test the UI:**
1. Navigate to the **Dashboard** via the top navigation bar.
2. Paste any URL into the Preview Builder and hit "Extract Metadata".
3. Check that the preview card generates successfully in under 2 seconds.

**Test the Database & Backend:**
Since you are using the Turso database now, the frontend will automatically proxy requests to Railway. Railway will:
1. Contact Turso over HTTP to validate API keys if one is provided.
2. Log the extraction event to the `api_usage_logs` table.

You can verify your database logs natively from your terminal:
```bash
turso db shell linksnap-db "SELECT * FROM api_usage_logs;"
```

**Congratulations! Your Enterprise-grade, distributed Link Preview Service is live!**
