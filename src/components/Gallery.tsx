import { useState } from 'react';
import type { MediaItem } from '@/types';

interface GalleryProps {
  mediaItems: MediaItem[];
}

export const Gallery = ({ mediaItems }: GalleryProps) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Set<string>>(new Set());

  if (mediaItems.length === 0) {
    return (
      <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 blur-2xl opacity-20 animate-pulse"></div>
          <svg
            className="relative mx-auto h-24 w-24 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="mt-6 text-2xl font-bold text-gray-900">No photos or videos yet</h3>
        <p className="mt-3 text-gray-600 text-lg">Be the first to share a memory!</p>
        <div className="mt-4 inline-flex items-center gap-2 text-purple-600 font-medium">
          <svg className="w-5 h-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Click the button above to start
        </div>
      </div>
    );
  }

  const handleImageLoad = (mediaId: string) => {
    setImageLoaded((prev) => new Set(prev).add(mediaId));
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {mediaItems.map((media) => (
          <div
            key={media.id}
            className="group relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:z-10"
            onClick={() => setSelectedMedia(media)}
          >
            {media.mimeType.startsWith('image/') ? (
              <>
                {!imageLoaded.has(media.id) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-600"></div>
                      <div className="absolute inset-0 rounded-full bg-purple-100 animate-pulse opacity-20"></div>
                    </div>
                  </div>
                )}
                <img
                  src={media.url}
                  alt={media.filename}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded.has(media.id) ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => handleImageLoad(media.id)}
                  loading="lazy"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs font-medium truncate drop-shadow-lg">
                      {new Date(media.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <video src={media.url} className="w-full h-full object-cover" muted playsInline />
                {/* Video play icon */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                  <div className="bg-white/90 rounded-full p-3 group-hover:scale-110 transition-transform shadow-xl">
                    <svg
                      className="w-8 h-8 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-all transform hover:scale-110 hover:rotate-90 duration-300 bg-white/10 backdrop-blur-md rounded-full p-3 hover:bg-white/20"
            onClick={() => setSelectedMedia(null)}
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div
            className="max-w-7xl max-h-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.mimeType.startsWith('image/') ? (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.filename}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl touch-pinch-zoom"
                style={{ userSelect: 'none' }}
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                playsInline
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
              >
                Your browser does not support the video tag.
              </video>
            )}

            <div className="mt-6 text-center bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-white font-semibold text-sm sm:text-base">
                {selectedMedia.filename}
              </p>
              <p className="text-white/70 text-xs sm:text-sm mt-2 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {new Date(selectedMedia.uploadedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
