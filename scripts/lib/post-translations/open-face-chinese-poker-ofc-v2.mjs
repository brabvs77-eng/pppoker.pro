import { h2, h3, h4, p, writePostTranslation } from '../post-translation-writer.mjs';

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

function ul(items) {
  return `<ul>\n${items.map(li).join('\n')}\n</ul>`;
}

function ol(items) {
  return `<ol>\n${items.map(li).join('\n')}\n</ol>`;
}

export function write() {
  return writePostTranslation('open-face-chinese-poker-ofc', {
    en: {
      title: 'Open Face Chinese Poker (OFC) — Nuts PPPoker',
      description:
        'Open Face Chinese Poker (OFC): rules, three-row structure, scoring, fouls, and Fantasy mode. Try OFC tables in the NUTS club on PPPoker.',
      bodyHtml: [
        p('<strong>Open Face Chinese Poker (OFC): Rules, Structure, and Scoring</strong>'),
        author.en(),
        p('Date: 12.01.2026'),
        p('<strong>Open Face Chinese Poker (OFC)</strong> is a dynamic strategic poker variant where players do not bet but compete to build three strongest poker combinations from 13 cards across three rows. The game blends math, intuition, and excitement — especially in <strong>Fantasy</strong> mode.'),
        h2('<strong>Goal: Build Three Strong Rows</strong>'),
        p('Each player arranges 13 cards into three independent hands, obeying the rule that strength must go <strong>from strongest to weakest</strong>.'),
        `<table><tbody>
<tr>${td('<strong>Row</strong>')}${td('<strong>Cards</strong>')}${td('<strong>Strength</strong>')}</tr>
<tr>${td('<strong>Bottom</strong>')}${td('5 cards')}${td('<strong>Strongest</strong>')}</tr>
<tr>${td('<strong>Middle</strong>')}${td('5 cards')}${td('Weaker than bottom')}</tr>
<tr>${td('<strong>Top</strong>')}${td('3 cards')}${td('Weaker than middle')}</tr>
</tbody></table>`,
        p('<strong>⚠️ Foul:</strong> If order is broken (middle stronger than bottom), the player <strong>fouls</strong> and opponents take all points for the hand.'),
        h2('<strong>How a Hand Plays Out</strong>'),
        ol([
          '<strong>Start:</strong> 5 cards dealt; place them across rows (e.g. 1 on top, 2 on middle, 2 on bottom).',
          '<strong>Next rounds:</strong> 3 cards dealt; place 2 face up, <strong>discard 1</strong>.',
          'Repeat until all 13 cards are placed.',
        ]),
        p('After all 13 cards are placed, hands are compared row by row: bottom vs bottom, middle vs middle, top vs top.'),
        h2('<strong>Scoring</strong>'),
        p('Points are awarded for winning each row plus <strong>Royalties</strong> for premium hands (quads, straight flush).'),
        ul([
          '<strong>Win a row:</strong> +1 point.',
          '<strong>Lose a row:</strong> -1 point.',
          '<strong>Scoop</strong> (win all three rows): +3 bonus points.',
        ]),
        h2('<strong>Fantasy Round</strong>'),
        p('Qualify with <strong>QQ+ on top</strong> without fouling. In Fantasy you receive <strong>14–17 cards</strong> and set all 13 before others. Re-enter with <strong>trips on top</strong> in Fantasy.'),
        h2('<strong>Hand Rankings</strong>'),
        p('Bottom and middle use standard rankings. Top (3 cards): pair, trips, or high card only — straights and flushes from three cards do not count.'),
        ol([
          'Royal flush', 'Straight flush', 'Four of a kind', 'Full house', 'Flush', 'Straight', 'Three of a kind', 'Two pair', 'Pair', 'High card',
        ]),
        h2('<strong>Why OFC Is Popular</strong>'),
        ul([
          '<strong>Pure strategy:</strong> no street betting or bluffing.',
          '<strong>Fantasy adrenaline:</strong> huge swings in one hand.',
          '<strong>Constant tension:</strong> decisions until the 13th card.',
          '<strong>Flexibility:</strong> you choose which cards to keep or discard.',
        ]),
        p('<strong>Try OFC in the NUTS club on PPPoker!</strong>'),
        p('Join <strong>NUTS on PPPoker</strong> OFC tables and test your intuition and math in the most strategic poker format.'),
      ].join('\n'),
    },
    uz: {
      title: 'Open Face Chinese Poker (OFC) — Nuts PPPoker',
      description:
        "Open Face Chinese Poker (OFC): qoidalar, uch qatorli tuzilma, ochko hisobi, foul va Fantasy rejimi. PPPoker NUTS klubida OFC stollarini sinab ko'ring.",
      bodyHtml: [
        p('<strong>Open Face Chinese Poker (OFC): Qoidalar, tuzilma va hisob</strong>'),
        author.uz(),
        p('Sana: 12.01.2026'),
        p("<strong>Open Face Chinese Poker (OFC)</strong> — stavkasiz dinamik strategik poker: 13 kartadan uch qatorli eng kuchli kombinatsiyalarni yig'ish. O'yin matematika, intuitiya va hayajonni birlashtiradi — ayniqsa <strong>Fantasy</strong> rejimida."),
        h2('<strong>Maqsad: uch kuchli qator yigish</strong>'),
        p("Har bir o'yinchi 13 kartani uch mustaqil qo'lga joylashtiradi, kuch <strong>eng kuchlidan eng zaifgacha</strong> ketishi shart."),
        `<table><tbody>
<tr>${td('<strong>Qator</strong>')}${td('<strong>Kartalar</strong>')}${td('<strong>Kuch</strong>')}</tr>
<tr>${td('<strong>Pastki</strong>')}${td('5 karta')}${td('<strong>Eng kuchli</strong>')}</tr>
<tr>${td("<strong>O'rta</strong>")}${td('5 karta')}${td('Pastkidan past')}</tr>
<tr>${td('<strong>Yuqori</strong>')}${td('3 karta')}${td("O'rtadan past")}</tr>
</tbody></table>`,
        p("<strong>⚠️ Foul:</strong> tartib buzilsa (o'rta pastkidan kuchli bo'lsa), o'yinchi <strong>foul</strong> bo'ladi va raqiblar barcha ochkolarni oladi."),
        h2("<strong>Hand qanday o'tadi</strong>"),
        ol([
          "<strong>Boshlanish:</strong> 5 karta — qatorlarga joylashtirish (masalan, 1 yuqoriga, 2 o'rtaga, 2 pastga).",
          "<strong>Keyingi raundlar:</strong> 3 karta; 2 tasini ochiq joylashtirish, <strong>1 tasini discard</strong>.",
          '13 karta joylashtirilguncha davom etadi.',
        ]),
        p('13 karta joylashtirilgach, qatorlar solishtiriladi: pastki-pastki, o\'rta-o\'rta, yuqori-yuqori.'),
        h2('<strong>Ochko hisobi</strong>'),
        ul([
          '<strong>Qator yutish:</strong> +1 ochko.',
          '<strong>Qator yutqazish:</strong> -1 ochko.',
          '<strong>Scoop</strong> (uch qatorni yutish): +3 bonus.',
        ]),
        h2('<strong>Fantasy raundi</strong>'),
        p("Yuqori qatorda <strong>QQ+</strong> yig'ib, foul qilmasdan Fantasy ga kirish. Fantasy da <strong>14–17 karta</strong> olinadi va barcha 13 karta boshqalardan oldin joylashtiriladi."),
        h2('<strong>Kombinatsiyalar reytingi</strong>'),
        p("Pastki va o'rta standart reyting. Yuqori (3 karta): faqat juft, set yoki yuqori karta."),
        h2('<strong>Nega OFC mashhur?</strong>'),
        ul([
          '<strong>Toza strategiya:</strong> stavka va bluff yo\'q.',
          '<strong>Fantasy hayajoni:</strong> bir handda katta o\'zgarishlar.',
          '<strong>Doimiy taranglik:</strong> 13-kartagacha qarorlar.',
        ]),
        p("<strong>OFC-ni PPPoker NUTS klubida sinab ko'ring!</strong>"),
      ].join('\n'),
    },
    kz: {
      title: 'Open Face Chinese Poker (OFC) — Nuts PPPoker',
      description:
        'Open Face Chinese Poker (OFC): ережелер, үш қатарлы құрылым, ұпай, foul және Fantasy режимі. PPPoker NUTS клубында OFC ойнаңыз.',
      bodyHtml: [
        p('<strong>Open Face Chinese Poker (OFC): Ережелер, құрылым және ұпай</strong>'),
        author.kz(),
        p('Күні: 12.01.2026'),
        p('<strong>Open Face Chinese Poker (OFC)</strong> — ставкасыз динамикалық стратегиялық покер: 13 картадан үш қатардағы ең күшті комбинацияларды жинау. Ойын математика, интуиция және қызығушылықты біріктіреді — әсіресе <strong>Fantasy</strong> режимінде.'),
        h2('<strong>Мақсат: үш күшті қатар жинау</strong>'),
        `<table><tbody>
<tr>${td('<strong>Қатар</strong>')}${td('<strong>Карталар</strong>')}${td('<strong>Күш</strong>')}</tr>
<tr>${td('<strong>Төменгі</strong>')}${td('5 карта')}${td('<strong>Ең күшті</strong>')}</tr>
<tr>${td('<strong>Орта</strong>')}${td('5 карта')}${td('Төменгіден әлсіз')}</tr>
<tr>${td('<strong>Жоғарғы</strong>')}${td('3 карта')}${td('Ортадан әлсіз')}</tr>
</tbody></table>`,
        p('<strong>⚠️ Foul:</strong> рет бұзылса, ойыншы <strong>foul</strong> болады және қарсыластар барлық ұпайды алады.'),
        h2('<strong>Hand қалай өтеді</strong>'),
        ol([
          '<strong>Басталу:</strong> 5 карта — қатарларға орналастыру.',
          '<strong>Келесі раундтар:</strong> 3 карта; 2-ін ашық, <strong>1-ін discard</strong>.',
          '13 карта орналастырылғанша жалғасады.',
        ]),
        h2('<strong>Ұпай</strong>'),
        ul([
          '<strong>Қатар жеңу:</strong> +1 ұпай.',
          '<strong>Scoop:</strong> +3 бонус.',
        ]),
        h2('<strong>Fantasy раунды</strong>'),
        p('Жоғарғы қатарда <strong>QQ+</strong> — Fantasy-да <strong>14–17 карта</strong>.'),
        p('<strong>OFC-ті PPPoker NUTS клубында байқап көріңіз!</strong>'),
      ].join('\n'),
    },
    hy: {
      title: 'Open Face Chinese Poker (OFC) — Nuts PPPoker',
      description:
        'Open Face Chinese Poker (OFC). կանոններ, երեք շարքի կառուցվածք, միավորներ, foul և Fantasy ռեժիմ: Փորձեք OFC սեղաններ PPPoker NUTS ակումբում:',
      bodyHtml: [
        p('<strong>Open Face Chinese Poker (OFC). Կանոններ, կառուցվածք և միավորներ</strong>'),
        author.hy(),
        p('Ամսաթիվ: 12.01.2026'),
        p('<strong>Open Face Chinese Poker (OFC)</strong> դինամիկ ռազմավարական պոկերի տարբերակ է, որտեղ խաղացողները չեն խաղադրում, այլ մրցում են 13 քարտից երեք ամենաուժեղ կոմբինացիա կառուցելու համար: Խաղը միավորում է մաթեմատիկա, ինտուիցիա և հուզմունք — հատկապես <strong>Fantasy</strong> ռեժիմում:'),
        h2('<strong>Նպատակ. երեք ուժեղ շարք</strong>'),
        `<table><tbody>
<tr>${td('<strong>Շարք</strong>')}${td('<strong>Քարտեր</strong>')}${td('<strong>Ուժ</strong>')}</tr>
<tr>${td('<strong>Ներքև</strong>')}${td('5 քարտ')}${td('<strong>Ամենաուժեղ</strong>')}</tr>
<tr>${td('<strong>Մեջտեղ</strong>')}${td('5 քարտ')}${td('Թույլ ներքևից')}</tr>
<tr>${td('<strong>Վերև</strong>')}${td('3 քարտ')}${td('Թույլ մեջտեղից')}</tr>
</tbody></table>`,
        p('<strong>⚠️ Foul.</strong> եթե կարգը խախտվում է, խաղացողը <strong>foul</strong> է լինում և հակառակորդները վերցնում են բոլոր միավորները:'),
        h2('<strong>Ինչպես է ընթանում ձեռքը</strong>'),
        ol([
          '<strong>Սկիզբ.</strong> 5 քարտ — տեղադրել շարքերում:',
          '<strong>Հաջորդ ռաունդներ.</strong> 3 քարտ. 2-ը բաց, <strong>1-ը discard</strong>:',
          'Կրկնել մինչև 13 քարտը տեղադրվի:',
        ]),
        h2('<strong>Միավորներ</strong>'),
        ul([
          '<strong>Շարքի հաղթանակ.</strong> +1 միավոր:',
          '<strong>Scoop.</strong> +3 բոնուս:',
        ]),
        h2('<strong>Fantasy ռաունդ</strong>'),
        p('Վերևում <strong>QQ+</strong> — Fantasy-ում <strong>14–17 քարտ</strong>:'),
        p('<strong>Փորձեք OFC PPPoker NUTS ակումբում!</strong>'),
      ].join('\n'),
    },
    tj: {
      title: 'Open Face Chinese Poker (OFC) — Nuts PPPoker',
      description:
        'Open Face Chinese Poker (OFC): қоидаҳо, сохтори се-сатрӣ, ҳисоб, foul ва режими Fantasy. Дар клуби NUTS PPPoker OFC бозӣ кунед.',
      bodyHtml: [
        p('<strong>Open Face Chinese Poker (OFC): Қоидаҳо, сохтор ва ҳисоб</strong>'),
        author.tj(),
        p('Сана: 12.01.2026'),
        p('<strong>Open Face Chinese Poker (OFC)</strong> — намуди стратегии динамикии покер бе ставка: аз 13 корт се комбинатсияи қавитарин дар се сатр. Бозӣ математика, интуитсия ва ҳаяҷонро муттаҳид мекунад — махсусан дар режими <strong>Fantasy</strong>.'),
        h2('<strong>Ҳадаф: се сатри қавӣ</strong>'),
        `<table><tbody>
<tr>${td('<strong>Сатр</strong>')}${td('<strong>Кортҳо</strong>')}${td('<strong>Қувват</strong>')}</tr>
<tr>${td('<strong>Поён</strong>')}${td('5 корт')}${td('<strong>Қавитарин</strong>')}</tr>
<tr>${td('<strong>Миёна</strong>')}${td('5 корт')}${td('Аз поён сусттар')}</tr>
<tr>${td('<strong>Боло</strong>')}${td('3 корт')}${td('Аз миёна сусттар')}</tr>
</tbody></table>`,
        p('<strong>⚠️ Foul:</strong> агар тартиб вайрон шавад, бозигар <strong>foul</strong> мешавад ва рақибон ҳамаи холҳоро мегиранд.'),
        h2('<strong>Чӣ гуна даст мегузарад</strong>'),
        ol([
          '<strong>Оғоз:</strong> 5 корт — ҷойгиркунӣ дар сатрҳо.',
          '<strong>Раундҳои баъдӣ:</strong> 3 корт; 2-ро кушода, <strong>1-ро discard</strong>.',
          'Такрор то ҷойгиршавии 13 корт.',
        ]),
        h2('<strong>Ҳисоб</strong>'),
        ul([
          '<strong>Бурдани сатр:</strong> +1 хол.',
          '<strong>Scoop:</strong> +3 бонус.',
        ]),
        h2('<strong>Раунди Fantasy</strong>'),
        p('Дар боло <strong>QQ+</strong> — дар Fantasy <strong>14–17 корт</strong>.'),
        p('<strong>OFC-ро дар клуби NUTS PPPoker санҷед!</strong>'),
      ].join('\n'),
    },
  });
}
