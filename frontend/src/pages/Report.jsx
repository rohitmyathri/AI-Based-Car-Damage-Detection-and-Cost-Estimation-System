import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, RefreshCw } from 'lucide-react'
import { API_URL, BASE_URL } from '../config'

// Component to draw bounding boxes on image
function ImageWithBoundingBoxes({ imageUrl, detections }) {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const containerRef = useRef(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (imageLoaded && canvasRef.current && imageRef.current) {
      drawBoundingBoxes()
    }
  }, [imageLoaded, detections])

  const drawBoundingBoxes = () => {
    const canvas = canvasRef.current
    const image = imageRef.current
    const container = containerRef.current
    
    if (!canvas || !image || !container) return
    
    const ctx = canvas.getContext('2d')

    // Calculate scale to fit container
    const containerWidth = container.clientWidth
    const scale = containerWidth / image.naturalWidth

    // Set canvas size
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${image.naturalHeight * scale}px`

    // Draw the image
    ctx.drawImage(image, 0, 0)

    // Draw bounding boxes for each detection
    if (detections && detections.length > 0) {
      detections.forEach((detection) => {
        const { x1, y1, x2, y2 } = detection.boundingBox
        const width = x2 - x1
        const height = y2 - y1

        // Draw semi-transparent fill
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)'
        ctx.fillRect(x1, y1, width, height)

        // Draw rectangle border
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 4
        ctx.strokeRect(x1, y1, width, height)

        // Draw label background
        const label = `${detection.damageType} - ${detection.confidence}%`
        ctx.font = 'bold 20px Arial'
        const textMetrics = ctx.measureText(label)
        const textWidth = textMetrics.width
        const textHeight = 28
        const padding = 10

        // Position label above box, or inside if too close to top
        const labelY = y1 > textHeight + 10 ? y1 - 6 : y1 + textHeight + 10

        ctx.fillStyle = '#ef4444'
        ctx.fillRect(x1, labelY - textHeight, textWidth + padding * 2, textHeight + 4)

        // Draw label text
        ctx.fillStyle = '#ffffff'
        ctx.fillText(label, x1 + padding, labelY - 8)
      })
    }
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(false)
  }

  // Construct full image URL
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`

  return (
    <div ref={containerRef} className="relative w-full">
      <img
        ref={imageRef}
        src={fullImageUrl}
        alt="Vehicle Damage"
        className="hidden"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      {imageError ? (
        <div className="w-full h-64 bg-red-900/20 border border-red-500 rounded-lg flex items-center justify-center">
          <div className="text-red-400">Failed to load image</div>
        </div>
      ) : imageLoaded ? (
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-lg shadow-lg"
        />
      ) : (
        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-gray-700">Loading image...</div>
        </div>
      )}
    </div>
  )
}

export default function Report() {
  const { reportId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusUpdating, setStatusUpdating] = useState(false)

  // Get the previous page from location state, default to dashboard
  const previousPage = location.state?.from || '/dashboard'

  useEffect(() => {
    console.log('Report ID:', reportId)
    fetchAnalysis()
  }, [reportId])

  const fetchAnalysis = async () => {
    try {
      console.log('Fetching analysis for:', reportId)
      // Handle both formats: with and without # prefix
      const cleanReportId = reportId.startsWith('%23') ? reportId.substring(3) : reportId.replace('#', '')
      console.log('Clean report ID:', cleanReportId)
      const res = await axios.get(`${API_URL}/analysis/${encodeURIComponent(cleanReportId)}`)
      console.log('Analysis response:', res.data)
      setAnalysis(res.data.analysis)
    } catch (error) {
      console.error('Failed to fetch analysis:', error)
      console.error('Error details:', error.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    try {
      const res = await axios.get(`${API_URL}/analysis/${reportId}/pdf`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report-${reportId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Failed to download PDF:', error)
    }
  }

  const updateStatus = async (newStatus) => {
    try {
      setStatusUpdating(true)
      const cleanReportId = reportId.startsWith('%23') ? reportId.substring(3) : reportId.replace('#', '')
      await axios.patch(`${API_URL}/dashboard/${cleanReportId}/status`, {
        status: newStatus,
        needsReview: false
      })
      setAnalysis({ ...analysis, status: newStatus, needsReview: false })
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setStatusUpdating(false)
    }
  }

  const toggleNeedsReview = async () => {
    try {
      setStatusUpdating(true)
      const cleanReportId = reportId.startsWith('%23') ? reportId.substring(3) : reportId.replace('#', '')
      const newNeedsReview = !analysis.needsReview
      await axios.patch(`${API_URL}/dashboard/${cleanReportId}/status`, {
        needsReview: newNeedsReview
      })
      setAnalysis({ ...analysis, needsReview: newNeedsReview })
    } catch (error) {
      console.error('Failed to toggle review flag:', error)
    } finally {
      setStatusUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="text-primary text-2xl">Loading Report...</div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="text-red-400 text-2xl">Report not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Header */}
      <nav className="border-b border-primary/20 px-4 sm:px-8 py-4 glass-effect">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => navigate(previousPage)} className="p-2 hover:text-primary transition text-white">
              <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded flex items-center justify-center font-bold text-white text-sm sm:text-base">AI</div>
              <span className="text-lg sm:text-2xl font-display font-bold text-white">CAR SCAN</span>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-300 font-medium hidden sm:block">Premium User</div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-8 py-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Report Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-4xl font-display font-extrabold mb-2 text-white">ANALYSIS REPORT</h1>
              <p className="text-sm sm:text-base text-gray-300 font-medium">ID: {analysis.reportId}</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                  analysis.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  analysis.status === 'reviewed' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {analysis.status?.toUpperCase() || 'PENDING'}
                </span>
                {analysis.needsReview && (
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                    NEEDS REVIEW
                  </span>
                )}
                {analysis.damageDetection.confidence < 70 && (
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400">
                    LOW CONFIDENCE
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/analyze')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border-2 border-primary/50 text-white rounded-lg hover:border-primary hover:bg-primary/10 transition font-semibold"
              >
                <RefreshCw size={16} className="sm:w-5 sm:h-5" /> Analyze Again
              </button>
              <button
                onClick={downloadPDF}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base nature-button rounded-lg font-semibold"
              >
                <Download size={16} className="sm:w-5 sm:h-5" /> Download PDF
              </button>
            </div>
          </div>

          {/* Status Management */}
          <div className="nature-border rounded-xl p-4 sm:p-6 card-dark shadow-lg mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-display font-bold mb-3 sm:mb-4 text-white">Review Status</h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => updateStatus('pending')}
                disabled={statusUpdating}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-bold transition ${
                  analysis.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => updateStatus('reviewed')}
                disabled={statusUpdating}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-bold transition ${
                  analysis.status === 'reviewed'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
                }`}
              >
                Reviewed
              </button>
              <button
                onClick={() => updateStatus('completed')}
                disabled={statusUpdating}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-bold transition ${
                  analysis.status === 'completed'
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
                }`}
              >
                Completed
              </button>
              <div className="w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
                <button
                  onClick={toggleNeedsReview}
                  disabled={statusUpdating}
                  className={`w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-bold transition ${
                    analysis.needsReview
                      ? 'bg-red-100 text-red-700 border-2 border-red-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
                  }`}
                >
                  {analysis.needsReview ? '⚠️ Needs Review' : 'Flag for Review'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Image with Detection */}
            <div className="nature-border rounded-xl p-4 sm:p-6 card-dark shadow-lg">
              <h3 className="text-base sm:text-lg font-display font-bold mb-3 sm:mb-4 text-white">Damage Detection</h3>
              <ImageWithBoundingBoxes 
                imageUrl={analysis.imageUrl} 
                detections={analysis.detections || []} 
              />
              {analysis.detections && analysis.detections.length > 0 && (
                <div className="mt-3 sm:mt-4 space-y-2">
                  <div className="text-xs sm:text-sm font-bold text-gray-300">Detected Damages:</div>
                  {analysis.detections.map((detection, index) => (
                    <div key={index} className="flex justify-between items-center bg-slate-700 rounded p-2 sm:p-3 border border-slate-600">
                      <span className="text-xs sm:text-sm font-bold text-white">{detection.damageType}</span>
                      <span className="text-xs sm:text-sm font-bold text-green-400">{detection.confidence}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Analysis Details */}
            <div className="space-y-4 sm:space-y-6">
              {/* Total Cost */}
              <div className="nature-border rounded-xl p-4 sm:p-6 card-dark shadow-lg">
                <div className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 uppercase tracking-wide text-gray-400">TOTAL ESTIMATED REPAIR COST</div>
                <div className="text-3xl sm:text-6xl font-display font-black mb-3 sm:mb-4 text-green-400" style={{ fontWeight: '900' }}>{analysis.estimatedCost}</div>
                
                {/* Cost Breakdown */}
                {analysis.costBreakdown && analysis.costBreakdown.length > 0 && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-slate-600">
                    <div className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 uppercase tracking-wide text-gray-400">COST BREAKDOWN BY DAMAGE TYPE</div>
                    <div className="space-y-2 sm:space-y-3">
                      {analysis.costBreakdown.map((damage, index) => (
                        <div key={index} className="bg-slate-700 rounded-lg p-3 sm:p-4 border-2 border-slate-600">
                          <div className="flex justify-between items-start mb-1 sm:mb-2">
                            <div>
                              <div className="font-black text-base sm:text-lg text-white">
                                {damage.damageType} {damage.count > 1 && `(${damage.count}x)`}
                              </div>
                              <div className="text-xs sm:text-sm font-bold text-gray-400">
                                {damage.severity} • {damage.avgConfidence}% confidence
                              </div>
                            </div>
                          </div>
                          <div className="font-black text-lg sm:text-xl text-green-400">
                            {damage.costRange}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-slate-600">
                  <div>
                    <div className="text-xs sm:text-sm font-bold mb-1 text-gray-400">Primary Damage</div>
                    <div className="font-black text-base sm:text-xl text-white">{analysis.damageDetection.damageType}</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold mb-1 text-gray-400">Overall Severity</div>
                    <div className="font-black text-base sm:text-xl" style={{
                      color: analysis.damageDetection.severity === 'Severe' ? '#EF4444' :
                             analysis.damageDetection.severity === 'Moderate' ? '#F59E0B' :
                             '#10B981'
                    }}>
                      {analysis.damageDetection.severity}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Confidence */}
              <div className="nature-border rounded-xl p-4 sm:p-6 card-dark shadow-lg">
                <div className="text-base sm:text-lg font-display font-bold mb-3 sm:mb-4 text-white">AI Confidence Score</div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs sm:text-sm font-bold text-gray-400">Detection Confidence</span>
                      <span className="font-black text-xl sm:text-2xl text-green-400">{analysis.damageDetection.confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3 sm:h-4">
                      <div
                        className="bg-primary h-3 sm:h-4 rounded-full transition-all"
                        style={{ width: `${analysis.damageDetection.confidence}%`, backgroundColor: '#10B981' }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t-2 border-slate-600">
                    <div>
                      <div className="text-xs sm:text-sm font-bold mb-1 text-gray-400">Affected Area</div>
                      <div className="font-black text-base sm:text-xl text-white">{analysis.damageDetection.affectedArea} px²</div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold mb-1 text-gray-400">Model Version</div>
                      <div className="font-black text-base sm:text-xl text-white">{analysis.modelVersion}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="nature-border rounded-xl p-4 sm:p-6 card-dark shadow-lg">
                <div className="text-base sm:text-lg font-display font-bold mb-3 sm:mb-4 text-white">Vehicle Information</div>
                <div className="space-y-2 sm:space-y-3">
                  {analysis.vehicleDetails.carCategory && (
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm sm:text-base text-gray-400">Category:</span>
                      <span className="font-black text-base sm:text-xl text-green-400">{analysis.vehicleDetails.carCategory}</span>
                    </div>
                  )}
                  {analysis.vehicleDetails.carType && (
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm sm:text-base text-gray-400">Type:</span>
                      <span className="font-black text-base sm:text-xl text-white">{analysis.vehicleDetails.carType}</span>
                    </div>
                  )}
                  {analysis.vehicleDetails.brand && (
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm sm:text-base text-gray-400">Brand:</span>
                      <span className="font-black text-base sm:text-xl text-white">{analysis.vehicleDetails.brand}</span>
                    </div>
                  )}
                  {analysis.vehicleDetails.model && (
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm sm:text-base text-gray-400">Model:</span>
                      <span className="font-black text-base sm:text-xl text-white">{analysis.vehicleDetails.model}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}



