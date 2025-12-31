import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { students, resultTokens } from '$lib/server/db/schema';
import { eq, isNull } from 'drizzle-orm';
import { generateToken } from '$lib/server/utils';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.userType !== 'admin') {
		throw redirect(302, '/login');
	}

	// Get all students with their tokens
	const allStudents = await db.select({
		id: students.id,
		name: students.name,
		currentClass: students.currentClass,
		currentSection: students.currentSection,
		token: resultTokens.token
	})
		.from(students)
		.leftJoin(resultTokens, eq(students.id, resultTokens.studentId))
		.orderBy(students.name);

	return {
		students: allStudents
	};
};

export const actions = {
	generate: async (event) => {
		if (!event.locals.user || event.locals.user.userType !== 'admin') {
			return { error: 'Unauthorized' };
		}

		const formData = await event.request.formData();
		const studentId = formData.get('studentId')?.toString();

		if (!studentId) {
			return { error: 'Student ID is required' };
		}

		const token = generateToken();

		// Check if token exists
		const [existing] = await db.select().from(resultTokens).where(eq(resultTokens.studentId, studentId)).limit(1);

		if (existing) {
			// Update existing token
			await db.update(resultTokens)
				.set({ token })
				.where(eq(resultTokens.studentId, studentId));
		} else {
			// Create new token
			await db.insert(resultTokens).values({
				studentId,
				token
			});
		}

		return { success: true, token };
	},
	generateAll: async (event) => {
		if (!event.locals.user || event.locals.user.userType !== 'admin') {
			return { error: 'Unauthorized' };
		}

		// Get all students
		const allStudents = await db.select({ id: students.id }).from(students);
		
		// Get all existing tokens (filter out any null studentIds for safety)
		const existingTokens = await db.select({ studentId: resultTokens.studentId }).from(resultTokens);
		const tokenStudentIds = new Set(
			existingTokens
				.map(t => t.studentId)
				.filter((id): id is string => id !== null)
		);
		
		// Filter students without tokens
		const studentsWithoutTokens = allStudents.filter(s => !tokenStudentIds.has(s.id));

		// Generate tokens for all
		for (const student of studentsWithoutTokens) {
			const token = generateToken();
			await db.insert(resultTokens).values({
				studentId: student.id,
				token
			});
		}

		return { success: true };
	}
};

