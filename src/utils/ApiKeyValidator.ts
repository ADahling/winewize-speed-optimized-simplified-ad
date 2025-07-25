import { logger } from './logger'

interface ApiKeyStatus {
  isValid: boolean
  service: string
  error?: string
}

export class ApiKeyValidator {
  private static readonly API_KEY_PATTERNS = {
    openai: /^sk-[A-Za-z0-9]{48}$/,
    perplexity: /^pplx-[A-Za-z0-9]{48}$/,
    spoonacular: /^[a-f0-9]{32}$/
  }

  static validateOpenAIKey(key: string): ApiKeyStatus {
    if (!key) {
      return { isValid: false, service: 'OpenAI', error: 'API key is required' }
    }
    
    if (key === 'demo-key') {
      logger.info('Using demo mode for OpenAI', {}, 'ApiKeyValidator')
      return { isValid: true, service: 'OpenAI' }
    }

    if (!this.API_KEY_PATTERNS.openai.test(key)) {
      return { 
        isValid: false, 
        service: 'OpenAI', 
        error: 'Invalid OpenAI API key format. Should start with "sk-"' 
      }
    }

    return { isValid: true, service: 'OpenAI' }
  }

  static validatePerplexityKey(key: string): ApiKeyStatus {
    if (!key || key === 'demo-key') {
      logger.info('Perplexity API key not configured', {}, 'ApiKeyValidator')
      return { isValid: false, service: 'Perplexity', error: 'Optional service not configured' }
    }

    if (!this.API_KEY_PATTERNS.perplexity.test(key)) {
      return { 
        isValid: false, 
        service: 'Perplexity', 
        error: 'Invalid Perplexity API key format. Should start with "pplx-"' 
      }
    }

    return { isValid: true, service: 'Perplexity' }
  }

  static validateSpoonacularKey(key: string): ApiKeyStatus {
    if (!key || key === 'demo-key') {
      logger.info('Spoonacular API key not configured', {}, 'ApiKeyValidator')
      return { isValid: false, service: 'Spoonacular', error: 'Optional service not configured' }
    }

    if (!this.API_KEY_PATTERNS.spoonacular.test(key)) {
      return { 
        isValid: false, 
        service: 'Spoonacular', 
        error: 'Invalid Spoonacular API key format. Should be 32 hexadecimal characters' 
      }
    }

    return { isValid: true, service: 'Spoonacular' }
  }

  static validateAllKeys(): { 
    allValid: boolean, 
    required: ApiKeyStatus[], 
    optional: ApiKeyStatus[] 
  } {
    const openaiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY || ''
    const perplexityKey = (import.meta as any).env?.VITE_PERPLEXITY_API_KEY || ''
    const spoonacularKey = (import.meta as any).env?.VITE_SPOONACULAR_API_KEY || ''

    const openaiStatus = this.validateOpenAIKey(openaiKey)
    const perplexityStatus = this.validatePerplexityKey(perplexityKey)
    const spoonacularStatus = this.validateSpoonacularKey(spoonacularKey)

    return {
      allValid: openaiStatus.isValid,
      required: [openaiStatus],
      optional: [perplexityStatus, spoonacularStatus]
    }
  }

  static async testApiKey(service: 'openai' | 'perplexity' | 'spoonacular', key: string): Promise<boolean> {
    try {
      switch (service) {
        case 'openai':
          // Test OpenAI key with a simple completion
          const response = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${key}` }
          })
          return response.ok
          
        case 'perplexity':
          // Test Perplexity key
          const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'pplx-7b-online',
              messages: [{ role: 'user', content: 'test' }],
              max_tokens: 1
            })
          })
          return perplexityResponse.ok
          
        case 'spoonacular':
          // Test Spoonacular key
          const spoonacularResponse = await fetch(
            `https://api.spoonacular.com/food/wine/recommendation?apiKey=${key}&wine=merlot&maxPrice=1`
          )
          return spoonacularResponse.ok
          
        default:
          return false
      }
    } catch (error) {
      logger.error(`Failed to test ${service} API key`, error, 'ApiKeyValidator')
      return false
    }
  }
} 
