import type { SubjectLevel } from './db/schema';

/**
 * Get maximum CA and Exam scores based on subject level
 */
export function getMarkingScheme(level: SubjectLevel): { caMax: number; examMax: number } {
	if (level === 'Junior') {
		return { caMax: 30, examMax: 70 };
	} else {
		return { caMax: 20, examMax: 80 };
	}
}

/**
 * Generate a random token for student result access
 */
export function generateToken(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let token = '';
	for (let i = 0; i < 32; i++) {
		token += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return token;
}

/**
 * Get class level from string (e.g., "JSS1" -> "JSS1")
 */
export function parseClassLevel(level: string): 'JSS1' | 'JSS2' | 'JSS3' | 'SSS1' | 'SSS2' | 'SSS3' | null {
	const validLevels = ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'];
	if (validLevels.includes(level)) {
		return level as 'JSS1' | 'JSS2' | 'JSS3' | 'SSS1' | 'SSS2' | 'SSS3';
	}
	return null;
}

/**
 * Get next class level for promotion
 */
export function getNextClassLevel(current: string): string | 'Graduated' {
	const progression: Record<string, string> = {
		JSS1: 'JSS2',
		JSS2: 'JSS3',
		JSS3: 'SSS1',
		SSS1: 'SSS2',
		SSS2: 'SSS3',
		SSS3: 'Graduated'
	};
	return progression[current] || current;
}

