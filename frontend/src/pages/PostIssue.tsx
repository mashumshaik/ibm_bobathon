import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../api/client'

const CATEGORIES = ['ROADS','WATER','ELECTRICITY','GARBAGE','PARKS','SAFETY','DRAINAGE','OTHER']

export default function PostIssue() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('ROADS')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  const { data: wards } = useQuery({ queryKey: ['wards'], queryFn: () => api.get('/wards') })

  const [wardId, setWardId] = useState(user?.ward_id || '')

  const setWardMutation = useMutation({
    mutationFn: (wid: number) => api.post('/auth/set-ward', { ward_id: wid }),
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token)
      const updatedUser = { ...user, ward_id: wardId }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    },
  })

  const mutation = useMutation({
    mutationFn: () => api.post('/issues', { title, description, category }),
    onSuccess: (data) => navigate(`/issues/${data.id}`),
    onError: (e: any) => setError(e.message),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!localStorage.getItem('token')) { navigate('/login'); return }
    if (!user?.ward_id && wardId) {
      await setWardMutation.mutateAsync(Number(wardId))
    }
    mutation.mutate()
  }

  if (!localStorage.getItem('token')) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 mb-4">You need to login to report an issue.</p>
        <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded">Login</a>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Report a Civic Issue</h1>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!user?.ward_id && (
          <div>
            <label className="block text-sm font-medium mb-1">Your Ward</label>
            <select className="w-full border rounded px-3 py-2 text-sm" value={wardId} onChange={e => setWardId(e.target.value)} required>
              <option value="">Select your ward</option>
              {wards?.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Title <span className="text-gray-400 font-normal">(5–200 chars)</span></label>
          <input className="w-full border rounded px-3 py-2 text-sm" value={title} onChange={e => setTitle(e.target.value)} required minLength={5} maxLength={200} placeholder="Broken road near bus stop" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description <span className="text-gray-400 font-normal">(10–1000 chars)</span></label>
          <textarea className="w-full border rounded px-3 py-2 text-sm h-28 resize-none" value={description} onChange={e => setDescription(e.target.value)} required minLength={10} maxLength={1000} placeholder="Describe the issue in detail..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select className="w-full border rounded px-3 py-2 text-sm" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button type="submit" disabled={mutation.isPending} className="w-full bg-blue-600 text-white py-2 rounded font-medium">
          {mutation.isPending ? 'Submitting...' : 'Submit Issue'}
        </button>
      </form>
    </div>
  )
}
