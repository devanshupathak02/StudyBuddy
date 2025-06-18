"use client"

import { useState, useRef, useEffect } from 'react'
import { X, Brain, CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy, Target, FileText } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function QuizInterface({ user, onClose }) {
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

  if (!quizData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col border-4 border-orange-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-3xl flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Self-Assessment Quiz</h2>
                <p className="text-sm text-orange-100">Test your knowledge with AI-generated questions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Quiz Setup */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[70vh]">
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Create Your Quiz</h3>
              <p className="text-gray-600">Choose your subject, difficulty level, and optionally paste content to generate personalized questions</p>
            </div>

            <div className="space-y-4 pb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors duration-200"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors duration-200"
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
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors duration-200"
                >
                  <option value="minimum">Minimum (5 questions)</option>
                  <option value="moderate">Moderate (10 questions)</option>
                  <option value="maximum">Maximum (15 questions)</option>
                </select>
              </div>

              {/* Custom Content Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useCustomContent"
                    checked={useCustomContent}
                    onChange={(e) => setUseCustomContent(e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="useCustomContent" className="text-sm font-medium text-gray-700">
                    Generate questions from my own content
                  </label>
                </div>

                {useCustomContent && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Paste your study material, notes, or any content here
                    </label>
                    <textarea
                      value={customContent}
                      onChange={(e) => setCustomContent(e.target.value)}
                      placeholder="Paste your study material, textbook content, notes, or any text you want to generate questions from. The AI will create personalized questions based on this content..."
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors duration-200 resize-none"
                      rows="6"
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
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center space-x-2 sticky bottom-0"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>
                      {useCustomContent && customContent.trim() 
                        ? 'AI is analyzing your content and generating personalized questions...' 
                        : 'Generating Quiz...'
                      }
                    </span>
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5" />
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
    )
  }

  if (showResults) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col border-4 border-orange-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-3xl flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Quiz Results</h2>
                <p className="text-sm text-orange-100">Great job completing the quiz!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 p-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800">{getScorePercentage()}%</h3>
              <p className="text-xl text-gray-600">{getScoreMessage()}</p>
              <div className="bg-gray-100 rounded-xl p-4">
                <p className="text-sm text-gray-600">You got <span className="font-bold text-orange-600">{score}</span> out of <span className="font-bold text-gray-800">{quizData.questions.length}</span> questions correct!</p>
                {quizData.sourceContent && (
                  <p className="text-xs text-gray-500 mt-2">
                    Questions generated from your content: "{quizData.sourceContent}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleRestartQuiz}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const question = quizData.questions[currentQuestion]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col border-4 border-orange-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-3xl flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Self-Assessment Quiz</h2>
              <p className="text-sm text-orange-100">Question {currentQuestion + 1} of {quizData.questions.length}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>Score: {score}</span>
            <span>{Math.round(((currentQuestion + 1) / quizData.questions.length) * 100)}% Complete</span>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 leading-relaxed">
              {question.question}
            </h3>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
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
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )
                    )}
                    {isAnswered && index === question.correctAnswer && selectedAnswer !== index && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {isAnswered && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Explanation:</h4>
                <p className="text-blue-700">{question.explanation}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {!isAnswered ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>{currentQuestion < quizData.questions.length - 1 ? 'Next Question' : 'See Results'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 