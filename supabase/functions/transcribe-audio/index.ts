import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // CRITICAL: Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audioDataUri, durationSeconds, userId } = await req.json();

    if (!audioDataUri || typeof durationSeconds !== 'number' || !userId) {
      return new Response(JSON.stringify({ error: 'Missing audioDataUri, durationSeconds, or userId' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Parse the Data URI
    const base64Data = audioDataUri.split(',')[1]; // Get base64 string
    const mimeType = audioDataUri.split(';')[0].split(':')[1]; // Get mime type

    if (!base64Data) {
      return new Response(JSON.stringify({ error: 'Invalid audio data format' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Get Google AI API Key
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    if (!GOOGLE_API_KEY) {
      throw new Error('Google AI API Key not configured.');
    }

    // Call Google AI for transcription
    const modelId = 'gemini-1.5-flash-latest';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GOOGLE_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Please transcribe the following audio accurately. Only provide the transcription text, no additional commentary:" },
            { inlineData: { mimeType: mimeType, data: base64Data } }
          ]
        }],
        generationConfig: {
          temperature: 0.0, // For precise transcription
          maxOutputTokens: 2048,
        }
      })
    });

    const jsonResponse = await response.json();

    if (!response.ok || jsonResponse.error) {
      console.error("Google AI Transcription Error:", jsonResponse.error || jsonResponse);
      throw new Error(`AI transcription failed: ${jsonResponse.error?.message || 'Unknown error'}`);
    }

    const transcription = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!transcription) {
      throw new Error('No transcription received from AI');
    }

    return new Response(JSON.stringify({ transcription }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Transcription Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unknown error occurred during transcription' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});