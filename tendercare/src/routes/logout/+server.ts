import { redirect } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName) ?? null;
	if (sessionId) {
		await lucia.invalidateSession(sessionId);
	}
	const sessionCookie = lucia.createBlankSessionCookie();
	event.cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});
	throw redirect(302, '/login');
};

