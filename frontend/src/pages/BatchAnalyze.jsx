import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Upload, X, ArrowLeft, CheckCircle, AlertCircle, Loader, HelpCircle } from 'lucide-react'
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

export default function BatchAnalyze() {
  const navigate = useNavigate()
  const [carCategory, setCarCategory] = useState('')
  const [images, setImages] = useState([])
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState('')

  // Restore state when coming back from report page
  useEffect(() => {
    const savedState = sessionStorage.getItem('batchAnalyzeState')
    if (savedState) {
      try {
        const { carCategory: savedCategory, results: savedResults } = JSON.parse(savedState)
        setCarCategory(savedCategory)
        setResults(savedResults)
      } catch (e) {
        console.error('Failed to restore state:', e)
      }
    }
  }, [])

  // Save state whenever results change
  useEffect(() => {
    if (results.length > 0) {
      sessionStorage.setItem('batchAnalyzeState', JSON.stringify({
        carCategory,
        results
      }))
    }
  }, [results, carCategory])

  const handleImageChange = (e) => {
    if (!carCategory) {
      setError('Please select a car category first')
      return
    }

    const files = Array.from(e.target.files)
    
    if (files.length > 10) {
      setError('Maximum 10 images allowed at once')
      return
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed')
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Each image must be less than 10MB')
        return false
      }
      return true
    })

    setError('')
    setImages(validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
      carCategory: carCategory // Store the default category with each image
    })))
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const updateImageCategory = (index, category) => {
    setImages(prev => prev.map((img, idx) => 
      idx === index ? { ...img, carCategory: category } : img
    ))
  }

  const processImages = async () => {
    if (!carCategory) {
      setError('Please select a default car category')
      return
    }

    if (images.length === 0) {
      setError('Please upload at least one image')
      return
    }

    setProcessing(true)
    setError('')
    const newResults = []

    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      
      // Update status to processing
      setImages(prev => prev.map((img, idx) => 
        idx === i ? { ...img, status: 'processing', progress: 50 } : img
      ))

      try {
        const formData = new FormData()
        formData.append('image', image.file)
        formData.append('carCategory', image.carCategory || carCategory)

        const res = await axios.post(`${API_URL}/analysis/analyze`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        // Update status to completed
        setImages(prev => prev.map((img, idx) => 
          idx === i ? { ...img, status: 'completed', progress: 100 } : img
        ))

        newResults.push({
          success: true,
          data: res.data.analysis,
          fileName: image.file.name,
          carCategory: image.carCategory || carCategory
        })
      } catch (err) {
        // Update status to error
        setImages(prev => prev.map((img, idx) => 
          idx === i ? { ...img, status: 'error', progress: 0 } : img
        ))

        newResults.push({
          success: false,
          error: err.response?.data?.error || 'Analysis failed',
          fileName: image.file.name
        })
      }
    }

    setResults(newResults)
    setProcessing(false)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />
      case 'processing':
        return <Loader className="text-primary animate-spin" size={20} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="border-b border-primary/20 px-8 py-4 glass-effect shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={() => {
            sessionStorage.removeItem('batchAnalyzeState')
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
          <h1 className="text-4xl font-display font-extrabold mb-2 text-white">BATCH ANALYSIS</h1>
          <p className="text-cyan-100 mb-8">Upload up to 10 images at once for efficient damage detection</p>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-red-400">
              {error}
            </div>
          )}

          {/* Car Category Selection */}
          <div className="rounded-xl p-6 card-dark shadow-lg border-2 border-white/10 mb-6">
            <label className="block text-sm mb-2 font-bold text-white">Default Car Category (can be changed per image)</label>
            <select
              value={carCategory}
              onChange={(e) => setCarCategory(e.target.value)}
              disabled={processing}
              className="w-full max-w-md px-4 py-3 text-white bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-primary outline-none transition shadow-sm"
            >
              <option value="">Select Category</option>
              <option value="Economy">Economy (Budget-friendly vehicles)</option>
              <option value="Medium">Medium (Mid-range vehicles)</option>
              <option value="Premium">Premium (Higher-end vehicles)</option>
              <option value="Luxury">Luxury (Luxury vehicles)</option>
            </select>
            <p className="text-xs text-gray-300 mt-2 font-semibold">💡 You can change the category for each image individually after uploading</p>
          </div>

          {/* Upload Area */}
          {images.length === 0 ? (
            <div className="nature-border rounded-xl p-6 card-dark">
              {!carCategory && (
                <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 mb-4 text-yellow-300 text-sm">
                  ⚠️ Please select a car category first
                </div>
              )}
              
              <label className={`block ${carCategory ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={!carCategory}
                  className="hidden"
                />
                <div className="border-2 border-dashed rounded-xl p-12 text-center transition border-slate-600 hover:border-primary">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    carCategory ? 'bg-primary/20' : 'bg-gray-700/20'
                  }`}>
                    <Upload className={carCategory ? 'text-primary' : 'text-gray-500'} size={40} />
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-2 text-white">UPLOAD MULTIPLE IMAGES</h3>
                  <p className="text-gray-300 mb-4">
                    {carCategory 
                      ? 'Select up to 10 images (JPG, PNG) - Max 10MB each' 
                      : 'Select a car category first to enable upload'}
                  </p>
                  <div className={`inline-block px-8 py-3 border-2 rounded-lg transition text-white ${
                    carCategory 
                      ? 'border-slate-600 hover:border-primary' 
                      : 'border-slate-700 opacity-50'
                  }`}>
                    Browse Files
                  </div>
                </div>
              </label>
            </div>
          ) : (
            <>
              {/* Image Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {images.map((image, index) => (
                  <div key={index} className="nature-border rounded-lg overflow-hidden bg-white/80">
                    <div className="relative">
                      <img src={image.preview} alt={`Preview ${index + 1}`} className="w-full h-40 object-cover" />
                      
                      {/* Status Overlay */}
                      {image.status !== 'pending' && (
                        <div className="absolute inset-0 bg-dark/70 flex items-center justify-center">
                          {getStatusIcon(image.status)}
                        </div>
                      )}

                      {/* Progress Bar */}
                      {image.status === 'processing' && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${image.progress}%` }}
                          />
                        </div>
                      )}

                      {/* Remove Button */}
                      {!processing && (
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {/* Category Selector */}
                    <div className="p-3">
                      <label className="block text-xs text-gray-700 mb-1">Car Category</label>
                      <select
                        value={image.carCategory || carCategory}
                        onChange={(e) => updateImageCategory(index, e.target.value)}
                        disabled={processing}
                        className="w-full px-2 py-1.5 text-sm bg-light-bg border border-gray-300 rounded focus:border-primary outline-none transition"
                      >
                        <option value="Economy">Economy</option>
                        <option value="Medium">Medium</option>
                        <option value="Premium">Premium</option>
                        <option value="Luxury">Luxury</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-4">
                {!processing && (
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files)
                        const totalImages = images.length + files.length
                        
                        if (totalImages > 10) {
                          setError(`Maximum 10 images allowed. You can add ${10 - images.length} more image(s).`)
                          return
                        }

                        const validFiles = files.filter(file => {
                          if (!file.type.startsWith('image/')) {
                            setError('Only image files are allowed')
                            return false
                          }
                          if (file.size > 10 * 1024 * 1024) {
                            setError('Each image must be less than 10MB')
                            return false
                          }
                          return true
                        })

                        setError('')
                        const newImages = validFiles.map(file => ({
                          file,
                          preview: URL.createObjectURL(file),
                          status: 'pending',
                          progress: 0,
                          carCategory: carCategory
                        }))
                        
                        setImages([...images, ...newImages])
                        e.target.value = '' // Reset input
                      }}
                      className="hidden"
                    />
                    <div className="py-4 px-6 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition text-center">
                      + Add More Images ({images.length}/10)
                    </div>
                  </label>
                )}
                
                <button
                  onClick={processImages}
                  disabled={processing}
                  className="flex-1 py-4 nature-button rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  {processing ? 'Processing...' : `Analyze ${images.length} Image${images.length > 1 ? 's' : ''} →`}
                </button>
                
                {!processing && (
                  <button
                    onClick={() => setImages([])}
                    className="px-6 py-4 border-2 border-white text-white rounded-lg font-semibold hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 transition"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-display font-bold text-white">Batch Analysis Results</h2>
                <div className="text-cyan-100">
                  {results.filter(r => r.success).length} of {results.length} successful
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {results.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="nature-border rounded-xl overflow-hidden bg-gradient-to-br from-dark-light/50 to-dark-light/20"
                  >
                    {result.success ? (
                      <>
                        {/* Image */}
                        <div className="relative h-48 bg-white/80">
                          <img 
                            src={`http://localhost:5000${result.data.imageUrl}`}
                            alt={`Analysis ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = images[index]?.preview || ''
                            }}
                          />
                          <div className="absolute top-3 left-3 px-3 py-1 bg-dark/70 rounded-full text-sm font-semibold">
                            Image {index + 1} Analysis
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-5 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <span className="font-bold text-white">Car Category</span>
                              <InfoTooltip text="The type of vehicle: Economy (budget cars), Medium (standard cars), Premium (high-end cars), or Luxury (expensive cars). This affects repair costs." />
                            </div>
                            <span className="font-black text-xl text-green-400">{result.carCategory || result.data.carCategory}</span>
                          </div>

                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <span className="font-bold text-white">Damage Type</span>
                              <InfoTooltip text="What kind of damage was found: scratch (surface damage), dent (body damage), tire flat (wheel damage), etc." />
                            </div>
                            <span className="font-black text-lg text-white">{result.data.damageType}</span>
                          </div>

                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <span className="font-bold text-white">Severity</span>
                              <InfoTooltip text="How bad the damage is: Minor (small, easy fix), Moderate (medium damage), or Severe (major damage, expensive repair)." />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-lg" style={{
                                color: result.data.severity === 'Severe' ? '#EF4444' :
                                       result.data.severity === 'Moderate' ? '#F97316' :
                                       '#22C55E'
                              }}>
                                {result.data.severity}
                              </span>
                              <span className="text-lg">
                                {result.data.severity === 'Severe' ? '🔴' :
                                 result.data.severity === 'Moderate' ? '🟡' : '🟢'}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <span className="font-bold text-white">Confidence</span>
                              <InfoTooltip text="How sure the AI is about its detection (0-100%). Higher percentage means more accurate. Above 70% is good, above 90% is excellent." />
                            </div>
                            <span className="font-black text-lg text-white">{result.data.confidence}%</span>
                          </div>

                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <span className="font-bold text-white">Affected Area</span>
                              <InfoTooltip text="The size of the damaged area in pixels. Larger number means bigger damage area." />
                            </div>
                            <span className="font-black text-lg text-white">{result.data.affectedArea} px²</span>
                          </div>

                          <div className="pt-3 border-t-2 border-slate-600">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <span className="font-bold text-white">Estimated Cost</span>
                                <InfoTooltip text="Approximate repair cost in Indian Rupees (₹). This is an estimate based on damage type, severity, and car category." />
                              </div>
                              <span className="font-black text-2xl text-green-400">₹{result.data.estimatedCost}</span>
                            </div>
                            <p className="text-xs font-medium text-gray-300">💡 Actual cost may vary. Get quotes from mechanics.</p>

                            <button
                              onClick={() => navigate(`/report/${result.data.reportId}`, { 
                                state: { from: '/batch-analyze' } 
                              })}
                              className="w-full mt-3 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/80 transition"
                            >
                              View Full Report
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Error State */}
                        <div className="relative h-48 bg-red-500/10 flex items-center justify-center">
                          <AlertCircle className="text-red-500" size={48} />
                          <div className="absolute top-3 left-3 px-3 py-1 bg-dark/70 rounded-full text-sm font-semibold">
                            Image {index + 1} Analysis
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="text-center">
                            <p className="font-semibold text-red-400 mb-2">Analysis Failed</p>
                            <p className="text-sm text-gray-300 font-medium">{result.error}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="nature-border rounded-xl p-6 card-dark text-center">
                  <div className="text-3xl font-display font-bold text-primary mb-2">
                    {results.filter(r => r.success).length}
                  </div>
                  <div className="flex items-center justify-center text-white">
                    Successful Analyses
                    <InfoTooltip text="Number of images that were successfully analyzed by the AI system." />
                  </div>
                </div>

                <div className="nature-border rounded-xl p-6 card-dark text-center">
                  <div className="text-3xl font-display font-bold text-primary mb-2">
                    ₹{results
                      .filter(r => r.success)
                      .reduce((sum, r) => {
                        const cost = r.data.estimatedCost
                        // Handle both string and number formats
                        const numericCost = typeof cost === 'string' 
                          ? parseInt(cost.replace(/[₹,\s]/g, '')) || 0
                          : cost || 0
                        return sum + numericCost
                      }, 0)
                      .toLocaleString('en-IN')}
                  </div>
                  <div className="flex items-center justify-center text-white">
                    Total Estimated Cost
                    <InfoTooltip text="Sum of all repair costs for all analyzed images. This is the total amount you might need to spend." />
                  </div>
                  <p className="text-xs text-gray-300 mt-2">💰 Budget accordingly</p>
                </div>

                <div className="nature-border rounded-xl p-6 card-dark text-center">
                  <div className="text-3xl font-display font-bold text-primary mb-2">
                    {results.filter(r => r.success).length > 0
                      ? Math.round(
                          results
                            .filter(r => r.success)
                            .reduce((sum, r) => sum + r.data.confidence, 0) /
                          results.filter(r => r.success).length
                        )
                      : 0}%
                  </div>
                  <div className="flex items-center justify-center text-white">
                    Average Confidence
                    <InfoTooltip text="Average accuracy of all detections. Higher is better. Above 80% means the AI is very confident about the results." />
                  </div>
                  <p className="text-xs text-gray-300 mt-2">
                    {results.filter(r => r.success).length > 0 && 
                     Math.round(results.filter(r => r.success).reduce((sum, r) => sum + r.data.confidence, 0) / results.filter(r => r.success).length) >= 80
                      ? '✅ High accuracy'
                      : '⚠️ Consider manual verification'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/history')}
                  className="flex-1 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary/80 transition"
                >
                  View All Reports
                </button>
                <button
                  onClick={() => {
                    setImages([])
                    setResults([])
                    sessionStorage.removeItem('batchAnalyzeState')
                  }}
                  className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:border-cyan-300 hover:text-cyan-300 transition"
                >
                  New Batch
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}




