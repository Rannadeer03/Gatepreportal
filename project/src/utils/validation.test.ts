import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateName, validateRegistrationNumber } from './validation';

describe('validateEmail', () => {
  it('accepts a well-formed email', () => {
    expect(validateEmail('student@example.com')).toBe(true);
  });

  it('rejects missing @ or domain', () => {
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('missing@domain')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('rejects a password that is too short', () => {
    const { isValid, errors } = validatePassword('Ab1!');
    expect(isValid).toBe(false);
    expect(errors).toContain('Password must be at least 8 characters long');
  });

  it('rejects a password missing character classes', () => {
    const { isValid, errors } = validatePassword('alllowercase1');
    expect(isValid).toBe(false);
    expect(errors.some((e) => e.includes('uppercase'))).toBe(true);
    expect(errors.some((e) => e.includes('special character'))).toBe(true);
  });

  it('accepts a strong password', () => {
    const { isValid, errors } = validatePassword('Str0ng!Pass');
    expect(isValid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it('rejects the old 6-character minimum that Register.tsx used to allow', () => {
    // Regression guard: Register.tsx previously accepted any 6+ char
    // password (e.g. "abcdef"); it must now go through this same check.
    const { isValid } = validatePassword('abcdef');
    expect(isValid).toBe(false);
  });
});

describe('validateName / validateRegistrationNumber', () => {
  it('accepts reasonable values', () => {
    expect(validateName('Jane Doe')).toBe(true);
    expect(validateRegistrationNumber('GATE-2026-001')).toBe(true);
  });

  it('rejects empty or malformed values', () => {
    expect(validateName('J')).toBe(false);
    expect(validateRegistrationNumber('a')).toBe(false);
  });
});
