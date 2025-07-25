// NOTE: All CORS logic is centralized in '../_shared/cors.ts'.
// Do NOT hardcode CORS headers in this file. Use getCorsHeaders(origin) for all responses.
import '../_shared/deno-types.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getCorsHeaders } from '../_shared/cors.ts'

// Enhanced in-memory cache for the edge function
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Parse "City, State" format searches with enhanced logic
const parseLocationQuery = (query: string) => {
  const parts = query.split(',').map(part => part.trim());
  if (parts.length >= 2) {
    return {
      city: parts[0],
      state: parts[1],
      isComposite: true
    };
  }
  return {
    city: query.trim(),
    state: null,
    isComposite: false
  };
};

// State abbreviation expansion
const expandStateAbbreviation = (state: string): string[] => {
  const stateMap: Record<string, string> = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
  };
  
  const normalizedState = state.toUpperCase();
  const variations = [state];
  
  if (stateMap[normalizedState]) {
    variations.push(stateMap[normalizedState]);
  } else {
    // Look for reverse mapping (full name to abbreviation)
    const abbrev = Object.keys(stateMap).find(key => 
      stateMap[key].toLowerCase() === state.toLowerCase()
    );
    if (abbrev) {
      variations.push(abbrev);
    }
  }
  
  return variations;
};

// Enhanced GeoDB API request with multiple search strategies
const makeGeoDbRequest = async (searchTerm: string, searchType: string, rapidApiKey: string) => {
  let geoDbUrl;
  
  switch (searchType) {
    case 'exact':
      geoDbUrl = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(searchTerm)}&limit=15&minPopulation=1000&sort=-population`;
      break;
    case 'prefix':
      geoDbUrl = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(searchTerm)}&limit=15&sort=-population`;
      break;
    case 'contains':
      // Use the name prefix with partial matching for broader results
      geoDbUrl = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(searchTerm.substring(0, 3))}&limit=50&sort=-population`;
      break;
    case 'fuzzy':
      // Broader search for fuzzy matching
      geoDbUrl = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=100&sort=-population`;
      break;
    default:
      geoDbUrl = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(searchTerm)}&limit=15&sort=-population`;
  }

  const requestHeaders = {
    'X-RapidAPI-Key': rapidApiKey,
    'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
  };

  console.log(`🔍 Making ${searchType} request to: ${geoDbUrl}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(geoDbUrl, {
      headers: requestHeaders,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    console.log(`📡 API Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error ${response.status}: ${errorText}`);
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`❌ Request failed:`, error);
    throw error;
  }
};

// Multi-strategy search implementation
const performMultiStrategySearch = async (query: string, rapidApiKey: string) => {
  const parsed = parseLocationQuery(query);
  const strategies = ['exact', 'prefix', 'contains'];
  let allResults: any[] = [];
  
  console.log(`🎯 Performing multi-strategy search for: "${query}"`);
  console.log(`📋 Parsed query:`, parsed);

  for (const strategy of strategies) {
    try {
      console.log(`🔍 Trying ${strategy} strategy...`);
      
      let searchTerm = parsed.city;
      if (strategy === 'exact' && parsed.isComposite) {
        searchTerm = `${parsed.city}`;
      }
      
      const response = await makeGeoDbRequest(searchTerm, strategy, rapidApiKey);
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        console.log(`✅ ${strategy} strategy found ${data.data.length} results`);
        
        // Filter results based on state if provided
        let filteredResults = data.data;
        if (parsed.isComposite && parsed.state) {
          const stateVariations = expandStateAbbreviation(parsed.state);
          filteredResults = data.data.filter((city: any) => {
            const region = (city.region || '').toLowerCase();
            const regionCode = (city.regionCode || '').toLowerCase();
            return stateVariations.some(stateVar => 
              region.includes(stateVar.toLowerCase()) || 
              regionCode.includes(stateVar.toLowerCase())
            );
          });
          console.log(`🎯 Filtered to ${filteredResults.length} results matching state "${parsed.state}"`);
        }
        
        // For contains strategy, filter by city name match
        if (strategy === 'contains') {
          filteredResults = filteredResults.filter((city: any) => 
            city.name.toLowerCase().includes(parsed.city.toLowerCase())
          );
          console.log(`🎯 Name-filtered to ${filteredResults.length} results for contains strategy`);
        }
        
        allResults = allResults.concat(filteredResults);
        
        // If we have good results, we can stop early for exact/prefix
        if ((strategy === 'exact' || strategy === 'prefix') && filteredResults.length >= 5) {
          console.log(`🏁 Early termination: Found sufficient results with ${strategy} strategy`);
          break;
        }
      } else {
        console.log(`📭 ${strategy} strategy returned no results`);
      }
    } catch (error) {
      console.error(`❌ ${strategy} strategy failed:`, error);
      // Continue with next strategy
    }
  }
  
  return allResults;
};

// Enhanced result processing and ranking with deduplication
const processAndRankResults = (cities: any[], searchQuery: string) => {
  const normalizedQuery = searchQuery.toLowerCase();
  const parsed = parseLocationQuery(searchQuery);
  
  // Deduplicate by city name and region combination
  const uniqueResults = new Map();
  
  cities.forEach((city: any) => {
    const key = `${city.name.toLowerCase()}_${(city.region || '').toLowerCase()}_${city.country}`;
    if (!uniqueResults.has(key) || city.population > (uniqueResults.get(key).population || 0)) {
      uniqueResults.set(key, city);
    }
  });
  
  const deduplicatedCities = Array.from(uniqueResults.values());
  console.log(`🧹 Deduplicated from ${cities.length} to ${deduplicatedCities.length} results`);
  
  return deduplicatedCities.map((city: any) => {
    // Better region handling
    const region = city.region || city.regionCode || '';
    const country = city.country || '';
    
    // Create display name with proper formatting
    let displayName = city.name;
    if (region && region !== country) {
      displayName += `, ${region}`;
    }
    if (country) {
      displayName += `, ${country}`;
    }
    
    // Calculate enhanced relevance score
    let relevanceScore = 0;
    const cityNameLower = city.name.toLowerCase();
    
    // Exact match gets highest score
    if (cityNameLower === normalizedQuery || cityNameLower === parsed.city.toLowerCase()) {
      relevanceScore = 100;
    } else if (cityNameLower.startsWith(parsed.city.toLowerCase())) {
      relevanceScore = 90;
    } else if (cityNameLower.includes(parsed.city.toLowerCase())) {
      relevanceScore = 70;
    } else {
      relevanceScore = 50;
    }
    
    // Bonus for population (major cities)
    if (city.population > 1000000) relevanceScore += 20;
    else if (city.population > 500000) relevanceScore += 15;
    else if (city.population > 100000) relevanceScore += 10;
    else if (city.population > 50000) relevanceScore += 5;
    
    // For composite searches, check if state/region matches
    if (parsed.isComposite && parsed.state) {
      const stateVariations = expandStateAbbreviation(parsed.state);
      const regionLower = region.toLowerCase();
      const regionCodeLower = (city.regionCode || '').toLowerCase();
      
      if (stateVariations.some(stateVar => 
        regionLower.includes(stateVar.toLowerCase()) || 
        regionCodeLower.includes(stateVar.toLowerCase())
      )) {
        relevanceScore += 30;
      }
    }
    
    // Bonus for US cities (assuming English interface)
    if (country === 'United States of America' || city.countryCode === 'US') {
      relevanceScore += 10;
    }
    
    return {
      id: city.id,
      name: city.name,
      region: region,
      country: country,
      countryCode: city.countryCode,
      displayName: displayName,
      population: city.population || 0,
      relevanceScore: relevanceScore
    };
  })
  // Sort by relevance score, then by population
  .sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return b.population - a.population;
  })
  // Take top results
  .slice(0, 15);
};

serve(async (req) => {
  console.log('🚀 get-cities function called with enhanced multi-strategy search')
  const origin = req.headers.get('origin') || 'https://wine-wize.app';
  const headers = getCorsHeaders(origin);
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request')
    return new Response('ok', { headers })
  }

  try {
    const requestBody = await req.json()
    console.log('📝 Request body:', requestBody)

    const { query } = requestBody

    if (!query || query.length < 2) {
      console.log('❌ Query validation failed:', { query, length: query?.length })
      return new Response(
        JSON.stringify({ error: 'Query must be at least 2 characters' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const normalizedQuery = query.trim().toLowerCase();
    
    // Check cache first
    const cached = cache.get(normalizedQuery);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📋 Returning cached result for:', query);
      return new Response(
        JSON.stringify(cached.data),
        { headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔍 Searching for cities with enhanced strategy:', query)

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
    if (!rapidApiKey) {
      console.error('❌ RAPIDAPI_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'API configuration error - missing API key' }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔑 API key found, performing multi-strategy search...');

    try {
      // Perform multi-strategy search
      const allResults = await performMultiStrategySearch(query, rapidApiKey);
      
      console.log(`📊 Total results from all strategies: ${allResults.length}`);
      
      if (allResults.length === 0) {
        console.log('📭 No results found from any strategy');
        const responseData = { suggestions: [] };
        
        // Cache empty results with shorter duration
        cache.set(normalizedQuery, {
          data: responseData,
          timestamp: Date.now()
        });
        
        return new Response(
          JSON.stringify(responseData),
          { headers: { ...headers, 'Content-Type': 'application/json' } }
        )
      }

      // Process and rank results
      const suggestions = processAndRankResults(allResults, query);
      
      console.log('✅ Final processed suggestions:', suggestions.length, 'results');
      console.log('🎯 Top 5 suggestions:', suggestions.slice(0, 5).map(s => `${s.displayName} (score: ${s.relevanceScore})`));

      const responseData = { suggestions };
      
      // Cache the successful response
      cache.set(normalizedQuery, {
        data: responseData,
        timestamp: Date.now()
      });

      return new Response(
        JSON.stringify(responseData),
        { headers: { ...headers, 'Content-Type': 'application/json' } }
      )

    } catch (apiError) {
      console.error('❌ Enhanced search API error:', apiError);
      
      let errorMessage = 'Location search temporarily unavailable';
      
      if (apiError.message.includes('401') || apiError.message.includes('403')) {
        errorMessage = 'API authentication failed - please check configuration';
      } else if (apiError.message.includes('429')) {
        errorMessage = 'Search rate limit reached - please try again in a moment';
      } else if (apiError.message.includes('timeout') || apiError.message.includes('abort')) {
        errorMessage = 'Search request timed out - please try again';
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          suggestions: []
        }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('❌ Unexpected error in enhanced get-cities function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        suggestions: [],
        details: error.message 
      }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    )
  }
})
