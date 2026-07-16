import { AuditLog } from '../models/AuditLog';

export const logAuditEvent = async (
  userId: string | undefined,
  actorName: string,
  action: string,
  details: string,
  ipAddress?: string
): Promise<void> => {
  try {
    const log = new AuditLog({
      userId,
      actorName,
      action,
      details,
      ipAddress
    });
    await log.save();
    console.log(`[AUDIT LOG] ${actorName} executed action: "${action}" - ${details}`);
  } catch (error: any) {
    console.error('Failed to save audit log:', error.message);
  }
};
