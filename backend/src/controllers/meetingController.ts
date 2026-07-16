import { Request, Response, NextFunction } from 'express';
import { Meeting } from '../models/Meeting';
import { sendEmail } from '../services/emailService';

export const getMeetings = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let meetings;
    if (role === 'admin') {
      // Admin sees all meetings
      meetings = await Meeting.find({}).sort({ date: 1, time: 1 });
    } else {
      // Users see only their own meetings
      meetings = await Meeting.find({ userId }).sort({ date: 1, time: 1 });
    }

    res.status(200).json({
      success: true,
      data: meetings
    });
  } catch (error) {
    next(error);
  }
};

export const bookMeeting = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { userName, userEmail, title, description, date, time } = req.body;

    if (!title || !date || !time) {
      res.status(400).json({ success: false, message: 'Title, date, and time are required' });
      return;
    }

    // Generate mock Google Meet link
    const randomMeetingId = Math.random().toString(36).substring(2, 5) + '-' + 
                            Math.random().toString(36).substring(2, 6) + '-' + 
                            Math.random().toString(36).substring(2, 5);
    const googleMeetLink = `https://meet.google.com/${randomMeetingId}`;

    const newMeeting = new Meeting({
      userId,
      userName,
      userEmail,
      title,
      description,
      date,
      time,
      googleMeetLink,
      status: 'scheduled'
    });

    await newMeeting.save();

    // Send confirmation email
    await sendEmail({
      to: userEmail,
      subject: `Confirmed: ${title} on ${date}`,
      text: `Hello ${userName},\n\nYour meeting has been scheduled.\n\nMeeting details:\nSubject: ${title}\nDate: ${date}\nTime: ${time}\nGoogle Meet Link: ${googleMeetLink}\n\nThank you!`
    });

    res.status(201).json({
      success: true,
      message: 'Meeting scheduled successfully',
      data: newMeeting
    });
  } catch (error) {
    next(error);
  }
};

export const rescheduleMeeting = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
      res.status(400).json({ success: false, message: 'Date and time are required' });
      return;
    }

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      res.status(404).json({ success: false, message: 'Meeting record not found' });
      return;
    }

    meeting.date = date;
    meeting.time = time;
    meeting.status = 'rescheduled';
    await meeting.save();

    // Send rescheduling email confirmation
    await sendEmail({
      to: meeting.userEmail,
      subject: `Rescheduled: ${meeting.title}`,
      text: `Hello ${meeting.userName},\n\nYour meeting has been rescheduled to:\nDate: ${date}\nTime: ${time}\nGoogle Meet Link: ${meeting.googleMeetLink}`
    });

    res.status(200).json({
      success: true,
      message: 'Meeting rescheduled successfully',
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

export const cancelMeeting = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findById(id);

    if (!meeting) {
      res.status(404).json({ success: false, message: 'Meeting record not found' });
      return;
    }

    meeting.status = 'cancelled';
    await meeting.save();

    // Send cancellation email confirmation
    await sendEmail({
      to: meeting.userEmail,
      subject: `Cancelled: ${meeting.title}`,
      text: `Hello ${meeting.userName},\n\nYour meeting "${meeting.title}" scheduled for ${meeting.date} at ${meeting.time} has been cancelled.`
    });

    res.status(200).json({
      success: true,
      message: 'Meeting cancelled successfully',
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};
