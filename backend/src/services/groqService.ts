import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

/**
 * Generate completion text using Groq's chat completions endpoint.
 * Defaults to the `llama-3.3-70b-versatile` model.
 * 
 * @param prompt User prompt / message
 * @param systemPrompt Optional system prompt instructions
 * @param jsonResponse Optional flag to request JSON format response
 * @returns Generated string response from Groq LLM
 */
export const generateGroqCompletion = async (
  prompt: string,
  systemPrompt?: string,
  jsonResponse: boolean = false
): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY || GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API Key is not configured in environment variables.');
  }

  const messages: { role: 'system' | 'user'; content: string }[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const payload: any = {
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  };

  if (jsonResponse) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    payload,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    }
  );

  if (response.data && response.data.choices && response.data.choices[0]) {
    return response.data.choices[0].message.content || '';
  }

  throw new Error('Could not parse response from Groq API');
};
