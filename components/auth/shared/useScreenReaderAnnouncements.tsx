"use client";

import { useCallback, useRef, useState } from 'react';

import type { UseScreenReaderAnnouncementsOptions } from './types';
import { SR_ANNOUNCEMENT_DELAY } from './constants';

export function useScreenReaderAnnouncements({
  politeness = 'polite',
  clearDelay = SR_ANNOUNCEMENT_DELAY.MEDIUM
}: UseScreenReaderAnnouncementsOptions = {}) {
  const [announcement, setAnnouncement] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const announce = useCallback((message: string, options?: { 
    politeness?: 'polite' | 'assertive';
    clearAfter?: number;
  }) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set the announcement
    setAnnouncement(message);

    // Clear the announcement after delay
    const delay = options?.clearAfter ?? clearDelay;
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setAnnouncement('');
      }, delay);
    }
  }, [clearDelay]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setAnnouncement('');
  }, []);

  // Component for rendering the announcement
  const AnnouncementRegion = useCallback(({ className }: { className?: string }) => {
    return (
      <div
        role="status"
        aria-live={politeness}
        aria-atomic="true"
        className={`sr-only ${className || ''}`}
      >
        {announcement}
      </div>
    );
  }, [announcement, politeness]);

  return {
    announce,
    clear,
    announcement,
    AnnouncementRegion
  };
}