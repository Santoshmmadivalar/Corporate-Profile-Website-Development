import axios from 'axios';
import { Service, Project, Testimonial, TeamMember, APIResponse } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include auth header if token exists
if (typeof window !== 'undefined') {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

export const getServices = async (): Promise<APIResponse<Service[]>> => {
  const response = await api.get<APIResponse<Service[]>>('/services');
  return response.data;
};

export const getServiceBySlug = async (slug: string): Promise<APIResponse<Service>> => {
  const response = await api.get<APIResponse<Service>>(`/services/${slug}`);
  return response.data;
};

export const getPortfolio = async (): Promise<APIResponse<Project[]>> => {
  const response = await api.get<APIResponse<Project[]>>('/portfolio');
  return response.data;
};

export const getProjectById = async (id: string): Promise<APIResponse<Project>> => {
  const response = await api.get<APIResponse<Project>>(`/portfolio/${id}`);
  return response.data;
};

export const getTestimonials = async (): Promise<APIResponse<Testimonial[]>> => {
  const response = await api.get<APIResponse<Testimonial[]>>('/testimonials');
  return response.data;
};

export const getTeam = async (): Promise<APIResponse<TeamMember[]>> => {
  const response = await api.get<APIResponse<TeamMember[]>>('/team');
  return response.data;
};

export const submitContact = async (data: {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/contact', data);
  return response.data;
};

export const subscribeNewsletter = async (email: string): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/newsletter', { email });
  return response.data;
};

// Admin API functions
export const getAdminAnalytics = async (): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/admin/analytics');
  return response.data;
};

export const getAdminUsers = async (): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/admin/users');
  return response.data;
};

export const updateUserRole = async (id: string, role: string): Promise<APIResponse<any>> => {
  const response = await api.put<APIResponse<any>>(`/admin/users/${id}/role`, { role });
  return response.data;
};

export const deleteUser = async (id: string): Promise<APIResponse<any>> => {
  const response = await api.delete<APIResponse<any>>(`/admin/users/${id}`);
  return response.data;
};

// Career & HR Portal API functions
export const getJobs = async (): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/jobs');
  return response.data;
};

export const getJobById = async (id: string): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>(`/jobs/${id}`);
  return response.data;
};

export const applyForJob = async (id: string, data: any): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>(`/jobs/${id}/apply`, data);
  return response.data;
};

export const createJob = async (data: any): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/admin/jobs', data);
  return response.data;
};

export const getApplications = async (jobId?: string): Promise<APIResponse<any>> => {
  const url = jobId ? `/admin/applications?jobId=${jobId}` : '/admin/applications';
  const response = await api.get<APIResponse<any>>(url);
  return response.data;
};

export const updateApplicationStatus = async (id: string, status: string): Promise<APIResponse<any>> => {
  const response = await api.put<APIResponse<any>>(`/admin/applications/${id}/status`, { status });
  return response.data;
};

// Employee Portal API functions
export const punchIn = async (): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/employee/punch-in');
  return response.data;
};

export const punchOut = async (): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/employee/punch-out');
  return response.data;
};

export const getAttendanceLogs = async (): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/employee/attendance');
  return response.data;
};

export const requestLeave = async (data: any): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/employee/leaves', data);
  return response.data;
};

export const getLeaves = async (): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/employee/leaves');
  return response.data;
};

export const getSalarySlips = async (): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/employee/salary-slips');
  return response.data;
};

// Admin Leaves & Payroll API functions
export const getAdminLeaves = async (): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/admin/leaves');
  return response.data;
};

export const updateLeaveStatus = async (id: string, status: string): Promise<APIResponse<any>> => {
  const response = await api.put<APIResponse<any>>(`/admin/leaves/${id}/status`, { status });
  return response.data;
};

export const createSalarySlip = async (data: any): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/admin/salary-slips', data);
  return response.data;
};

// Client Portal API functions
export const getClientProjects = async (): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/client/projects');
  return response.data;
};

export const getClientInvoices = async (): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/client/invoices');
  return response.data;
};

export const payInvoice = async (id: string): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>(`/client/invoices/${id}/pay`);
  return response.data;
};

export const getClientTickets = async (): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/client/tickets');
  return response.data;
};

export const createSupportTicket = async (data: any): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/client/tickets', data);
  return response.data;
};

export const replyToTicket = async (id: string, text: string): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>(`/client/tickets/${id}/reply`, { text });
  return response.data;
};

// Admin Client/Project Management API functions
export const getAdminProjects = async (): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/admin/projects');
  return response.data;
};

export const createClientProject = async (data: any): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/admin/projects', data);
  return response.data;
};

export const updateProjectMilestone = async (id: string, milestoneIndex: number, completed: boolean): Promise<APIResponse<any>> => {
  const response = await api.put<APIResponse<any>>(`/admin/projects/${id}/milestones`, { milestoneIndex, completed });
  return response.data;
};

export const getAdminInvoices = async (): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/admin/invoices');
  return response.data;
};

export const createInvoice = async (data: any): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/admin/invoices', data);
  return response.data;
};

export const getAdminTickets = async (): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/admin/tickets');
  return response.data;
};

export const updateTicketStatus = async (id: string, status: string): Promise<APIResponse<any>> => {
  const response = await api.put<APIResponse<any>>(`/admin/tickets/${id}/status`, { status });
  return response.data;
};

// AI Chatbot API functions
export const sendAIChat = async (message: string): Promise<APIResponse<{ reply: string }>> => {
  const response = await api.post<APIResponse<{ reply: string }>>('/ai/chat', { message });
  return response.data;
};

// Sales CRM API functions
export const getCRMEnquiries = async (): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/admin/crm/enquiries');
  return response.data;
};

export const submitCRMEnquiry = async (data: any): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/crm/enquiries', data);
  return response.data;
};

export const updateCRMStatus = async (id: string, status: string): Promise<APIResponse<any>> => {
  const response = await api.put<APIResponse<any>>(`/admin/crm/enquiries/${id}/status`, { status });
  return response.data;
};

export const addCRMFollowUp = async (id: string, note: string): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>(`/admin/crm/enquiries/${id}/followups`, { note });
  return response.data;
};

// Notification API functions
export const getNotifications = async (): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/notifications');
  return response.data;
};

export const markRead = async (id: string): Promise<APIResponse<any>> => {
  const response = await api.put<APIResponse<any>>(`/notifications/${id}/read`);
  return response.data;
};

// Enterprise Blog API functions
export const getBlogs = async (params?: { category?: string; search?: string; tag?: string }): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/blogs', { params });
  return response.data;
};

export const getBlogBySlug = async (slug: string): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>(`/blogs/${slug}`);
  return response.data;
};

export const addBlogComment = async (id: string, data: { authorName: string; text: string }): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>(`/blogs/${id}/comments`, data);
  return response.data;
};

export const likeBlog = async (id: string): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>(`/blogs/${id}/like`);
  return response.data;
};

export const createBlog = async (data: any): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/admin/blogs', data);
  return response.data;
};

export const updateBlog = async (id: string, data: any): Promise<APIResponse<any>> => {
  const response = await api.put<APIResponse<any>>(`/admin/blogs/${id}`, data);
  return response.data;
};

export const deleteBlog = async (id: string): Promise<APIResponse<any>> => {
  const response = await api.delete<APIResponse<any>>(`/admin/blogs/${id}`);
  return response.data;
};

// Enterprise Gallery API functions
export const getGalleryItems = async (category?: string): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/gallery', { params: { category } });
  return response.data;
};

export const createGalleryItem = async (data: any): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/admin/gallery', data);
  return response.data;
};

export const deleteGalleryItem = async (id: string): Promise<APIResponse<any>> => {
  const response = await api.delete<APIResponse<any>>(`/admin/gallery/${id}`);
  return response.data;
};

// Enterprise FAQ API functions
export const getFAQs = async (category?: string): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/faqs', { params: { category } });
  return response.data;
};

export const createFAQ = async (data: any): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/admin/faqs', data);
  return response.data;
};

export const deleteFAQ = async (id: string): Promise<APIResponse<any>> => {
  const response = await api.delete<APIResponse<any>>(`/admin/faqs/${id}`);
  return response.data;
};

// Security Audit Logs
export const getAuditLogs = async (): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/admin/audit-logs');
  return response.data;
};

// OTP & Extra Authentication APIs
export const verifyOTP = async (email: string, otp: string): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/auth/verify-otp', { email, otp });
  return response.data;
};

export const forgotPassword = async (email: string): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (email: string, otp: string, passwordNew: string): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/auth/reset-password', { email, otp, newPassword: passwordNew });
  return response.data;
};

export const updateProfile = async (data: any): Promise<APIResponse<any>> => {
  const response = await api.put<APIResponse<any>>('/auth/profile', data);
  return response.data;
};

// Meeting Scheduler APIs
export const getMeetings = async (): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/meetings');
  return response.data;
};

export const bookMeeting = async (data: any): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/meetings', data);
  return response.data;
};

export const rescheduleMeeting = async (id: string, date: string, time: string): Promise<APIResponse<any>> => {
  const response = await api.put<APIResponse<any>>(`/meetings/${id}/reschedule`, { date, time });
  return response.data;
};

export const cancelMeeting = async (id: string): Promise<APIResponse<any>> => {
  const response = await api.put<APIResponse<any>>(`/meetings/${id}/cancel`);
  return response.data;
};

// AI Features APIs
export const generateProposal = async (data: any): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/ai/proposal', data);
  return response.data;
};

export const generateContent = async (data: any): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/ai/generate-content', data);
  return response.data;
};

export const analyzeResume = async (data: { resumeText: string; candidateName: string; candidateEmail: string }): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/ai/analyze-resume', data);
  return response.data;
};

// Admin RAG / Knowledge Base APIs
export const getKnowledgeBase = async (): Promise<APIResponse<any>> => {
  const response = await api.get<APIResponse<any>>('/admin/knowledge-base');
  return response.data;
};

export const uploadKnowledgeFile = async (formData: FormData): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/admin/knowledge-base/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const scrapeKnowledgeUrl = async (url: string): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>('/admin/knowledge-base/scrape', { url });
  return response.data;
};

export const deleteKnowledgeFile = async (id: string): Promise<APIResponse<any>> => {
  const response = await api.delete<APIResponse<any>>(`/admin/knowledge-base/${id}`);
  return response.data;
};

export const googleLoginAPI = async (data: { email: string; name: string; googleId: string }): Promise<APIResponse<{ token: string; user: any }>> => {
  const response = await api.post<APIResponse<{ token: string; user: any }>>('/auth/google', data);
  return response.data;
};

export default api;
