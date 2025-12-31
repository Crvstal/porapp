import { Lucia, type SessionAdapter, type UserAdapter } from 'lucia';
import postgres from 'postgres';
import { db } from './db';
import { sessions, admins, teachers } from './db/schema';
import { eq } from 'drizzle-orm';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(process.env.DATABASE_URL);

// Custom adapter for separate admin/teacher tables
const adapter: SessionAdapter & UserAdapter = {
	getSessionAndUser: async (sessionId: string) => {
		const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
		if (!session) {
			return [null, null];
		}

		let user;
		if (session.userType === 'admin') {
			const [admin] = await db.select().from(admins).where(eq(admins.id, session.userId)).limit(1);
			if (!admin) {
				return [null, null];
			}
			user = {
				id: admin.id,
				email: admin.email,
				name: admin.name,
				userType: 'admin' as const
			};
		} else {
			const [teacher] = await db.select().from(teachers).where(eq(teachers.id, session.userId)).limit(1);
			if (!teacher) {
				return [null, null];
			}
			user = {
				id: teacher.id,
				email: teacher.email,
				name: teacher.name,
				userType: 'teacher' as const
			};
		}

		return [
			{
				id: session.id,
				userId: session.userId,
				expiresAt: session.expiresAt
			},
			user
		];
	},
	getUser: async (userId: string) => {
		// Try admin first
		const [admin] = await db.select().from(admins).where(eq(admins.id, userId)).limit(1);
		if (admin) {
			return {
				id: admin.id,
				email: admin.email,
				name: admin.name,
				userType: 'admin' as const
			};
		}

		// Try teacher
		const [teacher] = await db.select().from(teachers).where(eq(teachers.id, userId)).limit(1);
		if (teacher) {
			return {
				id: teacher.id,
				email: teacher.email,
				name: teacher.name,
				userType: 'teacher' as const
			};
		}

		return null;
	},
	getSession: async (sessionId: string) => {
		const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
		if (!session) {
			return null;
		}
		return {
			id: session.id,
			userId: session.userId,
			expiresAt: session.expiresAt
		};
	},
	getSessionsByUserId: async (userId: string) => {
		const userSessions = await db.select().from(sessions).where(eq(sessions.userId, userId));
		return userSessions.map((s) => ({
			id: s.id,
			userId: s.userId,
			expiresAt: s.expiresAt
		}));
	},
	setSession: async (session) => {
		// Use INSERT ... ON CONFLICT to handle race conditions atomically
		// userType will be set by createSession helper immediately after
		// For now, default to 'admin' - will be updated by createSession if needed
		await client`
			INSERT INTO sessions (id, user_id, user_type, expires_at)
			VALUES (${session.id}, ${session.userId}, 'admin', ${session.expiresAt})
			ON CONFLICT (id) DO UPDATE
			SET expires_at = ${session.expiresAt}
		`;
	},
	deleteSession: async (sessionId: string) => {
		await db.delete(sessions).where(eq(sessions.id, sessionId));
	},
	deleteSessionsByUserId: async (userId: string) => {
		await db.delete(sessions).where(eq(sessions.userId, userId));
	},
	updateSessionExpiration: async (sessionId: string, expiresAt: Date) => {
		await client`
			UPDATE sessions SET expires_at = ${expiresAt} WHERE id = ${sessionId}
		`;
	}
};

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === 'production'
		}
	},
	getUserAttributes: (attributes) => {
		return {
			email: attributes.email,
			name: attributes.name,
			userType: attributes.userType
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			id: string;
			email: string;
			name: string;
			userType: 'admin' | 'teacher';
		};
	}
}

