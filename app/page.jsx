"use client"

import { useState } from "react"
import Navbar from "../components/navbar"
import Footer from "../components/footer"
import HeroSection from "../components/hero-section"
import FeatureCards from "../components/feature-cards"
import AuthModal from "../components/auth-modal"
import { Toaster } from 'react-hot-toast'

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState("login") // 'login' or 'signup'
  const [user, setUser] = useState(null)

  const handleAuthClick = (mode) => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const handleAuthSuccess = (userData) => {
    setUser(userData)
    setShowAuthModal(false)
  }

  const handleLogout = () => {
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Toaster position="top-center" />
      <Navbar onAuthClick={handleAuthClick} user={user} onLogout={handleLogout} />

      <main className="pt-20">
        <HeroSection onGetStarted={() => handleAuthClick("signup")} user={user} />
        <FeatureCards />

        {/* Call to Action Section */}
        {!user && (
          <section className="py-16 px-4 bg-gradient-to-r from-purple-100 to-pink-100">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-white rounded-3xl p-8 shadow-lg border-4 border-purple-200">
                <h2 className="text-3xl font-bold text-purple-800 mb-4">Ready to Start Learning? 🚀</h2>
                <p className="text-gray-600 mb-6 text-lg">
                  Join thousands of students already using our AI Teaching Assistant!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => handleAuthClick("signup")}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Sign Up Free ✨
                  </button>
                  <button
                    onClick={() => handleAuthClick("login")}
                    className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg border-2 border-purple-300 hover:bg-purple-50 transform hover:scale-105 transition-all duration-200"
                  >
                    Already Have Account? 👋
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  )
}
