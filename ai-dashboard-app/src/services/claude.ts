export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FormFields {
  title: string;
  description: string;
  estimatedImpact: string;
}

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