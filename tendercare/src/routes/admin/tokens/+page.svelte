<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<div class="container">
	<h1>Token Management</h1>

	{#if form?.success}
		<div class="alert alert-success">
			{#if form.token}
				Token generated: <strong style="font-family: monospace;">{form.token}</strong>
			{:else}
				Tokens generated for all students without tokens.
			{/if}
		</div>
	{/if}

	{#if form?.error}
		<div class="alert alert-error">{form.error}</div>
	{/if}

	<div class="card" style="margin-bottom: 2em;">
		<h2>Bulk Actions</h2>
		<form method="POST" action="?/generateAll" use:enhance>
			<button type="submit" class="btn-primary">Generate Tokens for All Students (without tokens)</button>
		</form>
	</div>

	<div class="card">
		<h2>All Students and Tokens</h2>
		<table class="table">
			<thead>
				<tr>
					<th>Name</th>
					<th>Class</th>
					<th>Token</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.students as student}
					<tr>
						<td>{student.name}</td>
						<td>{student.currentClass || '—'}{student.currentSection || ''}</td>
						<td>
							{#if student.token}
								<code style="font-family: monospace; background: #f5f5f5; padding: 0.25em 0.5em; border-radius: 4px;">
									{student.token}
								</code>
							{:else}
								<span style="color: #999;">No token</span>
							{/if}
						</td>
						<td>
							<form method="POST" action="?/generate" use:enhance style="display: inline;">
								<input type="hidden" name="studentId" value={student.id} />
								<button type="submit" class="btn-primary">
									{student.token ? 'Regenerate' : 'Generate'}
								</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

