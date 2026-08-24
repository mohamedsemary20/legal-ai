function Sidebar({
  onNewChat,
  onGenerateContract,
  onClose,
  activeItem,
  conversations = [],
  currentConversationId,
  onSelectConversation,
}) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
              <path d="M12 3v18M4 7h16" strokeLinecap="round" />
              <path d="M6 21h12" strokeLinecap="round" />
              <path d="M6 7l-3 6a3.5 3.5 0 006 0L6 7zM18 7l-3 6a3.5 3.5 0 006 0l-3-6z" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="brand-text">
            <span className="brand-name">Legal AI</span>
            <span className="brand-tagline">Egyptian Law Counsel</span>
          </div>
        </div>
        <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        New Conversation
      </button>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Workspace</div>

        <div className={`sidebar-nav-item ${activeItem === 'chat' ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinejoin="round" />
          </svg>
          <span>Conversations</span>
        </div>

        <div className="sidebar-nav-item" onClick={onGenerateContract}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinejoin="round" />
          </svg>
          <span>Draft Contract</span>
        </div>

        {conversations.length > 0 && (
          <>
            <div className="nav-section-label nav-section-recent">Recent</div>
            <div className="sidebar-conv-list">
              {conversations.slice(0, 8).map((conv) => (
                <button
                  key={conv.id}
                  className={`sidebar-conv-item ${conv.id === currentConversationId ? 'active' : ''}`}
                  onClick={() => onSelectConversation(conv.id)}
                >
                  <span className="sidebar-conv-title">{conv.title}</span>
                  <span className="sidebar-conv-preview">{conv.preview}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-note">AI-generated content.<br />Not legal advice.</div>
      </div>
    </div>
  )
}

export default Sidebar
