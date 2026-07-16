import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environmental variables
dotenv.config();

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default ai;
