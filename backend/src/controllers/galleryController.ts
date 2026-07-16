import { Request, Response, NextFunction } from 'express';
import { GalleryItem } from '../models/GalleryItem';
import { logAuditEvent } from '../utils/auditLogger';
import { z } from 'zod';

const galleryItemSchema = z.object({
  title: z.string().min(2),
  url: z.string().min(5),
  type: z.enum(['image', 'video']),
  category: z.string(),
  description: z.string().optional()
});

export const getGalleryItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category } = req.query;
    let query: any = {};
    if (category) {
      query.category = String(category);
    }
    const items = await GalleryItem.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const createGalleryItem = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = galleryItemSchema.parse(req.body);
    const item = new GalleryItem(validatedData);
    await item.save();

    await logAuditEvent(
      req.user.userId,
      req.user.name || 'Outpro Admin',
      'add_gallery_item',
      `Uploaded media: "${validatedData.title}" (${validatedData.type})`
    );

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.errors });
      return;
    }
    next(error);
  }
};

export const deleteGalleryItem = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await GalleryItem.findByIdAndDelete(id);

    if (!item) {
      res.status(404).json({ success: false, message: 'Gallery item not found' });
      return;
    }

    await logAuditEvent(
      req.user.userId,
      req.user.name || 'Outpro Admin',
      'delete_gallery_item',
      `Deleted media: "${item.title}"`
    );

    res.status(200).json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (error) {
    next(error);
  }
};
