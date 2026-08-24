import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ContractCard from './ContractCard'

// Assistant messages render markdown; tables wrapped for horizontal scroll on mobile
function AssistantContent({ content }) {
  return (
    <div className="md-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ node, ...props }) => (
            <div className="table-scroll">
              <table {...props} />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function ChatPanel({ conversation, updateConversation, showToast, uploadedDocument, setUploadedDocument, onOpenSidebar }) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.name.match(/\.(pdf|docx)$/i)) {
      showToast('Unsupported file type. Please upload a PDF or DOCX only', 'error')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      showToast('File is too large. Maximum size is 10 MB', 'error')
      return
    }

    // Validate filename
    if (file.name.length > 255) {
      showToast('Filename is too long', 'error')
      return
    }

    setIsUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch('http://localhost:8000/api/documents/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = 'Failed to upload file'
        try {
          const error = await response.json()
          errorMessage = error.detail || errorMessage
        } catch {
          if (response.status === 413) {
            errorMessage = 'File is too large'
          } else if (response.status === 500) {
            errorMessage = 'Server error. Please try again'
          }
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      if (!data.document_id || !data.filename) {
        throw new Error('Invalid response from server')
      }

      setUploadedDocument(data)

      // Add system message
      const systemMessage = {
        role: 'system',
        content: `📄 Analyzed "${data.filename}" (${data.word_count.toLocaleString('en-US')} words). Ask anything about it.`
      }

      updateConversation(conversation.id, {
        messages: [...conversation.messages, systemMessage]
      })

      showToast('File uploaded successfully ✓', 'success')
    } catch (error) {
      if (error.name === 'AbortError') {
        showToast('Upload timed out. The file may be too large or the connection is slow', 'error')
      } else {
        showToast(error.message || 'Failed to upload file', 'error')
      }
      console.error('File upload error:', error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()

    // Validate message length
    if (userMessage.length > 4000) {
      showToast('Message is too long. Please shorten it', 'error')
      return
    }

    if (userMessage.length < 2) {
      showToast('Message is too short', 'error')
      return
    }

    setInput('')

    const newMessages = [
      ...conversation.messages,
      { role: 'user', content: userMessage }
    ]

    updateConversation(conversation.id, {
      messages: newMessages,
      title: conversation.messages.length === 0 ? userMessage.substring(0, 30) : conversation.title,
      preview: userMessage.substring(0, 60)
    })

    setIsLoading(true)
    let retryCount = 0
    const maxRetries = 2

    const attemptSend = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

        const response = await fetch('http://localhost:8000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            history: conversation.messages.filter(m => m.role !== 'system' && !m.isContract),
            document_id: uploadedDocument?.document_id
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (response.status === 429) {
          throw new Error('The model is busy. Please try again in a moment ⏳')
        }

        if (response.status === 500) {
          throw new Error('Server error. Please try again')
        }

        if (!response.ok) {
          let errorMessage = 'Connection error'
          try {
            const error = await response.json()
            errorMessage = error.detail || errorMessage
          } catch {}
          throw new Error(errorMessage)
        }

        const data = await response.json()

        if (!data.reply) {
          throw new Error('Invalid response from server')
        }

        updateConversation(conversation.id, {
          messages: [...newMessages, { role: 'assistant', content: data.reply }]
        })
      } catch (error) {
        if (error.name === 'AbortError') {
          showToast('Response timed out. Please try again', 'error')
          throw error
        }

        // Retry on network errors
        if (retryCount < maxRetries && (error.message.includes('fetch') || error.message.includes('network'))) {
          retryCount++
          showToast(`Retrying (${retryCount}/${maxRetries})...`, 'info')
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
          return attemptSend()
        }

        showToast(error.message || 'An unexpected error occurred', 'error')
        updateConversation(conversation.id, {
          messages: [...newMessages, {
            role: 'assistant',
            content: '⚠️ Sorry, a connection error occurred. Please check your internet connection and try again.\n\nIf the problem persists, make sure the server is running on port 8000.'
          }]
        })
        throw error
      }
    }

    try {
      await attemptSend()
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e)
    }
  }

  if (!conversation) {
    return <div className="chat-panel">Loading...</div>
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <button
          className="menu-btn"
          onClick={onOpenSidebar}
          aria-label="Open menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
        <h2>{conversation.title}</h2>
        {uploadedDocument && (
          <span className="chat-header-doc">📄 {uploadedDocument.filename}</span>
        )}
      </div>

      <div className="messages-container">
        {conversation.messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="56" height="56">
                <path d="M12 3v18M4 7h16" strokeLinecap="round" />
                <path d="M6 21h12" strokeLinecap="round" />
                <path d="M6 7l-3 6a3.5 3.5 0 006 0L6 7zM18 7l-3 6a3.5 3.5 0 006 0l-3-6z" strokeLinejoin="round" />
              </svg>
            </div>
            <h3>Welcome to your Legal AI Assistant</h3>
            <p>
              Ask any legal question, upload a document to analyze, or draft a contract.
              <br />
              <span style={{ fontSize: '0.75rem', color: '#757682', marginTop: '0.5rem', display: 'block' }}>
                ⚠️ Uploaded documents are temporary and are cleared when the server restarts
              </span>
            </p>
          </div>
        ) : (
          <>
            {conversation.messages.map((msg, idx) => (
              <div key={idx}>
                {msg.isContract ? (
                  <div className="message assistant">
                    <div className="message-avatar">🤖</div>
                    <div className="message-content">
                      <ContractCard contract={msg.contractData} />
                    </div>
                  </div>
                ) : (
                  <div className={`message ${msg.role}`}>
                    {msg.role !== 'system' && (
                      <div className="message-avatar">
                        {msg.role === 'user' ? '👤' : '🤖'}
                      </div>
                    )}
                    <div className="message-content">
                      {msg.role === 'assistant'
                        ? <AssistantContent content={msg.content} />
                        : msg.content}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="typing-indicator">
                <div className="message-avatar">🤖</div>
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        {uploadedDocument && (
          <div className="document-chip">
            📄 {uploadedDocument.filename}
            <button onClick={() => setUploadedDocument(null)}>✕</button>
          </div>
        )}

        <form onSubmit={sendMessage} className="input-form">
          <div className="input-wrapper">
            <div className="input-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="input-action-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploading}
                title="Upload document"
              >
                {isUploading ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" opacity="0.25"/>
                    <path d="M12 2a10 10 0 0110 10" strokeLinecap="round">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 12 12"
                        to="360 12 12"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </path>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                  </svg>
                )}
              </button>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a legal question..."
              className="input-field"
              disabled={isLoading}
              rows="1"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`send-button ${input.trim() && !isLoading ? 'send-button-ready' : ''}`}
            aria-label="Send message"
          >
            {isLoading ? (
              <>
                <span className="send-spinner"></span>
                <span className="send-label">Thinking…</span>
              </>
            ) : input.trim() ? (
              <>
                <span className="send-label">Send</span>
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatPanel
