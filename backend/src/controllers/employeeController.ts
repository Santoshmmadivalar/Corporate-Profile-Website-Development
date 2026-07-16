import { Request, Response, NextFunction } from 'express';
import { Attendance } from '../models/Attendance';
import { Leave } from '../models/Leave';
import { SalarySlip } from '../models/SalarySlip';
import { sendSystemAlert } from './notificationController';
import { z } from 'zod';

const leaveRequestSchema = z.object({
  type: z.enum(['annual', 'sick', 'personal']),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  reason: z.string().min(5, { message: 'Reason must be at least 5 characters' }),
});

const salarySlipCreateSchema = z.object({
  employeeId: z.string(),
  month: z.string(),
  year: z.number(),
  baseSalary: z.number().positive(),
  bonuses: z.number().default(0),
  deductions: z.number().default(0),
});

// Helper: check if check-in is late (after 09:30 AM)
const checkLateStatus = (checkInTimeStr: string): 'present' | 'late' => {
  const [hours, minutes] = checkInTimeStr.split(':').map(Number);
  if (hours > 9 || (hours === 9 && minutes > 30)) {
    return 'late';
  }
  return 'present';
};

// 1. Attendance Methods
export const punchIn = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0]; // HH:MM:SS

    // Check if already checked in today
    const existing = await Attendance.findOne({ employeeId: userId, date: today });
    if (existing) {
      res.status(400).json({ success: false, message: 'Already punched in for today.' });
      return;
    }

    const status = checkLateStatus(time);

    const log = new Attendance({
      employeeId: userId,
      date: today,
      checkIn: time,
      status
    });

    await log.save();

    res.status(201).json({
      success: true,
      message: `Punch-in successful at ${time}. Status: ${status}`,
      data: log
    });
  } catch (error) {
    next(error);
  }
};

export const punchOut = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0];

    const log = await Attendance.findOne({ employeeId: userId, date: today });
    if (!log) {
      res.status(400).json({ success: false, message: 'You must punch in first before punching out.' });
      return;
    }

    if (log.checkOut) {
      res.status(400).json({ success: false, message: 'Already punched out for today.' });
      return;
    }

    log.checkOut = time;
    await log.save();

    res.status(200).json({
      success: true,
      message: `Punch-out successful at ${time}`,
      data: log
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceLogs = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.userId;
    const logs = await Attendance.find({ employeeId: userId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

// 2. Leave Requests Methods
export const requestLeave = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.userId;
    const validatedData = leaveRequestSchema.parse(req.body);

    const newLeave = new Leave({
      employeeId: userId,
      ...validatedData
    });

    await newLeave.save();

    // Trigger system alert
    await sendSystemAlert(
      userId,
      'leave',
      'Leave Request Submitted',
      `Your leave request for ${newLeave.type} leave starting ${newLeave.startDate.toLocaleDateString()} has been submitted.`
    );

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: newLeave
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
      });
      return;
    }
    next(error);
  }
};

export const getLeaves = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.userId;
    const leaves = await Leave.find({ employeeId: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: leaves
    });
  } catch (error) {
    next(error);
  }
};

export const getAllLeaves = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leaves = await Leave.find({})
      .populate('employeeId', 'name email title department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: leaves
    });
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid leave status selection' });
      return;
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('employeeId', 'name email');

    if (!updatedLeave) {
      res.status(404).json({ success: false, message: 'Leave record not found' });
      return;
    }

    // Trigger system alert
    await sendSystemAlert(
      updatedLeave.employeeId._id.toString(),
      'leave',
      `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `Your leave request from ${updatedLeave.startDate.toLocaleDateString()} has been ${status}.`
    );

    res.status(200).json({
      success: true,
      message: `Leave request has been ${status}`,
      data: updatedLeave
    });
  } catch (error) {
    next(error);
  }
};

// 3. Salary Slip Methods
export const getSalarySlips = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.userId;
    const slips = await SalarySlip.find({ employeeId: userId }).sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      data: slips
    });
  } catch (error) {
    next(error);
  }
};

export const createSalarySlip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = salarySlipCreateSchema.parse(req.body);
    const netSalary = validatedData.baseSalary + validatedData.bonuses - validatedData.deductions;

    const newSlip = new SalarySlip({
      ...validatedData,
      netSalary,
      status: 'paid'
    });

    await newSlip.save();

    // Trigger system alert
    await sendSystemAlert(
      validatedData.employeeId,
      'payroll',
      'Salary Slip Dispatched',
      `Your salary slip for ${validatedData.month} ${validatedData.year} has been issued and processed.`
    );

    res.status(201).json({
      success: true,
      message: 'Salary slip created and marked as paid',
      data: newSlip
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
      });
      return;
    }
    next(error);
  }
};
