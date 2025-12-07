# 🚀 Quick Setup Instructions

## 📍 Your IP Address
**`192.168.0.14`**

---

## 🔥 Fire Detection - NOW FIXED!

### ✅ What Changed:
Fire detection now **ONLY triggers** when it sees **ACTUAL BRIGHT FIRE** in the camera:

#### Requirements for Fire Detection:
1. **Color:** Red, Orange, or Yellow (fire colors)
2. **Saturation:** Must be VIVID (>120/255) - not dull red objects
3. **Brightness:** Must be BRIGHT (>180/255) - fire glows!
4. **Coverage:** At least 5% of frame must be fire-colored

#### Color Ranges (HSV):
- **Bright RED fire:** Hue 0-10, Saturation >120, Brightness >180
- **Bright ORANGE fire:** Hue 10-25, Saturation >120, Brightness >180  
- **Bright YELLOW fire:** Hue 25-35, Saturation >100, Brightness >200

### ❌ Will NOT Trigger On:
- ❌ Red shirts/clothing
- ❌ Red walls/objects
- ❌ Dull red items
- ❌ Dark red colors
- ❌ Small red spots

### ✅ WILL Trigger On:
- ✅ Actual flames (bright, vivid)
- ✅ Real fire (red/orange/yellow and BRIGHT)
- ✅ Burning materials
- ✅ Large fire sources

---

## 🚀 Running Commands

### 1. Start Backend:
```powershell
cd backend
$env:PERPLEXITY_API_KEY='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'
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start Frontend:
```powershell
cd frontend
npm run dev
```

---

## 📱 Access URLs

### On Your Computer:
- **Authority Dashboard:** `http://localhost:5173/authority-dashboard`
- **Participant Dashboard:** `http://localhost:5173/mobile-participant`
- **Sign Up:** `http://localhost:5173/signup`

### On Your Phone (Same Wi-Fi):
- **Participant Dashboard:** `http://192.168.0.14:5173/mobile-participant`
- **Sign Up:** `http://192.168.0.14:5173/signup`

---

## 🧪 Testing Participant Camera Streaming

### Step 1: On Computer
1. Start backend and frontend
2. Go to: `http://localhost:5173/authority-dashboard`
3. Scroll to "Participant Camera Feeds" section

### Step 2: On Phone
1. Connect to SAME Wi-Fi
2. Go to: `http://192.168.0.14:5173/mobile-participant`
3. Enter your name when prompted
4. Grant camera permission
5. Click "Start Camera Streaming"
6. See "LIVE" badge

### Step 3: Verify
- ✅ Phone shows video preview with "LIVE" badge
- ✅ Computer shows phone's camera feed in authority dashboard
- ✅ Feed updates every 3 seconds

---

## 🔥 Testing Fire Detection

### How to Test:
1. Start authority dashboard camera
2. Click "Start" under Live Preview
3. Show a **bright light source** (phone flashlight, lamp)
4. Point at something **bright red/orange** near the light
5. Fire should only be detected if it's VERY bright and vivid

### What You Should See:
```
Fire Detected: 🚨 YES
Fire Ratio: 5.2%  (must be >5%)
```

### False Positive Test:
1. Show red shirt/object (dull color)
2. **Should NOT detect as fire** ✅
3. Console: Fire ratio < 5%

---

## ✅ Complete Testing Checklist

### Backend & Frontend:
- [ ] Backend running on `http://192.168.0.14:8000`
- [ ] Frontend running on `http://192.168.0.14:5173`
- [ ] No errors in console

### Person Detection:
- [ ] Green bounding boxes around people
- [ ] Person count displayed
- [ ] Confidence scores shown

### Fire Detection (STRICT):
- [ ] Shows red shirt → No fire detected ✅
- [ ] Shows bright flame → Fire detected ✅
- [ ] Requires 5%+ of frame to be bright fire

### Participant Camera:
- [ ] Phone can access participant dashboard
- [ ] Camera permission granted
- [ ] Streaming shows "LIVE" badge
- [ ] Authority sees the feed
- [ ] Feed updates automatically

### Missing Person:
- [ ] Submit report with photo
- [ ] Red boxes when person matched
- [ ] Alert notification shown

### Delete Reports:
- [ ] Click delete button
- [ ] Report removed from list

### Sound Detection:
- [ ] Whisper "help" → Detected
- [ ] Volume > 100 → Alert triggered

---

## 🔧 Troubleshooting

### Can't access from phone:
1. Check same Wi-Fi network
2. Check firewall (allow ports 5173, 8000)
3. Verify IP: `ipconfig` → Use Wi-Fi IPv4 address

### Fire detection too sensitive:
- Current threshold: 5% of frame
- Increase in code: Change `fire_ratio > 0.05` to `fire_ratio > 0.08` (8%)

### Fire detection not triggering:
- Check if light is bright enough
- Fire colors must be VIVID and BRIGHT
- Try with actual flame or very bright light

---

## 📊 Technical Details

### Fire Detection Algorithm:
```python
# Must meet ALL criteria:
1. Hue: 0-35 (Red → Orange → Yellow)
2. Saturation: >120/255 (Vivid, not dull)
3. Brightness: >180/255 (Bright, not dark)
4. Coverage: >5% of total pixels
```

### Network Setup:
- **Backend Host:** `0.0.0.0` (allows network access)
- **Frontend Proxy:** Points to backend
- **Streaming:** HTTP POST every 2 seconds
- **Updates:** Authority polls every 3 seconds

---

## 🎯 Quick Test Commands

```powershell
# Check IP
ipconfig

# Test backend health
curl http://192.168.0.14:8000/health

# Start backend (network accessible)
cd backend
$env:PERPLEXITY_API_KEY='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'
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start frontend
cd frontend
npm run dev
```

---

## 🎉 You're Ready!

**Your IP:** `192.168.0.14`
**Fire Detection:** ✅ Fixed (only bright fire)
**Multi-Device:** ✅ Ready to test

Start both servers and test the participant camera streaming! 🚀
