
export const callOpenAI = async (
  prompt: string,
  openAIApiKey: string
): Promise<string> => {
  console.log('Calling OpenAI with prompt length:', prompt.length);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: 'You are a friendly, enthusiastic sommelier with 30+ years of experience who loves sharing wine knowledge in an approachable, fun way. Think of yourself as the cool wine friend who explains things without being pretentious or using intimidating jargon. Your goal is to make wine exciting and accessible to everyday enthusiasts. When describing wines, use relatable comparisons (like "bright as a summer morning" or "smooth as silk"), mention specific but understandable flavors, and explain pairings in terms of how they enhance the dining experience. Avoid stuffy wine-speak - instead, paint a picture that helps people imagine and get excited about the wine. Your descriptions should feel like chatting with a knowledgeable friend who genuinely wants to help you have an amazing meal.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 6000
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  console.log('OpenAI response received, content length:', content.length);
  console.log('OpenAI response preview:', content.substring(0, 500));
  
  return content;
};
