import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // CRITICAL: Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transcriptionText } = await req.json();

    if (!transcriptionText || typeof transcriptionText !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing transcriptionText' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Get Google AI API Key
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    if (!GOOGLE_API_KEY) {
      throw new Error('Google AI API Key not configured.');
    }

    // Call Google AI for title generation
    const modelId = 'gemini-1.5-flash-latest';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GOOGLE_API_KEY}`;

    const prompt = `Generate a concise, descriptive title (3-7 words) for the following text. The title should be in the same language as the text. Only provide the title, no extra text or quotes.

Text: "${transcriptionText}"

Title:`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2, // A bit of creativity, but still focused
          maxOutputTokens: 50,
        }
      })
    });

    const jsonResponse = await response.json();

    if (!response.ok || jsonResponse.error) {
      console.error("Google AI Title Generation Error:", jsonResponse.error || jsonResponse);
      throw new Error(`AI title generation failed: ${jsonResponse.error?.message || 'Unknown error'}`);
    }

    let title = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Untitled Note';
    
    // Clean up the title (remove quotes if present)
    title = title.replace(/^["']|["']$/g, '');
    
    // Ensure title is not too long
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }

    return new Response(JSON.stringify({ title }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Title Generation Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unknown error occurred during title generation' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});