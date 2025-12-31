import { lucia } from './auth';
import { db } from './db';
import { admins, teachers, sessions } from './db/schema';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';
import { Argon2id } from 'oslo/password';

export async function hashPassword(password: string): Promise<string> {
	const hasher = new Argon2id();
	return await hasher.hash(password);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	const hasher = new Argon2id();
	return await hasher.verify(hash, password);
}

export async function validateSession(event: RequestEvent) {
	const sessionId = event.cookies.get(lucia.sessionCookieName) ?? null;
	if (!sessionId) {
		return { user: null, session: null };
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (!session) {
		return { user: null, session: null };
	}

	// Fetch user details from appropriate table
	let userDetails;
	if (user.userType === 'admin') {
		const [admin] = await db.select().from(admins).where(eq(admins.id, user.id)).limit(1);
		if (!admin) {
			return { user: null, session: null };
		}
		userDetails = { ...user, ...admin };
	} else {
		const [teacher] = await db.select().from(teachers).where(eq(teachers.id, user.id)).limit(1);
		if (!teacher) {
			return { user: null, session: null };
		}
		userDetails = { ...user, ...teacher };
	}

	return { user: userDetails, session };
}

export async function createSession(userId: string, userType: 'admin' | 'teacher', event: RequestEvent) {
	const session = await lucia.createSession(userId, {});
	// Immediately update session to include userType
	// This happens right after session creation, minimizing race condition window
	await db.update(sessions)
		.set({ userType: userType })
		.where(eq(sessions.id, session.id));
	
	const sessionCookie = lucia.createSessionCookie(session.id);
	event.cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});
	return session;
}

export async function invalidateSession(event: RequestEvent) {
	const sessionId = event.cookies.get(lucia.sessionCookieName) ?? null;
	if (!sessionId) {
		return;
	}
	await lucia.invalidateSession(sessionId);
	const sessionCookie = lucia.createBlankSessionCookie();
	event.cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});
}

