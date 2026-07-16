import { Request, Response, NextFunction } from 'express';
import { CRMEnquiry } from '../models/CRMEnquiry';
import { z } from 'zod';

const leadCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  phone: z.string().optional(),
  subject: z.string().min(3),
  message: z.string().min(5),
});

export const getEnquiries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const enquiries = await CRMEnquiry.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    next(error);
  }
};

export const createCRMEnquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = leadCreateSchema.parse(req.body);
    const newEnquiry = new CRMEnquiry({
      ...validatedData,
      status: 'new'
    });

    await newEnquiry.save();
    res.status(201).json({ success: true, message: 'CRM enquiry created successfully', data: newEnquiry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.errors });
      return;
    }
    next(error);
  }
};

export const updateCRMStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'contacted', 'qualified', 'closed'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid CRM pipeline status' });
      return;
    }

    const updatedLead = await CRMEnquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedLead) {
      res.status(404).json({ success: false, message: 'CRM Enquiry not found' });
      return;
    }

    res.status(200).json({ success: true, message: `Pipeline status set to ${status}`, data: updatedLead });
  } catch (error) {
    next(error);
  }
};

export const addFollowUpNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || note.trim() === '') {
      res.status(400).json({ success: false, message: 'Follow-up log note cannot be empty' });
      return;
    }

    const lead = await CRMEnquiry.findById(id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'CRM Enquiry not found' });
      return;
    }

    lead.followUps.push({
      note,
      date: new Date()
    });

    // Automatically transition 'new' leads to 'contacted' upon logging first touchpoint
    if (lead.status === 'new') {
      lead.status = 'contacted';
    }

    await lead.save();
    res.status(200).json({ success: true, message: 'Follow-up note appended to timeline', data: lead });
  } catch (error) {
    next(error);
  }
};
