import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { memorySocketClient } from "@/lib/socket-client";
import { UploadWidget } from "@/components/UploadWidget";
import { Gallery } from "@/components/Gallery";
import type { MediaItem } from "@/types";

export const MemoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  // Fetch memory data
  const { data, isLoading, error } = useQuery({
    queryKey: ["memory", slug],
    queryFn: () => apiClient.getMemoryBySlug(slug!),
    enabled: !!slug,
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!data?.memory?.id) return;

    memorySocketClient.connect(data.memory.id);

    const handleNewMedia = (mediaItem: MediaItem) => {
      // Add new media to the query cache
      queryClient.setQueryData(["memory", slug], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          mediaItems: [mediaItem, ...old.mediaItems],
        };
      });
    };

    memorySocketClient.onNewMedia(handleNewMedia);
    setIsConnected(memorySocketClient.isConnected());

    return () => {
      memorySocketClient.offNewMedia(handleNewMedia);
      memorySocketClient.disconnect();
    };
  }, [data?.memory?.id, queryClient, slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading memory...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Memory Not Found
          </h1>
          <p className="text-gray-600">
            The memory you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const { memory, mediaItems } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Hero Header with Cover Image */}
      <header className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        {memory.coverUrl && (
          <div className="absolute inset-0 opacity-20">
            <img
              src={memory.coverUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
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
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <time className="text-sm sm:text-base font-medium">
                {new Date(memory.eventDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
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
        <UploadWidget slug={slug!} />
      </div>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Gallery mediaItems={mediaItems} />
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/90 text-sm font-medium">
            Made with ❤️ by Memory App
          </p>
          <p className="text-white/60 text-xs mt-2">
            Capturing moments that matter
          </p>
        </div>
      </footer>
    </div>
  );
};
