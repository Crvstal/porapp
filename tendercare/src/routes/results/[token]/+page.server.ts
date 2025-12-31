import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { resultTokens, students, results, terms, subjects, academicYears } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const token = params.token;

	// Find token
	const [tokenRecord] = await db.select({
		token: resultTokens.token,
		studentId: resultTokens.studentId
	})
		.from(resultTokens)
		.where(eq(resultTokens.token, token))
		.limit(1);

	if (!tokenRecord) {
		throw error(404, 'Invalid token');
	}

	// Get student info
	const [student] = await db.select().from(students).where(eq(students.id, tokenRecord.studentId)).limit(1);
	if (!student) {
		throw error(404, 'Student not found');
	}

	// Get all published terms
	const publishedTerms = await db.select({
		id: terms.id,
		termNumber: terms.termNumber,
		academicYearName: academicYears.name
	})
		.from(terms)
		.leftJoin(academicYears, eq(terms.academicYearId, academicYears.id))
		.where(eq(terms.resultsPublished, true))
		.orderBy(terms.termNumber);

	// Get results for each published term
	const allResults = [];
	for (const term of publishedTerms) {
		const termResults = await db.select({
			subjectName: subjects.name,
			subjectLevel: subjects.level,
			caScore: results.caScore,
			examScore: results.examScore,
			termId: results.termId
		})
			.from(results)
			.innerJoin(subjects, eq(results.subjectId, subjects.id))
			.where(and(
				eq(results.studentId, tokenRecord.studentId),
				eq(results.termId, term.id)
			));

		if (termResults.length > 0) {
			allResults.push({
				term: term,
				results: termResults.map(r => ({
					subjectName: r.subjectName,
					subjectLevel: r.subjectLevel,
					caScore: r.caScore,
					examScore: r.examScore,
					total: (r.caScore || 0) + (r.examScore || 0)
				}))
			});
		}
	}

	return {
		student,
		results: allResults
	};
};

