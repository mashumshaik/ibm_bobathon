import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api } from '../api/client'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const sendOtp = useMutation({
    mutationFn: () => api.post('/auth/send-otp', { phone }),
    onSuccess: () => { setStep('otp'); setError('') },
    onError: (e: any) => setError(e.message),
  })

  const verifyOtp = useMutation({
    mutationFn: () => api.post('/auth/verify-otp', { phone, otp, name }),
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/feed')
    },
    onError: (e: any) => setError(e.message),
  })

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold text-center mb-6">Login to Prajaakeeya+</h1>
      <div className="border rounded-lg p-6 shadow-sm">
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        {step === 'phone' ? (
          <>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input
              className="w-full border rounded px-3 py-2 mb-3 text-sm"
              placeholder="Ramesh Kumar"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <label className="block text-sm font-medium mb-1">Indian Phone Number</label>
            <input
              className="w-full border rounded px-3 py-2 mb-4 text-sm"
              placeholder="9876543210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              maxLength={10}
            />
            <button
              className="w-full bg-blue-600 text-white py-2 rounded font-medium"
              onClick={() => sendOtp.mutate()}
              disabled={sendOtp.isPending}
            >
              {sendOtp.isPending ? 'Sending...' : 'Send OTP'}
            </button>
            <p className="text-xs text-gray-400 mt-2 text-center">OTP will be printed to backend logs in DEBUG mode</p>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">OTP sent to <strong>{phone}</strong>. Check backend logs.</p>
            <label className="block text-sm font-medium mb-1">Enter 6-digit OTP</label>
            <input
              className="w-full border rounded px-3 py-2 mb-4 text-sm text-center tracking-widest text-xl"
              placeholder="123456"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
            />
            <button
              className="w-full bg-blue-600 text-white py-2 rounded font-medium"
              onClick={() => verifyOtp.mutate()}
              disabled={verifyOtp.isPending}
            >
              {verifyOtp.isPending ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button className="w-full text-sm text-gray-400 mt-2" onClick={() => setStep('phone')}>← Change number</button>
          </>
        )}
      </div>
    </div>
  )
}
