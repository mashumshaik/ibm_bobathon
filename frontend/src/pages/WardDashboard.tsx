import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

export default function WardDashboard() {
  const { wardId } = useParams()

  const { data: feed, isLoading } = useQuery({
    queryKey: ['ward-feed', wardId],
    queryFn: () => api.get(`/wards/${wardId}/priority-feed`),
  })

  const { data: stats } = useQuery({
    queryKey: ['ward-stats', wardId],
    queryFn: () => api.get(`/wards/${wardId}/stats`),
  })

  if (isLoading) return <p className="text-gray-400">Loading...</p>

  const ward = feed?.ward

  return (
    <div>
      {ward && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h1 className="text-xl font-bold">{ward.name}</h1>
          <p className="text-gray-600 text-sm">{ward.constituency} constituency</p>
          {ward.mla_name && (
            <p className="text-sm mt-1">MLA: <strong>{ward.mla_name}</strong> ({ward.mla_party})</p>
          )}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="border rounded p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total_open}</div>
            <div className="text-xs text-gray-500">Open</div>
          </div>
          <div className="border rounded p-3 text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.total_in_progress}</div>
            <div className="text-xs text-gray-500">In Progress</div>
          </div>
          <div className="border rounded p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.total_resolved}</div>
            <div className="text-xs text-gray-500">Resolved</div>
          </div>
        </div>
      )}

      <h2 className="font-semibold mb-3">Priority Issue Queue</h2>
      {feed?.issues?.length === 0 && <p className="text-gray-400 text-sm">No open issues in this ward.</p>}
      <div className="space-y-2">
        {feed?.issues?.map((issue: any, i: number) => (
          <Link key={issue.id} to={`/issues/${issue.id}`} className="flex items-center gap-3 border rounded p-3 hover:bg-gray-50 text-sm">
            <span className="text-gray-400 w-6 text-center font-bold">#{i + 1}</span>
            <div className="flex-1">
              <span className="font-medium">{issue.title}</span>
              <span className="ml-2 bg-gray-100 px-1.5 py-0.5 rounded text-xs">{issue.category}</span>
              {issue.has_duplicates && <span className="ml-1 text-orange-500 text-xs">⚠</span>}
            </div>
            <span className="text-blue-600 font-semibold">▲ {issue.upvote_count}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
