#!/usr/bin/env node
import { write as writeNaChto } from './lib/post-translations/na-chto-potratit-vyigrysh-v-pokere.mjs';
import { write as writeBetSizing } from './lib/post-translations/osnovy-pravilnogo-bet-sajzinga-v-pokere.mjs';
import { write as writePlayerTypes } from './lib/post-translations/osnovnye-tipy-igrokov-v-pokere.mjs';
import { write as writeOfc } from './lib/post-translations/open-face-chinese-poker-ofc.mjs';
import { write as writeMtt } from './lib/post-translations/mnogostolovye-turniry-mtt.mjs';

const writers = [writeNaChto, writeBetSizing, writePlayerTypes, writeOfc, writeMtt];
for (const fn of writers) {
  const out = fn();
  console.log(`Wrote ${out}`);
}
