import React from 'react'
import SignUpForm from './SignUpForm'


export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-gray-900 to-black bg-cover bg-center p-2">
      {/* Signup Container */}
      <div className="relative w-full max-w-md p-6 rounded-xl bg-gray-900/70 backdrop-blur-md">
        {/* Title */}
        <div className="mb-6 text-center space-y-1">
          <h1 className="text-2xl font-semibold">
            <span className="text-white">Join </span>
            <span className="text-indigo-400">AI Interview</span>
          </h1>
          <p className="text-gray-400 text-sm">Start your interview preparation journey</p>
          <div className="flex items-center justify-center space-x-2 text-indigo-300/80">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            <span className="text-xs">AI-Powered Practice</span>
          </div>
        </div>

        {/* Form Section */}
        <div className="space-y-4">
          <SignUpForm />
        </div>
      </div>
    </div>
  )
}
