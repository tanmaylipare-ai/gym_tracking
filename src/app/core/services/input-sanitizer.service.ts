import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InputSanitizerService {

  // ── 1. Username, Search Query, Workout & Routine Names ───────────────────
  /**
   * Trims whitespace, removes invisible control characters, and collapses
   * multiple consecutive spaces into a single space ("Bench   Press" -> "Bench Press").
   */
  sanitizeText(input: string | null | undefined): string {
    if (!input) return '';
    return input
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove non-printable ASCII control chars
      .replace(/\s+/g, ' ')                        // Collapse consecutive spaces into one
      .trim();
  }

  // ── 2. Email Address ─────────────────────────────────────────────────────
  /**
   * Lowercases and trims emails. Ensures "User@Domain.Com " -> "user@domain.com".
   */
  sanitizeEmail(email: string | null | undefined): string {
    if (!email) return '';
    return email.trim().toLowerCase();
  }

  // ── 3. Password ──────────────────────────────────────────────────────────
  /**
   * PASSWORDS ARE LEFT RAW.
   * Never strip HTML, alter special chars, or collapse spaces in passwords.
   * Doing so ruins user intent if they use special characters like '<' or '>'.
   */
  sanitizePassword(password: string | null | undefined): string {
    return password ?? '';
  }

  // ── 4. Descriptions & Notes ──────────────────────────────────────────────
  /**
   * Strips HTML tags (<script>, <b>, etc.) for plain-text notes/descriptions
   * and normalizes spacing while preserving line breaks.
   */
  sanitizeNotes(notes: string | null | undefined): string {
    if (!notes) return '';
    return notes
      .replace(/<[^>]*>/g, '')                      // Strip HTML tags completely
      .replace(/[\u0000-\u0009\u000B-\u001F]/g, '') // Strip control chars (keep line breaks \n \r)
      .trim();
  }

  // ── 5. Set Weight Number ─────────────────────────────────────────────────
  /**
   * Converts string/input values to numbers, rounds to 2 decimal places (e.g., 22.5 kg),
   * and clamps within allowed range [0, 2000]. Returns null if invalid.
   */
  sanitizeWeight(value: any, min = 0, max = 2000): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    if (isNaN(num)) return null;

    // Round to 2 decimal places to prevent floating point quirks (e.g., 22.5000000001)
    const rounded = Math.round(num * 100) / 100;
    return Math.min(Math.max(rounded, min), max);
  }

  // ── 6. Set Reps Number ───────────────────────────────────────────────────
  /**
   * Truncates decimals to integers (e.g., 8.5 reps -> 8 reps)
   * and clamps within allowed range [0, 500]. Returns null if invalid.
   */
  sanitizeReps(value: any, min = 0, max = 500): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Math.floor(Number(value));
    if (isNaN(num)) return null;

    return Math.min(Math.max(num, min), max);
  }
}