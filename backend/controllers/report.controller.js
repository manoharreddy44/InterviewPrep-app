import Interview from '../models/interview.model.js'; // Adjust the path as needed

export const getInterviewByType = async (req, res) => {
  try {
    const userId = req.user._id; // Extract userId and interviewType from query params
    const { interviewType } = req.body;
    if (!userId || !interviewType) {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }

    // Fetch interviews from the Interview model
    const interviews = await Interview.find({
      user_id: userId,
      interview_type: interviewType, // Match the interview type
    });

    res.status(200).json({ interviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
