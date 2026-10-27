import { Request, Response } from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/dbStore.ts';

export async function getNotifications(req: Request, res: Response) {
  try {
    const user = req.user!;
    const { notifications, unreadCount } = await getUserNotifications(user._id);

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err: any) {
    console.error('Get notifications error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error fetching notifications.' });
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const user = req.user!;
    const { id } = req.params;

    const notification = await markNotificationAsRead(id, user._id);
    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Notification marked as read.',
      notification,
    });
  } catch (err: any) {
    console.error('Mark read error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error updating notification.' });
  }
}

export async function markAllRead(req: Request, res: Response) {
  try {
    const user = req.user!;
    await markAllNotificationsAsRead(user._id);

    res.json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (err: any) {
    console.error('Mark all read error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error updating notifications.' });
  }
}
