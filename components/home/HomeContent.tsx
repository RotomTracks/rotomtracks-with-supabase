'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TournamentSearch } from "@/components/tournaments/TournamentSearch";
// Lazy load heavy sections after first paint
const UpcomingTournaments = dynamic(() => import('@/components/home/UpcomingTournaments').then(m => m.UpcomingTournaments), { 
  ssr: true,
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
});
const PopularTournaments = dynamic(() => import('@/components/home/PopularTournaments').then(m => m.PopularTournaments), { 
  ssr: true,
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
});
const MyTournaments = dynamic(() => import('@/components/home/MyTournaments').then(m => m.MyTournaments), { 
  ssr: true,
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
});
import { useTypedTranslation } from "@/lib/i18n";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy, Search, Users, MapPin, X } from "lucide-react";

interface HomeContentProps {
  user: any;
}

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
  };
}

export function HomeContent({ user }: HomeContentProps) {
  const { tPages } = useTypedTranslation();
  const [userLocation, setUserLocation] = useState<string | undefined>(undefined);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showLocationNotification, setShowLocationNotification] = useState(false);

  useEffect(() => {
    // Check if user has a saved location
    const savedLocation = localStorage.getItem('userLocation');
    const locationDetectionDismissed = localStorage.getItem('locationDetectionDismissed');

    if (savedLocation) {
      setUserLocation(savedLocation);
    } else if (!locationDetectionDismissed && user) {
      // Schedule detection during idle time to not block first paint
      const idleCallback = (cb: any) => (
        (window as any).requestIdleCallback ? (window as any).requestIdleCallback(cb, { timeout: 2000 }) : setTimeout(cb, 200)
      );
      const id = idleCallback(() => detectLocationAutomatically());
      return () => {
        if ((window as any).cancelIdleCallback) (window as any).cancelIdleCallback(id);
        clearTimeout(id as any);
      };
    }
  }, [user]);

  const detectLocationAutomatically = async () => {
    if (!navigator.geolocation) {
      return; // Silently fail if geolocation is not available
    }

    setIsDetectingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: false, // Use less accurate but faster detection
            timeout: 5000, // Shorter timeout
            maximumAge: 600000 // 10 minutes cache
          }
        );
      });

      // Use reverse geocoding to get city name
      const { latitude, longitude } = position.coords;
      
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        
        if (response.ok) {
          const data = await response.json();
          const city = data.city || data.locality || data.principalSubdivision;
          const country = data.countryName;
          
          if (city) {
            const locationString = country === 'Spain' ? city : `${city}, ${country}`;
            setUserLocation(locationString);
            localStorage.setItem('userLocation', locationString);
            setShowLocationNotification(true);
            
            // Auto-hide notification after 5 seconds
            setTimeout(() => {
              setShowLocationNotification(false);
            }, 5000);
          }
        }
      } catch (geocodeError) {
        // Silently fail geocoding errors
        console.debug('Geocoding failed, continuing without location');
      }
    } catch (geoError: any) {
      // Silently handle geolocation errors - don't show intrusive messages
      console.debug('Geolocation not available or denied');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const dismissLocationNotification = () => {
    setShowLocationNotification(false);
    localStorage.setItem('locationDetectionDismissed', 'true');
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-5 text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {tPages('home.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {tPages('home.hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button size="lg" className="px-8 bg-blue-600 hover:bg-blue-700 text-white">
                    <Trophy className="h-5 w-5 mr-2" />
                    {tPages('home.hero.myDashboard')}
                  </Button>
                </Link>
                <Link href="/tournaments">
                  <Button size="lg" variant="outline" className="px-8 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    <Search className="h-5 w-5 mr-2" />
                    {tPages('home.hero.exploreTournaments')}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/sign-up">
                  <Button size="lg" className="px-8 bg-blue-600 hover:bg-blue-700 text-white">
                    <Users className="h-5 w-5 mr-2" />
                    {tPages('home.hero.joinFree')}
                  </Button>
                </Link>
                <Link href="/tournaments">
                  <Button size="lg" variant="outline" className="px-8 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    <Search className="h-5 w-5 mr-2" />
                    {tPages('home.hero.viewTournaments')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Central Search Component */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  {tPages('home.search.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {tPages('home.search.subtitle')}
                </p>
              </div>
              
              <TournamentSearch 
                placeholder={tPages('home.search.placeholder')}
                autoFocus={false}
                showFilters={false}
              />
              
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{tPages('home.search.activeTournaments')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>{tPages('home.search.openRegistrations')}</span>
                  </div>
                  {userLocation && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-blue-600 dark:text-blue-400">{userLocation}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {user && !userLocation && (
                    <button
                      onClick={detectLocationAutomatically}
                      disabled={isDetectingLocation}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" />
                      {isDetectingLocation ? tPages('home.search.detectingLocation') : tPages('home.search.detectLocation')}
                    </button>
                  )}
                  <Link href="/tournaments" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline text-sm font-medium">
                    {tPages('home.search.viewAllTournaments')}
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-white/20 dark:border-gray-700/20">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{tPages('home.stats.tournaments')}</div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-white/20 dark:border-gray-700/20">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">1,200+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{tPages('home.stats.players')}</div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-white/20 dark:border-gray-700/20">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{tPages('home.stats.cities')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Detection Notification - Subtle notification */}
      {showLocationNotification && userLocation && (
        <div className="fixed top-20 right-4 z-50 max-w-sm">
          <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-lg shadow-lg p-4 flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
              <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {tPages('home.location.detected')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {tPages('home.location.showingTournaments', { location: userLocation })}
              </p>
            </div>
            <button
              onClick={dismissLocationNotification}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loading indicator for location detection */}
      {isDetectingLocation && (
        <div className="fixed top-20 right-4 z-50 max-w-sm">
          <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg shadow-lg p-4 flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
              <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {tPages('home.search.detectingLocation')}...
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {tPages('home.location.showingTournaments', { location: 'tu área' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* My Tournaments Section - Only for authenticated users */}
      {user && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-5">
            <MyTournaments />
          </div>
        </section>
      )}

      {/* Featured Tournaments */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {tPages('home.sections.featuredTournaments')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {tPages('home.sections.featuredSubtitle')}
            </p>
          </div>
          <UpcomingTournaments 
            userLocation={userLocation}
            limit={6}
          />
          
          {/* Call to Action for Tournament Discovery */}
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-8 border border-blue-100 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {tPages('home.sections.notFound')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {tPages('home.sections.notFoundSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/tournaments">
                  <Button size="lg" className="px-8">
                    <Search className="h-5 w-5 mr-2" />
                    {tPages('home.sections.exploreAll')}
                  </Button>
                </Link>
                {!user && (
                  <Link href="/auth/sign-up">
                    <Button size="lg" variant="outline" className="px-8">
                      <Users className="h-5 w-5 mr-2" />
                      {tPages('home.sections.createAccount')}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tournaments and Recent Activity */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {tPages('home.sections.trendsAndActivity')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {tPages('home.sections.trendsSubtitle')}
            </p>
          </div>
          <PopularTournaments />
          
          {/* Quick Search by Type */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {tPages('home.sections.quickSearch')}
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/tournaments?type=TCG">
                <Button variant="outline" className="px-6 py-3">
                  <Trophy className="h-4 w-4 mr-2" />
                  TCG
                </Button>
              </Link>
              <Link href="/tournaments?type=VGC">
                <Button variant="outline" className="px-6 py-3">
                  <Trophy className="h-4 w-4 mr-2" />
                  VGC
                </Button>
              </Link>
              <Link href="/tournaments?type=GO">
                <Button variant="outline" className="px-6 py-3">
                  <Trophy className="h-4 w-4 mr-2" />
                  Pokémon GO
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {tPages('home.sections.features')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {tPages('home.sections.featuresSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {tPages('home.features.search.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {tPages('home.features.search.description')}
              </p>
                  <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <li>• {tPages('home.features.search.items.location')}</li>
                    <li>• {tPages('home.features.search.items.date')}</li>
                    <li>• {tPages('home.features.search.items.type')}</li>
                  </ul>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {tPages('home.features.management.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {tPages('home.features.management.description')}
              </p>
                  <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <li>• {tPages('home.features.management.items.upload')}</li>
                    <li>• {tPages('home.features.management.items.track')}</li>
                    <li>• {tPages('home.features.management.items.results')}</li>
                  </ul>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {tPages('home.features.community.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {tPages('home.features.community.description')}
              </p>
                  <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <li>• {tPages('home.features.community.items.connect')}</li>
                    <li>• {tPages('home.features.community.items.share')}</li>
                    <li>• {tPages('home.features.community.items.learn')}</li>
                  </ul>
            </div>
          </div>

          {!user && (
            <div className="text-center mt-12">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {tPages('home.features.readyToJoin')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/sign-up">
                  <Button size="lg">
                    <Users className="h-5 w-5 mr-2" />
                    {tPages('home.features.createFreeAccount')}
                  </Button>
                </Link>
                <Link href="/tournaments">
                  <Button size="lg" variant="outline">
                    <Search className="h-5 w-5 mr-2" />
                    {tPages('home.features.exploreTournaments')}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}