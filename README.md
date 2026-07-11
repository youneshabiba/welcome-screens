# Room Welcome Screens

Reception types a patient's name into one page. The right TV updates instantly.

## What's in here
- `server.js` — the app (Node/Express + Socket.io)
- `public/control.html` — reception's page (open on any computer/tablet/phone)
- `public/display.html` — the TV page (one browser tab per room, left open all day)
- `state.json` — remembers what each room is currently showing, so a TV that
  restarts still shows the last name until reception changes it

## 1. Deploy it (one-time setup, ~10 minutes)

We recommend **Render** (render.com) — it has a free tier and needs no server
maintenance. (Railway or Fly.io work the same way if you prefer those.)

1. Create a free account at https://render.com
2. Put this folder in a GitHub repo (or use Render's "deploy from a zip"
   option if you don't want to use GitHub — see their docs).
3. In Render: **New → Web Service**, point it at the repo.
   - Build command: `npm install`
   - Start command: `npm start`
4. Click deploy. Render gives you a URL like:
   `https://your-clinic-welcome.onrender.com`

That URL is now your app, reachable from any device with internet.

**Note on the free tier:** Render's free web services go to sleep after
15 minutes of no traffic and take ~30–60 seconds to wake back up. For a
front-desk tool that's checked constantly, this is usually fine, but if you
notice a delay the first time each morning, upgrade to Render's cheapest
paid tier (~$7/mo) to keep it always-on.

## 2. Set up reception's control page

On the front desk computer/tablet, open:
`https://your-clinic-welcome.onrender.com/control`

Bookmark it. That's the only page reception needs.

## 3. Set up each TV (Fire Stick / Chromecast / small PC)

**Fire Stick:**
1. Install the **Silk Browser** (or "Downloader" app, then use it to get a
   kiosk-style browser like "Fully Kiosk Browser").
2. Open the browser and go to:
   `https://your-clinic-welcome.onrender.com/display?room=1`
   (use `room=2`, `room=3`, etc. for the other rooms — this is the only
   thing that changes between TVs)
3. Leave the browser open on that page. If your browser app has a
   "kiosk mode" / "keep screen on" / "prevent sleep" setting, turn it on.
4. Set the Fire Stick's screensaver/sleep timer to Never (Settings →
   Display & Sounds → Screensaver).

**Chromecast:** cast the `/display?room=1` tab from a Chrome browser and
leave it casting. (Fire Stick is more reliable for an all-day, always-on
display since it doesn't depend on a laptop staying on.)

**Small PC / smart TV browser:** just open the same URL full-screen (press
F11 in most browsers) and disable sleep/screensaver.

## 4. Using it day-to-day

1. Patient is roomed.
2. Reception opens `/control`, types the name under that room, hits **Show**.
3. The TV in that room animates in the welcome screen with the patient's name.
4. Hit **Clear** when the room turns over — the screen returns to the idle
   "welcome to the practice" screen until the next name is set.

## Customizing the look

Open `public/display.html` and edit the `:root` CSS variables near the top
(`--bg-1`, `--bg-2`, `--ink`, `--accent`, fonts) plus the `monogram` div and
the `IDLE_NAME` / `IDLE_TAGLINE` text in the script — those control your
colors, logo initials, and idle-screen wording.

## About Dentolize

Dentolize doesn't currently offer a public API, so there's no reliable way
to pull room/patient data from it automatically — that's why this uses a
manual "type it once" step at check-in instead. If that changes in the
future (worth asking their support team directly), this app could be
extended to pull the name automatically instead of reception typing it.
