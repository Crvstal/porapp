<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let showCreateForm = false;

	const classLevels = ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'];
	const sections = ['A', 'B', 'C'];
</script>

<div class="container">
	<h1>Class Management</h1>

	{#if form?.success}
		<div class="alert alert-success">Class saved successfully!</div>
	{/if}

	{#if form?.error}
		<div class="alert alert-error">{form.error}</div>
	{/if}

	<button class="btn-primary" on:click={() => showCreateForm = !showCreateForm}>
		{showCreateForm ? 'Cancel' : 'Create New Class'}
	</button>

	{#if showCreateForm}
		<div class="card" style="margin-top: 2em;">
			<h2>Create Class</h2>
			<form method="POST" action="?/create" use:enhance>
				<div class="form-group">
					<label for="level">Class Level:</label>
					<select id="level" name="level" required>
						<option value="">-- Select --</option>
						{#each classLevels as level}
							<option value={level}>{level}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="arm">Section (Arm):</label>
					<select id="arm" name="arm" required>
						<option value="">-- Select --</option>
						{#each sections as sec}
							<option value={sec}>{sec}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="capacity">Capacity:</label>
					<input type="number" id="capacity" name="capacity" min="1" required />
				</div>

				<button type="submit" class="btn-primary">Create Class</button>
			</form>
		</div>
	{/if}

	<div class="card" style="margin-top: 2em;">
		<h2>All Classes</h2>
		<table class="table">
			<thead>
				<tr>
					<th>Level</th>
					<th>Section</th>
					<th>Capacity</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.classes as classItem}
					<tr>
						<td>{classItem.level}</td>
						<td>{classItem.arm}</td>
						<td>{classItem.capacity}</td>
						<td>
							<form method="POST" action="?/delete" use:enhance style="display: inline;">
								<input type="hidden" name="id" value={classItem.id} />
								<button type="submit" class="btn-danger" onclick="return confirm('Are you sure?')">Delete</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

