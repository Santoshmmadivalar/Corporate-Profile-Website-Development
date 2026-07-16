import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { sendEmail } from '../services/emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'outpro_super_secret_jwt_key_2026';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['admin', 'employee', 'client', 'candidate', 'user']).optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  companyName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email is already registered' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    // Generate numeric 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    // Create user
    const newUser = new User({
      ...validatedData,
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpires
    });

    await newUser.save();

    // Send OTP email
    await sendEmail({
      to: newUser.email,
      subject: 'Verify Your Outpro.India Account',
      text: `Hello ${newUser.name},\n\nThank you for signing up. Your account verification OTP is:\n\n${otp}\n\nThis OTP is valid for 15 minutes.`,
      html: `<p>Hello <strong>${newUser.name}</strong>,</p><p>Thank you for signing up. Your account verification OTP is:</p><h2>${otp}</h2><p>This OTP is valid for 15 minutes.</p>`
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. An OTP has been sent to your email.',
      data: {
        email: newUser.email,
        isVerified: false
      }
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

export const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Email and OTP are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ success: false, message: 'Account is already verified' });
      return;
    }

    if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
      return;
    }

    // Verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Account verified successfully',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user
    const user = await User.findOne({ email: validatedData.email }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Check if verified
    if (!user.isVerified) {
      // Send a new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Outpro.India Account',
        text: `Your verification OTP code is: ${otp}.`
      });

      res.status(403).json({ 
        success: false, 
        message: 'Account not verified. A new OTP has been sent to your email.', 
        requiresVerification: true, 
        email: user.email 
      });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(validatedData.password, user.password || '');
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user info (except password)
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userResponse
      }
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

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: 'No user registered with this email address' });
      return;
    }

    // Generate OTP for password reset
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Reset Password OTP - Outpro.India',
      text: `Hello ${user.name},\n\nYou requested to reset your password. Use the OTP code below to complete the reset:\n\n${otp}\n\nThis OTP is valid for 15 minutes.`
    });

    res.status(200).json({
      success: true,
      message: 'Password reset OTP code has been dispatched to your email'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      res.status(400).json({ success: false, message: 'Email, OTP, and newPassword are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
      return;
    }

    // Reset password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true; // Auto-verify if they completed reset
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset completed successfully. You can now login.'
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { name, phone, bio, address, skills, socialLinks } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (address !== undefined) user.address = address;
    if (skills !== undefined) user.skills = skills;
    if (socialLinks !== undefined) user.socialLinks = socialLinks;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, name, googleId } = req.body;
    if (!email || !name) {
      res.status(400).json({ success: false, message: 'Google authentication details are incomplete' });
      return;
    }

    let user = await User.findOne({ email });
    if (!user) {
      // Create user with a random secure password hash
      const randomPassword = Math.random().toString(36).substring(2, 10);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      
      user = new User({
        name,
        email,
        password: hashedPassword,
        role: 'user',
        isVerified: true
      });
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    next(error);
  }
};
