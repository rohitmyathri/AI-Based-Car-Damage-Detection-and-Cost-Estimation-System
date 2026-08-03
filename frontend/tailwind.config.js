/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vibrant primary colors
        primary: '#3B82F6',      // Bright Blue
        secondary: '#8B5CF6',    // Purple
        accent: '#F59E0B',       // Amber
        success: '#10B981',      // Emerald
        danger: '#EF4444',       // Red
        warning: '#F59E0B',      // Amber
        info: '#06B6D4',         // Cyan
        
        // Card backgrounds
        'card-blue': '#EFF6FF',
        'card-purple': '#F5F3FF',
        'card-amber': '#FFFBEB',
        'card-emerald': '#ECFDF5',
        
        // Dark shades
        dark: '#1E293B',
        'dark-light': '#334155',
        
        // Light backgrounds
        'light-bg': '#F8FAFC',
        'light-gray': '#F1F5F9',
        
        // Text colors
        'text-dark': '#1F2937',
        'text-darker': '#111827'
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'Inter', 'sans-serif']
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        'gradient-accent': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        'gradient-success': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'gradient-multi': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #F59E0B 100%)',
      }
    },
  },
  plugins: [],
}
