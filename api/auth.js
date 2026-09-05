import crypto from 'node:crypto';

function getRedirectUri(request) {
  return process.env.GITHUB_REDIRECT_URI || `https://${request.headers.host}/api/callback`;
}

function signState(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', process.env.OAUTH_STATE_SECRET)
    .update(encoded)
    .digest('base64url');

  return `${encoded}.${signature}`;
}

export default function handler(request, response) {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.OAUTH_STATE_SECRET) {
    return response.status(500).json({ error: 'OAuth environment variables are not configured.' });
  }

  const redirectUri = getRedirectUri(request);
  const state = signState({ redirectUri, createdAt: Date.now() });
  const githubUrl = new URL('https://github.com/login/oauth/authorize');
  githubUrl.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID);
  githubUrl.searchParams.set('redirect_uri', redirectUri);
  githubUrl.searchParams.set('scope', request.query.scope || 'repo');
  githubUrl.searchParams.set('state', state);

  return response.redirect(302, githubUrl.toString());
}