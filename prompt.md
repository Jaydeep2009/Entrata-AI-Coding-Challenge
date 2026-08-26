# AI Prompt Log

This document records the prompts actually used with AI tools during the Entrata AI Technical Coding Challenge.

The prompts are grouped by task to show the development workflow, including requirement analysis, design review, implementation, debugging, and iterative refinement.

---

# Task 1 — Movie Discovery API Page

## Prompt 1 — Requirements Analysis & Architecture

```text
I need to build Task 1 of the Entrata AI Technical Coding Challenge: a Movie Discovery API Page.

Before writing or modifying any code, first analyze the requirement and inspect the current repository structure. I want a practical implementation plan that we can execute incrementally.

The feature should allow a user to search for movies by title using a public movie API such as TMDB and display useful movie information including:
- poster
- movie title
- release year/date
- rating
- overview
- genres

The application should also provide a good user experience for:
- initial/empty state
- loading state while searching
- no-results state
- invalid or empty search input
- API failures
- network failures/timeouts
- API rate-limit responses
- malformed or unexpected API responses

The search should be triggered either by a Search button or with a reasonable debounce strategy. Avoid unnecessary API requests.

For the implementation, prioritize:
1. A working end-to-end MVP first.
2. Clear separation of UI, API/service logic, and state management.
3. Simple, maintainable and readable code rather than over-engineering.
4. Reuse of components and utilities where appropriate.
5. Proper validation and error handling.
6. Responsive UI that works well on desktop and mobile.
7. Testable code with meaningful unit/component tests for important behavior.
8. Secure handling of the movie API key using environment variables. Do not hardcode secrets or commit .env files.
9. Avoid unnecessary dependencies and avoid changing unrelated files.

Since this repository is currently being prepared for the challenge, recommend an appropriate lightweight frontend stack and project structure. Prefer technologies that are straightforward to run and explain during a live technical discussion.

For this first step, DO NOT implement the feature yet.

Instead, provide:
- your recommended tech stack and why
- proposed project/file structure
- component responsibilities
- API/service design
- state and error-handling approach
- testing strategy
- important edge cases
- any assumptions you are making
- an implementation plan broken into small, logical steps

Keep the plan realistic for a 120-minute coding challenge. Prioritize the core requirements first and identify which improvements can be added after the MVP is working.

Do not modify prompt.md in this step; I will maintain the prompt log separately.
```

## Prompt 2 — Design Review & Simplification

```text
Review the design you just produced against the original requirements and the 120-minute challenge constraint.

Before implementation, I want to simplify and validate the design rather than automatically implementing every item in the current document.

Please specifically review these areas:

1. API key security:
The current design has the React client calling TMDB directly while loading the API key from environment variables. Explain the actual security implications of exposing a client-side API key and determine whether the challenge requirements can be satisfied with this architecture. Compare a direct frontend-to-TMDB approach with a lightweight backend/proxy approach. Recommend the simplest option that is technically appropriate for the requirements and realistic within 120 minutes.

2. Testing scope:
The current design proposes 24 property-based tests with 100 iterations each, in addition to a large unit/integration test suite. This may be excessive for a 120-minute challenge. Reduce the testing strategy to focus on high-value tests that demonstrate correctness, edge-case handling, error handling, and critical-path coverage. Keep the test suite realistic to implement and explain.

3. Debouncing:
The design currently contains both a useDebounce hook and a separate debounce utility. Remove unnecessary duplication and recommend one clear approach.

4. HTTP client:
Evaluate whether Axios is actually necessary. Compare it briefly with native fetch, especially considering timeout handling, AbortController, error handling, and dependency count. Choose the simpler option unless Axios provides a meaningful advantage.

5. Requirement consistency:
Check the design against every original acceptance criterion and identify any requirement that is ambiguous, contradictory, or not fully addressed. In particular, resolve the interaction between button-triggered search and debounced search.

6. Architecture:
Keep the architecture simple and explainable:
UI → state/search orchestration → API service → external API.
Avoid introducing abstractions that do not provide clear value for this challenge.

7. Time prioritization:
Divide the implementation into:
- Must-have MVP
- Important quality/error-handling improvements
- Optional polish if time remains

The final design should optimize for functional completeness, clean architecture, meaningful testing, good UX, security, and explainability rather than maximizing the number of files, abstractions, or tests.

Do not implement code yet.

Return:
- revised architecture
- revised technology choices
- revised project structure
- security decision
- testing strategy
- requirement/ambiguity findings
- 120-minute implementation priority plan
- any assumptions that should be documented in README.md
```

## Prompt 3 — MVP Implementation

```text
The revised design is approved with the following decisions:

- React + TypeScript + Vite
- Tailwind CSS
- Native fetch with AbortController
- Vitest + React Testing Library
- Frontend-only architecture for this time-constrained challenge
- API key loaded from environment variables and never committed
- The README must explicitly document the client-side API-key security limitation and explain that a production implementation would use a backend proxy
- Keep the architecture simple and maintainable
- No Axios
- No property-testing library for the MVP
- No unnecessary abstractions
- Approximately 12–15 focused tests covering critical behavior

Now begin implementation of Task 1.

IMPORTANT: Implement this incrementally rather than generating an unnecessarily large codebase.

Phase 1 — Project setup and MVP:
1. Create the Vite React TypeScript project inside:
   task-1-movie-discovery/
2. Configure Tailwind CSS.
3. Configure TypeScript and testing with Vitest + React Testing Library.
4. Create the agreed folder structure.
5. Implement the TMDB API service using native fetch and AbortController.
6. Implement timeout handling at 10 seconds.
7. Implement HTTP error handling for 401, 404, 429, and 500+ responses.
8. Validate the API response before using it.
9. Implement useMovieSearch for loading, success, error, cancellation, and duplicate-query handling.
10. Implement the SearchBar with validation and 300ms debounced search behavior.
11. Implement MovieCard and MovieGrid.
12. Implement initial, loading, results, no-results, and error states.
13. Implement responsive 1/2/3-column layout.
14. Implement missing poster, release date, genre, rating, title overflow, and overview truncation behavior.

Before moving to optional polish, make sure the MVP works end-to-end with a real TMDB API request.

Security:
- Never hardcode the API key.
- Use an environment variable.
- Create .env.example containing the required variable name but no real secret.
- Ensure .env and .env.local are ignored by Git.
- Do not expose or print the API key in logs.

Code quality:
- Keep components focused and readable.
- Avoid unnecessary abstractions.
- Avoid duplicated logic.
- Use meaningful TypeScript types.
- Handle AbortError separately so an intentionally cancelled request is not shown as a user-facing failure.
- Do not modify unrelated repository files.

Testing:
After the MVP is working, add focused tests for the highest-value paths:
- successful API search
- empty results
- malformed response
- network/timeout error
- SearchBar validation
- successful search state update
- request cancellation
- MovieCard rendering

Do not spend time creating exhaustive tests before verifying that the application works.

After implementation, run the test suite and build/type-check the project. Fix any errors you introduce.

At the end, provide a concise summary of:
- files created/changed
- implemented requirements
- tests added
- commands used to verify the project
- any remaining limitations or assumptions

Do not modify prompt.md or README.md yet unless required for the project to run. We will handle the final documentation separately.
```

---

# Task 2 — JSON Lines Parser Bug

## Prompt 1 — Buggy Baseline

```text
Task 2 does not have a provided starter codebase. The only official specification available is:

- Input: JSONL text with occasional blank or malformed lines.
- Output:
  {
    ok: [...],
    errors: [{ line, message }]
  }
- Valid records must be preserved.
- Blank lines should be reported/handled as "skipped blank".
- Invalid JSON should produce a structured error with the correct line number instead of terminating the entire parser.
- Processing must continue after an invalid line.
- A trailing comma in an object is explicitly mentioned as a bug scenario because JSON.parse fails on it.

Because no starter implementation was provided, create a minimal TypeScript JSONL parser project that represents the buggy behavior described by the specification.

IMPORTANT:
Do not create the final/fixed implementation.

Create only a small, intentionally buggy baseline that demonstrates the described problem:
- It should parse valid JSONL records.
- It should fail/abort when JSON.parse encounters malformed JSON.
- It should not yet collect per-line errors or continue after an invalid line.
- Keep the implementation simple and easy to debug.
- Include a few minimal tests demonstrating the current buggy behavior.

Do not add unnecessary frameworks or UI.

After creating the baseline, stop and explain:
1. The files created.
2. The current parser behavior.
3. Which tests demonstrate the bug.
4. What the expected corrected behavior will be according to the specification.

Do not implement the fix yet.
```

## Prompt 2 — Ambiguity & Root-Cause Review

```text
The baseline diagnosis is correct. Before implementing the fix, I want to resolve two ambiguities in the proposed approach and then produce a precise implementation plan.

1. Blank lines:
The specification says the parser should show per-line status as "ok, skipped blank, or error with reason", while the required output structure is:
{
  ok: [...],
  errors: [{ line, message }]
}
Determine how blank lines should be represented in the existing output contract. Do not invent a new output field unless necessary. Explain the trade-off and choose the interpretation that most closely follows the supplied specification.

2. Trailing commas:
The specification says a trailing comma causes JSON.parse to fail and that the parser currently aborts instead of recording the error and continuing. It does not explicitly say that trailing commas should be repaired or accepted as valid JSON. Determine whether the correct behavior should be to:
- treat the line as invalid, record a structured error, and continue, or
- normalize the trailing comma and treat the record as valid.

Prefer the interpretation most directly supported by the supplied specification and explain the reasoning.

Then review the proposed fix for these required behaviors:

- valid records are preserved
- processing continues after invalid lines
- blank lines are handled without terminating parsing
- malformed JSON produces structured errors
- trailing-comma cases are handled according to the chosen interpretation
- multiple errors are collected
- error line numbers are 1-based and accurate
- valid records after errors are still parsed
- input ordering is preserved
- empty input and trailing newlines behave sensibly

Do not modify the code yet.

Return:
1. Your decisions on the two ambiguities.
2. The final expected behavior for each input category.
3. A concise implementation plan.
4. The test cases that should prove the fix.
```

## Prompt 3 — Minimal Fix & Tests

```text
The diagnosis and design are approved.

Implement the minimal fix based on the decisions you just documented:

1. Preserve valid JSON records in the `ok` array.
2. Handle blank lines before attempting JSON.parse().
   - Record them in `errors` with the 1-based line number.
   - Use the message "Skipped blank line".
   - Do not terminate processing.
3. Wrap JSON.parse() in appropriate error handling.
   - Record malformed JSON errors as `{ line, message }`.
   - Use the parser's useful error message.
   - Continue processing subsequent lines.
4. Treat trailing commas as invalid JSON rather than silently normalizing or modifying them.
   - Record the parsing error.
   - Continue processing subsequent lines.
5. Preserve the order of valid records.
6. Preserve the order of error records.
7. Ensure valid records appearing after invalid lines are still returned.
8. Ensure multiple invalid lines produce multiple error entries.
9. Handle empty input sensibly without introducing an artificial error.
10. Keep the implementation minimal and do not introduce unnecessary dependencies or abstractions.

Do not change the public result structure:
{
  ok: [...],
  errors: [{ line, message }]
}

After implementing the fix:

- Update the existing tests to verify the corrected behavior.
- Add the agreed edge-case tests.
- Run the complete test suite.
- Run any available lint/type-check command.
- Run the demo if applicable.
- If any test fails, diagnose and fix the implementation rather than weakening the test.

Do not modify Task 1.

At the end, report:
- files changed
- exact behavior fixed
- tests added/updated
- test results
- any assumptions or limitations
```

## Prompt 4 — Line-Ending Robustness Review

```text
The core Task 2 implementation is approved and all 12 tests currently pass.

Before considering Task 2 final, perform one focused robustness review of line-ending handling.

The current implementation uses input.split('\\n'). Since JSONL text may use Windows CRLF (\\r\\n) line endings, verify that:
- valid JSON records are parsed correctly with CRLF input
- blank lines are handled correctly with CRLF input
- line numbers remain accurate
- mixed valid/invalid records continue to work correctly with CRLF input

If the current implementation already handles this correctly, add a regression test demonstrating it.

If a small implementation change is needed, make only that minimal change.

Do not change the established output contract or any of the existing behavior:
{ ok: [...], errors: [{ line, message }] }

Run the complete test suite after the change and report the result.

Do not modify Task 1.
```
