<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let showCreateForm = false;
</script>

<div class="container">
	<h1>Term Management</h1>

	{#if form?.success}
		<div class="alert alert-success">Term updated successfully!</div>
	{/if}

	{#if form?.error}
		<div class="alert alert-error">{form.error}</div>
	{/if}

	<button class="btn-primary" on:click={() => showCreateForm = !showCreateForm}>
		{showCreateForm ? 'Cancel' : 'Create New Term'}
	</button>

	{#if showCreateForm}
		<div class="card" style="margin-top: 2em;">
			<h2>Create Term</h2>
			<form method="POST" action="?/create" use:enhance>
				<div class="form-group">
					<label for="academicYearId">Academic Year:</label>
					<select id="academicYearId" name="academicYearId" required>
						<option value="">-- Select --</option>
						{#each data.academicYears as year}
							<option value={year.id}>{year.name}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="termNumber">Term Number:</label>
					<select id="termNumber" name="termNumber" required>
						<option value="1">Term 1</option>
						<option value="2">Term 2</option>
						<option value="3">Term 3</option>
					</select>
				</div>

				<div class="form-group">
					<label for="autoCloseDate">Auto-Close Date (optional):</label>
					<input type="datetime-local" id="autoCloseDate" name="autoCloseDate" />
				</div>

				<button type="submit" class="btn-primary">Create Term</button>
			</form>
		</div>
	{/if}

	<div class="card" style="margin-top: 2em;">
		<h2>All Terms</h2>
		<table class="table">
			<thead>
				<tr>
					<th>Academic Year</th>
					<th>Term</th>
					<th>Status</th>
					<th>Auto-Close Date</th>
					<th>Results Published</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.terms as term}
					<tr>
						<td>{term.academicYearName || '—'}</td>
						<td>Term {term.termNumber}</td>
						<td>{term.status}</td>
						<td>{term.autoCloseDate ? new Date(term.autoCloseDate).toLocaleDateString() : '—'}</td>
						<td>{term.resultsPublished ? 'Yes' : 'No'}</td>
						<td>
							{#if !term.resultsPublished}
								<form method="POST" action="?/publish" use:enhance style="display: inline;">
									<input type="hidden" name="id" value={term.id} />
									<button type="submit" class="btn-primary" style="margin-right: 0.5em;">Publish Results</button>
								</form>
							{/if}
							<form method="POST" action="?/update" use:enhance style="display: inline;">
								<input type="hidden" name="id" value={term.id} />
								<select name="status" onchange="this.form.submit()" style="margin-right: 0.5em;">
									<option value="active" selected={term.status === 'active'}>Active</option>
									<option value="paused" selected={term.status === 'paused'}>Paused</option>
									<option value="closed" selected={term.status === 'closed'}>Closed</option>
								</select>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

