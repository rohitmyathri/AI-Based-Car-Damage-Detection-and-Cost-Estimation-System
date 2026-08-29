import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, IndianRupee, CheckCircle, Clock, Plus, LogOut } from 'lucide-react'
import { API_URL, BASE_URL } from '../config'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${API_URL}/dashboard/stats`)
      setStats(res.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    setShowLogoutConfirm(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="text-primary text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-light-bg/70 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="nature-border rounded-xl p-8 bg-white max-w-md w-full mx-4"
          >
            <h3 className="text-2xl font-display font-display font-bold mb-4 text-gray-900">Confirm Logout</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-primary transition text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-6 py-3 nature-button rounded-lg font-semibold"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <nav className="border-b border-primary/20 px-8 py-4 glass-effect shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg">AI</div>
            <span className="text-2xl font-display font-bold text-white">CAR SCAN</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-cyan-200">Premium User</div>
              <div className="font-semibold text-white">{user?.firstName} {user?.lastName}</div>
            </div>
            <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center font-bold text-white shadow-lg">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <button onClick={() => setShowLogoutConfirm(true)} className="p-2 hover:text-red-400 transition text-white">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-display font-extrabold mb-2 text-white">DASHBOARD</h1>
            <p className="text-cyan-100">Overview of your damage analysis activity</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/analyze')}
              className="flex items-center gap-2 px-6 py-3 nature-button rounded-lg font-semibold"
            >
              <Plus size={20} /> New Analysis
            </button>
            <button
              onClick={() => navigate('/batch-analyze')}
              className="flex items-center gap-2 px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Batch Upload
            </button>
            <button
              onClick={() => navigate('/compare-analyze')}
              className="flex items-center gap-2 px-6 py-3 border-2 border-cyan-300 text-cyan-300 rounded-lg font-semibold hover:bg-cyan-300/10 transition"
            >
              Compare
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: TrendingUp, label: 'Total Scans', value: stats?.stats.totalScans || 0, change: '+2 from last week', gradient: 'from-blue-500 to-blue-600', bg: 'gradient-card-blue', iconBg: 'bg-blue-500' },
            { icon: IndianRupee, label: 'Avg Repair Cost', value: `₹${(stats?.stats.avgRepairCost || 0).toLocaleString('en-IN')}`, change: '+1.5% from last month', gradient: 'from-purple-500 to-purple-600', bg: 'gradient-card-purple', iconBg: 'bg-purple-500' },
            { icon: CheckCircle, label: 'Accuracy Rate', value: `${stats?.stats.accuracyRate || 0}%`, change: 'Based on user feedback', gradient: 'from-emerald-500 to-emerald-600', bg: 'gradient-card-emerald', iconBg: 'bg-emerald-500' },
            { icon: Clock, label: 'Pending Reviews', value: stats?.stats.pendingReviews || 0, change: 'Action required', gradient: 'from-amber-500 to-amber-600', bg: 'gradient-card-amber', iconBg: 'bg-amber-500' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl p-6 ${stat.bg} border-2 border-white/10 shadow-lg card-hover`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center shadow-md`}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
              <div className={`text-3xl font-display font-bold mb-1 text-white`}>{stat.value}</div>
              <div className="text-sm text-gray-200 font-semibold mb-2">{stat.label}</div>
              <div className="text-xs text-gray-300">{stat.change}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate('/analyze')}
            className="rounded-xl p-6 bg-gradient-card-blue border-2 border-white/10 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Plus className="text-white" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white">Single Analysis</h3>
                <p className="text-sm text-gray-300">Analyze one image</p>
              </div>
            </div>
            <p className="text-sm text-gray-200 font-medium">Upload a single vehicle image for quick damage detection and cost estimation</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => navigate('/batch-analyze')}
            className="rounded-xl p-6 bg-gradient-card-purple border-2 border-white/10 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="text-white" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white">Batch Upload</h3>
                <p className="text-sm text-gray-300">Up to 10 images</p>
              </div>
            </div>
            <p className="text-sm text-gray-200 font-medium">Process multiple vehicle images at once with real-time progress tracking</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => navigate('/compare-analyze')}
            className="rounded-xl p-6 bg-gradient-card-amber border-2 border-white/10 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="text-white" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="18" />
                  <rect x="14" y="3" width="7" height="18" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white">Compare Images</h3>
                <p className="text-sm text-gray-300">Side-by-side analysis</p>
              </div>
            </div>
            <p className="text-sm text-gray-200 font-medium">Compare two vehicle images to see damage differences and cost variations</p>
          </motion.div>
        </div>

        {/* Charts and Recent Analysis */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Cost Trends Chart */}
          <div className="md:col-span-2 rounded-xl p-6 card-dark shadow-lg border-2 border-white/10">
            <h2 className="text-xl font-display font-bold mb-6 text-white">Cost Estimation Trends (INR)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.costTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '2px solid #3B82F6', borderRadius: '12px', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)', color: '#fff' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Avg Cost']}
                />
                <Line type="monotone" dataKey="cost" stroke="url(#colorGradient)" strokeWidth={3} dot={{ fill: '#3B82F6', r: 6, strokeWidth: 2, stroke: '#fff' }} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Analysis */}
          <div className="rounded-xl p-6 card-dark shadow-lg border-2 border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-display font-bold text-white">Recent Analysis</h2>
              <button onClick={() => navigate('/history')} className="text-cyan-300 text-sm hover:underline font-semibold">
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {stats?.recentAnalyses?.slice(0, 3).map((analysis, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/report/${analysis.reportId}`)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-all duration-300 border border-slate-600"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                    {analysis.imageUrl ? (
                      <img 
                        src={`http://localhost:5000${analysis.imageUrl}`} 
                        alt="Vehicle damage" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23E5E7EB" width="48" height="48"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236B7280" font-family="Arial" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-white">{analysis.vehicleName || 'Unknown Vehicle'}</div>
                    <div className="text-xs text-gray-300">{analysis.damageType}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-300 font-bold">₹{analysis.cost}</div>
                    <div className="text-xs text-gray-400">{new Date(analysis.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}




