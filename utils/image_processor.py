"""
Image processing utilities
"""
import os
from PIL import Image

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_uploaded_image(filepath, max_size=(800, 800)):
    """Process and resize uploaded image"""
    try:
        img = Image.open(filepath)
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        img.save(filepath)
        return True
    except Exception as e:
        print(f"Error processing image: {e}")
        return False
