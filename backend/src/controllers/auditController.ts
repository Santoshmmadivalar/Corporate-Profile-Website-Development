import { Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';

export const getAuditLogs = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};
