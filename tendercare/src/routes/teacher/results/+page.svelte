<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let selectedClassId: string = '';
	let selectedTermId: string = '';
	let selectedSubjectId: string = '';
	let students: any[] = [];
	let loading = false;
	let markingScheme: { caMax: number; examMax: number } | null = null;

	function getMarkingScheme(level: string): { caMax: number; examMax: number } {
		if (level === 'Junior') {
			return { caMax: 30, examMax: 70 };
		} else {
			return { caMax: 20, examMax: 80 };
		}
	}

	async function loadStudents() {
		if (!selectedClassId || !selectedTermId) {
			alert('Please select both class and term');
			return;
		}

		loading = true;
		const formData = new FormData();
		formData.append('classId', selectedClassId);
		formData.append('termId', selectedTermId);

		try {
			const response = await fetch('?/loadStudents', {
				method: 'POST',
				body: formData
			});
			const result = await response.json();
			if (result.type === 'success' && result.data?.students) {
				students = result.data.students;
			} else {
				alert('Failed to load students');
			}
		} catch (error) {
			alert('Error loading students');
		} finally {
			loading = false;
		}
	}

	function updateMarkingScheme() {
		if (!selectedSubjectId) {
			markingScheme = null;
			return;
		}
		const subject = data.subjects.find(s => s.id === selectedSubjectId);
		if (subject) {
			markingScheme = getMarkingScheme(subject.level);
		}
	}

	$: if (selectedSubjectId) {
		updateMarkingScheme();
	}
</script>

<div class="container">
	<h1>Enter Results</h1>

	{#if form?.success}
		<div class="alert alert-success">Results saved successfully!</div>
	{/if}

	{#if form?.error}
		<div class="alert alert-error">{form.error}</div>
	{/if}

	<div class="card">
		<h2>Select Class, Term, and Subject</h2>
		<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1em;">
			<div class="form-group">
				<label for="termId">Term:</label>
				<select id="termId" bind:value={selectedTermId}>
					<option value="">-- Select Term --</option>
					{#each data.activeTerms as term}
						<option value={term.id}>Term {term.termNumber}</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="classId">Class:</label>
				<select id="classId" bind:value={selectedClassId}>
					<option value="">-- Select Class --</option>
					{#each data.classes as classItem}
						<option value={classItem.id}>{classItem.level}-{classItem.arm}</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="subjectId">Subject:</label>
				<select id="subjectId" bind:value={selectedSubjectId} on:change={updateMarkingScheme}>
					<option value="">-- Select Subject --</option>
					{#each data.subjects as subject}
						<option value={subject.id}>{subject.name} ({subject.level})</option>
					{/each}
				</select>
			</div>
		</div>

		{#if markingScheme}
			<div style="margin-top: 1em; padding: 1em; background: #f5f5f5; border-radius: 4px;">
				<strong>Marking Scheme:</strong> CA Max: {markingScheme.caMax}, Exam Max: {markingScheme.examMax}
			</div>
		{/if}

		<button class="btn-primary" on:click={loadStudents} disabled={!selectedClassId || !selectedTermId || loading} style="margin-top: 1em;">
			{loading ? 'Loading...' : 'Load Students'}
		</button>
	</div>

	{#if students.length > 0 && selectedSubjectId}
		<div class="card" style="margin-top: 2em;">
			<h2>Enter Scores</h2>
			<form method="POST" action="?/save" use:enhance>
				<input type="hidden" name="termId" value={selectedTermId} />
				<input type="hidden" name="subjectId" value={selectedSubjectId} />

				<table class="table">
					<thead>
						<tr>
							<th>Student Name</th>
							<th>CA Score (Max: {markingScheme?.caMax || '—'})</th>
							<th>Exam Score (Max: {markingScheme?.examMax || '—'})</th>
							<th>Total</th>
						</tr>
					</thead>
					<tbody>
						{#each students as student}
							<tr>
								<td>{student.studentName}</td>
								<td>
									<input
										type="number"
										name="student_{student.studentId}_ca"
										min="0"
										max={markingScheme?.caMax || 100}
										style="width: 100px;"
									/>
								</td>
								<td>
									<input
										type="number"
										name="student_{student.studentId}_exam"
										min="0"
										max={markingScheme?.examMax || 100}
										style="width: 100px;"
									/>
								</td>
								<td>
									<span id="total_{student.studentId}">—</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>

				<button type="submit" class="btn-primary" style="margin-top: 1em;">Save All Results</button>
			</form>
		</div>
	{/if}
</div>

<script>
	// Calculate totals dynamically
	document.addEventListener('input', (e) => {
		if (e.target.name && e.target.name.includes('_ca') || e.target.name.includes('_exam')) {
			const studentId = e.target.name.split('_')[1];
			const caInput = document.querySelector(`input[name="student_${studentId}_ca"]`) as HTMLInputElement;
			const examInput = document.querySelector(`input[name="student_${studentId}_exam"]`) as HTMLInputElement;
			const totalSpan = document.getElementById(`total_${studentId}`);
			
			if (totalSpan) {
				const ca = parseInt(caInput?.value || '0') || 0;
				const exam = parseInt(examInput?.value || '0') || 0;
				totalSpan.textContent = ca + exam || '—';
			}
		}
	});
</script>

