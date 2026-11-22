import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

const BADGE_EMOJI: Record<string, string> = {
  FIRST_REPORTER: '🌱',
  CIVIC_CHAMPION: '🏅',
  COMMUNITY_VOICE: '📢',
  PROBLEM_SOLVER: '🔧',
  WARD_HERO: '🏆',
}

export default function Leaderboard() {
  const [tab, setTab] = useState<'global' | 'ward'>('global')
  const [wardId, setWardId] = useState('')

  const { data: users, isLoading } = useQuery({
    queryKey: ['leaderboard', tab, wardId],
    queryFn: () => tab === 'global'
      ? api.get('/leaderboard/global')
      : api.get(`/leaderboard${wardId ? `?ward_id=${wardId}` : ''}`),
  })

  const { data: wards } = useQuery({ queryKey: ['wards'], queryFn: () => api.get('/wards') })

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Leaderboard</h1>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('global')}
          className={`px-4 py-1.5 rounded text-sm font-medium ${tab === 'global' ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}
        >Global</button>
        <button
          onClick={() => setTab('ward')}
          className={`px-4 py-1.5 rounded text-sm font-medium ${tab === 'ward' ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}
        >By Ward</button>
        {tab === 'ward' && (
          <select className="border rounded px-2 py-1 text-sm" value={wardId} onChange={e => setWardId(e.target.value)}>
            <option value="">All Verified Users</option>
            {wards?.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        )}
      </div>

      {isLoading ? <p className="text-gray-400">Loading...</p> : (
        <div className="space-y-2">
          {users?.map((u: any, i: number) => (
            <div key={u.id} className="flex items-center gap-3 border rounded-lg p-3">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-300' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {i + 1}
              </span>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                {(u.name || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{u.name || 'Anonymous'}</p>
                {u.ward_name && <p className="text-xs text-gray-400">{u.ward_name}</p>}
              </div>
              <div className="flex gap-1">
                {u.badges?.map((b: string) => <span key={b} title={b}>{BADGE_EMOJI[b] || '🎖'}</span>)}
              </div>
              <span className="font-bold text-blue-600">{u.points} pts</span>
            </div>
          ))}
          {users?.length === 0 && <p className="text-gray-400 text-center py-8">No data yet. Be the first!</p>}
        </div>
      )}
    </div>
  )
}
