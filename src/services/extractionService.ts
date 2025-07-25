// Get your Supabase URL and anon key
const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('VITE_SUPABASE_ANON_KEY');

export async function callExtractionService(
  imageBase64: string,
  prompt: string
): Promise<any> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase URL or anon key not configured');
  }

  const model = Deno.env.get('VITE_OPENAI_MODEL') || 'gpt-4o-mini';
  const max_tokens = parseInt(Deno.env.get('VITE_OPENAI_MAX_TOKENS') || '4000', 10);
  const temperature = parseFloat(Deno.env.get('VITE_OPENAI_TEMPERATURE') || '0.1');

  const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-proxy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageBase64,
      prompt,
      model,
      max_tokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to call extraction service');
  }

  return response.json();
}
