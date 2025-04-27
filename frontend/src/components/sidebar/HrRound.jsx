import React, { useState } from 'react';
import axios from 'axios';

export default function HrRound() {
  // Step 1: Collect job details
  const [jobRole, setJobRole] = useState('');
  const [experience, setExperience] = useState('');

  // Step 2: Interview state
  const [interviewId, setInterviewId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionKey, setQuestionKey] = useState('');
  const [response, setResponse] = useState('');
  const [questionScore, setQuestionScore] = useState(null);
  const [questionFeedback, setQuestionFeedback] = useState('');
  const [allQuestions, setAllQuestions] = useState([]); // {question, response, score, feedback}
  const [loading, setLoading] = useState(false);
  const [finalEvaluation, setFinalEvaluation] = useState(null);
  const [step, setStep] = useState('form'); // form, question, feedback, final

  // Step 1: Form submit handler
  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/interview/hr/question', {
        jobRole,
        experience,
      });
      setInterviewId(res.data.interviewId);
      setCurrentQuestion(res.data.question);
      setQuestionKey(res.data.questionKey);
      setResponse('');
      setQuestionScore(null);
      setQuestionFeedback('');
      setStep('question');
    } catch (err) {
      alert('Failed to get question');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit response for current question
  const submitResponse = async () => {
    if (!response.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/interview/hr/submit', {
        interviewId,
        response,
      });
      setQuestionScore(res.data.currentQuestionScore);
      setQuestionFeedback(res.data.feedback);
      setAllQuestions(prev => [
        ...prev,
        {
          question: res.data.question,
          response,
          score: res.data.currentQuestionScore,
          feedback: res.data.feedback,
          communicationSkills: res.data.communicationSkills,
          personalityFit: res.data.personalityFit,
          relevance: res.data.relevance,
        },
      ]);
      setStep('feedback');
    } catch (err) {
      alert('Failed to submit response');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Get next question
  const getNextQuestion = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/interview/hr/question', {
        jobRole,
        experience,
        interviewId,
      });
      setCurrentQuestion(res.data.question);
      setQuestionKey(res.data.questionKey);
      setResponse('');
      setQuestionScore(null);
      setQuestionFeedback('');
      setStep('question');
    } catch (err) {
      alert('Failed to get next question');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Final evaluation
  const getFinalEvaluation = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/interview/hr/evaluate', {
        interviewId,
      });
      setFinalEvaluation(res.data.finalEvaluation || {
        communicationSkills: 0,
        personalityFit: 0,
        relevance: 0,
        overallScore: 0,
        feedback: '',
      });
      setStep('final');
    } catch (err) {
      alert('Failed to get final evaluation');
    } finally {
      setLoading(false);
    }
  };

  // UI
  return (
    <div className="max-w-xl mx-auto p-6 bg-base-100 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4 text-primary">HR Interview Round</h2>
      {step === 'form' && (
        <form onSubmit={handleStart} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Job Role</label>
            <input
              className="input input-bordered w-full"
              value={jobRole}
              onChange={e => setJobRole(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Experience</label>
            <input
              className="input input-bordered w-full"
              value={experience}
              onChange={e => setExperience(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Start HR Round'}
          </button>
        </form>
      )}
      {step === 'question' && (
        <div>
          <div className="mb-4">
            <div className="text-base font-semibold mb-2 text-base-content/80">Question:</div>
            <div className="bg-base-200 p-3 rounded mb-2">{currentQuestion}</div>
          </div>
          <textarea
            className="textarea textarea-bordered w-full mb-3"
            rows={4}
            placeholder="Type your response..."
            value={response}
            onChange={e => setResponse(e.target.value)}
            disabled={loading}
          />
          <button className="btn btn-primary" onClick={submitResponse} disabled={loading || !response.trim()}>
            {loading ? 'Submitting...' : 'Submit Response'}
          </button>
        </div>
      )}
      {step === 'feedback' && (
        <div>
          <div className="mb-4">
            <div className="text-base font-semibold mb-2 text-base-content/80">Question:</div>
            <div className="bg-base-200 p-3 rounded mb-2">{currentQuestion}</div>
            <div className="text-sm text-base-content/70 mb-1">Your Response:</div>
            <div className="bg-base-200 p-2 rounded mb-2 text-base-content/80">{response}</div>
            <div className="text-sm text-base-content/70 mb-1">Score:</div>
            <div className="text-lg font-bold text-primary mb-2">{questionScore}</div>
            <div className="text-sm text-base-content/70 mb-1">Feedback:</div>
            <div className="bg-primary/10 p-2 rounded text-base-content/90">{questionFeedback}</div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={getNextQuestion} disabled={loading}>
              {loading ? 'Loading...' : 'Next Question'}
            </button>
            <button className="btn btn-outline" onClick={getFinalEvaluation} disabled={loading}>
              Evaluate Questions
            </button>
          </div>
        </div>
      )}
      {step === 'final' && finalEvaluation && (
        <div>
          <h3 className="text-xl font-bold text-primary mb-3">Final Evaluation</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-base-content/70">Communication Skills</div>
              <div className="text-xl font-bold text-primary">{finalEvaluation.communicationSkills}</div>
            </div>
            <div>
              <div className="text-sm text-base-content/70">Personality Fit</div>
              <div className="text-xl font-bold text-primary">{finalEvaluation.personalityFit}</div>
            </div>
            <div>
              <div className="text-sm text-base-content/70">Relevance</div>
              <div className="text-xl font-bold text-primary">{finalEvaluation.relevance}</div>
            </div>
            <div>
              <div className="text-sm text-base-content/70">Overall Score</div>
              <div className="text-xl font-bold text-primary">{finalEvaluation.overallScore}</div>
            </div>
          </div>
          <div className="mb-2">
            <div className="text-sm text-base-content/70">Feedback</div>
            <div className="bg-primary/10 p-2 rounded text-base-content/90 whitespace-pre-wrap">
              {finalEvaluation.feedback}
            </div>
          </div>
          <h4 className="mt-6 mb-2 text-base font-semibold text-base-content/80">Your Questions & Scores</h4>
          <div className="grid grid-cols-1 gap-2">
            {allQuestions.map((q, idx) => (
              <div
                key={idx}
                className="bg-base-200 p-2 rounded flex flex-row items-center justify-between"
              >
                <div className="text-sm text-base-content/70">
                  <span className="font-semibold">Q{idx + 1}:</span> {q.question}
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-primary text-base flex items-center gap-1">
                    <span className="text-base font-semibold mr-1">Score:</span>
                    <span className="text-2xl leading-none">{q.score}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
