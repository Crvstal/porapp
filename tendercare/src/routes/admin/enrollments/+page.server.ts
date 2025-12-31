import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { enrollments, students, classes, terms } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.userType !== 'admin') {
		throw redirect(302, '/login');
	}

	const allStudents = await db.select().from(students).where(eq(students.active, true)).orderBy(students.name);
	const allClasses = await db.select().from(classes).orderBy(classes.level, classes.arm);
	const allTerms = await db.select().from(terms).orderBy(terms.createdAt);

	// Get all enrollments with student and class info
	const allEnrollments = await db.select({
		id: enrollments.id,
		studentId: enrollments.studentId,
		studentName: students.name,
		classId: enrollments.classId,
		className: classes.level,
		classArm: classes.arm,
		termId: enrollments.termId,
		termNumber: terms.termNumber
	})
		.from(enrollments)
		.innerJoin(students, eq(enrollments.studentId, students.id))
		.innerJoin(classes, eq(enrollments.classId, classes.id))
		.innerJoin(terms, eq(enrollments.termId, terms.id))
		.orderBy(enrollments.createdAt);

	return {
		students: allStudents,
		classes: allClasses,
		terms: allTerms,
		enrollments: allEnrollments
	};
};

export const actions: Actions = {
	create: async (event) => {
		const formData = await event.request.formData();
		const studentId = formData.get('studentId')?.toString();
		const classId = formData.get('classId')?.toString();
		const termId = formData.get('termId')?.toString();

		if (!studentId || !classId || !termId) {
			return fail(400, { error: 'All fields are required' });
		}

		// Check if enrollment already exists
		const [existing] = await db.select().from(enrollments)
			.where(and(
				eq(enrollments.studentId, studentId),
				eq(enrollments.termId, termId)
			))
			.limit(1);

		if (existing) {
			return fail(400, { error: 'Student is already enrolled in a class for this term' });
		}

		await db.insert(enrollments).values({
			studentId,
			classId,
			termId
		});

		return { success: true };
	},
	delete: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'ID is required' });
		}

		await db.delete(enrollments).where(eq(enrollments.id, id));

		return { success: true };
	}
};

