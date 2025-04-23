import React from 'react';
import useLogout from '../hooks/useLogout';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Logout() {
  const { loading, logout } = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="absolute bottom-0 left-0 w-full p-4 border-t border-base-200">
      <button 
        className="btn btn-ghost w-full justify-start gap-3"
        onClick={handleLogout}
        disabled={loading}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        </svg>
        {loading ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
} 