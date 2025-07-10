export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

export interface TavilySearchResponse {
  results: TavilySearchResult[];
  query: string;
  response_time: number;
}

export class TavilySearchTool {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.TAVILY_API_KEY || '';
    this.baseUrl = 'https://api.tavily.com/search';
  }

  async search(
    query: string,
    options: {
      search_depth?: 'basic' | 'advanced';
      topic?: 'general' | 'news';
      days?: number;
      max_results?: number;
      include_domains?: string[];
      exclude_domains?: string[];
    } = {}
  ): Promise<TavilySearchResponse> {
    const {
      search_depth = 'basic',
      topic = 'general',
      days = 3,
      max_results = 10,
      include_domains = [],
      exclude_domains = []
    } = options;

    try {
      // In a real implementation, this would make an API call to Tavily
      // For now, return mock search results
      return this.getMockSearchResults(query, max_results);
    } catch (error) {
      console.error('Tavily search error:', error);
      return this.getMockSearchResults(query, max_results);
    }
  }

  private getMockSearchResults(query: string, maxResults: number): TavilySearchResponse {
    const mockResults: TavilySearchResult[] = [
      {
        title: "Best Travel Destinations 2024 - Complete Guide",
        url: "https://example.com/travel-guide",
        content: "Comprehensive guide to the best travel destinations for 2024, including budget tips and insider recommendations.",
        score: 0.95,
        published_date: "2024-01-15"
      },
      {
        title: "Local Travel Tips and Hidden Gems",
        url: "https://example.com/local-tips",
        content: "Discover hidden gems and local favorites that most tourists miss. Expert recommendations from local guides.",
        score: 0.88,
        published_date: "2024-01-10"
      },
      {
        title: "Budget Travel Planning - Expert Tips",
        url: "https://example.com/budget-travel",
        content: "How to plan amazing trips on any budget. Includes cost breakdowns and money-saving strategies.",
        score: 0.82,
        published_date: "2024-01-05"
      },
      {
        title: "Cultural Experiences and Local Events",
        url: "https://example.com/cultural-events",
        content: "Upcoming cultural events, festivals, and authentic local experiences. Updated daily with new events.",
        score: 0.78,
        published_date: "2024-01-20"
      },
      {
        title: "Transportation and Logistics Guide",
        url: "https://example.com/transportation",
        content: "Complete guide to getting around, including public transport, ride-sharing, and local transportation tips.",
        score: 0.75,
        published_date: "2024-01-12"
      }
    ];

    return {
      results: mockResults.slice(0, maxResults),
      query,
      response_time: 0.45
    };
  }

  async searchDestinations(destination: string, interests: string): Promise<TavilySearchResponse> {
    const query = `best ${destination} destinations ${interests} travel guide 2024`;
    return this.search(query, {
      search_depth: 'advanced',
      topic: 'general',
      max_results: 5,
      include_domains: ['tripadvisor.com', 'lonelyplanet.com', 'timeout.com']
    });
  }

  async searchLocalEvents(city: string, dateRange: string): Promise<TavilySearchResponse> {
    const query = `${city} events festivals activities ${dateRange}`;
    return this.search(query, {
      search_depth: 'basic',
      topic: 'news',
      days: 30,
      max_results: 8
    });
  }

  async searchBudgetInfo(city: string, budget: string): Promise<TavilySearchResponse> {
    const query = `${city} travel costs ${budget} budget accommodation food activities`;
    return this.search(query, {
      search_depth: 'advanced',
      max_results: 6
    });
  }
}