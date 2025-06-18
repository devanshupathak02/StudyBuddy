"use client"

import { useState, useRef, useEffect } from 'react'
import { Send, X, Bot, User, Copy, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Simple markdown parser for basic formatting
const parseMarkdown = (text) => {
  if (!text) return text;

  // Split into lines for processing
  const lines = text.split('\n');
  const parsedLines = lines.map((line, index) => {
    let parsedLine = line;

    // Headers
    if (line.startsWith('### ')) {
      return `<h3 class="text-lg font-bold text-gray-800 mt-4 mb-2">${line.substring(4)}</h3>`;
    }
    if (line.startsWith('## ')) {
      return `<h2 class="text-xl font-bold text-gray-800 mt-6 mb-3">${line.substring(3)}</h2>`;
    }
    if (line.startsWith('# ')) {
      return `<h1 class="text-2xl font-bold text-gray-800 mt-6 mb-4">${line.substring(2)}</h1>`;
    }

    // Bold text
    parsedLine = parsedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    
    // Italic text
    parsedLine = parsedLine.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Code inline
    parsedLine = parsedLine.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>');
    
    // Links
    parsedLine = parsedLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Lists
    if (line.startsWith('- ')) {
      return `<li class="ml-4 mb-1">${parsedLine.substring(2)}</li>`;
    }
    if (line.startsWith('* ')) {
      return `<li class="ml-4 mb-1">${parsedLine.substring(2)}</li>`;
    }
    if (line.match(/^\d+\./)) {
      return `<li class="ml-4 mb-1">${parsedLine.replace(/^\d+\.\s*/, '')}</li>`;
    }

    // Empty lines
    if (line.trim() === '') {
      return '<br>';
    }

    return `<p class="mb-2 leading-relaxed">${parsedLine}</p>`;
  });

  return parsedLines.join('');
};

// Code block component
const CodeBlock = ({ code, language = 'text' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  return (
    <div className="my-4 bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
        <span className="text-sm text-gray-300 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-green-400 font-mono text-sm leading-relaxed">{code}</code>
      </pre>
    </div>
  );
};

// Enhanced message component
const Message = ({ message, isUser }) => {
  const [showCopyButton, setShowCopyButton] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Message copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy message');
    }
  };

  // Check if content contains code blocks
  const hasCodeBlocks = message.content.includes('```');
  
  if (hasCodeBlocks) {
    // Split content by code blocks
    const parts = message.content.split(/(```[\s\S]*?```)/);
    
    return (
      <div
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        onMouseEnter={() => setShowCopyButton(true)}
        onMouseLeave={() => setShowCopyButton(false)}
      >
        <div className={`relative max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
          {!isUser && (
            <div className="flex items-center space-x-2 mb-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600">AI Assistant</span>
            </div>
          )}
          
          <div
            className={`rounded-2xl p-4 ${
              isUser
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white border-2 border-purple-100 shadow-lg'
            }`}
          >
            {parts.map((part, index) => {
              if (part.startsWith('```') && part.endsWith('```')) {
                const code = part.slice(3, -3);
                const language = code.split('\n')[0];
                const codeContent = code.split('\n').slice(1).join('\n');
                return (
                  <CodeBlock 
                    key={index} 
                    code={codeContent} 
                    language={language || 'text'} 
                  />
                );
              } else {
                return (
                  <div 
                    key={index}
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: parseMarkdown(part) 
                    }}
                  />
                );
              }
            })}
          </div>
          
          {showCopyButton && !isUser && (
            <button
              onClick={handleCopy}
              className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
            </button>
          )}
        </div>
        
        {isUser && (
          <div className="flex items-center space-x-2 order-1 ml-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Regular message without code blocks
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      onMouseEnter={() => setShowCopyButton(true)}
      onMouseLeave={() => setShowCopyButton(false)}
    >
      <div className={`relative max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && (
          <div className="flex items-center space-x-2 mb-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600">AI Assistant</span>
          </div>
        )}
        
        <div
          className={`rounded-2xl p-4 ${
            isUser
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-white border-2 border-purple-100 shadow-lg'
          }`}
        >
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: parseMarkdown(message.content) 
            }}
          />
        </div>
        
        {showCopyButton && !isUser && (
          <button
            onClick={handleCopy}
            className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:shadow-lg transition-all duration-200"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
          </button>
        )}
      </div>
      
      {isUser && (
        <div className="flex items-center space-x-2 order-1 ml-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
            <User className="h-4 w-4 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default function ChatInterface({ user, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      console.log('Sending message to API:', userMessage);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await response.json()
      console.log('Received API response:', data);

      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      } else {
        console.error('Chat API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          details: data.details
        });
        
        let errorMessage = 'Failed to get response from AI';
        if (data.error) {
          errorMessage = data.error;
          if (data.details) {
            errorMessage += ` (${data.details})`;
          }
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Chat Error:', {
        message: error.message,
        stack: error.stack
      });
      toast.error('Connection error. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col border-4 border-purple-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-3xl flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Teaching Assistant</h2>
              <p className="text-sm text-purple-100">Ask me anything about your studies!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-gradient-to-b from-gray-50 to-white chat-scrollbar">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Welcome to StudyBuddy AI!</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                I'm here to help you with your studies. Ask me questions about any subject, 
                get explanations, or request help with homework!
              </p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={index} className="chat-message">
              <Message 
                message={message} 
                isUser={message.role === 'user'} 
              />
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="relative max-w-[85%] order-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">AI Assistant</span>
                </div>
                <div className="bg-white border-2 border-purple-100 shadow-lg rounded-2xl p-4">
                  <div className="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Thinking...</p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-6 border-t border-gray-200 bg-white">
          <div className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your studies..."
              className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200 text-gray-700 placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 