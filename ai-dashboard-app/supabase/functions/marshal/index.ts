import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  type: 'chat' | 'generate';
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, type }: RequestBody = await req.json()
    
    // Get Anthropic API key from environment
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Anthropic API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

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
      return new Response(
        JSON.stringify({ error: `Anthropic API error: ${response.status}` }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
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
        
        return new Response(
          JSON.stringify(cleanedFields),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )
      } catch (error) {
        console.error('JSON parsing error:', error);
        // Fallback if JSON parsing fails
        return new Response(
          JSON.stringify({
            title: 'AI Initiative Request',
            description: data.content[0].text,
            estimatedImpact: 'To be determined based on further analysis'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )
      }
    } else {
      // Return chat response
      return new Response(
        JSON.stringify({ response: data.content[0].text }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})