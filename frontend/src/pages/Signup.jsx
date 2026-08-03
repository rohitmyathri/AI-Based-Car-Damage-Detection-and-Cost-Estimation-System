import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState('')
  const { signup } = useAuth()
  const navigate = useNavigate()

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      return 'Email is required'
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address (e.g., user@example.com)'
    }
    return ''
  }

  // Password validation with strength check
  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required'
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters'
    }
    if (password.length > 50) {
      return 'Password must be less than 50 characters'
    }
    
    // Check password strength
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

    if (strength === 0 || strength === 1) {
      setPasswordStrength('Weak')
    } else if (strength === 2) {
      setPasswordStrength('Medium')
    } else {
      setPasswordStrength('Strong')
    }

    return ''
  }

  // Name validation
  const validateName = (name, fieldName) => {
    if (!name) {
      return `${fieldName} is required`
    }
    if (name.length < 2) {
      return `${fieldName} must be at least 2 characters`
    }
    if (name.length > 30) {
      return `${fieldName} must be less than 30 characters`
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return `${fieldName} can only contain letters`
    }
    return ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    // Clear field error when user types
    setFieldErrors({ ...fieldErrors, [name]: '' })
    setError('')

    // Real-time password strength check
    if (name === 'password') {
      validatePassword(value)
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    let error = ''

    if (name === 'email') {
      error = validateEmail(value)
    } else if (name === 'password') {
      error = validatePassword(value)
    } else if (name === 'firstName') {
      error = validateName(value, 'First name')
    } else if (name === 'lastName') {
      error = validateName(value, 'Last name')
    }

    setFieldErrors({ ...fieldErrors, [name]: error })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Validate all fields
    const errors = {}
    errors.firstName = validateName(formData.firstName, 'First name')
    errors.lastName = validateName(formData.lastName, 'Last name')
    errors.email = validateEmail(formData.email)
    errors.password = validatePassword(formData.password)

    // Check if there are any errors
    const hasErrors = Object.values(errors).some(err => err !== '')
    if (hasErrors) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)

    try {
      await signup(formData)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/90 border-2 border-gray-300 rounded-lg hover:border-primary transition group shadow-lg text-gray-900"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-900 group-hover:text-primary transition">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="text-gray-900 group-hover:text-primary transition font-semibold">Back to Home</span>
      </Link>

      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="text-center mb-8">
          <h1 className="text-5xl font-display font-extrabold mb-2 text-white">CAR SCAN</h1>
          <p className="text-cyan-100 font-semibold">Create your account today</p>
        </div>

        <div className="rounded-2xl p-8 card-dark shadow-2xl border-2 border-white/10">
          <div className="flex gap-2 mb-8">
            <Link to="/login" className="flex-1 py-3 bg-slate-700 border-2 border-slate-600 text-white rounded-lg hover:bg-slate-600 transition text-center font-semibold">
              Login
            </Link>
            <button className="flex-1 py-3 nature-button rounded-lg font-semibold shadow-lg text-white">Sign Up</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold mb-2 text-white">Create Account</h2>
              <p className="text-gray-300 text-sm mb-6">Join thousands of users today</p>
            </div>

            {error && (
              <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 font-semibold text-white">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="John"
                  className={`w-full px-4 py-3 bg-slate-700 text-white placeholder-gray-400 border-2 rounded-lg focus:outline-none transition ${
                    fieldErrors.firstName ? 'border-red-500 focus:border-red-500' : 'border-slate-600 focus:border-primary'
                  }`}
                  required
                />
                {fieldErrors.firstName && (
                  <p className="mt-1 text-xs text-red-400 font-medium">{fieldErrors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-2 font-semibold text-white">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Doe"
                  className={`w-full px-4 py-3 bg-slate-700 text-white placeholder-gray-400 border-2 rounded-lg focus:outline-none transition ${
                    fieldErrors.lastName ? 'border-red-500 focus:border-red-500' : 'border-slate-600 focus:border-primary'
                  }`}
                  required
                />
                {fieldErrors.lastName && (
                  <p className="mt-1 text-xs text-red-400 font-medium">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 font-semibold text-white">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="john@example.com"
                className={`w-full px-4 py-3 bg-slate-700 text-white placeholder-gray-400 border-2 rounded-lg focus:outline-none transition ${
                  fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-600 focus:border-primary'
                }`}
                required
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-400 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-2 font-semibold text-white">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="At least 6 characters"
                  className={`w-full px-4 py-3 bg-slate-700 text-white placeholder-gray-400 border-2 rounded-lg focus:outline-none transition pr-12 ${
                    fieldErrors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-600 focus:border-primary'
                  }`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-300 transition"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-400 font-medium">{fieldErrors.password}</p>
              )}
              {formData.password && !fieldErrors.password && passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          passwordStrength === 'Weak' ? 'w-1/3 bg-red-500' :
                          passwordStrength === 'Medium' ? 'w-2/3 bg-yellow-500' :
                          'w-full bg-green-500'
                        }`}
                      ></div>
                    </div>
                    <span className={`text-xs font-bold ${
                      passwordStrength === 'Weak' ? 'text-red-400' :
                      passwordStrength === 'Medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {passwordStrength}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    💡 Use 8+ characters with uppercase, lowercase, numbers & symbols for a strong password
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 nature-button rounded-lg font-semibold text-lg disabled:opacity-50 text-white"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}




