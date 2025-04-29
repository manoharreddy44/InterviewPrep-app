import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

export default function TechnicalRound() {
  const { authUser } = useAuthContext();
  const isDemo = authUser?.username === 'demo';
  
  // Step 1: Collect job details
  const [jobRole, setJobRole] = useState('');
  const [experience, setExperience] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Step 2: Interview state
  const [interviewId, setInterviewId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionKey, setQuestionKey] = useState('');
  const [response, setResponse] = useState('');
  const [questionScore, setQuestionScore] = useState(null);
  const [questionFeedback, setQuestionFeedback] = useState('');
  const [previousQuestionScore, setPreviousQuestionScore] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]); // {question, response, score, feedback}
  const [loading, setLoading] = useState(false);
  const [finalEvaluation, setFinalEvaluation] = useState(null);
  const [step, setStep] = useState('form'); // form, question, feedback, final
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  
  // Refs to maintain state between recognition events
  const finalTextRef = useRef('');
  const interimTextRef = useRef('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Function to speak text using the Web Speech API
  const speakText = (text) => {
    // Check if SpeechSynthesis is supported
    if ('speechSynthesis' in window) {
      // Create a new SpeechSynthesisUtterance instance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set speaking state to true when speech starts
      utterance.onstart = () => setIsSpeaking(true);
      
      // Set speaking state to false when speech ends
      utterance.onend = () => setIsSpeaking(false);
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // Start webcam
  const startCamera = async () => {
    try {
      // Stop any existing stream
      if (streamRef.current) {
        stopCamera();
      }
      
      // Get webcam stream with more permissive constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      // Save stream reference
      streamRef.current = stream;
      
      // Connect stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Make sure video plays when ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.error("Error playing video:", e));
        };
      }
      
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing webcam:", err);
      // Continue with speech recognition even if camera fails
    }
  };
  
  // Stop webcam
  const stopCamera = () => {
    if (streamRef.current) {
      // Stop all tracks in the stream
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      
      // Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setShowCamera(false);
    }
  };
  
  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      
      // Configure recognition
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      // Set up event handlers
      recognition.onstart = () => {
        setIsListening(true);
        
        // Start camera when recognition starts
        startCamera();
        
        // Remember current state when starting
        finalTextRef.current = response;
        interimTextRef.current = '';
      };
      
      recognition.onend = () => {
        setIsListening(false);
        // Stop camera when recognition ends
        stopCamera();
        
        // If recognition ends unexpectedly, restart it if still in listening state
        if (isListening) {
          try {
            setTimeout(() => {
              if (isListening) {
                recognition.start();
              }
            }, 500);
          } catch (e) {
            console.error("Failed to restart recognition", e);
          }
        }
      };
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // If we have final text, add it to our accumulated final text
        if (finalTranscript) {
          finalTextRef.current += finalTranscript;
        }
        
        // Store the current interim text
        interimTextRef.current = interimTranscript;
        
        // Update the response with both final and interim text
        setResponse(finalTextRef.current + interimTextRef.current);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        
        // Only stop listening if it's a fatal error
        if (event.error !== 'no-speech') {
          setIsListening(false);
          // Stop camera on error
          stopCamera();
        }
      };
      
      setRecognitionInstance(recognition);
    }
    
    // Cleanup on unmount
    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
      stopCamera();
    };
  }, []);
  
  // Toggle speech recognition
  const toggleListening = () => {
    if (!recognitionInstance) return;
    
    if (isListening) {
      recognitionInstance.stop();
      
      // Save any remaining interim text as final text
      if (interimTextRef.current) {
        const completeText = finalTextRef.current + interimTextRef.current;
        finalTextRef.current = completeText;
        interimTextRef.current = '';
        setResponse(completeText);
      }
      
      // Stop camera
      stopCamera();
    } else {
      // Start with current text in the input field
      finalTextRef.current = response;
      interimTextRef.current = '';
      
      // Start recognition
      recognitionInstance.start();
      // Camera will be started in the onstart handler
    }
  };
  
  // Speak question when it changes and we're in question step
  useEffect(() => {
    if (currentQuestion && step === 'question') {
      speakText(currentQuestion);
    }
    
    // Cleanup function to stop speech when component unmounts
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestion, step]);
  
  // Initialize video ref and play when component mounts
  useEffect(() => {
    // This will ensure the video element is properly referenced
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.error("Error playing video:", e));
    }
  }, [showCamera]);
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle manual text input changes
  const handleResponseChange = (e) => {
    setResponse(e.target.value);
    if (!isListening) {
      finalTextRef.current = e.target.value;
    }
  };

  // Step 1: Form submit handler
  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/interview/technical/question', {
        jobRole,
        experience,
        jobDescription,
        previousQuestionScore,
      });
      setInterviewId(res.data.interviewId);
      setCurrentQuestion(res.data.question);
      setQuestionKey(res.data.questionKey);
      setResponse('');
      finalTextRef.current = '';
      interimTextRef.current = '';
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
    
    // Stop listening if active
    if (isListening && recognitionInstance) {
      recognitionInstance.stop();
    }
    
    // Make sure we capture any interim text
    const finalResponse = response;
    
    setLoading(true);
    try {
      const res = await axios.post('/api/interview/technical/submit', {
        interviewId,
        response: finalResponse,
      });
      setQuestionScore(res.data.currentQuestionScore);
      setQuestionFeedback(res.data.feedback);
      setAllQuestions(prev => [
        ...prev,
        {
          question: res.data.question,
          response: finalResponse,
          score: res.data.currentQuestionScore,
          feedback: res.data.feedback,
        },
      ]);
      setPreviousQuestionScore(res.data.currentQuestionScore);
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
      const res = await axios.post('/api/interview/technical/question', {
        jobRole,
        experience,
        jobDescription,
        previousQuestionScore,
        interviewId,
      });
      setCurrentQuestion(res.data.question);
      setQuestionKey(res.data.questionKey);
      setResponse('');
      finalTextRef.current = '';
      interimTextRef.current = '';
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
      const res = await axios.post('/api/interview/technical/evaluate', {
        interviewId,
      });
      console.log('Final evaluation API response:', res.data);
      setFinalEvaluation(res.data.finalEvaluation || {
        technicalKnowledge: 0,
        problemSolvingSkills: 0,
        communicationSkills: 0,
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
      <h2 className="text-2xl font-bold mb-4 text-primary">Technical Interview Round</h2>
      
      {/* Resume Requirement Notice - Hidden for demo users and after form step */}
      {!isDemo && step === 'form' && (
        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/20 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-600 mb-1">Resume Required</h3>
              <p className="text-base-content/80">Before starting the technical interview, please ensure you have:</p>
              <ul className="mt-2 space-y-1 text-base-content/70">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Uploaded your latest resume in the Profile section
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified that all information is up to date
                </li>
              </ul>
              <div className="mt-3">
                <Link to="/dashboard/profile" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Go to Profile
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <div>
            <label className="block mb-1 font-medium">Job Description</label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Start Technical Round'}
          </button>
        </form>
      )}
      {step === 'question' && (
        <div>
          <div className="mb-4">
            <div className="text-base font-semibold mb-2 text-base-content/80">Question:</div>
            <div className="bg-base-200 p-3 rounded mb-2">{currentQuestion}</div>
            <div className="flex justify-end">
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={() => speakText(currentQuestion)}
                disabled={isSpeaking}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                {isSpeaking ? 'Speaking...' : 'Listen'}
              </button>
            </div>
          </div>
          
          {/* Webcam display */}
          {showCamera && (
            <div className="mb-4 flex justify-center">
              <div className="relative border-2 border-primary rounded overflow-hidden bg-black" style={{ width: 320, height: 240 }}>
                <video 
                  ref={videoRef} 
                  autoPlay={true}
                  playsInline={true}
                  muted={true}
                  width="320"
                  height="240"
                  style={{width: '100%', height: '100%', objectFit: 'cover'}}
                />
                <div className="absolute top-2 right-2 bg-error text-white px-2 py-1 text-xs rounded-full animate-pulse">
                  ● REC
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-base-content/80">Your Response:</label>
              <button 
                className={`btn btn-sm ${isListening ? 'btn-error' : 'btn-primary'}`}
                onClick={toggleListening}
                disabled={!recognitionInstance}
              >
                {isListening ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    Stop Recording
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    Start Recording
                  </>
                )}
              </button>
            </div>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={4}
              placeholder="Type your response or click 'Start Recording' to speak..."
              value={response}
              onChange={handleResponseChange}
              disabled={loading}
            />
            
            {isListening && (
              <div className="mt-2 text-sm text-primary animate-pulse flex items-center">
                <span className="mr-2">🎤</span> 
                <span>Listening... speak clearly</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button 
              className="btn btn-primary" 
              onClick={submitResponse} 
              disabled={loading || !response.trim()}
            >
              {loading ? 'Submitting...' : 'Submit Response'}
            </button>
          </div>
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
              <div className="text-sm text-base-content/70">Technical Knowledge</div>
              <div className="text-xl font-bold text-primary">{finalEvaluation.technicalKnowledge}</div>
            </div>
            <div>
              <div className="text-sm text-base-content/70">Problem Solving Skills</div>
              <div className="text-xl font-bold text-primary">{finalEvaluation.problemSolvingSkills}</div>
            </div>
            <div>
              <div className="text-sm text-base-content/70">Communication Skills</div>
              <div className="text-xl font-bold text-primary">{finalEvaluation.communicationSkills}</div>
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
              <div key={idx} className="bg-base-200 p-2 rounded flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-base-content/70">Q{idx + 1}: {q.question}</div>
                <div className="text-sm text-base-content/70">Score: <span className="font-bold text-primary">{q.score}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
