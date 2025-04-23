import React, { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import useLogout from '../../hooks/useLogout'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Profile() {
  const { authUser, setAuthUser } = useAuthContext();
  const { logout } = useLogout();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: authUser?.username || '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.success('Profile updated successfully');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // await logout();
      // navigate('/login');
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        return;
      }
      toast.success('Resume uploaded successfully');
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center mb-4 text-primary">
          Profile
        </h1>

        {/* Profile Section */}
        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300">
          {/* Profile Picture Section */}
          <div className="p-4 pb-2">
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={authUser?.profilePic}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/30 ring-offset-2 ring-offset-base-100"
                />
                <button 
                  className="absolute bottom-0 right-0 bg-base-100 rounded-full p-1.5 shadow-md hover:bg-base-200 transition-colors border border-base-300"
                  aria-label="Change photo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-4 pb-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-base-content/70">Username</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input input-bordered bg-base-200/50 w-full rounded-xl focus:ring-2 ring-primary/50 h-9"
                  placeholder="Enter username"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-base-content/70">Password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input input-bordered bg-base-200/50 w-full rounded-xl focus:ring-2 ring-primary/50 h-9"
                  placeholder="Enter password to confirm changes"
                />
              </div>

              {/* Resume Upload */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-base-content/70">Resume</span>
                </label>
                <div className="flex items-center">
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-base-300 border-dashed rounded-xl cursor-pointer bg-base-200/50 hover:bg-base-200 transition-colors">
                      <div className="flex flex-col items-center justify-center py-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-base-content/70 mb-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <p className="text-xs text-base-content/70">Upload Resume (PDF, DOC, DOCX)</p>
                        <p className="text-xs text-base-content/50">Max size: 5MB</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm w-full rounded-xl mt-2"
              >
                Update Profile
              </button>
            </form>

            {/* Action Buttons */}
            <div className="flex justify-between mt-4 pt-3 text-xs border-t border-base-300">
              <button
                onClick={handleDeleteAccount}
                className="text-error hover:text-error/80 transition-colors"
              >
                Delete Account
              </button>
              <button
                onClick={logout}
                className="text-base-content/70 hover:text-base-content transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
