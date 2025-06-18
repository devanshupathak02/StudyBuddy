"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Brain, CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy, FileText, Clock, Download } from 'lucide-react'
import { toast } from 'react-hot-toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function QuizPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [quizData, setQuizData] = useState(null)
  const [subject, setSubject] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [customContent, setCustomContent] = useState('')
  const [useCustomContent, setUseCustomContent] = useState(false)
  const [questionCount, setQuestionCount] = useState('moderate')
  const [timePerQuestion, setTimePerQuestion] = useState('60')
  const [timeLeft, setTimeLeft] = useState(60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const resultRef = useRef(null)

  // Timer effect
  useEffect(() => {
    let interval = null
    if (isTimerRunning && timeLeft > 0 && parseInt(timePerQuestion) > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            // Time's up! Auto-submit or move to next question
            handleTimeUp()
            return 0
          }
          return timeLeft - 1
        })
      }, 1000)
    } else if (timeLeft === 0 && parseInt(timePerQuestion) > 0) {
      setIsTimerRunning(false)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timeLeft, timePerQuestion])

  const handleTimeUp = () => {
    setIsTimerRunning(false)
    if (!isAnswered) {
      toast.error('Time\'s up! Moving to next question.')
      setIsAnswered(true)
      // Don't add to score since no answer was selected
    }
  }

  const startTimer = () => {
    if (parseInt(timePerQuestion) > 0) {
      setTimeLeft(parseInt(timePerQuestion))
      setIsTimerRunning(true)
    } else {
      // No time limit
      setIsTimerRunning(false)
      setTimeLeft(0)
    }
  }

  const resetTimer = () => {
    setIsTimerRunning(false)
    setTimeLeft(parseInt(timePerQuestion))
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Text cleaning functions for PDF generation
  const cleanText = (text) => {
    if (!text) return ''
    return text
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\r/g, ' ') // Replace carriage returns with spaces
      .replace(/\t/g, ' ') // Replace tabs with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
      .trim()
  }

  const truncateText = (text, maxLength = 100) => {
    const cleaned = cleanText(text)
    if (cleaned.length <= maxLength) return cleaned
    return cleaned.substring(0, maxLength) + '...'
  }

  // Sample quiz data structure
  const sampleQuiz = {
    subject: "Mathematics",
    difficulty: "Medium",
    questions: [
      {
        id: 1,
        question: "What is the value of π (pi) to two decimal places?",
        options: ["3.12", "3.14", "3.16", "3.18"],
        correctAnswer: 1,
        explanation: "π (pi) is approximately 3.14159..., so to two decimal places it's 3.14."
      },
      {
        id: 2,
        question: "Which of the following is a prime number?",
        options: ["15", "17", "21", "25"],
        correctAnswer: 1,
        explanation: "17 is a prime number because it has no positive divisors other than 1 and itself."
      },
      {
        id: 3,
        question: "What is the square root of 144?",
        options: ["10", "11", "12", "13"],
        correctAnswer: 2,
        explanation: "12 × 12 = 144, so the square root of 144 is 12."
      },
      {
        id: 4,
        question: "What is 15% of 200?",
        options: ["25", "30", "35", "40"],
        correctAnswer: 1,
        explanation: "15% of 200 = 0.15 × 200 = 30."
      },
      {
        id: 5,
        question: "Which of these is an even number?",
        options: ["17", "23", "28", "31"],
        correctAnswer: 2,
        explanation: "28 is an even number because it's divisible by 2."
      },
      {
        id: 6,
        question: "What is the sum of angles in a triangle?",
        options: ["90 degrees", "180 degrees", "270 degrees", "360 degrees"],
        correctAnswer: 1,
        explanation: "The sum of interior angles in any triangle is always 180 degrees."
      },
      {
        id: 7,
        question: "What is 2³ × 2²?",
        options: ["2⁵", "2⁶", "4⁵", "4⁶"],
        correctAnswer: 0,
        explanation: "2³ × 2² = 2^(3+2) = 2⁵ = 32."
      },
      {
        id: 8,
        question: "Which fraction is equivalent to 0.75?",
        options: ["1/4", "2/3", "3/4", "4/5"],
        correctAnswer: 2,
        explanation: "0.75 = 75/100 = 3/4."
      },
      {
        id: 9,
        question: "What is the perimeter of a square with side length 6?",
        options: ["12", "18", "24", "36"],
        correctAnswer: 2,
        explanation: "Perimeter of a square = 4 × side length = 4 × 6 = 24."
      },
      {
        id: 10,
        question: "What is the area of a circle with radius 5?",
        options: ["25π", "50π", "75π", "100π"],
        correctAnswer: 0,
        explanation: "Area of a circle = πr² = π × 5² = 25π."
      }
    ]
  }

  const handleStartQuiz = async () => {
    if (!subject.trim()) {
      toast.error('Please select a subject')
      return
    }

    if (useCustomContent && !customContent.trim()) {
      toast.error('Please paste some content to generate questions from')
      return
    }

    setIsLoading(true)
    
    try {
      if (useCustomContent && customContent.trim()) {
        // Call the Gemini API to generate questions from custom content
        const response = await fetch('/api/generate-quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: customContent,
            subject: subject,
            difficulty: difficulty,
            questionCount: questionCount
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate quiz');
        }

        const data = await response.json();
        setQuizData(data.quiz);
      } else {
        // Use sample quiz for predefined subjects
        const quizWithCount = generateQuizWithCount(sampleQuiz, questionCount)
        setQuizData(quizWithCount)
      }
      // Start timer for the first question
      startTimer()
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast.error(error.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false)
    }
  }

  const generateQuizWithCount = (quiz, count) => {
    const questionCountMap = {
      'minimum': 5,
      'moderate': 10,
      'maximum': 15
    }
    
    const targetCount = questionCountMap[count]
    const selectedQuestions = quiz.questions.slice(0, targetCount)
    
    return {
      ...quiz,
      questions: selectedQuestions
    }
  }

  const handleAnswerSelect = (answerIndex) => {
    if (isAnswered) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer')
      return
    }

    setIsAnswered(true)
    setIsTimerRunning(false) // Stop timer when answer is submitted
    
    if (selectedAnswer === quizData.questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
      toast.success('Correct! 🎉')
    } else {
      toast.error('Incorrect! Try again next time.')
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
      // Reset and start timer for next question
      resetTimer()
      setTimeout(() => startTimer(), 100) // Small delay to ensure state is updated
    } else {
      setShowResults(true)
    }
  }

  const handleRestartQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setScore(0)
    setShowResults(false)
    setQuizData(null)
    setCustomContent('')
    setUseCustomContent(false)
    setQuestionCount('moderate')
    setTimePerQuestion('60')
    setTimeLeft(60)
    setIsTimerRunning(false)
  }

  const getScorePercentage = () => {
    return Math.round((score / quizData.questions.length) * 100)
  }

  const getScoreMessage = () => {
    const percentage = getScorePercentage()
    if (percentage >= 90) return "Excellent! You're a master!"
    if (percentage >= 80) return "Great job! You're doing well!"
    if (percentage >= 70) return "Good work! Keep practicing!"
    if (percentage >= 60) return "Not bad! Room for improvement."
    return "Keep studying! You'll get better!"
  }

  // PDF Download Handlers
  const handleDownloadPDF = async (withAnswers = false) => {
    if (!quizData) return
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 40
    let y = margin
    
    // Header
    doc.setFontSize(20)
    doc.text('AI Self-Assessment Quiz', margin, y)
    y += 30
    
    // Quiz info
    doc.setFontSize(12)
    doc.text(`Subject: ${quizData.subject}`, margin, y)
    y += 18
    doc.text(`Difficulty: ${quizData.difficulty}`, margin, y)
    y += 18
    if (quizData.sourceContent) {
      doc.setFontSize(10)
      const sourceLines = doc.splitTextToSize(`Source: ${truncateText(quizData.sourceContent)}`, pageWidth - 2 * margin)
      doc.text(sourceLines, margin, y)
      y += sourceLines.length * 14
    }
    doc.setFontSize(12)
    doc.text(`Total Questions: ${quizData.questions.length}`, margin, y)
    y += 24
    
    // Questions
    quizData.questions.forEach((q, idx) => {
      // Check if we need a new page
      if (y > 700) {
        doc.addPage()
        y = margin
      }
      
      doc.setFontSize(12)
      // Question text
      const questionLines = doc.splitTextToSize(`${idx + 1}. ${cleanText(q.question)}`, pageWidth - 2 * margin)
      doc.text(questionLines, margin, y)
      y += questionLines.length * 16 + 5
      
      // Options
      q.options.forEach((opt, oidx) => {
        let optText = String.fromCharCode(65 + oidx) + '. ' + cleanText(opt)
        if (withAnswers && oidx === q.correctAnswer) {
          optText += '  ✔ (Correct Answer)'
        }
        const optLines = doc.splitTextToSize(optText, pageWidth - 2 * margin - 20)
        optLines.forEach((line, i) => {
          doc.text(line, margin + 20, y)
          y += 14
        })
      })
      
      // Explanation (only if with answers)
      if (withAnswers) {
        y += 8 // Space before explanation
        doc.setFontSize(10)
        const explanationText = cleanText(q.explanation)
        const expLines = doc.splitTextToSize(`Explanation: ${explanationText}`, pageWidth - 2 * margin - 20)
        expLines.forEach((line, i) => {
          doc.text(line, margin + 20, y)
          y += 14
        })
      }
      
      y += 15 // Space between questions
    })
    
    doc.save(`quiz-${withAnswers ? 'with-answers' : 'no-answers'}.pdf`)
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-full">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">AI Self-Assessment Quiz</h1>
                    <p className="text-sm text-gray-500">Test your knowledge with AI-generated questions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-3xl shadow-xl border border-orange-200 overflow-hidden">
            {/* Quiz Setup */}
            <div className="p-8 space-y-8">
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Create Your Quiz</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Choose your subject, difficulty level, and optionally paste content to generate personalized questions
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors duration-200 text-lg"
                  >
                    <option value="">Select a subject</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="science">Science</option>
                    <option value="history">History</option>
                    <option value="literature">Literature</option>
                    <option value="geography">Geography</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="biology">Biology</option>
                    <option value="economics">Economics</option>
                    <option value="psychology">Psychology</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors duration-200 text-lg"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question Count</label>
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors duration-200 text-lg"
                    >
                      <option value="minimum">Minimum (5 questions)</option>
                      <option value="moderate">Moderate (10 questions)</option>
                      <option value="maximum">Maximum (15 questions)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Per Question</label>
                  <select
                    value={timePerQuestion}
                    onChange={(e) => setTimePerQuestion(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors duration-200 text-lg"
                  >
                    <option value="30">30 seconds</option>
                    <option value="60">1 minute</option>
                    <option value="90">1.5 minutes</option>
                    <option value="120">2 minutes</option>
                    <option value="180">3 minutes</option>
                    <option value="300">5 minutes</option>
                    <option value="0">No time limit</option>
                  </select>
                </div>

                {/* Custom Content Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="useCustomContent"
                      checked={useCustomContent}
                      onChange={(e) => setUseCustomContent(e.target.checked)}
                      className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="useCustomContent" className="text-lg font-medium text-gray-700">
                      Generate questions from my own content
                    </label>
                  </div>

                  {useCustomContent && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Paste your study material, notes, or any content here
                      </label>
                      <textarea
                        value={customContent}
                        onChange={(e) => setCustomContent(e.target.value)}
                        placeholder="Paste your study material, textbook content, notes, or any text you want to generate questions from. The AI will create personalized questions based on this content..."
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors duration-200 resize-none text-lg"
                        rows="8"
                      />
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <FileText className="h-4 w-4" />
                        <span>{customContent.length} characters</span>
                        {customContent.length > 0 && (
                          <span className="text-orange-500">
                            • Will generate questions from your content
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleStartQuiz}
                  disabled={isLoading || !subject || (useCustomContent && !customContent.trim())}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-5 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center space-x-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>
                        {useCustomContent && customContent.trim() 
                          ? 'AI is analyzing your content and generating personalized questions...' 
                          : 'Generating Quiz...'
                        }
                      </span>
                    </>
                  ) : (
                    <>
                      <Brain className="h-6 w-6" />
                      <span>
                        {useCustomContent && customContent.trim() 
                          ? 'Generate Questions from My Content' 
                          : 'Start Quiz'
                        }
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-full">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Quiz Results</h1>
                    <p className="text-sm text-gray-500">Great job completing the quiz!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-3xl shadow-xl border border-orange-200 overflow-hidden">
            <div className="p-8 space-y-8" ref={resultRef}>
              <div className="text-center space-y-6">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 rounded-full w-28 h-28 mx-auto flex items-center justify-center">
                  <Trophy className="h-16 w-16 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-800">{getScorePercentage()}%</h2>
                <p className="text-2xl text-gray-600">{getScoreMessage()}</p>
                <div className="bg-gray-100 rounded-xl p-6 max-w-md mx-auto">
                  <p className="text-lg text-gray-600">You got <span className="font-bold text-orange-600">{score}</span> out of <span className="font-bold text-gray-800">{quizData.questions.length}</span> questions correct!</p>
                  {quizData.sourceContent && (
                    <p className="text-sm text-gray-500 mt-3">
                      Questions generated from your content: "{truncateText(quizData.sourceContent)}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 max-w-md mx-auto">
                <button
                  onClick={handleRestartQuiz}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all duration-200"
                >
                  Back to Home
                </button>
              </div>

              {/* PDF Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={() => handleDownloadPDF(false)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  <Download className="h-5 w-5" /> Download Quiz (No Answers)
                </button>
                <button
                  onClick={() => handleDownloadPDF(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold shadow hover:from-green-600 hover:to-teal-600 transition-all duration-200"
                >
                  <Download className="h-5 w-5" /> Download Quiz (With Answers)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const question = quizData.questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-full">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AI Self-Assessment Quiz</h1>
                  <p className="text-sm text-gray-500">Question {currentQuestion + 1} of {quizData.questions.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>Score: {score}</span>
            <div className="flex items-center space-x-4">
              {parseInt(timePerQuestion) > 0 && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className={`font-semibold ${timeLeft <= 10 ? 'text-red-500' : timeLeft <= 30 ? 'text-orange-500' : 'text-gray-500'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
              <span>{Math.round(((currentQuestion + 1) / quizData.questions.length) * 100)}% Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-xl border border-orange-200 overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 leading-relaxed">
                {question.question}
              </h2>

              <div className="space-y-4">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered}
                    className={`w-full p-6 rounded-xl border-2 text-left transition-all duration-200 text-lg ${
                      selectedAnswer === index
                        ? isAnswered
                          ? index === question.correctAnswer
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : 'border-red-500 bg-red-50 text-red-800'
                          : 'border-orange-500 bg-orange-50 text-orange-800'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                    } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {isAnswered && selectedAnswer === index && (
                        index === question.correctAnswer ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )
                      )}
                      {isAnswered && index === question.correctAnswer && selectedAnswer !== index && (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {isAnswered && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-800 mb-3 text-lg">Explanation:</h4>
                  <p className="text-blue-700 text-lg">{question.explanation}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              {!isAnswered ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>{currentQuestion < quizData.questions.length - 1 ? 'Next Question' : 'See Results'}</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 