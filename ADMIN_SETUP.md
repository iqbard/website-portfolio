Vercel + GitHub OAuth setup for Decap CMS

Summary
- This site uses Decap CMS at /admin/ and stores content under src/content/*.
- The CMS is configured to use the GitHub backend for iqbard/website-portfolio.

Steps to deploy on Vercel and enable CMS authentication:

1. Import this repository into Vercel and use `npm run build` with `dist` as the output directory.
2. Create a GitHub OAuth application with callback URL `https://your-domain.com/api/callback`.
3. Add `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `OAUTH_STATE_SECRET` as Vercel environment variables.
4. Editors can then visit `/admin/` on the deployed site and sign in with GitHub.

Notes and troubleshooting
- Ensure the GitHub OAuth application can write to the default branch (`main`). If using a different branch, update `public/config.yml`.
- If media uploads fail, verify that media_folder/public_folder in public/config.yml points to a writable location in the published site (we use public/assets/uploads).
- For local development, run `npx decap-server` in a second terminal, then open `/admin/`. The local backend edits files in this repository without requiring GitHub OAuth.

Files added/updated by the integration
- public/admin-cms.html (Decap CMS admin UI)
- public/config.yml (configured to use the GitHub backend)
- vercel.json (Vercel build configuration)
- ADMIN_SETUP.md (this document)

If you'd like, the next steps are:
- Configure editorial workflow (publish_mode: editorial_workflow) so edits create pull requests instead of direct commits
- Add role-based access controls and custom commit messages
- Migrate existing content programmatically into collections if needed
