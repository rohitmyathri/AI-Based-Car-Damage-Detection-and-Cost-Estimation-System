import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import axios from 'axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [otp, setOTP] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPasswordField, setShowNewPasswordField] = useState(false)
  const [showConfirmPasswordField, setShowConfirmPasswordField] = useState(false)
  const [resetMessage, setResetMessage] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      return 'Email is required'
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address'
    }
    return ''
  }

  // Password validation
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
    return ''
  }

  // Handle email change with validation
  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    setEmailError('')
    setError('')
  }

  // Handle email blur (when user leaves the field)
  const handleEmailBlur = () => {
    const error = validateEmail(email)
    setEmailError(error)
  }

  // Handle password change with validation
  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)
    setPasswordError('')
    setError('')
  }

  // Handle password blur
  const handlePasswordBlur = () => {
    const error = validatePassword(password)
    setPasswordError(error)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setEmailError('')
    setPasswordError('')

    // Validate all fields
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)

    if (emailErr || passwordErr) {
      setEmailError(emailErr)
      setPasswordError(passwordErr)
      return
    }

    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPasswordClick = async () => {
    // Validate email first
    const emailValidation = validateEmail(email)
    if (emailValidation) {
      setError(emailValidation)
      setEmailError(emailValidation)
      return
    }

    setError('')
    setEmailError('')
    setLoading(true)

    try {
      const response = await axios.post('/api/auth/forgot-password', { email })
      
      // Check if user is registered
      if (response.data.registered === false) {
        setError(response.data.error || 'This email is not registered')
        setLoading(false)
        return
      }

      // User exists, proceed with OTP
      setResetEmail(email)
      setShowForgotPassword(true)
      setShowOTPVerification(true)
      setResetMessage(response.data.message || 'OTP has been sent to your email. Please check your inbox.')
    } catch (err) {
      // Handle error response
      if (err.response?.status === 404) {
        // User not found
        setError(err.response.data.error || 'This email is not registered. Please sign up first.')
      } else {
        setError(err.response?.data?.error || 'Failed to send OTP. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setResetMessage('')
    setResetLoading(true)

    try {
      const response = await axios.post('/api/auth/forgot-password', { email: resetEmail })
      setResetMessage('OTP has been sent to your email. Please check your inbox.')
      setShowOTPVerification(true)
    } catch (err) {
      setResetMessage(err.response?.data?.error || 'Failed to send OTP. Please try again.')
    } finally {
      setResetLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setResetMessage('')
    setResetLoading(true)

    try {
      await axios.post('/api/auth/verify-otp', { email: resetEmail, otp })
      setResetMessage('OTP verified! Please set your new password.')
      setShowNewPassword(true)
    } catch (err) {
      setResetMessage(err.response?.data?.error || 'Invalid OTP. Please try again.')
    } finally {
      setResetLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setResetMessage('')

    if (newPassword.length < 6) {
      setResetMessage('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setResetMessage('Passwords do not match')
      return
    }

    setResetLoading(true)

    try {
      await axios.post('/api/auth/reset-password-otp', { 
        email: resetEmail, 
        otp, 
        password: newPassword 
      })
      setResetMessage('Password reset successful! Redirecting to login...')
      setTimeout(() => {
        setShowForgotPassword(false)
        setShowOTPVerification(false)
        setShowNewPassword(false)
        setResetEmail('')
        setOTP('')
        setNewPassword('')
        setConfirmPassword('')
        setResetMessage('')
      }, 2000)
    } catch (err) {
      setResetMessage(err.response?.data?.error || 'Failed to reset password. Please try again.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-dark/70 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="nature-border rounded-2xl p-8 bg-light-bg max-w-md w-full mx-4"
          >
            {showOTPVerification && !showNewPassword && (
              <>
                <h2 className="text-2xl font-display font-display font-bold mb-4">Enter OTP</h2>
                <p className="text-gray-700 mb-6">
                  We've sent a 6-digit OTP to {resetEmail}. Please check your email.
                </p>

                {resetMessage && (
                  <div className={`rounded-lg p-3 mb-4 text-sm ${
                    resetMessage.includes('verified') || resetMessage.includes('successful')
                      ? 'bg-green-500/20 border border-green-500 text-green-400'
                      : 'bg-red-500/20 border border-red-500 text-red-400'
                  }`}>
                    {resetMessage}
                  </div>
                )}

                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-3 bg-white/80 border-2 border-gray-300 rounded-lg focus:border-primary outline-none transition text-center text-2xl tracking-widest font-mono"
                      required
                      maxLength={6}
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false)
                        setShowOTPVerification(false)
                        setOTP('')
                        setResetMessage('')
                      }}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-500 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading || otp.length !== 6}
                      className="flex-1 px-6 py-3 nature-button rounded-lg font-semibold disabled:opacity-50"
                    >
                      {resetLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {showNewPassword && (
              <>
                <h2 className="text-2xl font-display font-display font-bold mb-4">Set New Password</h2>
                <p className="text-gray-700 mb-6">
                  Enter your new password below.
                </p>

                {resetMessage && (
                  <div className={`rounded-lg p-3 mb-4 text-sm ${
                    resetMessage.includes('successful')
                      ? 'bg-green-500/20 border border-green-500 text-green-400'
                      : 'bg-red-500/20 border border-red-500 text-red-400'
                  }`}>
                    {resetMessage}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPasswordField ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 border-2 border-gray-300 rounded-lg focus:border-primary outline-none transition pr-12"
                        required
                        minLength={6}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPasswordField(!showNewPasswordField)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-primary transition"
                      >
                        {showNewPasswordField ? (
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
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPasswordField ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 border-2 border-gray-300 rounded-lg focus:border-primary outline-none transition pr-12"
                        required
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPasswordField(!showConfirmPasswordField)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-primary transition"
                      >
                        {showConfirmPasswordField ? (
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
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full px-6 py-3 nature-button rounded-lg font-semibold disabled:opacity-50"
                  >
                    {resetLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="text-center mb-8">
          <h1 className="text-5xl font-display font-extrabold mb-2 text-white">CAR SCAN</h1>
          <p className="text-cyan-100 font-semibold">Log in to access your dashboard</p>
        </div>

        <div className="rounded-2xl p-8 card-dark shadow-2xl border-2 border-white/10">
          <div className="flex gap-2 mb-8">
            <button className="flex-1 py-3 nature-button rounded-lg font-semibold shadow-lg text-white">Login</button>
            <Link to="/signup" className="flex-1 py-3 bg-slate-700 border-2 border-slate-600 text-white rounded-lg hover:bg-slate-600 transition text-center font-semibold">
              Sign Up
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold mb-2 text-white">Welcome Back</h2>
              <p className="text-gray-300 text-sm mb-6">Enter your credentials to continue</p>
            </div>

            {error && (
              <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-4">
                <p className="text-red-600 font-semibold mb-2">{error}</p>
                {error.includes('not registered') && (
                  <div className="mt-3 pt-3 border-t border-red-300">
                    <p className="text-sm text-gray-700 mb-2">Don't have an account?</p>
                    <Link 
                      to="/signup" 
                      className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold text-sm"
                    >
                      Sign Up Now →
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm mb-2 font-semibold text-white">Email</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                placeholder="john@example.com"
                className={`w-full px-4 py-3 bg-slate-700 text-white placeholder-gray-400 border-2 rounded-lg focus:outline-none transition ${
                  emailError ? 'border-red-500 focus:border-red-500' : 'border-slate-600 focus:border-primary'
                }`}
                required
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-400 font-medium">{emailError}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-white">Password</label>
                <button 
                  type="button"
                  onClick={handleForgotPasswordClick}
                  disabled={loading}
                  className="text-sm text-cyan-300 hover:underline disabled:opacity-50 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 bg-slate-700 text-white placeholder-gray-400 border-2 rounded-lg focus:outline-none transition pr-12 ${
                    passwordError ? 'border-red-500 focus:border-red-500' : 'border-slate-600 focus:border-primary'
                  }`}
                  required
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
              {passwordError && (
                <p className="mt-1 text-sm text-red-500 font-medium">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 nature-button rounded-lg font-semibold text-lg disabled:opacity-50 text-white"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}




