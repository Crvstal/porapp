import { pgTable, text, uuid, boolean, timestamp, integer, varchar, pgEnum, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const termStatusEnum = pgEnum('term_status', ['active', 'paused', 'closed']);
export const classLevelEnum = pgEnum('class_level', ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3']);
export const subjectLevelEnum = pgEnum('subject_level', ['Junior', 'Senior']);
export const userTypeEnum = pgEnum('user_type', ['admin', 'teacher']);

// Users & Auth
export const admins = pgTable('admins', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	name: varchar('name', { length: 255 }).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const teachers = pgTable('teachers', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	name: varchar('name', { length: 255 }).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const students = pgTable('students', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 255 }).notNull(),
	currentClass: classLevelEnum('current_class'),
	currentSection: varchar('current_section', { length: 1 }), // A, B, C
	active: boolean('active').default(true).notNull(),
	graduatedAt: timestamp('graduated_at'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: uuid('user_id').notNull(),
	userType: userTypeEnum('user_type').notNull(),
	expiresAt: timestamp('expires_at').notNull()
});

// Academic Structure
export const academicYears = pgTable('academic_years', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 50 }).notNull().unique(), // e.g., "2024/2025"
	startDate: timestamp('start_date').notNull(),
	endDate: timestamp('end_date').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const terms = pgTable('terms', {
	id: uuid('id').primaryKey().defaultRandom(),
	academicYearId: uuid('academic_year_id').notNull().references(() => academicYears.id),
	termNumber: integer('term_number').notNull(), // 1, 2, or 3
	autoCloseDate: timestamp('auto_close_date'),
	status: termStatusEnum('status').default('active').notNull(),
	resultsPublished: boolean('results_published').default(false).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const classes = pgTable('classes', {
	id: uuid('id').primaryKey().defaultRandom(),
	level: classLevelEnum('level').notNull(),
	arm: varchar('arm', { length: 1 }).notNull(), // A, B, C
	capacity: integer('capacity').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
	uniqueLevelArm: unique().on(table.level, table.arm)
}));

export const subjects = pgTable('subjects', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 255 }).notNull(),
	level: subjectLevelEnum('level').notNull(), // Junior or Senior
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// Enrollment & Results
export const enrollments = pgTable('enrollments', {
	id: uuid('id').primaryKey().defaultRandom(),
	studentId: uuid('student_id').notNull().references(() => students.id),
	termId: uuid('term_id').notNull().references(() => terms.id),
	classId: uuid('class_id').notNull().references(() => classes.id),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const results = pgTable('results', {
	id: uuid('id').primaryKey().defaultRandom(),
	studentId: uuid('student_id').notNull().references(() => students.id),
	termId: uuid('term_id').notNull().references(() => terms.id),
	subjectId: uuid('subject_id').notNull().references(() => subjects.id),
	caScore: integer('ca_score'),
	examScore: integer('exam_score'),
	enteredByTeacherId: uuid('entered_by_teacher_id').references(() => teachers.id),
	updatedByTeacherId: uuid('updated_by_teacher_id').references(() => teachers.id),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
	uniqueStudentTermSubject: unique().on(table.studentId, table.termId, table.subjectId)
}));

export const resultTokens = pgTable('result_tokens', {
	id: uuid('id').primaryKey().defaultRandom(),
	studentId: uuid('student_id').notNull().references(() => students.id).unique(),
	token: varchar('token', { length: 64 }).notNull().unique(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const academicYearsRelations = relations(academicYears, ({ many }) => ({
	terms: many(terms)
}));

export const termsRelations = relations(terms, ({ one, many }) => ({
	academicYear: one(academicYears, {
		fields: [terms.academicYearId],
		references: [academicYears.id]
	}),
	enrollments: many(enrollments),
	results: many(results)
}));

export const classesRelations = relations(classes, ({ many }) => ({
	enrollments: many(enrollments)
}));

export const studentsRelations = relations(students, ({ many }) => ({
	enrollments: many(enrollments),
	results: many(results),
	resultToken: many(resultTokens)
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
	results: many(results)
}));

export const teachersRelations = relations(teachers, ({ many }) => ({
	enteredResults: many(results, { relationName: 'enteredBy' }),
	updatedResults: many(results, { relationName: 'updatedBy' })
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
	student: one(students, {
		fields: [enrollments.studentId],
		references: [students.id]
	}),
	term: one(terms, {
		fields: [enrollments.termId],
		references: [terms.id]
	}),
	class: one(classes, {
		fields: [enrollments.classId],
		references: [classes.id]
	})
}));

export const resultsRelations = relations(results, ({ one }) => ({
	student: one(students, {
		fields: [results.studentId],
		references: [students.id]
	}),
	term: one(terms, {
		fields: [results.termId],
		references: [terms.id]
	}),
	subject: one(subjects, {
		fields: [results.subjectId],
		references: [subjects.id]
	}),
	enteredBy: one(teachers, {
		fields: [results.enteredByTeacherId],
		references: [teachers.id],
		relationName: 'enteredBy'
	}),
	updatedBy: one(teachers, {
		fields: [results.updatedByTeacherId],
		references: [teachers.id],
		relationName: 'updatedBy'
	})
}));

export const resultTokensRelations = relations(resultTokens, ({ one }) => ({
	student: one(students, {
		fields: [resultTokens.studentId],
		references: [students.id]
	})
}));

