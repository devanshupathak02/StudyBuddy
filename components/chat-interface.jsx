"use client"

import { useState, useRef, useEffect } from 'react'
import { Send, X, Bot, User, Copy, Check, Paperclip, Image as ImageIcon, FileText } from 'lucide-react'
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
  
  const renderAttachment = () => {
    if (!message.attachment) return null;
    return (
      <div className="mb-2">
        {message.attachment.type === 'image' ? (
          <img src={message.attachment.url} alt="User upload" className="rounded-lg max-h-60" />
        ) : (
          <div className={`flex items-center gap-2 p-2 rounded-lg ${isUser ? 'bg-white/20' : 'bg-gray-100'}`}>
            <FileText className={`h-6 w-6 ${isUser ? 'text-white' : 'text-gray-500'}`} />
            <span className={`text-sm ${isUser ? 'text-white' : 'text-gray-700'} truncate`}>{message.attachment.name}</span>
          </div>
        )}
      </div>
    );
  };

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
            {renderAttachment()}
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
          {renderAttachment()}
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
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) { // 4MB limit
        toast.error('File size should be less than 4MB')
        return
      }
      setFile(selectedFile)
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview(reader.result)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        setFilePreview(selectedFile.name)
      }
    }
  }

  const removeFile = () => {
    setFile(null)
    setFilePreview(null)
    if(fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if ((!input.trim() && !file) || isLoading) return

    const userMessageContent = input.trim()
    
    // Prepare message for UI
    let attachmentPreview = null
    if (file) {
      if (file.type.startsWith('image/')) {
        attachmentPreview = { type: 'image', url: filePreview }
      } else {
        attachmentPreview = { type: 'file', name: file.name }
      }
    }

    const newUserMessage = { 
      content: userMessageContent, 
      isUser: true, 
      attachment: attachmentPreview 
    }
    setMessages(prev => [...prev, newUserMessage])
    setInput('')
    
    setIsLoading(true)

    // Prepare request for backend
    let fileDataUrl = null
    if (file) {
      fileDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    }

    try {
      const requestBody = {
        message: userMessageContent,
        user: user,
        file: fileDataUrl, // Renamed from image
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Something went wrong')
      }

      const data = await res.json()
      const aiMessage = { content: data.message, isUser: false }
      setMessages(prev => [...prev, aiMessage])

    } catch (error) {
      console.error(error)
      toast.error(error.message)
      // Restore user input if API call fails
      setMessages(prev => prev.slice(0, prev.length - 1))
      setInput(userMessageContent)

    } finally {
      setIsLoading(false)
      removeFile() // Clear file after exchange is complete
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
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {messages.map((message, index) => (
            <Message 
              key={index}
              message={message}
              isUser={message.isUser} 
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 bg-white border-t-2 border-purple-100">
          {filePreview && (
            <div className="relative mb-2 w-max max-w-xs">
              {file && file.type.startsWith('image/') ? (
                <img src={filePreview} alt="Image preview" className="h-32 w-32 object-cover rounded-lg" />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                  <FileText className="h-6 w-6 text-gray-500" />
                  <span className="text-sm text-gray-700 truncate">{filePreview}</span>
                </div>
              )}
              <button
                onClick={removeFile}
                className="absolute -top-2 -right-2 bg-gray-900 bg-opacity-50 text-white rounded-full p-1 hover:bg-gray-800 transition-colors"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="p-2 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Attach image"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
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
          </form>
        </div>
      </div>
    </div>
  )
} 