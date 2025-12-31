<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let showCreateForm = false;
</script>

<div class="container">
	<h1>Subject Management</h1>

	{#if form?.success}
		<div class="alert alert-success">Subject saved successfully!</div>
	{/if}

	{#if form?.error}
		<div class="alert alert-error">{form.error}</div>
	{/if}

	<button class="btn-primary" on:click={() => showCreateForm = !showCreateForm}>
		{showCreateForm ? 'Cancel' : 'Create New Subject'}
	</button>

	{#if showCreateForm}
		<div class="card" style="margin-top: 2em;">
			<h2>Create Subject</h2>
			<form method="POST" action="?/create" use:enhance>
				<div class="form-group">
					<label for="name">Subject Name:</label>
					<input type="text" id="name" name="name" required />
				</div>

				<div class="form-group">
					<label for="level">Level:</label>
					<select id="level" name="level" required>
						<option value="">-- Select --</option>
						<option value="Junior">Junior (JSS1-JSS3)</option>
						<option value="Senior">Senior (SSS1-SSS3)</option>
					</select>
				</div>

				<button type="submit" class="btn-primary">Create Subject</button>
			</form>
		</div>
	{/if}

	<div class="card" style="margin-top: 2em;">
		<h2>All Subjects</h2>
		<table class="table">
			<thead>
				<tr>
					<th>Name</th>
					<th>Level</th>
					<th>CA Max</th>
					<th>Exam Max</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.subjects as subject}
					<tr>
						<td>{subject.name}</td>
						<td>{subject.level}</td>
						<td>{subject.level === 'Junior' ? 30 : 20}</td>
						<td>{subject.level === 'Junior' ? 70 : 80}</td>
						<td>
							<form method="POST" action="?/delete" use:enhance style="display: inline;">
								<input type="hidden" name="id" value={subject.id} />
								<button type="submit" class="btn-danger" onclick="return confirm('Are you sure?')">Delete</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

