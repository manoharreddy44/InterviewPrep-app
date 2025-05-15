import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  MessageSquare, 
  FileText, 
  LineChart, 
  Users, 
  HelpCircle,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import logo from '../../utils/logo.svg'

const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    {
      icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Technical Round Practice",
      description: "Practice technical interview questions about your domain knowledge, system design, and problem-solving abilities.",
    },
    {
      icon: <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "HR Round Simulation",
      description: "Prepare for behavioral and situational questions with our AI interviewer. Get instant feedback on responses.",
    },
    {
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Group Discussion Practice",
      description: "Simulate group discussion scenarios and improve your team collaboration and leadership skills.",
    },
  ];

  const testimonials = [
    {
      initials: "JD",
      name: "John Doe",
      role: "System Architect",
      quote: "The technical round practice helped me prepare for system design and architecture questions. The AI feedback helped me structure my answers better.",
    },
    {
      initials: "SS",
      name: "Sarah Smith",
      role: "Product Manager",
      quote: "The HR round simulation felt very realistic. I was better prepared for behavioral questions and received great feedback on my communication style.",
    },
    {
      initials: "MJ",
      name: "Michael Johnson",
      role: "DevOps Engineer",
      quote: "Practicing infrastructure and deployment scenarios in the technical round really boosted my confidence. The feedback helped me explain complex concepts clearly.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-100 to-base-200">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-base-100/80 border-b border-base-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center">
            <img src={logo} alt="logo" className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="ml-2 text-lg sm:text-xl font-bold">Interview<span className="text-primary">PrepAI</span></span>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden flex items-center"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/login" className="text-base-content/80 hover:text-primary transition-colors">Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Sign up free</Link>
          </div>
        </div>
        
        {/* Mobile menu panel */}
        {menuOpen && (
          <div className="md:hidden bg-base-100 py-4 px-4 border-b border-base-200">
            <div className="flex flex-col gap-4">
              <Link 
                to="/login" 
                className="py-2 px-4 text-center rounded-lg hover:bg-base-200"
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>
              <Link 
                to="/signup" 
                className="py-2 px-4 text-center rounded-lg bg-primary text-white"
                onClick={() => setMenuOpen(false)}
              >
                Sign up free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Master Your Interview Skills with AI
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-base-content/70 mb-6 sm:mb-8">
              Practice interviews, get instant AI feedback, and track your progress to land your dream job.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link 
                to="/signup" 
                className="btn btn-primary btn-md sm:btn-lg"
              >
                Start Free Practice
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Link>
              <Link 
                to="/login" 
                className="btn btn-outline btn-md sm:btn-lg"
              >
                View Demo
              </Link>
            </div>
          </div>

          {/* Example Card - made responsive */}
          <div className="max-w-2xl mx-auto bg-[#1E2028] rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl overflow-hidden border border-base-700">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="bg-[#4338CA] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">Technical</div>
                  <span className="text-gray-400 text-xs sm:text-sm">HR</span>
                  <span className="text-gray-400 text-xs sm:text-sm">Group Discussion</span>
                </div>
                <div className="bg-gray-800 text-gray-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">Question 1</div>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <p className="text-base sm:text-lg text-white font-medium">
                    Explain the concept of transfer learning in machine learning. How can pre-trained models be leveraged for specific tasks?
                  </p>
                </div>
                <div className="bg-[#1A1B23] rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <div className="flex flex-col gap-4 sm:gap-6">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Technical Score */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-14 h-14 sm:w-20 sm:h-20">
                          <svg viewBox="0 0 100 100" className="transform -rotate-90">
                            {/* Background circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              className="stroke-[#1E293B] stroke-[6] fill-none"
                            />
                            {/* Progress circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              className="stroke-[#6366F1] stroke-[6] fill-none"
                              strokeLinecap="round"
                              strokeDasharray="264"
                              strokeDashoffset={264 - (264 * 37) / 40}
                              style={{ transition: "stroke-dashoffset 0.5s" }}
                            />
                            {/* Score text */}
                            <text
                              x="50"
                              y="50"
                              className="fill-[#6366F1] text-2xl font-medium"
                              dominantBaseline="middle"
                              textAnchor="middle"
                              transform="rotate(90 50 50)"
                              style={{ fontSize: "16px" }}
                            >
                              37/40
                            </text>
                          </svg>
                        </div>
                        <span className="text-gray-400 text-xs mt-2">Technical</span>
                      </div>

                      {/* Problem Solving Score */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-14 h-14 sm:w-20 sm:h-20">
                          <svg viewBox="0 0 100 100" className="transform -rotate-90">
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              className="stroke-[#1E293B] stroke-[6] fill-none"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              className="stroke-[#6366F1] stroke-[6] fill-none"
                              strokeLinecap="round"
                              strokeDasharray="264"
                              strokeDashoffset={264 - (264 * 28) / 30}
                              style={{ transition: "stroke-dashoffset 0.5s" }}
                            />
                            <text
                              x="50"
                              y="50"
                              className="fill-[#6366F1] text-2xl font-medium"
                              dominantBaseline="middle"
                              textAnchor="middle"
                              transform="rotate(90 50 50)"
                              style={{ fontSize: "16px" }}
                            >
                              28/30
                            </text>
                          </svg>
                        </div>
                        <span className="text-gray-400 text-xs mt-2">Problem Solving</span>
                      </div>

                      {/* Communication Score */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-14 h-14 sm:w-20 sm:h-20">
                          <svg viewBox="0 0 100 100" className="transform -rotate-90">
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              className="stroke-[#1E293B] stroke-[6] fill-none"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              className="stroke-[#6366F1] stroke-[6] fill-none"
                              strokeLinecap="round"
                              strokeDasharray="264"
                              strokeDashoffset={264 - (264 * 25) / 30}
                              style={{ transition: "stroke-dashoffset 0.5s" }}
                            />
                            <text
                              x="50"
                              y="50"
                              className="fill-[#6366F1] text-2xl font-medium"
                              dominantBaseline="middle"
                              textAnchor="middle"
                              transform="rotate(90 50 50)"
                              style={{ fontSize: "16px" }}
                            >
                              25/30
                            </text>
                          </svg>
                        </div>
                        <span className="text-gray-400 text-xs mt-2">Communication</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Feedback:</div>
                      <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">
                        The response demonstrates a strong understanding of transfer learning by mentioning starting with a pre-trained model, fine-tuning it on a specific dataset, and leveraging learned features. The explanation is accurate, complete, and relevant. One area for improvement could be providing a specific example or case study to further illustrate the concept.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 sm:py-20 px-4 bg-base-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Complete Interview Preparation</h2>
            <p className="text-sm sm:text-base md:text-lg text-base-content/70">
              Practice all aspects of job interviews with our comprehensive AI-powered platform.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-base-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-md sm:shadow-lg hover:shadow-xl transition-shadow border border-base-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center text-primary mb-4 sm:mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-base-content/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-lg text-base-content/70">
              Join thousands of successful candidates who prepared with InterviewPrepAI
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-base-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-base-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-base-content/60 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <blockquote className="text-base-content/80 italic">
                  "{testimonial.quote}"
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-base-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Excel in Your Interviews?</h2>
          <p className="text-lg text-base-content/70 mb-8">
            Join now and get access to comprehensive interview preparation tools, AI-powered feedback, and progress tracking.
          </p>
          <Link 
            to="/signup" 
            className="btn btn-primary btn-lg"
          >
            Start Free Practice
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-base-300 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
              <img src={logo} alt="logo" className="w-6 h-6" />
              <span className="ml-2 text-base font-semibold">Interview<span className="text-primary">PrepAI</span></span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="text-base-content/60 hover:text-primary transition-colors">Terms</Link>
              <Link to="/privacy" className="text-base-content/60 hover:text-primary transition-colors">Privacy</Link>
              <span className="text-base-content/60">© 2024 InterviewPrepAI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 