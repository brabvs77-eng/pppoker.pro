import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { h2, h3, p } from '../post-translation-writer.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const outPath = path.join(
  rootDir,
  'apps/web/src/config/post-translations/posts/znaj-svoih-pokernyh-sopernikov-sekrety-vyigryshnyh-strategij.json',
);

const uzBody = [
  p('<em>Maqola muallifi: <a href="/blog/">PPPoker</a></em>'),
  p("Onlayn poker strategiyalar va psixologik jang bilan to'la. Poker o'yinchilarining turli turlarini tushunish va aniqlash muvaffaqiyat kalitidir. Har bir o'yinchining uslubi ularning xatti-harakati va qaror qabul qilish jarayoniga ta'sir qiladi."),
  p("Bu maqola poker o'yinchilarining beshta keng tarqalgan turini va Calling Station (avtojavob), Maniac (manyak), Nit (nit), TAG (tayт-agressiv) va LAG (luz-agressiv) kabi atamalarning paydo bo'lish sabablarini taqdim etadi."),
  p("Bu bilimlar poker o'yinlari va turnirlarida yordam beradi — raqiblaringizni bilish barcha jabhada g'alaba kafolatlaydi!"),
  h2('1. Avtojavob (Calling Station)'),
  h3('Xususiyatlar:'),
  p("Avtojavob — juda passiv, lekin shu bilan birga faol o'yinchi turi. Ular flopdan oldin ko'p qo'llar o'ynaydi va odatda raise qilish o'rniga call qilishni afzal ko'radi. Qo'l kuchini tushunishlari nisbatan zaif, shuning uchun ko'pincha zaif qo'llar bilan call qiladilar."),
  h3('Strategiya:'),
  p("Avtojavobga qarshi strategiya — qiymatni maksimal oshirish uchun ko'proq raise qilish. Zaif qo'llar bilan call qilishga moyilligi tufayli kuchli qo'llar bilan doimiy raise vaqt o'tishi bilan stackingizni sezilarli oshirishi mumkin. Murakkab blef strategiyalari ularga qarshi kamroq samarali bo'lishi mumkin, chunki ular bu taktikalarni tanimasligi mumkin."),
  h2('2. Manyak (Maniac)'),
  h3('Xususiyatlar:'),
  p("Manyak — juda agressiv o'yinchi, flopdan oldin ko'p qo'llar o'ynaydi va tez-tez bet, raise va hatto 4-bet qiladi. Bunday o'yin uslubi natijalarida yuqori dispersiyaga olib keladi."),
  h3('Strategiya:'),
  p("Manyakka qarshi o'ynashda eng muhimi — xotirjam qolish va yaxshi imkoniyatlarni kutish. Ular ko'pincha zaif qo'llar bilan bet qilgani uchun kuchli qo'llar bilan qarshi harakat qilishingiz mumkin. Ularning agressiv uslubiga berilmaslik va g'azablanmaslik juda muhim; strategiyangizga amal qiling va zarba berish uchun to'g'ri lahzani kuting."),
  h2('3. Nit'),
  h3('Xususiyatlar:'),
  p("Nit — juda konservativ o'yinchi turi. Ular flopdan oldin juda kam qo'llar o'ynaydi va odatda faqat kuchli kartalar bo'lganda ishtirok etadilar. O'yini juda tayт va ko'pincha to'liq stekga ega bo'ladi."),
  h3('Strategiya:'),
  p("Nitlarga qarshi strategiya — ularning konservativligidan foydalanib, blind va kichik banklarni o'g'irlash. Ular ko'proq fold qilish ehtimoli yuqori bo'lgani uchun steal strategiyalarini tez-tez qo'llashingiz mumkin. Biroq agar ular bankka kuchli qiziqish ko'rsatsa, ehtiyot bo'ling — ehtimol kuchli qo'li bor."),
  h2('4. TAG (tayт-agressiv)'),
  h3('Xususiyatlar:'),
  p("Tayт-agressiv o'yinchilar o'yinni nazorat qiladi va agressiv o'ynaydi. Ular flopdan oldin kamroq qo'llar o'ynaydi, lekin aqllona raise qilishni afzal ko'radi. Odatda tor qo'l diapazoni bilan o'yinni ochadilar va ko'pincha yaxshi stekka ega bo'ladi."),
  h3('Strategiya:'),
  p("Tayт-agressiv o'yinchilar muvozanatli o'yini tufayli juda kuchli raqiblar bo'lishi mumkin. Ularga qarshi strategiya — pozitsion afzallikdan foydalanish va ularning bet naqshlarini kuzatish. Zaif tomonlarini o'rganishga harakat qiling va aniq kuch ko'rsatganda keraksiz xavflardan qoching."),
  h2('5. LAG (luz-agressiv)'),
  h3('Xususiyatlar:'),
  p("Luz-agressiv o'yinchilar flopdan oldin ko'p qo'llar o'ynaydi, tayт-agressivlarga nisbatan kengroq diapazon bilan. Ular hali ham agressiv, tez-tez 3-bet qiladi, lekin manyaklar kabi ekstremal emas."),
  h3('Strategiya:'),
  p("Luz-agressiv o'yinchilarga qarshi strategiya — ularning agressiyasiga qarshi harakat qilish. Ular zaifroq qo'llar bilan bet qilishi mumkinligi sababli ko'proq call va o'z vaqtida raise qilishingiz mumkin. Sabrli bo'ling, qarshi hujum uchun to'g'ri lahzalarni kuting va kuchli qo'llar bo'lganda qiymatni maksimal qiling."),
  h3('Xulosa'),
  p("Poker o'yinchilarining turli turlarini tushunish va aniqlash samaraliroq strategiyalar ishlab chiqish va g'alaba foizingizni oshirishga yordam beradi. Har bir tur o'ziga xos xatti-harakat naqshlari va zaif tomonlarga ega. Bu ma'lumotdan moslashuvchan foydalanish poker stolida afzallik beradi."),
  p("Raqiblarni tushunishdan tashqari, muntazam mashq ham juda muhim. PPPoker NLH, PLO, OFC, SEKA, TONGITS, TEEN PATTI, PUSOY va boshqalar kabi keng o'yin tanlovini taklif etadi. PPPoker ilovasini yuklab oling va o'yin lobimizda bu o'yinlarni bepul o'ynab, haqiqiy poker ustasiga aylaning!"),
].join('\n');

const kzBody = [
  p('<em>Мақала авторы: <a href="/blog/">PPPoker</a></em>'),
  p('Онлайн покер стратегиялар мен психологиялық соғыспен толы. Покер ойыншыларының түрлі түрлерін түсіну және анықтау сәттіліктің кілті. Әр ойыншының стилі олардың мінез-құлқы мен шешім қабылдау процесіне әсер етеді.'),
  p('Бұл мақала покер ойыншыларының бес кең таралған түрін және Calling Station (автожауап), Maniac (маньяк), Nit (нит), TAG (тайт-агрессив) және LAG (луз-агрессив) сияқты терминдердің пайда болу себептерін ұсынады.'),
  p('Бұл білім покер ойындары мен турнирлерінде көмектеседі — қарсыластарыңызды білу барлық фронтта жеңіске кепілдік береді!'),
  h2('1. Автожауап (Calling Station)'),
  h3('Сипаттамалар:'),
  p('Автожауап — өте пассив, бірақ сонымен бірге белсенді ойыншы түрі. Олар флопқа дейін көп қол ойнайды және көбінесе raise емес, call жасауды ұнатады. Қол күшін түсінуі салыстырмалы әлсіз, сондықтан жиі әлсіз қолдармен call жасайды.'),
  h3('Стратегия:'),
  p('Автожауапқа қарсы стратегия — құндылықты максималдау үшін көбірек raise жасау. Әлсіз қолдармен call жасауға бейімділігі себебінен күшті қолдармен тұрақты raise уақыт өте келе стегіңізді айтарлықтай арттыруы мүмкін. Күрделі блеф стратегиялары оларға қарсы аз тиімді болуы мүмкін, өйткені олар бұл тактикаларды танымауы мүмкін.'),
  h2('2. Маньяк (Maniac)'),
  h3('Сипаттамалар:'),
  p('Маньяк — өте агрессив ойыншы, флопқа дейін көп қол ойнайды және жиі bet, raise және тіпті 4-bet жасайды. Мұндай ойын стилі нәтижелерінде жоғары дисперсияға әкеледі.'),
  h3('Стратегия:'),
  p('Маньякқа қарсы ойнағанда ең маңыздысы — тыныш қалу және жақсы мүмкіндіктерді күту. Олар жиі әлсіз қолдармен bet жасағандықтан, күшті қолдармен қарсы әрекет ете аласыз. Олардың агрессив стиліне берілмеу және ашуланбау өте маңызды; стратегияңызға адал болыңыз және соққы беру үшін дұрыс сәтті күтіңіз.'),
  h2('3. Нит'),
  h3('Сипаттамалар:'),
  p('Нит — өте консерватив ойыншы түрі. Олар флопқа дейін өте аз қол ойнайды және әдетте тек күшті карталар болғанда ғана қатысады. Ойыны өте тайт және жиі толық стекке ие болады.'),
  h3('Стратегия:'),
  p('Ниттерге қарсы стратегия — олардың консервативтілігін пайдаланып, блайнд пен шағын банктерді ұрлау. Олар көбірек fold жасау ықтималдығы жоғары болғандықтан, steal стратегияларын жиі қолдануға болады. Алайда егер олар банкке күшті қызығушылық танытса, сақ болыңыз — ықтимал күшті қолы бар.'),
  h2('4. TAG (тайт-агрессив)'),
  h3('Сипаттамалар:'),
  p('Тайт-агрессив ойыншылар ойынды бақылайды және агрессив ойнайды. Олар флопқа дейін аз қол ойнайды, бірақ ақылмен raise жасауды ұнатады. Әдетте тар қол диапазонымен ойынды ашады және жиі жақсы стекке ие болады.'),
  h3('Стратегия:'),
  p('Тайт-агрессив ойыншылар тепе-тең ойыны себебінен өте күшті қарсыластар болуы мүмкін. Оларға қарсы стратегия — позициялық артықшылықты пайдалану және олардың bet үлгілерін бақылау. Әлсіз жақтарын зерттеуге тырысыңыз және анық күш көрсеткенде қажетсіз тәуекелден аулақ болыңыз.'),
  h2('5. LAG (луз-агрессив)'),
  h3('Сипаттамалар:'),
  p('Луз-агрессив ойыншылар флопқа дейін көп қол ойнайды, тайт-агрессивтерге қарағанда кеңірек диапазонмен. Олар әлі де агрессив, жиі 3-bet жасайды, бірақ маньяктар сияқты экстремал емес.'),
  h3('Стратегия:'),
  p('Луз-агрессив ойыншыларға қарсы стратегия — олардың агрессиясына қарсы әрекет ету. Олар әлсізрек қолдармен bet жасауы мүмкін, сондықтан жиі call және уақытында raise жасауға болады. Сабырлы болыңыз, контратака үшін дұрыс сәттерді күтіңіз және күшті қолдар болғанда құндылықты максималдаңыз.'),
  h3('Қорытынды'),
  p('Покер ойыншыларының түрлі түрлерін түсіну және анықтау тиімдірек стратегиялар әзірлеуге және жеңіс пайызын арттыруға көмектеседі. Әр түрдің өзіндік мінез-құлық үлгілері мен әлсіз жақтары бар. Бұл ақпаратты икемді пайдалану покер үстелінде артықшылық береді.'),
  p('Қарсыластарды түсінуден басқа, тұрақты тәжірибе де өте маңызды. PPPoker NLH, PLO, OFC, SEKA, TONGITS, TEEN PATTI, PUSOY және тағы басқалар сияқты кең ойын таңдауын ұсынады. PPPoker қолданбасын жүктеп, ойын лобимізде бұл ойындарды тегін ойнап, нағыз покер шеберіне айланыңыз!'),
].join('\n');

const existing = JSON.parse(readFileSync(outPath, 'utf8'));

existing.uz = {
  title: "Poker raqiblaringizni biling: g'alaba strategiyalari siri — Nuts PPPoker",
  description:
    "Onlayn poker strategiyalar va psixologik jang bilan to'la. Poker o'yinchilarining turli turlarini tushunish va aniqlash muvaffaqiyat kalitidir.",
  bodyHtml: uzBody,
};

existing.kz = {
  title: 'Покер қарсыластарыңызды біліңіз: жеңіс стратегияларының сыры — Nuts PPPoker',
  description:
    'Онлайн покер стратегиялар мен психологиялық соғыспен толы. Покер ойыншыларының түрлі түрлерін түсіну және анықтау сәттіліктің кілті.',
  bodyHtml: kzBody,
};

writeFileSync(outPath, `${JSON.stringify(existing, null, 2)}\n`, 'utf8');
console.log('Updated', outPath);
