import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const BADGE_EMOJI: Record<string, string> = {
  FIRST_REPORTER: '🌱',
  CIVIC_CHAMPION: '🏅',
  COMMUNITY_VOICE: '📢',
  PROBLEM_SOLVER: '🔧',
  WARD_HERO: '🏆',
}

export default function Profile() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me'),
    enabled: !!token,
  })

  const { data: myIssues } = useQuery({
    queryKey: ['my-issues'],
    queryFn: () => api.get('/issues?page_size=50'),
    enabled: !!token,
  })

  if (!token) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 mb-4">Login to view your profile.</p>
        <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded">Login</Link>
      </div>
    )
  }

  if (isLoading) return <p className="text-gray-400">Loading...</p>

  const userIssues = myIssues?.items?.filter((i: any) => i.reporter_name && me?.name && i.reporter_name.startsWith(me.name.split(' ')[0])) || []

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700">
          {(me?.name || '?')[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold">{me?.name || 'Anonymous'}</h1>
          <p className="text-gray-400 text-sm">Ward ID: {me?.ward_id || 'Not set'}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="border rounded p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{me?.points || 0}</div>
          <div className="text-xs text-gray-500">Points</div>
        </div>
        <div className="border rounded p-3 text-center">
          <div className="text-2xl font-bold">{me?.issues_posted || 0}</div>
          <div className="text-xs text-gray-500">Issues Posted</div>
        </div>
        <div className="border rounded p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{me?.issues_resolved || 0}</div>
          <div className="text-xs text-gray-500">Resolved</div>
        </div>
      </div>

      {me?.badges?.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Badges</h2>
          <div className="flex flex-wrap gap-3">
            {me.badges.map((b: any) => (
              <div key={b.badge_type} className="flex flex-col items-center border rounded p-2 w-20 text-center">
                <span className="text-2xl">{BADGE_EMOJI[b.badge_type] || '🎖'}</span>
                <span className="text-xs text-gray-500 mt-1">{b.badge_type.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold">My Issues</h2>
        <Link to="/issues/new" className="text-sm text-blue-600 hover:underline">+ New Issue</Link>
      </div>
      {userIssues.length === 0 ? (
        <p className="text-gray-400 text-sm">You haven't posted any issues yet.</p>
      ) : (
        <div className="space-y-2">
          {userIssues.map((i: any) => (
            <Link key={i.id} to={`/issues/${i.id}`} className="flex items-center gap-2 border rounded p-3 text-sm hover:bg-gray-50">
              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{i.category}</span>
              <span className="flex-1">{i.title}</span>
              <span className="text-blue-600">▲ {i.upvote_count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
