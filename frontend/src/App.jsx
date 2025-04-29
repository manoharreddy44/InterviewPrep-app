import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/home/Home' 
import Progress from './components/sidebar/Progress'
import TechnicalRound from './components/sidebar/TechnicalRound'
import HrRound from './components/sidebar/HrRound'
import GroupDiscussions from './components/sidebar/GroupDiscussions'
import Feedback from './components/sidebar/Feedback'
import Profile from './components/sidebar/Profile'
import Analytics from './components/sidebar/Analytics'
import Login from './pages/login/Login'
import SignUp from './pages/signup/SignUp'
import LandingPage from './pages/landing/LandingPage'
import { Toaster } from 'react-hot-toast'
import { useAuthContext } from './context/AuthContext'

function App() {
  const { authUser } = useAuthContext();
  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={authUser ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/login" element={authUser ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={authUser ? <Navigate to="/dashboard" /> : <SignUp />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={authUser ? <Home /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="analytics" replace />} />
          <Route path="progress" element={<Progress />} />
          <Route path="technical-round" element={<TechnicalRound />} />
          <Route path="hr-round" element={<HrRound />} />
          <Route path="group-discussions" element={<GroupDiscussions />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="profile" element={<Profile />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster/>
    </div>
  )
}

export default App
