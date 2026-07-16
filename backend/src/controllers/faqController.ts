import { Request, Response, NextFunction } from 'express';
import { FAQ } from '../models/FAQ';
import { logAuditEvent } from '../utils/auditLogger';
import { z } from 'zod';

const faqItemSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(5),
  category: z.string().optional()
});

export const getFAQs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category } = req.query;
    let query: any = {};
    if (category) {
      query.category = String(category);
    }
    const list = await FAQ.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const createFAQ = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = faqItemSchema.parse(req.body);
    const item = new FAQ(validatedData);
    await item.save();

    await logAuditEvent(
      req.user.userId,
      req.user.name || 'Outpro Admin',
      'add_faq',
      `Created FAQ: "${validatedData.question}"`
    );

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.errors });
      return;
    }
    next(error);
  }
};

export const deleteFAQ = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await FAQ.findByIdAndDelete(id);

    if (!item) {
      res.status(404).json({ success: false, message: 'FAQ not found' });
      return;
    }

    await logAuditEvent(
      req.user.userId,
      req.user.name || 'Outpro Admin',
      'delete_faq',
      `Deleted FAQ: "${item.question}"`
    );

    res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    next(error);
  }
};
