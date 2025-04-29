import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  MessageSquare, 
  FileText, 
  LineChart, 
  Users, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import logo from '../../utils/logo.svg'

const LandingPage = () => {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Technical Round Practice",
      description: "Practice technical interview questions about your domain knowledge, system design, and problem-solving abilities.",
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "HR Round Simulation",
      description: "Prepare for behavioral and situational questions with our AI interviewer. Get instant feedback on responses.",
    },
    {
      icon: <Users className="w-6 h-6" />,
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
            <img src={logo} alt="logo" className="w-8 h-8" />
            <span className="ml-2 text-xl font-bold">Interview<span className="text-primary">PrepAI</span></span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-base-content/80 hover:text-primary transition-colors">Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Sign up free</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Master Your Interview Skills with AI
            </h1>
            <p className="text-xl text-base-content/70 mb-8">
              Practice interviews, get instant AI feedback, and track your progress to land your dream job.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup" 
                className="btn btn-primary btn-lg"
              >
                Start Free Practice
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link 
                to="/login" 
                className="btn btn-outline btn-lg"
              >
                View Demo
              </Link>
            </div>
          </div>

          {/* Example Card */}
          <div className="max-w-2xl mx-auto bg-[#1E2028] rounded-2xl shadow-2xl overflow-hidden border border-base-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-[#4338CA] text-white px-3 py-1 rounded-full text-sm">Technical</div>
                  <span className="text-gray-400 text-sm">HR</span>
                  <span className="text-gray-400 text-sm">Group Discussion</span>
                </div>
                <div className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">Question 1</div>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-lg text-white font-medium">
                    Explain the concept of transfer learning in machine learning. How can pre-trained models be leveraged for specific tasks?
                  </p>
                </div>
                <div className="bg-[#1A1B23] rounded-xl p-6">
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle
                              className="text-gray-700"
                              strokeWidth="8"
                              stroke="currentColor"
                              fill="transparent"
                              r="42"
                              cx="48"
                              cy="48"
                            />
                            <circle
                              className="text-[#6366F1]"
                              strokeWidth="8"
                              strokeDasharray={264}
                              strokeDashoffset={264 - (264 * 37) / 40}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="transparent"
                              r="42"
                              cx="48"
                              cy="48"
                            />
                          </svg>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <span className="text-[#6366F1] text-xl font-medium">37/40</span>
                          </div>
                        </div>
                        <span className="text-gray-400 text-sm mt-2">Technical Knowledge</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle
                              className="text-gray-700"
                              strokeWidth="8"
                              stroke="currentColor"
                              fill="transparent"
                              r="42"
                              cx="48"
                              cy="48"
                            />
                            <circle
                              className="text-[#6366F1]"
                              strokeWidth="8"
                              strokeDasharray={264}
                              strokeDashoffset={264 - (264 * 28) / 30}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="transparent"
                              r="42"
                              cx="48"
                              cy="48"
                            />
                          </svg>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <span className="text-[#6366F1] text-xl font-medium">28/30</span>
                          </div>
                        </div>
                        <span className="text-gray-400 text-sm mt-2">Problem Solving</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle
                              className="text-gray-700"
                              strokeWidth="8"
                              stroke="currentColor"
                              fill="transparent"
                              r="42"
                              cx="48"
                              cy="48"
                            />
                            <circle
                              className="text-[#6366F1]"
                              strokeWidth="8"
                              strokeDasharray={264}
                              strokeDashoffset={264 - (264 * 25) / 30}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="transparent"
                              r="42"
                              cx="48"
                              cy="48"
                            />
                          </svg>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <span className="text-[#6366F1] text-xl font-medium">25/30</span>
                          </div>
                        </div>
                        <span className="text-gray-400 text-sm mt-2">Communication</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-2">Feedback:</div>
                      <p className="text-gray-300 leading-relaxed">
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
      <section className="py-20 px-4 bg-base-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">Complete Interview Preparation</h2>
            <p className="text-lg text-base-content/70">
              Practice all aspects of job interviews with our comprehensive AI-powered platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-base-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-base-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-base-content/70">{feature.description}</p>
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