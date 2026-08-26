import { h2, h3, p, writePostTranslation } from '../post-translation-writer.mjs';

const comboTable = {
  en: `<table><tbody>
<tr><td><b>Hand</b></td><td><b>Description</b></td></tr>
<tr><td><b>Royal flush</b></td><td>Five consecutive cards of one suit from Ten to Ace.</td></tr>
<tr><td><b>Straight flush</b></td><td>Five consecutive cards of one suit.</td></tr>
<tr><td><b>Four of a kind</b></td><td>Four cards of the same rank.</td></tr>
<tr><td><b>Full house</b></td><td>Three of one rank and two of another.</td></tr>
<tr><td><b>Flush</b></td><td>Five cards of one suit (not necessarily consecutive).</td></tr>
<tr><td><b>Straight</b></td><td>Five consecutive cards of mixed suits.</td></tr>
<tr><td><b>Three of a kind (set)</b></td><td>Three cards of the same rank.</td></tr>
<tr><td><b>Two pair</b></td><td>Two different pairs.</td></tr>
<tr><td><b>One pair</b></td><td>Two cards of the same rank.</td></tr>
<tr><td><b>High card</b></td><td>No listed combination. Winner decided by highest card.</td></tr>
</tbody></table>`,
  uz: `<table><tbody>
<tr><td><b>Kombinatsiya</b></td><td><b>Tavsif</b></td></tr>
<tr><td><b>Royal flush</b></td><td>Bitta mastdan O‘ndan Tuzgacha ketma-ket beshta karta.</td></tr>
<tr><td><b>Straight flush</b></td><td>Bitta mastdan ketma-ket beshta karta.</td></tr>
<tr><td><b>Kare</b></td><td>Bir darajadan to‘rtta karta.</td></tr>
<tr><td><b>Full house</b></td><td>Bir darajadan uchta va boshqa darajadan ikkita karta.</td></tr>
<tr><td><b>Flush</b></td><td>Bitta mastdan beshta karta (ketma-ket bo‘lishi shart emas).</td></tr>
<tr><td><b>Straight</b></td><td>Turli mastlardan ketma-ket beshta karta.</td></tr>
<tr><td><b>Uchlik (set)</b></td><td>Bir darajadan uchta karta.</td></tr>
<tr><td><b>Ikki juft</b></td><td>Ikki xil juft.</td></tr>
<tr><td><b>Juft</b></td><td>Bir darajadan ikkita karta.</td></tr>
<tr><td><b>Yuqori karta</b></td><td>Ro‘yxatdagi kombinatsiya yo‘q. G‘olib eng yuqori kartaga ko‘ra aniqlanadi.</td></tr>
</tbody></table>`,
  kz: `<table><tbody>
<tr><td><b>Комбинация</b></td><td><b>Сипаттама</b></td></tr>
<tr><td><b>Роял-флеш</b></td><td>Бір мастан Оннан Тұзға дейін ретті бес карта.</td></tr>
<tr><td><b>Стрит-флеш</b></td><td>Бір мастан ретті бес карта.</td></tr>
<tr><td><b>Каре</b></td><td>Бір дәрежеден төрт карта.</td></tr>
<tr><td><b>Фулл-хаус</b></td><td>Бір дәрежеден үш және басқасынан екі карта.</td></tr>
<tr><td><b>Флеш</b></td><td>Бір мастан бес карта (ретті болуы міндетті емес).</td></tr>
<tr><td><b>Стрит</b></td><td>Әртүрлі мастардан ретті бес карта.</td></tr>
<tr><td><b>Үшлік (сет)</b></td><td>Бір дәрежеден үш карта.</td></tr>
<tr><td><b>Екі жұп</b></td><td>Екі әртүрлі жұп.</td></tr>
<tr><td><b>Жұп</b></td><td>Бір дәрежеден екі карта.</td></tr>
<tr><td><b>Жоғары карта</b></td><td>Тізімдегі комбинация жоқ. Жеңімпаз ең жоғары карта бойынша анықталады.</td></tr>
</tbody></table>`,
  hy: `<table><tbody>
<tr><td><b>Կոմբինացիա</b></td><td><b>Նկարագրություն</b></td></tr>
<tr><td><b>Royal flush</b></td><td>Մեկ մաստի հինգ հաջորդական քարտ Տասից մինչև Տուզ։</td></tr>
<tr><td><b>Straight flush</b></td><td>Մեկ մաստի հինգ հաջորդական քարտ։</td></tr>
<tr><td><b>Քառակ</b></td><td>Նույն արժեքի չորս քարտ։</td></tr>
<tr><td><b>Full house</b></td><td>Մեկ արժեքի երեք և մյուսի երկու քարտ։</td></tr>
<tr><td><b>Ֆլեշ</b></td><td>Մեկ մաստի հինգ քարտ (հաջորդական լինելը պարտադիր չէ)։</td></tr>
<tr><td><b>Ստրիթ</b></td><td>Տարբեր մաստերի հինգ հաջորդական քարտ։</td></tr>
<tr><td><b>Երեքական (սեթ)</b></td><td>Նույն արժեքի երեք քարտ։</td></tr>
<tr><td><b>Երկու զույգ</b></td><td>Երկու տարբեր զույգ։</td></tr>
<tr><td><b>Զույգ</b></td><td>Նույն արժեքի երկու քարտ։</td></tr>
<tr><td><b>Բարձր քարտ</b></td><td>Ցուցակված կոմբինացիա չկա։ Հաղթողը որոշվում է ամենաբարձր քարտով։</td></tr>
</tbody></table>`,
  tj: `<table><tbody>
<tr><td><b>Комбинатсия</b></td><td><b>Тавсиф</b></td></tr>
<tr><td><b>Royal flush</b></td><td>Панҷ корт пайдарпай аз Даҳ то Туз як маст.</td></tr>
<tr><td><b>Straight flush</b></td><td>Панҷ корт пайдарпай як маст.</td></tr>
<tr><td><b>Каре</b></td><td>Чор корт як рутба.</td></tr>
<tr><td><b>Full house</b></td><td>Се корт як рутба ва ду корт рутбаи дигар.</td></tr>
<tr><td><b>Флеш</b></td><td>Панҷ корт як маст (пайдарпай будан лозим нест).</td></tr>
<tr><td><b>Стрит</b></td><td>Панҷ корт пайдарпай бо мастҳои гуногун.</td></tr>
<tr><td><b>Се якхела (сет)</b></td><td>Се корт як рутба.</td></tr>
<tr><td><b>Ду ҷуфт</b></td><td>Ду ҷуфти гуногун.</td></tr>
<tr><td><b>Ҷуфт</b></td><td>Ду корт як рутба.</td></tr>
<tr><td><b>Корти баланд</b></td><td>Комбинатсияи дар рӯйхат нест. Ғолиб бо кортҳои баландтар муайян мешавад.</td></tr>
</tbody></table>`,
};

const actionTable = {
  en: `<table><tbody>
<tr><td><b>Action</b></td><td><b>Name</b></td><td><b>Description</b></td></tr>
<tr><td><b>Fold</b></td><td><b>Fold</b></td><td>End participation in the current hand. Key to minimizing losses.</td></tr>
<tr><td><b>Check</b></td><td><b>Check</b></td><td>Pass action to the next player when no bet was made before you.</td></tr>
<tr><td><b>Call</b></td><td><b>Call</b></td><td>Match the current bet to stay in the hand.</td></tr>
<tr><td><b>Raise</b></td><td><b>Raise</b></td><td>Increase the previous bet. The most <b>aggressive</b> tool.</td></tr>
</tbody></table>`,
  uz: `<table><tbody>
<tr><td><b>Harakat</b></td><td><b>Nomi</b></td><td><b>Tavsif</b></td></tr>
<tr><td><b>Tashlash</b></td><td><b>Fold</b></td><td>Joriy qo‘lda ishtirokni tugatish. Yo‘qotishlarni kamaytirish kaliti.</td></tr>
<tr><td><b>O‘tkazib yuborish</b></td><td><b>Check</b></td><td>Sizdan oldin tikish bo‘lmagan bo‘lsa, navbatni keyingi o‘yinchiga berish.</td></tr>
<tr><td><b>Call</b></td><td><b>Call</b></td><td>O‘yinda qolish uchun joriy tikishni tenglashtirish.</td></tr>
<tr><td><b>Oshirish</b></td><td><b>Raise</b></td><td>Oldingi tikishni oshirish. Eng <b>agressiv</b> vosita.</td></tr>
</tbody></table>`,
  kz: `<table><tbody>
<tr><td><b>Әрекет</b></td><td><b>Атауы</b></td><td><b>Сипаттама</b></td></tr>
<tr><td><b>Тастау</b></td><td><b>Fold</b></td><td>Ағымдағы қолда қатысуды аяқтау. Шығындарды азайту кілті.</td></tr>
<tr><td><b>Өткізу</b></td><td><b>Check</b></td><td>Сізге дейін ставка болмаса, кезекті келесі ойыншыға беру.</td></tr>
<tr><td><b>Call</b></td><td><b>Call</b></td><td>Ойында қалу үшін ағымдағы ставканы теңестіру.</td></tr>
<tr><td><b>Көтеру</b></td><td><b>Raise</b></td><td>Алдыңғы ставканы арттыру. Ең <b>агрессивті</b> құрал.</td></tr>
</tbody></table>`,
  hy: `<table><tbody>
<tr><td><b>Գործողություն</b></td><td><b>Անուն</b></td><td><b>Նկարագրություն</b></td></tr>
<tr><td><b>Թափել</b></td><td><b>Fold</b></td><td>Ընթացիկ ձեռքում մասնակցությունը ավարտել։ Կորուստները նվազեցնելու բանալին։</td></tr>
<tr><td><b>Check</b></td><td><b>Check</b></td><td>Հանձնել հերթը հաջորդ խաղացողին, եթե մինչև ձեզ խաղադրույք չի եղել։</td></tr>
<tr><td><b>Call</b></td><td><b>Call</b></td><td>Հավասարեցնել ընթացիկ խաղադրույքը՝ խաղում մնալու համար։</td></tr>
<tr><td><b>Raise</b></td><td><b>Raise</b></td><td>Նախորդ խաղադրույքը մեծացնել։ Ամենա<b>ագրեսիվ</b> գործիքը։</td></tr>
</tbody></table>`,
  tj: `<table><tbody>
<tr><td><b>Амал</b></td><td><b>Ном</b></td><td><b>Тавсиф</b></td></tr>
<tr><td><b>Партофтан</b></td><td><b>Fold</b></td><td>Иштирокро дар дасти ҷорӣ анҷом додан. Калиди кам кардани талафот.</td></tr>
<tr><td><b>Гузаронидан</b></td><td><b>Check</b></td><td>Навбатро ба бозигари навбатӣ додан, агар пеш аз шумо ставка набошад.</td></tr>
<tr><td><b>Call</b></td><td><b>Call</b></td><td>Баробар кардани ставкаи ҷорӣ барои дар даст мондан.</td></tr>
<tr><td><b>Баланд бардоштан</b></td><td><b>Raise</b></td><td>Зиёд кардани ставкаи қаблӣ. <b>Агрессивтарин</b> асбоб.</td></tr>
</tbody></table>`,
};

function body(locale) {
  const t = {
    en: {
      h1: 'Texas Hold’em Rules: From Robstown Saloons to the World’s Main Game',
      intro: 'Texas Hold’em (No-Limit Hold’em, NLH) is the most popular poker variant in the world and arguably the most popular card game overall. Its appeal comes from simple rules combined with incredible strategic depth.',
      intro2: 'In NLH each player tries to make the <b>strongest five-card hand</b> using two <b>hole cards</b> and/or five <b>community cards</b> on the table.',
      s1: 'Game flow and betting rounds',
      s1p: 'Play moves clockwise using a standard 52-card deck. Two to ten players can sit at the table.',
      h31: '1. Mandatory bets',
      h31p: 'Before cards are dealt, two players post mandatory bets to form the initial pot:',
      h31u: ['<b>Small Blind (SB):</b> the player left of the dealer (button) posts the smaller amount.', '<b>Big Blind (BB):</b> the next player posts the larger amount, usually double the SB. (With only two players, the dealer always posts the big blind.)'],
      h32: '2. Dealing cards (Preflop)',
      h32p: 'Each player receives two <b>hidden</b> hole cards. The first betting round begins:',
      h32u: ['<b>Betting starts:</b> with the player left of the big blind.', '<b>Actions:</b> players may <b>fold</b>, <b>call</b> (match the BB), or <b>raise</b>.'],
      h33: '3. Flop (three community cards)',
      h33p: 'After all remaining players match preflop bets, the dealer reveals the first <b>three community cards</b>.',
      h33u: ['<b>Second betting round:</b> starts with the first active player left of the dealer. Players may <b>check</b>, <b>bet</b>, <b>call</b>, <b>raise</b>, or <b>fold</b>.'],
      h34: '4. Turn (fourth card)',
      h34p: 'The <b>fourth community card</b> is revealed.',
      h34u: ['<b>Third betting round:</b> players may check, bet, raise, or fold.'],
      h35: '5. River (fifth card)',
      h35p: 'The <b>fifth and final community card</b> is revealed. Players now have all seven cards for their best combination.',
      h35u: ['<b>Final betting round.</b>'],
      h36: '6. Showdown',
      h36p: 'If two or more players remain, they reveal cards and make five-card hands. The strongest combination <b>wins the pot</b>.',
      s2: 'Hand rankings (strongest to weakest)',
      s2p: 'Winning depends on making the best five-card hand from any five of the seven available cards.',
      s3: 'Key actions and terms (beginner glossary)',
      s3p: 'In NLH a player always has a limited set of actions on their turn:',
      s4: 'A little history: why is NLH so popular?',
      s4p1: 'Texas Hold’em, originally called simply “Hold’em,” was born in <b>Robstown, Texas</b>, in the early 1900s.',
      s4o: ['<b>Strategic depth:</b> the game spread quickly because it offered <b>four betting rounds</b> instead of two (as in draw poker). That made Hold’em a “thinking man’s game” and attracted players who valued skill over luck.', '<b>Move to Las Vegas:</b> in 1963 poker legends including Doyle Brunson brought the game to Vegas.', '<b>The grand tournament:</b> the turning point came when the main event of the annual professional tournament (future <b>World Series of Poker</b>) was run in <b>No-Limit Texas Hold’em</b>. The no-limit format allowed all-in bets at any moment, raising drama and psychological tension — perfect for television.'],
      s4p2: 'Recognition of Texas Hold’em as a <b>game of skill</b>, not mere chance, in 1988 finally legitimized it as the world’s leading intellectual card contest.',
      cta: '♠️ Where to sharpen your skills?',
      ctaP1: 'Texas Hold’em requires constant practice, discipline, and analysis.',
      ctaP2: 'Join <b>NUTS</b> on <b>PPPoker</b> — start playing online, refine preflop strategy, and apply everything you have learned against real opponents today!',
    },
    uz: {
      h1: 'Texas Hold’em qoidalari: Robstown salonlaridan dunyoning asosiy o‘yinigacha',
      intro: 'Texas Hold’em (No-Limit Hold’em, NLH) — dunyodagi eng mashhur poker turi va, aslida, eng mashhur kartali o‘yin. Uning mashhurligi oddiy qoidalar va ajoyib strategik chuqurlikning uyg‘unligidan keladi.',
      intro2: 'NLHda har bir o‘yinchi ikkita <b>hole karta</b> va/yoki stoldagi beshta <b>umumiy karta</b> yordamida <b>eng kuchli beshta kartali kombinatsiya</b> tuzishga harakat qiladi.',
      s1: 'O‘yin jarayoni va tikish raundlari',
      s1p: 'O‘yin soat miliga bo‘yicha, standart 52 kartali kolodadan o‘ynaladi. Stolda ikkitadan o‘n kishigacha o‘ynashi mumkin.',
      h31: '1. Majburiy tikishlar',
      h31p: 'Kartalar tarqatilishidan oldin ikki o‘yinchi boshlang‘ich bankni shakllantirish uchun majburiy tikish qo‘yadi:',
      h31u: ['<b>Kichik Blind (SB):</b> dilerdan (button) chapdagi o‘yinchi kichikroq summani qo‘yadi.', '<b>Katta Blind (BB):</b> keyingi o‘yinchi kattaroq summani qo‘yadi, odatda SBning ikki baravari. (Faqat ikki kishi bo‘lsa, katta blindni doim diler qo‘yadi.)'],
      h32: '2. Kartalar tarqatilishi (Preflop)',
      h32p: 'Har bir o‘yinchi ikkita <b>yashirin</b> hole karta oladi. Birinchi tikish raundi boshlanadi:',
      h32u: ['<b>Savdo boshlanishi:</b> katta blinddan chapdagi o‘yinchi.', '<b>Harakatlar:</b> o‘yinchilar <b>fold</b>, <b>call</b> (BBni tenglashtirish) yoki <b>raise</b> qilishi mumkin.'],
      h33: '3. Flop (uchta umumiy karta)',
      h33p: 'Preflopda qolgan barcha o‘yinchilar tikishlarni tenglashtirgach, diler birinchi <b>uchta umumiy kartani</b> ochadi.',
      h33u: ['<b>Ikkinchi tikish raundi:</b> dilerdan chapdagi birinchi faol o‘yinchi bilan boshlanadi. O‘yinchilar <b>check</b>, <b>bet</b>, <b>call</b>, <b>raise</b> yoki <b>fold</b> qilishi mumkin.'],
      h34: '4. Turn (to‘rtinchi karta)',
      h34p: '<b>To‘rtinchi umumiy karta</b> ochiladi.',
      h34u: ['<b>Uchinchi tikish raundi:</b> o‘yinchilar check, bet, raise yoki fold qilishi mumkin.'],
      h35: '5. River (beshinchi karta)',
      h35p: '<b>Beshinchi va oxirgi umumiy karta</b> ochiladi. O‘yinchilar endi eng yaxshi kombinatsiya uchun yetti kartaga ega.',
      h35u: ['<b>Oxirgi tikish raundi.</b>'],
      h36: '6. Showdown',
      h36p: 'Agar ikki yoki undan ko‘p o‘yinchi qolsa, kartalar ochiladi va beshta kartali kombinatsiyalar tuziladi. Eng kuchli kombinatsiya <b>bankni oladi</b>.',
      s2: 'Kombinatsiyalar (kuchlidan zaifgacha)',
      s2p: 'G‘alaba yetti kartadan istalgan beshtasidan eng yaxshi beshta kartali kombinatsiya tuzishga bog‘liq.',
      s3: 'Asosiy harakatlar va atamalar (yangi boshlovchilar lug‘ati)',
      s3p: 'NLHda o‘yinchi navbatida har doim cheklangan harakatlar to‘plamiga ega:',
      s4: 'Bir oz tarix: nima uchun NLH shunchalik mashhur?',
      s4p1: 'Texas Hold’em, dastlab shunchaki “Hold’em” deb atalgan, 1900-yillarning boshida <b>Robstown, Texas</b> shahrida paydo bo‘lgan.',
      s4o: ['<b>Strategik chuqurlik:</b> o‘yin tez tarqaldi, chunki u Drow pokerga qaraganda <b>to‘rtta tikish raundi</b> taklif qilardi. Bu Hold’emni “o‘ylaydigan odam o‘yini” qildi va omaddan ko‘ra mahoratni qadrlaganlarni jalb qildi.', '<b>Las-Vegasga ko‘chish:</b> 1963-yilda Doyl Brunson kabi poker afsonalari o‘yinni Vegaga olib kelishdi.', '<b>Buyuk turnir:</b> burilish nuqtasi yillik professional turnirning (kelajakdagi <b>World Series of Poker</b>) asosiy voqeasi <b>No-Limit Texas Hold’em</b> formatida o‘tkazilganda keldi. No-limit format istalgan paytda all-in qilishga imkon berdi, dramani va psixologik taranglikni oshirdi — televideniye uchun ideal.'],
      s4p2: '1988-yilda Texas Hold’emni oddiy tasodif emas, balki <b>mahorat o‘yini</b> deb tan olish uni dunyodagi asosiy intellektual kartali musobaqaga aylantirdi.',
      cta: '♠️ Mahoratingizni qayerda o‘tkazish mumkin?',
      ctaP1: 'Texas Hold’em doimiy amaliyot, intizom va tahlilni talab qiladi.',
      ctaP2: '<b>PPPoker</b>dagi <b>NUTS</b> klubiga qo‘shiling — onlayn o‘ynashni boshlang, preflop strategiyasini mukammallashtiring va o‘rgangan hamma narsangizni bugun haqiqiy raqiblar qarshisida qo‘llang!',
    },
    kz: {
      h1: 'Техас Холдем ережелері: Робстаун салондарынан әлемнің негізгі ойынына',
      intro: 'Техас Холдем (No-Limit Hold’em, NLH) — әлемдегі ең танымал покер түрі және, іс жүзінде, ең танымал карта ойыны. Оның танымалдығы қарапайым ережелер мен керемет стратегиялық тереңдіктің үйлесімінен келеді.',
      intro2: 'NLH-да әр ойыншы екі <b>hole карта</b> және/немесе үстелдегі бес <b>ортақ карта</b> арқылы <b>ең күшті бес карталық комбинация</b> құруға тырысады.',
      s1: 'Ойын процесі және ставка раундтары',
      s1p: 'Ойын сағат тілі бойынша, стандартты 52 карталық колодамен жүреді. Үстелде екіден он ойыншыға дейін ойнай алады.',
      h31: '1. Міндетті ставкалар',
      h31p: 'Карталар таратылмас бұрын екі ойыншы бастапқы банкті қалыптастыру үшін міндетті ставкалар қояды:',
      h31u: ['<b>Кіші Блайнд (SB):</b> дилерден (баттон) сол жақтағы ойыншы кіші соманы қояды.', '<b>Үлкен Блайнд (BB):</b> келесі ойыншы үлкен соманы қояды, әдетте SB-дің екі есесіне. (Екі адам ғана болса, үлкен блайндты әрқашан дилер қояды.)'],
      h32: '2. Карталар тарату (Префлоп)',
      h32p: 'Әр ойыншыға екі <b>жабық</b> hole карта таратылады. Бірінші ставка раунды басталады:',
      h32u: ['<b>Сауда басталуы:</b> үлкен блайндтың сол жағындағы ойыншы.', '<b>Әрекеттер:</b> ойыншылар <b>fold</b>, <b>call</b> (BB-ті теңестіру) немесе <b>raise</b> жасай алады.'],
      h33: '3. Флоп (үш ортақ карта)',
      h33p: 'Префлопта қалған барлық ойыншылар ставкаларды теңестіргеннен кейін дилер алғашқы <b>үш ортақ картаны</b> ашады.',
      h33u: ['<b>Екінші ставка раунды:</b> дилердің сол жағындағы бірінші белсенді ойыншыдан басталады. Ойыншылар <b>check</b>, <b>bet</b>, <b>call</b>, <b>raise</b> немесе <b>fold</b> жасай алады.'],
      h34: '4. Терн (төртінші карта)',
      h34p: '<b>Төртінші ортақ карта</b> ашылады.',
      h34u: ['<b>Үшінші ставка раунды:</b> ойыншылар check, bet, raise немесе fold жасай алады.'],
      h35: '5. Ривер (бесінші карта)',
      h35p: '<b>Бесінші және соңғы ортақ карта</b> ашылады. Ойыншылар енді ең жақсы комбинация үшін жеті картасы бар.',
      h35u: ['<b>Соңғы ставка раунды.</b>'],
      h36: '6. Шоудаун',
      h36p: 'Екі немесе одан көп ойыншы қалса, карталар ашылады және бес карталық комбинациялар құрылады. Ең күшті комбинация <b>банкты алады</b>.',
      s2: 'Комбинациялар (күштірекінен әлсізге қарай)',
      s2p: 'Жеңіс жеті картаның кез келген бесінен ең жақсы бес карталық комбинация құруға байланысты.',
      s3: 'Негізгі әрекеттер мен терминдер (жаңадан бастаушылар сөздігі)',
      s3p: 'NLH-да ойыншы кезегінде әрқашан шектеулі әрекеттер жиынтығына ие:',
      s4: 'Сәл тарих: неге NLH соншалықты танымал?',
      s4p1: 'Техас Холдем, бастапқыда жай ғана «Холдем» деп аталған, 1900 жылдардың басында <b>Робстаун, Техас</b> қаласында пайда болды.',
      s4o: ['<b>Стратегиялық тереңдік:</b> ойын тез тарады, өйткені ол Дро-покерге қарағанда <b>төрт ставка раундын</b> ұсынды. Бұл Холдемді «ойлайтын адамның ойыны» етті және бақыттан гөра шеберлікті бағалайтындарды тартып алды.', '<b>Лас-Вегасқа көшу:</b> 1963 жылы Дойл Брансон сияқты покер аңыздары ойынды Вегасқа әкелді.', '<b>Ұлы турнир:</b> бұрылыс нүктесі жыл сайынғы кәсіби турнирдің (болашақ <b>World Series of Poker</b>) негізгі оқиғасы <b>No-Limit Texas Hold’em</b> форматында өткізілгенде келді. No-limit формат кез келген сәтте all-in жасауға мүмкіндік берді, драманы және психологиялық кернеуді арттырды — теледидар үшін тамаша.'],
      s4p2: '1988 жылы Техас Холдемді жай ғана сәт емес, <b>шеберлік ойыны</b> деп мойындау оны әлемдегі негізгі интеллектуалды карта жарысына айналдырды.',
      cta: '♠️ Шеберлікті қайда өткізу керек?',
      ctaP1: 'Техас Холдем үздіксіз практика, тәртіп пен талдауды талап етеді.',
      ctaP2: '<b>PPPoker</b>дегі <b>NUTS</b> клубына қосылыңыз — онлайн ойнауды бастаңыз, префлоп стратегиясын жетілдіріңіз және бүгін нақты қарсыластарға қарсы үйренгендеріңіздің бәрін қолданыңыз!',
    },
    hy: {
      h1: 'Texas Hold’em կանոններ. Ռոբսթաունի սալոններից մինչև աշխարհի գլխավոր խաղ',
      intro: 'Texas Hold’em (No-Limit Hold’em, NLH)-ը աշխարհի ամենահայտնի պոկերի ձևն է և, իսկապես, ամենահայտնի քարտային խաղը։ Նրա հայտնիությունը պարզ կանոնների և ռազմավարական անհավանական խորության եզակի համադրությունից է գալիս։',
      intro2: 'NLH-ում յուրաքանչյուր խաղացող փորձում է կազմել <b>ամենաուժեղ հինգ քարտանոց կոմբինացիա</b>՝ օգտագործելով երկու <b>hole քարտ</b> և/կամ սեղանի վրա հինգ <b>համատեղ քարտ</b>։',
      s1: 'Խաղի ընթացք և խաղադրույքի ռաունդներ',
      s1p: 'Խաղը շարժվում է ժամացույցի սլաքի ուղղությամբ՝ ստանդարտ 52 քարտանոցով։ Սեղանի շուրջ կարող են խաղալ երկից տասը մարդ։',
      h31: '1. Պարտադիր խաղադրույքներ',
      h31p: 'Քարտերը բաժանելուց առաջ երկու խաղացողներ դնում են պարտադիր խաղադրույքներ՝ սկզբնական բանկ ձևավորելու համար՝',
      h31u: ['<b>Փոքր Բլայնդ (SB).</b> դիլերից (կոճակ) ձախ նստած խաղացողը դնում է փոքր գումար։', '<b>Մեծ Բլայնդ (BB).</b> հաջորդ խաղացողը դնում է մեծ գումար, սովորաբար SB-ի կրկնակի։ (Երկու խաղացողի դեպքում մեծ բլայնդը միշտ դնում է դիլերը.)'],
      h32: '2. Քարտերի բաժանում (Պրեֆլոպ)',
      h32p: 'Յուրաքանչյուր խաղացող ստանում է երկու <b>փակ</b> hole քարտ։ Սկսվում է առաջին խաղադրույքի ռաունդը՝',
      h32u: ['<b>Առևտրի սկիզբ.</b> մեծ բլայնդի ձախից խաղացողը։', '<b>Գործողություններ.</b> խաղացողները կարող են <b>fold</b>, <b>call</b> (հավասարեցնել BB-ին) կամ <b>raise</b>։'],
      h33: '3. Ֆլոպ (երեք համատեղ քարտ)',
      h33p: 'Պրեֆլոպում մնացած բոլոր խաղացողները հավասարեցնելուց հետո դիլերը բացում է առաջին <b>երեք համատեղ քարտը</b>։',
      h33u: ['<b>Երկրորդ խաղադրույքի ռաունդ.</b> սկսվում է դիլերի ձախ առաջին ակտիվ խաղացողից։ Խաղացողները կարող են <b>check</b>, <b>bet</b>, <b>call</b>, <b>raise</b> կամ <b>fold</b>։'],
      h34: '4. Թերն (չորրորդ քարտ)',
      h34p: 'Բացվում է <b>չորրորդ համատեղ քարտը</b>։',
      h34u: ['<b>Երրորդ խաղադրույքի ռաունդ.</b> խաղացողները կարող են check, bet, raise կամ fold։'],
      h35: '5. Ռիվեր (հինգերորդ քարտ)',
      h35p: 'Բացվում է <b>հինգերորդ և վերջին համատեղ քարտը</b>։ Խաղացողները այժմ ունեն բոլոր յոթ քարտերը լավագույն կոմբինացիայի համար։',
      h35u: ['<b>Վերջին խաղադրույքի ռաունդ.</b>'],
      h36: '6. Շոուդաուն',
      h36p: 'Եթե մնում են երկու կամ ավելի խաղացող, նրանք բացում են քարտերը և կազմում հինգ քարտանոց կոմբինացիաներ։ Ամենաուժեղ կոմբինացիան <b>վերցնում է բանկը</b>։',
      s2: 'Կոմբինացիաներ (ուժեղից թույլ)',
      s2p: 'Հաղթանակը կախված է յոթ քարտերից ցանկացած հինգից լավագույն հինգ քարտանոց կոմբինացիա կազմելուց։',
      s3: 'Հիմնական գործողություններ և տերմիններ (սկսնակների բառարան)',
      s3p: 'NLH-ում խաղացողը իր հերթին միշտ ունի սահմանափակ գործողությունների հավաքածու՝',
      s4: 'Մի փոքր պատմություն. ինչու՞ NLH-ն այդքան հայտնի է',
      s4p1: 'Texas Hold’em-ը, սկզբում պարզապես «Hold’em» կոչված, ծնվել է <b>Ռոբսթաուն, Տեխաս</b> քաղաքում 1900-ականների սկզբին։',
      s4o: ['<b>Ռազմավարական խորություն.</b> խաղը արագ տարածվեց, քանի որ առաջարկում էր <b>չորս խաղադրույքի ռաունդ</b> երկուի փոխարեն (ինչպես Draw Poker-ում)։ Դա Hold’em-ը դարձրեց «մտածող մարդու խաղ» և գրավեց նրանց, ովքեր գնահատում էին վարպետությունը, ոչ թե հաջողությունը։', '<b>Տեղափոխություն Լաս Վեգաս.</b> 1963 թվականին Դոյլ Բրանսոնը և այլ պոկերի լեգենդներ խաղը բերեցին Վեգաս։', '<b>Մեծ մրցաշար.</b> շրջադարձային պահը եկավ, երբ տարեկան պրոֆեսիոնալ մրցաշարի (ապագա <b>World Series of Poker</b>) գլխավոր իրադարձությունը անցկացվեց <b>No-Limit Texas Hold’em</b> ձևաչափով։ No-limit ձևաչափը թույլ էր տալիս ցանկացած պահի all-in, ավելացնելով դրամատիզմ և հոգեբանական լարվածություն՝ հիանալի հեռուստատեսության համար։'],
      s4p2: '1988 թվականին Texas Hold’em-ը որպես <b>վարպետության խաղ</b>, ոչ թե պարզապես հաջողության, ճանաչումը վերջնականապես օրինականացրեց այն որպես աշխարհի գլխավոր ինտելեկտուալ քարտային մրցակցություն։',
      cta: '♠️ Որտե՞ղ կատարելագործել վարպետությունը',
      ctaP1: 'Texas Hold’em-ը պահանջում է մշտական պրակտիկա, կարգապահություն և վերլուծություն։',
      ctaP2: 'Միացեք <b>NUTS</b> ակումբին <b>PPPoker</b>-ում — սկսեք խաղալ օնլայն, կատարելագործեք պրեֆլոպ ռազմավարությունը և կիրառեք բոլոր ձեր յուրացրած կանոններն ու տերմինները իրական հակառակորդների դեմ արդեն այսօր!',
    },
    tj: {
      h1: 'Қоидаҳои Texas Hold’em: аз салонҳои Робстаун то бозии асосии ҷаҳон',
      intro: 'Texas Hold’em (No-Limit Hold’em, NLH) — маъмултарин намуди покер дар ҷаҳон ва, дар асл, маъмултарин бозии корт. Маъмулияти он аз якҷоягии қоидаҳои содда ва чуқурии стратегии беҳамто меояд.',
      intro2: 'Дар NLH ҳар бозигар кӯшиш мекунад <b>қавитарин комбинатсияи панҷ корт</b> созад, бо истифодаи ду <b>корти hole</b> ва/ё панҷ <b>корти умумӣ</b> дар миз.',
      s1: 'Раванди бозӣ ва даврҳои ставка',
      s1p: 'Бозӣ ба самти соат мечарад, бо колодаи стандартии 52 корт. Дар миз аз ду то даҳ нафар бозӣ мекунанд.',
      h31: '1. Ставкаҳои ҳатмӣ',
      h31p: 'Пеш аз тақсими кортҳо ду бозигар ставкаҳои ҳатмӣ мегузоранд, то банки ибтидоӣ ташаккул ёбад:',
      h31u: ['<b>Блайнди хурд (SB):</b> бозигари чапи дилер (тугма) маблағи хурдтарро мегузорад.', '<b>Блайнди калон (BB):</b> бозигари навбатӣ маблағи калонтарро мегузорад, одатан ду баробари SB. (Агар танҳо ду нафар бошанд, блайнди калонро ҳамеша дилер мегузорад.)'],
      h32: '2. Тақсими кортҳо (Префлоп)',
      h32p: 'Ба ҳар бозигар ду корти <b>пинҳонӣ</b> hole дода мешавад. Даври аввали ставка оғоз мешавад:',
      h32u: ['<b>Оғози савдо:</b> аз чапи блайнди калон.', '<b>Амалҳо:</b> бозигарон метавонанд <b>fold</b>, <b>call</b> (баробар кардани BB) ё <b>raise</b> кунанд.'],
      h33: '3. Флоп (се корти умумӣ)',
      h33p: 'Пас аз он ки ҳамаи бозигарони боқимонда дар префлоп ставкаро баробар мекунанд, дилер <b>се корти умумии</b> аввалинро мекушояд.',
      h33u: ['<b>Даври дуюми ставка:</b> аз аввалин бозигари фаъоли чапи дилер оғоз мешавад. Бозигарон метавонанд <b>check</b>, <b>bet</b>, <b>call</b>, <b>raise</b> ё <b>fold</b> кунанд.'],
      h34: '4. Терн (корти чорум)',
      h34p: '<b>Корти умумии чорум</b> кушода мешавад.',
      h34u: ['<b>Даври сеюми ставка:</b> бозигарон метавонанд check, bet, raise ё fold кунанд.'],
      h35: '5. Ривер (корти панҷум)',
      h35p: '<b>Корти умумии панҷум ва охирин</b> кушода мешавад. Бозигарон ҳоло ҳамаи ҳафт кортро барои беҳтарин комбинатсия доранд.',
      h35u: ['<b>Даври охирини ставка.</b>'],
      h36: '6. Шоудаун',
      h36p: 'Агар ду ё зиёда бозигар боқӣ монанд, онҳо кортҳоро мекушоянд ва комбинатсияи панҷ кортиро месозанд. Комбинатсияи қавитарин <b>банкро мегирад</b>.',
      s2: 'Комбинатсияҳо (аз қавитарин то заифтар)',
      s2p: 'Ғалаба вобаста аст ба сохтани беҳтарин комбинатсияи панҷ корт аз ҳар панҷи ҳафт корт.',
      s3: 'Амалҳо ва терминҳои асосӣ (луғати оғозкунанда)',
      s3p: 'Дар NLH бозигар дар навбати худ ҳамеша маҷмуи маҳдуди амалҳо дорад:',
      s4: 'Каме таърих: чаро NLH ин қадар маъмул аст?',
      s4p1: 'Texas Hold’em, дар аввал танҳо «Hold’em» номида мешуд, дар ибтидои соли 1900 дар <b>Робстаун, Техас</b> пайдо шуд.',
      s4o: ['<b>Чуқурии стратегӣ:</b> бозӣ зуд маъмул шуд, зеро <b>чор даври ставка</b> пешниҳод мекард, на ду (чун дар Draw Poker). Ин Hold’em-ро «бозии одамони фикркунанда» гардонд ва касонеро, ки маҳоратро аз баробари бахт қадр мекунанд, ҷалб кард.', '<b>Кӯчиш ба Лас-Вегас:</b> соли 1963 афсонаҳои покер, аз ҷумла Дойл Брансон, бозиро ба Вегас оварданд.', '<b>Турнири бузург:</b> нуқтаи бурриш вақте омад, ки воқеаи асосии турнири солонаи касбӣ (ойиндаи <b>World Series of Poker</b>) дар формати <b>No-Limit Texas Hold’em</b> гузаронида шуд. Формати no-limit имкон медод дар ҳар лаҳза all-in кунад, драмаву фишори психологиро зиёд кард — барои телевизион комил буд.'],
      s4p2: 'Соли 1988 эътироф кардани Texas Hold’em ҳамчун <b>бозии маҳорат</b>, на танҳо бахт, онро ба мусобиқаи асосии интеллектуалии кортҳои ҷаҳон табдил дод.',
      cta: '♠️ Куҷо маҳоратро такмил диҳем?',
      ctaP1: 'Texas Hold’em амалиёти доимӣ, интизом ва таҳлилро талаб мекунад.',
      ctaP2: 'Ба клуби <b>NUTS</b> дар <b>PPPoker</b> ҳамроҳ шавед — онлайн бозӣ кунед, стратегияи префлопро такмил диҳед ва ҳамаи қоидаҳо ва терминҳоро имрӯз дар баробари рақибони воқеӣ татбиқ кунед!',
    },
  }[locale];

  return [
    h2(t.h1),
    p('Author:&nbsp;<a href="/author-roman-shaposhnikov/"><em>Roman Shaposhnikov</em></a>'),
    p('Date: 12.01.2026'),
    p(t.intro),
    p(t.intro2),
    h2(t.s1),
    p(t.s1p),
    h3(t.h31),
    p(t.h31p),
    `<ul>\n${t.h31u.map((x) => `<li>${x}</li>`).join('\n')}\n</ul>`,
    h3(t.h32),
    p(t.h32p),
    `<ul>\n${t.h32u.map((x) => `<li>${x}</li>`).join('\n')}\n</ul>`,
    h3(t.h33),
    p(t.h33p),
    `<ul>\n${t.h33u.map((x) => `<li>${x}</li>`).join('\n')}\n</ul>`,
    h3(t.h34),
    p(t.h34p),
    `<ul>\n${t.h34u.map((x) => `<li>${x}</li>`).join('\n')}\n</ul>`,
    h3(t.h35),
    p(t.h35p),
    `<ul>\n${t.h35u.map((x) => `<li>${x}</li>`).join('\n')}\n</ul>`,
    h3(t.h36),
    p(t.h36p),
    h2(t.s2),
    p(t.s2p),
    comboTable[locale],
    h2(t.s3),
    p(t.s3p),
    actionTable[locale],
    h2(t.s4),
    p(t.s4p1),
    `<ol>\n${t.s4o.map((x) => `<li>${x}</li>`).join('\n')}\n</ol>`,
    p(t.s4p2),
    h2(t.cta),
    p(t.ctaP1),
    p(t.ctaP2),
  ].join('\n');
}

export function write() {
  return writePostTranslation('pravila-tehasskogo-holdema', {
    en: {
      title: 'Texas Hold’em Rules — Nuts PPPoker',
      description:
        'Texas Hold’em (No-Limit Hold’em, NLH) is the world’s most popular poker variant, combining simple rules with incredible strategic depth.',
      bodyHtml: body('en'),
    },
    uz: {
      title: 'Texas Hold’em qoidalari — Nuts PPPoker',
      description:
        'Texas Hold’em (No-Limit Hold’em, NLH) — dunyodagi eng mashhur poker turi, oddiy qoidalar va ajoyib strategik chuqurlikni birlashtiradi.',
      bodyHtml: body('uz'),
    },
    kz: {
      title: 'Техас Холдем ережелері — Nuts PPPoker',
      description:
        'Техас Холдем (No-Limit Hold’em, NLH) — әлемдегі ең танымал покер түрі, қарапайым ережелер мен керемет стратегиялық тереңдікті біріктіреді.',
      bodyHtml: body('kz'),
    },
    hy: {
      title: 'Texas Hold’em կանոններ — Nuts PPPoker',
      description:
        'Texas Hold’em (No-Limit Hold’em, NLH)-ը աշխարհի ամենահայտնի պոկերի ձևն է, որը միավորում է պարզ կանոններ և ռազմավարական անհավանական խորություն։',
      bodyHtml: body('hy'),
    },
    tj: {
      title: 'Қоидаҳои Texas Hold’em — Nuts PPPoker',
      description:
        'Texas Hold’em (No-Limit Hold’em, NLH) — маъмултарин намуди покер дар ҷаҳон, ки қоидаҳои соддаро бо чуқурии стратегии беҳамто якҷоя мекунад.',
      bodyHtml: body('tj'),
    },
  });
}
