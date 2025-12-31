<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="container">
	<h1>Admin Dashboard</h1>
	
	<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1em; margin-top: 2em;">
		<div class="card">
			<h2>Quick Actions</h2>
			<ul style="list-style: none; padding: 0;">
				<li style="margin-bottom: 0.5em;"><a href="/admin/students">Manage Students</a></li>
				<li style="margin-bottom: 0.5em;"><a href="/admin/terms">Create New Term</a></li>
				<li style="margin-bottom: 0.5em;"><a href="/admin/tokens">Generate Tokens</a></li>
				<li style="margin-bottom: 0.5em;"><a href="/admin/promote">Start New Academic Year</a></li>
			</ul>
		</div>

		<div class="card">
			<h2>System Status</h2>
			<p>Welcome, {data.user.name}!</p>
			<p>You are logged in as an administrator.</p>
		</div>
	</div>
</div>

