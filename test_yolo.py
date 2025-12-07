print("Testing YOLO import and initialization...", flush=True)

try:
    from ultralytics import YOLO
    print("✅ ultralytics imported successfully", flush=True)
    
    model = YOLO('yolov8n.pt')
    print("✅ YOLO model loaded successfully!", flush=True)
    print(f"Model type: {type(model)}", flush=True)
    
    # Test detection on a simple image
    import numpy as np
    test_img = np.zeros((640, 640, 3), dtype=np.uint8)
    results = model(test_img, verbose=False)
    print(f"✅ YOLO inference works! Results: {len(results)}", flush=True)
    
except Exception as e:
    print(f"❌ Error: {e}", flush=True)
    import traceback
    traceback.print_exc()
