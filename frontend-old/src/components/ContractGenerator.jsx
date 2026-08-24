import { useState } from 'react'

function ContractGenerator({ onClose, onContractGenerated, showToast }) {
  const [contractType, setContractType] = useState('rent')
  const [party1, setParty1] = useState('')
  const [party2, setParty2] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Contract specific fields
  const [propertyAddress, setPropertyAddress] = useState('')
  const [duration, setDuration] = useState('')
  const [rentAmount, setRentAmount] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [salary, setSalary] = useState('')
  const [purpose, setPurpose] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!party1 || !party2) {
      showToast('Please fill in both parties\' details', 'error')
      return
    }

    setIsGenerating(true)

    const terms = {}
    if (contractType === 'rent') {
      terms.property_address = propertyAddress
      terms.duration = duration
      terms.rent_amount = rentAmount
    } else if (contractType === 'employment') {
      terms.job_title = jobTitle
      terms.salary = salary
      terms.duration = duration
    } else if (contractType === 'nda') {
      terms.purpose = purpose
      terms.duration = duration
    }

    try {
      const response = await fetch('http://localhost:8000/api/documents/generate-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_type: contractType,
          party1_name: party1,
          party2_name: party2,
          terms
        }),
      })

      if (!response.ok) throw new Error('Failed to generate contract')

      const data = await response.json()
      onContractGenerated(data)
      showToast('Contract drafted successfully', 'success')
      onClose()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Draft a New Contract</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Contract Type</label>
            <select value={contractType} onChange={(e) => setContractType(e.target.value)} className="form-input">
              <option value="rent">Rental Agreement</option>
              <option value="employment">Employment Contract</option>
              <option value="nda">Non-Disclosure Agreement (NDA)</option>
            </select>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>First Party</label>
              <input type="text" value={party1} onChange={(e) => setParty1(e.target.value)} placeholder="Full legal name" className="form-input" required />
            </div>
            <div className="form-group">
              <label>Second Party</label>
              <input type="text" value={party2} onChange={(e) => setParty2(e.target.value)} placeholder="Full legal name" className="form-input" required />
            </div>
          </div>
          {contractType === 'rent' && (
            <>
              <div className="form-group">
                <label>Property Address</label>
                <input type="text" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} placeholder="Full address" className="form-input" required />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Lease Duration</label>
                  <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Two years" className="form-input" required />
                </div>
                <div className="form-group">
                  <label>Monthly Rent</label>
                  <input type="text" value={rentAmount} onChange={(e) => setRentAmount(e.target.value)} placeholder="EGP 5,000" className="form-input" required />
                </div>
              </div>
            </>
          )}
          {contractType === 'employment' && (
            <>
              <div className="form-group">
                <label>Job Title</label>
                <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Engineer" className="form-input" required />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Salary</label>
                  <input type="text" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="EGP 12,000" className="form-input" required />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="One year" className="form-input" required />
                </div>
              </div>
            </>
          )}
          {contractType === 'nda' && (
            <>
              <div className="form-group">
                <label>Purpose</label>
                <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Business partnership" className="form-input" required />
              </div>
              <div className="form-group">
                <label>Confidentiality Period</label>
                <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Five years" className="form-input" required />
              </div>
            </>
          )}
          <div className="form-actions">
            <button type="submit" disabled={isGenerating} className="submit-btn">
              {isGenerating ? 'Drafting…' : 'Draft Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ContractGenerator
