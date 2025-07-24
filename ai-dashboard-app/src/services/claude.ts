export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FormFields {
  title: string;
  description: string;
  estimatedImpact: string;
}

// Get the API URL based on environment
const getApiUrl = () => {
  // Use Vercel deployment URL for production
  if (import.meta.env.PROD) {
    // This will be set as a GitHub secret
    return import.meta.env.VITE_MARSHAL_API_URL || null;
  }
  
  // Local development
  return '/api/marshal';
};

export const claudeService = {
  async generateFormFields(messages: ChatMessage[]): Promise<FormFields> {
    const apiUrl = getApiUrl();
    if (!apiUrl) {
      throw new Error('AI assistant is currently unavailable. Please deploy the API server or set VITE_API_URL.');
    }
    
    try {
      const response = await fetch(apiUrl, {
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
    const apiUrl = getApiUrl();
    if (!apiUrl) {
      throw new Error('AI assistant is currently unavailable. Please deploy the API server or set VITE_API_URL.');
    }
    
    try {
      const response = await fetch(apiUrl, {
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