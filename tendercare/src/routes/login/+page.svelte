<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div class="container">
	<div class="card" style="max-width: 400px; margin: 4em auto;">
		<h1>Login</h1>
		
		{#if form?.error}
			<div class="alert alert-error">{form.error}</div>
		{/if}

		<form method="POST" use:enhance>
			<div class="form-group">
				<label for="userType">Login as:</label>
				<select id="userType" name="userType" required>
					<option value="admin">Admin</option>
					<option value="teacher">Teacher</option>
				</select>
			</div>

			<div class="form-group">
				<label for="email">Email:</label>
				<input type="email" id="email" name="email" required />
			</div>

			<div class="form-group">
				<label for="password">Password:</label>
				<input type="password" id="password" name="password" required />
			</div>

			<button type="submit" class="btn-primary">Login</button>
		</form>
	</div>
</div>

