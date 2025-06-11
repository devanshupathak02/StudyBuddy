"use client"

import { useState } from "react"
import { MessageCircle, FileCheck, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react"

function FeatureCard({ feature, index }) {
  const [isHovered, setIsHovered] = useState(false)
  const IconComponent = feature.icon

  return (
    <div
      className={`${feature.bgColor} rounded-3xl p-8 border-4 border-white shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon and Emoji */}
      <div className="flex items-center justify-center mb-6">
        <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-full shadow-lg`}>
          <IconComponent className="h-8 w-8 text-white" />
        </div>
        <div className="text-4xl ml-4">{feature.emoji}</div>
      </div>

      {/* Content */}
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
        <p className="text-gray-600 leading-relaxed">{feature.description}</p>

        {/* Details List */}
        <div
          className={`space-y-2 transition-all duration-300 ${isHovered ? "opacity-100 max-h-40" : "opacity-0 max-h-0 overflow-hidden"}`}
        >
          {feature.details.map((detail, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <span>{detail}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          className={`bg-gradient-to-r ${feature.color} text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 mt-4`}
        >
          Learn More
        </button>
      </div>
    </div>
  )
}

export default function FeatureCards() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const features = [
    {
      icon: MessageCircle,
      emoji: "🤖",
      title: "Ask Questions → Get Instant Answers",
      description: "Stuck on a problem? Just ask! Our AI provides clear, step-by-step explanations for any subject.",
      details: [
        "Available 24/7 for instant help",
        "Covers all subjects from math to literature",
        "Explains concepts in simple terms",
        "Interactive problem-solving",
      ],
      color: "from-purple-500 to-blue-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: FileCheck,
      emoji: "📝",
      title: "Auto-Graded Homework Feedback",
      description: "Upload your homework and get detailed feedback with suggestions for improvement.",
      details: [
        "Instant grading and scoring",
        "Detailed feedback on mistakes",
        "Improvement suggestions",
        "Track your progress over time",
      ],
      color: "from-pink-500 to-red-500",
      bgColor: "bg-pink-50",
    },
    {
      icon: TrendingUp,
      emoji: "📈",
      title: "Personalized Progress Tracker",
      description: "Monitor your learning journey with detailed analytics and personalized study recommendations.",
      details: [
        "Visual progress charts",
        "Strength and weakness analysis",
        "Personalized study plans",
        "Achievement badges and rewards",
      ],
      color: "from-green-500 to-teal-500",
      bgColor: "bg-green-50",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length)
  }

  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Amazing Features Just for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">You! ✨</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how our AI Teaching Assistant makes learning easier, faster, and more fun!
          </p>
        </div>

        {/* Desktop Cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Mobile Slider */}
        <div className="md:hidden">
          <div className="relative">
            <FeatureCard feature={features[currentSlide]} index={currentSlide} />

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={prevSlide}
                className="bg-white p-3 rounded-full shadow-lg border-2 border-purple-200 hover:bg-purple-50 transition-colors duration-200"
              >
                <ChevronLeft className="h-6 w-6 text-purple-600" />
              </button>

              {/* Dots Indicator */}
              <div className="flex space-x-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                      index === currentSlide ? "bg-purple-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="bg-white p-3 rounded-full shadow-lg border-2 border-purple-200 hover:bg-purple-50 transition-colors duration-200"
              >
                <ChevronRight className="h-6 w-6 text-purple-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
