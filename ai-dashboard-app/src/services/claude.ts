const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FormFields {
  title: string;
  description: string;
  estimatedImpact: string;
}

const SYSTEM_PROMPT = `You are Marshal, an AI assistant for Ascendco Health helping users submit AI project requests. Your goal is to gather comprehensive information about their AI initiative through a friendly conversation.

You should ask about:
1. The core problem or opportunity they're addressing
2. The specific goals and desired outcomes
3. How this will impact their department and patients/staff
4. Any technical requirements or constraints they've considered
5. The urgency and timeline expectations

Keep the conversation natural and professional. Ask follow-up questions to get clarity. Once you have enough information, you'll help generate a clear title, detailed description, and impact assessment for their request.

Important: Be concise but thorough. Healthcare professionals are busy, so make each question count.`;

export const claudeService = {
  async generateFormFields(messages: ChatMessage[]): Promise<FormFields> {
    try {
      const response = await fetch('/api/marshal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          type: 'generate'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Marshal API error response:', response.status, errorText);
        throw new Error(`Marshal API request failed: ${response.status}`);
      }

      const formFields = await response.json();
      console.log('Marshal API response for form generation:', formFields);
      return formFields;
    } catch (error) {
      console.error('Marshal API error:', error);
      throw error;
    }
  },

  async getChatResponse(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch('/api/marshal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          type: 'chat'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Marshal API error response:', response.status, errorText);
        throw new Error(`Marshal API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Marshal API response:', data);
      return data.response;
    } catch (error) {
      console.error('Marshal API error:', error);
      throw error;
    }
  }
};