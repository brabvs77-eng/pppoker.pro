#!/usr/bin/env node
import { write as writeGto } from './lib/post-translations/poker-gto.mjs';
import { write as writeMiniHighroller } from './lib/post-translations/pppoker-mini-highroller.mjs';
import { write as writeBombPot } from './lib/post-translations/pppoker-nuts-bomb-pot.mjs';
import { write as writeNlh } from './lib/post-translations/pravila-nlh.mjs';
import { write as writePlo } from './lib/post-translations/pravila-plo.mjs';
import { write as writeTexasHoldem } from './lib/post-translations/pravila-texas-holdem.mjs';

const writers = [
  writeGto,
  writeMiniHighroller,
  writeBombPot,
  writeNlh,
  writePlo,
  writeTexasHoldem,
];

for (const write of writers) {
  const outPath = write();
  console.log(outPath);
}
