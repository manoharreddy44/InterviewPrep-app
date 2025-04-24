import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';

export const updateUser = async (req, res) => {
  try {
    // Check if user exists in request
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if user is updating their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(401).json({ error: 'You can only update your own account!' });
  }

    const updateFields = {};
    
    // Update username if provided
    if (req.body.username) {
      updateFields.username = req.body.username;
    }

    // Update password if provided
    if (req.body.password) {
      updateFields.password = bcryptjs.hashSync(req.body.password, 10);
    }

    // Update resume text if provided
    if (req.body.resume) {
      updateFields.resume = req.body.resume;
    }

    // If no fields to update, return error
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log('Error in updateUser controller:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const deleteUser = async (req, res) => {
  try {
    // Check if user exists in request
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if user is deleting their own account
    if (req.user._id.toString() !== req.params.id) {
      return res.status(401).json({ error: 'You can only delete your own account!' });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.log('Error in deleteUser controller:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};