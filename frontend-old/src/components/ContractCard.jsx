function ContractCard({ contract }) {
  const handleDownload = () => {
    window.open(`http://localhost:8000${contract.download_url}`, '_blank')
  }

  return (
    <div className="contract-card">
      <div className="contract-icon">📄</div>
      <div className="contract-info">
        <div className="contract-filename">{contract.filename}</div>
        <div className="contract-meta">Contract draft — ready to download</div>
      </div>
      <button onClick={handleDownload} className="download-btn">
        Download
      </button>
    </div>
  )
}

export default ContractCard
