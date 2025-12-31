<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="container">
	<div style="text-align: center; margin-bottom: 2em;">
		<h1>Student Results</h1>
		<h2>{data.student.name}</h2>
		{#if data.student.currentClass}
			<p>Class: {data.student.currentClass}{data.student.currentSection || ''}</p>
		{/if}
	</div>

	{#if data.results.length === 0}
		<div class="card" style="text-align: center;">
			<p>No published results available yet.</p>
		</div>
	{:else}
		{#each data.results as termResult}
			<div class="card" style="margin-bottom: 2em;">
				<h2>
					{termResult.term.academicYearName || 'Academic Year'} - Term {termResult.term.termNumber}
				</h2>
				<table class="table">
					<thead>
						<tr>
							<th>Subject</th>
							<th>CA</th>
							<th>Exam</th>
							<th>Total</th>
							<th>Grade</th>
						</tr>
					</thead>
					<tbody>
						{#each termResult.results as result}
							<tr>
								<td>{result.subjectName}</td>
								<td>{result.caScore ?? '—'}</td>
								<td>{result.examScore ?? '—'}</td>
								<td><strong>{result.total}</strong></td>
								<td>
									{#if result.total >= 75}
										A
									{:else if result.total >= 65}
										B
									{:else if result.total >= 55}
										C
									{:else if result.total >= 45}
										D
									{:else if result.total >= 40}
										E
									{:else}
										F
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr>
							<td><strong>Total</strong></td>
							<td colspan="3">
								<strong>
									{termResult.results.reduce((sum, r) => sum + r.total, 0)} / 
									{termResult.results.length * 100}
								</strong>
							</td>
							<td>
								<strong>
									{Math.round((termResult.results.reduce((sum, r) => sum + r.total, 0) / (termResult.results.length * 100)) * 100)}%
								</strong>
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		{/each}
	{/if}

	<div style="text-align: center; margin-top: 2em;">
		<button class="btn-primary" on:click={() => window.print()}>Print Results</button>
	</div>
</div>

<style>
	@media print {
		.nav, button {
			display: none;
		}
	}
</style>

