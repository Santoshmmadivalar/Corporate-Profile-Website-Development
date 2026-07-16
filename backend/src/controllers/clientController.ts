import { Request, Response, NextFunction } from 'express';
import { ClientProject } from '../models/ClientProject';
import { Invoice } from '../models/Invoice';
import { SupportTicket } from '../models/SupportTicket';
import { User } from '../models/User';
import { sendSystemAlert } from './notificationController';
import { z } from 'zod';

const projectCreateSchema = z.object({
  clientId: z.string(),
  name: z.string().min(2),
  description: z.string().min(5),
  milestones: z.array(z.object({
    title: z.string(),
    completed: z.boolean().default(false)
  })).min(1),
});

const invoiceCreateSchema = z.object({
  clientId: z.string(),
  projectId: z.string(),
  invoiceNumber: z.string(),
  amount: z.number().positive(),
  dueDate: z.string().transform(str => new Date(str)),
});

const ticketCreateSchema = z.object({
  subject: z.string().min(3),
  description: z.string().min(5),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

// 1. Projects
export const getClientProjects = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.userId;
    const projects = await ClientProject.find({ clientId: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

export const getAllProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projects = await ClientProject.find({})
      .populate('clientId', 'name email companyName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

export const createClientProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = projectCreateSchema.parse(req.body);
    
    // Calculate initial progress based on milestones completed
    const completedCount = validatedData.milestones.filter(m => m.completed).length;
    const progress = Math.round((completedCount / validatedData.milestones.length) * 100);

    const newProject = new ClientProject({
      ...validatedData,
      progress
    });

    await newProject.save();
    res.status(201).json({ success: true, message: 'Client project board initialized', data: newProject });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.errors });
      return;
    }
    next(error);
  }
};

export const updateProjectMilestone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { milestoneIndex, completed } = req.body;

    const project = await ClientProject.findById(id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project board not found' });
      return;
    }

    if (project.milestones[milestoneIndex] === undefined) {
      res.status(400).json({ success: false, message: 'Invalid milestone selection' });
      return;
    }

    project.milestones[milestoneIndex].completed = completed;
    
    // Re-evaluate progress percentage
    const completedCount = project.milestones.filter(m => m.completed).length;
    project.progress = Math.round((completedCount / project.milestones.length) * 100);
    
    if (project.progress === 100) {
      project.status = 'completed';
    } else if (project.progress > 0) {
      project.status = 'development';
    }

    await project.save();

    // Trigger system alert
    await sendSystemAlert(
      project.clientId.toString(),
      'invoice',
      'Project Milestone Updated',
      `Milestone '${project.milestones[milestoneIndex].title}' has been marked as ${completed ? 'completed' : 'incomplete'} on project '${project.name}'.`
    );

    res.status(200).json({ success: true, message: 'Milestone updated successfully', data: project });
  } catch (error) {
    next(error);
  }
};

// 2. Invoices
export const getClientInvoices = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.userId;
    const invoices = await Invoice.find({ clientId: userId })
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};

export const getAllInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const invoices = await Invoice.find({})
      .populate('clientId', 'name email companyName')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = invoiceCreateSchema.parse(req.body);
    const newInvoice = new Invoice(validatedData);
    await newInvoice.save();

    // Trigger system alert
    await sendSystemAlert(
      validatedData.clientId,
      'invoice',
      'New Invoice Issued',
      `A new invoice ${validatedData.invoiceNumber} for ₹${validatedData.amount} has been issued with due date ${validatedData.dueDate.toLocaleDateString()}.`
    );

    res.status(201).json({ success: true, message: 'Invoice generated successfully', data: newInvoice });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.errors });
      return;
    }
    next(error);
  }
};

export const payInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { status: 'paid' },
      { new: true }
    );

    if (!updatedInvoice) {
      res.status(404).json({ success: false, message: 'Invoice file not found' });
      return;
    }

    // Trigger system alert
    await sendSystemAlert(
      updatedInvoice.clientId.toString(),
      'invoice',
      'Invoice Payment Confirmed',
      `Payment of ₹${updatedInvoice.amount} for invoice ${updatedInvoice.invoiceNumber} has been cleared.`
    );

    res.status(200).json({ success: true, message: 'Simulated payment processing successful', data: updatedInvoice });
  } catch (error) {
    next(error);
  }
};

// 3. Support Tickets
export const getClientTickets = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.userId;
    const tickets = await SupportTicket.find({ clientId: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

export const createSupportTicket = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.userId;
    const clientUser = await User.findById(userId);
    if (!clientUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const validatedData = ticketCreateSchema.parse(req.body);
    const newTicket = new SupportTicket({
      clientId: userId,
      ...validatedData,
      status: 'open'
    });

    await newTicket.save();
    res.status(201).json({ success: true, message: 'Support ticket raised successfully', data: newTicket });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.errors });
      return;
    }
    next(error);
  }
};

export const replyToTicket = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { text } = req.body;

    if (!text || text.trim() === '') {
      res.status(400).json({ success: false, message: 'Reply text cannot be empty' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      res.status(404).json({ success: false, message: 'Support ticket not found' });
      return;
    }

    ticket.replies.push({
      senderId: userId,
      senderName: user.name,
      text,
      createdAt: new Date()
    });

    // Mark as in_progress if employee/admin replies, else open
    if (user.role === 'admin' || user.role === 'employee') {
      ticket.status = 'in_progress';
      
      // Notify client
      await sendSystemAlert(
        ticket.clientId.toString(),
        'ticket',
        'Support Ticket Updated',
        `A support representative has replied to your ticket: '${ticket.subject}'.`
      );
    } else {
      ticket.status = 'open';
    }

    await ticket.save();
    res.status(200).json({ success: true, message: 'Reply posted successfully', data: ticket });
  } catch (error) {
    next(error);
  }
};

export const getAllTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tickets = await SupportTicket.find({})
      .populate('clientId', 'name email companyName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'in_progress', 'closed'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid support status' });
      return;
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    res.status(200).json({ success: true, message: `Ticket marked as ${status}`, data: ticket });
  } catch (error) {
    next(error);
  }
};
