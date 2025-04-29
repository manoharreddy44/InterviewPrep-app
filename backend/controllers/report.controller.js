import Interview from '../models/interview.model.js'; // Adjust the path as needed

export const getInterviewByType = async (req, res) => {
  try {
    const userId = req.user._id;
    const { interviewType } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }

    // If interviewType is provided, filter; else return all
    const query = { user_id: userId };
    if (interviewType) {
      query.interview_type = interviewType;
    }

    const interviews = await Interview.find(query);
    res.status(200).json({ interviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
