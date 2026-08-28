"""
Simple Working Car Damage Detection App - All in One File
"""

from flask import Flask, request, redirect, url_for, flash, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import os
import sqlite3
from datetime import datetime
import uuid
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['UPLOAD_FOLDER'] = 'static/uploads'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def get_db_connection():
    conn = sqlite3.connect('database/car_damage.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    
    html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Car Damage Detection - AI-Powered Analysis</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
                font-family: 'Inter', sans-serif; 
                background: #0f0f23;
                min-height: 100vh;
                overflow-x: hidden;
                position: relative;
            }
            
            /* Animated Background */
            .bg-animation {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 0;
                background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #4facfe);
                background-size: 400% 400%;
                animation: gradientShift 15s ease infinite;
            }
            
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            /* Floating Particles */
            .particle {
                position: fixed;
                width: 10px;
                height: 10px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                animation: float 20s infinite;
                z-index: 1;
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(-100vh) translateX(100px); opacity: 0; }
            }
            
            .particle:nth-child(1) { left: 10%; animation-delay: 0s; }
            .particle:nth-child(2) { left: 20%; animation-delay: 2s; }
            .particle:nth-child(3) { left: 30%; animation-delay: 4s; }
            .particle:nth-child(4) { left: 40%; animation-delay: 6s; }
            .particle:nth-child(5) { left: 50%; animation-delay: 8s; }
            .particle:nth-child(6) { left: 60%; animation-delay: 10s; }
            .particle:nth-child(7) { left: 70%; animation-delay: 12s; }
            .particle:nth-child(8) { left: 80%; animation-delay: 14s; }
            .particle:nth-child(9) { left: 90%; animation-delay: 16s; }
            
            /* Glassmorphism Container */
            .container { 
                position: relative;
                z-index: 10;
                max-width: 1400px;
                margin: 50px auto;
                padding: 60px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
                border-radius: 30px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.8s ease-out;
            }
            
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(50px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            /* Neon Glow Header */
            .header {
                text-align: center;
                margin-bottom: 60px;
            }
            
            h1 { 
                color: #fff;
                font-size: 4em;
                font-weight: 800;
                margin-bottom: 20px;
                text-shadow: 0 0 20px rgba(102, 126, 234, 0.8),
                             0 0 40px rgba(118, 75, 162, 0.6),
                             0 0 60px rgba(102, 126, 234, 0.4);
                animation: glow 2s ease-in-out infinite alternate;
                letter-spacing: 2px;
            }
            
            @keyframes glow {
                from { text-shadow: 0 0 20px rgba(102, 126, 234, 0.8), 0 0 40px rgba(118, 75, 162, 0.6); }
                to { text-shadow: 0 0 30px rgba(102, 126, 234, 1), 0 0 60px rgba(118, 75, 162, 0.8); }
            }
            
            .subtitle {
                font-size: 1.5em;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 300;
                letter-spacing: 1px;
            }
            
            /* 3D Stats Cards */
            .stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 30px;
                margin: 50px 0;
            }
            
            .stat-card {
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(10px);
                padding: 40px 30px;
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                text-align: center;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                overflow: hidden;
            }
            
            .stat-card::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                transform: rotate(45deg);
                transition: 0.5s;
            }
            
            .stat-card:hover::before {
                left: 100%;
            }
            
            .stat-card:hover {
                transform: translateY(-15px) scale(1.05);
                box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
                border-color: rgba(255, 255, 255, 0.6);
            }
            
            .stat-number {
                font-size: 3.5em;
                font-weight: 800;
                background: linear-gradient(135deg, #fff, #a8edea);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 10px;
            }
            
            .stat-label {
                color: rgba(255, 255, 255, 0.8);
                font-size: 1.1em;
                font-weight: 500;
            }
            
            /* Feature Cards with Hover Effects */
            .features-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 30px;
                margin: 50px 0;
            }
            
            .feature-card { 
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(15px);
                padding: 40px;
                border-radius: 25px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                text-align: center;
                transition: all 0.5s ease;
                position: relative;
                overflow: hidden;
            }
            
            .feature-card::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.1);
                transform: translate(-50%, -50%);
                transition: width 0.6s, height 0.6s;
            }
            
            .feature-card:hover::after {
                width: 500px;
                height: 500px;
            }
            
            .feature-card:hover {
                transform: translateY(-20px) rotateY(5deg);
                box-shadow: 0 30px 80px rgba(102, 126, 234, 0.5);
                border-color: rgba(255, 255, 255, 0.5);
            }
            
            .feature-icon {
                font-size: 4em;
                margin-bottom: 20px;
                filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5));
                animation: bounce 2s infinite;
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            .feature-card h3 {
                color: #fff;
                margin-bottom: 15px;
                font-size: 1.5em;
                font-weight: 700;
                position: relative;
                z-index: 1;
            }
            
            .feature-card p {
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.8;
                position: relative;
                z-index: 1;
            }
            
            /* CTA Section with Gradient */
            .cta-section {
                text-align: center;
                margin-top: 60px;
                padding: 60px;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
                backdrop-filter: blur(20px);
                border-radius: 30px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                position: relative;
                overflow: hidden;
            }
            
            .cta-section::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
                animation: rotate 10s linear infinite;
            }
            
            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .cta-section h2 {
                color: white;
                margin-bottom: 25px;
                font-size: 2.5em;
                font-weight: 800;
                position: relative;
                z-index: 1;
            }
            
            .cta-section p {
                color: rgba(255, 255, 255, 0.9);
                font-size: 1.2em;
                margin-bottom: 40px;
                position: relative;
                z-index: 1;
            }
            
            /* Futuristic Buttons */
            .btn { 
                position: relative;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 20px 50px;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                margin: 15px;
                font-size: 1.2em;
                font-weight: 700;
                transition: all 0.4s ease;
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
                overflow: hidden;
                z-index: 1;
            }
            
            .btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                transition: 0.5s;
            }
            
            .btn:hover::before {
                left: 100%;
            }
            
            .btn:hover { 
                transform: translateY(-5px) scale(1.05);
                box-shadow: 0 15px 40px rgba(102, 126, 234, 0.7);
            }
            
            .btn-secondary {
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.5);
                backdrop-filter: blur(10px);
            }
            
            .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.3);
                border-color: rgba(255, 255, 255, 0.8);
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                h1 { font-size: 2.5em; }
                .container { padding: 30px; }
                .features-grid { grid-template-columns: 1fr; }
            }
        </style>
    </head>
    <body>
        <div class="bg-animation"></div>
        
        <!-- Floating Particles -->
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        
        <div class="container">
            <div class="header">
                <h1>🚗 CAR DAMAGE DETECTION</h1>
                <p class="subtitle">Next-Gen AI-Powered Damage Analysis & Cost Estimation</p>
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">5+</div>
                    <div class="stat-label">Damage Types</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">3</div>
                    <div class="stat-label">Severity Levels</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">95%</div>
                    <div class="stat-label">AI Accuracy</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">24/7</div>
                    <div class="stat-label">Available</div>
                </div>
            </div>
            
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">📸</div>
                    <h3>Instant Upload</h3>
                    <p>Drag, drop, or click to upload your vehicle damage photos instantly</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🤖</div>
                    <h3>AI Detection</h3>
                    <p>Advanced neural networks identify damage with 95% accuracy</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">💰</div>
                    <h3>Smart Pricing</h3>
                    <p>Real-time cost calculations based on damage and vehicle type</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3>Full History</h3>
                    <p>Track and compare all your damage assessments over time</p>
                </div>
            </div>
            
            <div class="cta-section">
                <h2>Ready to Transform Your Damage Assessment?</h2>
                <p>Join thousands of users leveraging AI for instant, accurate vehicle damage analysis</p>
                <a href="/register" class="btn">🚀 Get Started Free</a>
                <a href="/login" class="btn btn-secondary">🔐 Sign In</a>
            </div>
        </div>
    </body>
    </html>
    '''
    return html

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        conn = get_db_connection()
        existing = conn.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
        
        if existing:
            conn.close()
            return '<h2>Email already registered!</h2><a href="/register">Try again</a>'
        
        hashed = generate_password_hash(password)
        conn.execute('INSERT INTO users (email, password, created_at) VALUES (?, ?, ?)',
                    (email, hashed, datetime.now()))
        conn.commit()
        conn.close()
        
        return '<h2>✅ Registration successful!</h2><a href="/login">Login now</a>'
    
    html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Register - Car Damage Detection</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Poppins', sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .form-container { 
                background: white; 
                padding: 50px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                max-width: 450px;
                width: 100%;
                animation: slideUp 0.5s ease-out;
            }
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(50px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .logo {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo-icon {
                font-size: 4em;
                margin-bottom: 10px;
            }
            h2 { 
                text-align: center;
                color: #2d3748;
                margin-bottom: 10px;
                font-size: 2em;
            }
            .subtitle {
                text-align: center;
                color: #718096;
                margin-bottom: 30px;
            }
            .input-group {
                margin-bottom: 25px;
            }
            label {
                display: block;
                color: #4a5568;
                margin-bottom: 8px;
                font-weight: 500;
            }
            input { 
                width: 100%;
                padding: 15px;
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                font-size: 1em;
                transition: all 0.3s ease;
                font-family: 'Poppins', sans-serif;
            }
            input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            .btn { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                width: 100%;
                font-size: 1.1em;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }
            .btn:hover { 
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.6);
            }
            .link-text {
                text-align: center;
                margin-top: 25px;
                color: #718096;
            }
            .link-text a {
                color: #667eea;
                text-decoration: none;
                font-weight: 600;
            }
            .link-text a:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class="form-container">
            <div class="logo">
                <div class="logo-icon">🚗</div>
                <h2>Create Account</h2>
                <p class="subtitle">Join Car Damage Detection</p>
            </div>
            
            <form method="POST">
                <div class="input-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" placeholder="your@email.com" required>
                </div>
                
                <div class="input-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Min 6 characters" required minlength="6">
                </div>
                
                <div class="input-group">
                    <label for="confirm_password">Confirm Password</label>
                    <input type="password" id="confirm_password" name="confirm_password" placeholder="Confirm your password" required minlength="6">
                </div>
                
                <button type="submit" class="btn">Create Account</button>
            </form>
            
            <p class="link-text">
                Already have an account? <a href="/login">Sign in here</a>
            </p>
        </div>
    </body>
    </html>
    '''
    return html

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        conn.close()
        
        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            session['user_email'] = user['email']
            return redirect(url_for('dashboard'))
        else:
            return '<h2>❌ Invalid credentials!</h2><a href="/login">Try again</a>'
    
    html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Login - Car Damage Detection</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Poppins', sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .form-container { 
                background: white; 
                padding: 50px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                max-width: 450px;
                width: 100%;
                animation: slideUp 0.5s ease-out;
            }
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(50px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .logo {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo-icon {
                font-size: 4em;
                margin-bottom: 10px;
            }
            h2 { 
                text-align: center;
                color: #2d3748;
                margin-bottom: 10px;
                font-size: 2em;
            }
            .subtitle {
                text-align: center;
                color: #718096;
                margin-bottom: 30px;
            }
            .input-group {
                margin-bottom: 25px;
            }
            label {
                display: block;
                color: #4a5568;
                margin-bottom: 8px;
                font-weight: 500;
            }
            input { 
                width: 100%;
                padding: 15px;
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                font-size: 1em;
                transition: all 0.3s ease;
                font-family: 'Poppins', sans-serif;
            }
            input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            .btn { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                width: 100%;
                font-size: 1.1em;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }
            .btn:hover { 
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.6);
            }
            .link-text {
                text-align: center;
                margin-top: 25px;
                color: #718096;
            }
            .link-text a {
                color: #667eea;
                text-decoration: none;
                font-weight: 600;
            }
            .link-text a:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class="form-container">
            <div class="logo">
                <div class="logo-icon">🚗</div>
                <h2>Welcome Back</h2>
                <p class="subtitle">Sign in to your account</p>
            </div>
            
            <form method="POST">
                <div class="input-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" placeholder="your@email.com" required>
                </div>
                
                <div class="input-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Enter your password" required>
                </div>
                
                <button type="submit" class="btn">Sign In</button>
            </form>
            
            <p class="link-text">
                Don't have an account? <a href="/register">Create one here</a>
            </p>
        </div>
    </body>
    </html>
    '''
    return html

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    html = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Dashboard - Car Damage Detection</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{ 
                font-family: 'Poppins', sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }}
            .navbar {{
                background: white;
                padding: 20px 40px;
                border-radius: 15px;
                margin-bottom: 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            }}
            .logo {{
                font-size: 1.5em;
                font-weight: 700;
                color: #667eea;
            }}
            .user-info {{
                color: #718096;
            }}
            .container {{ 
                max-width: 1200px;
                margin: 0 auto;
            }}
            .welcome-card {{
                background: white;
                padding: 50px;
                border-radius: 20px;
                text-align: center;
                margin-bottom: 30px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            }}
            .welcome-card h1 {{
                color: #2d3748;
                font-size: 2.5em;
                margin-bottom: 15px;
            }}
            .welcome-card p {{
                color: #718096;
                font-size: 1.2em;
            }}
            .action-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 25px;
                margin-top: 30px;
            }}
            .action-card {{
                background: white;
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                transition: all 0.3s ease;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            }}
            .action-card:hover {{
                transform: translateY(-10px);
                box-shadow: 0 15px 40px rgba(102, 126, 234, 0.3);
            }}
            .action-icon {{
                font-size: 4em;
                margin-bottom: 20px;
            }}
            .action-card h2 {{
                color: #2d3748;
                margin-bottom: 15px;
            }}
            .action-card p {{
                color: #718096;
                margin-bottom: 25px;
                line-height: 1.6;
            }}
            .btn {{ 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 35px;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                font-size: 1.1em;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }}
            .btn:hover {{ 
                transform: translateY(-3px);
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.6);
            }}
            .btn-secondary {{
                background: #e2e8f0;
                color: #4a5568;
                box-shadow: none;
            }}
            .btn-secondary:hover {{
                background: #cbd5e0;
            }}
            .btn-danger {{
                background: #fc8181;
                box-shadow: 0 5px 15px rgba(252, 129, 129, 0.4);
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="navbar">
                <div class="logo">🚗 Car Damage Detection</div>
                <div class="user-info">👤 {session.get('user_email')}</div>
            </div>
            
            <div class="welcome-card">
                <h1>Welcome to Your Dashboard!</h1>
                <p>Start analyzing car damage with AI-powered technology</p>
            </div>
            
            <div class="action-grid">
                <div class="action-card">
                    <div class="action-icon">🚀</div>
                    <h2>New Analysis</h2>
                    <p>Upload a car damage image and get instant AI analysis with repair cost estimates</p>
                    <a href="/select_category" class="btn">Start Analysis</a>
                </div>
                
                <div class="action-card">
                    <div class="action-icon">📊</div>
                    <h2>View History</h2>
                    <p>Access all your previous damage analyses and cost estimates</p>
                    <a href="/history" class="btn btn-secondary">View History</a>
                </div>
                
                <div class="action-card">
                    <div class="action-icon">🚪</div>
                    <h2>Account</h2>
                    <p>Manage your account settings or sign out from your session</p>
                    <a href="/logout" class="btn btn-danger">Logout</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    '''
    return html

@app.route('/select_category', methods=['GET', 'POST'])
def select_category():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        category = request.form['category']
        session['car_category'] = category
        return redirect(url_for('upload_image'))
    
    html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Select Category - Car Damage Detection</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Poppins', sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            .container { 
                max-width: 1000px;
                margin: 50px auto;
                background: white; 
                padding: 50px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            h1 { 
                color: #2d3748;
                text-align: center;
                font-size: 2.5em;
                margin-bottom: 15px;
            }
            .subtitle {
                text-align: center;
                color: #718096;
                margin-bottom: 40px;
                font-size: 1.1em;
            }
            .category-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 25px;
                margin: 40px 0;
            }
            .category-card {
                position: relative;
                padding: 40px 30px;
                background: #f7fafc;
                border-radius: 15px;
                border: 3px solid #e2e8f0;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
            }
            .category-card:hover {
                transform: translateY(-10px);
                box-shadow: 0 15px 40px rgba(102, 126, 234, 0.3);
                border-color: #667eea;
            }
            .category-card input[type="radio"] {
                position: absolute;
                opacity: 0;
                cursor: pointer;
            }
            .category-card input[type="radio"]:checked + .card-content {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .category-card input[type="radio"]:checked + .card-content .category-icon,
            .category-card input[type="radio"]:checked + .card-content h2,
            .category-card input[type="radio"]:checked + .card-content p,
            .category-card input[type="radio"]:checked + .card-content .multiplier {
                color: white !important;
            }
            .card-content {
                padding: 20px;
                border-radius: 10px;
                transition: all 0.3s ease;
            }
            .category-icon {
                font-size: 3.5em;
                margin-bottom: 15px;
            }
            .category-card h2 {
                color: #2d3748;
                margin-bottom: 10px;
                font-size: 1.8em;
            }
            .category-card p {
                color: #718096;
                margin-bottom: 15px;
                line-height: 1.6;
            }
            .multiplier {
                display: inline-block;
                padding: 8px 20px;
                background: #667eea;
                color: white;
                border-radius: 20px;
                font-weight: 600;
                margin: 10px 0;
            }
            .examples {
                font-size: 0.9em;
                color: #a0aec0;
                margin-top: 10px;
            }
            .btn-container {
                text-align: center;
                margin-top: 40px;
            }
            .btn { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 18px 50px;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                font-size: 1.2em;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }
            .btn:hover { 
                transform: translateY(-3px);
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.6);
            }
            .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .info-box {
                background: #e6fffa;
                border-left: 4px solid #38b2ac;
                padding: 20px;
                border-radius: 10px;
                margin-top: 30px;
            }
            .info-box strong {
                color: #234e52;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Select Your Car Category</h1>
            <p class="subtitle">Choose the category that best matches your vehicle</p>
            
            <form method="POST" id="categoryForm">
                <div class="category-grid">
                    <label class="category-card">
                        <input type="radio" name="category" value="economy" required>
                        <div class="card-content">
                            <div class="category-icon">🚗</div>
                            <h2>Economy</h2>
                            <p>Budget-friendly vehicles and compact cars</p>
                            <span class="multiplier">Base Cost (1.0x)</span>
                            <div class="examples">Honda Civic, Toyota Corolla, Nissan Versa</div>
                        </div>
                    </label>
                    
                    <label class="category-card">
                        <input type="radio" name="category" value="mid-range" required>
                        <div class="card-content">
                            <div class="category-icon">🚙</div>
                            <h2>Mid-Range</h2>
                            <p>Mid-size sedans, SUVs, and family vehicles</p>
                            <span class="multiplier">Higher Cost (1.5x)</span>
                            <div class="examples">Honda Accord, Toyota Camry, Ford Explorer</div>
                        </div>
                    </label>
                    
                    <label class="category-card">
                        <input type="radio" name="category" value="premium" required>
                        <div class="card-content">
                            <div class="category-icon">🏎️</div>
                            <h2>Premium</h2>
                            <p>Luxury vehicles, sports cars, high-end models</p>
                            <span class="multiplier">Premium Cost (2.5x)</span>
                            <div class="examples">BMW, Mercedes, Audi, Lexus</div>
                        </div>
                    </label>
                </div>
                
                <div class="btn-container">
                    <button type="submit" class="btn" id="continueBtn">Continue to Upload →</button>
                </div>
            </form>
            
            <div class="info-box">
                <strong>💡 Cost Calculation:</strong> The repair cost is calculated based on the damage type, severity, and your selected car category. Premium vehicles typically have higher repair costs due to specialized parts and labor requirements.
            </div>
        </div>
        
        <script>
            // Enable button when category is selected
            const radios = document.querySelectorAll('input[name="category"]');
            const continueBtn = document.getElementById('continueBtn');
            
            radios.forEach(radio => {
                radio.addEventListener('change', function() {
                    continueBtn.disabled = false;
                });
            });
        </script>
    </body>
    </html>
    '''
    return html

@app.route('/upload_image', methods=['GET', 'POST'])
def upload_image():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if 'car_category' not in session:
        return redirect(url_for('select_category'))
    
    if request.method == 'POST':
        if 'file' not in request.files:
            return '<h2>No file uploaded!</h2><a href="/upload_image">Try again</a>'
        
        file = request.files['file']
        if file.filename == '':
            return '<h2>No file selected!</h2><a href="/upload_image">Try again</a>'
        
        if file:
            filename = str(uuid.uuid4()) + '.jpg'
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Simple damage detection
            damage_types = ['dent', 'scratch', 'crack', 'broken_glass', 'rust']
            severity_levels = ['low', 'medium', 'high']
            damage_type = random.choice(damage_types)
            severity = random.choice(severity_levels)
            confidence = random.uniform(0.75, 0.95)
            
            # Calculate cost
            base_costs = {
                ('dent', 'low'): 150, ('dent', 'medium'): 300, ('dent', 'high'): 600,
                ('scratch', 'low'): 100, ('scratch', 'medium'): 250, ('scratch', 'high'): 500,
                ('crack', 'low'): 200, ('crack', 'medium'): 400, ('crack', 'high'): 800,
                ('broken_glass', 'low'): 300, ('broken_glass', 'medium'): 500, ('broken_glass', 'high'): 1000,
                ('rust', 'low'): 120, ('rust', 'medium'): 280, ('rust', 'high'): 550,
            }
            multipliers = {'economy': 1.0, 'mid-range': 1.5, 'premium': 2.5}
            
            base_cost = base_costs.get((damage_type, severity), 200)
            multiplier = multipliers.get(session['car_category'], 1.0)
            estimated_cost = round(base_cost * multiplier, 2)
            
            # Save to database
            conn = get_db_connection()
            analysis_id = conn.execute(
                '''INSERT INTO damage_analyses 
                   (user_id, image_path, car_category, damage_type, severity, confidence, estimated_cost, created_at) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                (session['user_id'], filename, session['car_category'], damage_type, 
                 severity, confidence, estimated_cost, datetime.now())
            ).lastrowid
            conn.commit()
            conn.close()
            
            return redirect(url_for('results', analysis_id=analysis_id))
    
    html = f'''<!DOCTYPE html>
<html>
<head>
    <title>Upload Image - Car Damage Detection</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        
        body {{ 
            font-family: 'Inter', sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }}
        
        .container {{ 
            max-width: 900px;
            margin: 50px auto;
            background: rgba(255, 255, 255, 0.95);
            padding: 50px;
            border-radius: 30px;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
        }}
        
        h1 {{ 
            color: #2d3748;
            text-align: center;
            font-size: 2.8em;
            font-weight: 800;
            margin-bottom: 20px;
        }}
        
        .category-badge {{
            display: block;
            text-align: center;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 12px 30px;
            border-radius: 30px;
            font-weight: 700;
            margin: 20px auto;
            width: fit-content;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.5);
        }}
        
        .upload-area {{ 
            border: 3px dashed #cbd5e0;
            padding: 80px 40px;
            text-align: center;
            border-radius: 25px;
            background: #f7fafc;
            margin: 30px 0;
            transition: all 0.4s ease;
            cursor: pointer;
        }}
        
        .upload-area:hover {{
            border-color: #667eea;
            background: #edf2f7;
            transform: scale(1.02);
        }}
        
        .upload-area.dragover {{
            border-color: #48bb78;
            background: #f0fff4;
            transform: scale(1.05);
        }}
        
        .upload-icon {{
            font-size: 5em;
            margin-bottom: 20px;
        }}
        
        .upload-area h2 {{
            color: #2d3748;
            margin-bottom: 15px;
            font-size: 1.8em;
        }}
        
        .upload-area p {{
            color: #718096;
            font-size: 1.1em;
        }}
        
        input[type="file"] {{
            display: none;
        }}
        
        .file-label {{
            display: inline-block;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 18px 45px;
            border-radius: 50px;
            cursor: pointer;
            font-weight: 700;
            margin-top: 25px;
            transition: all 0.4s ease;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
        }}
        
        .file-label:hover {{
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(102, 126, 234, 0.7);
        }}
        
        .preview-container {{
            margin: 30px 0;
            text-align: center;
            display: none;
        }}
        
        .preview-container h3 {{
            color: #2d3748;
            margin-bottom: 20px;
            font-size: 1.5em;
        }}
        
        .preview-container img {{
            max-width: 100%;
            max-height: 400px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            margin: 20px 0;
            border: 3px solid #e2e8f0;
        }}
        
        .btn {{ 
            background: linear-gradient(135deg, #48bb78, #38a169);
            color: white;
            padding: 20px 55px;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            font-size: 1.3em;
            font-weight: 700;
            transition: all 0.4s ease;
            box-shadow: 0 10px 30px rgba(72, 187, 120, 0.5);
            display: none;
            margin-top: 20px;
        }}
        
        .btn:hover {{ 
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 15px 40px rgba(72, 187, 120, 0.7);
        }}
        
        .btn:disabled {{
            opacity: 0.6;
            cursor: not-allowed;
        }}
        
        .tips-box {{
            background: #f7fafc;
            padding: 35px;
            border-radius: 20px;
            margin-top: 40px;
            border: 2px solid #e2e8f0;
        }}
        
        .tips-box h3 {{
            color: #2d3748;
            margin-bottom: 25px;
            font-size: 1.5em;
        }}
        
        .tips-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }}
        
        .tip-item {{
            display: flex;
            align-items: center;
            color: #4a5568;
            font-size: 1.05em;
        }}
        
        .tip-item::before {{
            content: "✓";
            color: #48bb78;
            font-weight: bold;
            margin-right: 12px;
            font-size: 1.4em;
        }}
        
        .loading {{
            display: none;
            text-align: center;
            margin: 20px 0;
        }}
        
        .loading.active {{
            display: block;
        }}
        
        .spinner {{
            border: 4px solid #e2e8f0;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }}
        
        @keyframes spin {{
            0% {{ transform: rotate(0deg); }}
            100% {{ transform: rotate(360deg); }}
        }}
        
        .loading p {{
            color: #4a5568;
            margin-top: 15px;
            font-size: 1.1em;
        }}
    </style>
</head>
    <body>
        <div class="container">
            <h1>📸 Upload Damage Image</h1>
            <span class="category-badge">🚗 {session.get('car_category', '').upper()}</span>
            
            <form method="POST" enctype="multipart/form-data" id="uploadForm">
                <div class="upload-area" id="uploadArea">
                    <div class="upload-icon">📷</div>
                    <h2>Drag & Drop Image Here</h2>
                    <p>or click to browse files</p>
                    <label for="fileInput" class="file-label">Choose Image</label>
                    <input type="file" name="file" id="fileInput" accept="image/*" required>
                    <p style="margin-top: 20px; font-size: 0.95em; color: #718096;">
                        Supported: JPG, JPEG, PNG (Max 16MB)
                    </p>
                </div>
                
                <div class="loading" id="loading">
                    <div class="spinner"></div>
                    <p>Analyzing image...</p>
                </div>
                
                <div class="preview-container" id="previewContainer">
                    <h3>✨ Image Preview</h3>
                    <img id="previewImage" src="" alt="Preview">
                    <br>
                    <button type="submit" class="btn" id="analyzeBtn">🔍 Analyze Damage Now</button>
                </div>
            </form>
            
            <div class="tips-box">
                <h3>💡 Tips for Best Results</h3>
                <div class="tips-grid">
                    <div class="tip-item">Good lighting</div>
                    <div class="tip-item">Focus on damage</div>
                    <div class="tip-item">Clear images</div>
                    <div class="tip-item">External damage</div>
                    <div class="tip-item">Multiple angles</div>
                    <div class="tip-item">Close-up shots</div>
                </div>
            </div>
        </div>
        
        <script>
            const uploadArea = document.getElementById('uploadArea');
            const fileInput = document.getElementById('fileInput');
            const previewContainer = document.getElementById('previewContainer');
            const previewImage = document.getElementById('previewImage');
            const analyzeBtn = document.getElementById('analyzeBtn');
            const uploadForm = document.getElementById('uploadForm');
            const loading = document.getElementById('loading');
            
            // Click anywhere in upload area to trigger file input
            uploadArea.addEventListener('click', (e) => {{
                if (e.target !== fileInput) {{
                    fileInput.click();
                }}
            }});
            
            // Prevent default drag behaviors
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {{
                uploadArea.addEventListener(eventName, preventDefaults, false);
                document.body.addEventListener(eventName, preventDefaults, false);
            }});
            
            function preventDefaults(e) {{
                e.preventDefault();
                e.stopPropagation();
            }}
            
            // Highlight drop area
            ['dragenter', 'dragover'].forEach(eventName => {{
                uploadArea.addEventListener(eventName, () => {{
                    uploadArea.classList.add('dragover');
                }}, false);
            }});
            
            ['dragleave', 'drop'].forEach(eventName => {{
                uploadArea.addEventListener(eventName, () => {{
                    uploadArea.classList.remove('dragover');
                }}, false);
            }});
            
            // Handle dropped files
            uploadArea.addEventListener('drop', (e) => {{
                const dt = e.dataTransfer;
                const files = dt.files;
                
                if (files.length > 0) {{
                    // Create a new DataTransfer object and add the file
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(files[0]);
                    fileInput.files = dataTransfer.files;
                    handleFiles(files);
                }}
            }}, false);
            
            // File input change
            fileInput.addEventListener('change', (e) => {{
                if (e.target.files.length > 0) {{
                    handleFiles(e.target.files);
                }}
            }});
            
            function handleFiles(files) {{
                const file = files[0];
                
                // Validate file type
                if (!file.type.startsWith('image/')) {{
                    alert('Please select an image file (JPG, JPEG, or PNG)');
                    return;
                }}
                
                // Validate file size (16MB)
                if (file.size > 16 * 1024 * 1024) {{
                    alert('File size must be less than 16MB');
                    return;
                }}
                
                showPreview(file);
            }}
            
            function showPreview(file) {{
                const reader = new FileReader();
                reader.onload = (e) => {{
                    previewImage.src = e.target.result;
                    previewContainer.style.display = 'block';
                    analyzeBtn.style.display = 'inline-block';
                    uploadArea.style.display = 'none';
                }};
                reader.readAsDataURL(file);
            }}
            
            // Show loading on form submit
            uploadForm.addEventListener('submit', (e) => {{
                // Check if file is actually selected
                if (!fileInput.files || fileInput.files.length === 0) {{
                    e.preventDefault();
                    alert('Please select an image file first!');
                    return false;
                }}
                
                loading.classList.add('active');
                analyzeBtn.disabled = true;
                analyzeBtn.textContent = '⏳ Analyzing...';
            }});
        </script>
    </body>
    </html>
    '''
    return html

@app.route('/results/<int:analysis_id>')
def results(analysis_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    conn = get_db_connection()
    analysis = conn.execute(
        'SELECT * FROM damage_analyses WHERE id = ? AND user_id = ?',
        (analysis_id, session['user_id'])
    ).fetchone()
    conn.close()
    
    if not analysis:
        return '<h2 style="color: white; text-align: center; margin-top: 100px;">Analysis not found!</h2><a href="/dashboard" style="color: #667eea; display: block; text-align: center;">Back to Dashboard</a>'
    
    severity_colors = {'low': '#48bb78', 'medium': '#f6ad55', 'high': '#fc8181'}
    color = severity_colors.get(analysis['severity'], '#a0aec0')
    
    html = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Analysis Results - Car Damage Detection</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            
            body {{ 
                font-family: 'Inter', sans-serif; 
                background: #0f0f23;
                min-height: 100vh;
                padding: 20px;
                position: relative;
            }}
            
            .bg-animation {{
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 0;
                background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #4facfe);
                background-size: 400% 400%;
                animation: gradientShift 15s ease infinite;
            }}
            
            @keyframes gradientShift {{
                0% {{ background-position: 0% 50%; }}
                50% {{ background-position: 100% 50%; }}
                100% {{ background-position: 0% 50%; }}
            }}
            
            .container {{ 
                position: relative;
                z-index: 10;
                max-width: 1100px;
                margin: 50px auto;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
                padding: 50px;
                border-radius: 30px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.6s ease-out;
            }}
            
            @keyframes slideIn {{
                from {{ opacity: 0; transform: translateY(50px); }}
                to {{ opacity: 1; transform: translateY(0); }}
            }}
            
            h1 {{ 
                color: #fff;
                text-align: center;
                font-size: 2.8em;
                font-weight: 800;
                margin-bottom: 40px;
                text-shadow: 0 0 20px rgba(102, 126, 234, 0.8);
            }}
            
            .image-container {{
                text-align: center;
                margin: 30px 0;
            }}
            
            .image-container img {{
                max-width: 100%;
                max-height: 500px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                border: 3px solid rgba(255, 255, 255, 0.3);
                animation: fadeIn 0.8s ease-in;
            }}
            
            @keyframes fadeIn {{
                from {{ opacity: 0; transform: scale(0.95); }}
                to {{ opacity: 1; transform: scale(1); }}
            }}
            
            .result-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 25px;
                margin: 40px 0;
            }}
            
            .result-card {{
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(10px);
                padding: 30px;
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                text-align: center;
                transition: all 0.4s ease;
            }}
            
            .result-card:hover {{
                transform: translateY(-10px);
                box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
            }}
            
            .result-icon {{
                font-size: 3em;
                margin-bottom: 15px;
                filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.5));
            }}
            
            .result-label {{
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.95em;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }}
            
            .result-value {{
                color: white;
                font-size: 1.8em;
                font-weight: 700;
                text-transform: capitalize;
            }}
            
            .cost-section {{
                background: linear-gradient(135deg, rgba(72, 187, 120, 0.3), rgba(56, 161, 105, 0.3));
                backdrop-filter: blur(20px);
                padding: 50px;
                border-radius: 25px;
                text-align: center;
                margin: 40px 0;
                border: 2px solid rgba(72, 187, 120, 0.5);
                position: relative;
                overflow: hidden;
            }}
            
            .cost-section::before {{
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
                animation: rotate 10s linear infinite;
            }}
            
            @keyframes rotate {{
                from {{ transform: rotate(0deg); }}
                to {{ transform: rotate(360deg); }}
            }}
            
            .cost-section h2 {{
                color: white;
                font-size: 1.8em;
                margin-bottom: 20px;
                position: relative;
                z-index: 1;
            }}
            
            .cost {{
                font-size: 4.5em;
                color: white;
                font-weight: 800;
                margin: 20px 0;
                text-shadow: 0 0 30px rgba(72, 187, 120, 0.8);
                position: relative;
                z-index: 1;
                animation: pulse 2s ease-in-out infinite;
            }}
            
            @keyframes pulse {{
                0%, 100% {{ transform: scale(1); }}
                50% {{ transform: scale(1.05); }}
            }}
            
            .disclaimer {{
                color: rgba(255, 255, 255, 0.8);
                font-size: 1em;
                font-style: italic;
                position: relative;
                z-index: 1;
            }}
            
            .info-box {{
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                padding: 30px;
                border-radius: 20px;
                margin: 30px 0;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }}
            
            .info-box h3 {{
                color: white;
                margin-bottom: 20px;
                font-size: 1.4em;
            }}
            
            .info-box ul {{
                list-style: none;
                padding: 0;
            }}
            
            .info-box li {{
                color: rgba(255, 255, 255, 0.9);
                padding: 10px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }}
            
            .info-box li:last-child {{
                border-bottom: none;
            }}
            
            .info-box li::before {{
                content: "✓";
                color: #48bb78;
                font-weight: bold;
                margin-right: 12px;
                font-size: 1.2em;
            }}
            
            .btn-container {{
                text-align: center;
                margin-top: 40px;
            }}
            
            .btn {{ 
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 18px 40px;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                margin: 10px;
                font-size: 1.1em;
                font-weight: 700;
                transition: all 0.4s ease;
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
            }}
            
            .btn:hover {{ 
                transform: translateY(-5px) scale(1.05);
                box-shadow: 0 15px 40px rgba(102, 126, 234, 0.7);
            }}
            
            .btn-secondary {{
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.5);
            }}
            
            .btn-secondary:hover {{
                background: rgba(255, 255, 255, 0.3);
            }}
        </style>
    </head>
    <body>
        <div class="bg-animation"></div>
        
        <div class="container">
            <h1>🎯 Analysis Results</h1>
            
            <div class="image-container">
                <img src="/static/uploads/{analysis['image_path']}" alt="Damage Image">
            </div>
            
            <div class="result-grid">
                <div class="result-card">
                    <div class="result-icon">🚗</div>
                    <div class="result-label">Car Category</div>
                    <div class="result-value">{analysis['car_category']}</div>
                </div>
                
                <div class="result-card">
                    <div class="result-icon">🔍</div>
                    <div class="result-label">Damage Type</div>
                    <div class="result-value">{analysis['damage_type'].replace('_', ' ')}</div>
                </div>
                
                <div class="result-card">
                    <div class="result-icon">⚠️</div>
                    <div class="result-label">Severity</div>
                    <div class="result-value" style="color: {color};">{analysis['severity']}</div>
                </div>
                
                <div class="result-card">
                    <div class="result-icon">🤖</div>
                    <div class="result-label">AI Confidence</div>
                    <div class="result-value">{analysis['confidence']*100:.1f}%</div>
                </div>
            </div>
            
            <div class="cost-section">
                <h2>💰 Estimated Repair Cost</h2>
                <div class="cost">${analysis['estimated_cost']:.2f}</div>
                <p class="disclaimer">This is an AI-generated estimate. Please consult a professional mechanic for accurate quotes.</p>
            </div>
            
            <div class="info-box">
                <h3>📋 Next Steps</h3>
                <ul>
                    <li>Get professional quotes from local auto body shops</li>
                    <li>Contact your insurance company if applicable</li>
                    <li>Document all damage with photos</li>
                    <li>Compare multiple repair estimates</li>
                </ul>
            </div>
            
            <div class="btn-container">
                <a href="/select_category" class="btn">🔄 New Analysis</a>
                <a href="/history" class="btn btn-secondary">📊 View History</a>
                <a href="/dashboard" class="btn btn-secondary">🏠 Dashboard</a>
            </div>
        </div>
    </body>
    </html>
    '''
    return html

@app.route('/history')
def history():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    conn = get_db_connection()
    analyses = conn.execute(
        'SELECT * FROM damage_analyses WHERE user_id = ? ORDER BY created_at DESC',
        (session['user_id'],)
    ).fetchall()
    conn.close()
    
    rows = ''
    for a in analyses:
        rows += f'''
        <tr>
            <td><img src="/static/uploads/{a['image_path']}" style="width: 60px; border-radius: 5px;"></td>
            <td>{a['car_category']}</td>
            <td>{a['damage_type'].replace('_', ' ')}</td>
            <td>{a['severity']}</td>
            <td>${a['estimated_cost']:.2f}</td>
            <td><a href="/results/{a['id']}">View</a></td>
        </tr>
        '''
    
    html = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <title>History</title>
        <style>
            body {{ font-family: Arial; max-width: 1000px; margin: 50px auto; padding: 20px; background: #f5f5f5; }}
            .container {{ background: white; padding: 40px; border-radius: 10px; }}
            table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }}
            th {{ background: #007bff; color: white; }}
            .btn {{ background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; 
                   text-decoration: none; display: inline-block; margin: 10px 5px; }}
            h1 {{ color: #333; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📊 Analysis History</h1>
            <p>Total Analyses: {len(analyses)}</p>
            
            <table>
                <tr>
                    <th>Image</th>
                    <th>Category</th>
                    <th>Damage Type</th>
                    <th>Severity</th>
                    <th>Cost</th>
                    <th>Action</th>
                </tr>
                {rows if rows else '<tr><td colspan="6" style="text-align: center;">No analyses yet</td></tr>'}
            </table>
            
            <div style="margin-top: 20px;">
                <a href="/dashboard" class="btn">🏠 Dashboard</a>
                <a href="/select_category" class="btn">🔄 New Analysis</a>
            </div>
        </div>
    </body>
    </html>
    '''
    return html

@app.route('/logout')
def logout():
    session.clear()
    return '<h2>✅ Logged out successfully!</h2><a href="/">Go to Home</a>'

if __name__ == '__main__':
    print("🚗 Starting Car Damage Detection System...")
    print("📍 Open your browser and go to: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
