<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let editingId: string | null = null;
	let showCreateForm = false;

	const classLevels = ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'];
	const sections = ['A', 'B', 'C'];

	function startEdit(student: any) {
		editingId = student.id;
		showCreateForm = false;
	}

	function cancelEdit() {
		editingId = null;
		showCreateForm = false;
	}
</script>

<div class="container">
	<h1>Student Management</h1>

	{#if form?.success}
		<div class="alert alert-success">Student saved successfully!</div>
	{/if}

	{#if form?.error}
		<div class="alert alert-error">{form.error}</div>
	{/if}

	<button class="btn-primary" on:click={() => { showCreateForm = true; editingId = null; }}>
		Add New Student
	</button>

	{#if showCreateForm}
		<div class="card" style="margin-top: 2em;">
			<h2>Add Student</h2>
			<form method="POST" action="?/create" use:enhance>
				<div class="form-group">
					<label for="name">Name:</label>
					<input type="text" id="name" name="name" required />
				</div>

				<div class="form-group">
					<label for="classLevel">Class Level:</label>
					<select id="classLevel" name="classLevel">
						<option value="">-- Select --</option>
						{#each classLevels as level}
							<option value={level}>{level}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="section">Section:</label>
					<select id="section" name="section">
						<option value="">-- Select --</option>
						{#each sections as sec}
							<option value={sec}>{sec}</option>
						{/each}
					</select>
				</div>

				<button type="submit" class="btn-primary">Create</button>
				<button type="button" class="btn-secondary" on:click={cancelEdit}>Cancel</button>
			</form>
		</div>
	{/if}

	<div class="card" style="margin-top: 2em;">
		<h2>All Students</h2>
		<table class="table">
			<thead>
				<tr>
					<th>Name</th>
					<th>Class</th>
					<th>Section</th>
					<th>Status</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.students as student}
					<tr>
						{#if editingId === student.id}
							<td colspan="5">
								<form method="POST" action="?/update" use:enhance>
									<input type="hidden" name="id" value={student.id} />
									<div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 1em; align-items: end;">
										<div class="form-group" style="margin: 0;">
											<label for="edit-name-{student.id}">Name:</label>
											<input type="text" id="edit-name-{student.id}" name="name" value={student.name} required />
										</div>
										<div class="form-group" style="margin: 0;">
											<label for="edit-class-{student.id}">Class:</label>
											<select id="edit-class-{student.id}" name="classLevel">
												<option value="">-- Select --</option>
												{#each classLevels as level}
													<option value={level} selected={student.currentClass === level}>{level}</option>
												{/each}
											</select>
										</div>
										<div class="form-group" style="margin: 0;">
											<label for="edit-section-{student.id}">Section:</label>
											<select id="edit-section-{student.id}" name="section">
												<option value="">-- Select --</option>
												{#each sections as sec}
													<option value={sec} selected={student.currentSection === sec}>{sec}</option>
												{/each}
											</select>
										</div>
										<div class="form-group" style="margin: 0;">
											<label for="edit-active-{student.id}">Active:</label>
											<select id="edit-active-{student.id}" name="active">
												<option value="true" selected={student.active}>Yes</option>
												<option value="false" selected={!student.active}>No</option>
											</select>
										</div>
										<div>
											<button type="submit" class="btn-primary">Save</button>
											<button type="button" class="btn-secondary" on:click={cancelEdit}>Cancel</button>
										</div>
									</div>
								</form>
							</td>
						{:else}
							<td>{student.name}</td>
							<td>{student.currentClass || '—'}</td>
							<td>{student.currentSection || '—'}</td>
							<td>
								{#if student.graduatedAt}
									Graduated
								{:else if student.active}
									Active
								{:else}
									Inactive
								{/if}
							</td>
							<td>
								<button class="btn-secondary" on:click={() => startEdit(student)}>Edit</button>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

