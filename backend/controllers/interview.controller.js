import { generateContent } from "../openAi/connectToOpenAI.js";
import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";

// ─── Helper: extract a clean JSON object from the model output ────────────────
function extractJSON(rawText) {
  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

// ─── Helper: parse "score/max" or plain number and cap at max ─────────────────
function extractAndCap(val, max) {
  const n = parseInt(String(val).split("/")[0], 10);
  return Math.min(isNaN(n) ? 0 : n, max);
}

// ─── Helper: detect Gemini quota exceeded errors ──────────────────────────────
function isQuotaError(err) {
  const msg = err?.message || "";
  return msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("too many requests");
}

function quotaResponse(res) {
  return res.status(429).json({
    success: false,
    quotaExceeded: true,
    error: "Today's AI quota has been exhausted. The service resets every 24 hours — please try again tomorrow.",
  });
}

// ────────────────────────────────────────────────────────────────────────────
// GROUP DISCUSSION
// ────────────────────────────────────────────────────────────────────────────

export const groupDiscussion = async (req, res) => {
  const prompt = `
    Generate a trending group discussion topic for IT freshers focusing on current industry challenges.
    Requirements:
    1. Topic must be debatable with multiple perspectives
    2. Should relate to emerging technologies (AI, Cybersecurity, Cloud Computing, etc.)
    3. Must require critical thinking rather than factual knowledge
    4. Phrase as a direct question (e.g., "Should...?", "How might...?")
    5. Exclude common/pop culture topics
    Format: Strictly one line, no quotes or numbering
  `;

  try {
    const topic = (await generateContent(prompt)).trim() || "No topic generated";

    const interview = new Interview({
      user_id: req.user._id,
      interview_type: "GD",
      topic,
      response: "",
    });
    await interview.save();

    res.status(200).json({ success: true, topic, interviewId: interview._id });
  } catch (error) {
    console.error("Error generating topic:", error.message || error);
    if (isQuotaError(error)) return quotaResponse(res);
    res.status(500).json({ success: false, error: "Failed to generate discussion topic" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// EVALUATE GD RESPONSE
// ────────────────────────────────────────────────────────────────────────────

export const evaluateResponse = async (req, res) => {
  try {
    const { interviewId, topic, response } = req.body;

    if (!interviewId || !topic || !response) {
      return res.status(400).json({ success: false, error: "Interview ID, topic, and response are required" });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ success: false, error: "Interview not found" });

    const evaluationPrompt = `
You are an expert interviewer evaluating group discussion responses for freshers. Be fair, structured, and give feedback in 2–3 sentences only.

Strict Group Discussion Evaluation Rubric:

Topic: "${topic}"
Response: "${response}"

Scoring (0-10 per category):
1. Relevance: Direct connection to topic keywords and context
2. Depth: Demonstration of layered thinking (cost-benefit, ethics, future implications)
3. Structure: Clear logic flow (thesis-support-conclusion)
4. Engagement: Ability to invite discussion (questions raised, counter-arguments addressed)
5. Language: Professional vocabulary without jargon

Deductions:
- -3 for generic statements ("Technology is important")
- -5 for factual errors
- -2 per instance of off-topic content

Final Requirements:
- Total score out of 50
- 3-part feedback: Strength, Weakness, Improvement
- Specific examples from response
- No generic advice

Return ONLY valid JSON in this exact format:
{
  "Relevance": "score/10",
  "Clarity": "score/10",
  "Depth": "score/10",
  "Confidence": "score/10",
  "Grammar": "score/10",
  "OverallScore": "score/50",
  "feedBack": "your feedback here"
}`;

    const rawText = await generateContent(evaluationPrompt);
    const evaluation = extractJSON(rawText);

    if (!evaluation) {
      console.error("No valid JSON found in Gemini response:", rawText);
      return res.status(500).json({ success: false, error: "Failed to extract evaluation data. Please try again." });
    }

    interview.response = response;
    interview.topic = topic;
    interview.score = evaluation;
    await interview.save();

    res.status(200).json({ success: true, evaluation });
  } catch (error) {
    console.error("Error during evaluation:", error);
    if (isQuotaError(error)) return quotaResponse(res);
    res.status(500).json({ success: false, error: "Something went wrong during evaluation." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// TECHNICAL — GENERATE QUESTION
// ────────────────────────────────────────────────────────────────────────────

export const generateTechnicalQuestion = async (req, res) => {
  const { jobRole, experience, jobDescription, previousQuestionScore, interviewId } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, error: "User not found" });

  const resume = user.resume;
  if (!resume) return res.status(400).json({ success: false, error: "Resume not found for the user" });

  try {
    const prompt = `
      Generate a technical interview question based on the following details:
      - Job Role: ${jobRole}
      - Experience Level: ${experience}
      - Job Description: ${jobDescription}
      - Previous Question Score: ${previousQuestionScore || "N/A"}
      - Candidate Resume: ${resume}

      Rules:
      1. If the previous score is above 70, slightly increase the difficulty by asking a deeper, real-world scenario-based, or multi-step problem question.
      2. If the previous score is below 40, slightly reduce the difficulty by asking a simpler, fundamental-level technical question to rebuild the candidate's confidence.
      3. If the previous score is between 40 and 70 (inclusive), maintain the current difficulty level with a balanced technical question.
      4. The question must be strictly relevant to the job role, experience level, and skills mentioned in the resume.
      5. The question should test practical knowledge, problem-solving ability, and real-world application.
      6. Return ONLY the question in a **single line** without any explanation or additional text.
    `;

    const question = (await generateContent(prompt)).trim() || "No question generated";

    let interview;
    if (interviewId) {
      interview = await Interview.findById(interviewId);
      if (!interview) return res.status(404).json({ success: false, error: "Interview not found" });
      if (!interview.score) interview.score = {};
    } else {
      interview = new Interview({ user_id: req.user._id, interview_type: "TECHNICAL", score: {} });
    }

    const questionKeys = Object.keys(interview.score)
      .filter((k) => k.startsWith("question_"))
      .map((k) => parseInt(k.split("_")[1], 10))
      .filter((n) => !isNaN(n));

    const nextNum = questionKeys.length > 0 ? Math.max(...questionKeys) + 1 : 1;
    const questionKey = `question_${nextNum}`;

    interview.score = { ...interview.score, [questionKey]: { question, response: "", score: 0, feedback: "" } };
    await interview.save();

    res.status(200).json({ success: true, question, interviewId: interview._id, questionKey, score: interview.score });
  } catch (error) {
    console.error("Error generating technical question:", error.message || error);
    if (isQuotaError(error)) return quotaResponse(res);
    res.status(500).json({ success: false, error: "Failed to generate technical question" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// TECHNICAL — SUBMIT RESPONSE (per-question evaluation)
// ────────────────────────────────────────────────────────────────────────────

export const submitTechnicalResponse = async (req, res) => {
  const { interviewId, response } = req.body;

  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ success: false, error: "Interview not found" });
    if (!interview.score) interview.score = {};

    const questionKeys = Object.keys(interview.score)
      .filter((k) => k.startsWith("question_"))
      .sort((a, b) => parseInt(b.split("_")[1]) - parseInt(a.split("_")[1]));

    if (questionKeys.length === 0) return res.status(400).json({ success: false, error: "No questions found" });

    const latestKey = questionKeys[0];
    const currentQuestionObj = interview.score[latestKey];

    const evaluationPrompt = `
      Strictly evaluate the following technical interview response:
      - Question: "${currentQuestionObj.question}"
      - Response: "${response}"

      Evaluation Criteria:
      1. If the response is irrelevant or partially correct, give a low score (below 50).
      2. Evaluate on the following:
        - Accuracy of Answer
        - Practical Understanding
        - Completeness and Relevance
      3. Be strict about incorrect or vague responses.

      Return ONLY valid JSON in this exact format:
      {
        "responseScore": "score/100",
        "feedBack": "Give 2 to 3 clear sentences mentioning specific strengths and weaknesses."
      }
      `;

    const rawText = await generateContent(evaluationPrompt);
    const evaluation = extractJSON(rawText);

    if (!evaluation) {
      console.error("Gemini Response (Raw):", rawText);
      return res.status(500).json({ success: false, error: "Failed to parse evaluation" });
    }

    const [scoreValue] = String(evaluation.responseScore).split("/");
    const numericScore = parseInt(scoreValue) || 0;

    interview.score[latestKey].response = response;
    interview.score[latestKey].score = numericScore;
    interview.score[latestKey].feedback = evaluation.feedBack || "No feedback provided";

    await Interview.findByIdAndUpdate(interview._id, { score: interview.score }, { new: true });
    await interview.save();

    let prevQuestionObj = null;
    if (questionKeys.length > 1) prevQuestionObj = interview.score[questionKeys[1]];

    res.status(200).json({
      success: true,
      question: currentQuestionObj.question,
      feedback: evaluation.feedBack,
      currentQuestionScore: numericScore,
      interviewId: interview._id,
      questionKey: latestKey,
      prevQuestionObj,
    });
  } catch (error) {
    console.error("Error:", error);
    if (isQuotaError(error)) return quotaResponse(res);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// TECHNICAL — FINAL EVALUATION
// ────────────────────────────────────────────────────────────────────────────

export const evaluateTechnicalResponse = async (req, res) => {
  const { interviewId } = req.body;

  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ success: false, error: "Interview not found" });
    if (!interview.score) return res.status(400).json({ success: false, error: "No questions found" });

    const questions = Object.keys(interview.score)
      .filter((k) => k.startsWith("question_"))
      .map((k) => interview.score[k]);

    if (questions.length === 0) return res.status(400).json({ success: false, error: "No questions to evaluate" });

    const evaluationPrompt = `
      Strictly evaluate the following face-to-face technical interview responses:
      - Questions and Responses: ${JSON.stringify(questions)}

      Evaluation Criteria:
      1. If the responses are irrelevant, incomplete, or not aligned to the questions, assign low domain scores.
      2. Score breakdown:
        - Technical Knowledge (out of 40)
        - Problem-Solving Skills (out of 30)
        - Communication Skills (out of 30): Evaluate grammar, clarity, and use of relevant technical keywords in the answers.
      3. The OverallScore is the sum of all domain scores (out of 100).
      4. Be strict with poor or vague technical answers.

      Return ONLY valid JSON exactly like this:
      {
        "TechnicalKnowledge": "score/40",
        "ProblemSolvingSkills": "score/30",
        "CommunicationSkills": "score/30",
        "OverallScore": "score/100",
        "feedBack": "Give 2 to 3 clear sentences mentioning key strengths and weaknesses across the responses."
      }
      `;

    const rawText = await generateContent(evaluationPrompt);
    const evaluation = extractJSON(rawText);

    if (!evaluation) {
      console.error("Gemini Response (Raw):", rawText);
      return res.status(500).json({ success: false, error: "Failed to parse evaluation" });
    }

    const technicalKnowledge = extractAndCap(evaluation.TechnicalKnowledge, 40);
    const problemSolvingSkills = extractAndCap(evaluation.ProblemSolvingSkills, 30);
    const communicationSkills = extractAndCap(evaluation.CommunicationSkills, 30);
    const overallScore = Math.min(technicalKnowledge + problemSolvingSkills + communicationSkills, 100);
    const feedback = evaluation.feedBack || "No feedback";

    const updatedScore = {
      ...interview.score,
      finalEvaluation: { technicalKnowledge, problemSolvingSkills, communicationSkills, overallScore, feedback },
    };
    await Interview.findByIdAndUpdate(interview._id, { score: updatedScore }, { new: true });

    res.status(200).json({
      success: true,
      feedback,
      overallScore,
      interviewId: interview._id,
      finalEvaluation: { technicalKnowledge, problemSolvingSkills, communicationSkills, overallScore, feedback },
    });
  } catch (error) {
    console.error("Error:", error);
    if (isQuotaError(error)) return quotaResponse(res);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// HR — GENERATE QUESTION
// ────────────────────────────────────────────────────────────────────────────

export const generateHrQuestion = async (req, res) => {
  const { jobRole, experience, interviewId, previousQuestionScore } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, error: "User not found" });

  const resume = user.resume;
  if (!resume) return res.status(400).json({ success: false, error: "Resume not found for the user" });

  try {
    const prompt = `Generate an HR interview question based on the following details:
    - Job Role: ${jobRole}
    - Experience Level: ${experience}
    - Candidate Resume: ${resume}
    - Previous Question Score: ${previousQuestionScore || "N/A"}
    
    Rules:
    1. If the previous score is above 70, slightly increase the complexity of the question to assess deeper personality traits or cultural fit.
    2. If the previous score is below 40, simplify the question slightly to rebuild the candidate's confidence while still assessing personality, communication skills, and cultural fit.
    3. If the previous score is between 40 and 70 (inclusive), keep the difficulty level similar to maintain steady progress.
    4. The question should always be relevant to the job role, experience level, and skills mentioned in the resume.
    5. Return ONLY the question in a **single line** without any explanation or additional text.
  `;

    const question = (await generateContent(prompt)).trim() || "No question generated";

    let interview;
    if (interviewId) {
      interview = await Interview.findById(interviewId);
      if (!interview) return res.status(404).json({ success: false, error: "Interview not found" });
      if (!interview.score) interview.score = {};
    } else {
      interview = new Interview({ user_id: req.user._id, interview_type: "HR", score: {} });
    }

    const questionKeys = Object.keys(interview.score)
      .filter((k) => k.startsWith("question_"))
      .map((k) => parseInt(k.split("_")[1], 10))
      .filter((n) => !isNaN(n));

    const nextNum = questionKeys.length > 0 ? Math.max(...questionKeys) + 1 : 1;
    const questionKey = `question_${nextNum}`;

    interview.score = { ...interview.score, [questionKey]: { question, response: "", score: 0, feedback: "" } };
    await interview.save();

    res.status(200).json({ success: true, question, interviewId: interview._id, questionKey, score: interview.score });
  } catch (error) {
    console.error("Error generating HR question:", error.message || error);
    if (isQuotaError(error)) return quotaResponse(res);
    res.status(500).json({ success: false, error: "Failed to generate HR question" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// HR — SUBMIT RESPONSE (per-question evaluation)
// ────────────────────────────────────────────────────────────────────────────

export const submitHrResponse = async (req, res) => {
  const { interviewId, response } = req.body;

  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ success: false, error: "Interview not found" });
    if (!interview.score) interview.score = {};

    const questionKeys = Object.keys(interview.score)
      .filter((k) => k.startsWith("question_"))
      .sort((a, b) => parseInt(b.split("_")[1]) - parseInt(a.split("_")[1]));

    if (questionKeys.length === 0) return res.status(400).json({ success: false, error: "No questions found" });

    const latestKey = questionKeys[0];
    const currentQuestionObj = interview.score[latestKey];

    const evaluationPrompt = `
      Strictly evaluate the following HR interview response:
      - Question: "${currentQuestionObj.question}"
      - Response: "${response}"
      Evaluation Criteria:
      1. Communication Skills (out of 40)
      2. Personality Fit (out of 30)
      3. Relevance to the Question (out of 30)
      4. The OverallScore is the sum of all domain scores (out of 100).
      5. Be strict with vague or generic responses.
      Return ONLY valid JSON exactly like this:
      {
        "CommunicationSkills": "score/40",
        "PersonalityFit": "score/30",
        "Relevance": "score/30",
        "OverallScore": "score/100",
        "feedBack": "Give 2 to 3 clear sentences mentioning specific strengths and weaknesses."
      }
    `;

    const rawText = await generateContent(evaluationPrompt);
    const evaluation = extractJSON(rawText);

    if (!evaluation) {
      console.error("Gemini Response (Raw):", rawText);
      return res.status(500).json({ success: false, error: "Failed to parse evaluation" });
    }

    const communicationSkills = extractAndCap(evaluation.CommunicationSkills, 40);
    const personalityFit = extractAndCap(evaluation.PersonalityFit, 30);
    const relevance = extractAndCap(evaluation.Relevance, 30);
    const overallScore = Math.min(communicationSkills + personalityFit + relevance, 100);
    const feedback = evaluation.feedBack || "No feedback provided";

    interview.score[latestKey].response = response;
    interview.score[latestKey].score = overallScore;
    interview.score[latestKey].feedback = feedback;
    interview.score[latestKey].communicationSkills = communicationSkills;
    interview.score[latestKey].personalityFit = personalityFit;
    interview.score[latestKey].relevance = relevance;

    await Interview.findByIdAndUpdate(interview._id, { score: interview.score }, { new: true });
    await interview.save();

    res.status(200).json({
      success: true,
      question: currentQuestionObj.question,
      feedback,
      currentQuestionScore: overallScore,
      interviewId: interview._id,
      questionKey: latestKey,
      communicationSkills,
      personalityFit,
      relevance,
    });
  } catch (error) {
    console.error("Error:", error);
    if (isQuotaError(error)) return quotaResponse(res);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// HR — FINAL EVALUATION
// ────────────────────────────────────────────────────────────────────────────

export const evaluateHrResponse = async (req, res) => {
  const { interviewId } = req.body;

  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ success: false, error: "Interview not found" });
    if (!interview.score) return res.status(400).json({ success: false, error: "No questions found" });

    const questions = Object.keys(interview.score)
      .filter((k) => k.startsWith("question_"))
      .map((k) => interview.score[k]);

    if (questions.length === 0) return res.status(400).json({ success: false, error: "No questions to evaluate" });

    const evaluationPrompt = `
      Strictly evaluate the following HR interview responses:
      - Questions and Responses: ${JSON.stringify(questions)}
      Evaluation Criteria:
      1. Communication Skills (out of 40)
      2. Personality Fit (out of 30)
      3. Relevance to the Question (out of 30)
      4. The OverallScore is the sum of all domain scores (out of 100).
      5. Be strict with vague or generic responses.
      Return ONLY valid JSON exactly like this:
      {
        "CommunicationSkills": "score/40",
        "PersonalityFit": "score/30",
        "Relevance": "score/30",
        "OverallScore": "score/100",
        "feedBack": "Give 2 to 3 clear sentences mentioning key strengths and weaknesses across the responses."
      }
    `;

    const rawText = await generateContent(evaluationPrompt);
    const evaluation = extractJSON(rawText);

    if (!evaluation) {
      console.error("Gemini Response (Raw):", rawText);
      return res.status(500).json({ success: false, error: "Failed to parse evaluation" });
    }

    const communicationSkills = extractAndCap(evaluation.CommunicationSkills, 40);
    const personalityFit = extractAndCap(evaluation.PersonalityFit, 30);
    const relevance = extractAndCap(evaluation.Relevance, 30);
    const overallScore = Math.min(communicationSkills + personalityFit + relevance, 100);
    const feedback = evaluation.feedBack || "No feedback";

    const updatedScore = {
      ...interview.score,
      finalEvaluation: { communicationSkills, personalityFit, relevance, overallScore, feedback },
    };
    await Interview.findByIdAndUpdate(interview._id, { score: updatedScore }, { new: true });

    res.status(200).json({
      success: true,
      feedback,
      overallScore,
      interviewId: interview._id,
      finalEvaluation: { communicationSkills, personalityFit, relevance, overallScore, feedback },
    });
  } catch (error) {
    console.error("Error:", error);
    if (isQuotaError(error)) return quotaResponse(res);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// DELETE INTERVIEW
// ────────────────────────────────────────────────────────────────────────────

export const deleteInterview = async (req, res) => {
  try {
    const interviewId = req.params.id;
    const userId = req.user._id;
    const interview = await Interview.findById(interviewId);

    if (!interview) return res.status(404).json({ success: false, error: "Interview not found" });

    if (String(interview.user_id) !== String(userId)) {
      return res.status(403).json({ success: false, error: "Not authorized to delete this interview" });
    }

    await Interview.findByIdAndDelete(interviewId);
    res.status(200).json({ success: true, message: "Interview deleted successfully" });
  } catch (error) {
    console.error("Error deleting interview:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
