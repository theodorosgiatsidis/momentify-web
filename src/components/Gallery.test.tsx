import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Gallery } from '../Gallery';
import type { MediaItem } from '@/types';

const mockMediaItems: MediaItem[] = [
  {
    id: '1',
    memoryId: 'mem1',
    filename: 'photo1.jpg',
    url: 'https://example.com/photo1.jpg',
    mimeType: 'image/jpeg',
    size: 1024,
    width: 1920,
    height: 1080,
    uploadedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    memoryId: 'mem1',
    filename: 'video1.mp4',
    url: 'https://example.com/video1.mp4',
    mimeType: 'video/mp4',
    size: 2048,
    width: 1920,
    height: 1080,
    duration: 30,
    uploadedAt: new Date('2024-01-15'),
  },
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Gallery', () => {
  it('renders empty state when no media items', () => {
    renderWithProviders(<Gallery mediaItems={[]} />);
    expect(screen.getByText(/no photos or videos yet/i)).toBeInTheDocument();
  });

  it('renders media items in grid', () => {
    renderWithProviders(<Gallery mediaItems={mockMediaItems} />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(1); // One image (video doesn't have role="img")
  });

  it('displays correct number of media items', () => {
    const { container } = renderWithProviders(<Gallery mediaItems={mockMediaItems} />);
    const gridItems = container.querySelectorAll('.aspect-square');
    expect(gridItems).toHaveLength(2);
  });
});
