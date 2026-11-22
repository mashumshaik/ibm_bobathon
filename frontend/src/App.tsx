import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Feed from './pages/Feed'
import PostIssue from './pages/PostIssue'
import IssueDetail from './pages/IssueDetail'
import WardDashboard from './pages/WardDashboard'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Login from './pages/Login'

function Nav() {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  const navigate = useNavigate()
  return (
    <nav className="bg-blue-700 text-white px-4 py-3 flex items-center gap-6 shadow">
      <Link to="/" className="font-bold text-lg tracking-tight">🗳️ Prajaakeeya+</Link>
      <Link to="/feed" className="hover:underline text-sm">Feed</Link>
      <Link to="/leaderboard" className="hover:underline text-sm">Leaderboard</Link>
      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <>
            <Link to="/profile" className="text-sm hover:underline">{user.name || user.phone}</Link>
            <button
              className="text-sm bg-white text-blue-700 rounded px-2 py-1"
              onClick={() => { localStorage.clear(); navigate('/') }}
            >Logout</button>
          </>
        ) : (
          <Link to="/login" className="text-sm bg-white text-blue-700 rounded px-3 py-1 font-medium">Login</Link>
        )}
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/issues/new" element={<PostIssue />} />
          <Route path="/issues/:id" element={<IssueDetail />} />
          <Route path="/ward/:wardId" element={<WardDashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
