export interface FAQ {
  question: string;
  answer: string;
}

export interface Service {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  shortDesc: string;
  longDesc?: string;
  features?: string[];
  benefits?: string[];
  techStack?: string[];
  faqs?: FAQ[];
  createdAt?: string;
  updatedAt?: string;
}

export interface KPI {
  label: string;
  value: string;
}

export interface ClientFeedback {
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerRole: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface Project {
  _id: string;
  title: string;
  slug: string;
  category: Category;
  description: string;
  images: string[];
  challenge: string;
  solution: string;
  kpis: KPI[];
  clientFeedback: ClientFeedback;
  technologies: string[];
  clientName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Testimonial {
  _id: string;
  clientName: string;
  role: string;
  company: string;
  text: string;
  rating: number;
  videoUrl?: string;
  avatar: string;
  createdAt?: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  socials: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  order: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'client' | 'candidate' | 'user';
  phone?: string;
  title?: string;
  department?: string;
  companyName?: string;
  avatar?: string;
  bio?: string;
  address?: string;
  skills?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}
