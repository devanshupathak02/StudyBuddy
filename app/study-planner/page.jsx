"use client"

import { useAuth } from "@/contexts/auth-context"
import StudyPlanner from "@/components/study-planner"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function StudyPlannerPage() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push('/')}
          className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Home</span>
        </button>
        {user ? (
          <StudyPlanner user={user} />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to access the Study Planner</h2>
            <p className="text-gray-600">You need to be logged in to create and manage your study plans.</p>
          </div>
        )}
      </div>
    </div>
  )
} 