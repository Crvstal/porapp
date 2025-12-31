<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="container">
	<h1>View Students</h1>

	{#if data.currentTerm}
		<div class="card" style="margin-bottom: 2em;">
			<h2>Current Term Enrollments (Term {data.currentTerm.termNumber})</h2>
			<table class="table">
				<thead>
					<tr>
						<th>Student Name</th>
						<th>Class</th>
					</tr>
				</thead>
				<tbody>
					{#each data.enrollments as enrollment}
						<tr>
							<td>{enrollment.studentName}</td>
							<td>{enrollment.className}-{enrollment.classArm}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="alert alert-error">No active term found.</div>
	{/if}

	<div class="card">
		<h2>All Active Students</h2>
		<table class="table">
			<thead>
				<tr>
					<th>Name</th>
					<th>Current Class</th>
					<th>Section</th>
				</tr>
			</thead>
			<tbody>
				{#each data.students as student}
					<tr>
						<td>{student.name}</td>
						<td>{student.currentClass || '—'}</td>
						<td>{student.currentSection || '—'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

