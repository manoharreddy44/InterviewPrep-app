import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Feedback() {
  const interviewTypes = [
    { label: 'GD', value: 'GD' },
    { label: 'HR', value: 'HR' },
    { label: 'Technical', value: 'TECHNICAL' },
  ];
  const [selectedType, setSelectedType] = useState(interviewTypes[0].value);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    fetchInterviews();
  }, [selectedType]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/report', {
        interviewType: selectedType
      });
      const interviewsWithFeedback = response.data.interviews.filter(
        interview => {
          if (interview.interview_type === 'TECHNICAL' || interview.interview_type === 'HR') {
            return interview.score && interview.score.finalEvaluation;
          }
          return interview.score && interview.score.feedBack;
        }
      );
      setInterviews(interviewsWithFeedback || []);
      setSelectedInterview(null);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const FeedbackCard = ({ interview }) => (
    <div
      onClick={() => setSelectedInterview(interview)}
      className="group bg-base-100 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-base-300 hover:border-primary/20"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                {interview.interview_type}
              </span>
              <span className="text-xs text-base-content/60">
                {new Date(interview.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="font-semibold text-base-content line-clamp-2 group-hover:text-primary transition-colors">
              {interview.topic || 'Technical Interview'}
            </h3>
          </div>
        </div>

        {/* Feedback Preview */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-base-100 z-10" />
            <p className="text-sm text-base-content/80 line-clamp-4 relative">
              {interview.interview_type === 'TECHNICAL'
                ? interview.score.finalEvaluation.feedback
                : interview.score.feedBack}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-base-300 flex items-center justify-between">
          <span className="text-xs text-base-content/60">Click to view full feedback</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-base-content/40 group-hover:text-primary transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  const FeedbackDetails = ({ interview, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-base-100 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                {interview.interview_type}
              </span>
              <span className="text-xs text-base-content/60">
                {new Date(interview.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-base-content">
              {interview.topic || 'Technical Interview'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle hover:bg-base-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {interview.interview_type === 'TECHNICAL' ? (
            <div className="space-y-6">
              {/* Questions and Answers with Feedback */}
              {Object.entries(interview.score)
                .filter(([key]) => key.startsWith('question_'))
                .map(([key, value]) => (
                  <div key={key} className="bg-base-200 p-4 rounded-xl">
                    <h4 className="font-semibold text-primary mb-2">Question {key.split('_')[1]}</h4>
                    <p className="text-base-content/90 mb-3">{value.question}</p>
                    <p className="text-base-content/80 mb-2">
                      <span className="font-medium">Response:</span> {value.response}
                    </p>
                    <div className="text-sm mt-1">
                      <span className="font-medium">Feedback:</span> {value.feedback}
                    </div>
                  </div>
                ))}
              {/* Final Feedback */}
              {interview.score.finalEvaluation && (
                <div className="p-5 bg-primary/5 rounded-xl">
                  <h4 className="font-semibold text-primary mb-3">Final Feedback</h4>
                  <p className="text-base-content/90 whitespace-pre-wrap leading-relaxed">
                    {interview.score.finalEvaluation.feedback}
                  </p>
                </div>
              )}
            </div>
          ) : interview.interview_type === 'HR' ? (
            <div className="space-y-6">
              {/* HR Questions and Answers with Feedback */}
              {Object.entries(interview.score)
                .filter(([key]) => key.startsWith('question_'))
                .map(([key, value]) => (
                  <div key={key} className="bg-base-200 p-4 rounded-xl">
                    <h4 className="font-semibold text-primary mb-2">Question {key.split('_')[1]}</h4>
                    <p className="text-base-content/90 mb-3">{value.question}</p>
                    <p className="text-base-content/80 mb-2">
                      <span className="font-medium">Response:</span> {value.response}
                    </p>
                    <div className="text-sm mt-1">
                      <span className="font-medium">Feedback:</span> {value.feedback}
                    </div>
                  </div>
                ))}
              {/* Final Feedback */}
              {interview.score.finalEvaluation && (
                <div className="p-5 bg-primary/5 rounded-xl">
                  <h4 className="font-semibold text-primary mb-3">Final Feedback</h4>
                  <p className="text-base-content/90 whitespace-pre-wrap leading-relaxed">
                    {interview.score.finalEvaluation.feedback}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 bg-primary/5 rounded-xl">
              <h4 className="font-semibold text-primary mb-3">Feedback</h4>
              <p className="text-base-content/90 whitespace-pre-wrap leading-relaxed">
                {interview.score.feedBack}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-primary">Interview Feedback</h1>
        
        {/* Interview Type Buttons */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          {interviewTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`btn btn-sm rounded-full ${
                selectedType === type.value ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Feedback Display */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-lg">Loading...</div>
          ) : interviews.length === 0 ? (
            <div className="text-center text-lg text-base-content/70">
              No feedback available for <strong>{selectedType}</strong> interviews
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interviews.map((interview) => (
                <FeedbackCard key={interview._id} interview={interview} />
              ))}
            </div>
          )}
        </div>

        {/* Detailed View Modal */}
        {selectedInterview && (
          <FeedbackDetails
            interview={selectedInterview}
            onClose={() => setSelectedInterview(null)}
          />
        )}
      </div>
    </div>
  );
}
