import axios from 'axios';

/**
 * AI Service for AI Bot Responses
 * Integrates with Ollama (local) and optionally Claude (cloud) for AI-powered assistance
 */

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  response: string;
  error?: string;
}

/**
 * Generate AI response using Ollama (local)
 * @param message - User message to respond to
 * @param context - Optional conversation context
 * @returns AI-generated response
 */
export async function generateAIResponseWithOllama(
  message: string,
  context?: AIMessage[]
): Promise<AIResponse> {
  try {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content:
          'You are a helpful AI assistant in a Discord-like chat application called Hearth. ' +
          'Be friendly, concise, and helpful. Keep responses under 200 words unless asked for more detail.',
      },
      ...(context || []),
      {
        role: 'user',
        content: message,
      },
    ];

    const response = await axios.post(
      `${OLLAMA_URL}/api/chat`,
      {
        model: 'llama3',
        messages,
        stream: false,
      },
      {
        timeout: 30000, // 30 second timeout
      }
    );

    return {
      response: response.data.message.content,
    };
  } catch (error: any) {
    console.error('Ollama AI error:', error.message);
    
    // If Ollama fails and we have Anthropic key, try Claude as fallback
    if (ANTHROPIC_API_KEY) {
      return generateAIResponseWithClaude(message, context);
    }
    
    return {
      response: "I'm having trouble connecting to the AI service right now. Please try again later.",
      error: error.message,
    };
  }
}

/**
 * Generate AI response using Claude (cloud fallback)
 * @param message - User message to respond to
 * @param context - Optional conversation context
 * @returns AI-generated response
 */
export async function generateAIResponseWithClaude(
  message: string,
  context?: AIMessage[]
): Promise<AIResponse> {
  if (!ANTHROPIC_API_KEY) {
    return {
      response: 'Cloud AI is not configured.',
      error: 'No API key',
    };
  }

  try {
    const messages = [
      ...(context || []).filter((m) => m.role !== 'system'),
      {
        role: 'user',
        content: message,
      },
    ];

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        system:
          'You are a helpful AI assistant in a Discord-like chat application called Hearth. ' +
          'Be friendly, concise, and helpful. Keep responses under 200 words unless asked for more detail.',
        messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        timeout: 30000,
      }
    );

    return {
      response: response.data.content[0].text,
    };
  } catch (error: any) {
    console.error('Claude AI error:', error.message);
    return {
      response: "I'm having trouble connecting to the AI service right now. Please try again later.",
      error: error.message,
    };
  }
}

/**
 * Main function to generate AI response
 * Automatically tries Ollama first, then falls back to Claude if available
 * @param message - User message content
 * @param context - Optional conversation history
 * @returns AI-generated response
 */
export async function generateAIResponse(
  message: string,
  context?: AIMessage[]
): Promise<AIResponse> {
  // Try Ollama first (local and free)
  return generateAIResponseWithOllama(message, context);
}

/**
 * Stream AI response (for real-time streaming via WebSocket)
 * @param message - User message to respond to
 * @param onChunk - Callback for each chunk of the response
 */
export async function streamAIResponse(
  message: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    const response = await axios.post(
      `${OLLAMA_URL}/api/chat`,
      {
        model: 'llama3',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful AI assistant in a Discord-like chat application called Hearth. ' +
              'Be friendly, concise, and helpful.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        stream: true,
      },
      {
        responseType: 'stream',
        timeout: 30000,
      }
    );

    response.data.on('data', (chunk: Buffer) => {
      try {
        const lines = chunk.toString().split('\n').filter((line) => line.trim());
        for (const line of lines) {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            onChunk(parsed.message.content);
          }
        }
      } catch (error) {
        console.error('Stream parsing error:', error);
      }
    });

    return new Promise((resolve, reject) => {
      response.data.on('end', resolve);
      response.data.on('error', reject);
    });
  } catch (error: any) {
    console.error('Stream AI error:', error.message);
    onChunk("I'm having trouble connecting to the AI service right now.");
  }
}
