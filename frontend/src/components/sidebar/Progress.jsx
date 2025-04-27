import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Progress() {
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
      setInterviews(response.data.interviews || []);
      setSelectedInterview(null);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const InterviewCard = ({ interview }) => (
    <div
      onClick={() => setSelectedInterview(interview)}
      className="group bg-base-100 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-base-300 hover:border-primary/20"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {interview.interview_type}
              </span>
              <span className="text-xs text-base-content/60">
                {new Date(interview.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="font-semibold text-base-content line-clamp-1 group-hover:text-primary transition-colors mt-1">
              {interview.topic || 'Technical Interview'}
            </h3>
          </div>
        </div>

        {/* Score Preview */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-base-100 z-10" />
            <div className="space-y-2 relative">
              {interview.score ? (
                interview.interview_type === 'TECHNICAL' ? (
                  // Technical Interview Score Display
                  <>
                    {/* List only the scores for each question */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.entries(interview.score)
                        .filter(([key]) => key.startsWith('question_'))
                        .map(([key, value], idx) => (
                          <div key={key} className="bg-base-200/50 p-1.5 rounded-lg flex flex-col items-center">
                            <div className="text-[10px] text-base-content/60">Q{idx + 1}</div>
                            <div className="text-sm font-bold text-base-content">{value.score}</div>
                          </div>
                        ))}
                    </div>
                    {/* Final Evaluation (only the required fields) */}
                    {interview.score.finalEvaluation && (
                      <div className="bg-primary/5 p-2 rounded-lg mt-2">
                        <div className="text-xs font-semibold text-primary mb-1">Final Evaluation</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-xs text-base-content/70">Technical Knowledge</div>
                            <div className="text-base font-bold text-primary">
                              {interview.score.finalEvaluation.technicalKnowledge}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-base-content/70">Problem Solving Skills</div>
                            <div className="text-base font-bold text-primary">
                              {interview.score.finalEvaluation.problemSolvingSkills}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-base-content/70">Communication Skills</div>
                            <div className="text-base font-bold text-primary">
                              {interview.score.finalEvaluation.communicationSkills}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-base-content/70">Overall Score</div>
                            <div className="text-base font-bold text-primary">
                              {interview.score.finalEvaluation.overallScore}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Other Interview Types Score Display
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(interview.score).map(([key, value]) => {
                      if (key !== 'feedBack' && key !== 'OverallScore') {
                        return (
                          <div
                            key={key}
                            className="bg-base-200/50 p-1.5 rounded-lg flex flex-col items-center"
                          >
                            <div className="text-[10px] text-base-content/60">{key}</div>
                            <div className="text-sm font-bold text-base-content">{value}</div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )
              ) : (
                <div className="col-span-2 text-center text-xs text-base-content/60 py-1">
                  No score available yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-base-300 flex items-center justify-between">
          <span className="text-xs text-base-content/60">Click to view details</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 text-base-content/40 group-hover:text-primary transition-colors"
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

  const InterviewDetails = ({ interview, onClose }) => (
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
          {interview.score ? (
            interview.interview_type === 'TECHNICAL' ? (
              // Technical Interview Details (score-only)
              <>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(interview.score)
                    .filter(([key]) => key.startsWith('question_'))
                    .map(([key, value], idx) => (
                      <div key={key} className="bg-base-200 p-4 rounded-xl flex flex-col items-center">
                        <div className="text-xs text-base-content/60 mb-1">Q{idx + 1}</div>
                        <div className="text-xl font-bold text-primary">{value.score}</div>
                      </div>
                    ))}
                </div>
                {/* Final Evaluation (only the required fields) */}
                {interview.score.finalEvaluation && (
                  <div className="bg-primary/5 p-4 rounded-xl mt-4">
                    <h4 className="font-semibold text-primary mb-3">Final Evaluation</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-base-content/70">Technical Knowledge</div>
                        <div className="text-xl font-bold text-primary">
                          {interview.score.finalEvaluation.technicalKnowledge}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-base-content/70">Problem Solving Skills</div>
                        <div className="text-xl font-bold text-primary">
                          {interview.score.finalEvaluation.problemSolvingSkills}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-base-content/70">Communication Skills</div>
                        <div className="text-xl font-bold text-primary">
                          {interview.score.finalEvaluation.communicationSkills}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-base-content/70">Overall Score</div>
                        <div className="text-xl font-bold text-primary">
                          {interview.score.finalEvaluation.overallScore}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Other Interview Types Details
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(interview.score).map(([key, value]) => {
                  if (key !== 'feedBack') {
                    return (
                      <div
                        key={key}
                        className="bg-base-200 p-1.5 rounded-lg flex flex-col items-center"
                      >
                        <div className="text-[10px] text-base-content/60">{key}</div>
                        <div className="text-sm font-bold text-base-content">{value}</div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )
          ) : (
            <div className="text-center text-base-content/70 py-8">
              No score available yet
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-primary">Interview Progress</h1>
        
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

        {/* Progress Display */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-lg">Loading...</div>
          ) : interviews.length === 0 ? (
            <div className="text-center text-lg text-base-content/70">
              No interviews found for <strong>{selectedType}</strong>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interviews.map((interview) => (
                <InterviewCard key={interview._id} interview={interview} />
              ))}
            </div>
          )}
        </div>

        {/* Detailed View Modal */}
        {selectedInterview && (
          <InterviewDetails
            interview={selectedInterview}
            onClose={() => setSelectedInterview(null)}
          />
        )}
      </div>
    </div>
  );
}

