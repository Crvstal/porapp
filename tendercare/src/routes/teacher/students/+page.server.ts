import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { students, enrollments, classes, terms } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.userType !== 'teacher') {
		throw redirect(302, '/login');
	}

	// Get all students with their current enrollment info
	const allStudents = await db.select({
		id: students.id,
		name: students.name,
		currentClass: students.currentClass,
		currentSection: students.currentSection,
		active: students.active
	})
		.from(students)
		.where(eq(students.active, true))
		.orderBy(students.name);

	// Get current term enrollments
	const currentTerm = await db.select().from(terms)
		.where(eq(terms.status, 'active'))
		.orderBy(terms.createdAt)
		.limit(1);

	let enrollmentsData = [];
	if (currentTerm.length > 0) {
		enrollmentsData = await db.select({
			studentId: enrollments.studentId,
			studentName: students.name,
			className: classes.level,
			classArm: classes.arm
		})
			.from(enrollments)
			.innerJoin(students, eq(enrollments.studentId, students.id))
			.innerJoin(classes, eq(enrollments.classId, classes.id))
			.where(eq(enrollments.termId, currentTerm[0].id));
	}

	return {
		students: allStudents,
		enrollments: enrollmentsData,
		currentTerm: currentTerm[0] || null
	};
};

