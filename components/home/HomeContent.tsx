'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TournamentSearch } from "@/components/tournaments/TournamentSearch";
// Lazy load heavy sections after first paint
const UpcomingTournaments = dynamic(() => import('@/components/home/UpcomingTournaments').then(m => m.UpcomingTournaments), { 
  ssr: true,
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-xl shadow-lg"></div>
});
const PopularTournaments = dynamic(() => import('@/components/home/PopularTournaments').then(m => m.PopularTournaments), { 
  ssr: true,
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-xl shadow-lg"></div>
});
import { useTypedTranslation } from "@/lib/i18n";
import Link from "next/link";
import { useAuthModalContext } from "@/components/auth/AuthModalContext";
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
  const { openSignUpModal, openLoginModal } = useAuthModalContext();
  const [userLocation, setUserLocation] = useState<string | undefined>(undefined);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showLocationNotification, setShowLocationNotification] = useState(false);
  const [stats, setStats] = useState({
    tournaments: 0,
    players: 0,
    cities: 0
  });
  const [hasUpcomingTournaments, setHasUpcomingTournaments] = useState(true);

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

  // Fetch platform statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/tournaments?limit=1');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setStats({
              tournaments: data.data.total || 0,
              players: data.data.total_players || 0,
              cities: data.data.unique_cities || 0
            });
          }
        }
      } catch (error) {
        console.error('Error fetching platform stats:', error);
        // Keep default values (0) on error
      }
    };

    fetchStats();
  }, []);

  // Listen for custom events from child components
  useEffect(() => {
    const handleOpenLoginModal = () => {
      openLoginModal();
    };

    window.addEventListener('openLoginModal', handleOpenLoginModal);

    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
    };
  }, [openLoginModal]);

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
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 py-20">
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
                  <Button 
                    size="lg" 
                    className="px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Trophy className="h-5 w-5 mr-2" />
                    {tPages('home.hero.myDashboard')}
                  </Button>
                </Link>
                <Link href="/tournaments">
                  <button 
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-8 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white shadow-lg hover:shadow-xl transition-all duration-200 bg-transparent"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    {tPages('home.hero.exploreTournaments')}
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={openSignUpModal}
                >
                  <Users className="h-5 w-5 mr-2" />
                  {tPages('home.hero.joinFree')}
                </Button>
                <Link href="/tournaments">
                  <button 
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-8 border-2 border-blue-600 text-black hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-white dark:hover:bg-blue-400 dark:hover:text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    {tPages('home.hero.viewTournaments')}
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Central Search Component */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl shadow-xl px-8 pt-8 pb-4 border border-gray-200 dark:border-gray-600">
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
              
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4">
                <div className="flex items-center gap-4 sm:gap-6 text-sm text-gray-600 dark:text-gray-400">
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
                
                <div className="flex items-center gap-3 sm:gap-4">
                  {user && !userLocation && (
                    <button
                      onClick={detectLocationAutomatically}
                      disabled={isDetectingLocation}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                    >
                      <MapPin className="w-3 h-3" />
                      {isDetectingLocation ? tPages('home.search.detectingLocation') : tPages('home.search.detectLocation')}
                    </button>
                  )}
                  <Link 
                    href="/tournaments" 
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                  >
                    {tPages('home.search.viewAllTournaments')}
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-200">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stats.tournaments > 0 ? `${stats.tournaments}+` : '0'}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{tPages('home.stats.tournaments')}</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-200">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {stats.players > 0 ? `${stats.players}+` : '0'}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{tPages('home.stats.players')}</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-200">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {stats.cities > 0 ? `${stats.cities}+` : '0'}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{tPages('home.stats.cities')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Detection Notification - Subtle notification */}
      {showLocationNotification && userLocation && (
        <div className="fixed top-20 right-4 z-50 max-w-sm">
          <div className="bg-white dark:bg-gray-700 border border-green-200 dark:border-green-700 rounded-lg shadow-lg p-4 flex items-center gap-3">
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
          <div className="bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-700 rounded-lg shadow-lg p-4 flex items-center gap-3">
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


      {/* Featured Tournaments */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16">
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
            onTournamentsChange={setHasUpcomingTournaments}
            user={user}
          />
          
          {/* Call to Action for Tournament Discovery - Only show when there are upcoming tournaments */}
          {hasUpcomingTournaments && (
            <div className="text-center mt-12">
              <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 border border-gray-200 dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {tPages('home.sections.notFound')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {tPages('home.sections.notFoundSubtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/tournaments">
                    <button 
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-8 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow-xl transition-all duration-200 bg-transparent"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      {tPages('home.sections.exploreAll')}
                    </button>
                  </Link>
                  {!user && (
                    <button 
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-8 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow-xl transition-all duration-200 bg-transparent"
                      onClick={openSignUpModal}
                    >
                      <Users className="h-5 w-5 mr-2" />
                      {tPages('home.sections.createAccount')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Popular Tournaments and Recent Activity */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 py-16">
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
                <button 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow-xl transition-all duration-200 bg-transparent"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  TCG
                </button>
              </Link>
              <Link href="/tournaments?type=VGC">
                <button 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 px-6 py-3 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white shadow-lg hover:shadow-xl transition-all duration-200 bg-transparent"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  VGC
                </button>
              </Link>
              <Link href="/tournaments?type=GO">
                <button 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 px-6 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white shadow-lg hover:shadow-xl transition-all duration-200 bg-transparent"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Pokémon GO
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}