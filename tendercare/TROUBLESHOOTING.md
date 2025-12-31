# Troubleshooting TypeScript Errors

## Common Errors

### "Cannot find module" or "Cannot find name 'process'"

These errors occur when:
1. Dependencies aren't installed
2. SvelteKit config hasn't been generated
3. TypeScript can't resolve types

## Quick Fix

Run these commands in order:

```bash
# 1. Install all dependencies (including @types/node)
npm install

# 2. Generate SvelteKit TypeScript configuration
npx svelte-kit sync
# OR just start dev server (it will sync automatically)
npm run dev

# 3. Restart your TypeScript server in VS Code
# Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)
# Type: "TypeScript: Restart TS Server"
```

## For Scripts Folder

The `scripts/` folder has its own `tsconfig.json`. If you see errors in `scripts/create-admin.ts`:

1. Make sure `@types/node` is installed: `npm install --save-dev @types/node`
2. The script uses Node.js types, so it should work after npm install
3. To run the script: `npx tsx scripts/create-admin.ts`

## VS Code Settings

If errors persist in VS Code:

1. Check `.vscode/settings.json` exists (we created it)
2. Make sure VS Code is using the workspace TypeScript version
3. Restart VS Code

## Module Resolution

- **Main app** (`src/`): Uses SvelteKit's module resolution (bundler)
- **Scripts** (`scripts/`): Uses Node.js module resolution
- Both need `@types/node` installed

## Still Having Issues?

1. Delete `node_modules` and `.svelte-kit` folders
2. Run `npm install` again
3. Run `npx svelte-kit sync`
4. Restart your editor

