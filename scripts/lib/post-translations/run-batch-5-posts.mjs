#!/usr/bin/env node
import { write as writeMtt } from './mnogostolovye-turniry-mtt.mjs';
import { write as writeNaChto } from './na-chto-potratit-vyigrysh-v-pokere.mjs';
import { write as writeOfc } from './open-face-chinese-poker-ofc.mjs';
import { write as writeTypes } from './osnovnye-tipy-igrokov-v-pokere.mjs';
import { write as writeBetSizing } from './osnovy-pravilnogo-bet-sajzinga-v-pokere.mjs';

writeMtt();
writeNaChto();
writeOfc();
writeTypes();
writeBetSizing();
console.log('All 5 post translation files written.');
