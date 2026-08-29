from ultralytics import YOLO
import torch, os, json

model_path = 'Model/best_model.pt'

print("=" * 60)
print("MODEL FILE CHECK")
print("=" * 60)
print(f"Exists: {os.path.exists(model_path)}")
print(f"Size: {round(os.path.getsize(model_path) / (1024*1024), 2)} MB")

# Load checkpoint
ckpt = torch.load(model_path, map_location='cpu', weights_only=False)

print("\n" + "=" * 60)
print("CHECKPOINT KEYS")
print("=" * 60)
if isinstance(ckpt, dict):
    print("Keys:", list(ckpt.keys()))
else:
    print("Type:", type(ckpt))

print("\n" + "=" * 60)
print("TRAINING DETAILS")
print("=" * 60)

if isinstance(ckpt, dict):
    if 'epoch' in ckpt:
        print(f"Trained Epochs: {ckpt['epoch']}")
    if 'best_fitness' in ckpt:
        print(f"Best Fitness (mAP50-95): {round(float(ckpt['best_fitness']), 4)}")
    if 'args' in ckpt:
        args = ckpt['args']
        print(f"Dataset: {args.get('data', 'N/A')}")
        print(f"Image Size: {args.get('imgsz', 'N/A')}")
        print(f"Batch Size: {args.get('batch', 'N/A')}")
        print(f"Total Epochs: {args.get('epochs', 'N/A')}")
        print(f"Optimizer: {args.get('optimizer', 'N/A')}")
        print(f"Model Base: {args.get('model', 'N/A')}")
    if 'date' in ckpt:
        print(f"Training Date: {ckpt['date']}")

print("\n" + "=" * 60)
print("MODEL CLASSES")
print("=" * 60)
model = YOLO(model_path)
print(f"Task: {model.task}")
print(f"Classes ({len(model.names)}): {model.names}")

print("\n" + "=" * 60)
print("VALIDATION METRICS (from checkpoint)")
print("=" * 60)
if isinstance(ckpt, dict) and 'train_args' in ckpt:
    print(ckpt['train_args'])

# Try to get val metrics
if isinstance(ckpt, dict):
    for key in ['metrics', 'val', 'results', 'fitness']:
        if key in ckpt:
            print(f"{key}: {ckpt[key]}")

print("\n" + "=" * 60)
print("RUN QUICK INFERENCE TEST")
print("=" * 60)

# Find a test image from uploads
test_images = []
uploads_dir = 'backend/uploads'
if os.path.exists(uploads_dir):
    files = os.listdir(uploads_dir)
    jpg_files = [f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    if jpg_files:
        test_images.append(os.path.join(uploads_dir, jpg_files[0]))

if test_images:
    img_path = test_images[0]
    print(f"Testing with: {os.path.basename(img_path)}")
    results = model(img_path, conf=0.25, verbose=False)
    for r in results:
        boxes = r.boxes
        print(f"Detections found: {len(boxes)}")
        for box in boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            print(f"  - {model.names[cls]}: {round(conf*100,1)}% confidence")
        if len(boxes) == 0:
            print("  No damage detected in this image")
else:
    print("No test images found in uploads/")

print("\n" + "=" * 60)
print("DONE")
print("=" * 60)
