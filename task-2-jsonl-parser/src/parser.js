/**
 * JSONL Parser - Fixed Implementation
 * 
 * Parses JSON Lines input with robust error handling:
 * - Continues processing after encountering invalid JSON
 * - Collects per-line errors with line numbers
 * - Handles blank lines gracefully
 * - Records errors for malformed JSON (including trailing commas)
 */

/**
 * Parse JSON Lines input
 * @param {string} input - JSONL text input
 * @returns {{ok: any[], errors: Array<{line: number, message: string}>}}
 */
export function parseJSONL(input) {
  // Normalize line endings: convert CRLF (\r\n) and CR (\r) to LF (\n)
  const normalizedInput = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedInput.split('\n');
  const ok = [];
  const errors = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1; // 1-based line numbers

    // Handle blank lines
    if (line.trim() === '') {
      errors.push({
        line: lineNumber,
        message: 'Skipped blank line'
      });
      continue;
    }

    // Wrap JSON.parse in try-catch to handle errors
    try {
      const parsed = JSON.parse(line);
      ok.push(parsed);
    } catch (error) {
      // Record error and continue processing
      errors.push({
        line: lineNumber,
        message: error.message
      });
    }
  }

  return { ok, errors };
}
