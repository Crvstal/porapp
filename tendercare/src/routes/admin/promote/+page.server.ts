import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { students, academicYears } from '$lib/server/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { getNextClassLevel } from '$lib/server/utils';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.userType !== 'admin') {
		throw redirect(302, '/login');
	}

	const allAcademicYears = await db.select().from(academicYears).orderBy(academicYears.startDate);
	const activeStudents = await db.select().from(students)
		.where(and(eq(students.active, true), isNotNull(students.currentClass)))
		.orderBy(students.currentClass, students.name);

	return {
		academicYears: allAcademicYears,
		students: activeStudents
	};
};

export const actions: Actions = {
	createAcademicYear: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name')?.toString();
		const startDate = formData.get('startDate')?.toString();
		const endDate = formData.get('endDate')?.toString();

		if (!name || !startDate || !endDate) {
			return fail(400, { error: 'All fields are required' });
		}

		await db.insert(academicYears).values({
			name,
			startDate: new Date(startDate),
			endDate: new Date(endDate)
		});

		return { success: true };
	},
	promote: async (event) => {
		// Get all active students with a current class
		const activeStudents = await db.select().from(students)
			.where(and(eq(students.active, true), isNotNull(students.currentClass)));

		// Promote each student
		for (const student of activeStudents) {
			if (!student.currentClass) continue;

			const nextLevel = getNextClassLevel(student.currentClass);

			if (nextLevel === 'Graduated') {
				// Mark as graduated
				await db.update(students)
					.set({
						graduatedAt: new Date(),
						active: false,
						currentClass: null,
						currentSection: null
					})
					.where(eq(students.id, student.id));
			} else {
				// Promote to next class (keep same section)
				await db.update(students)
					.set({
						currentClass: nextLevel as any
						// Section stays the same, admin will reassign if needed
					})
					.where(eq(students.id, student.id));
			}
		}

		return { success: true, promoted: activeStudents.length };
	}
};

