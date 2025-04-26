import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Typography, TextField, CircularProgress,
  Paper, Grid, Card, CardContent, Alert, Snackbar, Chip,
  Fade, Zoom, useTheme, alpha
} from '@mui/material';
import axios from 'axios';
import { useAuthContext } from '../../context/AuthContext';
import { styled } from '@mui/material/styles';
import toast from 'react-hot-toast';
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaBrain, 
  FaClock, 
  FaCheckCircle,
  FaRedo,
  FaInfoCircle,
  FaTrophy,
  FaPen,
  FaVolumeUp,
  FaVolumeMute
} from 'react-icons/fa';
import { 
  MdOutlineTimer, 
  MdOutlineFeedback,
  MdOutlineGroup
} from 'react-icons/md';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[6],
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 3),
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const EvaluationCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
}));

// Custom SVG Components
const WaveBackground = () => (
  <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1440 320">
    <path fill="#4F46E5" fillOpacity="0.2" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
  </svg>
);

const DiscussionIcon = () => (
  <svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
    <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="currentColor"/>
    <path d="M12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" fill="currentColor"/>
  </svg>
);

const TimerIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
    <path d="M12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" fill="currentColor"/>
  </svg>
);

const GroupDiscussions = () => {
  const [phase, setPhase] = useState('intro');
  const [topic, setTopic] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [thinkingTimer, setThinkingTimer] = useState(30);
  const [responseTimer, setResponseTimer] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [interviewId, setInterviewId] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const { token } = useAuthContext();
  const theme = useTheme();

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setTranscript(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Speech recognition error. Please try again.');
        setIsRecording(false);
      };
    }
  }, []);

  useEffect(() => {
    let interval;
    if (phase === 'thinking' && thinkingTimer > 0) {
      interval = setInterval(() => {
        setThinkingTimer(prev => prev - 1);
      }, 1000);
    } else if (phase === 'thinking' && thinkingTimer === 0) {
      setPhase('responding');
      setIsTimerRunning(true);
    }
    return () => clearInterval(interval);
  }, [phase, thinkingTimer]);

  useEffect(() => {
    let interval;
    if (phase === 'responding' && responseTimer > 0) {
      interval = setInterval(() => {
        setResponseTimer(prev => prev - 1);
      }, 1000);
    } else if (phase === 'responding' && responseTimer === 0) {
      submitResponse();
    }
    return () => clearInterval(interval);
  }, [phase, responseTimer]);

  const startRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsRecording(true);
      toast.success('Recording started');
    } else {
      toast.error('Speech recognition not supported in your browser');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setResponse(transcript);
      toast.success('Recording stopped');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateTopic = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/interview/gd/topic', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.data?.success || !res.data?.topic || !res.data?.interviewId) {
        throw new Error('Invalid response format');
      }

      setTopic(res.data.topic);
      setInterviewId(res.data.interviewId);
      setResponse('');
      setEvaluation(null);
      setThinkingTimer(30);
      setResponseTimer(60);
      setPhase('thinking');
      setAttempts(prev => prev + 1);
      toast.success('New topic generated! Get ready!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message || 'Something went wrong');
    }
    setIsLoading(false);
  };

  const parseScore = (val) => {
    if (typeof val === 'string') {
      const [score] = val.split('/');
      return parseInt(score, 10);
    }
    return val;
  };

  const submitResponse = async () => {
    if (!response.trim()) {
      toast.error('Please enter your response');
      return;
    }

    if (!interviewId) {
      toast.error('No active session. Please generate a topic.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('/api/interview/gd/evaluate', {
        interviewId,
        topic,
        response
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const rawEval = res.data.evaluation;
      const parsedEval = {
        Relevance: parseScore(rawEval.Relevance),
        Clarity: parseScore(rawEval.Clarity),
        Depth: parseScore(rawEval.Depth),
        Confidence: parseScore(rawEval.Confidence),
        Grammar: parseScore(rawEval.Grammar),
        OverallScore: parseScore(rawEval.OverallScore),
        feedBack: rawEval.feedBack || 'No feedback provided.'
      };

      setEvaluation(parsedEval);
      setPhase('result');
      toast.success('Response evaluated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message || 'Evaluation failed');
    }
    setIsLoading(false);
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="p-8 min-h-screen bg-base-200 relative overflow-hidden">
      <WaveBackground />
      <div className="max-w-6xl mx-auto relative">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <DiscussionIcon />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Group Discussion Practice
            </h1>
          </div>
          <div className="badge badge-primary badge-lg gap-2 glass">
            <FaTrophy className="text-lg" />
            Attempt: {attempts}
          </div>
        </div>

        {phase === 'intro' && (
          <div className="max-w-2xl mx-auto glass rounded-box shadow-lg p-6 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <FaInfoCircle className="text-primary" />
              How It Works
            </h2>
            <div className="space-y-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors">
                  <FaPen className="text-primary text-xl" />
                  <p className="text-base-content/90">Click "Generate Topic" to get a random discussion topic.</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors">
                  <FaBrain className="text-primary text-xl" />
                  <p className="text-base-content/90">You get 30 seconds of thinking time.</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors">
                  <FaClock className="text-primary text-xl" />
                  <p className="text-base-content/90">After that, you have 60 seconds to type or speak your response.</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors">
                  <MdOutlineFeedback className="text-primary text-xl" />
                  <p className="text-base-content/90">Your response will be evaluated and feedback provided.</p>
                </div>
              </div>
              <div className="alert alert-info glass">
                <FaInfoCircle className="text-xl" />
                <span>You can attempt this practice as many times as you want!</span>
              </div>
            </div>
            <button
              className="btn btn-primary w-full gap-2 glass hover:scale-105 transition-transform"
              onClick={generateTopic}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <FaRedo />
                  Generate Topic
                </>
              )}
            </button>
          </div>
        )}

        {phase === 'thinking' && (
          <div className="max-w-2xl mx-auto glass rounded-box shadow-lg p-6 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <FaBrain className="text-primary" />
              Topic:
            </h2>
            <div className="card bg-base-200/50 mb-4 glass">
              <div className="card-body">
                <p className="text-lg font-medium">{topic}</p>
              </div>
            </div>
            <div className="badge badge-info gap-2 mb-4 glass">
              <TimerIcon />
              Thinking Time: {formatTime(thinkingTimer)}
            </div>
            <p className="text-base-content/90 flex items-center gap-2 p-3 rounded-lg bg-base-200/50">
              <FaBrain className="text-primary" />
              Think carefully. Response box will open after thinking time ends.
            </p>
          </div>
        )}

        {phase === 'responding' && (
          <div className="max-w-2xl mx-auto glass rounded-box shadow-lg p-6 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <FaPen className="text-primary" />
              Topic:
            </h2>
            <div className="card bg-base-200/50 mb-4 glass">
              <div className="card-body">
                <p className="text-lg font-medium">{topic}</p>
              </div>
            </div>

            <div className="badge badge-success gap-2 mb-4 glass">
              <TimerIcon />
              Response Time: {formatTime(responseTimer)}
            </div>

            <div className="flex gap-2 mb-4">
              <button
                className={`btn ${isRecording ? 'btn-error' : 'btn-primary'} gap-2 glass hover:scale-105 transition-transform`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <>
                    <FaMicrophoneSlash />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <FaMicrophone />
                    Start Recording
                  </>
                )}
              </button>
              {transcript && (
                <button
                  className="btn btn-ghost gap-2 glass hover:scale-105 transition-transform"
                  onClick={() => setResponse(transcript)}
                >
                  <FaVolumeUp />
                  Use Speech
                </button>
              )}
            </div>

            <textarea
              className="textarea textarea-bordered w-full h-48 mb-4 glass focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Type your response here or use speech-to-text..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
            />

            <button
              className="btn btn-primary w-full gap-2 glass hover:scale-105 transition-transform"
              onClick={submitResponse}
              disabled={isLoading || !response.trim()}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <FaCheckCircle />
                  Submit Response
                </>
              )}
            </button>
          </div>
        )}

        {phase === 'result' && evaluation && (
          <div className="max-w-4xl mx-auto glass rounded-box shadow-lg p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <MdOutlineFeedback className="text-primary" />
                Evaluation Results
              </h2>
              <button
                className="btn btn-primary gap-2 glass hover:scale-105 transition-transform"
                onClick={generateTopic}
              >
                <FaRedo />
                Try Again
              </button>
            </div>

            <div className="card bg-primary/90 text-primary-content mb-6 glass">
              <div className="card-body">
                <h3 className="card-title text-3xl flex items-center gap-2">
                  <FaTrophy />
                  Overall Score: {evaluation.OverallScore}/50
                </h3>
                <p className="text-lg">{evaluation.feedBack}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {['Relevance', 'Clarity', 'Depth', 'Confidence', 'Grammar'].map((key) => (
                <div key={key} className="card bg-base-200/50 glass hover:scale-105 transition-transform">
                  <div className="card-body">
                    <h3 className="card-title text-base-content/90 flex items-center gap-2">
                      <FaCheckCircle className="text-primary" />
                      {key}
                    </h3>
                    <p className="text-2xl font-bold text-primary">{evaluation[key]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDiscussions;
