"use client"

import React, { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle, Edit, Save, X, Target, TrendingUp, Calendar as CalendarIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../contexts/auth-context'
import EnhancedCalendar from './enhanced-calendar'

export default function StudyPlanner({ user }) {
  const [studyPlans, setStudyPlans] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCreating, setIsCreating] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [newPlan, setNewPlan] = useState({
    title: '',
    subject: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    tasks: [],
    priority: 'medium',
    estimatedHours: 0
  })
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: new Date(),
    estimatedHours: 1,
    status: 'pending'
  })
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [selectedPlanForTask, setSelectedPlanForTask] = useState(null)

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

  const calculateProgress = (tasks) => {
    if (!tasks || tasks.length === 0) return 0
    const completedTasks = tasks.filter(task => task.status === 'completed').length
    return Math.round((completedTasks / tasks.length) * 100)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50'
      case 'medium': return 'text-yellow-500 bg-yellow-50'
      case 'low': return 'text-green-500 bg-green-50'
      default: return 'text-gray-500 bg-gray-50'
    }
  }

  const handleCreatePlan = async (e) => {
    e.preventDefault()
    
    if (!newPlan.title || !newPlan.subject) {
      toast.error('Title and subject are required')
      return
    }

    if (newPlan.startDate > newPlan.endDate) {
      toast.error('End date must be after start date')
      return
    }

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
          tasks: [],
          priority: 'medium',
          estimatedHours: 0
        })
        fetchStudyPlans()
      } else {
        toast.error(data.message || 'Failed to create study plan')
      }
    } catch (error) {
      console.error('Error creating study plan:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  const handleUpdatePlan = async (planId, updatedData) => {
    try {
      const response = await fetch(`/api/study-plans?id=${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        toast.success('Study plan updated successfully!')
        setEditingPlan(null)
        fetchStudyPlans()
      } else {
        toast.error('Failed to update study plan')
      }
    } catch (error) {
      toast.error('Something went wrong')
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

  const handleAddTask = async (planId) => {
    if (!newTask.title) {
      toast.error('Task title is required')
      return
    }

    try {
      const plan = studyPlans.find(p => p._id === planId)
      const updatedTasks = [...plan.tasks, { ...newTask, dueDate: newTask.dueDate.toISOString() }]

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
        toast.success('Task added successfully!')
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: new Date(),
          estimatedHours: 1,
          status: 'pending'
        })
        setShowTaskForm(false)
        setSelectedPlanForTask(null)
        fetchStudyPlans()
      } else {
        toast.error('Failed to add task')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const handleUpdateTask = async (planId, taskIndex, updatedTask) => {
    try {
      const plan = studyPlans.find(p => p._id === planId)
      const updatedTasks = [...plan.tasks]
      updatedTasks[taskIndex] = { ...updatedTask, dueDate: updatedTask.dueDate.toISOString() }

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
        toast.success('Task updated successfully!')
        setEditingTask(null)
        fetchStudyPlans()
      } else {
        toast.error('Failed to update task')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const handleDeleteTask = async (planId, taskIndex) => {
    try {
      const plan = studyPlans.find(p => p._id === planId)
      const updatedTasks = plan.tasks.filter((_, index) => index !== taskIndex)

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
        toast.success('Task deleted successfully!')
        fetchStudyPlans()
      } else {
        toast.error('Failed to delete task')
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

  const getOverdueTasks = () => {
    const today = new Date()
    return studyPlans.flatMap(plan => 
      plan.tasks.filter(task => 
        task.status === 'pending' && 
        new Date(task.dueDate) < today
      ).map(task => ({ ...task, planTitle: plan.title }))
    )
  }

  const getUpcomingTasks = () => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return studyPlans.flatMap(plan => 
      plan.tasks.filter(task => 
        task.status === 'pending' && 
        new Date(task.dueDate) >= today &&
        new Date(task.dueDate) <= nextWeek
      ).map(task => ({ ...task, planTitle: plan.title }))
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Calendar */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold mb-4">Study Calendar</h2>
          <EnhancedCalendar 
            onDateSelect={(date) => {
              setSelectedDate(date);
              setShowPlanForm(true);
            }}
            studyPlans={studyPlans}
          />
        </div>
        
        {/* Middle Column - Study Plans */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Study Plans</h2>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              <Plus className="h-5 w-5" />
              <span>New Plan</span>
            </button>
          </div>

          {/* Smart Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-md border border-purple-200">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Total Plans</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600">{studyPlans.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md border border-red-200">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold">Overdue Tasks</h3>
              </div>
              <p className="text-2xl font-bold text-red-600">{getOverdueTasks().length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md border border-blue-200">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Upcoming Tasks</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">{getUpcomingTasks().length}</p>
            </div>
          </div>

          {/* Smart Notifications */}
          {(getOverdueTasks().length > 0 || getUpcomingTasks().length > 0) && (
            <div className="mb-6 space-y-4">
              {getOverdueTasks().length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <h3 className="font-semibold text-red-800">Overdue Tasks</h3>
                  </div>
                  <div className="space-y-2">
                    {getOverdueTasks().slice(0, 3).map((task, index) => {
                      const plan = studyPlans.find(p => p.title === task.planTitle);
                      const taskIndex = plan?.tasks.findIndex(t => t.title === task.title);
                      return (
                        <div key={index} className="flex items-center justify-between bg-white rounded p-3 border border-red-100">
                          <div className="flex-1">
                            <p className="font-medium text-red-800">{task.title}</p>
                            <p className="text-sm text-red-600">From: {task.planTitle}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-red-500">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            {plan && taskIndex !== -1 && (
                              <button
                                onClick={() => handleUpdateTaskStatus(plan._id, taskIndex, 'completed')}
                                className="text-green-600 hover:text-green-800 transition-colors"
                                title="Mark as completed"
                              >
                                <CheckCircle2 className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {getOverdueTasks().length > 3 && (
                      <p className="text-sm text-red-600">+{getOverdueTasks().length - 3} more overdue tasks</p>
                    )}
                  </div>
                </div>
              )}

              {getUpcomingTasks().length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-blue-800">Upcoming Tasks (Next 7 Days)</h3>
                  </div>
                  <div className="space-y-2">
                    {getUpcomingTasks().slice(0, 3).map((task, index) => {
                      const plan = studyPlans.find(p => p.title === task.planTitle);
                      const taskIndex = plan?.tasks.findIndex(t => t.title === task.title);
                      return (
                        <div key={index} className="flex items-center justify-between bg-white rounded p-3 border border-blue-100">
                          <div className="flex-1">
                            <p className="font-medium text-blue-800">{task.title}</p>
                            <p className="text-sm text-blue-600">From: {task.planTitle}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-blue-500">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            {plan && taskIndex !== -1 && (
                              <button
                                onClick={() => handleUpdateTaskStatus(plan._id, taskIndex, 'completed')}
                                className="text-green-600 hover:text-green-800 transition-colors"
                                title="Mark as completed"
                              >
                                <CheckCircle2 className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {getUpcomingTasks().length > 3 && (
                      <p className="text-sm text-blue-600">+{getUpcomingTasks().length - 3} more upcoming tasks</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create New Plan Form */}
          {isCreating && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Create New Study Plan</h3>
              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={newPlan.priority}
                      onChange={(e) => setNewPlan({ ...newPlan, priority: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
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

          {/* Add Task Form */}
          {showTaskForm && selectedPlanForTask && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Task to "{selectedPlanForTask.title}"</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleAddTask(selectedPlanForTask._id); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                    rows="2"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate.toISOString().split('T')[0]}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: new Date(e.target.value) })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={newTask.estimatedHours}
                      onChange={(e) => setNewTask({ ...newTask, estimatedHours: parseFloat(e.target.value) })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowTaskForm(false); setSelectedPlanForTask(null); }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md hover:opacity-90 transition-opacity"
                  >
                    Add Task
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
                  <div className="flex-1">
                    {editingPlan === plan._id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          defaultValue={plan.title}
                          className="text-xl font-semibold text-gray-800 border border-gray-300 rounded px-2 py-1 w-full"
                          onBlur={(e) => handleUpdatePlan(plan._id, { title: e.target.value })}
                        />
                        <input
                          type="text"
                          defaultValue={plan.subject}
                          className="text-sm text-gray-600 border border-gray-300 rounded px-2 py-1 w-full"
                          onBlur={(e) => handleUpdatePlan(plan._id, { subject: e.target.value })}
                        />
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{plan.title}</h3>
                        <p className="text-sm text-gray-600">{plan.subject}</p>
                      </div>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(plan.priority)}`}>
                        {plan.priority} priority
                      </span>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Target className="h-4 w-4" />
                        <span>{calculateProgress(plan.tasks)}% complete</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingPlan(editingPlan === plan._id ? null : plan._id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {editingPlan === plan._id ? <Save className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{calculateProgress(plan.tasks)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress(plan.tasks)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tasks Section */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-800">Tasks</h4>
                    <button
                      onClick={() => { setSelectedPlanForTask(plan); setShowTaskForm(true); }}
                      className="flex items-center space-x-1 text-sm bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Task</span>
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {plan.tasks.map((task, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3 flex-1">
                          <button
                            onClick={() => handleUpdateTaskStatus(plan._id, index, task.status === 'completed' ? 'pending' : 'completed')}
                            className={`${
                              task.status === 'completed' ? 'text-green-500' : 'text-gray-400'
                            }`}
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </button>
                          
                          {editingTask === `${plan._id}-${index}` ? (
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                defaultValue={task.title}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                onBlur={(e) => handleUpdateTask(plan._id, index, { ...task, title: e.target.value })}
                              />
                              <input
                                type="text"
                                defaultValue={task.description}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                onBlur={(e) => handleUpdateTask(plan._id, index, { ...task, description: e.target.value })}
                              />
                            </div>
                          ) : (
                            <div className="flex-1">
                              <span className={`${
                                task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-700'
                              } font-medium`}>
                                {task.title}
                              </span>
                              {task.description && (
                                <p className={`text-sm ${
                                  task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-500'
                                }`}>
                                  {task.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          
                          {task.dueDate && (
                            <div className="flex items-center text-sm text-gray-500">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                          
                          {task.estimatedHours && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {task.estimatedHours}h
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setEditingTask(editingTask === `${plan._id}-${index}` ? null : `${plan._id}-${index}`)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              {editingTask === `${plan._id}-${index}` ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteTask(plan._id, index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {plan.tasks.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No tasks yet. Add your first task!</p>
                  )}
                </div>
              </div>
            ))}
            
            {studyPlans.length === 0 && (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No study plans yet</h3>
                <p className="text-gray-500">Create your first study plan to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 