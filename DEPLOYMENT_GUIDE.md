# 🚀 Deployment Guide - Multi-Device Testing

## ✅ What's Implemented

- **Participant Camera Streaming** - Participants can stream their camera to the authority dashboard
- **Real-time Display** - Authority dashboard shows all active participant camera feeds
- **Live Updates** - Streams update every 3 seconds automatically

---

## 📱 Testing on Multiple Devices (Local Network)

### Setup Overview:
- **Device 1 (Computer)**: Backend + Authority Dashboard
- **Device 2 (Phone/Tablet)**: Participant Dashboard

### Step 1: Find Your Computer's IP Address

#### Windows:
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter (e.g., `192.168.1.100`)

#### Mac/Linux:
```bash
ifconfig
# or
ip addr show
```

**Example IP:** `192.168.1.100`

---

### Step 2: Start Backend (Device 1 - Computer)

```powershell
cd backend

# IMPORTANT: Use --host 0.0.0.0 to allow external connections!
$env:PERPLEXITY_API_KEY='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'
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Important:**
- `--host 0.0.0.0` allows connections from other devices on your network
- Backend will be accessible at `http://192.168.1.100:8000` (replace with your IP)

---

### Step 3: Configure Frontend for Network Access

Update `frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Listen on all network interfaces
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.1.100:8000',  // YOUR COMPUTER'S IP!
        changeOrigin: true,
      },
      '/incidents': {
        target: 'http://192.168.1.100:8000',
        changeOrigin: true,
      },
    },
  },
})
```

**Replace `192.168.1.100` with YOUR computer's IP address!**

---

### Step 4: Start Frontend (Device 1 - Computer)

```powershell
cd frontend
npm run dev
```

Frontend will be accessible at:
- **Local:** `http://localhost:5173`
- **Network:** `http://192.168.1.100:5173`

---

### Step 5: Access from Device 2 (Phone/Tablet)

#### On Device 2 (Participant):
1. **Connect to SAME Wi-Fi network** as Device 1
2. **Open browser** (Chrome/Safari)
3. **Navigate to:** `http://192.168.1.100:5173` (use Device 1's IP!)
4. **Sign up** as Participant or go to `/mobile-participant`

#### Test Camera Streaming:
1. **Grant camera permissions** when prompted
2. **Click "Start Camera Streaming"** button
3. **Live preview** appears with "LIVE" badge
4. **Frames sent every 2 seconds** to authority dashboard

---

### Step 6: View on Authority Dashboard (Device 1)

1. **On Device 1**, go to `http://localhost:5173/authority-dashboard`
2. **Look for "Participant Camera Feeds"** section
3. **You should see:**
   - Participant's name
   - Live camera feed (updates every 3 seconds)
   - "LIVE" badge (green if active)
   - Timestamp

---

## 🔥 Quick Test Checklist

### Device 2 (Participant):
- [ ] Connect to same Wi-Fi as Device 1
- [ ] Open `http://192.168.1.100:5173/mobile-participant`
- [ ] Enter your name when prompted
- [ ] Grant camera permission
- [ ] Click "Start Camera Streaming"
- [ ] See "LIVE" badge and preview
- [ ] Console shows: `📤 Frame sent to authority dashboard`

### Device 1 (Authority):
- [ ] Open `http://localhost:5173/authority-dashboard`
- [ ] Scroll to "Participant Camera Feeds"
- [ ] See participant's name and camera feed
- [ ] Console shows: `📹 Loaded X participant streams`
- [ ] Frames update automatically

---

## 🛠️ Troubleshooting

### ❌ Can't connect from Device 2

**Check:**
1. Both devices on SAME Wi-Fi network?
2. Firewall blocking port 5173 and 8000?
3. IP address correct?

**Windows Firewall Fix:**
```powershell
# Allow ports through firewall
netsh advfirewall firewall add rule name="Event Rescue Frontend" dir=in action=allow protocol=TCP localport=5173
netsh advfirewall firewall add rule name="Event Rescue Backend" dir=in action=allow protocol=TCP localport=8000
```

### ❌ Participant camera not showing in dashboard

**Check:**
1. Participant clicked "Start Camera Streaming"?
2. Backend logs show: `📹 Received frame from participant`?
3. Check browser console for errors
4. Try refreshing authority dashboard

### ❌ Backend not accessible

**Check:**
1. Backend started with `--host 0.0.0.0`?
2. Test from Device 2: `http://192.168.1.100:8000/health`
3. Should return `{"status":"ok"}`

---

## 🌐 Deployment to Internet (Production)

For real deployment accessible from anywhere:

### Option 1: Cloud Platform (Recommended)

#### Backend (FastAPI):
- **Heroku**: Easy Python deployment
- **Railway**: Modern, simple
- **AWS EC2**: Full control
- **Google Cloud Run**: Serverless

#### Frontend (React):
- **Netlify**: Free tier, automatic builds
- **Vercel**: Best for React
- **GitHub Pages**: Free static hosting
- **AWS S3 + CloudFront**: Scalable

### Option 2: Self-Host with HTTPS

Requirements:
- Domain name (e.g., `eventrescue.com`)
- SSL certificate (use Let's Encrypt - FREE)
- Reverse proxy (Nginx)

#### Quick Nginx Setup:
```nginx
server {
    listen 80;
    server_name eventrescue.com;
    
    location /api {
        proxy_pass http://localhost:8000;
    }
    
    location / {
        proxy_pass http://localhost:5173;
    }
}
```

---

## 📊 Network Configuration Summary

| Component | Local Access | Network Access |
|-----------|-------------|----------------|
| Backend | `http://localhost:8000` | `http://192.168.1.100:8000` |
| Frontend | `http://localhost:5173` | `http://192.168.1.100:5173` |
| Authority Dashboard | `/authority-dashboard` | Same |
| Participant Dashboard | `/mobile-participant` | Same |

---

## 🎯 Production Checklist

Before deploying to production:

- [ ] Replace in-memory database with PostgreSQL/MongoDB
- [ ] Use environment variables for secrets
- [ ] Implement proper JWT authentication
- [ ] Add HTTPS/TLS encryption
- [ ] Set up CORS properly
- [ ] Add rate limiting
- [ ] Enable error monitoring (Sentry)
- [ ] Set up analytics
- [ ] Add backup system
- [ ] Configure CDN for assets
- [ ] Set up CI/CD pipeline
- [ ] Add health check endpoints
- [ ] Configure logging

---

## 🧪 Testing Scenarios

### Scenario 1: Single Participant
1. Start backend and frontend
2. Open authority dashboard on Device 1
3. Open participant dashboard on Device 2
4. Start camera streaming
5. **Result:** Feed appears in authority dashboard

### Scenario 2: Multiple Participants
1. Open participant dashboard on Device 2 (Phone)
2. Open participant dashboard on Device 3 (Tablet)
3. Both start camera streaming
4. **Result:** Authority sees both feeds side-by-side

### Scenario 3: Participant Disconnects
1. Participant stops streaming
2. Wait 10 seconds
3. **Result:** Status changes to "OFFLINE" in authority dashboard

---

## 📞 Support

### Common URLs:
- **Backend Health:** `http://YOUR_IP:8000/health`
- **API Docs:** `http://YOUR_IP:8000/docs`
- **Participant Streams:** `http://YOUR_IP:8000/api/participant/streams`

### Debug Endpoints:
- `/api/debug/yolo` - Check YOLO status
- `/api/auth/users` - List registered users
- `/api/lostfound` - List reports

---

## 🎉 Success Indicators

When everything works:

### Participant Device:
```
✅ Camera streaming started
📤 Frame sent to authority dashboard
📤 Frame sent to authority dashboard
...
```

### Authority Device:
```
📹 Loaded 1 participant streams
📹 Received frame from participant: John (ID: participant_xxx)
```

### Browser (Participant):
- ✅ Video preview with "LIVE" badge
- ✅ Status: "Streaming to authority dashboard as [Name]"

### Browser (Authority):
- ✅ Participant camera feed visible
- ✅ Name and timestamp displayed
- ✅ "LIVE" badge (green)
- ✅ Feed updates automatically

---

## 🔒 Security Notes

**Current Setup (Development):**
- ⚠️ No authentication required
- ⚠️ Frames sent unencrypted (HTTP)
- ⚠️ Data stored in memory only

**Production Requirements:**
- ✅ HTTPS for encrypted transmission
- ✅ JWT authentication for API access
- ✅ Rate limiting to prevent abuse
- ✅ Database for persistent storage

---

## 📝 Quick Commands Reference

```powershell
# Get your IP address
ipconfig

# Start backend (network accessible)
cd backend
$env:PERPLEXITY_API_KEY='YOUR_KEY'
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start frontend (network accessible)
cd frontend
npm run dev -- --host 0.0.0.0

# Test backend health
curl http://YOUR_IP:8000/health

# Test frontend access
# Open browser: http://YOUR_IP:5173
```

---

**Ready to test!** 🚀

Open participant dashboard on your phone and start streaming to see it live on the authority dashboard!
