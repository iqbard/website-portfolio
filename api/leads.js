const allowedOrigin = 'https://liburandirumah.vercel.app';

function responseHeaders(request) {
  const origin = request.headers.origin;
  return {
    'Access-Control-Allow-Origin': origin === allowedOrigin ? origin : allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function clean(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function yamlString(value) {
  return JSON.stringify(value);
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'lead';
}

export default async function handler(request, response) {
  Object.entries(responseHeaders(request)).forEach(([key, value]) => response.setHeader(key, value));

  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });

  const token = process.env.LEADS_GITHUB_TOKEN;
  const repository = process.env.LEADS_GITHUB_REPO || 'iqbard/website-portfolio';
  const branch = process.env.LEADS_GITHUB_BRANCH || 'main';

  if (!token) return response.status(500).json({ error: 'Lead storage is not configured.' });

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body || {};
    if (clean(body.website, 100)) return response.status(200).json({ ok: true });

    const name = clean(body.name, 120);
    const email = clean(body.email, 160).toLowerCase();
    const message = clean(body.message, 5000);

    if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return response.status(400).json({ error: 'Please provide a valid name, email, and message.' });
    }

    const createdAt = new Date().toISOString();
    const filename = `${createdAt.slice(0, 10)}-${slugify(name)}-${Date.now()}.md`;
    const content = `---\ntitle: ${yamlString(`${name} - ${email}`)}\nname: ${yamlString(name)}\nemail: ${yamlString(email)}\nmessage: ${yamlString(message)}\ncreatedAt: ${yamlString(createdAt)}\nstatus: "New"\n---\n`;
    const githubResponse = await fetch(`https://api.github.com/repos/${repository}/contents/src/content/leads/${filename}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'liburan-di-rumah-lead-form',
      },
      body: JSON.stringify({
        message: `Add lead: ${name}`,
        content: Buffer.from(content).toString('base64'),
        branch,
      }),
    });

    if (!githubResponse.ok) {
      const details = await githubResponse.text();
      console.error('GitHub lead write failed:', githubResponse.status, details);
      return response.status(502).json({ error: 'The inquiry could not be saved. Please try again.' });
    }

    return response.status(201).json({ ok: true });
  } catch (error) {
    console.error('Lead submission failed:', error);
    return response.status(400).json({ error: 'The inquiry could not be submitted.' });
  }
}
