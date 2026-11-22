import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">Prajaakeeya+</h1>
      <p className="text-lg text-gray-600 mb-2">Civic engagement for Bengaluru residents</p>
      <p className="text-gray-500 mb-8 max-w-xl mx-auto">
        Report civic issues, upvote what matters most, and hold your MLA accountable —
        all powered by community votes and transparent ward-level priority queues.
      </p>
      <div className="flex justify-center gap-4 flex-wrap mb-12">
        <Link to="/feed" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
          Browse Issues
        </Link>
        <Link to="/issues/new" className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50">
          Report an Issue
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="border rounded-lg p-5">
          <div className="text-2xl mb-2">🗳️</div>
          <h3 className="font-semibold mb-1">Upvote-driven Priority</h3>
          <p className="text-sm text-gray-500">Issues float to the top by community votes. MLAs see a ranked action list.</p>
        </div>
        <div className="border rounded-lg p-5">
          <div className="text-2xl mb-2">🔍</div>
          <h3 className="font-semibold mb-1">Duplicate Detection</h3>
          <p className="text-sm text-gray-500">AI + tag matching finds similar issues so efforts aren't duplicated.</p>
        </div>
        <div className="border rounded-lg p-5">
          <div className="text-2xl mb-2">🏆</div>
          <h3 className="font-semibold mb-1">Gamification</h3>
          <p className="text-sm text-gray-500">Earn points, badges, and climb your ward leaderboard for civic participation.</p>
        </div>
      </div>
    </div>
  )
}
