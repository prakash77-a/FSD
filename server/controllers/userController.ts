import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { findUserById, findUserByEmail, updateUser } from '../services/dbStore.ts';

export async function getProfile(req: Request, res: Response) {
  try {
    const user = await findUserById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      user: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error fetching profile.' });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Name cannot be empty.' });
      return;
    }

    const updated = await updateUser(req.user!._id, { name: name.trim() });
    if (!updated) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated,
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error updating profile.' });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current password and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ success: false, message: 'New password confirmation does not match.' });
      return;
    }

    const user = await findUserByEmail(req.user!.email, true);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Incorrect current password.' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await updateUser(req.user!._id, { passwordHash: newHash });

    res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err: any) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error updating password.' });
  }
}
