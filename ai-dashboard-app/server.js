import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://sjpathak2211.github.io'
  ],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint for monitoring/pinging
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI Dashboard Marshal API'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Dashboard Marshal API Server',
    health: '/health',
    endpoints: ['/api/marshal']
  });
});

const SYSTEM_PROMPT = `You are Marshal, an AI assistant for Ascendco Health helping users submit AI project requests. Your goal is to gather comprehensive information about their AI initiative through a friendly conversation.

You should ask about:
1. The core problem or opportunity they're addressing
2. The specific goals and desired outcomes
3. How this will impact their department and patients/staff
4. Any technical requirements or constraints they've considered
5. The urgency and timeline expectations

Keep the conversation natural and professional. Ask follow-up questions to get clarity. Once you have enough information, you'll help generate a clear title, detailed description, and impact assessment for their request.

Important: Be concise but thorough. Healthcare professionals are busy, so make each question count.`;

app.post('/api/marshal', async (req, res) => {
  const { messages, type } = req.body;
  const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Anthropic API key not configured' });
  }

  try {
    let requestBody;
    
    if (type === 'generate') {
      // Form generation request
      requestBody = {
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1000,
        temperature: 0.7,
        system: SYSTEM_PROMPT,
        messages: [
          ...messages,
          {
            role: 'user',
            content: `Based on our conversation above, generate a JSON object with exactly these three fields:

{
  "title": "A clear, concise project title (max 100 characters)",
  "description": "A comprehensive description of the AI initiative, its goals, and implementation approach", 
  "estimatedImpact": "The expected benefits, metrics, and value to the organization"
}

Make sure all field values are strings. Respond with ONLY the JSON object, no markdown formatting or additional text.`
          }
        ]
      };
    } else {
      // Regular chat request
      requestBody = {
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 500,
        temperature: 0.7,
        system: SYSTEM_PROMPT,
        messages: messages
      };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return res.status(500).json({ error: `Anthropic API error: ${response.status}` });
    }

    const data = await response.json();
    
    if (type === 'generate') {
      // Try to parse as JSON for form generation
      try {
        const formFields = JSON.parse(data.content[0].text);
        // Ensure all fields are strings
        const cleanedFields = {
          title: String(formFields.title || 'AI Initiative Request'),
          description: String(formFields.description || data.content[0].text),
          estimatedImpact: String(formFields.estimatedImpact || 'To be determined based on further analysis')
        };
        console.log('Parsed form fields:', cleanedFields);
        res.json(cleanedFields);
      } catch (error) {
        console.error('JSON parsing error:', error);
        console.log('Raw response:', data.content[0].text);
        // Fallback if JSON parsing fails
        res.json({
          title: 'AI Initiative Request',
          description: data.content[0].text,
          estimatedImpact: 'To be determined based on further analysis'
        });
      }
    } else {
      // Return chat response
      res.json({ response: data.content[0].text });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Marshal API server running on http://localhost:${PORT}`);
});