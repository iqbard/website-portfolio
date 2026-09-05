Netlify Identity + Git Gateway setup for Decap CMS

Summary
- This site uses Decap CMS (Netlify CMS) at /admin/ and stores content under src/content/*.
- The CMS is configured to use Git Gateway (Netlify Identity + Git Gateway) so editors can sign in and make commits without personal access tokens.

Steps to enable on Netlify (site must be connected to this Git repo):

1. Deploy the site to Netlify (link this repository in Netlify and ensure the site builds).
2. In the Netlify dashboard for the site, go to "Identity" and click "Enable Identity".
3. In Identity > Services, enable "Git Gateway". This will allow Decap CMS to use Netlify Identity for authentication and author commits via Git Gateway.
4. Optionally enable invitation-based signups or open signups depending on your team.
5. Add users/invite collaborators via Identity > Invite users. Invited users will receive an email to create an account.
6. In the CMS, editors should visit /admin/ on the deployed site and click "Login with Netlify"; after logging in they can edit collections.

Notes and troubleshooting
- Ensure Git Gateway has permissions to write to the default branch (main). If using a different branch, update public/admin/config.yml.
- If media uploads fail, verify that media_folder/public_folder in public/admin/config.yml points to a writable location in the published site (we use public/assets/uploads).
- For local development, Decap CMS's Git Gateway won't work unless you also run a local identity/gateway or test against the deployed Netlify site. For local testing, consider using the GitHub backend in config.yml or use the preview mode.

Files added/updated by the integration
- public/admin/index.html (Decap CMS admin UI with Netlify Identity widget)
- public/admin/config.yml (configured to use git-gateway backend)
- netlify.toml (redirects to serve /admin/* from admin/index.html)
- ADMIN_SETUP.md (this document)

If you'd like, the next steps are:
- Configure editorial workflow (publish_mode: editorial_workflow) so edits create pull requests instead of direct commits
- Add role-based access controls and custom commit messages
- Migrate existing content programmatically into collections if needed
