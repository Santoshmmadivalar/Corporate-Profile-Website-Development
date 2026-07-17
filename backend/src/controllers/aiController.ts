import { Request, Response, NextFunction } from 'express';
import { generateGroqCompletion } from '../services/groqService';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { getRelevantContext } from '../services/ragService';
import { Proposal } from '../models/Proposal';
import { ResumeAnalysis } from '../models/ResumeAnalysis';
import { sendEmail } from '../services/emailService';
import { ChatHistory } from '../models/ChatHistory';

const chatRequestSchema = z.object({
  message: z.string().min(1, { message: 'Message cannot be empty' }),
  sessionId: z.string().optional()
});

const proposalRequestSchema = z.object({
  businessType: z.string().min(1),
  projectType: z.string().min(1),
  budget: z.number().positive(),
  timeline: z.string().min(1),
  requirements: z.string().min(1),
  emailTo: z.string().email().optional()
});

const contentRequestSchema = z.object({
  contentType: z.enum(['seo-blog', 'service-desc', 'landing-page', 'linkedin-post', 'instagram-caption', 'email-campaign', 'meta-tags', 'faq']),
  topic: z.string().min(2),
  keywords: z.string().optional()
});

const OUTPRO_FAQ_ANSWERS = [
  {
    keywords: ['hi', 'hello', 'hlo', 'hey', 'greetings'],
    answer: 'Hello! I am the Outpro.India AI Assistant. How can I assist you with our services, career opportunities, or billing dashboards today?'
  },
  {
    keywords: ['who are you', 'your name', 'bot', 'assistant', 'chatbot'],
    answer: 'I am the Outpro.India AI Guide, built to show you how our corporate portal, recruitment pipeline, client billing, and sprint modules work.'
  },
  {
    keywords: ['login', 'register', 'signup', 'role', 'roles', 'permission', 'permissions', 'rbac', 'access', 'token', 'password', 'jwt'],
    answer: 'Our system implements secure JWT-based authentication with Role-Based Access Control (RBAC). It supports 6 roles: Super Admin, HR, Manager, Employee, Client, and User, each with custom dashboard routes and data authorization filters.'
  },
  {
    keywords: ['dashboard', 'admin panel', 'metrics', 'revenue', 'statistics', 'visitor', 'charts', 'graph', 'analytics'],
    answer: 'The Admin Dashboard provides real-time statistics (total users, employees, projects, CRM pipelines, and revenue), styled with Recharts graphs tracking visitor traffic, service usage, and project distribution.'
  },
  {
    keywords: ['security', 'audit log', 'ip', 'helmet', 'xss', 'csrf', 'protection', 'bcrypt', 'rate limit'],
    answer: 'Enterprise security is enforced using Helmet headers, rate limiters, bcrypt password hashing, MongoDB injection safeguards, and a Security Audit Log tracking all administrative changes with timestamp and IP address logs.'
  },
  {
    keywords: ['service', 'services', 'offer', 'offers', 'work', 'capability', 'capabilities', 'do you do', 'what do you'],
    answer: 'Outpro.India offers premium corporate digital services, including Custom Software Engineering, Cloud Architectures & DevOps Pipelines, Enterprise Headless CMS integrations, Interactive Dashboards, and AI/RAG platform consultation.'
  },
  {
    keywords: ['career', 'careers', 'job', 'jobs', 'position', 'positions', 'openings', 'hiring', 'apply', 'work here', 'join'],
    answer: 'You can check open hiring roles and scan your ATS resume compatibility by visiting our Careers section. We are currently recruiting Full-stack Developers, Project Managers, and UX Designers.'
  },
  {
    keywords: ['meeting', 'meetings', 'schedule', 'book', 'call', 'consultation', 'reschedule', 'cancel'],
    answer: 'You can book a corporate meeting or virtual consultation directly in our scheduling tool at the /meetings dashboard page. A unique mock Google Meet conference link is automatically generated for every slot booked.'
  },
  {
    keywords: ['billing', 'price', 'pricing', 'cost', 'costs', 'invoice', 'invoices', 'payment', 'payout', 'payouts'],
    answer: 'Clients can access project milestones, track hours, and pay invoices online directly through the Client Portal dashboard page.'
  },
  {
    keywords: ['contact', 'support', 'help', 'ticket', 'tickets', 'email', 'phone', 'address'],
    answer: 'You can contact our support desk or open helpdesk tickets from the Client Portal. Our team can also be reached directly via our Contact page or at support@outpro.india.'
  }
];

export const processAIChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = chatRequestSchema.parse(req.body);
    const { message, sessionId } = validatedData;

    // Decode JWT token manually if available to associate session details
    let userId: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        userId = decoded.userId;
      } catch (err) {
        // Ignore invalid token
      }
    }

    // Helper to log conversation history to database
    const saveChatHistory = async (replyText: string) => {
      try {
        const userMessage = { sender: 'user' as const, text: message, timestamp: new Date() };
        const aiMessage = { sender: 'ai' as const, text: replyText, timestamp: new Date() };
        const finalSessionId = sessionId || `session-${userId || 'guest'}-${Date.now()}`;
        
        await ChatHistory.findOneAndUpdate(
          { sessionId: finalSessionId },
          {
            $set: { userId },
            $push: { messages: { $each: [userMessage, aiMessage] } }
          },
          { upsert: true }
        );
      } catch (saveError: any) {
        console.error('Failed to log chat interaction to MongoDB:', saveError.message);
      }
    };

    // Retrieve matching database chunks for RAG
    const ragContext = await getRelevantContext(message, 3);
    
    // Check if the API key is defined before attempting to query the API
    const hasGroqKey = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '';
    if (hasGroqKey) {
      try {
        let systemPrompt = `You are the official Corporate Business Assistant for Outpro.India, a premium enterprise software engineering and cloud consultation agency.
Your primary role is to answer questions professionally, factually, and concisely.

Always align your responses with the following company directories:
1. Overview: Outpro.India is a top-tier digital transformation agency delivering scalable web solutions, custom enterprise portals, and cloud integrations.
2. Services: Custom Software Engineering, UI/UX Design, DevOps Pipelines, Headless Commerce, and RAG/AI System consultation.
3. Portfolio: Delivering corporate customizers, JAMstack migrations, and B2B SaaS web applications.
4. Billing & Pricing: Secure billing portal where clients pay invoices online and track development milestone budgets.
5. FAQs: Standard JWT security protocols, Role-Based Access Controls (RBAC), and automated schedule meetings.
6. Contacts: Reached via support@outpro.india, the Helpdesk tickets dashboard, or our contact page.

Guidelines:
- Maintain a professional, polite, and executive-level tone.
- Do NOT make up, assume, or hallucinate any company statistics, partnerships, or operational details not documented in company materials.
- If a query cannot be answered using company resources or files, state clearly that you do not have that specific company information but offer to schedule a consultation slot with our directors (via /meetings) or redirect them to support@outpro.india.`;

        if (ragContext) {
          systemPrompt += `\n\n[Verified Company Knowledge Base Documents]:\n${ragContext}\n\nUse the verified knowledge context above to address the user query.`;
        }

        const responseText = await generateGroqCompletion(
          `User Query: "${message}"`,
          systemPrompt
        );
        
        if (responseText) {
          await saveChatHistory(responseText);
          res.json({
            success: true,
            data: {
              reply: responseText.trim(),
              contextUsed: !!ragContext
            },
            reply: responseText.trim()
          });
          return;
        }
      } catch (groqError: any) {
        console.warn('Groq API call failed. Using offline rule-based fallback:', groqError.message);
      }
    }

    // Fallback static matching engine if API key is missing or query fails
    const queryLower = message.toLowerCase();
    let answer = '';

    // Search Knowledge Base records manually in JavaScript as a secondary fallback
    if (ragContext) {
      answer = `Based on our company files:\n\n${ragContext}\n\n(Offline RAG response)`;
    } else {
      for (const faq of OUTPRO_FAQ_ANSWERS) {
        const match = faq.keywords.some(kw => queryLower.includes(kw));
        if (match) {
          answer = faq.answer;
          break;
        }
      }
      if (!answer) {
        if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '') {
          answer = "The Groq API key is successfully loaded in the backend environment, but the request was completed in offline fallback mode because the API key request encountered an error. Please contact Outpro.India engineering or double-check the API configuration.";
        } else {
          answer = "I'm running in offline demonstration mode. To get tailored responses, please ensure a valid GROQ_API_KEY is configured in your backend environment variables.";
        }
      }
    }

    await saveChatHistory(answer);
    res.json({
      success: true,
      data: {
        reply: answer,
        contextUsed: !!ragContext
      },
      reply: answer
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.errors });
      return;
    }
    next(error);
  }
};

export const generateProposal = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = proposalRequestSchema.parse(req.body);
    const { businessType, projectType, budget, timeline, requirements, emailTo } = validatedData;
    const userId = req.user?.userId;

    let proposalText = '';

    const hasGroqKey = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '';
    if (hasGroqKey) {
      try {
        const prompt = `Generate a formal corporate B2B project proposal from Outpro.India based on the following inputs:
- Business Category: ${businessType}
- Target Platform: ${projectType}
- Proposed Budget: ₹${budget.toLocaleString()} INR
- Implementation Timeline: ${timeline}
- Functional Requirements: ${requirements}

Structure the response beautifully using Markdown. Include:
1. Executive Summary
2. Proposed Architecture & System Design
3. Milestone Roadmap & Sprints
4. Tech Stack Recommendations
5. Cost Estimation & Deliverables Summary`;

        const responseText = await generateGroqCompletion(prompt);
        if (responseText) {
          proposalText = responseText.trim();
        }
      } catch (err: any) {
        console.warn('Groq proposal generation failed. Using templates.', err.message);
      }
    }

    if (!proposalText) {
      // Fallback proposal mockup
      proposalText = `# Outpro.India Corporate Proposal

## 1. Executive Summary
We propose a complete engineering roadmap to build your **${projectType}** tailored for **${businessType}**. Our scope aligns with your functional parameters and targets delivery within **${timeline}**.

## 2. Recommended Tech Stack
* **Frontend**: Next.js 16 (App Router), Tailwind CSS
* **Backend**: Express.js, TypeScript, MongoDB Atlas
* **AI Engine**: Gemini flash integrations
* **Deployments**: Vercel & Render container configurations

## 3. Milestones & Delivery Schedules
* **Sprint 1 (Weeks 1-2)**: Database migrations and authentication API clearances
* **Sprint 2 (Weeks 3-4)**: Full responsiveness UI components integrations
* **Sprint 3 (Weeks 5+)**: Deployment launches & security testing

## 4. Financial cleared summary
* Total Project Cost: ₹${budget.toLocaleString()} INR
* Terms: 40% upfront, 60% upon milestones clearances.`;
    }

    // Save to Database
    const proposal = new Proposal({
      userId,
      businessType,
      projectType,
      budget,
      timeline,
      requirements,
      proposalText
    });
    await proposal.save();

    // Send proposal via email if emailTo is specified
    if (emailTo) {
      await sendEmail({
        to: emailTo,
        subject: `Your Project Proposal - ${projectType}`,
        text: `Here is the AI-generated proposal from Outpro.India:\n\n${proposalText}`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Proposal generated successfully',
      data: proposal
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.errors });
      return;
    }
    next(error);
  }
};

export const generateContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { contentType, topic, keywords } = contentRequestSchema.parse(req.body);
    let generatedText = '';

    const hasGroqKey = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '';
    if (hasGroqKey) {
      try {
        const prompt = `Generate copy content for a ${contentType} about "${topic}". ${keywords ? `Incorporate these keywords: ${keywords}` : ''}. Output the result in clean markdown.`;
        const responseText = await generateGroqCompletion(prompt);
        if (responseText) {
          generatedText = responseText.trim();
        }
      } catch (err: any) {
        console.warn('Groq content builder failed:', err.message);
      }
    }

    if (!generatedText) {
      generatedText = `### Generated Outpro marketing copy (${contentType})\n\n**Topic**: ${topic}\n\n*This content was compiled as a mock copy since the Gemini API is operating offline.*`;
    }

    res.status(200).json({
      success: true,
      data: {
        contentType,
        topic,
        text: generatedText
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.errors });
      return;
    }
    next(error);
  }
};

export const analyzeResume = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { resumeText, candidateName, candidateEmail } = req.body;
    if (!resumeText) {
      res.status(400).json({ success: false, message: 'Resume text is required' });
      return;
    }

    let atsScore = 75;
    let skillGapAnalysis: string[] = ['Docker containerization configs', 'Zod request schema validations'];
    let keywordSuggestions: string[] = ['CI/CD pipeline triggers', 'Helmet security headers', 'JWT auth middleware filters'];
    let interviewQuestions: string[] = ['How do you configure RBAC auth filters in an Express server?', 'Explain the document text retrieval logic for a custom RAG engine.'];
    let improvementSuggestions: string[] = ['Add references to custom API integrations', 'Elaborate on TypeScript interface structures'];

    const hasGroqKey = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '';
    if (hasGroqKey) {
      try {
        const prompt = `Perform an ATS review on the following resume text. Return a JSON structure ONLY with keys: "atsScore" (number 0-100), "skillGapAnalysis" (array of strings), "keywordSuggestions" (array of strings), "interviewQuestions" (array of strings), "improvementSuggestions" (array of strings). Do not include markdown tags, code block wrappers, or any other formatting:
        
        Resume text:
        "${resumeText}"`;

        const responseText = await generateGroqCompletion(
          prompt,
          'You are a precise resume parser. You MUST output ONLY valid JSON matching the exact requested format, without any markdown formatting or prefix/suffix.',
          true
        );

        if (responseText) {
          const jsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(jsonText);
          atsScore = parsed.atsScore ?? atsScore;
          skillGapAnalysis = parsed.skillGapAnalysis ?? skillGapAnalysis;
          keywordSuggestions = parsed.keywordSuggestions ?? keywordSuggestions;
          interviewQuestions = parsed.interviewQuestions ?? interviewQuestions;
          improvementSuggestions = parsed.improvementSuggestions ?? improvementSuggestions;
        }
      } catch (err: any) {
        console.warn('Groq resume scanner failed. Loading realistic mock reviews:', err.message);
      }
    }

    const report = new ResumeAnalysis({
      candidateId: req.user?.userId,
      candidateName: candidateName || 'Candidate Profile',
      candidateEmail: candidateEmail || 'info@candidate.com',
      atsScore,
      skillGapAnalysis,
      keywordSuggestions,
      interviewQuestions,
      improvementSuggestions
    });
    await report.save();

    res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.userId;
    const history = await ChatHistory.findOne({ userId }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      data: history ? history.messages : []
    });
  } catch (error) {
    next(error);
  }
};

export const deleteChatHistory = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.userId;
    await ChatHistory.deleteOne({ userId });
    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};
