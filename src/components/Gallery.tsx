import { useState, useEffect, useRef, useCallback } from 'react';
import { showSuccessToast, showErrorToast } from '@/lib/toast-utils';
import type { MediaItem } from '@/types';

interface GalleryProps {
  mediaItems: MediaItem[];
}

export const Gallery = ({ mediaItems }: GalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Set<string>>(new Set());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  const selectedMedia = selectedIndex !== null ? mediaItems[selectedIndex] : null;

  const handleDownload = async () => {
    if (!selectedMedia) return;

    try {
      const response = await fetch(selectedMedia.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = selectedMedia.filename || `memory-${Date.now()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccessToast('Download started!');
    } catch (error) {
      console.error('Download failed:', error);
      showErrorToast('Failed to download file');
    }
  };

  const handleImageLoad = (mediaId: string) => {
    setImageLoaded((prev) => new Set(prev).add(mediaId));
  };

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setSlideDirection(null);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    setTouchOffset({ x: 0, y: 0 });
  };

  const goToNext = useCallback(() => {
    if (selectedIndex === null) return;
    const nextIndex = (selectedIndex + 1) % mediaItems.length;
    setSlideDirection('left');
    setTimeout(() => {
      setSelectedIndex(nextIndex);
      setTimeout(() => setSlideDirection(null), 50);
    }, 300);
  }, [selectedIndex, mediaItems.length]);

  const goToPrevious = useCallback(() => {
    if (selectedIndex === null) return;
    const prevIndex = selectedIndex === 0 ? mediaItems.length - 1 : selectedIndex - 1;
    setSlideDirection('right');
    setTimeout(() => {
      setSelectedIndex(prevIndex);
      setTimeout(() => setSlideDirection(null), 50);
    }, 300);
  }, [selectedIndex, mediaItems.length]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      else if (e.key === 'ArrowRight') goToNext();
      else if (e.key === 'Escape') closeLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, goToNext, goToPrevious]);

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Only allow vertical swipe down to close
    if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0) {
      setTouchOffset({ x: 0, y: deltaY });
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart) return;

    // Close if swiped down more than 100px
    if (touchOffset.y > 100) {
      closeLightbox();
    } else {
      setTouchOffset({ x: 0, y: 0 });
    }

    setTouchStart(null);
  };

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

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {mediaItems.map((media, index) => (
          <div
            key={media.id}
            className="group relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:z-10"
            onClick={() => openLightbox(index)}
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
          ref={modalRef}
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translateY(${touchOffset.y}px)`,
            opacity: touchOffset.y > 0 ? 1 - touchOffset.y / 300 : 1,
            transition: touchStart ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
          }}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-all transform hover:scale-110 hover:rotate-90 duration-300 bg-white/10 backdrop-blur-md rounded-full p-3 hover:bg-white/20 z-10"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
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

          {/* Download button */}
          <button
            className="absolute top-4 right-20 text-white hover:text-gray-300 transition-all transform hover:scale-110 duration-300 bg-white/10 backdrop-blur-md rounded-full p-3 hover:bg-white/20 z-10"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            aria-label="Download"
            title="Download"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>

          {/* Previous button */}
          {mediaItems.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-all transform hover:scale-110 duration-300 bg-white/10 backdrop-blur-md rounded-full p-3 hover:bg-white/20 z-10"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              aria-label="Previous"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Next button */}
          {mediaItems.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-all transform hover:scale-110 duration-300 bg-white/10 backdrop-blur-md rounded-full p-3 hover:bg-white/20 z-10"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              aria-label="Next"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Media content */}
          <div
            className={`max-w-7xl max-h-full ${
              slideDirection === 'left'
                ? 'animate-slide-out-left'
                : slideDirection === 'right'
                  ? 'animate-slide-out-right'
                  : 'animate-slide-in-new'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.mimeType.startsWith('image/') ? (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.filename}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
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
              {mediaItems.length > 1 && (
                <p className="text-white/50 text-xs mt-2">
                  {selectedIndex! + 1} / {mediaItems.length}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
