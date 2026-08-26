import { h2, h3, p, writePostTranslation } from '../post-translation-writer.mjs';

const comboTable = {
  en: `<table>
<tbody>
<tr><td>Hand</td><td>Description</td><td>Example</td></tr>
<tr><td><b>Royal flush</b></td><td>Five consecutive cards of one suit from Ten to Ace.</td><td>A♠️K♠️Q♠️J♠️10♠️</td></tr>
<tr><td><b>Straight flush</b></td><td>Five consecutive cards of one suit.</td><td>7♥️6♥️5♥️4♥️3♥️</td></tr>
<tr><td><b>Four of a kind</b></td><td>Four cards of the same rank.</td><td>J♥️J♦️J♣️J♠️</td></tr>
<tr><td><b>Full house</b></td><td>Three cards of one rank and two of another.</td><td>A♠️A♥️A♦️7♣️7♠️</td></tr>
<tr><td><b>Flush</b></td><td>Five cards of one suit.</td><td>J♦️8♦️7♦️3♦️2♦️</td></tr>
<tr><td><b>Straight</b></td><td>Five consecutive cards of mixed suits.</td><td>J♣️10♠️9♥️8♥️7♣️</td></tr>
<tr><td><b>Three of a kind (set)</b></td><td>Three cards of the same rank.</td><td>K♥️K♦️K♣️7♦️4♣️</td></tr>
<tr><td><b>Two pair</b></td><td>Two different pairs.</td><td>Q♣️Q♠️J♠️J♥️5♦️</td></tr>
<tr><td><b>One pair</b></td><td>Two cards of the same rank.</td><td>A♦️A♣️8♠️6♥️3♠️</td></tr>
<tr><td><b>High card</b></td><td>No listed combination. Winner decided by highest card.</td><td>K♠️J♣️8♥️4♠️2♦️</td></tr>
</tbody>
</table>`,
  uz: `<table>
<tbody>
<tr><td>Kombinatsiya</td><td>Tavsif</td><td>Misol</td></tr>
<tr><td><b>Royal flush</b></td><td>Bitta mastdan O‘ndan Tuzgacha ketma-ket beshta karta.</td><td>A♠️K♠️Q♠️J♠️10♠️</td></tr>
<tr><td><b>Straight flush</b></td><td>Bitta mastdan ketma-ket beshta karta.</td><td>7♥️6♥️5♥️4♥️3♥️</td></tr>
<tr><td><b>Kare</b></td><td>Bir darajadan to‘rtta karta.</td><td>J♥️J♦️J♣️J♠️</td></tr>
<tr><td><b>Full house</b></td><td>Bir darajadan uchta va boshqa darajadan ikkita karta.</td><td>A♠️A♥️A♦️7♣️7♠️</td></tr>
<tr><td><b>Flush</b></td><td>Bitta mastdan beshta karta.</td><td>J♦️8♦️7♦️3♦️2♦️</td></tr>
<tr><td><b>Straight</b></td><td>Turli mastlardan ketma-ket beshta karta.</td><td>J♣️10♠️9♥️8♥️7♣️</td></tr>
<tr><td><b>Uchlik (set)</b></td><td>Bir darajadan uchta karta.</td><td>K♥️K♦️K♣️7♦️4♣️</td></tr>
<tr><td><b>Ikki juft</b></td><td>Ikki xil juft.</td><td>Q♣️Q♠️J♠️J♥️5♦️</td></tr>
<tr><td><b>Juft</b></td><td>Bir darajadan ikkita karta.</td><td>A♦️A♣️8♠️6♥️3♠️</td></tr>
<tr><td><b>Yuqori karta</b></td><td>Ro‘yxatdagi kombinatsiya yo‘q. G‘olib eng yuqori kartaga ko‘ra aniqlanadi.</td><td>K♠️J♣️8♥️4♠️2♦️</td></tr>
</tbody>
</table>`,
  kz: `<table>
<tbody>
<tr><td>Комбинация</td><td>Сипаттама</td><td>Мысал</td></tr>
<tr><td><b>Роял-флеш</b></td><td>Бір мастан Оннан Тұзға дейін ретті бес карта.</td><td>A♠️K♠️Q♠️J♠️10♠️</td></tr>
<tr><td><b>Стрит-флеш</b></td><td>Бір мастан ретті бес карта.</td><td>7♥️6♥️5♥️4♥️3♥️</td></tr>
<tr><td><b>Каре</b></td><td>Бір дәрежеден төрт карта.</td><td>J♥️J♦️J♣️J♠️</td></tr>
<tr><td><b>Фулл-хаус</b></td><td>Бір дәрежеден үш және басқасынан екі карта.</td><td>A♠️A♥️A♦️7♣️7♠️</td></tr>
<tr><td><b>Флеш</b></td><td>Бір мастан бес карта.</td><td>J♦️8♦️7♦️3♦️2♦️</td></tr>
<tr><td><b>Стрит</b></td><td>Әртүрлі мастардан ретті бес карта.</td><td>J♣️10♠️9♥️8♥️7♣️</td></tr>
<tr><td><b>Үшлік (сет)</b></td><td>Бір дәрежеден үш карта.</td><td>K♥️K♦️K♣️7♦️4♣️</td></tr>
<tr><td><b>Екі жұп</b></td><td>Екі әртүрлі жұп.</td><td>Q♣️Q♠️J♠️J♥️5♦️</td></tr>
<tr><td><b>Жұп</b></td><td>Бір дәрежеден екі карта.</td><td>A♦️A♣️8♠️6♥️3♠️</td></tr>
<tr><td><b>Жоғары карта</b></td><td>Тізімдегі комбинация жоқ. Жеңімпаз ең жоғары карта бойынша анықталады.</td><td>K♠️J♣️8♥️4♠️2♦️</td></tr>
</tbody>
</table>`,
  hy: `<table>
<tbody>
<tr><td>Կոմբինացիա</td><td>Նկարագրություն</td><td>Օրինակ</td></tr>
<tr><td><b>Royal flush</b></td><td>Մեկ մաստի հինգ հաջորդական քարտ Տասից մինչև Տուզ։</td><td>A♠️K♠️Q♠️J♠️10♠️</td></tr>
<tr><td><b>Straight flush</b></td><td>Մեկ մաստի հինգ հաջորդական քարտ։</td><td>7♥️6♥️5♥️4♥️3♥️</td></tr>
<tr><td><b>Քառակ</b></td><td>Նույն արժեքի չորս քարտ։</td><td>J♥️J♦️J♣️J♠️</td></tr>
<tr><td><b>Full house</b></td><td>Մեկ արժեքի երեք և մյուսի երկու քարտ։</td><td>A♠️A♥️A♦️7♣️7♠️</td></tr>
<tr><td><b>Ֆլեշ</b></td><td>Մեկ մաստի հինգ քարտ։</td><td>J♦️8♦️7♦️3♦️2♦️</td></tr>
<tr><td><b>Ստրիթ</b></td><td>Տարբեր մաստերի հինգ հաջորդական քարտ։</td><td>J♣️10♠️9♥️8♥️7♣️</td></tr>
<tr><td><b>Երեքական (սեթ)</b></td><td>Նույն արժեքի երեք քարտ։</td><td>K♥️K♦️K♣️7♦️4♣️</td></tr>
<tr><td><b>Երկու զույգ</b></td><td>Երկու տարբեր զույգ։</td><td>Q♣️Q♠️J♠️J♥️5♦️</td></tr>
<tr><td><b>Զույգ</b></td><td>Նույն արժեքի երկու քարտ։</td><td>A♦️A♣️8♠️6♥️3♠️</td></tr>
<tr><td><b>Բարձր քարտ</b></td><td>Ցուցակված կոմբինացիա չկա։ Հաղթողը որոշվում է ամենաբարձր քարտով։</td><td>K♠️J♣️8♥️4♠️2♦️</td></tr>
</tbody>
</table>`,
  tj: `<table>
<tbody>
<tr><td>Комбинатсия</td><td>Тавсиф</td><td>Мисол</td></tr>
<tr><td><b>Royal flush</b></td><td>Панҷ корт пайдарпай аз Даҳ то Туз як маст.</td><td>A♠️K♠️Q♠️J♠️10♠️</td></tr>
<tr><td><b>Straight flush</b></td><td>Панҷ корт пайдарпай як маст.</td><td>7♥️6♥️5♥️4♥️3♥️</td></tr>
<tr><td><b>Каре</b></td><td>Чор корт як рутба.</td><td>J♥️J♦️J♣️J♠️</td></tr>
<tr><td><b>Full house</b></td><td>Се корт як рутба ва ду корт рутбаи дигар.</td><td>A♠️A♥️A♦️7♣️7♠️</td></tr>
<tr><td><b>Флеш</b></td><td>Панҷ корт як маст.</td><td>J♦️8♦️7♦️3♦️2♦️</td></tr>
<tr><td><b>Стрит</b></td><td>Панҷ корт пайдарпай бо мастҳои гуногун.</td><td>J♣️10♠️9♥️8♥️7♣️</td></tr>
<tr><td><b>Се якхела (сет)</b></td><td>Се корт як рутба.</td><td>K♥️K♦️K♣️7♦️4♣️</td></tr>
<tr><td><b>Ду ҷуфт</b></td><td>Ду ҷуфти гуногун.</td><td>Q♣️Q♠️J♠️J♥️5♦️</td></tr>
<tr><td><b>Ҷуфт</b></td><td>Ду корт як рутба.</td><td>A♦️A♣️8♠️6♥️3♠️</td></tr>
<tr><td><b>Корти баланд</b></td><td>Комбинатсияи дар рӯйхат нест. Ғолиб бо кортҳои баландтар муайян мешавад.</td><td>K♠️J♣️8♥️4♠️2♦️</td></tr>
</tbody>
</table>`,
};

function body(locale) {
  const t = {
    en: {
      titleLine: 'Rules of No-Limit Texas Hold’em (NLH)',
      intro: '<b>No-Limit Hold’em</b> is the most popular and exciting form of poker in the world. Players try to make the strongest five-card hand using two <b>hole cards</b> and five <b>community cards</b> on the table.',
      s1: 'I. Game flow and betting rounds',
      s1p: 'Play moves clockwise. Before cards are dealt, the two players left of the Dealer (Button, BUT) post mandatory bets — the <b>Small Blind</b> (SB) and <b>Big Blind</b> (BB).',
      preflop: '1. Dealing cards (Preflop)',
      preflopP: 'Each player receives two hidden hole cards.',
      preflopLi: '<b>First betting round:</b> starts left of the Big Blind. Players may <b>fold</b>, <b>call</b> (match the BB), or <b>raise</b>.',
      flop: '2. Flop',
      flopP: 'After preflop, the dealer reveals the first <b>three community cards</b>.',
      flopLi: '<b>Second betting round:</b> starts with the Small Blind (or first active player left of the dealer). Players may <b>check</b> or <b>bet</b>.',
      turn: '3. Turn',
      turnP: 'The <b>fourth community card</b> is revealed.',
      turnLi: '<b>Third betting round:</b> players may check, bet, raise, or fold.',
      river: '4. River',
      riverP: 'The <b>fifth and final community card</b> is revealed. Players now see all seven cards and make their best five-card hand.',
      riverLi: '<b>Final betting round.</b>',
      showdown: '5. Showdown',
      showdownP: 'If two or more players remain after the last bet, there is a <b>showdown</b>. Cards are revealed and the strongest hand <b>wins the pot</b>.',
      s2: 'II. Hand rankings (highest to lowest)',
      s2p: 'Winning depends on making the <b>best five-card hand</b> from any five of the seven available cards.',
      exTitle: 'Examples of determining the winner',
      ex1: '<b>Quads vs full house:</b> <b>Quads</b> always beat a full house.',
      ex2: '<b>Flush vs straight:</b> a <b>flush</b> always beats a straight.',
      ex3: '<b>Set vs two pair:</b> a <b>set</b> always beats two pair.',
      s3: 'III. Strategic basics',
      s3p: 'Success in Hold’em depends on consistently applying key strategies:',
      s3o: ['<b>Play aggressively:</b> aggression (bets and raises) lets you control the pot, realize <b>fold equity</b>, and maximize profit with strong hands.', '<b>Play positionally:</b> position matters hugely. On the <b>button</b> you have more information and can make better decisions.', '<b>Read opponents:</b> watch <b>bet sizing</b>, timing, and lines to estimate hand strength.', '<b>Know when to fold:</b> do not be afraid to fold weak hands — it protects your bankroll.', '<b>Manage bankroll:</b> set limits and do not play stakes above your bankroll.'],
      s4: 'IV. Safety and ethics',
      s4p: 'Despite its competitive nature, poker requires ethical behavior:',
      s4u: ['<b>Respect other players:</b> behave properly and follow sportsmanship.', '<b>Fair play:</b> do not use solvers or multi-accounts for unfair advantage.', '<b>Fund safety:</b> choose reliable platforms that protect your money and data.'],
      cta: '♠️ Learn to play Texas Hold’em (NLH) in the NUTS club',
      ctaP1: '<b>The NUTS club on PPPoker</b> is the ideal platform to apply NLH rules and strategy. <b>Dozens of tables are open every day</b> with hundreds of players at all stakes, from micro to high.',
      ctaP2: 'Join today and sharpen your skills against real opponents!',
    },
    uz: {
      titleLine: 'Texas Hold’em (NLH) o‘yin qoidalari',
      intro: '<b>No-Limit Hold’em</b> dunyodagi eng mashhur va qiziqarli poker turi. O‘yinchilar ikkita <b>hole karta</b> va stoldagi beshta <b>umumiy karta</b> yordamida eng kuchli beshta kartali kombinatsiyani tuzishga harakat qiladi.',
      s1: 'I. O‘yin jarayoni va tikish raundlari',
      s1p: 'O‘yin soat miliga bo‘yicha harakatlanadi. Kartalar tarqatilishidan oldin Dilerdan (Button, BUT) chapdagi ikki o‘yinchi majburiy tikish qo‘yadi — <b>Kichik Blind</b> (SB) va <b>Katta Blind</b> (BB).',
      preflop: '1. Kartalar tarqatilishi (Preflop)',
      preflopP: 'Har bir o‘yinchi ikkita yopiq hole karta oladi.',
      preflopLi: '<b>Birinchi tikish raundi:</b> Katta Blinddan chapdagi o‘yinchidan boshlanadi. O‘yinchilar <b>fold</b>, <b>call</b> (BBni tenglashtirish) yoki <b>raise</b> qilishi mumkin.',
      flop: '2. Flop',
      flopP: 'Preflopdan keyin diler birinchi <b>uchta umumiy kartani</b> ochadi.',
      flopLi: '<b>Ikkinchi tikish raundi:</b> Kichik Blinddan (yoki dilerdan chapdagi birinchi faol o‘yinchi) boshlanadi. O‘yinchilar <b>check</b> yoki <b>bet</b> qilishi mumkin.',
      turn: '3. Turn',
      turnP: '<b>To‘rtinchi umumiy karta</b> ochiladi.',
      turnLi: '<b>Uchinchi tikish raundi:</b> o‘yinchilar check, bet, raise yoki fold qilishi mumkin.',
      river: '4. River',
      riverP: '<b>Beshinchi va oxirgi umumiy karta</b> ochiladi. O‘yinchilar endi yetti kartani ko‘radi va eng yaxshi beshta kartali kombinatsiyani tuzadi.',
      riverLi: '<b>Oxirgi tikish raundi.</b>',
      showdown: '5. Showdown',
      showdownP: 'Oxirgi tikishdan keyin ikki yoki undan ko‘p o‘yinchi qolsa, <b>showdown</b> bo‘ladi. Kartalar ochiladi va eng kuchli kombinatsiya <b>bankni oladi</b>.',
      s2: 'II. Kombinatsiyalar (yuqoridan pastga)',
      s2p: 'G‘alaba yetti kartadan istalgan beshtasidan <b>eng yaxshi beshta kartali kombinatsiya</b> tuzishga bog‘liq.',
      exTitle: 'G‘olibni aniqlash misollari',
      ex1: '<b>Kare vs full house:</b> <b>Kare</b> har doim full house-dan kuchli.',
      ex2: '<b>Flush vs straight:</b> <b>Flush</b> har doim straight-dan kuchli.',
      ex3: '<b>Set vs ikki juft:</b> <b>Set</b> har doim ikki juftdan kuchli.',
      s3: 'III. Strategik asoslar',
      s3p: 'Hold’emda muvaffaqiyat asosiy strategiyalarni izchil qo‘llashga bog‘liq:',
      s3o: ['<b>Aggressiv o‘ynang:</b> aggressiya (bet va raise) bankni nazorat qilish, <b>fold equity</b>ni realizatsiya qilish va kuchli qo‘llardan foydani maksimallashtirish imkonini beradi.', '<b>Pozitsion o‘ynang:</b> pozitsiya juda muhim. <b>Button</b>da ko‘proq ma’lumot bor va yaxshiroq qaror qabul qilasiz.', '<b>Raqiblarni o‘qing:</b> <b>bet sizing</b>, timing va chiziqlarga e’tibor bering.', '<b>Fold qilishni biling:</b> zaif qo‘llarni tashlashdan qo‘rqmang — bu bankrollni himoya qiladi.', '<b>Bankrollni boshqaring:</b> limitlar belgilang va bankrollingizdan yuqori stavkalarda o‘ynamang.'],
      s4: 'IV. Xavfsizlik va etika',
      s4p: 'Raqobatbardosh tabiiga qaramay, poker etik xulqni talab qiladi:',
      s4u: ['<b>Boshqa o‘yinchilarga hurmat:</b> munosib xulq va sport ruhini saqlang.', '<b>Fair play:</b> adolatsiz ustunlik uchun solver yoki multi-account ishlatmang.', '<b>Mablag‘ xavfsizligi:</b> pul va ma’lumotlaringizni himoya qiladigan ishonchli platformalarni tanlang.'],
      cta: '♠️ NUTS klubida Texas Hold’em (NLH) o‘ynashni o‘rganing',
      ctaP1: '<b>PPPokerdagi NUTS klubi</b> — NLH qoidalari va strategiyasini amalda qo‘llash uchun ideal platforma. <b>Har kuni o‘nlab stollar ochiq</b>, mikro limitlardan yuqori stavkalargacha yuzlab o‘yinchi.',
      ctaP2: 'Bugun qo‘shiling va haqiqiy raqiblar qarshisida ko‘nikmalaringizni o‘tkiring!',
    },
    kz: {
      titleLine: 'Техас Холдем (NLH) ойын ережелері',
      intro: '<b>No-Limit Hold’em</b> — әлемдегі ең танымал және қызықты покер түрі. Ойыншылар екі <b>hole карта</b> мен үстелдегі бес <b>ортақ карта</b> арқылы ең күшті бес карталық комбинация құруға тырысады.',
      s1: 'I. Ойын процесі және ставка раундтары',
      s1p: 'Ойын сағат тілі бойынша жүреді. Карталар таратылмас бұрын Дилерден (Button, BUT) сол жақтағы екі ойыншы міндетті ставкалар қояды — <b>Кіші Блайнд</b> (SB) және <b>Үлкен Блайнд</b> (BB).',
      preflop: '1. Карталар тарату (Префлоп)',
      preflopP: 'Әр ойыншыға екі жабық hole карта таратылады.',
      preflopLi: '<b>Бірінші ставка раунды:</b> Үлкен Блайндтың сол жағындағы ойыншыдан басталады. Ойыншылар <b>fold</b>, <b>call</b> (BB-ті теңестіру) немесе <b>raise</b> жасай алады.',
      flop: '2. Флоп',
      flopP: 'Префлоптан кейін дилер алғашқы <b>үш ортақ картаны</b> ашады.',
      flopLi: '<b>Екінші ставка раунды:</b> Кіші Блайндтан (немесе дилердің сол жағындағы бірінші белсенді ойыншыдан) басталады. Ойыншылар <b>check</b> немесе <b>bet</b> жасай алады.',
      turn: '3. Терн',
      turnP: '<b>Төртінші ортақ карта</b> ашылады.',
      turnLi: '<b>Үшінші ставка раунды:</b> ойыншылар check, bet, raise немесе fold жасай алады.',
      river: '4. Ривер',
      riverP: '<b>Бесінші және соңғы ортақ карта</b> ашылады. Ойыншылар енді жеті картаны көреді және ең жақсы бес карталық комбинация құрайды.',
      riverLi: '<b>Соңғы ставка раунды.</b>',
      showdown: '5. Шоудаун',
      showdownP: 'Соңғы ставкадан кейін екі немесе одан көп ойыншы қалса, <b>шоудаун</b> болады. Карталар ашылады және ең күшті комбинация <b>банкты алады</b>.',
      s2: 'II. Комбинациялар (жоғарыдан төменге)',
      s2p: 'Жеңіс жеті картаның кез келген бесінен <b>ең жақсы бес карталық комбинация</b> құруға байланысты.',
      exTitle: 'Жеңімпазды анықтау мысалдары',
      ex1: '<b>Каре vs фулл-хаус:</b> <b>Каре</b> әрқашан фулл-хаустан күшті.',
      ex2: '<b>Флеш vs стрит:</b> <b>Флеш</b> әрқашан стриттен күшті.',
      ex3: '<b>Сет vs екі жұп:</b> <b>Сет</b> әрқашан екі жұптан күшті.',
      s3: 'III. Стратегиялық негіздер',
      s3p: 'Холдемдегі табыс негізгі стратегияларды үздіксіз қолдануға байланысты:',
      s3o: ['<b>Агрессив ойнаңыз:</b> агрессия (bet және raise) банкты басқаруға, <b>fold equity</b> іске асыруға және күшті қолдардан пайданы максималдауға мүмкіндік береді.', '<b>Позициялық ойнаңыз:</b> позиция өте маңызды. <b>Баттонда</b> көбірек ақпарат бар және жақсырақ шешім қабылдайсыз.', '<b>Қарсыластарды оқыңыз:</b> <b>bet sizing</b>, timing және сызықтарға назар аударыңыз.', '<b>Fold жасауды біліңіз:</b> әлсіз қолдарды тастаудан қорықпаңыз — бұл банкроллды қорғайды.', '<b>Банкроллды басқарыңыз:</b> лимиттер белгілеңіз және банкролдыңыздан жоғары ставкаларда ойнамаңыз.'],
      s4: 'IV. Қауіпсіздік және этика',
      s4p: 'Бәсекелестік сипатына қарамастан, покер этикалық нормаларды талап етеді:',
      s4u: ['<b>Басқа ойыншыларға құрмет:</b> лайықты мінез және спорттық рух.', '<b>Фэйр-плей:</b> әділетсіз артықшылық үшін solver немесе multi-account пайдаланбаңыз.', '<b>Қаражат қауіпсіздігі:</b> ақша мен деректеріңізді қорғайтын сенімді платформаларды таңдаңыз.'],
      cta: '♠️ NUTS клубында Техас Холдем (NLH) ойнауды үйреніңіз',
      ctaP1: '<b>PPPokerдегі NUTS клубы</b> — NLH ережелері мен стратегиясын практикада қолдануға арналған идеалды платформа. <b>Күн сайын ондаған үстел ашық</b>, микро лимиттерден жоғары ставкаларға дейін жүздеген ойыншы.',
      ctaP2: 'Бүгін қосылыңыз және нақты қарсыластарға қарсы дағдыларыңызды өткізіңіз!',
    },
    hy: {
      titleLine: 'Texas Hold’em (NLH) խաղի կանոններ',
      intro: '<b>No-Limit Hold’em</b>-ը աշխարհի ամենահայտնի և հետաքրքիր պոկերի ձևն է։ Խաղացողները փորձում են կազմել ամենաուժեղ հինգ քարտանոց կոմբինացիա՝ օգտագործելով երկու <b>hole քարտ</b> և սեղանի վրա հինգ <b>համատեղ քարտ</b>։',
      s1: 'I. Խաղի ընթացք և խաղադրույքի ռաունդներ',
      s1p: 'Խաղը շարժվում է ժամացույցի սլաքի ուղղությամբ։ Քարտերը բաժանելուց առաջ Դիլերից (Button, BUT) ձախ նստած երկու խաղացողները դնում են պարտադիր խաղադրույքներ՝ <b>Փոքր Բլայնդ</b> (SB) և <b>Մեծ Բլայնդ</b> (BB)։',
      preflop: '1. Քարտերի բաժանում (Պրեֆլոպ)',
      preflopP: 'Յուրաքանչյուր խաղացող ստանում է երկու փակ hole քարտ։',
      preflopLi: '<b>Առաջին խաղադրույքի ռաունդ.</b> սկսվում է Մեծ Բլայնդի ձախից։ Խաղացողները կարող են <b>fold</b>, <b>call</b> (հավասարեցնել BB-ին) կամ <b>raise</b>։',
      flop: '2. Ֆլոպ',
      flopP: 'Պրեֆլոպից հետո դիլերը բացում է առաջին <b>երեք համատեղ քարտը</b>։',
      flopLi: '<b>Երկրորդ խաղադրույքի ռաունդ.</b> սկսվում է Փոքր Բլայնդից (կամ դիլերի ձախ առաջին ակտիվ խաղացողից)։ Խաղացողները կարող են <b>check</b> կամ <b>bet</b>։',
      turn: '3. Թերն',
      turnP: 'Բացվում է <b>չորրորդ համատեղ քարտը</b>։',
      turnLi: '<b>Երրորդ խաղադրույքի ռաունդ.</b> խաղացողները կարող են check, bet, raise կամ fold։',
      river: '4. Ռիվեր',
      riverP: 'Բացվում է <b>հինգերորդ և վերջին համատեղ քարտը</b>։ Խաղացողները տեսնում են բոլոր յոթ քարտերը և կազմում լավագույն հինգ քարտանոց կոմբինացիան։',
      riverLi: '<b>Վերջին խաղադրույքի ռաունդ.</b>',
      showdown: '5. Շոուդաուն',
      showdownP: 'Եթե վերջին խաղադրույքից հետո մնում են երկու կամ ավելի խաղացող, կատարվում է <b>շոուդաուն</b>։ Քարտերը բացվում են, և ամենաուժեղ կոմբինացիան <b>վերցնում է բանկը</b>։',
      s2: 'II. Կոմբինացիաներ (ավելի ուժեղից դեպի ավելի թույլ)',
      s2p: 'Հաղթանակը կախված է յոթ քարտերից ցանկացած հինգից <b>լավագույն հինգ քարտանոց կոմբինացիա</b> կազմելուց։',
      exTitle: 'Հաղթողի որոշման օրինակներ',
      ex1: '<b>Քառակ vs full house.</b> <b>Քառակը</b> միշտ հաղթում է full house-ին։',
      ex2: '<b>Ֆլեշ vs ստրիթ.</b> <b>Ֆլեշը</b> միշտ հաղթում է ստրիթին։',
      ex3: '<b>Սեթ vs երկու զույգ.</b> <b>Սեթը</b> միշտ հաղթում է երկու զույգին։',
      s3: 'III. Ռազմավարական հիմքեր',
      s3p: 'Հաջողությունը Hold’em-ում կախված է հիմնական ռազմավարությունների հետևողական կիրառումից՝',
      s3o: ['<b>Խաղացեք ագրեսիվ.</b> ագրեսիան (bet և raise) թույլ է տալիս վերահսկել բանկը, իրականացնել <b>fold equity</b> և մաքսիմալացնել շահույթը ուժեղ ձեռքերից։', '<b>Խաղացեք դիրքով.</b> դիրքը հսկայական նշանակություն ունի։ <b>Կոճակի</b> վրա ավելի շատ տեղեկատվություն ունեք և կարող եք ավելի ճիշտ որոշումներ կայացնել։', '<b>Կարդացեք հակառակորդներին.</b> հետևեք <b>bet sizing</b>-ին, ժամանակին և գծերին։', '<b>Իմացեք fold անել.</b> մի վախեցեք թափել թույլ ձեռքերը — դա պաշտպանում է բանկրոլը։', '<b>Կառավարեք բանկրոլը.</b> սահմանեք սահմանափակումներ և մի խաղացեք ձեր բանկրոլից բարձր լիմիտներում։'],
      s4: 'IV. Անվտանգություն և էթիկա',
      s4p: 'Մրցակցային բնույթին անկախ, պոկերը պահանջում է էթիկական վարքագիծ՝',
      s4u: ['<b>Հարգանք մյուս խաղացողներին.</b> վարքը պահեք достойно և հետևեք սպորտային էթիկային։', '<b>Fair play.</b> մի օգտագործեք solver-ներ կամ multi-account անարդար առավելության համար։', '<b>Գումարի անվտանգություն.</b> ընտրեք հուսալի հարթակներ, որոնք պաշտպանում են ձեր գումարը և տվյալները։'],
      cta: '♠️ Սովորեք Texas Hold’em (NLH) խաղալ NUTS ակումբում',
      ctaP1: '<b>NUTS ակումբը PPPoker-ում</b> իդեալական հարթակ է NLH կանոններն ու ռազմավարությունը կիրառելու համար։ <b>Ամեն օր բաց են տասնյակ սեղաններ</b> հարյուրավոր խաղացողներով ցանկացած լիմիտում՝ միկրոյից մինչև բարձր։',
      ctaP2: 'Միացեք այսօր և կատարելագործեք հմտությունները իրական հակառակորդների դեմ!',
    },
    tj: {
      titleLine: 'Қоидаҳои бозии Texas Hold’em (NLH)',
      intro: '<b>No-Limit Hold’em</b> — маъмултарин ва ҷолибтарин намуди покер дар ҷаҳон. Бозигарон кӯшиш мекунанд бо ду <b>hole корт</b> ва панҷ <b>корти умумӣ</b> дар миз қавитарин комбинатсияи панҷ кортиро созанд.',
      s1: 'I. Раванди бозӣ ва даврҳои ставка',
      s1p: 'Бозӣ ба самти соат мечарад. Пеш аз тақсими кортҳо ду бозигари чапи Дилер (Button, BUT) ставкаҳои ҳатмӣ мегузоранд — <b>Блайнди хурд</b> (SB) ва <b>Блайнди калон</b> (BB).',
      preflop: '1. Тақсими кортҳо (Префлоп)',
      preflopP: 'Ба ҳар бозигар ду hole корт пинҳонӣ дода мешавад.',
      preflopLi: '<b>Даври аввали ставка:</b> аз чапи Блайнди калон оғоз мешавад. Бозигарон метавонанд <b>fold</b>, <b>call</b> (баробар кардани BB) ё <b>raise</b> кунанд.',
      flop: '2. Флоп',
      flopP: 'Пас аз префлоп дилер <b>се корти умумии</b> аввалинро мекушояд.',
      flopLi: '<b>Даври дуюми ставка:</b> аз Блайнди хурд (ё аввалин бозигари фаъоли чапи дилер) оғоз мешавад. Бозигарон метавонанд <b>check</b> ё <b>bet</b> кунанд.',
      turn: '3. Терн',
      turnP: '<b>Корти умумии чорум</b> кушода мешавад.',
      turnLi: '<b>Даври сеюми ставка:</b> бозигарон метавонанд check, bet, raise ё fold кунанд.',
      river: '4. Ривер',
      riverP: '<b>Корти умумии панҷум ва охирин</b> кушода мешавад. Бозигарон ҳоло ҳамаи ҳафт кортро мебинанд ва беҳтарин комбинатсияи панҷ кортиро месозанд.',
      riverLi: '<b>Даври охирини ставка.</b>',
      showdown: '5. Шоудаун',
      showdownP: 'Агар пас аз ставкаи охирин ду ё зиёда бозигар боқӣ монанд, <b>шоудаун</b> мегузарад. Кортҳо кушода мешаванд ва комбинатсияи қавитарин <b>банкро мегирад</b>.',
      s2: 'II. Комбинатсияҳо (аз боло ба поён)',
      s2p: 'Ғалаба вобаста аст ба сохтани <b>беҳтарин комбинатсияи панҷ корт</b> аз ҳар панҷи ҳафт корт.',
      exTitle: 'Мисолҳои муайян кардани ғолиб',
      ex1: '<b>Каре vs full house:</b> <b>Каре</b> ҳамеша аз full house қавитар аст.',
      ex2: '<b>Флеш vs стрит:</b> <b>Флеш</b> ҳамеша аз стрит қавитар аст.',
      ex3: '<b>Сет vs ду ҷуфт:</b> <b>Сет</b> ҳамеша аз ду ҷуфт қавитар аст.',
      s3: 'III. Асосҳои стратегӣ',
      s3p: 'Муваффақият дар Hold’em вобаста аст ба татбиқи пайдарпайи стратегияҳои асосӣ:',
      s3o: ['<b>Агрессив бозӣ кунед:</b> агрессия (bet ва raise) ба шумо имкон медиҳад банкро идора кунед, <b>fold equity</b>-ро амалӣ созед ва фоидаи дастҳои қавиро максимал кунед.', '<b>Бо позиция бозӣ кунед:</b> позиция хеле муҳим аст. Дар <b>тугма</b> шумо маълумоти бештар доред ва қарорҳои беҳтар мегиред.', '<b>Рақибонро хонед:</b> ба <b>bet sizing</b>, вақт ва хатҳо диққат диҳед.', '<b>Fold карданро донед:</b> аз партофтани дастҳои заиф натарсед — ин банкроллро ҳимоя мекунад.', '<b>Банкроллро идора кунед:</b> лимитҳо муайян кунед ва дар ставкаҳои болотар аз банкролл бозӣ накунед.'],
      s4: 'IV. Амният ва ахлоқ',
      s4p: 'Аз рӯи табиати рақобатпазир, покер ахлоқи дурустро талаб мекунад:',
      s4u: ['<b>Эҳтиром ба бозигарони дигар:</b> бо ахлоқи варзишӣ рафтор кунед.', '<b>Fair play:</b> барои бартарии нодуруст solver ё multi-account истифода накунед.', '<b>Амнияти маблағ:</b> платформаҳои боэътимодро интихоб кунед, ки пул ва маълумоти шуморо ҳимоя мекунанд.'],
      cta: '♠️ Texas Hold’em (NLH)-ро дар клуби NUTS омӯзед',
      ctaP1: '<b>Клуби NUTS дар PPPoker</b> — платформаи идеалӣ барои татбиқи қоидаҳо ва стратегияи NLH. <b>Ҳар рӯз даҳҳо миз кушода аст</b> бо садҳо бозигар дар ҳар гуна лимит, аз микро то баланд.',
      ctaP2: 'Имрӯз ҳамроҳ шавед ва маҳорати худро дар баробари рақибони воқеӣ такмил диҳед!',
    },
  }[locale];

  return [
    p(`<b>${t.titleLine}</b>`),
    p('Author:&nbsp;<a href="/author-roman-shaposhnikov/"><em>Roman Shaposhnikov</em></a>'),
    p('Date: 12.01.2026'),
    p(t.intro),
    h2(t.s1),
    p(t.s1p),
    h3(t.preflop),
    p(t.preflopP),
    `<ul>\n<li>${t.preflopLi}</li>\n</ul>`,
    h3(t.flop),
    p(t.flopP),
    `<ul>\n<li>${t.flopLi}</li>\n</ul>`,
    h3(t.turn),
    p(t.turnP),
    `<ul>\n<li>${t.turnLi}</li>\n</ul>`,
    h3(t.river),
    p(t.riverP),
    `<ul>\n<li>${t.riverLi}</li>\n</ul>`,
    h3(t.showdown),
    p(t.showdownP),
    h2(t.s2),
    p(t.s2p),
    comboTable[locale],
    h3(t.exTitle),
    `<ul>\n<li>${t.ex1}</li>\n<li>${t.ex2}</li>\n<li>${t.ex3}</li>\n</ul>`,
    h2(t.s3),
    p(t.s3p),
    `<ol>\n${t.s3o.map((x) => `<li>${x}</li>`).join('\n')}\n</ol>`,
    h2(t.s4),
    p(t.s4p),
    `<ul>\n${t.s4u.map((x) => `<li>${x}</li>`).join('\n')}\n</ul>`,
    h2(t.cta),
    p(t.ctaP1),
    p(t.ctaP2),
  ].join('\n');
}

export function write() {
  return writePostTranslation('pravila-igry-v-tehasskij-holdem-nlh', {
    en: {
      title: 'Rules of No-Limit Texas Hold’em (NLH) — Nuts PPPoker',
      description:
        '♠️ Learn to play Texas Hold’em (NLH) in the NUTS club. The NUTS club on PPPoker is the ideal platform to apply NLH rules and strategy, with dozens of tables open every day.',
      bodyHtml: body('en'),
    },
    uz: {
      title: 'Texas Hold’em (NLH) o‘yin qoidalari — Nuts PPPoker',
      description:
        '♠️ NUTS klubida Texas Hold’em (NLH) o‘ynashni o‘rganing. PPPokerdagi NUTS klubi — NLH qoidalari va strategiyasini amalda qo‘llash uchun ideal platforma, har kuni o‘nlab stollar ochiq.',
      bodyHtml: body('uz'),
    },
    kz: {
      title: 'Техас Холдем (NLH) ойын ережелері — Nuts PPPoker',
      description:
        '♠️ NUTS клубында Техас Холдем (NLH) ойнауды үйреніңіз. PPPokerдегі NUTS клубы — NLH ережелері мен стратегиясын практикада қолдануға арналған идеалды платформа, күн сайын ондаған үстел ашық.',
      bodyHtml: body('kz'),
    },
    hy: {
      title: 'Texas Hold’em (NLH) խաղի կանոններ — Nuts PPPoker',
      description:
        '♠️ Սովորեք Texas Hold’em (NLH) խաղալ NUTS ակումբում. NUTS ակումբը PPPoker-ում իդեալական հարթակ է NLH կանոններն ու ռազմավարությունը կիրառելու համար, ամեն օր բաց են տասնյակ սեղաններ։',
      bodyHtml: body('hy'),
    },
    tj: {
      title: 'Қоидаҳои бозии Texas Hold’em (NLH) — Nuts PPPoker',
      description:
        '♠️ Texas Hold’em (NLH)-ро дар клуби NUTS омӯзед. Клуби NUTS дар PPPoker — платформаи идеалӣ барои татбиқи қоидаҳо ва стратегияи NLH, ҳар рӯз даҳҳо миз кушода аст.',
      bodyHtml: body('tj'),
    },
  });
}
