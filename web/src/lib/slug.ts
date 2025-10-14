/**
 * Generate a URL-friendly slug from a name
 *
 * Rules:
 * - Only lowercase letters and numbers
 * - Must start with a letter (not a number)
 * - Allow hyphens but not consecutive hyphens
 * - No leading/trailing hyphens
 *
 * Examples:
 * - "Filipe Labs" → "filipe-labs"
 * - "123 Test" → "test"
 * - "My--App" → "my-app"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // Replace invalid chars with hyphens
    .replace(/-+/g, '-')           // Remove consecutive hyphens
    .replace(/^-|-$/g, '')         // Remove leading/trailing hyphens
    .replace(/^[0-9]+/, '');       // Remove leading numbers
}

/**
 * Validate if a string is a valid slug format
 */
export function validateSlug(slug: string): boolean {
  // Must start with letter, contain only lowercase letters, numbers, and single hyphens
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(slug);
}

/**
 * Get validation error message for a slug
 */
export function getSlugValidationError(slug: string): string | null {
  if (!slug) {
    return 'Platform ID is required';
  }

  if (slug.length < 1 || slug.length > 50) {
    return 'Platform ID must be between 1 and 50 characters';
  }

  if (!/^[a-z]/.test(slug)) {
    return 'Platform ID must start with a letter';
  }

  if (/[^a-z0-9-]/.test(slug)) {
    return 'Platform ID can only contain lowercase letters, numbers, and hyphens';
  }

  if (/--/.test(slug)) {
    return 'Platform ID cannot contain consecutive hyphens';
  }

  if (/^-|-$/.test(slug)) {
    return 'Platform ID cannot start or end with a hyphen';
  }

  return null;
}
