import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { memorySocketClient } from '@/lib/socket-client';
import { showLiveUpdateToast, showSuccessToast } from '@/lib/toast-utils';
import { useTheme } from '@/hooks/useTheme';
import { UploadWidget } from '@/components/UploadWidget';
import { Gallery } from '@/components/Gallery';
import type { MediaItem } from '@/types';

export const MemoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const recentlyUploadedIds = useState<Set<string>>(() => new Set())[0];
  const [isUploading, setIsUploading] = useState(false);

  // Fetch memory data
  const { data, isLoading, error } = useQuery({
    queryKey: ['memory', slug],
    queryFn: () => apiClient.getMemoryBySlug(slug!),
    enabled: !!slug,
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!data?.memory?.id) return;

    memorySocketClient.connect(data.memory.id);

    const handleNewMedia = (mediaItem: MediaItem) => {
      // Check if we're currently uploading - suppress toast
      if (isUploading) {
        // Mark this ID as ours
        recentlyUploadedIds.add(mediaItem.id);
        // Remove from tracking after a delay
        setTimeout(() => recentlyUploadedIds.delete(mediaItem.id), 5000);

        // Add to cache but don't show toast
        queryClient.setQueryData(['memory', slug], (old: any) => {
          if (!old) return old;
          const exists = old.mediaItems.some((item: MediaItem) => item.id === mediaItem.id);
          if (exists) return old;

          return {
            ...old,
            mediaItems: [mediaItem, ...old.mediaItems],
          };
        });
        return;
      }

      // Check if this was uploaded by current tab (safety check)
      if (recentlyUploadedIds.has(mediaItem.id)) {
        // Remove from tracking after a delay
        setTimeout(() => recentlyUploadedIds.delete(mediaItem.id), 5000);

        // Add to cache but don't show toast
        queryClient.setQueryData(['memory', slug], (old: any) => {
          if (!old) return old;
          const exists = old.mediaItems.some((item: MediaItem) => item.id === mediaItem.id);
          if (exists) return old;

          return {
            ...old,
            mediaItems: [mediaItem, ...old.mediaItems],
          };
        });
        return;
      }

      // Add new media to the query cache
      queryClient.setQueryData(['memory', slug], (old: any) => {
        if (!old) return old;
        // Prevent duplicates
        const exists = old.mediaItems.some((item: MediaItem) => item.id === mediaItem.id);
        if (exists) return old;

        return {
          ...old,
          mediaItems: [mediaItem, ...old.mediaItems],
        };
      });

      // Show toast for uploads from others
      showLiveUpdateToast('Someone just uploaded a photo!', mediaItem.url);
    };

    memorySocketClient.onNewMedia(handleNewMedia);
    setIsConnected(memorySocketClient.isConnected());

    return () => {
      memorySocketClient.offNewMedia(handleNewMedia);
      memorySocketClient.disconnect();
    };
  }, [data?.memory?.id, queryClient, slug, recentlyUploadedIds, isUploading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading memory...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Memory Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The memory you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const { memory, mediaItems } = data;

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: memory.title,
      text: `Check out these photos from ${memory.title}!`,
      url: url,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        showSuccessToast('Shared successfully!');
      } else {
        // Fallback to copy link
        await navigator.clipboard.writeText(url);
        showSuccessToast('Link copied to clipboard!');
      }
    } catch (error: any) {
      // User cancelled share or error occurred
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
        // Try to copy to clipboard as fallback
        try {
          await navigator.clipboard.writeText(url);
          showSuccessToast('Link copied to clipboard!');
        } catch (clipboardError) {
          console.error('Clipboard fallback failed:', clipboardError);
        }
      }
    }
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      showSuccessToast('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showSuccessToast('Link copied to clipboard!');
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Dark Mode Toggle - Fixed Position */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white/20 dark:bg-gray-800/50 backdrop-blur-md border border-white/30 dark:border-gray-700 shadow-lg hover:scale-110 transition-all duration-300"
        aria-label="Toggle dark mode"
      >
        {theme === 'light' ? (
          <svg
            className="w-6 h-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-yellow-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </button>

      {/* Hero Header with Cover Image */}
      <header className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 text-white overflow-hidden transition-colors duration-300">
        {memory.coverUrl && (
          <div className="absolute inset-0 opacity-20">
            <img src={memory.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg animate-fade-in">
              {memory.title}
            </h1>
            {memory.description && (
              <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-4 drop-shadow">
                {memory.description}
              </p>
            )}
            <div className="flex items-center justify-center gap-2 text-white/80">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <time className="text-sm sm:text-base font-medium">
                {new Date(memory.eventDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            {/* Share Buttons */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/30 shadow-lg"
                aria-label="Share memory"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span>Share</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/30 shadow-lg"
                aria-label="Copy memory link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-indigo-50 to-transparent"></div>
      </header>

      {/* Connection status indicator */}
      {isConnected && (
        <div className="bg-emerald-500 px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <p className="text-sm font-medium text-white">
              Live Updates Active - New memories appear instantly!
            </p>
          </div>
        </div>
      )}

      {/* Upload Widget */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <UploadWidget
          slug={slug!}
          onUploadStart={() => setIsUploading(true)}
          onUploadComplete={(mediaId: string) => {
            recentlyUploadedIds.add(mediaId);
            setIsUploading(false);
          }}
        />
      </div>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Gallery mediaItems={mediaItems} isLoading={isLoading} />
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/90 text-sm font-medium">Made with ❤️ by Memory App</p>
          <p className="text-white/60 text-xs mt-2">Capturing moments that matter</p>
        </div>
      </footer>
    </div>
  );
};
