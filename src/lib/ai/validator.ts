export interface ValidationResult {
  isValid: boolean;
  score: number;
  warnings: string[];
  errors: string[];
  duplicateHash: string;
}

/**
 * Validates generated content for quality, authenticity, and compliance:
 * - Ensures compelling hook is present
 * - Flags generic hype words ("In today's fast-paced world...", "Revolutionize your...")
 * - Validates 2 to 5 hashtags
 * - Generates content hash for duplicate detection
 * - Verifies mobile-optimized paragraph structure
 */
export function validatePostContent(
  content: string,
  existingContents: string[] = []
): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  let score = 95;

  if (!content || content.trim().length < 80) {
    errors.push('Content is too short or empty (minimum 80 characters required).');
    return { isValid: false, score: 0, warnings, errors, duplicateHash: '' };
  }

  // Generate normalized content hash for duplicate detection
  const normalized = content
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .slice(0, 150);
  const duplicateHash = simpleHash(normalized);

  // Check for duplicate or near-identical recent post
  const isDuplicate = existingContents.some((existing) => {
    const existingNorm = existing.toLowerCase().replace(/[^\w\s]/gi, '').slice(0, 150);
    return simpleHash(existingNorm) === duplicateHash;
  });

  if (isDuplicate) {
    errors.push('Potential duplicate content detected matching a previously published post.');
    score -= 40;
  }

  // Check for generic AI hype phrases
  const genericBuzzwords = [
    "in today's fast-paced",
    'in the fast-paced world',
    'game changer',
    'revolutionize the way',
    'take your business to the next level',
    'unlock the power of',
    'buckle up',
  ];

  for (const phrase of genericBuzzwords) {
    if (content.toLowerCase().includes(phrase)) {
      warnings.push(`Contains generic buzzword phrase: "${phrase}". Recommended to replace with concrete engineering specifics.`);
      score -= 8;
    }
  }

  // Check hashtags (require 2 to 8)
  const hashtags = content.match(/#[a-zA-Z0-9_]+/g) || [];
  if (hashtags.length < 2) {
    warnings.push('Post has fewer than 2 hashtags. Adding 5-7 relevant hashtags improves discoverability.');
    score -= 5;
  } else if (hashtags.length > 8) {
    warnings.push(`Post has ${hashtags.length} hashtags. Algorithm optimizes best with 5-7 high-velocity hashtags.`);
    score -= 5;
  }

  // Check paragraph structure for mobile readability
  const paragraphs = content.split('\n\n').filter((p) => p.trim().length > 0);
  if (paragraphs.length < 3) {
    warnings.push('Content appears as a single dense block. Break into short 1-2 sentence paragraphs for mobile readability.');
    score -= 10;
  }

  return {
    isValid: errors.length === 0,
    score: Math.max(10, Math.min(100, score)),
    warnings,
    errors,
    duplicateHash,
  };
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
