import { BrowserRouter, Route, Routes } from 'react-router-dom'
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
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Home />}>
          <Route path="progress" element={<Progress />} />
          <Route path="technical-round" element={<TechnicalRound />} />
          <Route path="hr-round" element={<HrRound />} />
          <Route path="group-discussions" element={<GroupDiscussions />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="profile" element={<Profile />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
      <Toaster/>
    </BrowserRouter>
  )
}

export default App
