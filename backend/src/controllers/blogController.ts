import { Request, Response, NextFunction } from 'express';
import { Blog } from '../models/Blog';
import { logAuditEvent } from '../utils/auditLogger';
import { z } from 'zod';

const blogCreateSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  content: z.string().min(10),
  summary: z.string().min(5),
  author: z.string().optional(),
  category: z.string(),
  tags: z.array(z.string()).optional(),
  image: z.string().optional(),
  featured: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional()
});

export const getBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, search, tag } = req.query;
    let query: any = {};

    if (category) {
      query.category = String(category);
    }
    if (tag) {
      query.tags = String(tag);
    }
    if (search) {
      query.$or = [
        { title: { $regex: String(search), $options: 'i' } },
        { summary: { $regex: String(search), $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog article not found' });
      return;
    }

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = blogCreateSchema.parse(req.body);
    
    // Check if slug is unique
    const existing = await Blog.findOne({ slug: validatedData.slug });
    if (existing) {
      res.status(400).json({ success: false, message: 'Slug must be unique' });
      return;
    }

    const newBlog = new Blog(validatedData);
    await newBlog.save();

    // Log security audit trail
    await logAuditEvent(
      req.user.userId,
      req.user.name || 'Outpro Admin',
      'create_blog',
      `Published new blog post: "${validatedData.title}"`
    );

    res.status(201).json({ success: true, data: newBlog });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.errors });
      return;
    }
    next(error);
  }
};

export const updateBlog = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = blogCreateSchema.partial().parse(req.body);

    const updatedBlog = await Blog.findByIdAndUpdate(id, validatedData, { new: true });
    if (!updatedBlog) {
      res.status(404).json({ success: false, message: 'Blog not found' });
      return;
    }

    await logAuditEvent(
      req.user.userId,
      req.user.name || 'Outpro Admin',
      'update_blog',
      `Updated blog post: "${updatedBlog.title}"`
    );

    res.status(200).json({ success: true, data: updatedBlog });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.errors });
      return;
    }
    next(error);
  }
};

export const deleteBlog = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog not found' });
      return;
    }

    await logAuditEvent(
      req.user.userId,
      req.user.name || 'Outpro Admin',
      'delete_blog',
      `Deleted blog post: "${blog.title}"`
    );

    res.status(200).json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { authorName, text } = req.body;

    if (!authorName || !text) {
      res.status(400).json({ success: false, message: 'Author name and comment text are required' });
      return;
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog not found' });
      return;
    }

    blog.comments.push({
      authorName,
      text,
      date: new Date()
    });

    await blog.save();
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

export const likeBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });

    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog not found' });
      return;
    }

    res.status(200).json({ success: true, data: { likes: blog.likes } });
  } catch (error) {
    next(error);
  }
};
