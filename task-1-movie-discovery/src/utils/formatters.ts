export function formatReleaseYear(releaseDate: string | null): string {
  if (!releaseDate) {
    return 'Release date unknown';
  }
  
  // Extract year from ISO date format (YYYY-MM-DD)
  const year = releaseDate.substring(0, 4);
  return year || 'Release date unknown';
}

export function formatRating(rating: number): string {
  return `${rating.toFixed(1)}/10`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}
