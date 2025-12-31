import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { admins, teachers } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '$lib/server/auth-helpers';
import { createSession } from '$lib/server/auth-helpers';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		// Redirect based on user type
		if (locals.user.userType === 'admin') {
			throw redirect(302, '/admin/dashboard');
		} else {
			throw redirect(302, '/teacher/results');
		}
	}
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();
		const userType = formData.get('userType')?.toString() as 'admin' | 'teacher';

		if (!email || !password || !userType) {
			return fail(400, { error: 'All fields are required' });
		}

		// Try to find user in appropriate table
		let user;
		if (userType === 'admin') {
			const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
			if (!admin) {
				return fail(401, { error: 'Invalid credentials' });
			}
			const valid = await verifyPassword(password, admin.passwordHash);
			if (!valid) {
				return fail(401, { error: 'Invalid credentials' });
			}
			user = admin;
		} else {
			const [teacher] = await db.select().from(teachers).where(eq(teachers.email, email)).limit(1);
			if (!teacher) {
				return fail(401, { error: 'Invalid credentials' });
			}
			const valid = await verifyPassword(password, teacher.passwordHash);
			if (!valid) {
				return fail(401, { error: 'Invalid credentials' });
			}
			user = teacher;
		}

		// Create session
		await createSession(user.id, userType, event);

		// Redirect based on user type
		if (userType === 'admin') {
			throw redirect(302, '/admin/dashboard');
		} else {
			throw redirect(302, '/teacher/results');
		}
	}
};

