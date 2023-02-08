import { heading } from './heading.js';
import { paragraph } from './paragraph.js';
import { quote } from './quote.js';
import { list } from './list.js';
import { image } from './image.js';
import { callout } from './callout.js';
import { table } from './table.js';
import { code } from './code.js';
import { equation } from './equation.js';
import { column, column_list } from './column.js';
import { bookmark } from './bookmark.js';

function skip() {
  return null;
}

export const handlers = {
  heading_1: heading('h1'),
  heading_2: heading('h2'),
  heading_3: heading('h3'),
  paragraph,
  quote,
  numbered_list_item: list('ol'),
  bulleted_list_item: list('ul'),
  image,
  table,
  callout,
  code,
  equation,
  bookmark,
  column,
  column_list,
};
