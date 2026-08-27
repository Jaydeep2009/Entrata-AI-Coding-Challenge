import { test, describe } from 'node:test';
import assert from 'node:assert';
import { parseJSONL } from './parser.js';

describe('JSONL Parser - Fixed Implementation', () => {
  
  test('parses valid JSONL correctly', () => {
    const input = '{"name":"Alice","age":30}\n{"name":"Bob","age":25}';
    const result = parseJSONL(input);
    
    assert.strictEqual(result.ok.length, 2);
    assert.deepStrictEqual(result.ok[0], { name: 'Alice', age: 30 });
    assert.deepStrictEqual(result.ok[1], { name: 'Bob', age: 25 });
    assert.strictEqual(result.errors.length, 0);
  });

  test('skips blank lines and reports them', () => {
    const input = '{"name":"Alice"}\n\n{"name":"Bob"}';
    const result = parseJSONL(input);
    
    assert.strictEqual(result.ok.length, 2);
    assert.deepStrictEqual(result.ok[0], { name: 'Alice' });
    assert.deepStrictEqual(result.ok[1], { name: 'Bob' });
    assert.strictEqual(result.errors.length, 1);
    assert.strictEqual(result.errors[0].line, 2);
    assert.match(result.errors[0].message, /skipped blank/i);
  });

  test('continues parsing after malformed JSON', () => {
    const input = '{"name":"Alice"}\n{invalid json}\n{"name":"Bob"}';
    const result = parseJSONL(input);
    
    assert.strictEqual(result.ok.length, 2);
    assert.deepStrictEqual(result.ok[0], { name: 'Alice' });
    assert.deepStrictEqual(result.ok[1], { name: 'Bob' });
    assert.strictEqual(result.errors.length, 1);
    assert.strictEqual(result.errors[0].line, 2);
    assert.match(result.errors[0].message, /expected property name|unexpected token/i);
  });

  test('records trailing comma as error and continues', () => {
    const input = '{"name":"Alice","age":30,}\n{"name":"Bob","age":25}';
    const result = parseJSONL(input);
    
    assert.strictEqual(result.ok.length, 1);
    assert.deepStrictEqual(result.ok[0], { name: 'Bob', age: 25 });
    assert.strictEqual(result.errors.length, 1);
    assert.strictEqual(result.errors[0].line, 1);
    assert.match(result.errors[0].message, /expected.*property name|unexpected token/i);
  });

  test('preserves valid records after encountering error', () => {
    const input = '{"valid":1}\n{invalid}\n{"valid":2}';
    const result = parseJSONL(input);
    
    assert.strictEqual(result.ok.length, 2);
    assert.deepStrictEqual(result.ok[0], { valid: 1 });
    assert.deepStrictEqual(result.ok[1], { valid: 2 });
    assert.strictEqual(result.errors.length, 1);
    assert.strictEqual(result.errors[0].line, 2);
  });

  test('collects multiple errors', () => {
    const input = '{"valid":1}\n{err1}\n{"valid":2}\n{err2}\n{"valid":3}';
    const result = parseJSONL(input);
    
    assert.strictEqual(result.ok.length, 3);
    assert.strictEqual(result.errors.length, 2);
    assert.strictEqual(result.errors[0].line, 2);
    assert.strictEqual(result.errors[1].line, 4);
  });

  test('handles empty input', () => {
    const input = '';
    const result = parseJSONL(input);
    
    // Empty string splits to [''] which is one blank line
    assert.strictEqual(result.ok.length, 0);
    assert.strictEqual(result.errors.length, 1);
    assert.strictEqual(result.errors[0].line, 1);
    assert.match(result.errors[0].message, /skipped blank/i);
  });

  test('reports multiple blank lines', () => {
    const input = '\n\n{"valid":1}\n\n';
    const result = parseJSONL(input);
    
    // Split creates: ['', '', '{"valid":1}', '', '']
    // Lines 1, 2, 4, 5 are blank (4 errors)
    assert.strictEqual(result.ok.length, 1);
    assert.strictEqual(result.errors.length, 4);
    assert.strictEqual(result.errors[0].line, 1);
    assert.strictEqual(result.errors[1].line, 2);
    assert.strictEqual(result.errors[2].line, 4);
    assert.strictEqual(result.errors[3].line, 5);
  });

  test('handles complex mixed input', () => {
    const input = '{"a":1}\n\n{bad}\n{"b":2}\n{"c":3,}\n{"d":4}';
    const result = parseJSONL(input);
    
    assert.strictEqual(result.ok.length, 3); // a, b, d
    assert.strictEqual(result.errors.length, 3); // blank, bad, trailing comma
    assert.deepStrictEqual(result.ok[0], { a: 1 });
    assert.deepStrictEqual(result.ok[1], { b: 2 });
    assert.deepStrictEqual(result.ok[2], { d: 4 });
    assert.strictEqual(result.errors[0].line, 2); // blank
    assert.strictEqual(result.errors[1].line, 3); // bad
    assert.strictEqual(result.errors[2].line, 5); // trailing comma
  });

  test('preserves order of valid records', () => {
    const input = '{"id":3}\n{err}\n{"id":1}\n{"id":2}';
    const result = parseJSONL(input);
    
    assert.strictEqual(result.ok.length, 3);
    assert.strictEqual(result.ok[0].id, 3);
    assert.strictEqual(result.ok[1].id, 1);
    assert.strictEqual(result.ok[2].id, 2);
  });

  test('preserves order of errors', () => {
    const input = '{err1}\n{"ok":1}\n{err2}\n{err3}';
    const result = parseJSONL(input);
    
    assert.strictEqual(result.errors.length, 3);
    assert.strictEqual(result.errors[0].line, 1);
    assert.strictEqual(result.errors[1].line, 3);
    assert.strictEqual(result.errors[2].line, 4);
  });

  test('handles only whitespace lines', () => {
    const input = '   \n\t\n  \t  ';
    const result = parseJSONL(input);
    
    assert.strictEqual(result.ok.length, 0);
    assert.strictEqual(result.errors.length, 3);
    assert.match(result.errors[0].message, /skipped blank/i);
    assert.match(result.errors[1].message, /skipped blank/i);
    assert.match(result.errors[2].message, /skipped blank/i);
  });

  test('handles CRLF line endings (Windows)', () => {
    const input = '{"name":"Alice"}\r\n{"name":"Bob"}';
    const result = parseJSONL(input);
    
    assert.strictEqual(result.ok.length, 2);
    assert.deepStrictEqual(result.ok[0], { name: 'Alice' });
    assert.deepStrictEqual(result.ok[1], { name: 'Bob' });
    assert.strictEqual(result.errors.length, 0);
  });

  test('handles CRLF with blank lines', () => {
    const input = '{"a":1}\r\n\r\n{"b":2}';
    const result = parseJSONL(input);
    
    assert.strictEqual(result.ok.length, 2);
    assert.strictEqual(result.errors.length, 1);
    assert.strictEqual(result.errors[0].line, 2);
    assert.match(result.errors[0].message, /skipped blank/i);
  });

  test('handles CRLF with invalid JSON', () => {
    const input = '{"a":1}\r\n{bad}\r\n{"b":2}';
    const result = parseJSONL(input);
    
    assert.strictEqual(result.ok.length, 2);
    assert.strictEqual(result.errors.length, 1);
    assert.strictEqual(result.errors[0].line, 2);
  });

  test('handles CR line endings (old Mac)', () => {
    const input = '{"a":1}\r{"b":2}';
    const result = parseJSONL(input);
    
    assert.strictEqual(result.ok.length, 2);
    assert.deepStrictEqual(result.ok[0], { a: 1 });
    assert.deepStrictEqual(result.ok[1], { b: 2 });
    assert.strictEqual(result.errors.length, 0);
  });

  test('handles mixed line endings', () => {
    const input = '{"a":1}\r\n{"b":2}\n{"c":3}\r{"d":4}';
    const result = parseJSONL(input);
    
    assert.strictEqual(result.ok.length, 4);
    assert.strictEqual(result.errors.length, 0);
  });

  test('continues after consecutive malformed lines', () => {
    const input = '{"valid":1}\n{bad1}\n{bad2}\n{"valid":2}';
    const result = parseJSONL(input);

    assert.deepStrictEqual(result.ok, [{ valid: 1 }, { valid: 2 }]);
    assert.strictEqual(result.errors.length, 2);
    assert.deepStrictEqual(result.errors.map((error) => error.line), [2, 3]);
    assert.ok(result.errors.every((error) => typeof error.message === 'string' && error.message.length > 0));
  });

  test('continues after a blank line followed by malformed JSON', () => {
    const input = '{"first":1}\n\n{bad}\n{"last":2}';
    const result = parseJSONL(input);

    assert.deepStrictEqual(result.ok, [{ first: 1 }, { last: 2 }]);
    assert.deepStrictEqual(result.errors.map((error) => error.line), [2, 3]);
    assert.match(result.errors[0].message, /skipped blank/i);
    assert.ok(result.errors[1].message.length > 0);
  });
});
