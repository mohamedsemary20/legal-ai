function HistoryPanel({ conversations, currentConversationId, onSelectConversation }) {
  return (
    <div className="history-panel">
      <div className="history-header">
        <h3>Recent Conversations</h3>
      </div>

      <div className="history-list">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`history-item ${conv.id === currentConversationId ? 'active' : ''}`}
            onClick={() => onSelectConversation(conv.id)}
          >
            <div className="history-item-title">{conv.title}</div>
            <div className="history-item-preview">{conv.preview}</div>
          </div>
        ))}

        {conversations.length === 0 && (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#757682', fontSize: '0.875rem' }}>
            No conversations yet
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPanel
