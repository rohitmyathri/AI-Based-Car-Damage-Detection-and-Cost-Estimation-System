import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Analyze from './pages/Analyze'
import BatchAnalyze from './pages/BatchAnalyze'
import CompareAnalyze from './pages/CompareAnalyze'
import Report from './pages/Report'
import History from './pages/History'
import ResetPassword from './pages/ResetPassword'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-2xl">Loading...</div>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
          <Route path="/batch-analyze" element={<ProtectedRoute><BatchAnalyze /></ProtectedRoute>} />
          <Route path="/compare-analyze" element={<ProtectedRoute><CompareAnalyze /></ProtectedRoute>} />
          <Route path="/report/:reportId" element={<ProtectedRoute><Report /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App



