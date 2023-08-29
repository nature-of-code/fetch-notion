import test from 'tape';
import { transform } from './index.js';

test('Image', (t) => {
  t.deepEqual(
    transform([
      {
        type: 'image',
        image: {
          type: 'external',
          external: {
            url: 'https://example.com/a.jpg',
          },
          caption: [
            {
              type: 'text',
              text: {
                content: 'half-width-right',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: true,
                color: 'default',
              },
              plain_text: 'half-width-right',
              href: null,
            },
            {
              type: 'text',
              text: {
                content: 'Figure 1: hello ',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Figure 1: hello ',
              href: null,
            },
            {
              type: 'text',
              text: {
                content: 'world',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: true,
                color: 'default',
              },
              plain_text: 'world',
              href: null,
            },
          ],
        },
      },
    ]),
    '<figure class="half-width-right"><img src="https://example.com/a.jpg" alt="Figure 1: hello world"><figcaption>Figure 1: hello <code>world</code></figcaption></figure>',
    'should return a `.half-width-right` figure with image and caption.',
  );

  t.end();
});
