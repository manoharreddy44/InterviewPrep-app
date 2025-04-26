import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, CircularProgress, Paper, Grid, Card, CardContent, Alert, Snackbar } from '@mui/material';
import axios from 'axios';
import { useAuthContext } from '../context/AuthContext';

const GroupDiscussions = () => {
  const [topic, setTopic] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [interviewId, setInterviewId] = useState(null);
  const [phase, setPhase] = useState('waiting'); // 'waiting', 'thinking', 'responding'
  const { authUser } = useAuthContext();
  const token = authUser?.token;

  const THINKING_TIME = 30; // 30 seconds for thinking
  const RESPONSE_TIME = 60; // 60 seconds for responding

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          const newTimer = prevTimer + 1;
          
          // Handle automatic phase transitions
          if (phase === 'thinking' && newTimer >= THINKING_TIME) {
            setPhase('responding');
            setTimer(0);
          } else if (phase === 'responding' && newTimer >= RESPONSE_TIME) {
            setIsTimerRunning(false);
            submitResponse();
          }
          
          return newTimer;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, phase]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateTopic = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/interview/gd/topic', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.data || !response.data.success || !response.data.topic || !response.data.interviewId) {
        throw new Error('Invalid response format from server');
      }
      
      setTopic(response.data.topic);
      setInterviewId(response.data.interviewId);
      setTimer(0);
      setPhase('thinking');
      setIsTimerRunning(true);
      setEvaluation(null);
      setResponse('');
      setSuccess('New topic generated successfully!');
    } catch (error) {
      console.error('Error generating topic:', error);
      if (error.response) {
        setError(error.response.data?.error || 'Failed to generate topic. Please try again.');
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError(error.message || 'An unexpected error occurred.');
      }
    }
    setIsLoading(false);
  };

  const submitResponse = async () => {
    if (!response.trim()) {
      setError('Please enter your response');
      return;
    }

    if (!interviewId) {
      setError('No active interview session. Please generate a topic first.');
      return;
    }

    if (!topic) {
      setError('No topic available. Please generate a topic first.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const responseData = await axios.post(
        '/api/interview/gd/evaluate',
        {
          interviewId,
          topic,
          response,
          duration: timer
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!responseData.data || !responseData.data.success || !responseData.data.evaluation) {
        throw new Error('Invalid response format from server');
      }
      
      setEvaluation(responseData.data.evaluation);
      setSuccess('Response evaluated successfully!');
      setPhase('waiting');
    } catch (error) {
      console.error('Error submitting response:', error);
      if (error.response) {
        setError(error.response.data?.error || 'Failed to evaluate response. Please try again.');
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError(error.message || 'An unexpected error occurred.');
      }
    }
    setIsLoading(false);
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  const getPhaseMessage = () => {
    switch (phase) {
      case 'thinking':
        return `Thinking Time: ${formatTime(THINKING_TIME - timer)}`;
      case 'responding':
        return `Response Time: ${formatTime(RESPONSE_TIME - timer)}`;
      default:
        return 'Waiting for topic...';
    }
  };

  return (
    <Box sx={{ 
      p: 3,
      backgroundColor: 'background.default',
      minHeight: '100vh'
    }}>
      <Typography variant="h4" gutterBottom sx={{ 
        color: 'primary.main',
        fontWeight: 'bold',
        mb: 4
      }}>
        Group Discussion Practice
      </Typography>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            mb: 3,
            backgroundColor: 'background.paper',
            boxShadow: 3
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
              Discussion Topic
            </Typography>
            {topic ? (
              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                {topic}
              </Typography>
            ) : (
              <Button
                variant="contained"
                onClick={generateTopic}
                disabled={isLoading}
                sx={{ mb: 2 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Generate Topic'}
              </Button>
            )}

            <Box sx={{ 
              mb: 2,
              p: 2,
              backgroundColor: phase === 'thinking' ? 'warning.light' : 
                            phase === 'responding' ? 'info.light' : 'grey.100',
              borderRadius: 1
            }}>
              <Typography variant="subtitle1" sx={{ 
                color: phase === 'thinking' ? 'warning.dark' : 
                      phase === 'responding' ? 'info.dark' : 'text.secondary',
                fontWeight: 'bold'
              }}>
                {getPhaseMessage()}
              </Typography>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={6}
              label="Your Response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              disabled={phase !== 'responding'}
              sx={{ mb: 2 }}
              placeholder="Enter your response here..."
            />

            <Button
              variant="contained"
              onClick={submitResponse}
              disabled={!response.trim() || isLoading || phase !== 'responding'}
              sx={{ 
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Submit Response'}
            </Button>
          </Paper>
        </Grid>

        {evaluation && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 3,
              backgroundColor: 'background.paper',
              boxShadow: 3
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
                Evaluation Results
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card sx={{ backgroundColor: 'primary.light' }}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom sx={{ color: 'primary.contrastText' }}>
                        Overall Score: {evaluation.OverallScore}
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'primary.contrastText' }}>
                        {evaluation.feedBack}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>Relevance</Typography>
                      <Typography variant="h4" sx={{ color: 'primary.main' }}>{evaluation.Relevance}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>Clarity</Typography>
                      <Typography variant="h4" sx={{ color: 'primary.main' }}>{evaluation.Clarity}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>Depth</Typography>
                      <Typography variant="h4" sx={{ color: 'primary.main' }}>{evaluation.Depth}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>Confidence</Typography>
                      <Typography variant="h4" sx={{ color: 'primary.main' }}>{evaluation.Confidence}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>Grammar</Typography>
                      <Typography variant="h4" sx={{ color: 'primary.main' }}>{evaluation.Grammar}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default GroupDiscussions; 