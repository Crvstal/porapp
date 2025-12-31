import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { students, classes, enrollments, terms } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { hashPassword } from '$lib/server/auth-helpers';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.userType !== 'admin') {
		throw redirect(302, '/login');
	}

	// Get all students with their current class info
	const allStudents = await db.select({
		id: students.id,
		name: students.name,
		currentClass: students.currentClass,
		currentSection: students.currentSection,
		active: students.active,
		graduatedAt: students.graduatedAt,
		createdAt: students.createdAt
	})
		.from(students)
		.orderBy(desc(students.createdAt));

	// Get all classes for dropdown
	const allClasses = await db.select().from(classes).orderBy(classes.level, classes.arm);

	return {
		students: allStudents,
		classes: allClasses
	};
};

export const actions: Actions = {
	create: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name')?.toString();
		const classLevel = formData.get('classLevel')?.toString();
		const section = formData.get('section')?.toString();

		if (!name) {
			return fail(400, { error: 'Name is required' });
		}

		await db.insert(students).values({
			name,
			currentClass: classLevel as any || null,
			currentSection: section || null,
			active: true
		});

		return { success: true };
	},
	update: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('id')?.toString();
		const name = formData.get('name')?.toString();
		const classLevel = formData.get('classLevel')?.toString();
		const section = formData.get('section')?.toString();
		const active = formData.get('active')?.toString() === 'true';

		if (!id || !name) {
			return fail(400, { error: 'ID and name are required' });
		}

		await db.update(students)
			.set({
				name,
				currentClass: classLevel as any || null,
				currentSection: section || null,
				active
			})
			.where(eq(students.id, id));

		return { success: true };
	},
	delete: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'ID is required' });
		}

		await db.update(students)
			.set({ active: false })
			.where(eq(students.id, id));

		return { success: true };
	}
};

