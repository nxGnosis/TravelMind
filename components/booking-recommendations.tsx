'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ExternalLink, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign,
  Bed,
  Utensils,
  Plane,
  Car,
  Calendar,
  Users,
  Wifi,
  Coffee,
  Dumbbell,
  Car as CarIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FlightBooking } from './flight-booking';

interface BookingRecommendationsProps {
  destination: string;
  dates: { start: string; end: string };
  travelers: string;
  budget: string;
  origin?: string;
}

export function BookingRecommendations({ destination, dates, travelers, budget, origin = 'New York' }: BookingRecommendationsProps) {
  const [activeTab, setActiveTab] = useState('flights');

  // Mock booking data - in production, this would come from real APIs
  const bookingData = {
    hotels: [
      {
        id: '1',
        name: `Grand ${destination} Hotel`,
        rating: 4.8,
        price: '$320/night',
        image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=400',
        location: `${destination} City Center`,
        amenities: ['Free WiFi', 'Spa', 'Gym', 'Restaurant'],
        bookingUrl: 'https://booking.com',
        description: `Luxury hotel in the heart of ${destination} with stunning city views.`,
        availability: 'Available for your dates'
      },
      {
        id: '2',
        name: `${destination} Bay Resort`,
        rating: 4.6,
        price: '$280/night',
        image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400',
        location: `${destination} Waterfront`,
        amenities: ['Ocean View', 'Pool', 'Free WiFi', 'Breakfast'],
        bookingUrl: 'https://booking.com',
        description: `Waterfront resort with panoramic views and modern amenities in ${destination}.`,
        availability: 'Limited availability'
      },
      {
        id: '3',
        name: `${destination} Boutique Hotel`,
        rating: 4.2,
        price: '$180/night',
        image: 'https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=400',
        location: `${destination} Historic District`,
        amenities: ['Free WiFi', 'Rooftop Bar', 'Concierge', 'Parking'],
        bookingUrl: 'https://booking.com',
        description: `Charming boutique hotel in the historic heart of ${destination}.`,
        availability: 'Available for your dates'
      }
    ],
    restaurants: [
      {
        id: '1',
        name: `${destination} Fine Dining`,
        rating: 4.9,
        price: '$$$$$',
        cuisine: 'Local Specialty',
        location: `${destination} Downtown`,
        reservationUrl: 'https://opentable.com',
        description: `World-renowned restaurant showcasing the best of ${destination} cuisine.`,
        bookingAdvance: '2 weeks',
        specialties: ['Signature Dishes', 'Wine Pairing', 'Chef\'s Table']
      },
      {
        id: '2',
        name: `Local ${destination} Bistro`,
        rating: 4.5,
        price: '$$',
        cuisine: 'Traditional',
        location: `${destination} Old Town`,
        reservationUrl: 'https://opentable.com',
        description: `Authentic local dining experience in traditional ${destination} setting.`,
        bookingAdvance: 'Walk-in friendly',
        specialties: ['Local Favorites', 'Traditional Recipes', 'Craft Beer']
      },
      {
        id: '3',
        name: `${destination} Market Kitchen`,
        rating: 4.7,
        price: '$$$',
        cuisine: 'Farm-to-Table',
        location: `${destination} Market District`,
        reservationUrl: 'https://opentable.com',
        description: `Fresh, seasonal cuisine using local ingredients from ${destination}.`,
        bookingAdvance: '1 week',
        specialties: ['Seasonal Menu', 'Local Ingredients', 'Vegetarian Options']
      }
    ],
    activities: [
      {
        id: '1',
        name: `${destination} City Tour`,
        rating: 4.6,
        price: '$45',
        duration: '3 hours',
        bookingUrl: 'https://viator.com',
        description: `Comprehensive guided tour of ${destination}'s main attractions and hidden gems.`,
        includes: ['Professional guide', 'Transportation', 'Entry fees']
      },
      {
        id: '2',
        name: `${destination} Food Experience`,
        rating: 4.8,
        price: '$85',
        duration: '4 hours',
        bookingUrl: 'https://viator.com',
        description: `Culinary journey through ${destination}'s best local food scene.`,
        includes: ['Food tastings', 'Local guide', 'Market visit']
      },
      {
        id: '3',
        name: `${destination} Cultural Workshop`,
        rating: 4.7,
        price: '$65',
        duration: '2.5 hours',
        bookingUrl: 'https://viator.com',
        description: `Hands-on cultural experience learning traditional ${destination} crafts.`,
        includes: ['All materials', 'Expert instruction', 'Take-home creation']
      }
    ]
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, any> = {
      'Free WiFi': Wifi,
      'Wifi': Wifi,
      'Spa': Star,
      'Gym': Dumbbell,
      'Restaurant': Utensils,
      'Pool': Star,
      'Breakfast': Coffee,
      'Parking': CarIcon
    };
    const IconComponent = iconMap[amenity] || Star;
    return <IconComponent className="w-3 h-3" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-blue-600" />
          Complete Booking Suite
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Everything you need for your trip to {destination}
        </p>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="flights" className="flex items-center gap-1">
              <Plane className="w-4 h-4" />
              <span className="hidden sm:inline">Flights</span>
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span className="hidden sm:inline">Hotels</span>
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="flex items-center gap-1">
              <Utensils className="w-4 h-4" />
              <span className="hidden sm:inline">Dining</span>
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Activities</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flights" className="mt-4">
            <FlightBooking
              origin={origin}
              destination={destination}
              dates={dates}
              travelers={travelers}
              budget={budget}
            />
          </TabsContent>

          <TabsContent value="hotels" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookingData.hotels.map((hotel, index) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                      <img 
                        src={hotel.image} 
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">{hotel.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs">{hotel.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600">{hotel.location}</span>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-3">{hotel.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {hotel.amenities.map((amenity, i) => (
                          <Badge key={i} variant="outline" className="text-xs flex items-center gap-1">
                            {getAmenityIcon(amenity)}
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-blue-600">{hotel.price}</p>
                          <p className="text-xs text-green-600">{hotel.availability}</p>
                        </div>
                        <Button size="sm" asChild>
                          <a href={hotel.bookingUrl} target="_blank" rel="noopener noreferrer">
                            Book Now
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="restaurants" className="mt-4">
            <div className="space-y-4">
              {bookingData.restaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{restaurant.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{restaurant.cuisine}</Badge>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-sm">{restaurant.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">{restaurant.price}</p>
                          <p className="text-xs text-gray-600">{restaurant.bookingAdvance}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        <span className="text-sm text-gray-600">{restaurant.location}</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{restaurant.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {restaurant.specialties.map((specialty, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button size="sm" asChild>
                        <a href={restaurant.reservationUrl} target="_blank" rel="noopener noreferrer">
                          Make Reservation
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activities" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookingData.activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{activity.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-sm">{activity.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-gray-500" />
                          <span>{activity.price}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span>{activity.duration}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                      
                      <div className="space-y-1 mb-3">
                        <p className="text-xs font-medium text-gray-700">Includes:</p>
                        {activity.includes.map((item, i) => (
                          <p key={i} className="text-xs text-gray-600">• {item}</p>
                        ))}
                      </div>
                      
                      <Button size="sm" asChild>
                        <a href={activity.bookingUrl} target="_blank" rel="noopener noreferrer">
                          Book Activity
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}