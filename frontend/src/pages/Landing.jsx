import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Zap, Target, FileText } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <nav className="relative z-10 flex justify-between items-center px-12 py-6 glass-effect shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg">AI</div>
          <span className="text-2xl font-display font-bold tracking-wider text-white">CAR SCAN</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/login')} className="px-6 py-2 text-white hover:text-cyan-300 transition font-semibold">
            Sign In
          </button>
          <button onClick={() => navigate('/signup')} className="px-8 py-2 nature-button rounded-lg font-semibold shadow-lg">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-12 py-20 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block px-4 py-2 bg-white/90 border-2 border-cyan-300 rounded-full text-blue-700 text-sm mb-6 font-bold shadow-md">
            ✨ AI-POWERED ANALYSIS
          </div>
          <h1 className="text-6xl font-display font-extrabold mb-6 leading-tight text-white">
            INSTANT<br />
            <span className="text-cyan-300 text-glow">DAMAGE</span><br />
            DETECTION
          </h1>
          <p className="text-white text-lg mb-8 leading-relaxed">
            Upload a photo of your vehicle and let our advanced computer vision algorithms analyze the damage, estimate repair costs, and generate a detailed report in seconds.
          </p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/signup')} className="px-8 py-4 nature-button rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl">
              Start Analysis →
            </button>
            <button onClick={() => navigate('/login')} className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white/10 transition shadow-lg">
              Learn More
            </button>
          </div>
        </motion.div>


      </div>

      {/* Features */}
      <div className="relative z-10 container mx-auto px-12 py-20">
        <h2 className="text-4xl font-display font-bold text-center mb-4 text-white">WHY CHOOSE US</h2>
        <p className="text-center text-cyan-100 mb-16 text-lg">Experience the future of vehicle damage assessment</p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: 'INSTANT RESULTS', desc: 'Get damage analysis and cost estimates quickly using advanced computer vision technology.', gradient: 'from-blue-500 to-blue-600', bg: 'from-blue-50 to-blue-100' },
            { icon: Target, title: 'ACCURATE DETECTION', desc: 'Advanced algorithms designed to identify and assess vehicle damage with precision.', gradient: 'from-purple-500 to-purple-600', bg: 'from-purple-50 to-purple-100' },
            { icon: FileText, title: 'DETAILED REPORTS', desc: 'Generate comprehensive PDF reports suitable for insurance claims and repair documentation.', gradient: 'from-amber-500 to-amber-600', bg: 'from-amber-50 to-amber-100' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className={`rounded-xl p-8 bg-gradient-to-br ${feature.bg} border-2 border-white/10 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-display font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-700 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <footer className="relative z-10 text-center py-8 text-cyan-100 text-sm glass-effect border-t border-white/20">
        <p className="font-semibold">© 2025 AI Damage Analyzer. All rights reserved</p>
      </footer>
    </div>
  )
}




