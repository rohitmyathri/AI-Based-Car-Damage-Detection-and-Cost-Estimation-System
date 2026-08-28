"""
Check the classes in the trained YOLO model
"""
from ultralytics import YOLO

# Load the model
model = YOLO('train_results/content/runs/detect/train/weights/best.pt')

# Print model information
print("Model Classes:")
print(model.names)
print("\nNumber of classes:", len(model.names))
