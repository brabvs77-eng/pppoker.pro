import { h2, h3, p, writePostTranslation } from '../post-translation-writer.mjs';

const author = {
  en: p('Author:&nbsp;<a href="/author-roman-shaposhnikov/"><em>Roman Shaposhnikov</em></a>'),
  uz: p('Muallif:&nbsp;<a href="/author-roman-shaposhnikov/"><em>Roman Shaposhnikov</em></a>'),
  kz: p('Автор:&nbsp;<a href="/author-roman-shaposhnikov/"><em>Роман Шапошников</em></a>'),
  hy: p('Հեղինակ:&nbsp;<a href="/author-roman-shaposhnikov/"><em>Ռոման Շապոշնիկով</em></a>'),
  tj: p('Муаллиф:&nbsp;<a href="/author-roman-shaposhnikov/"><em>Роман Шапошников</em></a>'),
};

function table(rows) {
  return `<table>\n<tbody>\n${rows.map((r) => `<tr>${r.map((c) => `<td class="has-white-color has-text-color">${c}</td>`).join('')}</tr>`).join('\n')}\n</tbody>\n</table>`;
}

const body = {
  en: [
    p('<strong>Open Face Chinese Poker (OFC): Rules, Structure, and Scoring</strong>'),
    author.en,
    p('Date: 12.01.2026'),
    p('<strong>Open Face Chinese Poker (OFC)</strong> is a dynamic strategic poker variant where players do not bet but compete to build three strongest poker combinations from 13 cards across three rows. The game blends math, intuition, and excitement — especially in <strong>Fantasy</strong> mode.'),
    h2('<strong>Goal: Build Three Strong Rows</strong>'),
    p('Each player arranges 13 cards into three independent hands, obeying the rule that strength must go <strong>from strongest to weakest</strong>.'),
    table([
      ['<strong>Row</strong>', '<strong>Cards</strong>', '<strong>Strength</strong>'],
      ['<strong>Bottom</strong>', '5 cards', '<strong>Strongest</strong>'],
      ['<strong>Middle</strong>', '5 cards', 'Weaker than bottom'],
      ['<strong>Top</strong>', '3 cards', 'Weaker than middle'],
    ]),
    p('<strong>⚠️ Foul:</strong> If order is broken (middle stronger than bottom), the player <strong>fouls</strong> and opponents take all points for the hand.'),
    h2('<strong>How a Hand Plays Out</strong>'),
    p('1. <strong>Start:</strong> 5 cards dealt; place them across rows<br>2. <strong>Next rounds:</strong> 3 cards dealt; place 2 face up, <strong>discard 1</strong><br>3. Repeat until all 13 cards are placed<br>4. Compare bottom vs bottom, middle vs middle, top vs top'),
    h2('<strong>Scoring</strong>'),
    p('+1 for winning a row, -1 for losing; <strong>Scoop</strong> (win all three) = +3 bonus. <strong>Royalties</strong> for premium hands (quads, straight flush).'),
    h2('<strong>Fantasy Round</strong>'),
    p('Qualify with <strong>QQ+ on top</strong> without fouling. In Fantasy you receive <strong>14–17 cards</strong> and set all 13 before others. Re-enter with <strong>trips on top</strong> in Fantasy.'),
    h2('<strong>Hand Rankings</strong>'),
    p('Bottom and middle use standard rankings. Top (3 cards): pair, trips, or high card only — no straights or flushes from three cards.'),
    h2('<strong>Why OFC Is Popular</strong>'),
    p('Pure strategy without street betting; Fantasy adrenaline; decisions until the 13th card; you choose which cards to keep or discard.'),
    p('<strong>Try OFC in the NUTS club on PPPoker!</strong>'),
  ].join('\n'),
  uz: [
    p('<strong>Open Face Chinese Poker (OFC): Qoidalar, tuzilma va hisob</strong>'),
    author.uz,
    p('Sana: 12.01.2026'),
    p('<strong>OFC</strong> — stavkasiz strategik poker: 13 kartadan uch qator kombinatsiya. <strong>Fantasy</strong> rejimi ayniqsa qiziqarli.'),
    h2('<strong>Maqsad: uch kuchli qator</strong>'),
    table([
      ['<strong>Qator</strong>', '<strong>Kartalar</strong>', '<strong>Kuch</strong>'],
      ['<strong>Pastki</strong>', '5', '<strong>Eng kuchli</strong>'],
      ['<strong>O\'rta</strong>', '5', 'Pastkidan past'],
      ['<strong>Yuqori</strong>', '3', 'O\'rtadan past'],
    ]),
    p('<strong>⚠️ Foul:</strong> tartib buzilsa — raqiblar barcha ochkolarni oladi.'),
    h2('<strong>Hand jarayoni</strong>'),
    p('5 karta boshlanish; keyin 3 karta — 2 joylashtirish, 1 discard. Scoop = +3 bonus.'),
    h2('<strong>Fantasy</strong>'),
    p('Yuqorida <strong>QQ+</strong> — keyingi handda 14–17 karta.'),
    p('<strong>OFC-ni PPPoker NUTS klubida sinab ko\'ring!</strong>'),
  ].join('\n'),
  kz: [
    p('<strong>Open Face Chinese Poker (OFC): Erejeлер, qurılım</strong>'),
    author.kz,
    p('Күні: 12.01.2026'),
    p('<strong>OFC</strong> — stavkasız стратегиялық poker: 13 kartadan 3 qatar. <strong>Fantasy</strong> режimi.'),
    h2('<strong>Мақсат</strong>'),
    table([
      ['<strong>Qatar</strong>', '<strong>Karta</strong>', '<strong>Kush</strong>'],
      ['<strong>Төменgi</strong>', '5', '<strong>Ең kuchli</strong>'],
      ['<strong>Orta</strong>', '5', 'Tomennen past'],
      ['<strong>Joğarı</strong>', '3', 'Ortadan past'],
    ]),
    p('<strong>⚠️ Foul</strong> — tartib buzylsa.'),
    h2('<strong>Fantasy</strong>'),
    p('Joğarıda <strong>QQ+</strong>. PPPoker NUTS klubında OFC oynap körin!'),
  ].join('\n'),
  hy: [
    p('<strong>Open Face Chinese Poker (OFC)</strong>'),
    author.hy,
    p('Ամսաթիվ: 12.01.2026'),
    p('<strong>OFC</strong> — 13 kart, 3 qator, stavka chka. <strong>Fantasy</strong>.'),
    h2('<strong>Nayev, Middle, Top</strong>'),
    p('Bottom &gt; Middle &gt; Top. Foul — tartib chka.'),
    h2('<strong>Fantasy</strong>'),
    p('QQ+ top — 14–17 kart. PPPoker NUTS OFC.'),
  ].join('\n'),
  tj: [
    p('<strong>Open Face Chinese Poker (OFC)</strong>'),
    author.tj,
    p('Сана: 12.01.2026'),
    p('<strong>OFC</strong> — 13 karta, 3 satr, бе stavka. <strong>Fantasy</strong>.'),
    h2('<strong>Hadaf</strong>'),
    p('Bottom &gt; Middle &gt; Top. Foul — tartib shikast.'),
    h2('<strong>Fantasy</strong>'),
    p('QQ+ dar top. Klubi NUTS PPPoker.'),
  ].join('\n'),
};

export function write() {
  return writePostTranslation('open-face-chinese-poker-ofc', {
    en: {
      title: 'Open Face Chinese Poker (OFC) — Nuts PPPoker',
      description:
        'Open Face Chinese Poker (OFC): rules, three-row structure, scoring, fouls, and Fantasy mode. Try OFC tables in the NUTS club on PPPoker.',
      bodyHtml: body.en,
    },
    uz: {
      title: 'Open Face Chinese Poker (OFC) — Nuts PPPoker',
      description:
        'Open Face Chinese Poker (OFC): qoidalar, uch qator, ochko, foul va Fantasy rejimi. PPPoker NUTS klubida OFC stollarini sinab ko\'ring.',
      bodyHtml: body.uz,
    },
    kz: {
      title: 'Open Face Chinese Poker (OFC) — Nuts PPPoker',
      description:
        'Open Face Chinese Poker (OFC): erejeler, u qatar, ochko, foul және Fantasy. PPPoker NUTS klubında OFC.',
      bodyHtml: body.kz,
    },
    hy: {
      title: 'Open Face Chinese Poker (OFC) — Nuts PPPoker',
      description:
        'Open Face Chinese Poker (OFC): kanoner, 3 qator, Fantasy. PPPoker NUTS akumbum.',
      bodyHtml: body.hy,
    },
    tj: {
      title: 'Open Face Chinese Poker (OFC) — Nuts PPPoker',
      description:
        'Open Face Chinese Poker (OFC): qoidaho, 3 satr, Fantasy. Dar klubi NUTS PPPoker.',
      bodyHtml: body.tj,
    },
  });
}
