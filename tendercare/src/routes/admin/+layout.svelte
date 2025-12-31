<script lang="ts">
	import { invalidateSession } from '$lib/server/auth-helpers';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<nav class="nav">
	<a href="/admin/dashboard">Dashboard</a>
	<a href="/admin/students">Students</a>
	<a href="/admin/classes">Classes</a>
	<a href="/admin/subjects">Subjects</a>
	<a href="/admin/terms">Terms</a>
	<a href="/admin/enrollments">Enrollments</a>
	<a href="/admin/tokens">Tokens</a>
	<a href="/admin/promote">Promote</a>
	<span style="float: right;">
		{data.user.name} (Admin) | 
		<form method="POST" action="/logout" use:enhance style="display: inline;">
			<button type="submit" style="background: none; border: none; color: white; text-decoration: underline; cursor: pointer; padding: 0; margin-left: 0.5em;">Logout</button>
		</form>
	</span>
</nav>

<slot />

