"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import Navbar from "../components/navbar"
import Footer from "../components/footer"
import HeroSection from "../components/hero-section"
import FeatureCards from "../components/feature-cards"
import AuthModal from "../components/auth-modal"
import ChatInterface from "../components/chat-interface"
import QuizInterface from "../components/quiz-interface"
import { Toaster } from 'react-hot-toast'
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const router = useRouter()
  const { user, login, logout } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState("login") // 'login' or 'signup'
  const [showChat, setShowChat] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)

  const handleAuthClick = (mode) => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const handleAuthSuccess = (userData) => {
    login(userData)
    setShowAuthModal(false)
  }

  const handleLogout = () => {
    logout()
  }

  const handleFeatureClick = (featureId) => {
    if (!user) {
      handleAuthClick("login")
      return
    }

    switch (featureId) {
      case 1: // AI Teaching Assistant
        setShowChat(true)
        break
      case 2: // AI Self-Assessment Quiz
        router.push('/quiz')
        break
      case 3: // Progress Tracking
        // TODO: Implement progress tracking feature
        console.log("Progress tracking feature coming soon!")
        break
      default:
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Navbar onAuthClick={handleAuthClick} user={user} onLogout={handleLogout} />
      <HeroSection onGetStarted={() => handleAuthClick("signup")} user={user} />
      <FeatureCards user={user} onAuthClick={handleAuthClick} onFeatureClick={handleFeatureClick} />
      <Footer />
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={() => setAuthMode(authMode === "login" ? "signup" : "login")}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
      {showChat && user && (
        <ChatInterface user={user} onClose={() => setShowChat(false)} />
      )}
      <Toaster position="top-center" />
    </div>
  )
}
