import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

const CATEGORIES = ['ROADS','WATER','ELECTRICITY','GARBAGE','PARKS','SAFETY','DRAINAGE','OTHER']

function IssueCard({ issue, onVote }: { issue: any, onVote: (id: number, voted: boolean) => void }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <Link to={`/issues/${issue.id}`} className="font-semibold text-blue-700 hover:underline">
            {issue.title}
          </Link>
          <div className="flex flex-wrap gap-2 mt-1 text-xs">
            <span className="bg-gray-100 px-2 py-0.5 rounded">{issue.category}</span>
            <span className="text-gray-500">{issue.ward_name}</span>
            <span className={`px-2 py-0.5 rounded ${issue.status === 'resolved' ? 'bg-green-100 text-green-700' : issue.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-50 text-blue-600'}`}>
              {issue.status}
            </span>
            {issue.has_duplicates && <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded">⚠ Similar exists</span>}
          </div>
        </div>
        <button
          onClick={() => onVote(issue.id, issue.voted)}
          className={`flex flex-col items-center px-3 py-1 rounded border ${issue.voted ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-blue-50 text-gray-600'}`}
        >
          <span>▲</span>
          <span className="text-sm font-bold">{issue.upvote_count}</span>
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{issue.description}</p>
    </div>
  )
}

export default function Feed() {
  const [wardId, setWardId] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('recent')
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const params = new URLSearchParams({ sort, page: String(page), page_size: '20' })
  if (wardId) params.set('ward_id', wardId)
  if (category) params.set('category', category)

  const { data, isLoading } = useQuery({
    queryKey: ['issues', wardId, category, sort, page],
    queryFn: () => api.get(`/issues?${params}`),
  })

  const { data: wards } = useQuery({ queryKey: ['wards'], queryFn: () => api.get('/wards') })

  const voteMutation = useMutation({
    mutationFn: ({ id, voted }: { id: number; voted: boolean }) =>
      voted ? api.delete(`/issues/${id}/vote`) : api.post(`/issues/${id}/vote`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues'] }),
  })

  const handleVote = (id: number, voted: boolean) => {
    if (!localStorage.getItem('token')) { alert('Login to vote'); return }
    voteMutation.mutate({ id, voted })
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <h1 className="text-xl font-bold mr-2">Issue Feed</h1>
        <select className="border rounded px-2 py-1 text-sm" value={wardId} onChange={e => { setWardId(e.target.value); setPage(1) }}>
          <option value="">All Wards</option>
          {wards?.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select className="border rounded px-2 py-1 text-sm" value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="border rounded px-2 py-1 text-sm" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="recent">Recent</option>
          <option value="votes">Most Voted</option>
          <option value="trending">Trending</option>
        </select>
        <Link to="/issues/new" className="ml-auto bg-blue-600 text-white px-4 py-1.5 rounded text-sm">+ Report Issue</Link>
      </div>

      {isLoading ? <p className="text-gray-400">Loading...</p> : (
        <>
          <div className="space-y-3">
            {data?.items?.length === 0 && <p className="text-gray-400 text-center py-8">No issues yet. Be the first to report!</p>}
            {data?.items?.map((issue: any) => (
              <IssueCard key={issue.id} issue={issue} onVote={handleVote} />
            ))}
          </div>
          <div className="flex gap-2 justify-center mt-6">
            {page > 1 && <button className="border px-3 py-1 rounded text-sm" onClick={() => setPage(p => p - 1)}>← Prev</button>}
            {data?.items?.length === 20 && <button className="border px-3 py-1 rounded text-sm" onClick={() => setPage(p => p + 1)}>Next →</button>}
          </div>
        </>
      )}
    </div>
  )
}
