<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<nav class="nav">
	<a href="/teacher/results">Enter Results</a>
	<a href="/teacher/students">View Students</a>
	<span style="float: right;">
		{data.user.name} (Teacher) | 
		<form method="POST" action="/logout" use:enhance style="display: inline;">
			<button type="submit" style="background: none; border: none; color: white; text-decoration: underline; cursor: pointer; padding: 0; margin-left: 0.5em;">Logout</button>
		</form>
	</span>
</nav>

<slot />

