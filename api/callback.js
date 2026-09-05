import crypto from 'node:crypto';

function readState(value) {
  const [encoded, signature] = value.split('.');
  const expected = crypto
    .createHmac('sha256', process.env.OAUTH_STATE_SECRET)
    .update(encoded)
    .digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error('Invalid OAuth state.');
  }

  const state = JSON.parse(Buffer.from(encoded, 'base64url').toString());
  if (Date.now() - state.createdAt > 10 * 60 * 1000) {
    throw new Error('Expired OAuth state.');
  }

  return state;
}

export default async function handler(request, response) {
  try {
    const state = readState(request.query.state || '');
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: request.query.code || '',
        redirect_uri: state.redirectUri,
      }),
    });
    const token = await tokenResponse.json();

    if (!token.access_token) {
      throw new Error(token.error_description || 'GitHub OAuth token exchange failed.');
    }

    const message = `authorization:github:success:${JSON.stringify({
      token: token.access_token,
      provider: 'github',
    })}`;

    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    return response.end(`<!doctype html><html><body><script>
      window.opener.postMessage(${JSON.stringify(message)}, '*');
      window.close();
    </script></body></html>`);
  } catch (error) {
    return response.status(400).send(error.message);
  }
}