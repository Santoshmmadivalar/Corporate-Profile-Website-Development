import { Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';

export const getNotifications = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.userId;
    const list = await Notification.find({ recipientId: userId }).sort({ createdAt: -1 }).limit(20);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: req.user.userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

// Global Notification Alert Dispatcher Helper
export const sendSystemAlert = async (
  recipientId: string,
  type: 'leave' | 'payroll' | 'invoice' | 'ticket' | 'system',
  title: string,
  message: string
): Promise<void> => {
  try {
    const newAlert = new Notification({
      recipientId,
      type,
      title,
      message,
      read: false
    });
    
    await newAlert.save();
    
    // Mock Transactional SMTP Email Trigger
    console.log(`[SMTP MOCK EMAIL] Dispatching SMTP Mail to user_id: ${recipientId}`);
    console.log(`Subject: ${title}`);
    console.log(`Message: ${message}`);
    console.log(`-----------------------------------------------------`);
  } catch (error: any) {
    console.error('Failed to dispatch system alert:', error.message);
  }
};
