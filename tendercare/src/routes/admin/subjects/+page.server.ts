import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { subjects } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.userType !== 'admin') {
		throw redirect(302, '/login');
	}

	const allSubjects = await db.select().from(subjects).orderBy(subjects.name);

	return {
		subjects: allSubjects
	};
};

export const actions: Actions = {
	create: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name')?.toString();
		const level = formData.get('level')?.toString();

		if (!name || !level) {
			return fail(400, { error: 'Name and level are required' });
		}

		await db.insert(subjects).values({
			name,
			level: level as any
		});

		return { success: true };
	},
	delete: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'ID is required' });
		}

		await db.delete(subjects).where(eq(subjects.id, id));

		return { success: true };
	}
};

