"use client"

import { useState } from "react"
import { Menu, X, Bot, Home, Star, Mail, LogOut, User, Calendar } from "lucide-react"
import Link from "next/link"

export default function Navbar({ onAuthClick, user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { 
      name: "Home", 
      href: "/", 
      icon: Home, 
      onClick: (e) => {
        e.preventDefault()
        window.scrollTo(0, 0)
      }
    },
    { name: "Study Planner", href: "/study-planner", icon: Calendar },
    { 
      name: "Features", 
      href: "#features", 
      icon: Star,
      onClick: (e) => {
        e.preventDefault()
        const featuresSection = document.getElementById('features')
        if (featuresSection) {
          featuresSection.scrollIntoView({ behavior: 'smooth' })
        }
      }
    },
    { 
      name: "Contact", 
      href: "#contact", 
      icon: Mail,
      onClick: (e) => {
        e.preventDefault()
        const footerSection = document.querySelector('footer')
        if (footerSection) {
          footerSection.scrollIntoView({ behavior: 'smooth' })
        }
      }
    },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-purple-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-purple-800">StudyBuddy AI</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const IconComponent = link.icon
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={link.onClick}
                  className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full border border-purple-200">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-full">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Welcome back</span>
                    <span className="font-semibold text-purple-600">{user.name}</span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 px-4 py-2 rounded-full border border-gray-200 hover:border-red-200 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onAuthClick("login")}
                  className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => onAuthClick("signup")}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-md"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-purple-600 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white rounded-b-2xl border-t border-purple-200 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => {
                const IconComponent = link.icon
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      if (link.onClick) link.onClick(e)
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 block px-3 py-2 rounded-xl font-medium transition-all duration-200"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{link.name}</span>
                  </Link>
                )
              })}
              <div className="flex flex-col space-y-2 pt-4 border-t border-purple-200">
                {user ? (
                  <>
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-2 rounded-xl border border-purple-200">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-full">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Welcome back</span>
                        <span className="font-semibold text-purple-600">{user.name}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onLogout()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 px-3 py-2 rounded-xl border border-gray-200 hover:border-red-200 transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onAuthClick("login")
                        setIsMenuOpen(false)
                      }}
                      className="text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-xl font-medium transition-all duration-200 text-left"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        onAuthClick("signup")
                        setIsMenuOpen(false)
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
