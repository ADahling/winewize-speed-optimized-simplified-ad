import type { MenuItem, Wine } from './types.ts';

export const processImageForAnalysis = async (
  imageBase64: string,
  analysisType: string
): Promise<any> => {
  console.log(`Processing image for ${analysisType} analysis...`);

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `
  Analyze the text extracted from the image and identify ${analysisType === 'menu' ? 'menu items' : 'wines'}.
  
  For menu items, extract the dish name, description, price, and type of dish.
  For wines, extract the name, vintage, varietal, region, price, and description.
  
  Return the data in JSON format.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert data extractor. You will receive text from an image and extract specific data based on the instructions. Return a JSON array of objects.'
        },
        {
          role: 'user',
          content: `${prompt}\n\nImage Text:\n${imageBase64}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    const parsedData = JSON.parse(content);
    console.log(`Successfully parsed ${analysisType} data`);
    return parsedData;
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    console.error('Raw response content:', content);
    throw new Error(`Failed to parse OpenAI response: ${error.message}`);
  }
};
