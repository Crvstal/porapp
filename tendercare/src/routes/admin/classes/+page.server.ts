import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { classes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.userType !== 'admin') {
		throw redirect(302, '/login');
	}

	const allClasses = await db.select().from(classes).orderBy(classes.level, classes.arm);

	return {
		classes: allClasses
	};
};

export const actions: Actions = {
	create: async (event) => {
		const formData = await event.request.formData();
		const level = formData.get('level')?.toString();
		const arm = formData.get('arm')?.toString();
		const capacity = formData.get('capacity')?.toString();

		if (!level || !arm || !capacity) {
			return fail(400, { error: 'All fields are required' });
		}

		const capacityNum = parseInt(capacity, 10);
		if (isNaN(capacityNum) || capacityNum <= 0) {
			return fail(400, { error: 'Capacity must be a positive number' });
		}

		try {
			await db.insert(classes).values({
				level: level as any,
				arm,
				capacity: capacityNum
			});
			return { success: true };
		} catch (error: any) {
			if (error.code === '23505') {
				return fail(400, { error: 'This class already exists' });
			}
			return fail(500, { error: 'Failed to create class' });
		}
	},
	delete: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'ID is required' });
		}

		await db.delete(classes).where(eq(classes.id, id));

		return { success: true };
	}
};

