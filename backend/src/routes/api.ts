import { Router } from 'express';
import multer from 'multer';
import { getServices, getServiceBySlug } from '../controllers/serviceController';
import { getPortfolio, getProjectById } from '../controllers/portfolioController';
import { getTestimonials } from '../controllers/testimonialController';
import { getTeam } from '../controllers/teamController';
import { submitContact } from '../controllers/contactController';
import { subscribeNewsletter } from '../controllers/newsletterController';
import { register, login, getMe, verifyOTP, forgotPassword, resetPassword, updateProfile, googleLogin } from '../controllers/authController';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware';
import { getAdminAnalytics, getUsers, updateUserRole, deleteUser } from '../controllers/adminController';
import { getJobs, getJobById, createJob, applyForJob, getApplications, updateApplicationStatus } from '../controllers/careerController';
import { punchIn, punchOut, getAttendanceLogs, requestLeave, getLeaves, getAllLeaves, updateLeaveStatus, getSalarySlips, createSalarySlip } from '../controllers/employeeController';
import { getClientProjects, getAllProjects, createClientProject, updateProjectMilestone, getClientInvoices, getAllInvoices, createInvoice, payInvoice, getClientTickets, createSupportTicket, replyToTicket, getAllTickets, updateTicketStatus } from '../controllers/clientController';
import { getEnquiries, createCRMEnquiry, updateCRMStatus, addFollowUpNote } from '../controllers/crmController';
import { processAIChat, generateProposal, generateContent, analyzeResume, getChatHistory, deleteChatHistory } from '../controllers/aiController';
import { getNotifications, markRead } from '../controllers/notificationController';
import { getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog, addComment, likeBlog } from '../controllers/blogController';
import { getGalleryItems, createGalleryItem, deleteGalleryItem } from '../controllers/galleryController';
import { getFAQs, createFAQ, deleteFAQ } from '../controllers/faqController';
import { getAuditLogs } from '../controllers/auditController';
import { getMeetings, bookMeeting, rescheduleMeeting, cancelMeeting } from '../controllers/meetingController';
import { getKnowledgeBase, uploadDocument, scrapeWebsite, deleteDocument } from '../controllers/knowledgeController';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticate, getMe);
router.post('/auth/verify-otp', verifyOTP);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.put('/auth/profile', authenticate, updateProfile);
router.post('/auth/google', googleLogin);

// Meeting routes
router.get('/meetings', authenticate, getMeetings);
router.post('/meetings', authenticate, bookMeeting);
router.put('/meetings/:id/reschedule', authenticate, rescheduleMeeting);
router.put('/meetings/:id/cancel', authenticate, cancelMeeting);

// AI Chat route
router.post('/ai/chat', processAIChat);
router.post('/chat', processAIChat);
router.get('/chat/history', authenticate, getChatHistory);
router.delete('/chat/history', authenticate, deleteChatHistory);
router.post('/ai/proposal', authenticate, generateProposal);
router.post('/ai/generate-content', authenticate, generateContent);
router.post('/ai/analyze-resume', authenticate, analyzeResume);

// Admin RAG / Knowledge Base routes
router.get('/admin/knowledge-base', authenticate, authorizeRoles('admin'), getKnowledgeBase);
router.post('/admin/knowledge-base/upload', authenticate, authorizeRoles('admin'), upload.single('file'), uploadDocument);
router.post('/admin/knowledge-base/scrape', authenticate, authorizeRoles('admin'), scrapeWebsite);
router.delete('/admin/knowledge-base/:id', authenticate, authorizeRoles('admin'), deleteDocument);

// Notifications routes
router.get('/notifications', authenticate, getNotifications);
router.put('/notifications/:id/read', authenticate, markRead);

// Admin routes
router.get('/admin/analytics', authenticate, authorizeRoles('admin'), getAdminAnalytics);
router.get('/admin/users', authenticate, authorizeRoles('admin'), getUsers);
router.put('/admin/users/:id/role', authenticate, authorizeRoles('admin'), updateUserRole);
router.delete('/admin/users/:id', authenticate, authorizeRoles('admin'), deleteUser);

// Career / HR Portal routes
router.get('/jobs', getJobs);
router.get('/jobs/:id', getJobById);
router.post('/jobs/:id/apply', applyForJob);
router.post('/admin/jobs', authenticate, authorizeRoles('admin'), createJob);
router.get('/admin/applications', authenticate, authorizeRoles('admin'), getApplications);
router.put('/admin/applications/:id/status', authenticate, authorizeRoles('admin'), updateApplicationStatus);

// Employee Portal routes
router.post('/employee/punch-in', authenticate, authorizeRoles('employee', 'admin'), punchIn);
router.post('/employee/punch-out', authenticate, authorizeRoles('employee', 'admin'), punchOut);
router.get('/employee/attendance', authenticate, authorizeRoles('employee', 'admin'), getAttendanceLogs);
router.post('/employee/leaves', authenticate, authorizeRoles('employee', 'admin'), requestLeave);
router.get('/employee/leaves', authenticate, authorizeRoles('employee', 'admin'), getLeaves);
router.get('/employee/salary-slips', authenticate, authorizeRoles('employee', 'admin'), getSalarySlips);

// Admin Payroll & Leaves routes
router.get('/admin/leaves', authenticate, authorizeRoles('admin'), getAllLeaves);
router.put('/admin/leaves/:id/status', authenticate, authorizeRoles('admin'), updateLeaveStatus);
router.post('/admin/salary-slips', authenticate, authorizeRoles('admin'), createSalarySlip);

// Client Portal routes
router.get('/client/projects', authenticate, authorizeRoles('client', 'admin'), getClientProjects);
router.get('/client/invoices', authenticate, authorizeRoles('client', 'admin'), getClientInvoices);
router.post('/client/invoices/:id/pay', authenticate, authorizeRoles('client', 'admin'), payInvoice);
router.get('/client/tickets', authenticate, authorizeRoles('client', 'admin'), getClientTickets);
router.post('/client/tickets', authenticate, authorizeRoles('client', 'admin'), createSupportTicket);
router.post('/client/tickets/:id/reply', authenticate, authorizeRoles('client', 'admin', 'employee'), replyToTicket);

// Admin Client/Project Management routes
router.get('/admin/projects', authenticate, authorizeRoles('admin'), getAllProjects);
router.post('/admin/projects', authenticate, authorizeRoles('admin'), createClientProject);
router.put('/admin/projects/:id/milestones', authenticate, authorizeRoles('admin', 'employee'), updateProjectMilestone);
router.get('/admin/invoices', authenticate, authorizeRoles('admin'), getAllInvoices);
router.post('/admin/invoices', authenticate, authorizeRoles('admin'), createInvoice);
router.get('/admin/tickets', authenticate, authorizeRoles('admin', 'employee'), getAllTickets);
router.put('/admin/tickets/:id/status', authenticate, authorizeRoles('admin', 'employee'), updateTicketStatus);

// CRM routes
router.post('/crm/enquiries', createCRMEnquiry);
router.get('/admin/crm/enquiries', authenticate, authorizeRoles('admin', 'employee'), getEnquiries);
router.put('/admin/crm/enquiries/:id/status', authenticate, authorizeRoles('admin', 'employee'), updateCRMStatus);
router.post('/admin/crm/enquiries/:id/followups', authenticate, authorizeRoles('admin', 'employee'), addFollowUpNote);

// Blog CMS routes
router.get('/blogs', getBlogs);
router.get('/blogs/:slug', getBlogBySlug);
router.post('/blogs/:id/comments', addComment);
router.post('/blogs/:id/like', likeBlog);
router.post('/admin/blogs', authenticate, authorizeRoles('admin', 'employee'), createBlog);
router.put('/admin/blogs/:id', authenticate, authorizeRoles('admin', 'employee'), updateBlog);
router.delete('/admin/blogs/:id', authenticate, authorizeRoles('admin'), deleteBlog);

// Gallery routes
router.get('/gallery', getGalleryItems);
router.post('/admin/gallery', authenticate, authorizeRoles('admin'), createGalleryItem);
router.delete('/admin/gallery/:id', authenticate, authorizeRoles('admin'), deleteGalleryItem);

// FAQ routes
router.get('/faqs', getFAQs);
router.post('/admin/faqs', authenticate, authorizeRoles('admin', 'employee'), createFAQ);
router.delete('/admin/faqs/:id', authenticate, authorizeRoles('admin'), deleteFAQ);

// Security Audit Log routes
router.get('/admin/audit-logs', authenticate, authorizeRoles('admin'), getAuditLogs);

// Services routes
router.get('/services', getServices);
router.get('/services/:slug', getServiceBySlug);

// Portfolio routes
router.get('/portfolio', getPortfolio);
router.get('/portfolio/:id', getProjectById);

// Testimonials route
router.get('/testimonials', getTestimonials);

// Team route
router.get('/team', getTeam);

// Form routes
router.post('/contact', submitContact);
router.post('/newsletter', subscribeNewsletter);

export default router;
