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
    h2('<strong>Bet Sizing Basics in Poker</strong>'),
    author.en,
    p('Date: 12.01.2026'),
    p('<strong>Bet sizing</strong> is one of the most critical elements of poker. The size of your bet determines whether you can win the maximum when ahead and lose the minimum when behind. Let us look at how to choose the right bet size and avoid typical beginner mistakes.'),
    h2('<strong>What Is Bet Sizing?</strong>'),
    p('Bet sizing is the size of your bet depending on the situation. It defines the <strong>pot odds</strong> you give your opponent and how profitable it is for them to continue.'),
    p('You win money over the long run from every mistake your opponent makes. A well-chosen bet size <strong>increases your profit.</strong>'),
    h2('<strong>💪 Why Bet Bigger?</strong>'),
    p('In most situations aggressive sizing is the optimal choice:'),
    p('• You do not give opponents good odds to <strong>call with draws</strong><br>• You get more <strong>value</strong> when worse hands call<br>• A bet below half the pot almost always means <strong>missed value and weak protection</strong>'),
    p('If you regularly make small bets, you effectively let opponents see the next card cheaply. Larger bets <strong>protect your hand</strong> and punish mistakes.'),
    h2('<strong>When Are Small Bets Appropriate?</strong>'),
    p('Small bets (for example 1/3 or 1/4 pot) can be justified in specific spots:'),
    p('• <strong>Against nits:</strong> when you are sure they fold to a large bet but call a small one for <strong>thin value</strong><br>• <strong>On dry boards:</strong> when the texture minimizes obvious draw hands'),
    p('These spots require accurate reads. Without precise information, it is always better to bet <strong>more rather than less</strong>.'),
    h2('<strong>Preflop Bet Sizing</strong>'),
    p('Basic rule for an opening raise (<strong>Open Raise</strong>): 👉 <strong>Raise = 3 BB + 1 BB for each limper already in the pot.</strong>'),
    p('For example, with two limpers your raise should be <strong>5 BB</strong>. This protects you from multi-way pots and makes opponents pay more to see the flop.'),
    table([
      ['Limpers', 'Raise size (BB)', 'Example NL10'],
      ['0', '3 BB', '$0.30'],
      ['1', '4 BB', '$0.40'],
      ['2', '5 BB', '$0.50'],
      ['3', '6 BB', '$0.60'],
      ['4', '7 BB', '$0.70'],
      ['5', '8 BB', '$0.80'],
    ]),
    h2('<strong>Summary</strong>'),
    p('To play profitably, follow three simple rules:'),
    p('1. Postflop, bet bigger — usually around <strong>¾ pot</strong><br>2. Preflop, raise <strong>3–4 BB + 1 BB</strong> per limper<br>3. <strong>Do not give opponents cheap cards</strong> — always aim to maximize value and protect your hand'),
    p('Small sizes lead to missed profit. Smart sizing leads to control and long-term success.'),
    p('<strong>♠️ Test proper bet sizing in practice!</strong> Register in Club NUTS on PPPoker, play online, study bet mechanics, and refine your strategy in real hands.'),
  ].join('\n'),
  uz: [
    h2('<strong>Pokerda bet sizing asoslari</strong>'),
    author.uz,
    p('Sana: 12.01.2026'),
    p('<strong>Bet sizing</strong> pokerning eng muhim elementlaridan biridir. Stavka hajmi oldinda bo\'lganda maksimum yutish va orqada bo\'lganda minimum yo\'qotish imkonini belgilaydi.'),
    h2('<strong>Bet sizing nima?</strong>'),
    p('Bet sizing — vaziyatga qarab stavka hajmi. U raqibga qanday <strong>pot odds</strong> berishingizni va unga davom etish qanchalik foydali ekanini belgilaydi.'),
    p('Raqibning har bir xatosidan uzoq muddatda pul yutasiz. To\'g\'ri hajm <strong>foydingizni oshiradi.</strong>'),
    h2('<strong>💪 Nega kattaroq stavka qilish kerak?</strong>'),
    p('Ko\'p hollarda agressiv sizing optimal:'),
    p('• Raqibga <strong>dro bilan call</strong> uchun yaxshi odds bermaysiz<br>• Yomon qo\'llar call qilganda ko\'proq <strong>value</strong> olasiz<br>• Bankning yarmidan kichik stavka deyarli har doim <strong>o\'tkazib yuborilgan value va zaif himoya</strong>'),
    h2('<strong>Qachon kichik stavkalar mos?</strong>'),
    p('• <strong>Nitlarga qarshi:</strong> katta stavkada fold, kichikda call — <strong>thin value</strong><br>• <strong>Quruq boardlarda:</strong> aniq dro kam'),
    h2('<strong>Preflop bet sizing</strong>'),
    p('<strong>Open Raise</strong> qoidasi: 👉 <strong>Reyз = 3 BB + har bir limper uchun 1 BB.</strong>'),
    table([
      ['Limperlar', 'Reyз (BB)', 'NL10 misol'],
      ['0', '3 BB', '$0.30'],
      ['1', '4 BB', '$0.40'],
      ['2', '5 BB', '$0.50'],
      ['3', '6 BB', '$0.60'],
      ['4', '7 BB', '$0.70'],
      ['5', '8 BB', '$0.80'],
    ]),
    h2('<strong>Xulosa</strong>'),
    p('1. Postflop — taxminan <strong>¾ bank</strong><br>2. Preflop — <strong>3–4 BB + 1 BB</strong> limper uchun<br>3. Raqiblarga arzon kartalar bermang'),
    p('<strong>♠️ Bet sizingni amalda sinab ko\'ring!</strong> PPPoker NUTS klubida ro\'yxatdan o\'ting va real handlarda strategiyani mukammallashtiring.'),
  ].join('\n'),
  kz: [
    h2('<strong>Пokerде bet sizing негіздері</strong>'),
    author.kz,
    p('Күні: 12.01.2026'),
    p('<strong>Bet sizing</strong> — покердің ең маңызды элементтерінің бірі. Ставка мөлшері алда болғанда максимум ұтып, артта болғанда минимум жоғалту мүмкіндігін анықтайды.'),
    h2('<strong>Bet sizing деген не?</strong>'),
    p('Bet sizing — жағдайға байланысты ставка мөлшері. Ол қарсыласқа <strong>pot odds</strong> қалай беретininizi анықтайды.'),
    p('Қарсылас әр қатесінен ұзақ мерзімде ақша ұтып alасыз. Дұрыс мөлшер <strong>пайdaңызды арттырады.</strong>'),
    h2('<strong>💪 Неге үлкенірек ставка?</strong>'),
    p('• <strong>Dro-пен call</strong> үшін жақсы odds бермейсіз<br>• Нашар қолдар call etkende ko\'proq <strong>value</strong><br>• Banktin jartysy nan kishi stavka — <strong>o\'tkazilgan value</strong>'),
    h2('<strong>Preflop bet sizing</strong>'),
    p('<strong>Open Raise:</strong> 👉 <strong>Reyз = 3 BB + әр limper үшін 1 BB.</strong>'),
    table([
      ['Limperler', 'Reyз (BB)', 'NL10 мысал'],
      ['0', '3 BB', '$0.30'],
      ['1', '4 BB', '$0.40'],
      ['2', '5 BB', '$0.50'],
    ]),
    h2('<strong>Qorytyndy</strong>'),
    p('Postflop — <strong>¾ bank</strong>; preflop — <strong>3–4 BB + 1 BB</strong> limper үшін.'),
    p('<strong>♠️ Bet sizing-ті практикада тексеріңіз!</strong> PPPoker NUTS klubında oynap, strategiyany jetildiring.'),
  ].join('\n'),
  hy: [
    h2('<strong>Bet sizing-ի հիմունքներ poker-ում</strong>'),
    author.hy,
    p('Ամսաթիվ: 12.01.2026'),
    p('<strong>Bet sizing</strong>-ը poker-ի ամենakritik տարրերից մեկն է։ Stavka hajm@ voroshum e, kapiq klin eq araj, maximum haghordum ev heto minimum klin eq.'),
    h2('<strong> Inch e bet sizing?</strong>'),
    p('Bet sizing-@ vaziyat@ stavka hajm e. Nshum e <strong>pot odds</strong> ev qani arjox e raqibin hamar sharunakel.'),
    h2('<strong>💪 Inchu aveli mets stavka?</strong>'),
    p('• <strong>Draw-ov call</strong> hamar lav odds chga talis<br>• Aveli <strong>value</strong> vat qo\'ller call anum en<br>• Poqr stavka — <strong>missed value</strong>'),
    h2('<strong>Preflop</strong>'),
    p('<strong>Open Raise:</strong> 3 BB + 1 BB amen limper-i hamar.'),
    h2('<strong>Amփոփում</strong>'),
    p('Postflop — <strong>¾ pot</strong>; preflop — 3–4 BB + limper. <strong>♠️ Test araq PPPoker NUTS!</strong>'),
  ].join('\n'),
  tj: [
    h2('<strong>Asoshoi bet sizing dar poker</strong>'),
    author.tj,
    p('Сана: 12.01.2026'),
    p('<strong>Bet sizing</strong> — яке az muҳimtarin unsurhoi poker. Andозаи ставка муайян мекунад, ки дар пesh qand yutuq va pas kamtar бохт медиҳед.'),
    h2('<strong>Bet sizing чист?</strong>'),
    p('Bet sizing — андозаи ставка дар вазият. <strong>Pot odds</strong>-ро ба рақиб медиҳад.'),
    h2('<strong>💪 Чаро бештар?</strong>'),
    p('• <strong>Draw</strong> бо call — odds-и бад<br>• <strong>Value</strong> зиёдтар<br>• Стavkaи хурд — <strong>value-и аз даст рафта</strong>'),
    h2('<strong>Preflop</strong>'),
    p('<strong>Open Raise:</strong> 3 BB + 1 BB барои har limper.'),
    h2('<strong>Хулоса</strong>'),
    p('Postflop — <strong>¾ pot</strong>. <strong>♠️ Дар клуби NUTS PPPoker санҷед!</strong>'),
  ].join('\n'),
};

export function write() {
  return writePostTranslation('osnovy-pravilnogo-bet-sajzinga-v-pokere', {
    en: {
      title: 'Bet Sizing Basics in Poker — Nuts PPPoker',
      description:
        'Bet sizing basics in poker: why bigger bets protect your hand, preflop open-raise sizing (3 BB + limpers), and postflop value. Practice in Club NUTS on PPPoker.',
      bodyHtml: body.en,
    },
    uz: {
      title: 'Pokerda bet sizing asoslari — Nuts PPPoker',
      description:
        'Pokerda bet sizing asoslari: nima uchun kattaroq stavkalar qo\'lni himoya qiladi, preflop open-raise (3 BB + limperlar) va postflop value. PPPoker NUTS klubida mashq qiling.',
      bodyHtml: body.uz,
    },
    kz: {
      title: 'Пokerде bet sizing негіздері — Nuts PPPoker',
      description:
        'Пokerде bet sizing негіздері: неге үлкен ставкalar qolды qorğaydy, preflop open-raise (3 BB + limperler) және postflop value. PPPoker NUTS klubında жаттығыңыз.',
      bodyHtml: body.kz,
    },
    hy: {
      title: 'Bet sizing-ի հիմունքներ poker-ում — Nuts PPPoker',
      description:
        'Bet sizing poker-ում. preflop open-raise (3 BB + limper), postflop value, qani vorpes stavka. PPPoker NUTS akumbum praktika.',
      bodyHtml: body.hy,
    },
    tj: {
      title: 'Asoshoi bet sizing dar poker — Nuts PPPoker',
      description:
        'Asoshoi bet sizing: preflop open-raise (3 BB + limper), postflop value. Dar klubi NUTS PPPoker amalӣ sanед.',
      bodyHtml: body.tj,
    },
  });
}
