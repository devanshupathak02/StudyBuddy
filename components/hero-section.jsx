"use client"

import { ArrowRight, Sparkles, BookOpen, Users } from "lucide-react"

export default function HeroSection({ onGetStarted, user }) {
  return (
    <section className="pt-52 pb-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                <span>AI-Powered Learning</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight">
                Meet Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  Smart Study Buddy!
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Get instant help with homework, quizzes, and progress – powered by AI. Your personal teaching assistant
                is here to make learning fun and effective! 🎓
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-md border-2 border-purple-200">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-gray-700">10K+ Students</span>
              </div>
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-md border-2 border-pink-200">
                <BookOpen className="h-5 w-5 text-pink-600" />
                <span className="font-semibold text-gray-700">50+ Subjects</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!user && (
                <button
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              )}
              <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg border-2 border-purple-300 hover:bg-purple-50 transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2">
                <span>Watch Demo</span>
                <span>▶️</span>
              </button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="bg-white rounded-2xl p-6 transform -rotate-3">
                <div className="text-center space-y-4">
                  {/* Robot Character */}
                  <div className="text-6xl mb-4">🤖</div>
                  <div className="space-y-2">
                    <div className="bg-purple-100 rounded-full p-3 inline-block">
                      <span className="text-2xl">👋</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Hi there!</h3>
                    <p className="text-gray-600">I'm here to help you learn!</p>
                  </div>

                  {/* Chat Bubbles */}
                  <div className="space-y-2 text-left">
                    <div className="bg-purple-500 text-white p-3 rounded-2xl rounded-bl-sm max-w-xs">
                      <p className="text-sm">Can you help me with math homework?</p>
                    </div>
                    <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-br-sm max-w-xs ml-auto">
                      <p className="text-sm">Of course! I'd love to help you solve it step by step! 📚✨</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -left-4 bg-yellow-300 rounded-full p-3 animate-bounce">
              <span className="text-2xl">💡</span>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-green-300 rounded-full p-3 animate-pulse">
              <span className="text-2xl">📈</span>
            </div>
            <div className="absolute top-1/2 -right-8 bg-blue-300 rounded-full p-3 animate-bounce delay-300">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
