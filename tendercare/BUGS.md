# Bug Analysis Report

## Critical Bugs

### 1. **Session Creation Race Condition** (`src/lib/server/auth.ts:99-111`)
**Issue**: The `setSession` method has a race condition where it checks if a session exists, but Lucia may call this concurrently, leading to duplicate session inserts or missing userType.

**Impact**: Sessions may be created without proper userType, causing authentication failures.

**Location**: `src/lib/server/auth.ts:99-111`

### 2. **Missing Transaction in Result Entry** (`src/routes/teacher/results/+page.server.ts:82-129`)
**Issue**: Multiple database operations (check existing, insert/update) are not wrapped in a transaction. If one fails, partial data may be saved.

**Impact**: Inconsistent data state, some students may have results while others don't.

**Location**: `src/routes/teacher/results/+page.server.ts:82-129`

### 3. **parseInt Without Validation** (`src/routes/teacher/results/+page.server.ts:88-89`)
**Issue**: `parseInt()` can return `NaN` if input is invalid, but code doesn't check for this.

**Impact**: NaN values may be stored in database, breaking calculations.

**Location**: 
- `src/routes/teacher/results/+page.server.ts:88-89`
- `src/routes/admin/classes/+page.server.ts:34`
- `src/routes/admin/terms/+page.server.ts:46`

### 4. **Unsafe Type Casting** (Multiple locations)
**Issue**: Using `as any` bypasses TypeScript type checking, hiding potential runtime errors.

**Impact**: Invalid enum values may be inserted into database, causing runtime errors.

**Locations**:
- `src/routes/admin/promote/+page.server.ts:68`
- `src/routes/admin/subjects/+page.server.ts:31`
- `src/routes/admin/classes/+page.server.ts:32`
- `src/routes/admin/terms/+page.server.ts:66`
- `src/routes/admin/students/+page.server.ts:48,70`

## High Priority Bugs

### 5. **Missing Null Check in Token Generation** (`src/routes/admin/tokens/+page.server.ts:73`)
**Issue**: `existingTokens.map(t => t.studentId)` assumes all tokens have studentId, but leftJoin may return nulls.

**Impact**: Null values in Set may cause issues when checking membership.

**Location**: `src/routes/admin/tokens/+page.server.ts:73`

### 6. **No Validation for Term Number** (`src/routes/admin/terms/+page.server.ts:46`)
**Issue**: `parseInt(termNumber)` doesn't validate that result is 1, 2, or 3.

**Impact**: Invalid term numbers (0, 4, negative, NaN) may be stored.

**Location**: `src/routes/admin/terms/+page.server.ts:46`

### 7. **Student ID Extraction Vulnerability** (`src/routes/teacher/results/+page.server.ts:78-80`)
**Issue**: Extracting student IDs from form keys using `.replace('student_', '')` is fragile. If a student ID contains "student_", it will be incorrectly parsed.

**Impact**: Wrong student IDs may be processed, leading to results saved for wrong students.

**Location**: `src/routes/teacher/results/+page.server.ts:78-80`

### 8. **Missing Error Handling in Database Queries**
**Issue**: Most database queries don't have try-catch blocks. Database errors will crash the request.

**Impact**: Unhandled database errors expose stack traces to users.

**Locations**: Throughout all `+page.server.ts` files

### 9. **No Validation for Academic Year Dates** (`src/routes/admin/promote/+page.server.ts:37-38`)
**Issue**: Date parsing doesn't validate that endDate is after startDate.

**Impact**: Invalid academic years with end date before start date may be created.

**Location**: `src/routes/admin/promote/+page.server.ts:37-38`

## Medium Priority Bugs

### 10. **Missing OrderBy in Token Query** (`src/routes/admin/tokens/+page.server.ts:23`)
**Issue**: Students are ordered by name, but tokens may not be in consistent order.

**Impact**: UI may show inconsistent ordering.

**Location**: `src/routes/admin/tokens/+page.server.ts:23`

### 11. **Potential Null Reference in Result Viewing** (`src/routes/results/[token]/+page.server.ts:30-38`)
**Issue**: `academicYearName` may be null from leftJoin, but code doesn't handle this gracefully.

**Impact**: UI may show "null" or "undefined" in term display.

**Location**: `src/routes/results/[token]/+page.server.ts:30-38`

### 12. **No Duplicate Term Validation** (`src/routes/admin/terms/+page.server.ts:44-50`)
**Issue**: Can create multiple terms with same number for same academic year.

**Impact**: Duplicate terms may cause confusion in result entry.

**Location**: `src/routes/admin/terms/+page.server.ts:44-50`

### 13. **Missing Capacity Validation** (`src/routes/admin/classes/+page.server.ts:34`)
**Issue**: Capacity can be negative or zero, no validation.

**Impact**: Invalid class capacities may be created.

**Location**: `src/routes/admin/classes/+page.server.ts:34`

### 14. **No Check for Published Term Before Publishing** (`src/routes/admin/terms/+page.server.ts:73-85`)
**Issue**: Can publish a term multiple times, no check if already published.

**Impact**: Redundant operations, though harmless.

**Location**: `src/routes/admin/terms/+page.server.ts:73-85`

## Low Priority / Code Quality Issues

### 15. **Inconsistent Error Response Format**
**Issue**: Some actions return `{ error: string }`, others use `fail(400, { error })`.

**Impact**: Inconsistent API responses, harder to handle on frontend.

**Locations**: Compare `src/routes/admin/tokens/+page.server.ts` vs other files

### 16. **Missing Input Sanitization**
**Issue**: User inputs (names, emails) are not sanitized before database insertion.

**Impact**: Potential XSS if data is displayed without escaping (though Svelte handles this).

**Locations**: All form submission handlers

### 17. **No Rate Limiting**
**Issue**: No protection against brute force login attempts or rapid form submissions.

**Impact**: Security vulnerability, potential DoS.

**Locations**: `src/routes/login/+page.server.ts`, all action handlers

### 18. **Missing Indexes Hint**
**Issue**: Database queries may benefit from explicit indexes, but schema doesn't define them.

**Impact**: Performance degradation with large datasets.

**Location**: `src/lib/server/db/schema.ts`

### 19. **Hardcoded Default in Session Creation** (`src/lib/server/auth.ts:110`)
**Issue**: Defaults to 'admin' if userType missing, but should fail instead.

**Impact**: Security issue - wrong user type may be assigned.

**Location**: `src/lib/server/auth.ts:110`

### 20. **No Validation for Empty Student List** (`src/routes/teacher/results/+page.server.ts:83`)
**Issue**: If no students are enrolled, the loop doesn't execute, but no error is returned.

**Impact**: Silent failure, user doesn't know why save didn't work.

**Location**: `src/routes/teacher/results/+page.server.ts:83`

## Summary by Category

- **Type Safety**: 5 bugs (unsafe casting, missing validation)
- **Data Integrity**: 4 bugs (missing transactions, no validation)
- **Error Handling**: 3 bugs (missing try-catch, inconsistent responses)
- **Security**: 2 bugs (input sanitization, rate limiting)
- **Logic Errors**: 3 bugs (race conditions, null handling)
- **Code Quality**: 3 bugs (inconsistent patterns, missing checks)

**Total: 20 identified issues**

