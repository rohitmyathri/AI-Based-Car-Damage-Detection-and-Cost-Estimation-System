"""
Car Damage Detection and Repair Cost Estimation
Main Flask Application
"""

from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import os
from pymongo import MongoClient
from datetime import datetime
import uuid

# Import our custom modules
from utils.auth import login_required, init_auth
from utils.image_processor import process_uploaded_image, allowed_file
from utils.cost_estimator import estimate_repair_cost
from models.damage_detector import DamageDetector

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# MongoDB connection
MONGO_URI = "mongodb+srv://rohitmyathri:Rohit%401234@cluster0.mdki6dx.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client['car_damage_db']  # Database name - will be created automatically
users_collection = db['users']
analyses_collection = db['damage_analyses']

print("✅ Connected to MongoDB successfully!")
print(f"📊 Using database: {db.name}")

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize authentication
init_auth(app)

# Initialize ML model
print("🔄 Loading damage detection model...")
damage_detector = DamageDetector()

@app.route('/')
def index():
    """Home page - redirect to login if not authenticated"""
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """User login page"""
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        user = users_collection.find_one({'email': email})
        
        if user and check_password_hash(user['password'], password):
            session['user_id'] = str(user['_id'])
            session['user_email'] = user['email']
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password!', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    """User registration page"""
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        
        if password != confirm_password:
            flash('Passwords do not match!', 'error')
            return render_template('register.html')
        
        existing_user = users_collection.find_one({'email': email})
        
        if existing_user:
            flash('Email already registered!', 'error')
            return render_template('register.html')
        
        hashed_password = generate_password_hash(password)
        users_collection.insert_one({
            'email': email,
            'password': hashed_password,
            'created_at': datetime.now()
        })
        
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/logout')
def logout():
    """User logout"""
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    """Main dashboard after login"""
    return render_template('dashboard.html')

@app.route('/select_category', methods=['GET', 'POST'])
@login_required
def select_category():
    """Car category selection page"""
    if request.method == 'POST':
        category = request.form['category']
        session['car_category'] = category
        return redirect(url_for('upload_image'))
    
    return render_template('select_category.html')

@app.route('/upload_image', methods=['GET', 'POST'])
@login_required
def upload_image():
    """Image upload and processing page"""
    if 'car_category' not in session:
        flash('Please select a car category first.', 'warning')
        return redirect(url_for('select_category'))
    
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file selected!', 'error')
            return redirect(request.url)
        
        file = request.files['file']
        if file.filename == '':
            flash('No file selected!', 'error')
            return redirect(request.url)
        
        if file and allowed_file(file.filename):
            # Generate unique filename
            filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Process the image and get damage prediction
            try:
                damage_type, severity, confidence = damage_detector.detect_damage(filepath)
                
                # Calculate repair cost
                car_category = session['car_category']
                estimated_cost = estimate_repair_cost(car_category, damage_type, severity)
                
                # Save analysis to database
                result = analyses_collection.insert_one({
                    'user_id': session['user_id'],
                    'image_path': filename,
                    'car_category': car_category,
                    'damage_type': damage_type,
                    'severity': severity,
                    'confidence': confidence,
                    'estimated_cost': estimated_cost,
                    'created_at': datetime.now()
                })
                
                return redirect(url_for('results', analysis_id=str(result.inserted_id)))
                
            except Exception as e:
                flash(f'Error processing image: {str(e)}', 'error')
                os.remove(filepath)  # Clean up uploaded file
                return redirect(request.url)
        else:
            flash('Invalid file type! Please upload JPG, JPEG, or PNG files.', 'error')
    
    return render_template('upload_image.html', category=session.get('car_category'))

@app.route('/results/<analysis_id>')
@login_required
def results(analysis_id):
    """Display damage analysis results"""
    from bson.objectid import ObjectId
    
    try:
        analysis = analyses_collection.find_one({
            '_id': ObjectId(analysis_id),
            'user_id': session['user_id']
        })
    except:
        analysis = None
    
    if not analysis:
        flash('Analysis not found!', 'error')
        return redirect(url_for('dashboard'))
    
    return render_template('results.html', analysis=analysis)

@app.route('/history')
@login_required
def history():
    """View analysis history"""
    analyses = list(analyses_collection.find(
        {'user_id': session['user_id']}
    ).sort('created_at', -1))
    
    return render_template('history.html', analyses=analyses)

if __name__ == '__main__':
    print("🚗 Starting Car Damage Detection System...")
    print("📍 Open your browser and go to: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)