import { Request, Response, NextFunction } from 'express';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { z } from 'zod';

const jobCreateSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  department: z.string().min(2, { message: 'Department is required' }),
  location: z.string().min(2, { message: 'Location is required' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  requirements: z.array(z.string()).min(1, { message: 'At least one requirement is required' }),
  salaryRange: z.string().optional(),
});

const applicationSubmitSchema = z.object({
  candidateName: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  candidateEmail: z.string().email({ message: 'Invalid email address' }),
  resumeUrl: z.string().min(1, { message: 'Resume file or link is required' }),
  resumeText: z.string().optional() // Optional raw resume text for screening
});

// Help analyze resume text and match against job requirements
const screenResume = (resumeText: string = '', jobRequirements: string[] = []): { score: number; notes: string } => {
  if (!resumeText) {
    return { score: 50, notes: 'Screened with base matching. No raw resume text was provided.' };
  }

  const text = resumeText.toLowerCase();
  let matches = 0;
  const matchedKeywords: string[] = [];

  jobRequirements.forEach(req => {
    // Simple word checks for screening
    const cleanedReq = req.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const keywords = cleanedReq.split(/\s+/).filter(w => w.length > 3);
    
    // Check if any keyword of requirement matches
    const hasMatch = keywords.some(kw => text.includes(kw));
    if (hasMatch) {
      matches++;
      matchedKeywords.push(req);
    }
  });

  const percentage = Math.round((matches / (jobRequirements.length || 1)) * 100);
  const score = Math.max(10, Math.min(100, percentage)); // clamp score between 10 and 100
  
  let notes = '';
  if (score >= 80) {
    notes = `Excellent match! Matches keywords: ${matchedKeywords.join(', ')}. Strong recommendation for immediate call.`;
  } else if (score >= 50) {
    notes = `Moderate match. Matches: ${matchedKeywords.join(', ')}. Good for review.`;
  } else {
    notes = `Weak match. Candidate resume did not have matching keywords for key job requirements.`;
  }

  return { score, notes };
};

export const getJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const jobs = await Job.find({ status: 'open' }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job posting not found' });
      return;
    }
    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = jobCreateSchema.parse(req.body);
    const newJob = new Job(validatedData);
    await newJob.save();

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      data: newJob
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

export const applyForJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job posting not found' });
      return;
    }

    const validatedData = applicationSubmitSchema.parse(req.body);
    
    // AI Resume Screening matches resume contents with job requirements
    const screeningResult = screenResume(validatedData.resumeText, job.requirements);

    const newApplication = new Application({
      jobId: job._id,
      candidateName: validatedData.candidateName,
      candidateEmail: validatedData.candidateEmail,
      resumeUrl: validatedData.resumeUrl,
      screeningScore: screeningResult.score,
      screeningNotes: screeningResult.notes,
      status: 'applied'
    });

    await newApplication.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully. Our HR team has received your application.',
      data: newApplication
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

export const getApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { jobId } = req.query;
    const filter = jobId ? { jobId } : {};
    
    const applications = await Application.find(filter)
      .populate('jobId', 'title department location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['applied', 'reviewing', 'shortlisted', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid application status selection' });
      return;
    }

    const updatedApp = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('jobId', 'title department');

    if (!updatedApp) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      data: updatedApp
    });
  } catch (error) {
    next(error);
  }
};
