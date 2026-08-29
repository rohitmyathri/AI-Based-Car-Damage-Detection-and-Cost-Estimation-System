import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Upload, X, ArrowLeft, Camera } from 'lucide-react'
import { API_URL } from '../config'

export default function Analyze() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    carCategory: ''
  })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const mobileFileInputRef = useRef(null)

  const handleImageChange = (e) => {
    if (!formData.carCategory) {
      setError('Please select a car category first')
      return
    }
    
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (JPG, PNG, etc.)')
        return
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB. Please upload a smaller image.')
        return
      }
      
      setError('')
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleMobileCameraClick = () => {
    if (!formData.carCategory) {
      setError('Please select a car category first')
      return
    }
    
    if (mobileFileInputRef.current) {
      mobileFileInputRef.current.click()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.carCategory) {
      setError('Please select a car category')
      return
    }
    
    if (!image) {
      setError('Please upload an image')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = new FormData()
      data.append('image', image)
      data.append('carCategory', formData.carCategory)

      const res = await axios.post(`${API_URL}/analysis/analyze`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      navigate(`/report/${res.data.analysis.reportId}`, { 
        state: { from: '/analyze' } 
      })
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      
      if (errorMessage.includes('No vehicle detected') || errorMessage.includes('Please upload a car image')) {
        setError('Please upload a car image. No vehicle detected in the uploaded image.');
      } else if (errorMessage.includes('No damage detected')) {
        setError('No damage detected in the image. Please upload an image with visible vehicle damage.');
      } else {
        setError('Please upload the image properly or your vehicle has no damage');
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Header */}
      <nav className="border-b border-primary/20 px-4 py-3 glass-effect shadow-lg">
        <div className="flex items-center gap-3 max-w-7xl mx-auto">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:text-cyan-300 transition text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-md">AI</div>
            <span className="text-lg font-display font-bold text-white">CAR SCAN</span>
          </div>
        </div>
      </nav>

      <div className="w-full px-4 py-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-display font-extrabold mb-2 text-white">ANALYZE DAMAGE</h1>
          <p className="text-sm text-cyan-100 mb-6">Upload an image of your vehicle to detect damage</p>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Details */}
            <div className="rounded-xl p-4 card-dark shadow-lg border-2 border-white/10">
              <h2 className="text-lg font-display font-bold mb-4 text-white">Vehicle Details</h2>
              <p className="text-xs text-gray-300 mb-4 font-semibold">Select your car category</p>

              <div>
                <label className="block text-sm mb-2 font-semibold text-white">Car Category</label>
                <select
                  value={formData.carCategory}
                  onChange={(e) => setFormData({ ...formData, carCategory: e.target.value })}
                  className="w-full px-3 py-3 text-base text-white bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-primary outline-none shadow-sm"
                >
                  <option value="">Select Category</option>
                  <option value="Economy">Economy</option>
                  <option value="Medium">Medium</option>
                  <option value="Premium">Premium</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div className="rounded-xl p-4 card-dark shadow-lg border-2 border-white/10">
              {!formData.carCategory && (
                <div className="bg-amber-100/20 border-2 border-amber-400 rounded-lg p-3 mb-4 text-amber-300 text-sm font-semibold">
                  ⚠️ Select a car category first
                </div>
              )}
              
              <div className={`border-2 border-dashed rounded-xl p-6 text-center ${
                formData.carCategory ? 'border-slate-600' : 'border-slate-700 opacity-50'
              }`}>
                {image ? (
                  <div className="py-8">
                    <h3 className="text-lg font-display font-bold text-white mb-2">Ready for Analysis</h3>
                    <p className="text-sm text-cyan-100 mb-4">Image uploaded successfully</p>
                    <button
                      type="button"
                      onClick={() => { setImage(null); setPreview(null); }}
                      className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 text-white font-semibold"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className={`block ${formData.carCategory ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={!formData.carCategory}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
                          formData.carCategory ? 'bg-primary/20' : 'bg-gray-700/20'
                        }`}>
                          <Upload className={formData.carCategory ? 'text-primary' : 'text-gray-500'} size={24} />
                        </div>
                        <h3 className="text-base font-display font-bold mb-2 text-white">UPLOAD IMAGE</h3>
                        <p className="text-xs text-gray-300 mb-3">
                          {formData.carCategory ? 'Tap to browse files' : 'Select category first'}
                        </p>
                        <div className={`px-5 py-2 text-sm border-2 rounded-lg text-white ${
                          formData.carCategory ? 'border-slate-600' : 'border-slate-700 opacity-50'
                        }`}>
                          Browse Files
                        </div>
                      </div>
                    </label>
                    
                    <div className="my-4 flex items-center">
                      <div className="flex-1 h-px bg-slate-600"></div>
                      <span className="px-3 text-xs text-gray-400">OR</span>
                      <div className="flex-1 h-px bg-slate-600"></div>
                    </div>
                    
                    <input
                      ref={mobileFileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    
                    <button
                      type="button"
                      onClick={handleMobileCameraClick}
                      disabled={!formData.carCategory}
                      className={`w-full px-5 py-3 text-base rounded-lg font-semibold flex items-center justify-center gap-2 ${
                        formData.carCategory 
                          ? 'bg-secondary hover:bg-secondary/90 text-white' 
                          : 'bg-gray-700/20 text-gray-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Camera size={20} />
                      Take Photo
                    </button>
                    
                    <p className="mt-3 text-xs text-gray-400 text-center">
                      Opens camera on mobile
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !image || !formData.carCategory}
                className="w-full mt-4 py-3 text-base nature-button rounded-lg font-semibold disabled:opacity-50 text-white"
              >
                {loading ? 'Analyzing...' : 'Analyze Damage →'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
