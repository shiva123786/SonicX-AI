import cv2
import requests

# Capture a frame from webcam
cap = cv2.VideoCapture(0)
ret, frame = cap.read()
cap.release()

if ret:
    # Save to file
    cv2.imwrite('test_frame.jpg', frame)
    print("✅ Frame captured and saved as test_frame.jpg")
    
    # Send to backend
    with open('test_frame.jpg', 'rb') as f:
        files = {'image': ('frame.jpg', f, 'image/jpeg')}
        response = requests.post('http://127.0.0.1:8000/api/camera/analyze', files=files)
        result = response.json()
        
    print("\n📊 Backend Response:")
    print(f"Status: {result.get('status')}")
    if 'analysis' in result:
        analysis = result['analysis']
        print(f"People Count: {analysis.get('people_count')}")
        print(f"Bounding Boxes: {len(analysis.get('bounding_boxes', []))}")
        print(f"Camera Status: {analysis.get('camera_status')}")
        print(f"Brightness: {analysis.get('brightness')}")
        print(f"Description: {analysis.get('description')}")
        if analysis.get('bounding_boxes'):
            print(f"\nBounding Boxes:")
            for i, box in enumerate(analysis['bounding_boxes']):
                print(f"  Box {i+1}: ({box['x1']}, {box['y1']}) to ({box['x2']}, {box['y2']}) - {box['confidence']}%")
else:
    print("❌ Failed to capture frame from webcam")
