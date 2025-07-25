export function parseOpenAIResponse(responseText: string): any {
  try {
    console.log('🔍 Parsing OpenAI response, length:', responseText.length);
    console.log('📝 First 200 chars:', responseText.substring(0, 200));
    
    // Clean the response text
    const cleanedText = responseText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    
    const parsed = JSON.parse(cleanedText);
    console.log('✅ Successfully parsed OpenAI response');
    console.log('📋 Parsed structure:', JSON.stringify(parsed, null, 2).substring(0, 500));
    return parsed;
  } catch (error) {
    console.error('❌ Failed to parse OpenAI response:', error);
    console.error('📄 Raw response (first 1000 chars):', responseText.substring(0, 1000));
    console.error('🧹 Cleaned text (first 1000 chars):', cleanedText?.substring(0, 1000));
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}
