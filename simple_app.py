"""
Car Damage Detection & Repair Cost Estimation
Main Flask Application  –  SQLite backend  –  YOLO ML model
"""

from flask import (Flask, render_template, request, redirect,
                   url_for, flash, session, jsonify)
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import os
import sqlite3
from datetime import datetime
import uuid

from utils.auth import login_required
from utils.image_processor import process_uploaded_image, allowed_file
from utils.cost_estimator import estimate_repair_cost
from models.damage_detector import DamageDetector

# ── App setup ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'car-damage-secret-2024')

# Absolute paths so it works on both Windows (local) and Linux (Render)
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR   = os.path.join(BASE_DIR, 'static', 'uploads')
DATABASE_DIR = os.path.join(BASE_DIR, 'database')

app.config['UPLOAD_FOLDER']      = UPLOAD_DIR
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024   # 16 MB

os.makedirs(UPLOAD_DIR,   exist_ok=True)
os.makedirs(DATABASE_DIR, exist_ok=True)

# ── DB helpers ────────────────────────────────────────────────────────────────
DB_PATH = os.path.join(DATABASE_DIR, 'car_damage.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Create tables if they don't exist."""
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            email      TEXT    NOT NULL UNIQUE,
            password   TEXT    NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS damage_analyses (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id        INTEGER NOT NULL,
            image_path     TEXT    NOT NULL,
            car_category   TEXT    NOT NULL,
            damage_type    TEXT    NOT NULL,
            severity       TEXT    NOT NULL,
            confidence     REAL    NOT NULL,
            estimated_cost REAL    NOT NULL,
            annotated_b64  TEXT,
            created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    conn.close()

init_db()

# ── Load ML model ─────────────────────────────────────────────────────────────
print("🔄 Loading damage detection model…")
damage_detector = DamageDetector()

# ── Context processor ─────────────────────────────────────────────────────────
@app.context_processor
def inject_user():
    return dict(
        current_user_id=session.get('user_id'),
        current_user_email=session.get('user_email'),
    )

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('index.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email            = request.form.get('email', '').strip().lower()
        password         = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')

        if not email or not password:
            flash('Email and password are required.', 'error')
            return render_template('register.html')

        if password != confirm_password:
            flash('Passwords do not match.', 'error')
            return render_template('register.html')

        if len(password) < 6:
            flash('Password must be at least 6 characters.', 'error')
            return render_template('register.html')

        conn = get_db()
        existing = conn.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
        if existing:
            conn.close()
            flash('Email already registered.', 'error')
            return render_template('register.html')

        hashed = generate_password_hash(password)
        conn.execute('INSERT INTO users (email, password) VALUES (?, ?)', (email, hashed))
        conn.commit()
        conn.close()

        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email    = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')

        conn = get_db()
        user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        conn.close()

        if user and check_password_hash(user['password'], password):
            session['user_id']    = user['id']
            session['user_email'] = user['email']
            flash('Welcome back!', 'success')
            return redirect(url_for('dashboard'))

        flash('Invalid email or password.', 'error')

    return render_template('login.html')


@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))


@app.route('/dashboard')
@login_required
def dashboard():
    conn = get_db()
    total = conn.execute(
        'SELECT COUNT(*) as c FROM damage_analyses WHERE user_id = ?',
        (session['user_id'],)
    ).fetchone()['c']
    recent = conn.execute(
        'SELECT * FROM damage_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 3',
        (session['user_id'],)
    ).fetchall()
    conn.close()
    return render_template('dashboard.html', total_analyses=total, recent=recent)


@app.route('/select_category', methods=['GET', 'POST'])
@login_required
def select_category():
    if request.method == 'POST':
        category = request.form.get('category')
        if not category:
            flash('Please select a category.', 'error')
            return render_template('select_category.html')
        session['car_category'] = category
        return redirect(url_for('upload_image'))
    return render_template('select_category.html')


@app.route('/upload_image', methods=['GET', 'POST'])
@login_required
def upload_image():
    if 'car_category' not in session:
        flash('Please select a car category first.', 'warning')
        return redirect(url_for('select_category'))

    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file part in request.', 'error')
            return redirect(request.url)

        file = request.files['file']
        if file.filename == '':
            flash('No file selected.', 'error')
            return redirect(request.url)

        if not allowed_file(file.filename):
            flash('Invalid file type. Please upload JPG, JPEG, or PNG.', 'error')
            return redirect(request.url)

        ext      = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Resize/optimise
        process_uploaded_image(filepath)

        try:
            # ── ML detection ────────────────────────────────────────────────
            result = damage_detector.detect_damage(filepath)
            # detect_damage returns 4 values: type, severity, conf, annotated_b64
            if len(result) == 4:
                damage_type, severity, confidence, annotated_b64 = result
            else:
                damage_type, severity, confidence = result
                annotated_b64 = None

            # ── Cost estimation ──────────────────────────────────────────────
            car_category   = session['car_category']
            estimated_cost = estimate_repair_cost(car_category, damage_type, severity)

            # ── Save to DB ───────────────────────────────────────────────────
            conn = get_db()
            analysis_id = conn.execute(
                """INSERT INTO damage_analyses
                   (user_id, image_path, car_category, damage_type, severity,
                    confidence, estimated_cost, annotated_b64)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (session['user_id'], filename, car_category,
                 damage_type, severity, confidence, estimated_cost, annotated_b64)
            ).lastrowid
            conn.commit()
            conn.close()

            return redirect(url_for('results', analysis_id=analysis_id))

        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            flash(f'Error processing image: {str(e)}', 'error')
            return redirect(request.url)

    return render_template('upload_image.html', category=session.get('car_category'))


@app.route('/results/<int:analysis_id>')
@login_required
def results(analysis_id):
    conn     = get_db()
    analysis = conn.execute(
        'SELECT * FROM damage_analyses WHERE id = ? AND user_id = ?',
        (analysis_id, session['user_id'])
    ).fetchone()
    conn.close()

    if not analysis:
        flash('Analysis not found.', 'error')
        return redirect(url_for('dashboard'))

    return render_template('results.html', analysis=analysis)


@app.route('/history')
@login_required
def history():
    conn     = get_db()
    analyses = conn.execute(
        'SELECT * FROM damage_analyses WHERE user_id = ? ORDER BY created_at DESC',
        (session['user_id'],)
    ).fetchall()
    conn.close()
    return render_template('history.html', analyses=analyses)


@app.route('/delete_analysis/<int:analysis_id>', methods=['POST'])
@login_required
def delete_analysis(analysis_id):
    conn     = get_db()
    analysis = conn.execute(
        'SELECT * FROM damage_analyses WHERE id = ? AND user_id = ?',
        (analysis_id, session['user_id'])
    ).fetchone()
    if analysis:
        # remove uploaded image
        img_path = os.path.join(app.config['UPLOAD_FOLDER'], analysis['image_path'])
        if os.path.exists(img_path):
            os.remove(img_path)
        conn.execute('DELETE FROM damage_analyses WHERE id = ?', (analysis_id,))
        conn.commit()
        flash('Analysis deleted.', 'info')
    conn.close()
    return redirect(url_for('history'))


# ── API endpoint for AJAX upload (optional) ───────────────────────────────────
@app.route('/api/detect', methods=['POST'])
@login_required
def api_detect():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    car_category = request.form.get('car_category', 'economy')

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    ext      = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    process_uploaded_image(filepath)

    try:
        result = damage_detector.detect_damage(filepath)
        if len(result) == 4:
            damage_type, severity, confidence, annotated_b64 = result
        else:
            damage_type, severity, confidence = result
            annotated_b64 = None

        estimated_cost = estimate_repair_cost(car_category, damage_type, severity)

        conn = get_db()
        analysis_id = conn.execute(
            """INSERT INTO damage_analyses
               (user_id, image_path, car_category, damage_type, severity,
                confidence, estimated_cost, annotated_b64)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (session['user_id'], filename, car_category,
             damage_type, severity, confidence, estimated_cost, annotated_b64)
        ).lastrowid
        conn.commit()
        conn.close()

        return jsonify({
            'success': True,
            'analysis_id': analysis_id,
            'damage_type': damage_type,
            'severity': severity,
            'confidence': round(confidence * 100, 1),
            'estimated_cost': estimated_cost,
            'has_annotation': annotated_b64 is not None,
        })

    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("🚗  Car Damage Detection System starting…")
    print("📍  http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
