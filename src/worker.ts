interface Env {
  HITS: KVNamespace;
  ASSETS: Fetcher;
}

const SLUG_RE = /^[a-z0-9-]{1,64}$/;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/api/hit') {
      const tool = url.searchParams.get('tool') ?? '';

      if (!SLUG_RE.test(tool)) {
        return new Response(null, { status: 400 });
      }

      const current = parseInt((await env.HITS.get(tool)) ?? '0', 10);
      await env.HITS.put(tool, String(current + 1));

      return new Response(null, { status: 204 });
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
