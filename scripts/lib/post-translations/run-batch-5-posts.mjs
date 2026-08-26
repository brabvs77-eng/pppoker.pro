#!/usr/bin/env node
import './write-batch-5-posts.mjs';
import { write as writeNaChto } from './na-chto-potratit-vyigrysh-v-pokere-v2.mjs';
import { write as writeOfc } from './open-face-chinese-poker-ofc-v2.mjs';
import { write as writeTypes } from './osnovnye-tipy-igrokov-v-pokere-v2.mjs';
import { write as writeBetSizing } from './osnovy-pravilnogo-bet-sajzinga-v-pokere-v2.mjs';

writeNaChto();
console.log('wrote na-chto-potratit-vyigrysh-v-pokere');
writeOfc();
console.log('wrote open-face-chinese-poker-ofc');
writeTypes();
console.log('wrote osnovnye-tipy-igrokov-v-pokere');
writeBetSizing();
console.log('wrote osnovy-pravilnogo-bet-sajzinga-v-pokere');
console.log('All 5 post translation files written.');
