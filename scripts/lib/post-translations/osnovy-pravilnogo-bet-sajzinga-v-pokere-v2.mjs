import { h2, p, writePostTranslation } from '../post-translation-writer.mjs';

const author = {
  en: () => p('Author:&nbsp;<a href="/author-roman-shaposhnikov/"><em>Roman Shaposhnikov</em></a>'),
  uz: () => p('Muallif:&nbsp;<a href="/author-roman-shaposhnikov/"><em>Roman Shaposhnikov</em></a>'),
  kz: () => p('Автор:&nbsp;<a href="/author-roman-shaposhnikov/"><em>Роман Шапошников</em></a>'),
  hy: () => p('Հեղինակ:&nbsp;<a href="/author-roman-shaposhnikov/"><em>Ռոման Շապոշնիկով</em></a>'),
  tj: () => p('Муаллиф:&nbsp;<a href="/author-roman-shaposhnikov/"><em>Роман Шапошников</em></a>'),
};

function td(html) {
  return `<td class="has-white-color has-text-color">${html}</td>`;
}

function li(html) {
  return `<li class="has-white-color has-text-color">${html}</li>`;
}

function ol(items) {
  return `<ol>\n${items.map(li).join('\n')}\n</ol>`;
}

export function write() {
  return writePostTranslation('osnovy-pravilnogo-bet-sajzinga-v-pokere', {
    en: {
      title: 'Bet Sizing Basics in Poker — Nuts PPPoker',
      description:
        'Bet sizing basics in poker: why bigger bets protect your hand, preflop open-raise sizing (3 BB + limpers), and postflop value. Practice in Club NUTS on PPPoker.',
      bodyHtml: [
        p('<strong>Bet Sizing Basics in Poker</strong>'),
        author.en(),
        p('Date: 12.01.2026'),
        p('<strong>Bet sizing</strong> is one of the most critical elements of poker. The size of your bet determines whether you can win the maximum when ahead and lose the minimum when behind.'),
        h2('<strong>What Is Bet Sizing?</strong>'),
        p('Bet sizing is the size of your bet depending on the situation. It defines the <strong>pot odds</strong> you give your opponent and how profitable it is for them to continue.'),
        p('You win money over the long run from every mistake your opponent makes. A well-chosen bet size <strong>increases your profit.</strong>'),
        h2('<strong>💪 Why Bet Bigger?</strong>'),
        p('In most situations aggressive sizing is the optimal choice:'),
        p('• You do not give opponents good odds to <strong>call with draws</strong><br>• You get more <strong>value</strong> when worse hands call<br>• A bet below half the pot almost always means <strong>missed value and weak protection</strong>'),
        p('Larger bets <strong>protect your hand</strong> and punish mistakes.'),
        h2('<strong>When Are Small Bets Appropriate?</strong>'),
        p('• <strong>Against nits:</strong> when they fold to a large bet but call a small one for <strong>thin value</strong><br>• <strong>On dry boards:</strong> when the texture minimizes obvious draw hands'),
        p('Without precise information, it is always better to bet <strong>more rather than less</strong>.'),
        h2('<strong>Preflop Bet Sizing</strong>'),
        p('Basic rule for an opening raise (<strong>Open Raise</strong>): 👉 <strong>Raise = 3 BB + 1 BB for each limper already in the pot.</strong>'),
        `<table><tbody>
<tr>${td('Limpers')}${td('Raise size (BB)')}${td('Example NL10')}</tr>
<tr>${td('0')}${td('3 BB')}${td('$0.30')}</tr>
<tr>${td('1')}${td('4 BB')}${td('$0.40')}</tr>
<tr>${td('2')}${td('5 BB')}${td('$0.50')}</tr>
<tr>${td('3')}${td('6 BB')}${td('$0.60')}</tr>
<tr>${td('4')}${td('7 BB')}${td('$0.70')}</tr>
<tr>${td('5')}${td('8 BB')}${td('$0.80')}</tr>
</tbody></table>`,
        h2('<strong>Summary</strong>'),
        ol([
          'Postflop, bet bigger — usually around <strong>¾ pot</strong>.',
          'Preflop, raise <strong>3–4 BB + 1 BB</strong> per limper.',
          '<strong>Do not give opponents cheap cards</strong> — maximize value and protect your hand.',
        ]),
        p('<strong>♠️ Test proper bet sizing in practice!</strong> Register in Club NUTS on PPPoker and refine your strategy in real hands.'),
      ].join('\n'),
    },
    uz: {
      title: 'Pokerda bet sizing asoslari — Nuts PPPoker',
      description:
        "Pokerda bet sizing asoslari: nima uchun kattaroq stavkalar qo'lni himoya qiladi, preflop open-raise (3 BB + limperlar) va postflop value. PPPoker NUTS klubida mashq qiling.",
      bodyHtml: [
        p('<strong>Pokerda bet sizing asoslari</strong>'),
        author.uz(),
        p('Sana: 12.01.2026'),
        p("<strong>Bet sizing</strong> pokerning eng muhim elementlaridan biridir. Stavka hajmi oldinda bo'lganda maksimum yutish va orqada bo'lganda minimum yo'qotish imkonini belgilaydi."),
        h2('<strong>Bet sizing nima?</strong>'),
        p("Bet sizing — vaziyatga qarab stavka hajmi. U raqibga qanday <strong>pot odds</strong> berishingizni belgilaydi."),
        h2('<strong>💪 Nega kattaroq stavka qilish kerak?</strong>'),
        p("• Raqibga <strong>dro bilan call</strong> uchun yaxshi odds bermaysiz<br>• Yomon qo'llar call qilganda ko'proq <strong>value</strong> olasiz<br>• Bankning yarmidan kichik stavka — <strong>o'tkazib yuborilgan value</strong>"),
        h2('<strong>Qachon kichik stavkalar mos?</strong>'),
        p("• <strong>Nitlarga qarshi:</strong> <strong>thin value</strong><br>• <strong>Quruq boardlarda:</strong> aniq dro kam"),
        h2('<strong>Preflop bet sizing</strong>'),
        p('<strong>Open Raise</strong> qoidasi: 👉 <strong>Reyз = 3 BB + har bir limper uchun 1 BB.</strong>'),
        `<table><tbody>
<tr>${td('Limperlar')}${td('Reyз (BB)')}${td('NL10 misol')}</tr>
<tr>${td('0')}${td('3 BB')}${td('$0.30')}</tr>
<tr>${td('1')}${td('4 BB')}${td('$0.40')}</tr>
<tr>${td('2')}${td('5 BB')}${td('$0.50')}</tr>
<tr>${td('3')}${td('6 BB')}${td('$0.60')}</tr>
<tr>${td('4')}${td('7 BB')}${td('$0.70')}</tr>
<tr>${td('5')}${td('8 BB')}${td('$0.80')}</tr>
</tbody></table>`,
        h2('<strong>Xulosa</strong>'),
        ol([
          "Postflop — taxminan <strong>¾ bank</strong>",
          "Preflop — <strong>3–4 BB + 1 BB</strong> limper uchun",
          "Raqiblarga arzon kartalar bermang",
        ]),
        p("<strong>♠️ Bet sizingni amalda sinab ko'ring!</strong> PPPoker NUTS klubida ro'yxatdan o'ting."),
      ].join('\n'),
    },
    kz: {
      title: 'Покерде bet sizing негіздері — Nuts PPPoker',
      description:
        'Покерде bet sizing негіздері: неге үлкен ставкалар қолды қорғайды, preflop open-raise (3 BB + limperлер) және postflop value. PPPoker NUTS клубында жаттығыңыз.',
      bodyHtml: [
        p('<strong>Покерде bet sizing негіздері</strong>'),
        author.kz(),
        p('Күні: 12.01.2026'),
        p('<strong>Bet sizing</strong> — покердің ең маңызды элементтерінің бірі. Ставка мөлшері алда болғанда максимум ұтып, артта болғанда минимум жоғалту мүмкіндігін анықтайды.'),
        h2('<strong>Bet sizing деген не?</strong>'),
        p('Bet sizing — жағдайға байланысты ставка мөлшері. Ол қарсыласқа <strong>pot odds</strong> қалай беретininizi анықтайды.'),
        h2('<strong>💪 Неге үлкенірек ставка?</strong>'),
        p('• <strong>Dro-пен call</strong> үшін жақсы odds бермейсіз<br>• Нашар қолдар call еткенде көбірек <strong>value</strong><br>• Банктің жартысынан кіші ставка — <strong>өткізілген value</strong>'),
        h2('<strong>Preflop bet sizing</strong>'),
        p('<strong>Open Raise:</strong> 👉 <strong>Reyз = 3 BB + әр limper үшін 1 BB.</strong>'),
        `<table><tbody>
<tr>${td('Limperлер')}${td('Reyз (BB)')}${td('NL10 мысал')}</tr>
<tr>${td('0')}${td('3 BB')}${td('$0.30')}</tr>
<tr>${td('1')}${td('4 BB')}${td('$0.40')}</tr>
<tr>${td('2')}${td('5 BB')}${td('$0.50')}</tr>
<tr>${td('3')}${td('6 BB')}${td('$0.60')}</tr>
<tr>${td('4')}${td('7 BB')}${td('$0.70')}</tr>
<tr>${td('5')}${td('8 BB')}${td('$0.80')}</tr>
</tbody></table>`,
        h2('<strong>Қорытынды</strong>'),
        ol([
          'Postflop — <strong>¾ bank</strong>',
          'Preflop — <strong>3–4 BB + 1 BB</strong> limper үшін',
          'Қарсыластарға арзан карталар бермеңіз',
        ]),
        p('<strong>♠️ Bet sizing-ті практикада тексеріңіз!</strong> PPPoker NUTS клубында ойнаңыз.'),
      ].join('\n'),
    },
    hy: {
      title: 'Bet sizing-ի հիմունքներ պոկերում — Nuts PPPoker',
      description:
        'Bet sizing-ի հիմունքներ պոկերում. ինչու ավելի մեծ խաղադրույքները պաշտպանում են ձեռքը, preflop open-raise (3 BB + limper-ներ) և postflop value: Փորձեք PPPoker NUTS ակումբում:',
      bodyHtml: [
        p('<strong>Bet sizing-ի հիմունքներ պոկերում</strong>'),
        author.hy(),
        p('Ամսաթիվ: 12.01.2026'),
        p('<strong>Bet sizing</strong> պոկերի ամենակարևոր տարրերից մեկն է: Խաղադրույքի չափը որոշում է, թե առաջ լինելիս կարող եք մաքսիմում շահել, իսկ հետ եք կորցնել նվազագույնը:'),
        h2('<strong>Ի՞նչ է bet sizing-ը</strong>'),
        p('Bet sizing-ը խաղադրույքի չափն է՝ կախված իրավիճակից: Այն սահմանում է <strong>pot odds</strong>-ը, որ տալիս եք հակառակորդին:'),
        h2('<strong>💪 Ինչու ավելի մեծ խաղադրույք</strong>'),
        p('• Չեք տալիս լավ odds <strong>draw-ով call</strong>-ի համար<br>• Ավելի շատ <strong>value</strong> ավելի թույլ ձեռքերից<br>• Բանկի կեսից փոքր խաղադրույք — <strong>բաց թողնված value</strong>'),
        h2('<strong>Preflop bet sizing</strong>'),
        p('<strong>Open Raise.</strong> 👉 <strong>Raise = 3 BB + 1 BB յուրաքանչյուր limper-ի համար:</strong>'),
        `<table><tbody>
<tr>${td('Limper-ներ')}${td('Raise (BB)')}${td('NL10 օրինակ')}</tr>
<tr>${td('0')}${td('3 BB')}${td('$0.30')}</tr>
<tr>${td('1')}${td('4 BB')}${td('$0.40')}</tr>
<tr>${td('2')}${td('5 BB')}${td('$0.50')}</tr>
<tr>${td('3')}${td('6 BB')}${td('$0.60')}</tr>
<tr>${td('4')}${td('7 BB')}${td('$0.70')}</tr>
<tr>${td('5')}${td('8 BB')}${td('$0.80')}</tr>
</tbody></table>`,
        h2('<strong>Ամփոփում</strong>'),
        ol([
          'Postflop — մոտ <strong>¾ բանկ</strong>',
          'Preflop — <strong>3–4 BB + 1 BB</strong> limper-ի համար',
          'Մի տվեք հակառակորդներին էժան քարտեր',
        ]),
        p('<strong>♠️ Ստուգեք bet sizing-ը գործնականում!</strong> Գրանցվեք PPPoker NUTS ակումբում:'),
      ].join('\n'),
    },
    tj: {
      title: 'Асосҳои bet sizing дар покер — Nuts PPPoker',
      description:
        'Асосҳои bet sizing дар покер: чаро ставкаҳои калонтар дастро ҳимоя мекунанд, preflop open-raise (3 BB + limper-ҳо) ва postflop value. Дар клуби NUTS PPPoker машқ кунед.',
      bodyHtml: [
        p('<strong>Асосҳои bet sizing дар покер</strong>'),
        author.tj(),
        p('Сана: 12.01.2026'),
        p('<strong>Bet sizing</strong> — яке аз элементҳои муҳимтарини покер аст. Андозаи ставка муайян мекунад, ки дар пешбинӣ чӣ қадар бурда ва дар ақиб чӣ қадар талаф мекунед.'),
        h2('<strong>Bet sizing чист?</strong>'),
        p('Bet sizing — андозаи ставка вобаста ба вазъият. Он <strong>pot odds</strong>-ро ба рақиб медиҳад.'),
        h2('<strong>💪 Чаро ставкаи калонтар?</strong>'),
        p('• <strong>draw бо call</strong>-ро odds-и хуб намедиҳед<br>• <strong>value</strong>-и бештар аз дастҳои сусттар<br>• Ставкаи камтар аз нисфи банк — <strong>value-и гумшуда</strong>'),
        h2('<strong>Preflop bet sizing</strong>'),
        p('<strong>Open Raise:</strong> 👉 <strong>Raise = 3 BB + 1 BB барои ҳар limper.</strong>'),
        `<table><tbody>
<tr>${td('Limper-ҳо')}${td('Raise (BB)')}${td('Мисоли NL10')}</tr>
<tr>${td('0')}${td('3 BB')}${td('$0.30')}</tr>
<tr>${td('1')}${td('4 BB')}${td('$0.40')}</tr>
<tr>${td('2')}${td('5 BB')}${td('$0.50')}</tr>
<tr>${td('3')}${td('6 BB')}${td('$0.60')}</tr>
<tr>${td('4')}${td('7 BB')}${td('$0.70')}</tr>
<tr>${td('5')}${td('8 BB')}${td('$0.80')}</tr>
</tbody></table>`,
        h2('<strong>Хулоса</strong>'),
        ol([
          'Postflop — тақрибан <strong>¾ банк</strong>',
          'Preflop — <strong>3–4 BB + 1 BB</strong> барои limper',
          'Ба рақибон кортҳои арзон надиҳед',
        ]),
        p('<strong>♠️ Bet sizing-ро дар амал санҷед!</strong> Дар клуби NUTS PPPoker сабти ном кунед.'),
      ].join('\n'),
    },
  });
}
