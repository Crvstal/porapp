import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { terms, academicYears } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.userType !== 'admin') {
		throw redirect(302, '/login');
	}

	const allTerms = await db.select({
		id: terms.id,
		termNumber: terms.termNumber,
		status: terms.status,
		autoCloseDate: terms.autoCloseDate,
		resultsPublished: terms.resultsPublished,
		academicYearName: academicYears.name,
		academicYearId: terms.academicYearId
	})
		.from(terms)
		.leftJoin(academicYears, eq(terms.academicYearId, academicYears.id))
		.orderBy(desc(terms.createdAt));

	const allAcademicYears = await db.select().from(academicYears).orderBy(desc(academicYears.startDate));

	return {
		terms: allTerms,
		academicYears: allAcademicYears
	};
};

export const actions: Actions = {
	create: async (event) => {
		const formData = await event.request.formData();
		const academicYearId = formData.get('academicYearId')?.toString();
		const termNumber = formData.get('termNumber')?.toString();
		const autoCloseDate = formData.get('autoCloseDate')?.toString();

		if (!academicYearId || !termNumber) {
			return fail(400, { error: 'Academic year and term number are required' });
		}

		const termNum = parseInt(termNumber, 10);
		if (isNaN(termNum) || termNum < 1 || termNum > 3) {
			return fail(400, { error: 'Term number must be 1, 2, or 3' });
		}

		await db.insert(terms).values({
			academicYearId,
			termNumber: termNum,
			autoCloseDate: autoCloseDate ? new Date(autoCloseDate) : null,
			status: 'active',
			resultsPublished: false
		});

		return { success: true };
	},
	update: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('id')?.toString();
		const status = formData.get('status')?.toString();
		const autoCloseDate = formData.get('autoCloseDate')?.toString();

		if (!id) {
			return fail(400, { error: 'ID is required' });
		}

		await db.update(terms)
			.set({
				status: status as any || 'active',
				autoCloseDate: autoCloseDate ? new Date(autoCloseDate) : null
			})
			.where(eq(terms.id, id));

		return { success: true };
	},
	publish: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'ID is required' });
		}

		await db.update(terms)
			.set({ resultsPublished: true })
			.where(eq(terms.id, id));

		return { success: true };
	}
};

