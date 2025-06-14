"use client"

import React, { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../contexts/auth-context'
import EnhancedCalendar from './enhanced-calendar'

export default function StudyPlanner({ user }) {
  const [studyPlans, setStudyPlans] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCreating, setIsCreating] = useState(false)
  const [newPlan, setNewPlan] = useState({
    title: '',
    subject: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    tasks: []
  })
  const [showPlanForm, setShowPlanForm] = useState(false)

  useEffect(() => {
    if (user) {
      fetchStudyPlans()
    }
  }, [user])

  const fetchStudyPlans = async () => {
    try {
      if (!user || !user.id) {
        console.error('No user ID available')
        return
      }
      const response = await fetch(`/api/study-plans?userId=${user.id}`)
      const data = await response.json()
      setStudyPlans(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching study plans:', error)
      toast.error('Failed to fetch study plans')
      setStudyPlans([])
    }
  }

  const handleCreatePlan = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!newPlan.title || !newPlan.subject) {
      toast.error('Title and subject are required')
      return
    }

    // Validate dates
    if (newPlan.startDate > newPlan.endDate) {
      toast.error('End date must be after start date')
      return
    }

    // Validate user
    if (!user || !user.id) {
      toast.error('User not authenticated')
      return
    }

    try {
      const planData = {
        ...newPlan,
        userId: user.id,
        startDate: newPlan.startDate.toISOString(),
        endDate: newPlan.endDate.toISOString()
      }

      console.log('Creating plan with data:', planData)

      const response = await fetch('/api/study-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Study plan created successfully!')
        setIsCreating(false)
        setNewPlan({
          title: '',
          subject: '',
          description: '',
          startDate: new Date(),
          endDate: new Date(),
          tasks: []
        })
        fetchStudyPlans()
      } else {
        console.error('Error response:', data)
        toast.error(data.message || 'Failed to create study plan')
      }
    } catch (error) {
      console.error('Error creating study plan:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  const handleDeletePlan = async (planId) => {
    try {
      const response = await fetch(`/api/study-plans?id=${planId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Study plan deleted successfully!')
        fetchStudyPlans()
      } else {
        toast.error('Failed to delete study plan')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const handleUpdateTaskStatus = async (planId, taskIndex, newStatus) => {
    try {
      const plan = studyPlans.find(p => p._id === planId)
      const updatedTasks = [...plan.tasks]
      updatedTasks[taskIndex].status = newStatus

      const response = await fetch(`/api/study-plans?id=${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tasks: updatedTasks
        }),
      })

      if (response.ok) {
        toast.success('Task status updated!')
        fetchStudyPlans()
      } else {
        toast.error('Failed to update task status')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Study Calendar</h2>
          <EnhancedCalendar 
            onDateSelect={(date) => {
              setSelectedDate(date);
              setShowPlanForm(true);
            }}
            studyPlans={studyPlans}
          />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4">Study Plans</h2>
          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              <Plus className="h-5 w-5" />
              <span>New Plan</span>
            </button>
          </div>

          {/* Create New Plan Form */}
          {isCreating && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Create New Study Plan</h3>
              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newPlan.title}
                    onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={newPlan.subject}
                    onChange={(e) => setNewPlan({ ...newPlan, subject: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 focus:outline-none min-h-[100px] resize-y"
                    rows="3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newPlan.startDate.toISOString().split('T')[0]}
                      onChange={(e) => setNewPlan({ ...newPlan, startDate: new Date(e.target.value) })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={newPlan.endDate.toISOString().split('T')[0]}
                      onChange={(e) => setNewPlan({ ...newPlan, endDate: new Date(e.target.value) })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:opacity-90 transition-opacity"
                  >
                    Create Plan
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Study Plans List */}
          <div className="space-y-4">
            {studyPlans.map((plan) => (
              <div key={plan._id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{plan.title}</h3>
                    <p className="text-sm text-gray-600">{plan.subject}</p>
                  </div>
                  <button
                    onClick={() => handleDeletePlan(plan._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="space-y-2">
                  {plan.tasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleUpdateTaskStatus(plan._id, index, task.status === 'completed' ? 'pending' : 'completed')}
                          className={`${
                            task.status === 'completed' ? 'text-green-500' : 'text-gray-400'
                          }`}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                        <span className={`${
                          task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-700'
                        }`}>
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {task.priority === 'high' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        {task.dueDate && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 