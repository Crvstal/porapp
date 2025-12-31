import { Argon2id } from 'oslo/password';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
	console.error('DATABASE_URL environment variable is not set');
	process.exit(1);
}

const client = postgres(process.env.DATABASE_URL);

function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = Math.random() * 16 | 0;
		const v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

async function createAdmin() {
	const email = process.argv[2] || 'admin@school.com';
	const password = process.argv[3] || 'admin123';
	const name = process.argv[4] || 'System Administrator';

	console.log(`Creating admin user: ${email}`);

	const hasher = new Argon2id();
	const passwordHash = await hasher.hash(password);

	const id = generateUUID();

	await client`
		INSERT INTO admins (id, email, password_hash, name)
		VALUES (${id}, ${email}, ${passwordHash}, ${name})
		ON CONFLICT (email) DO UPDATE
		SET password_hash = ${passwordHash}, name = ${name}
	`;

	console.log('Admin user created successfully!');
	console.log(`Email: ${email}`);
	console.log(`Password: ${password}`);
	console.log('\n⚠️  Please change the password after first login!');

	await client.end();
}

createAdmin().catch(console.error);

