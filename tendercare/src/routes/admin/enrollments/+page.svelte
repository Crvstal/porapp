<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let showCreateForm = false;
</script>

<div class="container">
	<h1>Student Enrollment</h1>

	{#if form?.success}
		<div class="alert alert-success">Enrollment saved successfully!</div>
	{/if}

	{#if form?.error}
		<div class="alert alert-error">{form.error}</div>
	{/if}

	<button class="btn-primary" on:click={() => showCreateForm = !showCreateForm}>
		{showCreateForm ? 'Cancel' : 'Enroll Student'}
	</button>

	{#if showCreateForm}
		<div class="card" style="margin-top: 2em;">
			<h2>Enroll Student in Class</h2>
			<form method="POST" action="?/create" use:enhance>
				<div class="form-group">
					<label for="studentId">Student:</label>
					<select id="studentId" name="studentId" required>
						<option value="">-- Select Student --</option>
						{#each data.students as student}
							<option value={student.id}>
								{student.name} {student.currentClass || ''}{student.currentSection || ''}
							</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="termId">Term:</label>
					<select id="termId" name="termId" required>
						<option value="">-- Select Term --</option>
						{#each data.terms as term}
							<option value={term.id}>Term {term.termNumber}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="classId">Class:</label>
					<select id="classId" name="classId" required>
						<option value="">-- Select Class --</option>
						{#each data.classes as classItem}
							<option value={classItem.id}>{classItem.level}-{classItem.arm}</option>
						{/each}
					</select>
				</div>

				<button type="submit" class="btn-primary">Enroll Student</button>
			</form>
		</div>
	{/if}

	<div class="card" style="margin-top: 2em;">
		<h2>All Enrollments</h2>
		<table class="table">
			<thead>
				<tr>
					<th>Student</th>
					<th>Term</th>
					<th>Class</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.enrollments as enrollment}
					<tr>
						<td>{enrollment.studentName}</td>
						<td>Term {enrollment.termNumber}</td>
						<td>{enrollment.className}-{enrollment.classArm}</td>
						<td>
							<form method="POST" action="?/delete" use:enhance style="display: inline;">
								<input type="hidden" name="id" value={enrollment.id} />
								<button type="submit" class="btn-danger" onclick="return confirm('Are you sure?')">Remove</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

