import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import HistoryPanel from './components/HistoryPanel'
import Toast from './components/Toast'
import ContractGenerator from './components/ContractGenerator'

function App() {
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const [toast, setToast] = useState(null)
  const [uploadedDocument, setUploadedDocument] = useState(null)
  const [showContractModal, setShowContractModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (conversations.length === 0) {
      const newConv = {
        id: Date.now(),
        title: 'New Conversation',
        messages: [],
        preview: 'Start a new conversation...',
        createdAt: new Date().toISOString()
      }
      setConversations([newConv])
      setCurrentConversation(newConv.id)
    }
  }, [])

  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [sidebarOpen])

  const showToast = (message, type = 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const updateConversation = (conversationId, updates) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, ...updates }
          : conv
      )
    )
  }

  const createNewConversation = () => {
    const newConv = {
      id: Date.now(),
      title: 'New Conversation',
      messages: [],
      preview: 'Start a new conversation...',
      createdAt: new Date().toISOString()
    }
    setConversations(prev => [newConv, ...prev])
    setCurrentConversation(newConv.id)
    setUploadedDocument(null)
    setSidebarOpen(false)
  }

  const selectConversation = (conversationId) => {
    setCurrentConversation(conversationId)
    setUploadedDocument(null)
    setSidebarOpen(false)
  }

  const handleContractGenerated = (contractData) => {
    const activeConv = conversations.find(c => c.id === currentConversation)
    if (activeConv) {
      const contractMessage = {
        role: 'assistant',
        content: '',
        isContract: true,
        contractData
      }
      updateConversation(currentConversation, {
        messages: [...activeConv.messages, contractMessage]
      })
    }
  }

  const activeConversation = conversations.find(c => c.id === currentConversation)

  return (
    <div className={`app-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        onNewChat={createNewConversation}
        onGenerateContract={() => {
          setShowContractModal(true)
          setSidebarOpen(false)
        }}
        onClose={() => setSidebarOpen(false)}
        activeItem="chat"
        conversations={conversations}
        currentConversationId={currentConversation}
        onSelectConversation={selectConversation}
      />

      <ChatPanel
        conversation={activeConversation}
        updateConversation={updateConversation}
        showToast={showToast}
        uploadedDocument={uploadedDocument}
        setUploadedDocument={setUploadedDocument}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      <HistoryPanel
        conversations={conversations}
        currentConversationId={currentConversation}
        onSelectConversation={selectConversation}
      />

      {showContractModal && (
        <ContractGenerator
          onClose={() => setShowContractModal(false)}
          onContractGenerated={handleContractGenerated}
          showToast={showToast}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

export default App
