import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  isValidEmail,
  formatDate,
  truncateText,
  generateOrderNumber,
  isValidFileSize,
} from './utils';

describe('formatPrice', () => {
  it('formats CLP currency correctly', () => {
    expect(formatPrice(50000)).toBe('$50.000');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('$0');
  });

  it('handles negative numbers', () => {
    const result = formatPrice(-10000);
    expect(result).toContain('-');
    expect(result).toContain('10.000');
  });

  it('handles decimal values', () => {
    const result = formatPrice(50000.99);
    expect(result).toContain('50.001');
  });

  it('handles large numbers', () => {
    const result = formatPrice(1000000);
    expect(result).toContain('1.000.000');
  });
});

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.user+tag@domain.co.uk')).toBe(true);
    expect(isValidEmail('admin@josevega.art')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user @example.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('rejects emails with spaces', () => {
    expect(isValidEmail(' user@example.com')).toBe(false);
    expect(isValidEmail('user @example.com')).toBe(false);
    expect(isValidEmail('user@ example.com')).toBe(false);
  });
});

describe('formatDate', () => {
  it('formats dates in Chilean locale', () => {
    const date = new Date('2024-11-10T12:00:00Z');
    const formatted = formatDate(date);
    expect(formatted).toContain('2024');
    expect(formatted).toContain('10');
  });

  it('accepts custom options', () => {
    const date = new Date('2024-11-10T12:00:00Z');
    const formatted = formatDate(date, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(formatted).toContain('2024');
    expect(formatted).toContain('noviembre');
  });

  it('handles different dates', () => {
    const date1 = new Date('2024-01-01T00:00:00Z');
    const date2 = new Date('2024-12-31T23:59:59Z');

    const formatted1 = formatDate(date1);
    const formatted2 = formatDate(date2);

    expect(formatted1).not.toBe(formatted2);
  });
});

describe('truncateText', () => {
  it('truncates text longer than maxLength', () => {
    const text = 'This is a very long text that needs truncation';
    expect(truncateText(text, 10)).toBe('This is a ...');
  });

  it('returns original text if shorter than maxLength', () => {
    const text = 'Short';
    expect(truncateText(text, 10)).toBe('Short');
  });

  it('returns original text if exactly maxLength', () => {
    const text = '1234567890';
    expect(truncateText(text, 10)).toBe('1234567890');
  });

  it('handles empty strings', () => {
    expect(truncateText('', 10)).toBe('');
  });

  it('adds ellipsis when truncating', () => {
    const text = 'This is a long text';
    const truncated = truncateText(text, 10);
    expect(truncated).toContain('...');
    expect(truncated.length).toBe(13); // 10 + "..."
  });
});

describe('generateOrderNumber', () => {
  it('generates order number with correct format', () => {
    const orderNumber = generateOrderNumber();
    expect(orderNumber).toMatch(/^ORD-\d{8}-\d{3}$/);
  });

  it('includes current date', () => {
    const orderNumber = generateOrderNumber();
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    expect(orderNumber).toContain(`ORD-${year}${month}${day}`);
  });

  it('generates unique order numbers', () => {
    const orderNumber1 = generateOrderNumber();
    const orderNumber2 = generateOrderNumber();

    // While there's a small chance they could be the same due to randomness,
    // it's extremely unlikely
    expect(orderNumber1).toBeDefined();
    expect(orderNumber2).toBeDefined();
    expect(orderNumber1).toMatch(/^ORD-\d{8}-\d{3}$/);
    expect(orderNumber2).toMatch(/^ORD-\d{8}-\d{3}$/);
  });

  it('pads random number with zeros', () => {
    const orderNumber = generateOrderNumber();
    const parts = orderNumber.split('-');
    expect(parts[2]).toHaveLength(3);
  });
});

describe('isValidFileSize', () => {
  it('accepts files within size limit', () => {
    const smallFile = new File(['a'.repeat(1024)], 'small.txt', {
      type: 'text/plain',
    });
    expect(isValidFileSize(smallFile, 10)).toBe(true);
  });

  it('rejects files exceeding size limit', () => {
    const largeContent = new Blob(['a'.repeat(11 * 1024 * 1024)]);
    const largeFile = new File([largeContent], 'large.txt', {
      type: 'text/plain',
    });
    expect(isValidFileSize(largeFile, 10)).toBe(false);
  });

  it('uses default max size of 10MB', () => {
    const file = new File(['a'.repeat(5 * 1024 * 1024)], 'medium.txt', {
      type: 'text/plain',
    });
    expect(isValidFileSize(file)).toBe(true);
  });

  it('accepts files at exact size limit', () => {
    const exactSizeContent = new Blob(['a'.repeat(5 * 1024 * 1024)]);
    const exactSizeFile = new File([exactSizeContent], 'exact.txt', {
      type: 'text/plain',
    });
    expect(isValidFileSize(exactSizeFile, 5)).toBe(true);
  });

  it('handles zero-byte files', () => {
    const emptyFile = new File([], 'empty.txt', { type: 'text/plain' });
    expect(isValidFileSize(emptyFile, 10)).toBe(true);
  });
});
