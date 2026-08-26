import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders input and search button', () => {
    const mockOnSearch = vi.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    expect(screen.getByPlaceholderText(/search for movies/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('calls onSearch when button is clicked with valid input', async () => {
    const mockOnSearch = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/search for movies/i);
    const button = screen.getByRole('button', { name: /search/i });

    await user.type(input, 'Inception');
    await user.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('Inception');
  });

  it('shows validation error for empty input', async () => {
    const mockOnSearch = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar onSearch={mockOnSearch} />);

    const button = screen.getByRole('button', { name: /search/i });
    await user.click(button);

    expect(screen.getByRole('alert')).toHaveTextContent(/please enter a movie title/i);
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('shows validation error for whitespace-only input', async () => {
    const mockOnSearch = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/search for movies/i);
    const button = screen.getByRole('button', { name: /search/i });

    await user.type(input, '   ');
    await user.click(button);

    expect(screen.getByRole('alert')).toHaveTextContent(/please enter a movie title/i);
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('trims input value before calling onSearch', async () => {
    const mockOnSearch = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/search for movies/i);
    const button = screen.getByRole('button', { name: /search/i });

    await user.type(input, '  Inception  ');
    await user.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('Inception');
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnSearch = vi.fn();
    render(<SearchBar onSearch={mockOnSearch} disabled={true} />);

    const input = screen.getByPlaceholderText(/search for movies/i);
    const button = screen.getByRole('button', { name: /search/i });

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });
});
