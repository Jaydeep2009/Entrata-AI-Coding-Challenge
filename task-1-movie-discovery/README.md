# Movie Discovery Application

A React-based movie search application using The Movie Database (TMDB) API.

## Features

- Search movies by title
- Display movie information (poster, title, release year, rating, overview, genres)
- Debounced search (300ms)
- Responsive design (1/2/3 column grid)
- Comprehensive error handling
- Loading states
- Empty and no-results states

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API Key:**
   
   Create a `.env.local` file in the project root:
   ```bash
   VITE_TMDB_API_KEY=your_api_key_here
   ```
   
   Get your free API key from: https://www.themoviedb.org/settings/api

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## Security Note

**⚠️ CLIENT-SIDE API KEY LIMITATION**

This implementation uses a **frontend-only architecture** where the TMDB API key is loaded from environment variables and bundled into the client-side JavaScript. 

**Security Implications:**
- The API key is **exposed** in the browser (visible in DevTools and bundled JS)
- Anyone can extract and potentially abuse the key
- This approach is **NOT suitable for production**

**Why this approach was chosen:**
- Time constraint of 120-minute coding challenge
- Focus on demonstrating core functionality and React architecture
- Acceptable for development/demo with a read-only TMDB API key

**Production-Ready Solution:**
A production application should use a **backend proxy**:
```
Frontend → Backend API → TMDB API
```
- API key stored securely on server
- Backend validates and rate-limits requests
- Key never exposed to clients

## Technology Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Testing:** Vitest + React Testing Library
- **HTTP Client:** Native fetch with AbortController

## Project Structure

```
src/
├── components/          # React components
│   ├── SearchBar.tsx
│   ├── MovieCard.tsx
│   ├── MovieGrid.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorMessage.tsx
│   └── EmptyState.tsx
├── hooks/              # Custom React hooks
│   └── useMovieSearch.ts
├── services/           # API services
│   └── movieApi.ts
├── types/              # TypeScript types
│   └── movie.ts
├── utils/              # Utility functions
│   ├── formatters.ts
│   └── genreMap.ts
└── test/               # Test setup
    └── setup.ts
```

## Testing

The test suite covers:
- API service (success, errors, timeout, network failures)
- Custom hooks (state management, request cancellation)
- Component behavior (search validation, rendering)
- User interactions

Run tests:
```bash
npm test              # Run once
npm test -- --watch   # Watch mode
npm test -- --ui      # UI mode
```

## Browser Support

Modern browsers supporting:
- ES2020+
- Fetch API
- AbortController
- CSS Grid

## Assumptions

1. **API Key:** Using TMDB v3 API key (not bearer token)
2. **Genre Mapping:** Hardcoded 19 TMDB genres (sufficient for MVP)
3. **Timeout:** 10-second request timeout
4. **Debounce:** 300ms delay for auto-search
5. **Overview Truncation:** 300 characters max
6. **Responsive Breakpoints:** 768px (tablet), 1024px (desktop)

## Known Limitations

1. Client-side API key exposure (see Security Note above)
2. No caching or request deduplication beyond duplicate query prevention
3. No pagination (shows first page of results only)
4. Genre mapping is static (not fetched from API)
5. No keyboard navigation enhancements
6. Basic accessibility (could be improved with ARIA labels)

## License

MIT
