'use client';

import { useEffect } from 'react';

/**
 * Suppress harmless Firebase Auth COOP warnings
 * These warnings occur when Firebase tries to close popup windows after authentication
 * They don't affect functionality but clutter the console
 */
export const ConsoleFilter = () => {
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    // Filter out COOP-related warnings from Firebase Auth
    const filterCOOPMessages = (args: any[]) => {
      const message = args.join(' ');
      if (
        message.includes('Cross-Origin-Opener-Policy') ||
        message.includes('policy would block the window.close') ||
        message.includes('policy would block the window.closed')
      ) {
        // Suppress these harmless warnings
        return true;
      }
      return false;
    };

    console.error = (...args: any[]) => {
      if (!filterCOOPMessages(args)) {
        originalError.apply(console, args);
      }
    };

    console.warn = (...args: any[]) => {
      if (!filterCOOPMessages(args)) {
        originalWarn.apply(console, args);
      }
    };

    // Also catch unhandled promise rejections related to COOP
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || '';
      if (
        reason.includes('Cross-Origin-Opener-Policy') ||
        reason.includes('policy would block')
      ) {
        event.preventDefault(); // Suppress the error
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null; // This component doesn't render anything
};

