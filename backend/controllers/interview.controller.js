import { openai } from "../openAi/connectToOpenAI.js";
import Interview from "../models/interview.model.js";

export const groupDiscussion = async (req, res) => {
  const prompt = `
    Generate one trending group discussion topic mostly in the field of Information Technology.
    The topic should be relevant for freshers.
    It should be current, easy to understand, beginner-level job interviews.
    Only return the topic in a single line without numbering or extra description.
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
You are an evaluation AI for group discussion responses.

Evaluate the following based only on the given topic and response:

Topic: "${topic}"

Response: "${response}"

Strictly follow these instructions:

1. Compare if the response meaningfully addresses the topic. If the response simply repeats the topic without adding meaningful content, deduct marks.
2. Evaluate based on:
    - Relevance to the topic (10 marks)
    - Clarity and structure (10 marks)
    - Depth of thought (10 marks)
    - Confidence and tone (10 marks)
    - Grammar and fluency (10 marks)
3. Provide an OverallScore out of 50 (sum of all scores).
4. Feedback must be 2 to 3 clear sentences, mentioning specific areas of strength and weakness.
5. If the response is very poor or just restates the topic, give low scores in Depth and Relevance.

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

