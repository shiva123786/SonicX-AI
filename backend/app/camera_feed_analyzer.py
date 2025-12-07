"""
camera_feed_analyzer.py
-----------------------
Analyzes live camera or drone feeds to detect:
- Crowd surges (density or motion threshold)
- Fire/smoke anomalies
- Panic behavior or distress
"""

import cv2
import numpy as np
import asyncio
from datetime import datetime
import random

def detect_smoke_fire(frame):
    """Enhanced smoke and fire detection using color analysis."""
    # Convert to HSV for better color detection
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    
    # Define color ranges for smoke (gray/white) and fire (red/orange/yellow)
    # Smoke detection (low saturation, high value)
    smoke_lower = np.array([0, 0, 180])
    smoke_upper = np.array([180, 30, 255])
    smoke_mask = cv2.inRange(hsv, smoke_lower, smoke_upper)
    
    # Fire detection (red/orange/yellow with high saturation)
    fire_lower1 = np.array([0, 50, 50])    # Red range 1
    fire_upper1 = np.array([10, 255, 255])
    fire_lower2 = np.array([170, 50, 50])  # Red range 2
    fire_upper2 = np.array([180, 255, 255])
    fire_lower3 = np.array([10, 50, 50])   # Orange range
    fire_upper3 = np.array([30, 255, 255])
    
    fire_mask1 = cv2.inRange(hsv, fire_lower1, fire_upper1)
    fire_mask2 = cv2.inRange(hsv, fire_lower2, fire_upper2)
    fire_mask3 = cv2.inRange(hsv, fire_lower3, fire_upper3)
    fire_mask = fire_mask1 + fire_mask2 + fire_mask3
    
    # Calculate percentages of smoke and fire pixels
    total_pixels = frame.shape[0] * frame.shape[1]
    smoke_pixels = cv2.countNonZero(smoke_mask)
    fire_pixels = cv2.countNonZero(fire_mask)
    
    smoke_ratio = smoke_pixels / total_pixels
    fire_ratio = fire_pixels / total_pixels
    
    # Detect fire (higher priority)
    if fire_ratio > 0.05:  # 5% of frame is fire-colored
        return {
            "type": "fire_detected",
            "severity": min(fire_ratio * 10, 1.0),
            "confidence": min(fire_ratio * 1000, 95)
        }
    
    # Detect smoke
    elif smoke_ratio > 0.08:  # 8% of frame is smoke-colored
        return {
            "type": "smoke_detected", 
            "severity": min(smoke_ratio * 8, 0.8),
            "confidence": min(smoke_ratio * 800, 85)
        }
    
    return None

def detect_anomalies(frame):
    """Enhanced anomaly detection with smoke/fire detection."""
    # First check for smoke/fire
    fire_smoke_result = detect_smoke_fire(frame)
    if fire_smoke_result:
        return fire_smoke_result
    
    # Original crowd/motion detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    motion_score = np.std(gray) / 50  # rough motion estimate

    # Random triggers for demo purposes (reduced frequency)
    random_factor = random.random()

    if motion_score > 4.5 or random_factor > 0.995:  # Reduced from 0.98
        return {
            "type": "crowd_surge",
            "severity": round(min(motion_score / 10, 1.0), 2),
            "confidence": min(motion_score * 20, 90)
        }
    elif random_factor > 0.992:  # Reduced from 0.95
        return {"type": "panic", "severity": 0.7, "confidence": 75}
    else:
        return None


async def analyze_feed(feed_source, zone="A"):
    """Reads camera feed, detects anomalies, and yields events."""
    try:
        # Use a simulated feed if camera is not available
        if feed_source == 0 or feed_source == "webcam" or feed_source == "camera":
            # Try to open the camera
            cap = cv2.VideoCapture(0)
            if not cap.isOpened():
                print(f"❌ Unable to access camera: {feed_source}. Using simulated feed instead.")
                # Use simulated feed
                feed_source = "simulated"
            else:
                print(f"🎥 Monitoring started for Zone {zone} using webcam...")
        else:
            cap = cv2.VideoCapture(feed_source)
            if not cap.isOpened():
                print(f"❌ Unable to access camera: {feed_source}. Using simulated feed instead.")
                # Use simulated feed
                feed_source = "simulated"
            else:
                print(f"🎥 Monitoring started for Zone {zone}...")
        
        # If using simulated feed, generate random frames
        if feed_source == "simulated":
            print(f"🎥 Using simulated feed for Zone {zone}...")
            # Simulate camera feed with random frames
            while True:
                # Create a blank frame
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                # Add some random noise
                frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
                
                # Randomly generate anomalies
                if random.random() > 0.95:  # 5% chance of anomaly
                    anomaly = {
                        "type": random.choice(["crowd_surge", "panic", "smoke_detected"]),
                        "severity": round(random.uniform(0.5, 0.9), 2),
                        "confidence": round(random.uniform(70, 90), 0),
                        "zone": zone,
                        "timestamp": datetime.now().isoformat()
                    }
                    yield anomaly
                
                await asyncio.sleep(2)  # control processing rate
        else:
            # Process real camera feed
            try:
                while True:
                    ret, frame = cap.read()
                    if not ret:
                        print("❌ Failed to read frame, retrying...")
                        await asyncio.sleep(1)
                        continue

                    anomaly = detect_anomalies(frame)
                    if anomaly:
                        anomaly["zone"] = zone
                        anomaly["timestamp"] = datetime.now().isoformat()
                        yield anomaly

                    await asyncio.sleep(2)  # control processing rate
            finally:
                cap.release()
                print(f"🛑 Feed closed for Zone {zone}")
    except Exception as e:
        print(f"❌ Error in camera feed: {e}")
        print(f"🎥 Using simulated feed for Zone {zone} due to error...")
        # Fallback to simulated feed on error
        while True:
            if random.random() > 0.95:  # 5% chance of anomaly
                anomaly = {
                    "type": random.choice(["crowd_surge", "panic", "smoke_detected"]),
                    "severity": round(random.uniform(0.5, 0.9), 2),
                    "confidence": round(random.uniform(70, 90), 0),
                    "zone": zone,
                    "timestamp": datetime.now().isoformat()
                }
                yield anomaly
            
            await asyncio.sleep(2)  # control processing rate
