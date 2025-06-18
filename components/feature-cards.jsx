"use client"

import { useState } from "react"
import { MessageCircle, TrendingUp, Lock } from "lucide-react"

function FeatureCard({ feature, user, onFeatureClick }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`${feature.bgColor} rounded-3xl p-8 border-4 border-white shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon and Emoji */}
      <div className="flex items-center justify-center mb-6">
        <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-full shadow-lg`}>
          <feature.icon className="h-8 w-8 text-white" />
        </div>
        <div className="text-4xl ml-4">{feature.emoji}</div>
      </div>

      {/* Content */}
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
        <p className="text-gray-600 leading-relaxed">{feature.description}</p>

        {/* Details List */}
        <div
          className={`space-y-2 transition-all duration-300 ${
            isHovered ? "opacity-100 max-h-40" : "opacity-0 max-h-0 overflow-hidden"
          }`}
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
          onClick={() => onFeatureClick(feature.id)}
          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
            user
              ? `bg-gradient-to-r ${feature.buttonColor} text-white hover:opacity-90`
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {user ? (
            "Use Feature"
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Lock className="h-4 w-4" />
              Login to Unlock
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export default function FeatureCards({ user, onAuthClick, onFeatureClick }) {
  const features = [
    {
      id: 1,
      title: "AI Teaching Assistant",
      description: "Get instant help with your studies from our AI-powered teaching assistant. Ask questions, get explanations, and learn at your own pace.",
      icon: MessageCircle,
      emoji: "🤖",
      color: "from-purple-500 to-blue-500",
      buttonColor: "from-purple-500 to-blue-500",
      bgColor: "bg-purple-50",
      details: [
        "Available 24/7 for instant help",
        "Covers all subjects from math to literature",
        "Explains concepts in simple terms",
        "Interactive problem-solving",
      ],
    },
    {
      id: 2,
      title: "Progress Tracking",
      description: "Monitor your learning progress with detailed analytics and insights. Celebrate your achievements and identify areas for improvement.",
      icon: TrendingUp,
      emoji: "📊",
      color: "from-green-500 to-teal-500",
      buttonColor: "from-green-500 to-teal-500",
      bgColor: "bg-green-50",
      details: [
        "Visual progress charts",
        "Strength and weakness analysis",
        "Personalized study plans",
        "Achievement badges",
      ],
    },
  ]

  return (
    <section id="features" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Powerful Features to Enhance Your Learning
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              user={user}
              onFeatureClick={onFeatureClick}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
