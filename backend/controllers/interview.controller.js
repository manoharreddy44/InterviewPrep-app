import { openai } from "../openAi/connectToOpenAI.js";
import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";

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
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const topic = response.choices[0]?.message?.content?.trim() || "No topic generated";
    
    // Create a new interview record with just the topic
    
    const interview = new Interview({
      user_id: req.user._id,
      interview_type: "GD",
      topic: topic, // Include the topic field
      response: "" // Initialize response as an empty string
    });

    await interview.save();

    res.status(200).json({
      success: true,
      topic: topic,
      interviewId: interview._id
    });
  } catch (error) {
    console.error("Error generating topic:", error.message || error);
    res.status(500).json({ 
      success: false,
      error: "Failed to generate discussion topic" 
    });
  }
};


export const evaluateResponse = async (req, res) => {
  try {
    const { interviewId, topic, response } = req.body;

    if (!interviewId || !topic || !response) {
      return res.status(400).json({
        success: false,
        error: "Interview ID, topic, and response are required",
      });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        error: "Interview not found",
      });
    }

    const evaluationPrompt = `
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


    const evaluationResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert interviewer evaluating group discussion responses for freshers. Be fair, structured, and give feedback in 2–3 sentences only.",
        },
        {
          role: "user",
          content: evaluationPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const rawText = evaluationResponse.choices[0]?.message?.content || "";

    // Try to extract a valid JSON block from the output
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("No valid JSON found in OpenAI response:", rawText);
      return res.status(500).json({
        success: false,
        error: "Failed to extract evaluation data. Please try again.",
      });
    }

    let evaluation;
    try {
      evaluation = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Error parsing evaluation JSON:", parseError);
      return res.status(500).json({
        success: false,
        error: "Evaluation parsing failed. Please try again.",
      });
    }

    // Save response and evaluation
    interview.response = response;
    interview.topic = topic;
    interview.score = evaluation;
    await interview.save();

    res.status(200).json({
      success: true,
      evaluation: evaluation,
    });
  } catch (error) {
    console.error("Error during evaluation:", error);
    res.status(500).json({
      success: false,
      error: "Something went wrong during evaluation.",
    });
  }
};


export const generateTechnicalQuestion = async (req, res) => {
  const { jobRole, experience, jobDescription, previousQuestionScore, interviewId } = req.body;
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  const resume = user.resume;
  if (!resume) {
    return res.status(400).json({ success: false, error: "Resume not found for the user" });
  }
  
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

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const question = response.choices[0]?.message?.content?.trim() || "No question generated";
    let interview;
    if (interviewId) {
      interview = await Interview.findById(interviewId);
      if (!interview) {
        return res.status(404).json({ success: false, error: "Interview not found" });
      }
      if (!interview.score) interview.score = {};
    } else {
      interview = new Interview({
        user_id: req.user._id,
        interview_type: "TECHNICAL",
        score: {}
      });
    }
    // Find next question key
    const questionKeys = Object.keys(interview.score)
      .filter(k => k.startsWith("question_"))
      .map(k => parseInt(k.split("_")[1], 10))
      .filter(n => !isNaN(n));

    const nextNum = questionKeys.length > 0 ? Math.max(...questionKeys) + 1 : 1;
    const questionKey = `question_${nextNum}`;

    // Prepare the update for the score object
    const scoreUpdate = {
      ...interview.score,
      [questionKey]: {
        question,
        response: "",
        score: 0,
        feedback: ""
      }
    };
    
    // Save the updated interview with the new score object
    interview.score = scoreUpdate;
    await interview.save();

    res.status(200).json({
      success: true,
      question,
      interviewId: interview._id,
      questionKey,
      score: interview.score
    });
  } catch (error) {
    console.error("Error generating technical question:", error.message || error);
    res.status(500).json({ success: false, error: "Failed to generate technical question" });
  }
};

export const submitTechnicalResponse = async (req, res) => {
  const { interviewId, response } = req.body;

  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ success: false, error: "Interview not found" });
    if (!interview.score) interview.score = {};

    // Get the latest question key
    const questionKeys = Object.keys(interview.score)
      .filter(k => k.startsWith("question_"))
      .sort((a, b) => {
        const numA = parseInt(a.split("_")[1]);
        const numB = parseInt(b.split("_")[1]);
        return numB - numA; // Descending
      });

    if (questionKeys.length === 0) {
      return res.status(400).json({ success: false, error: "No questions found" });
    }

    const latestKey = questionKeys[0];
    const currentQuestionObj = interview.score[latestKey];

    // Generate evaluation prompt
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


    const evaluationResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: evaluationPrompt }],
    });

    const rawText = evaluationResponse.choices[0]?.message?.content || "";
    let evaluation;
    try {
      evaluation = JSON.parse(rawText);
    } catch (error) {
      console.error("OpenAI Response (Raw):", rawText);
      return res.status(500).json({ success: false, error: "Failed to parse evaluation" });
    }

    // Extract score (handle "85/100" format)
    const [scoreValue] = String(evaluation.responseScore).split("/");
    const numericScore = parseInt(scoreValue) || 0;

    // Update the question
    interview.score[latestKey].response = response;
    interview.score[latestKey].score = numericScore;
    interview.score[latestKey].feedback = evaluation.feedBack || "No feedback provided";

    // Save interview
    await Interview.findByIdAndUpdate(interview._id, { score: interview.score }, { new: true });
    await interview.save();

    // Optionally, get the previous question/answer object (if it exists)
    let prevQuestionObj = null;
    if (questionKeys.length > 1) {
      const prevKey = questionKeys[1];
      prevQuestionObj = interview.score[prevKey];
    }

    res.status(200).json({
      success: true,
      question: currentQuestionObj.question,
      feedback: evaluation.feedBack,
      currentQuestionScore: numericScore,
      interviewId: interview._id,
      questionKey: latestKey,
      prevQuestionObj // <-- This is the previous question/answer object, or null if not present
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const evaluateTechnicalResponse = async (req, res) => {
  const { interviewId } = req.body;

  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ success: false, error: "Interview not found" });
    if (!interview.score) return res.status(400).json({ success: false, error: "No questions found" });

 
    // Extract all questions
    const questions = Object.keys(interview.score)
      .filter(k => k.startsWith("question_"))
      .map(k => interview.score[k]);

    if (questions.length === 0) {
      return res.status(400).json({ success: false, error: "No questions to evaluate" });
    }

    // Generate evaluation prompt
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

    

    const evaluationResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: evaluationPrompt }],
    });

    const rawText = evaluationResponse.choices[0]?.message?.content || "";
    let evaluation;
    try {
      evaluation = JSON.parse(rawText);
    } catch (error) {
      console.error("OpenAI Response (Raw):", rawText);
      return res.status(500).json({ success: false, error: "Failed to parse evaluation" });
    }

    function extractAndCap(val, max) {
      const n = parseInt(String(val).split('/')[0], 10);
      return Math.min(isNaN(n) ? 0 : n, max);
    }

    // Save final evaluation
    const technicalKnowledge = extractAndCap(evaluation.TechnicalKnowledge, 40);
    const problemSolvingSkills = extractAndCap(evaluation.ProblemSolvingSkills, 30);
    const communicationSkills = extractAndCap(evaluation.CommunicationSkills, 30);
    const overallScore = Math.min(technicalKnowledge + problemSolvingSkills + communicationSkills, 100);
    const feedback = evaluation.feedBack || "No feedback";
    const updatedScore = {
      ...interview.score,
      finalEvaluation: {
        technicalKnowledge,
        problemSolvingSkills,
        communicationSkills,
        overallScore,
        feedback
      }
    };
    await Interview.findByIdAndUpdate(interview._id, { score: updatedScore }, { new: true });
   

    res.status(200).json({
      success: true,
      feedback,
      overallScore,
      interviewId: interview._id,
      finalEvaluation: {
        technicalKnowledge,
        problemSolvingSkills,
        communicationSkills,
        overallScore,
        feedback
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};


export const generateHrQuestion = async (req, res) => {
  const { jobRole, experience, interviewId, previousQuestionScore } = req.body;
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }
  const resume = user.resume;
  if (!resume) {
    return res.status(400).json({ success: false, error: "Resume not found for the user" });
  }
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
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    const question = response.choices[0]?.message?.content?.trim() || "No question generated";
    let interview;
    if (interviewId) {
      interview = await Interview.findById(interviewId);
      if (!interview) {
        return res.status(404).json({ success: false, error: "Interview not found" });
      }
      if (!interview.score) interview.score = {};
    } else {
      interview = new Interview({
        user_id: req.user._id,
        interview_type: "HR",
        score: {}
      });
    }
    // Find next question key
    const questionKeys = Object.keys(interview.score)
      .filter(k => k.startsWith("question_"))
      .map(k => parseInt(k.split("_")[1], 10))
      .filter(n => !isNaN(n));
    const nextNum = questionKeys.length > 0 ? Math.max(...questionKeys) + 1 : 1;
    const questionKey = `question_${nextNum}`;
    // Prepare the update for the score object
    const scoreUpdate = {
      ...interview.score,
      [questionKey]: {
        question,
        response: "",
        score: 0,
        feedback: ""
      }
    };
    interview.score = scoreUpdate;
    await interview.save();
    res.status(200).json({
      success: true,
      question,
      interviewId: interview._id,
      questionKey,
      score: interview.score
    });
  } catch (error) {
    console.error("Error generating HR question:", error.message || error);
    res.status(500).json({ success: false, error: "Failed to generate HR question" });
  }
};

export const submitHrResponse = async (req, res) => {
  const { interviewId, response } = req.body;
  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ success: false, error: "Interview not found" });
    if (!interview.score) interview.score = {};
    // Get the latest question key
    const questionKeys = Object.keys(interview.score)
      .filter(k => k.startsWith("question_"))
      .sort((a, b) => {
        const numA = parseInt(a.split("_")[1]);
        const numB = parseInt(b.split("_")[1]);
        return numB - numA; // Descending
      });
    if (questionKeys.length === 0) {
      return res.status(400).json({ success: false, error: "No questions found" });
    }
    const latestKey = questionKeys[0];
    const currentQuestionObj = interview.score[latestKey];
    // Generate evaluation prompt
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
    const evaluationResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: evaluationPrompt }],
    });
    const rawText = evaluationResponse.choices[0]?.message?.content || "";
    let evaluation;
    try {
      evaluation = JSON.parse(rawText);
    } catch (error) {
      console.error("OpenAI Response (Raw):", rawText);
      return res.status(500).json({ success: false, error: "Failed to parse evaluation" });
    }
    function extractAndCap(val, max) {
      const n = parseInt(String(val).split('/')[0], 10);
      return Math.min(isNaN(n) ? 0 : n, max);
    }
    const communicationSkills = extractAndCap(evaluation.CommunicationSkills, 40);
    const personalityFit = extractAndCap(evaluation.PersonalityFit, 30);
    const relevance = extractAndCap(evaluation.Relevance, 30);
    const overallScore = Math.min(communicationSkills + personalityFit + relevance, 100);
    const feedback = evaluation.feedBack || "No feedback provided";
    // Update the question
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
      relevance
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const evaluateHrResponse = async (req, res) => {
  const { interviewId } = req.body;
  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ success: false, error: "Interview not found" });
    if (!interview.score) return res.status(400).json({ success: false, error: "No questions found" });
    // Extract all questions
    const questions = Object.keys(interview.score)
      .filter(k => k.startsWith("question_"))
      .map(k => interview.score[k]);
    if (questions.length === 0) {
      return res.status(400).json({ success: false, error: "No questions to evaluate" });
    }
    // Generate evaluation prompt
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
    const evaluationResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: evaluationPrompt }],
    });
    const rawText = evaluationResponse.choices[0]?.message?.content || "";
    let evaluation;
    try {
      evaluation = JSON.parse(rawText);
    } catch (error) {
      console.error("OpenAI Response (Raw):", rawText);
      return res.status(500).json({ success: false, error: "Failed to parse evaluation" });
    }
    function extractAndCap(val, max) {
      const n = parseInt(String(val).split('/')[0], 10);
      return Math.min(isNaN(n) ? 0 : n, max);
    }
    const communicationSkills = extractAndCap(evaluation.CommunicationSkills, 40);
    const personalityFit = extractAndCap(evaluation.PersonalityFit, 30);
    const relevance = extractAndCap(evaluation.Relevance, 30);
    const overallScore = Math.min(communicationSkills + personalityFit + relevance, 100);
    const feedback = evaluation.feedBack || "No feedback";
    const updatedScore = {
      ...interview.score,
      finalEvaluation: {
        communicationSkills,
        personalityFit,
        relevance,
        overallScore,
        feedback
      }
    };
    await Interview.findByIdAndUpdate(interview._id, { score: updatedScore }, { new: true });
    res.status(200).json({
      success: true,
      feedback,
      overallScore,
      interviewId: interview._id,
      finalEvaluation: {
        communicationSkills,
        personalityFit,
        relevance,
        overallScore,
        feedback
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Delete an interview by ID
export const deleteInterview = async (req, res) => {
  try {
    const interviewId = req.params.id;
    const userId = req.user._id;
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, error: "Interview not found" });
    }
    // Only allow the owner to delete their interview
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

