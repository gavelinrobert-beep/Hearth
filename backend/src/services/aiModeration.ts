import axios from 'axios';

interface ModerationResult {
  shouldBlock: boolean;
  reason?: string;
  toxicityScore?: number;
}

const LLAMA_API_URL = process.env.LLAMA_API_URL || 'http://localhost:11434';

export async function moderateContent(content: string): Promise<ModerationResult> {
  try {
    // If Llama API is not configured, skip moderation
    if (!LLAMA_API_URL || process.env.NODE_ENV === 'development') {
      return { shouldBlock: false };
    }

    const prompt = `You are a content moderation AI. Analyze the following message and determine if it contains:
- Hate speech or discrimination
- Harassment or bullying
- Explicit sexual content
- Violence or threats
- Spam or scams
- Personal information (doxxing)

Message: "${content}"

Respond in JSON format:
{
  "shouldBlock": true/false,
  "reason": "brief explanation if blocked",
  "toxicityScore": 0-100
}`;

    const response = await axios.post(
      `${LLAMA_API_URL}/api/generate`,
      {
        model: 'llama3',
        prompt,
        stream: false,
        format: 'json',
      },
      {
        timeout: 5000,
      }
    );

    if (response.data && response.data.response) {
      try {
        const result = JSON.parse(response.data.response);
        return {
          shouldBlock: result.shouldBlock || false,
          reason: result.reason,
          toxicityScore: result.toxicityScore,
        };
      } catch (parseError) {
        console.error('Failed to parse moderation response:', parseError);
        return { shouldBlock: false };
      }
    }

    return { shouldBlock: false };
  } catch (error) {
    console.error('Content moderation error:', error);
    // Fail open - don't block if moderation fails
    return { shouldBlock: false };
  }
}

export async function getAIResponse(prompt: string, context?: string): Promise<string> {
  try {
    if (!LLAMA_API_URL) {
      return 'AI assistant is not configured.';
    }

    const fullPrompt = context
      ? `Context: ${context}\n\nUser: ${prompt}\n\nAssistant:`
      : `User: ${prompt}\n\nAssistant:`;

    const response = await axios.post(
      `${LLAMA_API_URL}/api/generate`,
      {
        model: 'llama3',
        prompt: fullPrompt,
        stream: false,
      },
      {
        timeout: 10000,
      }
    );

    if (response.data && response.data.response) {
      return response.data.response.trim();
    }

    return 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('AI response error:', error);
    return 'AI assistant is currently unavailable.';
  }
}
