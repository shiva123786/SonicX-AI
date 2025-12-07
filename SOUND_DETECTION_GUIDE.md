# 🎤 Sound Detection Guide

## How It Works

The sound detection system has **TWO SEPARATE FEATURES**:

### 1. 🆘 "Help" Keyword Detection
- **NO THRESHOLD** - Works even when whispered!
- Uses Web Speech Recognition API
- Detects "help" at any volume level
- Processes interim results for faster detection
- Auto-restarts if recognition stops

### 2. 🔊 Volume Threshold Detection  
- **Threshold: 100** (configurable)
- Monitors audio volume continuously
- Triggers when sound exceeds threshold
- Useful for screaming, shouting, loud noises
- Independent from keyword detection

---

## Quick Integration

### In Any Component (e.g., MobileParticipant.tsx):

```typescript
import { useEffect, useState } from 'react';
import { SoundDetector } from '../utils/soundDetection';

function MyComponent() {
  const [detector, setDetector] = useState<SoundDetector | null>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Create detector instance
    const soundDetector = new SoundDetector({
      volumeThreshold: 100,  // Only for volume alerts
      
      onHelpDetected: () => {
        // Triggered when "help" is detected (even whispered!)
        alert('🆘 HELP DETECTED! Sending alert to authorities...');
        
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🆘 Emergency Alert', {
            body: 'Help request detected. Authorities have been notified.',
            icon: '/emergency-icon.png'
          });
        }
      },
      
      onDistressDetected: (volume) => {
        // Triggered when volume exceeds 100
        console.log(`🔊 High volume detected: ${volume}`);
        alert(`Loud noise detected: ${Math.round(volume)}`);
      }
    });

    setDetector(soundDetector);

    // Cleanup on unmount
    return () => {
      soundDetector.stopListening();
    };
  }, []);

  const startListening = async () => {
    if (detector) {
      const success = await detector.startListening();
      if (success) {
        setIsListening(true);
        alert('🎤 Microphone active. Say "help" if you need assistance.');
      } else {
        alert('❌ Failed to access microphone');
      }
    }
  };

  const stopListening = () => {
    if (detector) {
      detector.stopListening();
      setIsListening(false);
    }
  };

  return (
    <div>
      <h2>Sound Detection</h2>
      {!isListening ? (
        <button onClick={startListening}>
          🎤 Start Listening
        </button>
      ) : (
        <button onClick={stopListening}>
          ⏹️ Stop Listening
        </button>
      )}
      <p>
        {isListening 
          ? '✅ Listening for "help" keyword and loud noises...' 
          : '⏸️ Not listening'}
      </p>
    </div>
  );
}
```

---

## Key Features

### ✅ "Help" Detection (NO Threshold!)

**What it does:**
- Listens continuously for "help" keyword
- **Works even when whispered softly**
- Checks multiple alternative transcriptions
- No volume requirement
- Auto-restarts if recognition stops

**Console Output:**
```
✅ Speech recognition started - detects "help" even when whispered!
🆘 HELP DETECTED (even whispered!): help me please
Confidence: 0.89
✅ Help alert sent to backend
```

**Backend Alert:**
```json
POST /api/voice-alert
{
  "type": "voice_help",
  "transcript": "help me please",
  "confidence": 0.9,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### ✅ Volume Threshold Detection (Threshold: 100)

**What it does:**
- Monitors audio volume every 100ms
- Triggers alert when volume > 100
- Independent from speech recognition
- Good for detecting screaming, panic

**Console Output:**
```
🔊 HIGH VOLUME DETECTED: 145 (Threshold: 100)
✅ Distress alert sent (Volume: 145)
```

**Backend Alert:**
```json
POST /api/voice-alert
{
  "type": "voice_distress",
  "volume": 145,
  "threshold": 100,
  "confidence": 0.85,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## Configuration Options

### Change Volume Threshold:
```typescript
const detector = new SoundDetector({
  volumeThreshold: 150  // Change from 100 to 150
});

// Or change it later:
detector.setVolumeThreshold(150);
```

### Custom Callbacks:
```typescript
const detector = new SoundDetector({
  onHelpDetected: () => {
    // Custom action when "help" detected
    sendEmergencyAlert();
    flashScreen();
    vibrate();
  },
  
  onDistressDetected: (volume) => {
    // Custom action for loud noises
    if (volume > 150) {
      sendUrgentAlert();
    }
  }
});
```

---

## Testing Guide

### Test "Help" Detection (Whisper Test):

1. **Start the detector**
2. **Whisper softly:** "help"
3. **Expected:** Alert triggers even at low volume
4. **Console shows:** `🆘 HELP DETECTED (even whispered!)`

### Test Volume Detection:

1. **Start the detector**
2. **Make loud noise** (clap, shout, bang)
3. **Expected:** Alert triggers if volume > 100
4. **Console shows:** `🔊 HIGH VOLUME DETECTED: 145`

---

## Browser Compatibility

### ✅ Supported:
- Chrome/Edge (best support)
- Safari 14.1+
- Opera

### ⚠️ Limited:
- Firefox (requires user gesture to start)

### ❌ Not Supported:
- Internet Explorer
- Older browsers

---

## Permissions Required

### Microphone Access:
```typescript
// Browser will prompt for permission
await detector.startListening();

// Check permission status:
const permission = await navigator.permissions.query({ name: 'microphone' });
console.log(permission.state); // 'granted', 'denied', or 'prompt'
```

### Notification Permission:
```typescript
if ('Notification' in window) {
  await Notification.requestPermission();
}
```

---

## Troubleshooting

### "Help" not detected when whispered:

**Solutions:**
1. Move closer to microphone
2. Speak clearly (even if softly)
3. Check microphone sensitivity in system settings
4. Try: "help me" or "help please" (more context helps)

### Volume threshold not triggering:

**Solutions:**
1. Lower threshold: `setVolumeThreshold(80)`
2. Check microphone volume settings
3. Make sure microphone is not muted
4. Test with: loud clap or shout

### Speech recognition stops:

**Solution:**
- Don't worry! It **auto-restarts** automatically
- Check console for: `🔄 Restarting speech recognition...`

---

## Performance Notes

- **CPU Usage:** Low (~2-5%)
- **Memory:** ~10-20 MB
- **Network:** Only when alerts sent
- **Battery:** Moderate impact on mobile

---

## Security & Privacy

### Data Handling:
- ❌ Audio is **NOT recorded**
- ❌ Transcripts **NOT stored** locally
- ✅ Only alerts sent to backend
- ✅ Microphone stops when page closed

### What Gets Sent:
- Transcript text (e.g., "help me")
- Volume level (number)
- Timestamp
- Alert type

### What's NOT Sent:
- Audio recordings
- User identity (add manually if needed)
- Location (add separately if needed)

---

## Advanced Usage

### With Participant Dashboard:

Add to `MobileParticipant.tsx`:

```typescript
useEffect(() => {
  const detector = new SoundDetector({
    volumeThreshold: 100,
    onHelpDetected: async () => {
      // Send to backend with participant info
      await fetch('/api/emergency-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'help_request',
          participant_id: localStorage.getItem('participantId'),
          location: await getCurrentLocation(),
          timestamp: new Date().toISOString()
        })
      });
    }
  });

  detector.startListening();
  return () => detector.stopListening();
}, []);
```

---

## Summary

| Feature | Threshold | Works For | Best Use |
|---------|-----------|-----------|----------|
| "Help" Detection | ❌ None | Whispers, normal speech, shouts | Explicit help requests |
| Volume Detection | ✅ 100 (configurable) | Loud noises only | Screaming, panic, chaos |

**Key Point:** Even if you **whisper "help"**, it will be detected! The volume threshold (100) only applies to general loud noise detection, NOT keyword detection.

---

For implementation details, see: `frontend/src/utils/soundDetection.ts`
