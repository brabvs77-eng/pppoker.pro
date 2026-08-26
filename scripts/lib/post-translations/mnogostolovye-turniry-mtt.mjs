import { h2, h3, p, writePostTranslation } from '../post-translation-writer.mjs';

const author = {
  en: p('Author:&nbsp;<a href="/author-roman-shaposhnikov/"><em>Roman Shaposhnikov</em></a>'),
  uz: p('Muallif:&nbsp;<a href="/author-roman-shaposhnikov/"><em>Roman Shaposhnikov</em></a>'),
  kz: p('Автор:&nbsp;<a href="/author-roman-shaposhnikov/"><em>Роман Шапошников</em></a>'),
  hy: p('Հեղինակ:&nbsp;<a href="/author-roman-shaposhnikov/"><em>Ռոման Շապոշնիկով</em></a>'),
  tj: p('Муаллиф:&nbsp;<a href="/author-roman-shaposhnikov/"><em>Роман Шапошников</em></a>'),
};

function table(rows) {
  return `<table>\n<thead>\n<tr>${rows[0].map((c) => `<th class="has-white-color has-text-color">${c}</th>`).join('')}</tr>\n</thead>\n<tbody>\n${rows.slice(1).map((r) => `<tr>${r.map((c) => `<td class="has-white-color has-text-color">${c}</td>`).join('')}</tr>`).join('\n')}\n</tbody>\n</table>`;
}

const body = {
  en: [
    p('<strong>Multi-Table Tournaments (MTT): Basics, Structure, and Key Formats</strong>'),
    author.en,
    p('Date: 12.01.2026'),
    p('A <strong>Multi-Table Tournament (MTT)</strong> is one of the most popular and complex forms of poker. Unlike cash games, an MTT has a clear start and finish: all players begin with the same stack, and the goal is to eliminate every opponent to win the prize pool, most of which is concentrated at the <strong>Final Table</strong>.'),
    h2('<strong>Dynamics, Structure, and Blind Levels</strong>'),
    p('MTT structure differs from cash games because forced bets change dynamically.'),
    h3('<strong>1. Forced Bets (Blinds and Antes)</strong>'),
    p('• <strong>Blinds (SB/BB):</strong> mandatory bets moving clockwise each hand<br>• <strong>Antes:</strong> extra forced bets before the deal; modern events often use <strong>Big Blind Ante (BBA)</strong> — BB posts ante for the whole table'),
    h3('<strong>2. Level System</strong>'),
    p('• <strong>Turbo / Hyper-Turbo:</strong> short levels (15–20 min) → fast chip loss vs BB → <strong>Push/Fold</strong> decisions; high variance<br>• <strong>Deep Stack:</strong> long levels (30–60 min) → rewards <strong>postflop strategy</strong>'),
    h3('<strong>3. Critical Metric: Stack Depth in BB</strong>'),
    p('Absolute chip count does not matter — <strong>stack depth in big blinds</strong> does. Stacks of <strong>10–15 BBs</strong> are <strong>dangerously short</strong> → switch to push/fold.'),
    h2('<strong>MTT Formats by Entry and Payouts</strong>'),
    h3('<strong>1. Entry Modes</strong>'),
    table([
      ['Mode', 'Description', 'Strategy impact'],
      ['<strong>Freezeout</strong>', 'Losing all chips = <strong>elimination</strong>', 'Careful, low-variance play'],
      ['<strong>Rebuy+Ante</strong>', 'Rebuy period allowed', 'Early aggression from rebuy-ready players'],
      ['<strong>Re-entry</strong>', 'Re-enter after bust for new buy-in', 'Early aggression — mistakes can be fixed'],
    ]),
    h3('<strong>2. Payout Structures</strong>'),
    table([
      ['Format', 'Mechanism', 'Strategic focus'],
      ['<strong>Standard Payout</strong>', '~15–20% paid; top 3 get 30–40%', 'Chip accumulation; bubble survival (ITM)'],
      ['<strong>Satellite</strong>', 'Prize = <strong>ticket</strong> to bigger event', '<strong>Survival</strong> — stop aggression once ticket secured'],
      ['<strong>Progressive Knockout (PKO)</strong>', 'Bounty pool; <strong>50% bounty instantly</strong>, 50% added to your bounty', '<strong>Bounty hunting</strong> — wider call ranges vs shoves'],
    ]),
    h2('<strong>Stage Strategy: ICM and the Bubble</strong>'),
    h3('<strong>1. Early Stage (Deep Stack, 100+ BBs)</strong>'),
    p('<strong>Goal:</strong> chip accumulation and <strong>Implied Odds</strong>. Play speculative hands (small pairs, suited connectors) and monsters (top pairs, AKo, AQo).'),
    h3('<strong>2. Bubble Phase (before ITM)</strong>'),
    p('Chip value becomes <strong>non-linear</strong> due to <strong>ICM</strong>. Big stacks pressure medium/short stacks; short stacks (~<strong>4–12 BBs</strong>) switch to <strong>GTO Push/Fold</strong>.'),
    h2('<strong>♠️ Play MTT in the NUTS Club on PPPoker!</strong>'),
    p('MTT success requires adapting to structure and stack depth. Join <strong>NUTS on PPPoker</strong> — <strong>Freezeout</strong>, <strong>Re-entry</strong>, <strong>Progressive Knockout</strong>, and more to sharpen strategy at every stage!'),
  ].join('\n'),
  uz: [
    p('<strong>Ko\'p stolli turnirlar (MTT): Asoslar, tuzilma va formatlar</strong>'),
    author.uz,
    p('Sana: 12.01.2026'),
    p('<strong>MTT</strong> — pokerning eng mashhur va murakkab shakllaridan biri. Barcha o\'yinchilar bir xil stackdan boshlanadi; maqsad — barcha raqiblarni yo\'q qilib, <strong>Final Table</strong> atrofida to\'plangan sovrin jamg\'armasini olish.'),
    h2('<strong>Blind darajalari va dinamika</strong>'),
    h3('<strong>Majburiy stavkalar</strong>'),
    p('Blinds (SB/BB), Antes, <strong>Big Blind Ante (BBA)</strong>. Turbo/Hyper — <strong>Push/Fold</strong>; Deep Stack — postflop strategiya.'),
    h3('<strong>Stack chuqurligi (BB)</strong>'),
    p('<strong>10–15 BB</strong> — xavfli qisqa stack.'),
    h2('<strong>Formatlar</strong>'),
    table([
      ['Rejim', 'Tavsif', 'Strategiya'],
      ['<strong>Freezeout</strong>', 'Chip tugasa — chiqish', 'Ehtiyotkor o\'yin'],
      ['<strong>Rebuy+Ante</strong>', 'Qayta sotib olish', 'Erta agressiya'],
      ['<strong>Re-entry</strong>', 'Qayta kirish', 'Erta agressiya'],
    ]),
    table([
      ['Format', 'Mexanizm', 'Fokus'],
      ['<strong>Standard Payout</strong>', '15–20% ITM', 'Bubble (ITM)'],
      ['<strong>Satellite</strong>', 'Chipta sovrin', 'Omon qolish'],
      ['<strong>PKO</strong>', 'Bounty 50/50', 'Bounty ov'],
    ]),
    h2('<strong>ICM va Bubble</strong>'),
    p('Erta: chip yig\'ish, Implied Odds. Bubble: <strong>ICM</strong>, 4–12 BB → Push/Fold.'),
    h2('<strong>♠️ PPPoker NUTS klubida MTT!</strong>'),
    p('Freezeout, Re-entry, PKO va boshqalar.'),
  ].join('\n'),
  kz: [
    p('<strong>Көp үstelдik турнирлер (MTT)</strong>'),
    author.kz,
    p('Күні: 12.01.2026'),
    p('<strong>MTT</strong> — pokerдің танымал форматы. Барлығы бір stackten; мақсат — <strong>Final Table</strong> жүлde qoryn alu.'),
    h2('<strong>Blind деңгейлері</strong>'),
    p('SB/BB, Ante, <strong>BBA</strong>. Turbo — Push/Fold; Deep Stack — postflop.'),
    p('<strong>10–15 BB</strong> — qisqa stack.'),
    h2('<strong>Форматтар</strong>'),
    table([
      ['Режим', 'Сипаттама', 'Стратегия'],
      ['<strong>Freezeout</strong>', 'Шығу', 'Abai bolu'],
      ['<strong>Rebuy</strong>', 'Qayta sotip alu', 'Erte agressiya'],
      ['<strong>Re-entry</strong>', 'Qayta kiru', 'Erte agressiya'],
    ]),
    h2('<strong>ICM және Bubble</strong>'),
    p('ICM, Push/Fold 4–12 BB.'),
    h2('<strong>♠️ PPPoker NUTS MTT!</strong>'),
    p('Freezeout, Re-entry, PKO.'),
  ].join('\n'),
  hy: [
    p('<strong>Multi-Table Tournaments (MTT)</strong>'),
    author.hy,
    p('Ամսաթիվ: 12.01.2026'),
    p('<strong>MTT</strong> — populyar poker format. Miayn stack, Final Table prize pool.'),
    h2('<strong>Blinds ev levels</strong>'),
    p('SB/BB, Ante, BBA. Turbo — Push/Fold; Deep — postflop.'),
    h2('<strong>Formats</strong>'),
    p('Freezeout, Rebuy, Re-entry, Standard Payout, Satellite, PKO.'),
    h2('<strong>ICM ev Bubble</strong>'),
    p('4–12 BB — GTO Push/Fold.'),
    h2('<strong>♠️ MTT PPPoker NUTS!</strong>'),
  ].join('\n'),
  tj: [
    p('<strong>Turnirhoi ko-stol (MTT)</strong>'),
    author.tj,
    p('Сана: 12.01.2026'),
    p('<strong>MTT</strong> — формати маъмули poker. Stack яксон, мақсад — Final Table.'),
    h2('<strong>Blind va satҳaҳо</strong>'),
    p('SB/BB, Ante, BBA. Turbo — Push/Fold.'),
    h2('<strong>Formatҳо</strong>'),
    p('Freezeout, Rebuy, Re-entry, PKO, Satellite.'),
    h2('<strong>ICM va Bubble</strong>'),
    p('4–12 BB — Push/Fold.'),
    h2('<strong>♠️ MTT дар NUTS PPPoker!</strong>'),
  ].join('\n'),
};

export function write() {
  return writePostTranslation('mnogostolovye-turniry-mtt', {
    en: {
      title: 'Multi-Table Tournaments (MTT) — Nuts PPPoker',
      description:
        'Multi-Table Tournament (MTT) basics: blind levels, stack depth in BB, Freezeout, Re-entry, PKO, ICM, and bubble strategy. Play MTT in the NUTS club on PPPoker.',
      bodyHtml: body.en,
    },
    uz: {
      title: 'Ko\'p stolli turnirlar (MTT) — Nuts PPPoker',
      description:
        'Ko\'p stolli turnirlar (MTT): blind darajalari, stack chuqurligi, Freezeout, Re-entry, PKO, ICM va bubble strategiyasi. PPPoker NUTS klubida MTT o\'ynang.',
      bodyHtml: body.uz,
    },
    kz: {
      title: 'Көp үstelдik турнирлер (MTT) — Nuts PPPoker',
      description:
        'Көp үstelдik турнирлер (MTT): blind деңгейлері, stack тереңдігі, Freezeout, Re-entry, PKO, ICM. PPPoker NUTS klubında MTT.',
      bodyHtml: body.kz,
    },
    hy: {
      title: 'Batsatoxanner (MTT) — Nuts PPPoker',
      description:
        'Batsatoxanner (MTT): blinds, stack depth, Freezeout, PKO, ICM, bubble. PPPoker NUTS akumbum.',
      bodyHtml: body.hy,
    },
    tj: {
      title: 'Turnirhoi ko-stol (MTT) — Nuts PPPoker',
      description:
        'Turnirhoi ko-stol (MTT): blind, stack, Freezeout, PKO, ICM. Dar klubi NUTS PPPoker.',
      bodyHtml: body.tj,
    },
  });
}
