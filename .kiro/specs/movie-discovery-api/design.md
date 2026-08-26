# Design Document: Movie Discovery API

## Overview

The Movie Discovery API is a React-based web application that provides an intuitive interface for searching movies using The Movie Database (TMDB) API. The application follows a component-based architecture with clear separation between UI components, business logic, and API communication layers.

**Key Design Principles:**
- **Simplicity First**: Focus on working MVP with minimal dependencies
- **Component Isolation**: Each component has a single, well-defined responsibility
- **Error-First Design**: Handle all error states explicitly and gracefully
- **Type Safety**: Use TypeScript to catch errors at compile time
- **Testability**: Design components and services for easy unit and integration testing

**Technology Stack:**
- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (fast development server, optimized builds)
- **HTTP Client**: Axios (better error handling than fetch)
- **Styling**: Tailwind CSS (rapid UI development, utility-first)
- **Testing**: Vitest + React Testing Library (fast, modern testing)
- **State Management**: React hooks (useState, useEffect, custom hooks)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              User Interface Layer               │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │SearchBar │  │MovieGrid │  │State         │  │
│  │          │  │          │  │Components    │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────┐
│            Custom Hooks Layer                   │
│  ┌──────────────────────────────────────────┐  │
│  │  useMovieSearch                          │  │
│  │  - State management                      │  │
│  │  - Search orchestration                  │  │
│  │  - Error handling                        │  │
│  └──────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────┐
│            Service Layer                        │
│  ┌──────────────────────────────────────────┐  │
│  │  MovieAPI Service                        │  │
│  │  - HTTP requests                         │  │
│  │  - Response parsing                      │  │
│  │  - Error transformation                  │  │
│  └──────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────┘
                     │
              ┌──────┴──────┐
              │  TMDB API   │
              │  (External) │
              └─────────────┘
```

### Component Hierarchy

```
App
├── SearchBar
│   ├── Input field (with debounce)
│   └── Search button
└── Content Area (conditional rendering)
    ├── EmptyState (initial state)
    ├── LoadingSpinner (during search)
    ├── ErrorMessage (on error)
    ├── NoResults (empty results)
    └── MovieGrid
        └── MovieCard (for each movie)
            ├── Poster image
            ├── Title
            ├── Release year
            ├── Rating
            ├── Overview
            └── Genres
```

## Components and Interfaces

### 1. App Component

**Responsibility**: Root component that orchestrates the search flow and manages global application state.

**Interface**:
```typescript
interface AppState {
  movies: Movie[];
  loading: boolean;
  error: Error | null;
  hasSearched: boolean;
}

function App(): JSX.Element
```

**Behavior**:
- Initializes the application
- Uses `useMovieSearch` custom hook for state management
- Conditionally renders content based on state
- Passes search handler to SearchBar
- Passes movie data to MovieGrid

### 2. SearchBar Component

**Responsibility**: Capture user input, validate, and trigger search with debouncing.

**Interface**:
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  disabled?: boolean;
}

function SearchBar({ onSearch, disabled }: SearchBarProps): JSX.Element
```

**Internal State**:
```typescript
interface SearchBarState {
  inputValue: string;
  validationError: string | null;
}
```

**Behavior**:
- Maintains local input value state
- Validates input (non-empty, non-whitespace)
- Applies debounce to prevent excessive API calls
- Handles both button click and Enter key press
- Displays validation errors inline
- Disables during loading state

### 3. MovieCard Component

**Responsibility**: Display a single movie's information in a visually appealing card format.

**Interface**:
```typescript
interface MovieCardProps {
  movie: Movie;
}

function MovieCard({ movie }: MovieCardProps): JSX.Element
```

**Behavior**:
- Renders poster image with fallback for missing posters
- Displays title with overflow handling
- Shows release year extracted from release_date
- Formats rating to one decimal place
- Truncates overview if longer than 300 characters
- Displays genre names or "N/A" if missing
- Responsive layout on different screen sizes

### 4. MovieGrid Component

**Responsibility**: Layout container for multiple MovieCard components with responsive grid.

**Interface**:
```typescript
interface MovieGridProps {
  movies: Movie[];
}

function MovieGrid({ movies }: MovieGridProps): JSX.Element
```

**Behavior**:
- Renders grid layout (1/2/3 columns based on viewport)
- Maps movie array to MovieCard components
- Handles empty array gracefully

### 5. LoadingSpinner Component

**Responsibility**: Provide visual feedback during asynchronous operations.

**Interface**:
```typescript
interface LoadingSpinnerProps {
  message?: string;
}

function LoadingSpinner({ message }: LoadingSpinnerProps): JSX.Element
```

**Behavior**:
- Displays animated spinner
- Shows optional loading message
- Centers content vertically and horizontally

### 6. ErrorMessage Component

**Responsibility**: Display user-friendly error messages with appropriate styling.

**Interface**:
```typescript
interface ErrorMessageProps {
  error: Error;
  onRetry?: () => void;
}

function ErrorMessage({ error, onRetry }: ErrorMessageProps): JSX.Element
```

**Behavior**:
- Maps error types to user-friendly messages
- Displays error icon
- Optionally shows retry button
- Uses distinct styling for visibility

### 7. EmptyState Component

**Responsibility**: Display initial state before any search is performed.

**Interface**:
```typescript
interface EmptyStateProps {
  message: string;
}

function EmptyState({ message }: EmptyStateProps): JSX.Element
```

**Behavior**:
- Shows search icon or illustration
- Displays instructional message
- Centers content in available space

### 8. NoResults Component

**Responsibility**: Display message when search returns no movies.

**Interface**:
```typescript
interface NoResultsProps {
  searchQuery: string;
}

function NoResults({ searchQuery }: NoResultsProps): JSX.Element
```

**Behavior**:
- Shows "no results" icon
- Displays search query that returned no results
- Suggests trying a different search

## Data Models

### Movie Type

```typescript
interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string; // ISO date format: "YYYY-MM-DD"
  vote_average: number; // 0-10 rating
  overview: string;
  genre_ids: number[];
}
```

### Genre Type

```typescript
interface Genre {
  id: number;
  name: string;
}
```

### API Response Type

```typescript
interface TMDBSearchResponse {
  page: number;
  results: Movie[];
  total_results: number;
  total_pages: number;
}
```

### Error Types

```typescript
class MovieAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isNetworkError: boolean = false,
    public isTimeout: boolean = false,
    public isRateLimit: boolean = false
  ) {
    super(message);
    this.name = 'MovieAPIError';
  }
}
```

### Service Layer

#### MovieAPI Service

**Responsibility**: Handle all communication with TMDB API, including request formatting, error handling, and response parsing.

**Interface**:
```typescript
class MovieAPIService {
  private apiKey: string;
  private baseURL: string = 'https://api.themoviedb.org/3';
  private timeout: number = 10000; // 10 seconds
  
  constructor(apiKey: string);
  
  async searchMovies(query: string, signal?: AbortSignal): Promise<Movie[]>;
  
  private buildSearchURL(query: string): string;
  
  private handleAPIError(error: any): MovieAPIError;
  
  private parseMovieResponse(response: TMDBSearchResponse): Movie[];
}
```

**Implementation Details**:

1. **Constructor**: 
   - Validates API key is present
   - Configures axios instance with baseURL and timeout
   - Sets up default headers

2. **searchMovies**:
   - Accepts search query and optional AbortSignal
   - Constructs request URL with query parameters
   - Makes GET request to `/search/movie` endpoint
   - Handles axios errors and transforms them to MovieAPIError
   - Parses response and returns Movie array
   - Returns empty array for valid no-results response

3. **buildSearchURL**:
   - Encodes query parameter properly
   - Adds API key to URL
   - Sets language to English (en-US)
   - Includes adult content filter (false)

4. **handleAPIError**:
   - Checks if error is network error (no response)
   - Checks if error is timeout (code: ECONNABORTED)
   - Checks if error is rate limit (status: 429)
   - Maps status codes to appropriate error messages
   - Returns MovieAPIError with appropriate flags

5. **parseMovieResponse**:
   - Validates response structure
   - Extracts results array
   - Validates each movie object has required fields
   - Returns parsed Movie array

### Custom Hooks

#### useMovieSearch Hook

**Responsibility**: Encapsulate movie search logic, state management, and side effects.

**Interface**:
```typescript
interface UseMovieSearchReturn {
  movies: Movie[];
  loading: boolean;
  error: MovieAPIError | null;
  hasSearched: boolean;
  searchMovies: (query: string) => Promise<void>;
  clearError: () => void;
}

function useMovieSearch(): UseMovieSearchReturn
```

**Implementation Details**:

1. **State Management**:
   - `movies`: Array of current search results
   - `loading`: Boolean indicating API call in progress
   - `error`: Current error state or null
   - `hasSearched`: Boolean to distinguish initial state from no results
   - `abortControllerRef`: Ref to store AbortController for request cancellation

2. **searchMovies Function**:
   - Cancels any in-flight request using AbortController
   - Creates new AbortController for current request
   - Sets loading to true, clears previous error
   - Calls MovieAPIService.searchMovies with query and abort signal
   - On success: updates movies state, sets hasSearched to true
   - On error: updates error state
   - Finally: sets loading to false

3. **Cleanup Effect**:
   - Uses useEffect to abort requests on unmount
   - Returns cleanup function that calls abortController.abort()

4. **clearError Function**:
   - Resets error state to null
   - Useful for dismissing error messages

#### useDebounce Hook

**Responsibility**: Delay execution of a function until a specified time has passed since the last call.

**Interface**:
```typescript
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void
```

**Implementation Details**:

1. **Timer Management**:
   - Uses useRef to store timeout ID
   - Clears existing timeout on each call
   - Sets new timeout that executes callback after delay
   - Returns wrapped function with same signature as callback

2. **Cleanup**:
   - Uses useEffect to clear timeout on unmount
   - Prevents memory leaks from orphaned timers

### Utility Functions

#### debounce Function

**Responsibility**: Create a debounced version of any function (non-hook utility).

**Interface**:
```typescript
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void
```

**Implementation**:
- Stores timeout ID in closure
- Clears existing timeout on each call
- Sets new timeout to execute function after delay
- Returns wrapped function

#### formatReleaseYear Function

**Responsibility**: Extract year from ISO date string.

**Interface**:
```typescript
function formatReleaseYear(releaseDate: string | null): string
```

**Implementation**:
- Returns empty string if releaseDate is null
- Extracts first 4 characters (YYYY) from ISO date
- Returns "Release date unknown" if invalid format

#### formatRating Function

**Responsibility**: Format movie rating to one decimal place.

**Interface**:
```typescript
function formatRating(rating: number): string
```

**Implementation**:
- Converts number to string with toFixed(1)
- Returns formatted rating with "/10" suffix

#### truncateText Function

**Responsibility**: Truncate text to specified length with ellipsis.

**Interface**:
```typescript
function truncateText(text: string, maxLength: number): string
```

**Implementation**:
- Returns original text if length <= maxLength
- Returns substring(0, maxLength) + "..." if longer

#### getGenreNames Function

**Responsibility**: Map genre IDs to genre names.

**Interface**:
```typescript
function getGenreNames(genreIds: number[]): string
```

**Implementation**:
- Maintains static map of genre IDs to names (TMDB genres)
- Maps each ID to name
- Joins with ", "
- Returns "N/A" if array is empty or no matches found

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I've identified the following redundancies and consolidations:

**Redundant Properties:**
- 1.2 and 8.1: Both test debounce delay of 300ms - consolidate into single property
- 8.3 and 8.4: Both test duplicate request prevention - consolidate into single property
- 1.4 and 1.5: Whitespace and empty validation can be combined - empty is edge case of whitespace

**Edge Cases to Handle in Generators:**
- Empty and whitespace-only inputs (1.4, 1.5)
- Movies with missing optional fields: poster (2.2), genres (2.3), release date (2.4)
- Empty results array (6.2)

**Properties That Imply Others:**
- Property about displaying all required fields (2.1) subsumes individual field checks
- Property about malformed responses (5.6) covers various invalid response types
- Round-trip property (10.4) validates serialization/deserialization together

**Combined Properties:**
Several error message tests (5.1-5.7) are specific examples rather than properties. These will be tested as unit test examples rather than property-based tests, except for malformed response handling which applies to a range of inputs.

### Correctness Properties

**Property 1: Search triggers with valid input**
*For any* non-empty, non-whitespace search query, clicking the search button should trigger the search function to be called with that query.
**Validates: Requirements 1.1**

**Property 2: Debounce delays execution**
*For any* sequence of function calls within a 300ms window, the debounced function should only execute once, 300ms after the last call.
**Validates: Requirements 1.2, 8.1**

**Property 3: Special characters preserved in search**
*For any* search query containing special characters (e.g., @, #, %, &, !), the query should be passed to the API service without modification.
**Validates: Requirements 1.3**

**Property 4: Whitespace-only input rejected**
*For any* string composed entirely of whitespace characters (spaces, tabs, newlines), the search should be prevented and a validation message should be displayed.
**Validates: Requirements 1.4, 1.5**

**Property 5: All required movie fields displayed**
*For any* movie object, the rendered output should contain the poster (or placeholder), title, release year (or "unknown"), rating formatted to one decimal, overview (truncated if needed), and genres (or "N/A").
**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

**Property 6: Text truncation preserves prefix**
*For any* text string longer than 300 characters, truncating it should result in a string of exactly 303 characters (300 + "...") where the first 300 characters match the original.
**Validates: Requirements 2.5**

**Property 7: HTTPS used for all requests**
*For any* API request, the URL should use HTTPS protocol.
**Validates: Requirements 3.4**

**Property 8: Timeout aborts long requests**
*For any* API request that takes longer than 10 seconds, the request should be aborted and a timeout error should be returned.
**Validates: Requirements 3.5**

**Property 9: Loading state reflects in-progress search**
*For any* search request while it is in progress, the loading state should be true, and upon completion (success or failure) the loading state should be false.
**Validates: Requirements 4.2**

**Property 10: Successful search displays results**
*For any* successful API response containing movie results, those movies should be stored in state and displayed to the user.
**Validates: Requirements 4.3**

**Property 11: Empty results shows no-results state**
*For any* search query that returns an empty results array, the no-results message should be displayed.
**Validates: Requirements 4.4**

**Property 12: Failed search displays error**
*For any* search request that fails with an error, the error state should be set and an error message should be displayed.
**Validates: Requirements 4.5**

**Property 13: Malformed responses handled gracefully**
*For any* API response that is missing required fields (e.g., no results array) or contains invalid data types, the system should catch the error and display "Unexpected response from server."
**Validates: Requirements 5.6, 6.4**

**Property 14: Response structure validated**
*For any* API response, the validator should verify that a results array exists before attempting to parse movies.
**Validates: Requirements 6.1**

**Property 15: Default values for missing optional fields**
*For any* movie object missing optional fields (poster_path, genre_ids, release_date), the system should provide appropriate default values (placeholder, empty array, null) without throwing errors.
**Validates: Requirements 6.3**

**Property 16: Invalid JSON handled**
*For any* response body that is not valid JSON, the parser should catch the error and return an error state.
**Validates: Requirements 6.5**

**Property 17: Overlapping searches cancel previous**
*For any* two search requests where the second starts before the first completes, the first request should be cancelled via AbortController.
**Validates: Requirements 8.2**

**Property 18: Duplicate queries avoided**
*For any* search query that is identical to the most recent successful query, the system should not make a new API request.
**Validates: Requirements 8.3, 8.4**

**Property 19: Unmount cancels in-flight requests**
*For any* component unmounting while an API request is in progress, the request should be aborted and no state updates should occur.
**Validates: Requirements 9.1, 9.2**

**Property 20: Unmount clears debounce timers**
*For any* component unmounting while a debounce timer is active, the timer should be cleared to prevent memory leaks.
**Validates: Requirements 9.3**

**Property 21: JSON deserialized to typed objects**
*For any* valid TMDB API response, the JSON should be successfully parsed into an array of Movie objects with correct TypeScript types.
**Validates: Requirements 10.1**

**Property 22: Release dates formatted as year**
*For any* movie with a release_date in ISO format ("YYYY-MM-DD"), extracting the year should return the first 4 characters.
**Validates: Requirements 10.2**

**Property 23: Ratings formatted to one decimal**
*For any* movie rating (number between 0-10), formatting should produce a string with exactly one decimal place (e.g., "7.5").
**Validates: Requirements 10.3**

**Property 24: Movie data round-trip preservation**
*For any* valid movie object received from the API, the required fields (id, title, poster_path, release_date, vote_average, overview, genre_ids) should be preserved when parsed and then prepared for display.
**Validates: Requirements 10.4**

## Error Handling

### Error Classification

The system categorizes errors into the following types:

1. **Network Errors**: No response received from server
   - Cause: Internet connection issues, DNS failure, server unreachable
   - Handling: Display network error message, suggest checking connection
   - Recovery: User can retry after checking connectivity

2. **Timeout Errors**: Request exceeds 10-second timeout
   - Cause: Slow server response, network congestion
   - Handling: Abort request, display timeout message
   - Recovery: User can retry immediately

3. **Authentication Errors** (401): Invalid or missing API key
   - Cause: Incorrect API key configuration
   - Handling: Display configuration error message
   - Recovery: User must fix environment configuration

4. **Rate Limit Errors** (429): Too many requests
   - Cause: Exceeded TMDB API rate limits
   - Handling: Display rate limit message, suggest waiting
   - Recovery: User should wait before retrying

5. **Client Errors** (400-499): Invalid request parameters
   - Cause: Malformed query, invalid endpoint
   - Handling: Display user-friendly error message
   - Recovery: Depends on specific error

6. **Server Errors** (500-599): TMDB server issues
   - Cause: Server downtime, internal server errors
   - Handling: Display server error message
   - Recovery: User can retry later

7. **Validation Errors**: Invalid user input
   - Cause: Empty or whitespace-only search query
   - Handling: Display validation message inline
   - Recovery: User must provide valid input

8. **Parsing Errors**: Malformed API response
   - Cause: Unexpected response structure, invalid JSON
   - Handling: Display unexpected response message
   - Recovery: User can retry, may be transient issue

### Error Recovery Strategies

**Automatic Recovery:**
- Request cancellation on component unmount (prevents memory leaks)
- Debounce timeout clearing (prevents orphaned timers)
- Abort signal cleanup (cancels in-flight requests)

**User-Initiated Recovery:**
- Retry button on error messages (for transient failures)
- Clear error button (dismiss error and return to ready state)
- New search (clears previous error state)

**Preventive Measures:**
- Input validation before API calls
- Request deduplication (prevent unnecessary calls)
- Timeout enforcement (prevent infinite waiting)
- AbortController for cancellation (prevent resource leaks)

### Error Message Mapping

```typescript
function getErrorMessage(error: MovieAPIError): string {
  if (error.isNetworkError) {
    return "Unable to connect. Check your internet connection.";
  }
  
  if (error.isTimeout) {
    return "Request timed out. Please try again.";
  }
  
  if (error.isRateLimit) {
    return "Too many requests. Please wait a moment and try again.";
  }
  
  switch (error.statusCode) {
    case 401:
      return "Invalid API key. Please check your configuration.";
    case 404:
      return "No movies found matching your search.";
    case 500:
    case 502:
    case 503:
      return "Server error. Please try again later.";
    default:
      return "Unexpected response from server.";
  }
}
```

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests and property-based tests to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, error conditions, and integration points
- **Property-Based Tests**: Verify universal properties across randomly generated inputs (minimum 100 iterations per test)

Both testing approaches are complementary and necessary for robust validation.

### Unit Test Coverage

**Component Tests:**

1. **SearchBar.test.tsx**
   - Renders input field and search button
   - Handles Enter key press to trigger search
   - Displays validation error for empty input
   - Disables during loading state
   - Calls onSearch prop with trimmed input value

2. **MovieCard.test.tsx**
   - Renders all movie information correctly
   - Shows placeholder when poster_path is null
   - Displays "N/A" when genre_ids is empty
   - Shows "Release date unknown" when release_date is null
   - Truncates long overviews

3. **MovieGrid.test.tsx**
   - Renders correct number of MovieCard components
   - Handles empty movie array
   - Applies responsive grid classes

4. **ErrorMessage.test.tsx**
   - Displays network error message
   - Displays 401 error message
   - Displays 429 rate limit message
   - Displays 404 not found message
   - Displays 500 server error message
   - Displays timeout error message
   - Displays malformed response message
   - Shows retry button when onRetry prop provided

5. **LoadingSpinner.test.tsx**
   - Renders spinner element
   - Displays optional message

6. **EmptyState.test.tsx**
   - Renders message prop
   - Centers content

7. **NoResults.test.tsx**
   - Displays search query
   - Shows no-results message

8. **App.test.tsx** (Integration)
   - Initial render shows empty state
   - Search triggers loading state
   - Successful search displays movies
   - Failed search displays error
   - Empty results show no-results message
   - Error state shows error message with retry

**Service Tests:**

1. **movieApi.test.ts**
   - Successfully fetches and parses movies
   - Handles network errors
   - Handles timeout errors
   - Handles 401 authentication errors
   - Handles 429 rate limit errors
   - Handles 500 server errors
   - Handles malformed JSON responses
   - Handles missing results array
   - Includes API key in requests
   - Uses HTTPS URLs
   - Cancels request with AbortSignal
   - Returns empty array for empty results

**Hook Tests:**

1. **useMovieSearch.test.ts**
   - Initial state is correct (empty movies, not loading, no error, not searched)
   - searchMovies sets loading to true
   - Successful search updates movies state
   - Failed search sets error state
   - Cancels previous request when new search initiated
   - Cleans up on unmount
   - clearError resets error state

2. **useDebounce.test.ts**
   - Delays callback execution by specified delay
   - Cancels previous timeout on new call
   - Cleans up timeout on unmount

**Utility Tests:**

1. **debounce.test.ts**
   - Returns debounced function
   - Delays execution by specified time
   - Resets timer on each call
   - Executes with correct arguments

2. **formatReleaseYear.test.ts**
   - Extracts year from ISO date
   - Returns empty string for null
   - Returns "Release date unknown" for invalid format

3. **formatRating.test.ts**
   - Formats number to one decimal place
   - Adds "/10" suffix

4. **truncateText.test.ts**
   - Returns original text when shorter than max
   - Truncates and adds ellipsis when longer
   - Handles empty strings

5. **getGenreNames.test.ts**
   - Maps genre IDs to names
   - Returns "N/A" for empty array
   - Returns "N/A" for unknown IDs

### Property-Based Test Coverage

Each property-based test should run minimum 100 iterations with randomly generated inputs and include a comment tag referencing the design property:

**Property Test 1: Search triggers with valid input**
```typescript
// Feature: movie-discovery-api, Property 1: Search triggers with valid input
```
- Generate random non-empty, non-whitespace strings
- Verify search function called with exact query
- **Validates: Requirements 1.1**

**Property Test 2: Debounce delays execution**
```typescript
// Feature: movie-discovery-api, Property 2: Debounce delays execution
```
- Generate random sequences of calls within 300ms
- Verify callback executes once, after last call + 300ms
- **Validates: Requirements 1.2, 8.1**

**Property Test 3: Special characters preserved**
```typescript
// Feature: movie-discovery-api, Property 3: Special characters preserved in search
```
- Generate random strings with special characters
- Verify passed to API service unchanged
- **Validates: Requirements 1.3**

**Property Test 4: Whitespace input rejected**
```typescript
// Feature: movie-discovery-api, Property 4: Whitespace-only input rejected
```
- Generate random whitespace-only strings
- Verify search prevented and validation shown
- **Validates: Requirements 1.4, 1.5**

**Property Test 5: All movie fields displayed**
```typescript
// Feature: movie-discovery-api, Property 5: All required movie fields displayed
```
- Generate random movie objects (with and without optional fields)
- Verify rendered output contains all required information
- **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

**Property Test 6: Text truncation preserves prefix**
```typescript
// Feature: movie-discovery-api, Property 6: Text truncation preserves prefix
```
- Generate random strings longer than 300 characters
- Verify truncated string is 303 chars with matching prefix
- **Validates: Requirements 2.5**

**Property Test 7: HTTPS used for requests**
```typescript
// Feature: movie-discovery-api, Property 7: HTTPS used for all requests
```
- Generate random search queries
- Verify all generated URLs use HTTPS
- **Validates: Requirements 3.4**

**Property Test 8: Timeout aborts requests**
```typescript
// Feature: movie-discovery-api, Property 8: Timeout aborts long requests
```
- Mock delayed API responses (>10 seconds)
- Verify requests are aborted and timeout error returned
- **Validates: Requirements 3.5**

**Property Test 9: Loading state during search**
```typescript
// Feature: movie-discovery-api, Property 9: Loading state reflects in-progress search
```
- Generate random search queries
- Verify loading true during request, false after completion
- **Validates: Requirements 4.2**

**Property Test 10: Successful search displays results**
```typescript
// Feature: movie-discovery-api, Property 10: Successful search displays results
```
- Generate random movie result arrays
- Verify movies stored in state and displayed
- **Validates: Requirements 4.3**

**Property Test 11: Empty results shows no-results**
```typescript
// Feature: movie-discovery-api, Property 11: Empty results shows no-results state
```
- Mock empty results array
- Verify no-results message displayed
- **Validates: Requirements 4.4**

**Property Test 12: Failed search displays error**
```typescript
// Feature: movie-discovery-api, Property 12: Failed search displays error
```
- Generate random error scenarios
- Verify error state set and message displayed
- **Validates: Requirements 4.5**

**Property Test 13: Malformed responses handled**
```typescript
// Feature: movie-discovery-api, Property 13: Malformed responses handled gracefully
```
- Generate random malformed responses (missing fields, wrong types)
- Verify error caught and appropriate message shown
- **Validates: Requirements 5.6, 6.4**

**Property Test 14: Response structure validated**
```typescript
// Feature: movie-discovery-api, Property 14: Response structure validated
```
- Generate random API responses (valid and invalid)
- Verify results array existence checked before parsing
- **Validates: Requirements 6.1**

**Property Test 15: Default values for missing fields**
```typescript
// Feature: movie-discovery-api, Property 15: Default values for missing optional fields
```
- Generate movie objects with randomly missing optional fields
- Verify defaults applied without errors
- **Validates: Requirements 6.3**

**Property Test 16: Invalid JSON handled**
```typescript
// Feature: movie-discovery-api, Property 16: Invalid JSON handled
```
- Generate random invalid JSON strings
- Verify parsing error caught and error state returned
- **Validates: Requirements 6.5**

**Property Test 17: Overlapping searches cancel previous**
```typescript
// Feature: movie-discovery-api, Property 17: Overlapping searches cancel previous
```
- Generate pairs of overlapping search requests
- Verify first request cancelled via AbortController
- **Validates: Requirements 8.2**

**Property Test 18: Duplicate queries avoided**
```typescript
// Feature: movie-discovery-api, Property 18: Duplicate queries avoided
```
- Generate sequences with duplicate queries
- Verify API not called for duplicates
- **Validates: Requirements 8.3, 8.4**

**Property Test 19: Unmount cancels requests**
```typescript
// Feature: movie-discovery-api, Property 19: Unmount cancels in-flight requests
```
- Generate random component lifecycle scenarios
- Verify requests aborted on unmount, no state updates occur
- **Validates: Requirements 9.1, 9.2**

**Property Test 20: Unmount clears timers**
```typescript
// Feature: movie-discovery-api, Property 20: Unmount clears debounce timers
```
- Generate scenarios with active timers at unmount
- Verify timers cleared, no memory leaks
- **Validates: Requirements 9.3**

**Property Test 21: JSON deserialized correctly**
```typescript
// Feature: movie-discovery-api, Property 21: JSON deserialized to typed objects
```
- Generate random valid TMDB responses
- Verify successful parsing to Movie objects with correct types
- **Validates: Requirements 10.1**

**Property Test 22: Release dates formatted as year**
```typescript
// Feature: movie-discovery-api, Property 22: Release dates formatted as year
```
- Generate random ISO date strings
- Verify year extraction returns first 4 characters
- **Validates: Requirements 10.2**

**Property Test 23: Ratings formatted correctly**
```typescript
// Feature: movie-discovery-api, Property 23: Ratings formatted to one decimal
```
- Generate random rating numbers (0-10)
- Verify formatting produces one decimal place
- **Validates: Requirements 10.3**

**Property Test 24: Movie data round-trip**
```typescript
// Feature: movie-discovery-api, Property 24: Movie data round-trip preservation
```
- Generate random valid movie objects
- Verify all required fields preserved through parse and display preparation
- **Validates: Requirements 10.4**

### Test Configuration

**Framework Setup:**
- Test Runner: Vitest (fast, modern, ESM support)
- React Testing: React Testing Library (user-centric)
- Property Testing: fast-check library
- Mocking: vi.mock from Vitest
- Coverage: Vitest coverage (c8/istanbul)

**Property Test Configuration:**
```typescript
import fc from 'fast-check';

// Configure to run minimum 100 iterations
fc.assert(
  fc.property(/* generators */, (/* inputs */) => {
    // test implementation
  }),
  { numRuns: 100 }
);
```

**Coverage Targets:**
- Overall: >80% code coverage
- Critical paths (API service, hooks): >90%
- UI components: >75%
- Utility functions: 100%

### Testing Best Practices

1. **Arrange-Act-Assert Pattern**: Structure all tests clearly
2. **Isolated Tests**: Each test is independent, no shared state
3. **Mock External Dependencies**: Mock axios, TMDB API calls
4. **Test User Behavior**: Use React Testing Library queries (getByRole, getByText)
5. **Avoid Implementation Details**: Don't test internal state, test observable behavior
6. **Meaningful Assertions**: Use specific matchers (toHaveBeenCalledWith vs toHaveBeenCalled)
7. **Edge Case Coverage**: Test boundary conditions in unit tests
8. **Property Test Generators**: Use appropriate fast-check arbitraries
9. **Async Handling**: Use waitFor, findBy queries for async operations
10. **Cleanup**: Ensure proper cleanup after each test (mocks, timers, DOM)
