import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'

export default function IssueDetail() {
  const { id } = useParams()
  const qc = useQueryClient()

  const { data: issue, isLoading } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => api.get(`/issues/${id}`),
  })

  const voteMutation = useMutation({
    mutationFn: ({ voted }: { voted: boolean }) =>
      voted ? api.delete(`/issues/${id}/vote`) : api.post(`/issues/${id}/vote`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issue', id] }),
  })

  if (isLoading) return <p className="text-gray-400">Loading...</p>
  if (!issue) return <p className="text-red-500">Issue not found</p>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">{issue.title}</h1>
          <div className="flex flex-wrap gap-2 text-sm mb-2">
            <span className="bg-gray-100 px-2 py-0.5 rounded">{issue.category}</span>
            <span className="text-gray-500">{issue.ward_name}</span>
            <span className={`px-2 py-0.5 rounded ${issue.status === 'resolved' ? 'bg-green-100 text-green-700' : issue.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-50 text-blue-600'}`}>
              {issue.status}
            </span>
          </div>
          <p className="text-gray-400 text-xs">Reported by {issue.reporter_name} · {new Date(issue.created_at).toLocaleDateString()}</p>
        </div>
        <button
          onClick={() => {
            if (!localStorage.getItem('token')) { alert('Login to vote'); return }
            voteMutation.mutate({ voted: issue.voted })
          }}
          className={`flex flex-col items-center px-4 py-2 rounded border ${issue.voted ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-blue-50'}`}
        >
          <span>▲</span>
          <span className="font-bold text-lg">{issue.upvote_count}</span>
          <span className="text-xs">votes</span>
        </button>
      </div>

      {issue.has_duplicates && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 text-sm text-orange-700">
          ⚠️ Similar issues have been reported in your ward. See below.
        </div>
      )}

      <div className="border rounded-lg p-4 mb-4 bg-gray-50">
        <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
      </div>

      {issue.duplicates?.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Similar Issues</h2>
          <div className="space-y-2">
            {issue.duplicates.map((d: any) => (
              <a key={d.id} href={`/issues/${d.target_issue_id}`} className="block border rounded p-3 text-sm hover:bg-gray-50">
                Issue #{d.target_issue_id} — similarity: {(d.similarity_score * 100).toFixed(0)}% via {d.method}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
