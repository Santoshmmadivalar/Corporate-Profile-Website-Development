import { Request, Response, NextFunction } from 'express';
import { KnowledgeBase } from '../models/KnowledgeBase';
import { parseFile, chunkText } from '../services/ragService';
import axios from 'axios';

export const getKnowledgeBase = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const documents = await KnowledgeBase.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const { originalname, buffer } = req.file;
    const fileExtension = originalname.split('.').pop()?.toLowerCase() || '';
    
    let fileType: 'pdf' | 'docx' | 'txt' | 'pptx' = 'txt';
    if (fileExtension === 'pdf') fileType = 'pdf';
    else if (fileExtension === 'docx') fileType = 'docx';
    else if (fileExtension === 'pptx') fileType = 'pptx';

    // Parse file contents
    const textContent = await parseFile(buffer, fileType);
    if (!textContent || textContent.trim() === '') {
      res.status(400).json({ success: false, message: 'Could not extract text from document.' });
      return;
    }

    // Chunk text
    const chunks = chunkText(textContent);

    const doc = new KnowledgeBase({
      title: originalname,
      fileType,
      content: textContent,
      chunks
    });

    await doc.save();

    res.status(201).json({
      success: true,
      message: `Document "${originalname}" parsed and added to Knowledge Base`,
      data: doc
    });
  } catch (error: any) {
    next(error);
  }
};

export const scrapeWebsite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ success: false, message: 'URL is required' });
      return;
    }

    // Attempt to scrape page content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 OutproBot/1.0'
      },
      timeout: 8000
    });

    const html = response.data;
    
    // Strip HTML tags using simple regex for robustness
    let text = html
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (text.length > 50000) {
      // Crop extremely large files to prevent database saturation
      text = text.substring(0, 50000);
    }

    if (!text || text.trim() === '') {
      res.status(400).json({ success: false, message: 'Could not scrape text content from webpage.' });
      return;
    }

    const chunks = chunkText(text);

    const doc = new KnowledgeBase({
      title: url,
      fileType: 'url',
      content: text,
      chunks
    });

    await doc.save();

    res.status(201).json({
      success: true,
      message: `Webpage scraped and added to Knowledge Base`,
      data: doc
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: `Scrape execution failed: ${error.message}`
    });
  }
};

export const deleteDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await KnowledgeBase.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Knowledge Base document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
