import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Filter, Calendar, Download } from 'lucide-react'

export default function History() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('all')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/dashboard/stats')
      setAnalyses(res.data.recentAnalyses || [])
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.damageType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analysis.reportId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = filterSeverity === 'all' || analysis.severity === filterSeverity
    return matchesSearch && matchesSeverity
  })

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe': return 'text-red-400 bg-red-500/20 border-red-500'
      case 'moderate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500'
      case 'minor': return 'text-green-400 bg-green-500/20 border-green-500'
      default: return 'text-gray-700 bg-gray-500/20 border-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="text-primary text-2xl">Loading History...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Header */}
      <nav className="border-b border-primary/20 px-8 py-4 glass-effect">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:text-primary transition text-white">
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center font-bold text-white">AI</div>
              <span className="text-2xl font-display font-bold text-white">CAR SCAN</span>
            </div>
          </div>
          <div className="text-sm text-gray-300 font-medium">
            {user?.firstName} {user?.lastName}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-extrabold mb-2 text-white">ANALYSIS HISTORY</h1>
            <p className="text-gray-300">View all your previous damage analyses</p>
          </div>

          {/* Filters */}
          <div className="nature-border rounded-xl p-6 card-dark mb-6">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by damage type or report ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 text-white placeholder-gray-400 border-2 border-slate-600 rounded-lg focus:border-primary outline-none transition"
                />
              </div>

              {/* Severity Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 text-white border-2 border-slate-600 rounded-lg focus:border-primary outline-none transition appearance-none"
                >
                  <option value="all">All Severities</option>
                  <option value="Minor">Minor</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-end">
                <div className="text-gray-300">
                  Showing <span className="text-primary font-bold">{filteredAnalyses.length}</span> of <span className="font-bold text-white">{analyses.length}</span> results
                </div>
              </div>
            </div>
          </div>

          {/* Analysis List */}
          {filteredAnalyses.length === 0 ? (
            <div className="nature-border rounded-xl p-12 card-dark text-center">
              <div className="text-gray-300 text-lg mb-4">No analyses found</div>
              <button
                onClick={() => navigate('/analyze')}
                className="px-6 py-3 nature-button rounded-lg font-semibold"
              >
                Start New Analysis
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnalyses.map((analysis, index) => (
                <motion.div
                  key={analysis._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/report/${analysis.reportId}`, { 
                    state: { from: '/history' } 
                  })}
                  className="nature-border rounded-xl p-6 card-dark hover:bg-slate-700/90 cursor-pointer transition"
                >
                  <div className="grid md:grid-cols-12 gap-6 items-center">
                    {/* Image */}
                    <div className="md:col-span-2">
                      <div className="w-full h-24 bg-slate-700 rounded-lg overflow-hidden">
                        {analysis.imageUrl ? (
                          <img
                            src={`http://localhost:5000${analysis.imageUrl}`}
                            alt="Vehicle damage"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23374151" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-family="Arial" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Report Info */}
                    <div className="md:col-span-3">
                      <div className="text-sm text-gray-400 mb-1">Report ID</div>
                      <div className="font-bold text-primary mb-2">{analysis.reportId}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Calendar size={14} />
                        {new Date(analysis.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>

                    {/* Damage Details */}
                    <div className="md:col-span-3">
                      <div className="text-sm text-gray-400 mb-1">Damage Type</div>
                      <div className="font-bold text-white mb-2">{analysis.damageType}</div>
                      <div className="flex flex-wrap gap-2">
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(analysis.severity)}`}>
                          {analysis.severity || 'Unknown'}
                        </div>
                        {analysis.status && (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            analysis.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            analysis.status === 'reviewed' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {analysis.status.toUpperCase()}
                          </span>
                        )}
                        {analysis.needsReview && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                            ⚠️
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-400 mb-1">Vehicle</div>
                      <div className="font-semibold text-white">{analysis.vehicleName || 'Unknown'}</div>
                      <div className="text-sm text-gray-400">{analysis.vehicleCategory || 'N/A'}</div>
                    </div>

                    {/* Cost */}
                    <div className="md:col-span-2 text-right">
                      <div className="text-sm text-gray-400 mb-1">Estimated Cost</div>
                      <div className="text-2xl font-display font-bold text-primary">₹{analysis.cost}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/report/${analysis.reportId}`, { 
                            state: { from: '/history' } 
                          })
                        }}
                        className="mt-2 text-sm text-primary hover:underline flex items-center gap-1 justify-end"
                      >
                        <Download size={14} /> View Report
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}




