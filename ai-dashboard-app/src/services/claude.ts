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
  // In production, you'll need to deploy your Express server and update this URL
  if (import.meta.env.PROD) {
    // For GitHub Pages, either:
    // 1. Deploy server to Heroku/Render and use: 'https://your-server.herokuapp.com/api/marshal'
    // 2. Or return null to disable the feature
    return null; // Disabled for GitHub Pages until server is deployed
  }
  return '/api/marshal';
};

export const claudeService = {
  async generateFormFields(messages: ChatMessage[]): Promise<FormFields> {
    const apiUrl = getApiUrl();
    if (!apiUrl) {
      throw new Error('AI assistant is not available in this environment');
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
      throw new Error('AI assistant is not available in this environment');
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