<script lang="ts">
	import { goto } from '$app/navigation';

	let token = '';

	function viewResults() {
		if (token.trim()) {
			goto(`/results/${token.trim()}`);
		}
	}
</script>

<div class="container" style="max-width: 600px; margin: 4em auto; text-align: center;">
	<h1>View Your Results</h1>
	<p style="margin: 2em 0;">Enter your result token to view your published results.</p>

	<div class="card">
		<form on:submit|preventDefault={viewResults}>
			<div class="form-group">
				<label for="token">Result Token:</label>
				<input
					type="text"
					id="token"
					bind:value={token}
					placeholder="Enter your token"
					required
					style="font-family: monospace; letter-spacing: 0.1em;"
				/>
			</div>
			<button type="submit" class="btn-primary">View Results</button>
		</form>
	</div>
</div>

