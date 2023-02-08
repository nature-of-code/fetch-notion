import { convert } from '../hast-from-notion.js';
import { toHtml } from 'hast-util-to-html';

export const transform = (n) => toHtml(convert(n));

import './heading.js';
import './paragraph.js';
import './list.js';
import './image.js';
import './quote.js';
import './code.js';
import './equation.js';
import './table.js';
import './column.js';
import './callout.js';
import './embed.js';

import './error.js';
