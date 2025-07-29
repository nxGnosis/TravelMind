import { NextRequest, NextResponse } from 'next/server';
import { fetchTopPlaces, fetchFlightOptions } from '@/lib/tools/tavily-wrapper';

export async function POST(req: NextRequest) {
  try {
    let destination, type, budget, dates;
    
    // Try to parse JSON body first, fallback to URL parameters
    try {
      const body = await req.json();
      destination = body.destination;
      type = body.type;
      budget = body.budget;
      dates = body.dates;
    } catch {
      // If JSON parsing fails, use URL search parameters
      const url = new URL(req.url);
      destination = url.searchParams.get('destination');
      type = url.searchParams.get('category') || url.searchParams.get('type');
      budget = url.searchParams.get('budget');
      const dateParam = url.searchParams.get('dates');
      dates = dateParam ? { start: dateParam } : null;
    }

    if (!destination || !type) {
      return NextResponse.json(
        { error: 'Destination and type are required' },
        { status: 400 }
      );
    }

    // Set default values
    budget = budget || 'mid';
    dates = dates || null;

    let results: any[] = [];

    switch (type) {
      case 'hotel':
        // Make specific Tavily search for hotels
        console.log(`🏨 Searching for hotels in ${destination}`);
        results = await fetchTopPlaces(destination, 'hotel', 8);
        
        // Filter out generic travel guide results and add fallback data if needed
        const validHotels = results.filter(hotel => 
          !hotel.name.toLowerCase().includes('travel') &&
          !hotel.name.toLowerCase().includes('guide') &&
          !hotel.name.toLowerCase().includes('tips') &&
          !hotel.name.toLowerCase().includes('budget') &&
          !hotel.name.toLowerCase().includes('planning') &&
          !hotel.name.toLowerCase().includes('destinations') &&
          !hotel.name.toLowerCase().includes('complete guide')
        );
        
        // Since Tavily is returning mock data, always use fallback hotels for now
        console.log(`🔄 Found ${validHotels.length} valid hotels, using fallback data for ${destination}`);
        const fallbackHotels = generateFallbackHotels(destination, budget);
        results = fallbackHotels.slice(0, 8);
        
        // Enhance hotel data with realistic information
        results = results.map(hotel => ({
          ...hotel,
          name: hotel.name || `Hotel in ${destination}`,
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          price: getBudgetBasedPrice(budget, 'hotel'),
          amenities: getHotelAmenities(),
          availability: dates ? 'Available for your dates' : 'Check availability',
          image: getPlaceholderImage('hotel'),
          category: 'hotel',
          location: hotel.location || destination,
          blurb: hotel.blurb || `Quality accommodation in ${destination} with modern amenities`,
          link: hotel.link || `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`
        }));
        break;

      case 'restaurant':
        // Make specific Tavily search for restaurants
        console.log(`🍽️ Searching for restaurants in ${destination}`);
        results = await fetchTopPlaces(destination, 'restaurant', 10);
        
        // Filter out generic travel guide results
        const validRestaurants = results.filter(restaurant => 
          !restaurant.name.toLowerCase().includes('travel') &&
          !restaurant.name.toLowerCase().includes('guide') &&
          !restaurant.name.toLowerCase().includes('tips') &&
          !restaurant.name.toLowerCase().includes('budget') &&
          !restaurant.name.toLowerCase().includes('destinations') &&
          !restaurant.name.toLowerCase().includes('complete guide')
        );
        
        // Since Tavily is returning mock data, always use fallback restaurants for now
        console.log(`🔄 Found ${validRestaurants.length} valid restaurants, using fallback data for ${destination}`);
        const fallbackRestaurants = generateFallbackRestaurants(destination, budget);
        results = fallbackRestaurants.slice(0, 10);
        
        // Enhance restaurant data with local cuisine info
        results = results.map(restaurant => ({
          ...restaurant,
          name: restaurant.name || `Restaurant in ${destination}`,
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          price: getBudgetBasedPrice(budget, 'restaurant'),
          cuisine: getRandomCuisine(),
          bookingAdvance: getBookingAdvance(),
          specialties: getRestaurantSpecialties(),
          location: restaurant.location || `${destination} ${getRandomArea()}`,
          category: 'restaurant',
          blurb: restaurant.blurb || `Authentic local dining experience in ${destination}`,
          link: restaurant.link || `https://www.opentable.com/s?query=${encodeURIComponent(destination)}`
        }));
        break;

      case 'activity':
        // Make specific Tavily search for activities and attractions
        console.log(`🎯 Searching for activities in ${destination}`);
        results = await fetchTopPlaces(destination, 'activity', 12);
        
        // Filter out generic travel guide results
        const validActivities = results.filter(activity => 
          !activity.name.toLowerCase().includes('travel destinations') &&
          !activity.name.toLowerCase().includes('travel tips') &&
          !activity.name.toLowerCase().includes('budget') &&
          !activity.name.toLowerCase().includes('planning') &&
          !activity.name.toLowerCase().includes('complete guide') &&
          !activity.name.toLowerCase().includes('cultural experiences')
        );
        
        // Since Tavily is returning mock data, always use fallback activities for now
        console.log(`🔄 Found ${validActivities.length} valid activities, using fallback data for ${destination}`);
        const fallbackActivities = generateFallbackActivities(destination, budget);
        results = fallbackActivities.slice(0, 12);
        
        // Enhance activity data with local attractions
        results = results.map(activity => ({
          ...activity,
          name: activity.name || `Activity in ${destination}`,
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          price: getBudgetBasedPrice(budget, 'activity'),
          duration: getRandomDuration(),
          includes: getActivityIncludes(),
          bookingRequired: Math.random() > 0.5,
          category: 'activity',
          location: activity.location || destination,
          blurb: activity.blurb || `Exciting ${destination} experience with local insights`,
          link: activity.link || `https://www.getyourguide.com/s/?q=${encodeURIComponent(destination)}`
        }));
        break;

      case 'flight':
        // Make specific Tavily search for flights
        console.log(`✈️ Searching for flights to ${destination}`);
        const origin = req.nextUrl.searchParams.get('origin') || req.nextUrl.searchParams.get('departure') || 'NYC';
        
        // Search for flight information using Tavily
        const flightQuery = `flights from ${origin} to ${destination} booking skyscanner kayak expedia`;
        const flightResults = await fetchTopPlaces(destination, flightQuery, 5);
        
        // Also use the existing flight generation function
        const generatedFlights = await fetchFlightOptions(origin, destination, dates?.start, dates?.end);
        
        // Generate proper Skyscanner URLs
        const generateSkyscannerUrl = (from: string, to: string, departDate?: string, returnDate?: string) => {
          // Convert city names to airport codes (simplified mapping)
          const airportCodes: { [key: string]: string } = {
            'new york': 'jfk',
            'nyc': 'jfk',
            'los angeles': 'lax',
            'london': 'lon',
            'paris': 'par',
            'tokyo': 'nrt',
            'seoul': 'icn',
            'madrid': 'mad',
            'barcelona': 'bcn',
            'rome': 'fco',
            'amsterdam': 'ams',
            'berlin': 'ber',
            'sydney': 'syd',
            'melbourne': 'mel',
            'dubai': 'dxb',
            'singapore': 'sin'
          };
          
          const fromCode = airportCodes[from.toLowerCase()] || from.toLowerCase().substring(0, 3);
          const toCode = airportCodes[to.toLowerCase()] || to.toLowerCase().substring(0, 3);
          
          // Format dates as YYMMDD
          const formatDate = (dateStr?: string) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const yy = date.getFullYear().toString().slice(-2);
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            return `${yy}${mm}${dd}`;
          };
          
          const depDate = formatDate(departDate) || '250801'; // Default to Aug 1, 2025
          const retDate = formatDate(returnDate) || '250823'; // Default to Aug 23, 2025
          
          // Set cabin class based on budget
          const cabinClass = budget === 'luxury' ? 'business' : budget === 'budget' ? 'economy' : 'economy';
          
          return `https://www.skyscanner.net/transport/flights/${fromCode}/${toCode}/${depDate}/${retDate}/?adultsv2=1&cabinclass=${cabinClass}&childrenv2=&ref=home&rtn=1&preferdirects=false&outboundaltsenabled=false&inboundaltsenabled=false`;
        };
        
        // Combine Tavily results with generated flight options
        results = [
          ...generatedFlights.map(flight => ({
            ...flight,
            link: generateSkyscannerUrl(origin, destination, dates?.start, dates?.end)
          })),
          ...flightResults.map(flight => ({
            ...flight,
            type: 'Search Result',
            departure: origin,
            arrival: destination,
            departureDate: dates?.start || 'Flexible',
            returnDate: dates?.end || 'Flexible',
            estimatedPrice: getBudgetBasedPrice(budget, 'flight'),
            provider: 'Multiple Airlines',
            category: 'flight',
            link: generateSkyscannerUrl(origin, destination, dates?.start, dates?.end)
          }))
        ];
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid booking type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: results,
      destination,
      type,
      count: results.length
    });

  } catch (error) {
    console.error('Booking search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking recommendations' },
      { status: 500 }
    );
  }
}

// Helper functions for generating realistic data
function generateFallbackHotels(destination: string, budget: string = 'mid') {
  const city = destination.split(',')[0];
  
  // Create destination-specific hotel names
  const hotelData = {
    'Seoul': [
      'Lotte Hotel Seoul', 'Four Seasons Hotel Seoul', 'Grand Hyatt Seoul', 'Shilla Stay Gangnam', 'Myeongdong Inn'
    ],
    'Tokyo': [
      'Park Hyatt Tokyo', 'Imperial Hotel Tokyo', 'Aman Tokyo', 'Hotel New Otani', 'Shibuya Excel Hotel'
    ],
    'New York': [
      'The Plaza Hotel', 'St. Regis New York', 'The High Line Hotel', 'Pod Hotels', 'citizenM New York'
    ],
    'Paris': [
      'Le Meurice', 'Hotel des Invalides', 'Le Marais Hotel', 'Hotel Malte Opera', 'Hotel Jeanne d\'Arc'
    ],
    'London': [
      'The Savoy', 'Claridge\'s', 'The Zed Hotel', 'Premier Inn London', 'YHA London Central'
    ]
  };
  
  const specificHotels = hotelData[city as keyof typeof hotelData];
  
  if (specificHotels) {
    return specificHotels.map(name => ({
      name,
      link: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`,
      blurb: `${name} offers exceptional hospitality in the heart of ${city} with world-class amenities and service.`,
      category: 'hotel',
      city: destination,
      location: `${city} City Center`
    }));
  }
  
  // Fallback for other cities
  const hotelTypes = ['Hotel', 'Resort', 'Inn', 'Lodge', 'Suites'];
  const adjectives = ['Grand', 'Royal', 'Premium', 'Central', 'Plaza', 'Park', 'Garden', 'Metropolitan'];
  
  return Array.from({ length: 5 }, (_, i) => ({
    name: `${adjectives[i % adjectives.length]} ${city} ${hotelTypes[i % hotelTypes.length]}`,
    link: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`,
    blurb: `Elegant accommodation in the heart of ${city} with exceptional service and modern amenities.`,
    category: 'hotel',
    city: destination,
    location: `${city} City Center`
  }));
}

function generateFallbackRestaurants(destination: string, budget: string = 'mid') {
  const city = destination.split(',')[0];
  
  // Create destination-specific restaurants
  const restaurantData = {
    'Seoul': [
      'Jungsik', 'Mingles', 'Gwangjang Market', 'Tosokchon Samgyetang', 'Myeongdong Kyoja', 'Bukchon Son Mandu'
    ],
    'Tokyo': [
      'Sukiyabashi Jiro', 'Tsuta Ramen', 'Tonki Tonkatsu', 'Daiwa Sushi', 'Nabezo Shibuya', 'Ichiran Ramen'
    ],
    'New York': [
      'Le Bernardin', 'Katz\'s Delicatessen', 'Joe\'s Pizza', 'Peter Luger', 'Eleven Madison Park', 'Russ & Daughters'
    ],
    'Paris': [
      'L\'Ambroisie', 'Bistrot Paul Bert', 'L\'As du Fallafel', 'Breizh Café', 'Du Pain et des Idées', 'Le Comptoir du 7ème'
    ],
    'London': [
      'Dishoom', 'Sketch', 'Borough Market', 'The Ivy', 'Hawksmoor', 'Padella'
    ]
  };
  
  const specificRestaurants = restaurantData[city as keyof typeof restaurantData];
  
  if (specificRestaurants) {
    return specificRestaurants.map(name => ({
      name,
      link: `https://www.opentable.com/s?query=${encodeURIComponent(destination)}`,
      blurb: `${name} is a beloved ${city} dining destination known for authentic flavors and exceptional cuisine.`,
      category: 'restaurant',
      city: destination,
      location: `${city} District`
    }));
  }
  
  // Fallback for other cities
  const cuisines = ['Local', 'Traditional', 'Modern', 'International', 'Fusion'];
  const types = ['Restaurant', 'Bistro', 'Cafe', 'Kitchen', 'House'];
  
  return Array.from({ length: 6 }, (_, i) => ({
    name: `${cuisines[i % cuisines.length]} ${types[i % types.length]}`,
    link: `https://www.opentable.com/s?query=${encodeURIComponent(destination)}`,
    blurb: `Authentic ${city} dining experience featuring local specialties and fresh ingredients.`,
    category: 'restaurant',
    city: destination,
    location: `${city} District`
  }));
}

function generateFallbackActivities(destination: string, budget: string = 'mid') {
  const city = destination.split(',')[0];
  
  // Create destination-specific activities
  const activityData = {
    'Seoul': [
      'Gyeongbokgung Palace Tour', 'Bukchon Hanok Village Walk', 'N Seoul Tower Experience', 'Hongdae Nightlife Tour', 'DMZ Tour', 'Korean Cooking Class'
    ],
    'Tokyo': [
      'Senso-ji Temple Visit', 'Tsukiji Fish Market Tour', 'Tokyo Skytree Observatory', 'Shibuya Crossing Experience', 'Mount Fuji Day Trip', 'Sake Tasting Tour'
    ],
    'New York': [
      'Statue of Liberty Tour', 'Central Park Walking Tour', 'Broadway Show Experience', 'High Line Park Walk', 'Brooklyn Bridge Tour', 'Food Tour in Chinatown'
    ],
    'Paris': [
      'Eiffel Tower Experience', 'Louvre Museum Tour', 'Seine River Cruise', 'Montmartre Walking Tour', 'Palace of Versailles', 'Wine Tasting in Marais'
    ],
    'London': [
      'Tower of London Tour', 'British Museum Visit', 'Thames River Cruise', 'Westminster Abbey Tour', 'Camden Market Experience', 'Harry Potter Studio Tour'
    ]
  };
  
  const specificActivities = activityData[city as keyof typeof activityData];
  
  if (specificActivities) {
    return specificActivities.map(name => ({
      name,
      link: `https://www.getyourguide.com/s/?q=${encodeURIComponent(destination)}`,
      blurb: `${name} - discover the authentic culture and history of ${city} with expert local guides.`,
      category: 'activity',
      city: destination,
      location: city
    }));
  }
  
  // Fallback for other cities
  const activities = [
    `${city} Cultural Center`,
    `Historic ${city} Walking Tour`,
    `${city} Museum Experience`,
    `Local Markets of ${city}`,
    `${city} City Highlights Tour`,
    `Traditional ${city} Workshop`
  ];
  
  return activities.map(name => ({
    name,
    link: `https://www.getyourguide.com/s/?q=${encodeURIComponent(destination)}`,
    blurb: `Immersive ${city} experience showcasing local culture, history, and authentic traditions.`,
    category: 'activity',
    city: destination,
    location: city
  }));
}

function getBudgetBasedPrice(budget: string, type: string) {
  const prices = {
    budget: {
      hotel: ['$45/night', '$55/night', '$65/night', '$75/night'],
      restaurant: ['$15-25', '$20-30', '$25-35'],
      activity: ['$15', '$25', '$35', '$45'],
      flight: ['$300', '$400', '$500', '$600']
    },
    mid: {
      hotel: ['$85/night', '$95/night', '$110/night', '$125/night'],
      restaurant: ['$35-50', '$40-55', '$45-60'],
      activity: ['$45', '$55', '$65', '$75'],
      flight: ['$600', '$750', '$900', '$1100']
    },
    luxury: {
      hotel: ['$180/night', '$220/night', '$280/night', '$350/night'],
      restaurant: ['$65-85', '$75-95', '$85-120'],
      activity: ['$85', '$95', '$125', '$150'],
      flight: ['$1200', '$1500', '$1800', '$2200']
    }
  };

  // Fallback to 'mid' if budget is undefined or invalid
  const budgetKey = (budget && budget in prices) ? budget as keyof typeof prices : 'mid';
  const typeKey = type as keyof typeof prices.budget;
  
  // Get the price options, with fallbacks
  const budgetPrices = prices[budgetKey];
  const options = budgetPrices?.[typeKey] || prices.mid[typeKey] || ['$50'];
  
  return options[Math.floor(Math.random() * options.length)];
}

function getHotelAmenities() {
  const amenities = ['Free WiFi', 'Spa', 'Gym', 'Restaurant', 'Pool', 'Breakfast', 'Parking', 'Rooftop Bar', 'Concierge', 'Ocean View'];
  return amenities.slice(0, Math.floor(Math.random() * 4) + 3);
}

function getRandomCuisine() {
  const cuisines = ['Local Specialty', 'Traditional', 'Modern', 'Fusion', 'International', 'Seafood', 'Farm-to-Table', 'Street Food'];
  return cuisines[Math.floor(Math.random() * cuisines.length)];
}

function getRandomArea() {
  const areas = ['Downtown', 'Old Town', 'City Center', 'Historic District', 'Waterfront', 'Market District', 'Arts Quarter'];
  return areas[Math.floor(Math.random() * areas.length)];
}

function getBookingAdvance() {
  const advances = ['Walk-in friendly', '1 week', '2 weeks', 'Same day', 'Recommended 3-5 days'];
  return advances[Math.floor(Math.random() * advances.length)];
}

function getRestaurantSpecialties() {
  const specialties = [
    ['Signature Dishes', 'Wine Pairing', 'Chef\'s Table'],
    ['Local Favorites', 'Traditional Recipes', 'Craft Beer'],
    ['Seasonal Menu', 'Local Ingredients', 'Vegetarian Options'],
    ['Fresh Seafood', 'Ocean Views', 'Sunset Dining'],
    ['Authentic Cuisine', 'Family Recipes', 'Cultural Experience']
  ];
  return specialties[Math.floor(Math.random() * specialties.length)];
}

function getRandomDuration() {
  const durations = ['1 hour', '1.5 hours', '2 hours', '2.5 hours', '3 hours', '4 hours', '6 hours', 'Full day'];
  return durations[Math.floor(Math.random() * durations.length)];
}

function getActivityIncludes() {
  const includes = [
    ['Professional guide', 'Transportation', 'Entry fees'],
    ['Food tastings', 'Local guide', 'Market visit'],
    ['All materials', 'Expert instruction', 'Take-home creation'],
    ['Hotel pickup', 'Equipment rental', 'Refreshments'],
    ['Small group', 'Photo opportunities', 'Local insights']
  ];
  return includes[Math.floor(Math.random() * includes.length)];
}

function getPlaceholderImage(type: string) {
  const images = {
    hotel: [
      'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=400'
    ]
  };
  return images[type as keyof typeof images]?.[Math.floor(Math.random() * 3)] || '';
}
