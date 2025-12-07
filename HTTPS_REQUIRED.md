# 🔒 HTTPS REQUIRED FOR CAMERA/MIC/LOCATION

## 🚨 Critical Issue: Secure Origins Only

### The Error:
```
❌ getUserMedia not supported in this browser
GeolocationPositionError: Only secure origins are allowed
```

### Root Cause:
You're accessing via **HTTP** on network IP:
```
❌ http://192.168.0.14:5173/mobile-participant
```

Modern browsers **BLOCK** these features on HTTP (non-secure):
- ❌ Camera (`getUserMedia`)
- ❌ Microphone (`getUserMedia`)  
- ❌ Geolocation

### Why This Happens:
Chrome/Firefox/Safari require **HTTPS** for privacy-sensitive APIs when accessed over the network.

**Exception:** `localhost` is exempt from this requirement!

---

## ✅ Solution 1: Use Localhost (Computer Only)

**On your computer**, use `localhost`:

```
✅ http://localhost:5173/mobile-participant
✅ All features work!
```

**Why it works:** Browsers trust `localhost` as a secure context.

**Test now:**
1. Open: `http://localhost:5173/mobile-participant`
2. Grant permissions
3. **Expected:**
   - ✅ Camera works
   - ✅ Microphone works
   - ✅ Location works
   - ✅ Sound detection works
   - ✅ No errors!

---

## ✅ Solution 2: Use HTTPS Tunnel (For Phone Access)

For multi-device testing (phone, tablet), you need **HTTPS**. Use a tunnel:

### Option A: ngrok (Recommended)

**1. Install ngrok:**
```powershell
# Using chocolatey
choco install ngrok

# Or download from: https://ngrok.com/download
```

**2. Create account & get auth token:**
- Sign up at https://dashboard.ngrok.com/signup
- Copy your auth token
- Run: `ngrok config add-authtoken YOUR_TOKEN`

**3. Start tunnel:**
```powershell
# Terminal 1: Backend (keep running)
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend (keep running)
cd frontend
npm run dev

# Terminal 3: Tunnel to frontend
ngrok http 5173
```

**4. You'll get a URL:**
```
Forwarding: https://abc123.ngrok.io -> http://localhost:5173
```

**5. Access on phone:**
```
✅ https://abc123.ngrok.io/mobile-participant
✅ Camera works!
✅ Microphone works!
✅ Location works!
```

**Important:** Backend API calls will fail because frontend expects backend at `/api`. You need to tunnel backend too:

```powershell
# Terminal 4: Tunnel backend
ngrok http 8000
# Get: https://xyz789.ngrok.io

# Update frontend proxy in vite.config.js:
proxy: {
  '/api': {
    target: 'https://xyz789.ngrok.io',  // Use ngrok URL
    changeOrigin: true,
  }
}
```

---

### Option B: Cloudflare Tunnel (Free, No Account Needed)

**1. Install cloudflared:**
```powershell
# Download from: https://github.com/cloudflare/cloudflared/releases
# Or using chocolatey:
choco install cloudflared
```

**2. Start tunnel:**
```powershell
# Tunnel frontend
cloudflared tunnel --url http://localhost:5173
```

**3. You'll get a URL:**
```
https://random-name.trycloudflare.com
```

**4. Access on phone:**
```
✅ https://random-name.trycloudflare.com/mobile-participant
```

---

### Option C: Self-Signed Certificate (Advanced)

**1. Generate certificate:**
```powershell
# Using mkcert
choco install mkcert
mkcert -install
mkcert localhost 192.168.0.14
```

**2. Configure Vite:**
```javascript
// vite.config.js
import fs from 'fs';

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    },
    host: '0.0.0.0',
    port: 5173,
  }
});
```

**3. Access:**
```
✅ https://192.168.0.14:5173/mobile-participant
```

**Warning:** Phone will show "Not Secure" - you must click "Advanced" → "Proceed Anyway"

---

## 🎯 Recommended Approach

### For Development (Computer Only):
```
✅ Use: http://localhost:5173
✅ Fast, no setup needed
✅ All features work
```

### For Multi-Device Testing:
```
✅ Use: ngrok or cloudflared
✅ Real HTTPS
✅ Works on phone/tablet
✅ Easy to set up
```

### For Production Deployment:
```
✅ Deploy to: Vercel, Netlify, etc.
✅ Automatic HTTPS
✅ Custom domain
✅ Best performance
```

---

## 📊 Browser Security Requirements

| Feature | HTTP (localhost) | HTTP (network IP) | HTTPS |
|---------|------------------|-------------------|-------|
| Camera | ✅ Works | ❌ Blocked | ✅ Works |
| Microphone | ✅ Works | ❌ Blocked | ✅ Works |
| Location | ✅ Works | ❌ Blocked | ✅ Works |
| Notifications | ✅ Works | ❌ Blocked | ✅ Works |
| Service Workers | ✅ Works | ❌ Blocked | ✅ Works |

---

## 🧪 Quick Test

### Test on Computer (localhost):
```bash
# 1. Open: http://localhost:5173/mobile-participant
# 2. Click "Request Permissions"
# 3. Grant camera, mic, location
# 4. Expected: ✅ All work!
```

### Test on Phone (HTTPS tunnel):
```bash
# 1. Run: ngrok http 5173
# 2. Get URL: https://abc123.ngrok.io
# 3. On phone: https://abc123.ngrok.io/mobile-participant
# 4. Grant permissions
# 5. Expected: ✅ All work!
```

---

## 🐛 Debug Alerts Varying (20 → 0)

I added debugging to the Authority Dashboard. Check console:

```
📊 Backend has 20 total incidents: [...]
⏭️ Skipping non-allowed type: smoke_detected
⏭️ Skipping resolved incident: fire_detected #5
✅ Showing 5 alerts (filtered from 20)
```

This will show:
- How many incidents backend returns
- Which types are being skipped
- Which incidents are resolved
- Final count after filtering

**Watch the console** when alerts change to see what's happening!

---

## 📝 Summary

### Your Current Issue:
```
❌ http://192.168.0.14:5173  → Blocked by browser
```

### Solutions:
```
✅ http://localhost:5173      → Works on computer
✅ https://ngrok.io           → Works on phone
✅ Deploy to Vercel/Netlify   → Works everywhere
```

---

## 🚀 Quick Start: ngrok Setup

```powershell
# 1. Install
choco install ngrok

# 2. Sign up & auth
# Visit: https://dashboard.ngrok.com/signup
# Get token, then:
ngrok config add-authtoken YOUR_TOKEN

# 3. Start services
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# New terminal:
cd frontend
npm run dev

# New terminal:
ngrok http 5173

# 4. Use the https:// URL on your phone!
```

---

## 🎉 Result

- ✅ Computer: Use `localhost` (instant)
- ✅ Phone: Use `ngrok` (2 min setup)
- ✅ Production: Deploy to cloud (automatic HTTPS)

**Test with localhost first to verify everything works!**
