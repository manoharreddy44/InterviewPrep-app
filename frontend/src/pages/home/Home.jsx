import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/sidebar/Sidebar'


export default function Home() {
  return (
    <div className="flex min-h-screen bg-base-200">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  )
} 