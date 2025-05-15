import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

export default function Analytics() {
  const [selectedType, setSelectedType] = useState('TECHNICAL');
  const [interviews, setInterviews] = useState([]);
  const [allInterviews, setAllInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [currentScores, setCurrentScores] = useState({});

  useEffect(() => {
    fetchAllInterviews();
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [selectedType]);

  const fetchAllInterviews = async () => {
    try {
      const response = await axios.post('/api/report', {});
      setAllInterviews(response.data.interviews || []);
    } catch (error) {
      console.error('Error fetching all interviews:', error);
    }
  };

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/report', {
        interviewType: selectedType
      });
      const allInterviews = response.data.interviews || [];
      setInterviews(allInterviews);
      // Get last 5 interviews (or all if less than 5)
      const recent = allInterviews.slice(0, 5);
      setRecentInterviews(recent);
      // Get the latest interview
      if (recent.length > 0) {
        calculateCurrentScores(recent[0]);
      } else {
        setCurrentScores({});
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentScores = (currentInterview) => {
    if (!currentInterview) {
      setCurrentScores({});
      return;
    }

    if (selectedType === 'TECHNICAL') {
      setCurrentScores({
        'Technical Knowledge': `${currentInterview.score?.finalEvaluation?.technicalKnowledge || 0}/40`,
        'Problem Solving': `${currentInterview.score?.finalEvaluation?.problemSolvingSkills || 0}/30`,
        'Communication': `${currentInterview.score?.finalEvaluation?.communicationSkills || 0}/30`,
        'Overall Score': `${currentInterview.score?.finalEvaluation?.overallScore || 0}/100`
      });
    } else if (selectedType === 'HR') {
      setCurrentScores({
        'Communication': `${currentInterview.score?.finalEvaluation?.communicationSkills || 0}/40`,
        'Personality Fit': `${currentInterview.score?.finalEvaluation?.personalityFit || 0}/30`,
        'Relevance': `${currentInterview.score?.finalEvaluation?.relevance || 0}/30`,
        'Overall Score': `${currentInterview.score?.finalEvaluation?.overallScore || 0}/100`
      });
    } else {
      setCurrentScores({
        'Relevance': `${parseInt(currentInterview.score?.Relevance) || 0}/10`,
        'Clarity': `${parseInt(currentInterview.score?.Clarity) || 0}/10`,
        'Depth': `${parseInt(currentInterview.score?.Depth) || 0}/10`,
        'Confidence': `${parseInt(currentInterview.score?.Confidence) || 0}/10`,
        'Grammar': `${parseInt(currentInterview.score?.Grammar) || 0}/10`,
        'Overall Score': `${parseInt(currentInterview.score?.OverallScore) || 0}/50`
      });
    }
  };

  // Calculate scores for the chart
  const chartScores = recentInterviews.map(interview => 
    selectedType === 'GD' 
      ? parseInt(interview.score?.OverallScore) || 0
      : interview.score?.finalEvaluation?.overallScore || 0
  );

  // Get skill data for charts
  const getSkillData = (interview) => {
    if (!interview) return { labels: [], data: [] };
    if (selectedType === 'TECHNICAL') {
      return {
        labels: ['Technical Knowledge', 'Problem Solving', 'Communication'],
        data: [
          interview.score?.finalEvaluation?.technicalKnowledge || 0,
          interview.score?.finalEvaluation?.problemSolvingSkills || 0,
          interview.score?.finalEvaluation?.communicationSkills || 0
        ]
      };
    } else if (selectedType === 'HR') {
      return {
        labels: ['Communication', 'Personality Fit', 'Relevance'],
        data: [
          interview.score?.finalEvaluation?.communicationSkills || 0,
          interview.score?.finalEvaluation?.personalityFit || 0,
          interview.score?.finalEvaluation?.relevance || 0
        ]
      };
    } else {
      return {
        labels: ['Relevance', 'Clarity', 'Depth', 'Confidence', 'Grammar'],
        data: [
          parseInt(interview.score?.Relevance) || 0,
          parseInt(interview.score?.Clarity) || 0,
          parseInt(interview.score?.Depth) || 0,
          parseInt(interview.score?.Confidence) || 0,
          parseInt(interview.score?.Grammar) || 0
        ]
      };
    }
  };

  // Prepare radar chart data
  const latestIdx = recentInterviews.length > 0 ? 0 : -1;
  const prevIdx = recentInterviews.length > 1 ? 1 : -1;
  const latestSkill = latestIdx >= 0 ? getSkillData(recentInterviews[latestIdx]) : { labels: [], data: [] };
  const prevSkill = prevIdx >= 0 ? getSkillData(recentInterviews[prevIdx]) : null;

  // Prepare grouped bar chart data for skills
  const skillLabels = latestSkill.labels;
  const latestSkillData = latestSkill.data;
  const prevSkillData = prevSkill && prevSkill.data.length === latestSkillData.length ? prevSkill.data : null;

  const barData = {
    labels: skillLabels,
    datasets: [
      prevSkillData && {
        label: 'Previous Interview',
        data: prevSkillData,
        backgroundColor: 'rgba(156, 163, 175, 0.7)',
        borderRadius: 8,
        barPercentage: 0.5,
        categoryPercentage: 0.5
      },
      {
        label: 'Latest Interview',
        data: latestSkillData,
        backgroundColor: 'rgba(59, 130, 246, 0.85)',
        borderRadius: 8,
        barPercentage: 0.5,
        categoryPercentage: 0.5
      }
    ].filter(Boolean)
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'center',
        labels: {
          color: '#fff',
          font: { size: 16, weight: 'bold' },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      },
      datalabels: {
        display: false
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#fff', font: { size: 15, weight: 'bold' }, display: true }
      },
      y: {
        beginAtZero: true,
        max: selectedType === 'GD' ? 10 : 100,
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#fff', display: true }
      }
    }
  };

  // Calculate dynamic chart size
  const skillCount = latestSkill.labels.length;
  const minSize = 320;
  const maxSize = 520;
  const baseSize = 120 * skillCount;
  const chartSize = Math.max(minSize, Math.min(baseSize, maxSize));

  // Calculate average skill scores for all interviews of selected type
  const getAverageSkillScores = () => {
    if (interviews.length === 0) return { labels: [], data: [] };
    let skillKeys = [];
    let skillSums = {};
    let skillCounts = {};
    interviews.forEach(interview => {
      let skills = {};
      if (selectedType === 'TECHNICAL') {
        skills = {
          'Technical Knowledge': interview.score?.finalEvaluation?.technicalKnowledge || 0,
          'Problem Solving': interview.score?.finalEvaluation?.problemSolvingSkills || 0,
          'Communication': interview.score?.finalEvaluation?.communicationSkills || 0
        };
      } else if (selectedType === 'HR') {
        skills = {
          'Communication': interview.score?.finalEvaluation?.communicationSkills || 0,
          'Personality Fit': interview.score?.finalEvaluation?.personalityFit || 0,
          'Relevance': interview.score?.finalEvaluation?.relevance || 0
        };
      } else {
        skills = {
          'Relevance': parseInt(interview.score?.Relevance) || 0,
          'Clarity': parseInt(interview.score?.Clarity) || 0,
          'Depth': parseInt(interview.score?.Depth) || 0,
          'Confidence': parseInt(interview.score?.Confidence) || 0,
          'Grammar': parseInt(interview.score?.Grammar) || 0
        };
      }
      Object.entries(skills).forEach(([key, value]) => {
        if (!skillSums[key]) {
          skillSums[key] = 0;
          skillCounts[key] = 0;
        }
        skillSums[key] += value;
        skillCounts[key] += 1;
      });
      skillKeys = Object.keys(skills);
    });
    const labels = skillKeys;
    const data = labels.map(key => skillCounts[key] ? (skillSums[key] / skillCounts[key]) : 0);
    return { labels, data };
  };

  const avgSkill = getAverageSkillScores();
  const avgSkillBarData = {
    labels: avgSkill.labels,
    datasets: [
      {
        label: 'Average Score',
        data: avgSkill.data.map(v => Number(v.toFixed(2))),
        backgroundColor: 'rgba(59, 130, 246, 0.85)',
        borderRadius: 8,
        barPercentage: 0.6,
        categoryPercentage: 0.6
      }
    ]
  };
  const avgSkillBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            return `Average: ${Number(context.raw).toFixed(2)}`;
          }
        }
      },
      datalabels: {
        display: false
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#fff', font: { size: 15, weight: 'bold' }, display: true }
      },
      y: {
        beginAtZero: true,
        max: selectedType === 'GD' ? 10 : 100,
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#fff', display: true }
      }
    }
  };

  // Calculate interview type ratios for donut chart
  const getInterviewTypeRatios = () => {
    const typeCounts = { TECHNICAL: 0, HR: 0, GD: 0 };
    allInterviews.forEach(interview => {
      const type = (interview.interview_type || '').toUpperCase();
      if (typeCounts[type] !== undefined) {
        typeCounts[type] += 1;
      }
    });
    return typeCounts;
  };
  const typeRatios = getInterviewTypeRatios();
  const totalTypes = typeRatios.TECHNICAL + typeRatios.HR + typeRatios.GD;
  const donutData = {
    labels: ['Technical', 'HR', 'GD'],
    datasets: [
      {
        data: [typeRatios.TECHNICAL, typeRatios.HR, typeRatios.GD],
        backgroundColor: [
          '#60a5fa', // Technical - soft blue
          '#fbbf24', // HR - soft gold/yellow
          '#f87171'  // GD - soft coral/red
        ],
        borderColor: [
          '#60a5fa',
          '#fbbf24',
          '#f87171'
        ],
        borderWidth: 2
      }
    ]
  };
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#fff',
          font: { size: 15, weight: 'bold' },
          usePointStyle: true
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}`;
          }
        }
      },
      datalabels: {
        display: false
      }
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-primary">Interview Analysis</h1>
        
        {/* Interview Type Buttons */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          {['TECHNICAL', 'HR', 'GD'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`btn btn-sm rounded-full ${
                selectedType === type ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-lg">Loading...</div>
        ) : interviews.length === 0 ? (
          <div className="text-center text-lg text-base-content/70">
            No interviews available
          </div>
        ) : (
          <>
            {/* Current Interview Scores */}
            <div className="bg-base-100 p-6 rounded-xl shadow-lg mb-8">
              <h3 className="text-lg font-semibold mb-4">Current Interview Scores</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(currentScores).map(([skill, score]) => (
                  <div key={skill} className="bg-base-200 p-4 rounded-lg">
                    <div className="text-sm text-base-content/70">{skill}</div>
                    <div className="text-xl font-bold text-primary">
                      {score}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Progress Chart */}
              <div className="bg-chart-bg rounded-2xl shadow-2xl p-8 my-8 flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-4 text-base-content">Interview Progression (Last 5 Interviews)</h3>
                <div className="h-[420px] w-full max-w-xl flex items-center justify-center">
                  <Line
                    data={{
                      labels: recentInterviews.map((_, index) => `Interview ${index + 1}`),
                      datasets: [{
                        label: 'Overall Score',
                        data: chartScores,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          grid: { color: 'rgba(255,255,255,0.1)' },
                          ticks: { color: '#fff', display: true }
                        },
                        x: {
                          grid: { color: 'rgba(255,255,255,0.1)' },
                          ticks: { color: '#fff', display: true }
                        }
                      },
                      plugins: {
                        legend: {
                          labels: { color: '#fff' }
                        },
                        tooltip: {
                          enabled: true,
                          callbacks: {
                            label: function(context) {
                              return `Score: ${context.raw}/100`;
                            }
                          }
                        },
                        datalabels: {
                          display: false
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Skill Distribution Chart (Bar) */}
              <div className="bg-chart-bg rounded-2xl shadow-2xl p-8 my-8 flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-4 text-base-content">Skill Comparison (Latest vs Previous Interview)</h3>
                <div className="h-[420px] w-full max-w-xl flex items-center justify-center">
                  <Bar
                    data={barData}
                    options={{
                      ...barOptions,
                      plugins: {
                        ...barOptions.plugins,
                        legend: {
                          ...barOptions.plugins.legend,
                          labels: {
                            ...barOptions.plugins.legend.labels,
                            color: '#fff',
                          }
                        },
                      },
                      scales: {
                        x: {
                          ...barOptions.scales.x,
                          ticks: { ...barOptions.scales.x.ticks, color: '#fff' },
                          grid: { ...barOptions.scales.x.grid, color: 'rgba(255,255,255,0.1)' }
                        },
                        y: {
                          ...barOptions.scales.y,
                          ticks: { ...barOptions.scales.y.ticks, color: '#fff' },
                          grid: { ...barOptions.scales.y.grid, color: 'rgba(255,255,255,0.1)' }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Average Skill Bar Chart & Donut Chart Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Average Skill Bar Chart */}
              <div className="bg-chart-bg rounded-2xl shadow-2xl p-8 my-8 flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-4 text-base-content">Average Skill Scores (All Interviews)</h3>
                <div className="h-[320px] w-full max-w-xl flex items-center justify-center">
                  <Bar
                    data={avgSkillBarData}
                    options={avgSkillBarOptions}
                  />
                </div>
              </div>
              {/* Donut Chart */}
              <div className="bg-chart-bg rounded-2xl shadow-2xl p-8 my-8 flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-4 text-base-content">Interview Type Ratio</h3>
                <div className="h-[320px] w-full max-w-xs flex items-center justify-center">
                  {totalTypes === 0 ? (
                    <div className="text-base-content/70 text-center py-16">No interview data available</div>
                  ) : (
                    <Doughnut data={donutData} options={donutOptions} />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
