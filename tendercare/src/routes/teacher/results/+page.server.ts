import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { classes, subjects, enrollments, results, students, terms } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getMarkingScheme } from '$lib/server/utils';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.userType !== 'teacher') {
		throw redirect(302, '/login');
	}

	const allClasses = await db.select().from(classes).orderBy(classes.level, classes.arm);
	const allSubjects = await db.select().from(subjects).orderBy(subjects.name);
	const activeTerms = await db.select().from(terms)
		.where(eq(terms.status, 'active'))
		.orderBy(terms.createdAt);

	return {
		classes: allClasses,
		subjects: allSubjects,
		activeTerms: activeTerms
	};
};

export const actions: Actions = {
	loadStudents: async (event) => {
		const formData = await event.request.formData();
		const classId = formData.get('classId')?.toString();
		const termId = formData.get('termId')?.toString();

		if (!classId || !termId) {
			return fail(400, { error: 'Class and term are required' });
		}

		// Get all students enrolled in this class for this term
		const enrolledStudents = await db.select({
			studentId: students.id,
			studentName: students.name
		})
			.from(enrollments)
			.innerJoin(students, eq(enrollments.studentId, students.id))
			.where(and(
				eq(enrollments.classId, classId),
				eq(enrollments.termId, termId)
			));

		return { students: enrolledStudents };
	},
	save: async (event) => {
		if (!event.locals.user || event.locals.user.userType !== 'teacher') {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await event.request.formData();
		const termId = formData.get('termId')?.toString();
		const subjectId = formData.get('subjectId')?.toString();

		if (!termId || !subjectId) {
			return fail(400, { error: 'Term and subject are required' });
		}

		// Check if term is published (results locked)
		const [term] = await db.select().from(terms).where(eq(terms.id, termId)).limit(1);
		if (term?.resultsPublished) {
			return fail(400, { error: 'Results for this term have been published and cannot be edited' });
		}

		// Get subject to determine max scores
		const [subject] = await db.select().from(subjects).where(eq(subjects.id, subjectId)).limit(1);
		if (!subject) {
			return fail(400, { error: 'Subject not found' });
		}

		const { caMax, examMax } = getMarkingScheme(subject.level);

		// Get all student IDs from form keys
		// Keys are in format: student_{studentId}_ca or student_{studentId}_exam
		// Extract unique student IDs safely
		const studentIdSet = new Set<string>();
		for (const key of formData.keys()) {
			const match = key.match(/^student_([^_]+)_(ca|exam)$/);
			if (match) {
				studentIdSet.add(match[1]);
			}
		}
		const studentIds = Array.from(studentIdSet);

		if (studentIds.length === 0) {
			return fail(400, { error: 'No student scores provided' });
		}

		// Process each student's scores
		for (const studentId of studentIds) {
			const caScore = formData.get(`student_${studentId}_ca`)?.toString();
			const examScore = formData.get(`student_${studentId}_exam`)?.toString();

			// Validate scores
			const ca = caScore ? parseInt(caScore, 10) : null;
			const exam = examScore ? parseInt(examScore, 10) : null;

			// Check for NaN
			if (ca !== null && (isNaN(ca) || ca < 0 || ca > caMax)) {
				return fail(400, { error: `CA score must be a valid number between 0 and ${caMax}` });
			}
			if (exam !== null && (isNaN(exam) || exam < 0 || exam > examMax)) {
				return fail(400, { error: `Exam score must be a valid number between 0 and ${examMax}` });
			}

			// Check if result exists
			const [existing] = await db.select().from(results)
				.where(and(
					eq(results.studentId, studentId),
					eq(results.termId, termId),
					eq(results.subjectId, subjectId)
				))
				.limit(1);

			if (existing) {
				// Update existing result
				await db.update(results)
					.set({
						caScore: ca,
						examScore: exam,
						updatedByTeacherId: event.locals.user.id,
						updatedAt: new Date()
					})
					.where(eq(results.id, existing.id));
			} else {
				// Create new result
				await db.insert(results).values({
					studentId,
					termId,
					subjectId,
					caScore: ca,
					examScore: exam,
					enteredByTeacherId: event.locals.user.id,
					updatedByTeacherId: event.locals.user.id
				});
			}
		}

		return { success: true };
	}
};

