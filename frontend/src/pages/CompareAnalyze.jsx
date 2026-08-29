import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Upload, X, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react'
import { API_URL } from '../config'

// Tooltip component for explanations
function InfoTooltip({ text }) {
  const [show, setShow] = useState(false)
  
  return (
    <div className="relative inline-block ml-1">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-gray-500 hover:text-primary transition"
      >
        <HelpCircle size={14} />
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-light-bg border-2 border-primary rounded-lg text-xs text-gray-300 shadow-xl">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary"></div>
        </div>
      )}
    </div>
  )
}

export default function CompareAnalyze() {
  const navigate = useNavigate()
  const location = useLocation()
  const [carCategory, setCarCategory] = useState('')
  const [image1, setImage1] = useState(null)
  const [image2, setImage2] = useState(null)
  const [preview1, setPreview1] = useState(null)
  const [preview2, setPreview2] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  // Restore state when coming back from report page
  useEffect(() => {
    const savedState = sessionStorage.getItem('compareAnalyzeState')
    if (savedState) {
      try {
        const { carCategory: savedCategory, results: savedResults, preview1: savedPreview1, preview2: savedPreview2 } = JSON.parse(savedState)
        setCarCategory(savedCategory)
        setResults(savedResults)
        setPreview1(savedPreview1)
        setPreview2(savedPreview2)
      } catch (e) {
        console.error('Failed to restore state:', e)
      }
    }
  }, [])

  // Save state whenever results change
  useEffect(() => {
    if (results) {
      sessionStorage.setItem('compareAnalyzeState', JSON.stringify({
        carCategory,
        results,
        preview1,
        preview2
      }))
    }
  }, [results, carCategory, preview1, preview2])

  const handleImageChange = (imageNum, e) => {
    if (!carCategory) {
      setError('Please select a car category first')
      return
    }

    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file')
        return
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB')
        return
      }

      setError('')
      const preview = URL.createObjectURL(file)
      
      if (imageNum === 1) {
        setImage1(file)
        setPreview1(preview)
      } else {
        setImage2(file)
        setPreview2(preview)
      }
    }
  }

  const handleCompare = async () => {
    if (!carCategory) {
      setError('Please select a car category')
      return
    }

    if (!image1 || !image2) {
      setError('Please upload both images to compare')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Analyze first image
      const formData1 = new FormData()
      formData1.append('image', image1)
      formData1.append('carCategory', carCategory)

      const res1 = await axios.post(`${API_URL}/analysis/analyze`, formData1, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Analyze second image
      const formData2 = new FormData()
      formData2.append('image', image2)
      formData2.append('carCategory', carCategory)

      const res2 = await axios.post(`${API_URL}/analysis/analyze`, formData2, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setResults({
        image1: res1.data.analysis,
        image2: res2.data.analysis
      })
    } catch (err) {
      setError('Failed to analyze images. Please ensure both images show vehicle damage.')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'minor': return 'text-green-500'
      case 'moderate': return 'text-yellow-500'
      case 'severe': return 'text-red-500'
      default: return 'text-gray-700'
    }
  }

  const ImageUploadBox = ({ imageNum, image, preview, onChange }) => (
    <div className="rounded-xl p-6 card-dark shadow-lg border-2 border-white/10">
      <h3 className="text-lg font-display font-bold mb-4 text-white">Image {imageNum}</h3>
      
      {preview ? (
        <div className="relative">
          <img src={preview} alt={`Preview ${imageNum}`} className="w-full h-64 object-cover rounded-lg" />
          <button
            type="button"
            onClick={() => {
              if (imageNum === 1) {
                setImage1(null)
                setPreview1(null)
              } else {
                setImage2(null)
                setPreview2(null)
              }
            }}
            className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600 transition"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
      ) : (
        <label className={`block ${carCategory ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onChange(imageNum, e)}
            disabled={!carCategory}
            className="hidden"
          />
          <div className="border-2 border-dashed rounded-xl p-8 text-center transition border-slate-600 hover:border-primary">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
              carCategory ? 'bg-primary/20' : 'bg-gray-700/20'
            }`}>
              <Upload className={carCategory ? 'text-primary' : 'text-gray-500'} size={32} />
            </div>
            <p className="text-gray-300 mb-2">
              {carCategory ? 'Click to upload' : 'Select category first'}
            </p>
            <div className={`inline-block px-4 py-2 border-2 rounded-lg transition text-white ${
              carCategory ? 'border-slate-600 hover:border-primary' : 'border-slate-700 opacity-50'
            }`}>
              Browse
            </div>
          </div>
        </label>
      )}
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="border-b border-primary/20 px-8 py-4 glass-effect shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={() => {
            sessionStorage.removeItem('compareAnalyzeState')
            navigate('/dashboard')
          }} className="p-2 hover:text-cyan-300 transition text-white">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center font-bold text-white shadow-lg">AI</div>
            <span className="text-2xl font-display font-bold text-white">CAR SCAN</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl font-display font-extrabold mb-2 text-white">COMPARE DAMAGE</h1>
          <p className="text-cyan-100 mb-8">Upload two images to compare damage severity and cost estimates</p>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-red-400">
              {error}
            </div>
          )}

          {/* Car Category Selection */}
          <div className="rounded-xl p-6 card-dark shadow-lg border-2 border-white/10 mb-6">
            <label className="block text-sm mb-2 font-bold text-white">Car Category</label>
            <select
              value={carCategory}
              onChange={(e) => setCarCategory(e.target.value)}
              disabled={loading}
              className="w-full max-w-md px-4 py-3 text-white bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-primary outline-none transition shadow-sm"
            >
              <option value="">Select Category</option>
              <option value="Economy">Economy (Budget-friendly vehicles)</option>
              <option value="Medium">Medium (Mid-range vehicles)</option>
              <option value="Premium">Premium (Higher-end vehicles)</option>
              <option value="Luxury">Luxury (Luxury vehicles)</option>
            </select>
          </div>

          {!results ? (
            <>
              {/* Upload Section */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <ImageUploadBox 
                  imageNum={1} 
                  image={image1} 
                  preview={preview1} 
                  onChange={handleImageChange}
                />
                <ImageUploadBox 
                  imageNum={2} 
                  image={image2} 
                  preview={preview2} 
                  onChange={handleImageChange}
                />
              </div>

              {/* Compare Button */}
              <button
                onClick={handleCompare}
                disabled={loading || !image1 || !image2 || !carCategory}
                className="w-full py-4 nature-button rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                {loading ? 'Analyzing...' : 'Compare Images →'}
              </button>
            </>
          ) : (
            <>
              {/* Comparison Results */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Image 1 Results */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="nature-border rounded-xl overflow-hidden bg-gradient-to-br from-dark-light/50 to-dark-light/20"
                >
                  <div className="relative h-56 bg-white/80">
                    <img src={preview1} alt="Image 1" className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-dark/70 rounded-full text-sm font-semibold">
                      Image 1 Analysis
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <span className="text-white font-bold">Damage Type</span>
                        <InfoTooltip text="What kind of damage: scratch, dent, tire flat, etc." />
                      </div>
                      <span className="font-bold text-white text-right">{results.image1.damageType}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <span className="text-white font-bold">Severity</span>
                        <InfoTooltip text="Minor (small fix), Moderate (medium), Severe (major repair)" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getSeverityColor(results.image1.severity)}`}>
                          {results.image1.severity}
                        </span>
                        <span className="text-lg">
                          {results.image1.severity === 'Severe' ? '🔴' :
                           results.image1.severity === 'Moderate' ? '🟡' : '🟢'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <span className="text-white font-bold">Confidence</span>
                        <InfoTooltip text="AI accuracy (0-100%). Above 70% is good." />
                      </div>
                      <span className="font-bold text-white">{results.image1.confidence}%</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <span className="text-white font-bold">Affected Area</span>
                        <InfoTooltip text="Size of damaged area in pixels." />
                      </div>
                      <span className="font-bold text-white">{results.image1.affectedArea} px²</span>
                    </div>
                    <div className="pt-3 border-t-2 border-slate-600">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span className="text-white font-bold">Estimated Cost</span>
                          <InfoTooltip text="Approximate repair cost. Actual may vary." />
                        </div>
                        <span className="font-bold text-green-400 text-2xl">₹{results.image1.estimatedCost}</span>
                      </div>
                      <p className="text-xs text-gray-300 mb-3 font-medium">💡 Get quotes from mechanics</p>
                      <button
                        onClick={() => navigate(`/report/${results.image1.reportId}`, { 
                          state: { from: '/compare-analyze' } 
                        })}
                        className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/80 transition"
                      >
                        View Full Report
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Image 2 Results */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="nature-border rounded-xl overflow-hidden bg-gradient-to-br from-dark-light/50 to-dark-light/20"
                >
                  <div className="relative h-56 bg-white/80">
                    <img src={preview2} alt="Image 2" className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-dark/70 rounded-full text-sm font-semibold">
                      Image 2 Analysis
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <span className="text-white font-bold">Damage Type</span>
                        <InfoTooltip text="What kind of damage: scratch, dent, tire flat, etc." />
                      </div>
                      <span className="font-bold text-white text-right">{results.image2.damageType}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <span className="text-white font-bold">Severity</span>
                        <InfoTooltip text="Minor (small fix), Moderate (medium), Severe (major repair)" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getSeverityColor(results.image2.severity)}`}>
                          {results.image2.severity}
                        </span>
                        <span className="text-lg">
                          {results.image2.severity === 'Severe' ? '🔴' :
                           results.image2.severity === 'Moderate' ? '🟡' : '🟢'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <span className="text-white font-bold">Confidence</span>
                        <InfoTooltip text="AI accuracy (0-100%). Above 70% is good." />
                      </div>
                      <span className="font-bold text-white">{results.image2.confidence}%</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <span className="text-white font-bold">Affected Area</span>
                        <InfoTooltip text="Size of damaged area in pixels." />
                      </div>
                      <span className="font-bold text-white">{results.image2.affectedArea} px²</span>
                    </div>
                    <div className="pt-3 border-t-2 border-slate-600">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span className="text-white font-bold">Estimated Cost</span>
                          <InfoTooltip text="Approximate repair cost. Actual may vary." />
                        </div>
                        <span className="font-bold text-green-400 text-2xl">₹{results.image2.estimatedCost}</span>
                      </div>
                      <p className="text-xs text-gray-300 mb-3 font-medium">💡 Get quotes from mechanics</p>
                      <button
                        onClick={() => navigate(`/report/${results.image2.reportId}`, { 
                          state: { from: '/compare-analyze' } 
                        })}
                        className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/80 transition"
                      >
                        View Full Report
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Comparison Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl p-8 card-dark shadow-lg border-2 border-white/10"
              >
                <h3 className="text-3xl font-display font-bold mb-8 text-center text-white">Comparison Summary</h3>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 card-dark rounded-xl border-2 border-primary/30">
                    <div className="flex items-center justify-center mb-3">
                      <p className="text-white text-sm uppercase tracking-wide font-bold">Cost Difference</p>
                      <InfoTooltip text="The difference in repair costs between the two images. Shows which one is more expensive to fix." />
                    </div>
                    <p className="text-4xl font-display font-extrabold text-primary mb-2">
                      ₹{(() => {
                        const cost1 = typeof results.image1.estimatedCost === 'string'
                          ? parseInt(results.image1.estimatedCost.replace(/[₹,\s]/g, '')) || 0
                          : results.image1.estimatedCost || 0
                        const cost2 = typeof results.image2.estimatedCost === 'string'
                          ? parseInt(results.image2.estimatedCost.replace(/[₹,\s]/g, '')) || 0
                          : results.image2.estimatedCost || 0
                        return Math.abs(cost1 - cost2).toLocaleString('en-IN')
                      })()}
                    </p>
                    <p className="text-sm text-gray-300 font-medium">
                      {(() => {
                        const cost1 = typeof results.image1.estimatedCost === 'string'
                          ? parseInt(results.image1.estimatedCost.replace(/[₹,\s]/g, '')) || 0
                          : results.image1.estimatedCost || 0
                        const cost2 = typeof results.image2.estimatedCost === 'string'
                          ? parseInt(results.image2.estimatedCost.replace(/[₹,\s]/g, '')) || 0
                          : results.image2.estimatedCost || 0
                        
                        if (cost1 > cost2) return '🔴 Image 1 costs more'
                        if (cost2 > cost1) return '🔴 Image 2 costs more'
                        return '🟢 Same cost'
                      })()}
                    </p>
                  </div>

                  <div className="text-center p-6 card-dark rounded-xl border-2 border-primary/30">
                    <div className="flex items-center justify-center mb-3">
                      <p className="text-white text-sm uppercase tracking-wide font-bold">Severity Comparison</p>
                      <InfoTooltip text="Compares how serious the damage is in both images. Minor = small fix, Moderate = medium damage, Severe = major repair needed." />
                    </div>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="flex items-center gap-1">
                        <span className={`text-2xl font-bold ${getSeverityColor(results.image1.severity)}`}>
                          {results.image1.severity}
                        </span>
                        <span className="text-lg">
                          {results.image1.severity === 'Severe' ? '🔴' :
                           results.image1.severity === 'Moderate' ? '🟡' : '🟢'}
                        </span>
                      </div>
                      <ArrowRight className="text-gray-400" size={24} />
                      <div className="flex items-center gap-1">
                        <span className={`text-2xl font-bold ${getSeverityColor(results.image2.severity)}`}>
                          {results.image2.severity}
                        </span>
                        <span className="text-lg">
                          {results.image2.severity === 'Severe' ? '🔴' :
                           results.image2.severity === 'Moderate' ? '🟡' : '🟢'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 font-medium">
                      {results.image1.severity === results.image2.severity 
                        ? '🟡 Same severity level'
                        : '⚠️ Different severity'}
                    </p>
                  </div>

                  <div className="text-center p-6 card-dark rounded-xl border-2 border-primary/30">
                    <div className="flex items-center justify-center mb-3">
                      <p className="text-white text-sm uppercase tracking-wide font-bold">Area Difference</p>
                      <InfoTooltip text="Difference in the size of damaged areas. Larger number means one vehicle has much more damage area than the other." />
                    </div>
                    <p className="text-4xl font-display font-extrabold text-primary mb-2">
                      {Math.abs(results.image1.affectedArea - results.image2.affectedArea).toLocaleString()} px²
                    </p>
                    <p className="text-sm text-gray-300 font-medium">
                      {results.image1.affectedArea > results.image2.affectedArea 
                        ? '📏 Image 1 larger area' 
                        : results.image2.affectedArea > results.image1.affectedArea
                        ? '📏 Image 2 larger area'
                        : '🟢 Same area'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setResults(null)
                      setImage1(null)
                      setImage2(null)
                      setPreview1(null)
                      setPreview2(null)
                      sessionStorage.removeItem('compareAnalyzeState')
                    }}
                    className="flex-1 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary/80 transition"
                  >
                    New Comparison
                  </button>
                  <button
                    onClick={() => navigate('/history')}
                    className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:border-cyan-300 hover:text-cyan-300 transition"
                  >
                    View History
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}




