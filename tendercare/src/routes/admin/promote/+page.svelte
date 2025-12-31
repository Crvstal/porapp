<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let showAcademicYearForm = false;
</script>

<div class="container">
	<h1>Annual Promotion</h1>

	{#if form?.success}
		<div class="alert alert-success">
			{#if form.promoted}
				Successfully promoted {form.promoted} students!
			{:else}
				Academic year created successfully!
			{/if}
		</div>
	{/if}

	{#if form?.error}
		<div class="alert alert-error">{form.error}</div>
	{/if}

	<div class="card" style="margin-bottom: 2em;">
		<h2>Create Academic Year</h2>
		<button class="btn-primary" on:click={() => showAcademicYearForm = !showAcademicYearForm}>
			{showAcademicYearForm ? 'Cancel' : 'Create New Academic Year'}
		</button>

		{#if showAcademicYearForm}
			<form method="POST" action="?/createAcademicYear" use:enhance style="margin-top: 1em;">
				<div class="form-group">
					<label for="name">Academic Year Name (e.g., "2024/2025"):</label>
					<input type="text" id="name" name="name" placeholder="2024/2025" required />
				</div>

				<div class="form-group">
					<label for="startDate">Start Date:</label>
					<input type="date" id="startDate" name="startDate" required />
				</div>

				<div class="form-group">
					<label for="endDate">End Date:</label>
					<input type="date" id="endDate" name="endDate" required />
				</div>

				<button type="submit" class="btn-primary">Create Academic Year</button>
			</form>
		{/if}
	</div>

	<div class="card" style="margin-bottom: 2em; background: #fff3cd; border: 2px solid #ffc107;">
		<h2 style="color: #856404;">⚠️ Start New Academic Year (Promotion)</h2>
		<p style="margin: 1em 0;">
			<strong>This will promote all active students to the next class level:</strong>
		</p>
		<ul style="margin-left: 2em; margin-bottom: 1em;">
			<li>JSS1 → JSS2</li>
			<li>JSS2 → JSS3</li>
			<li>JSS3 → SSS1</li>
			<li>SSS1 → SSS2</li>
			<li>SSS2 → SSS3</li>
			<li>SSS3 → Graduated (archived)</li>
		</ul>
		<p style="margin: 1em 0; color: #856404;">
			<strong>Warning:</strong> This action cannot be undone. Make sure you have created the new academic year first.
		</p>
		<form method="POST" action="?/promote" use:enhance>
			<button type="submit" class="btn-danger" onclick="return confirm('Are you sure you want to promote all students? This cannot be undone.')">
				Promote All Students
			</button>
		</form>
	</div>

	<div class="card">
		<h2>Current Students (will be promoted)</h2>
		<p>Total active students: {data.students.length}</p>
		<table class="table">
			<thead>
				<tr>
					<th>Name</th>
					<th>Current Class</th>
					<th>Will Promote To</th>
				</tr>
			</thead>
			<tbody>
				{#each data.students as student}
					<tr>
						<td>{student.name}</td>
						<td>{student.currentClass}{student.currentSection || ''}</td>
						<td>
							{#if student.currentClass}
								{getNextClassLevel(student.currentClass)}
							{:else}
								—
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<script>
	function getNextClassLevel(current) {
		const progression = {
			JSS1: 'JSS2',
			JSS2: 'JSS3',
			JSS3: 'SSS1',
			SSS1: 'SSS2',
			SSS2: 'SSS3',
			SSS3: 'Graduated'
		};
		return progression[current] || current;
	}
</script>

