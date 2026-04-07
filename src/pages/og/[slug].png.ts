import type { APIRoute, GetStaticPaths } from 'astro';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { tools } from '../../data/tools';

const __dirname = dirname(fileURLToPath(import.meta.url));

const interRegular = readFileSync(
  resolve(__dirname, '../../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff'),
);
const interBold = readFileSync(
  resolve(__dirname, '../../../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff'),
);

export const getStaticPaths: GetStaticPaths = () => {
  return tools.filter((t) => t.implemented).map((t) => ({ params: { slug: t.slug } }));
};

export const GET: APIRoute = async ({ params }) => {
  const tool = tools.find((t) => t.slug === params.slug);
  if (!tool) return new Response('Not found', { status: 404 });

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '60px',
          background: '#0a0a0a',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                fontSize: '22px',
                fontWeight: '700',
                color: '#e5e5e5',
                letterSpacing: '0.04em',
                marginBottom: '16px',
              },
              children: 'tt_',
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: '52px',
                fontWeight: '700',
                color: '#f5f5f5',
                lineHeight: '1.15',
                marginBottom: '20px',
                letterSpacing: '-0.02em',
              },
              children: tool.name,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: '22px',
                color: '#888888',
                lineHeight: '1.5',
                maxWidth: '900px',
              },
              children: tool.description,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '60px',
                right: '60px',
                fontSize: '18px',
                color: '#444444',
                letterSpacing: '0.06em',
              },
              children: 'tinytask.tools',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
        { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
      ],
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });
  const png = resvg.render().asPng();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
