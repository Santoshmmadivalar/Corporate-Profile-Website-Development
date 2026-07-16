import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { ContactMessage } from '../models/Contact';
import { NewsletterSubscriber } from '../models/Subscriber';
import { Project } from '../models/Project';

export const getAdminAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Basic user statistics
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const employeeCount = await User.countDocuments({ role: 'employee' });
    const clientCount = await User.countDocuments({ role: 'client' });
    const candidateCount = await User.countDocuments({ role: 'candidate' });

    // Contact Messages & Subscriptions
    const totalEnquiries = await ContactMessage.countDocuments();
    const totalSubscribers = await NewsletterSubscriber.countDocuments();
    const totalPortfolioProjects = await Project.countDocuments();

    // Generate month-wise stats mock data for charts
    const monthlyRegistrations = [
      { month: 'Jan', count: 12 },
      { month: 'Feb', count: 19 },
      { month: 'Mar', count: 32 },
      { month: 'Apr', count: 48 },
      { month: 'May', count: 65 },
      { month: 'Jun', count: 85 }
    ];

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admin: adminCount,
          employee: employeeCount,
          client: clientCount,
          candidate: candidateCount
        },
        enquiries: totalEnquiries,
        subscribers: totalSubscribers,
        projects: totalPortfolioProjects,
        charts: {
          monthlyRegistrations
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'employee', 'client', 'candidate', 'user'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role selection' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: `User role successfully updated to ${role}`,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User account has been successfully deleted'
    });
  } catch (error) {
    next(error);
  }
};
