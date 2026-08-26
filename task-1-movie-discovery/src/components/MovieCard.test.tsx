import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MovieCard } from './MovieCard';
import type { Movie } from '../types/movie';

describe('MovieCard', () => {
  const mockMovie: Movie = {
    id: 1,
    title: 'Inception',
    poster_path: '/inception.jpg',
    release_date: '2010-07-16',
    vote_average: 8.8,
    overview: 'A thief who steals corporate secrets through dream-sharing technology.',
    genre_ids: [28, 878, 53],
  };

  it('renders all movie information correctly', () => {
    render(<MovieCard movie={mockMovie} />);

    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('2010')).toBeInTheDocument();
    expect(screen.getByText('8.8/10')).toBeInTheDocument();
    expect(screen.getByText(/A thief who steals/)).toBeInTheDocument();
    expect(screen.getByText(/Action, Science Fiction, Thriller/)).toBeInTheDocument();
  });

  it('shows placeholder when poster_path is null', () => {
    const movieWithoutPoster = { ...mockMovie, poster_path: null };
    render(<MovieCard movie={movieWithoutPoster} />);

    const img = screen.getByAltText('Inception poster');
    expect(img).toHaveAttribute('src', expect.stringContaining('placeholder'));
  });

  it('displays "N/A" when genre_ids is empty', () => {
    const movieWithoutGenres = { ...mockMovie, genre_ids: [] };
    render(<MovieCard movie={movieWithoutGenres} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('displays "Release date unknown" when release_date is empty', () => {
    const movieWithoutDate = { ...mockMovie, release_date: '' };
    render(<MovieCard movie={movieWithoutDate} />);

    expect(screen.getByText('Release date unknown')).toBeInTheDocument();
  });

  it('truncates long overviews', () => {
    const longOverview = 'A'.repeat(400);
    const movieWithLongOverview = { ...mockMovie, overview: longOverview };
    
    render(<MovieCard movie={movieWithLongOverview} />);

    const overviewElement = screen.getByText(/A+\.\.\./);
    expect(overviewElement.textContent).toHaveLength(303); // 300 + "..."
  });
});
