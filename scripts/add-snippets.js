const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Основные данные организации
const organizationSnippet = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "PPPoker Pro",
  "url": "https://pppoker.pro",
  "logo": "https://pppoker.pro/assets/media/2024/07/cropped-Лого-PPPoker.webp",
  "description": "Официальный партнер PPPoker - приватные покерные клубы онлайн",
  "sameAs": [
    "https://t.me/pppoker_pro",
    "https://wa.me/message/KIXDUQ7TC2ULM1"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": ["Russian", "English", "Uzbek", "Kazakh", "Armenian", "Tajik"]
  }
};

const websiteSnippet = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "PPPoker Pro",
  "url": "https://pppoker.pro",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://pppoker.pro/?s={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

// Сниппеты для разных языков
const languageData = {
  'ru': {
    name: 'PPPoker Pro - Онлайн покер на деньги',
    description: 'Играйте в покер онлайн на реальные деньги. Приватные покерные клубы PPPoker с бонусом 150%.',
    lang: 'ru-RU'
  },
  'en': {
    name: 'PPPoker Pro - Online Poker for Real Money',
    description: 'Play poker online for real money. Private PPPoker clubs with 150% bonus.',
    lang: 'en-US'
  },
  'uz': {
    name: 'PPPoker Pro - Haqiqiy pul uchun onlayn poker',
    description: 'Haqiqiy pul uchun onlayn poker oynang. 150% bonus bilan PPPoker xususiy klublari.',
    lang: 'uz-UZ'
  },
  'kz': {
    name: 'PPPoker Pro - Нақты ақшаға онлайн покер',
    description: 'Нақты ақшаға онлайн покер ойнаңыз. 150% бонуспен PPPoker жеке клубтары.',
    lang: 'kk-KZ'
  },
  'hy': {
    name: 'PPPoker Pro - Օdelays պdelays delays delays Poker Իdelays delays Իdelays delays',
    description: 'Խdelays delays delays delays delays delays delays delays delays delays.',
    lang: 'hy-AM'
  },
  'tj': {
    name: 'PPPoker Pro - Покер онлайн барои пули воқеӣ',
    description: 'Покери онлайнро барои пули воқеӣ бозӣ кунед. Клубҳои хусусии PPPoker бо бонуси 150%.',
    lang: 'tg-TJ'
  }
};

// FAQ сниппет для главной страницы
const faqSnippet = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Что такое PPPoker?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "PPPoker - это платформа для приватных покерных клубов, где можно играть в покер онлайн на реальные деньги с игроками со всего мира."
      }
    },
    {
      "@type": "Question",
      "name": "Как получить бонус 150%?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Зарегистрируйтесь через наш сайт, пополните счет и получите бонус 150% на первый депозит автоматически."
      }
    },
    {
      "@type": "Question",
      "name": "Как скачать PPPoker?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Скачайте приложение PPPoker бесплатно для iOS из App Store или для Android с официального сайта pppoker.net."
      }
    },
    {
      "@type": "Question",
      "name": "Безопасно ли играть в PPPoker?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Да, PPPoker использует современные технологии шифрования и защиты данных. Все транзакции проходят через защищенные каналы."
      }
    }
  ]
};

// Функция определения языка по пути
function getLanguage(filePath) {
  const parts = filePath.split('/');
  for (const part of parts) {
    if (['en', 'uz', 'kz', 'hy', 'tj'].includes(part)) {
      return part;
    }
  }
  return 'ru'; // По умолчанию русский
}

// Функция определения типа страницы
function getPageType(filePath) {
  if (filePath.includes('/blog/') || filePath.includes('/category/')) {
    return 'blog';
  }
  if (filePath.includes('/tag/')) {
    return 'tag';
  }
  if (filePath.match(/\/[a-z]{2}\/index\.html$/) || filePath === './index.html') {
    return 'home';
  }
  if (filePath.includes('privacy-policy') || filePath.includes('user-agreement')) {
    return 'legal';
  }
  if (filePath.includes('pppoker-review') || filePath.includes('obzor') || filePath.includes('vpip') || filePath.includes('mtt')) {
    return 'article';
  }
  return 'page';
}

// Функция создания BreadcrumbList
function createBreadcrumbs(filePath, lang) {
  const langData = languageData[lang] || languageData['ru'];
  const items = [{
    "@type": "ListItem",
    "position": 1,
    "name": "PPPoker Pro",
    "item": "https://pppoker.pro"
  }];
  
  const parts = filePath.replace('./','').replace('index.html','').split('/').filter(Boolean);
  let currentPath = 'https://pppoker.pro';
  
  parts.forEach((part, index) => {
    currentPath += '/' + part;
    items.push({
      "@type": "ListItem",
      "position": index + 2,
      "name": part.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
      "item": currentPath
    });
  });
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items
  };
}

// Функция создания Article сниппета
function createArticleSnippet(filePath, lang) {
  const langData = languageData[lang] || languageData['ru'];
  const fileName = path.basename(path.dirname(filePath));
  const title = fileName.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
  
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "author": {
      "@type": "Organization",
      "name": "PPPoker Pro"
    },
    "publisher": {
      "@type": "Organization",
      "name": "PPPoker Pro",
      "logo": {
        "@type": "ImageObject",
        "url": "https://pppoker.pro/assets/media/2024/07/cropped-Лого-PPPoker.webp"
      }
    },
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://pppoker.pro/${filePath.replace('./','').replace('index.html','')}`
    }
  };
}

async function addSnippets() {
  console.log('=== ДОБАВЛЕНИЕ JSON-LD СНИППЕТОВ ===\n');
  
  const files = await glob('./**/*.html', { ignore: ['./node_modules/**'] });
  let updated = 0;
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Проверяем, есть ли уже сниппеты
    if (content.includes('application/ld+json')) {
      continue;
    }
    
    const lang = getLanguage(file);
    const pageType = getPageType(file);
    const langData = languageData[lang] || languageData['ru'];
    
    // Собираем сниппеты для страницы
    const snippets = [];
    
    // Организация - на всех страницах
    snippets.push(organizationSnippet);
    
    // Website - только на главных страницах
    if (pageType === 'home') {
      snippets.push(websiteSnippet);
      // FAQ только на русской главной
      if (lang === 'ru') {
        snippets.push(faqSnippet);
      }
    }
    
    // BreadcrumbList - на всех страницах кроме главной
    if (pageType !== 'home') {
      snippets.push(createBreadcrumbs(file, lang));
    }
    
    // Article - для статей
    if (pageType === 'article') {
      snippets.push(createArticleSnippet(file, lang));
    }
    
    // Создаем скрипт со сниппетами
    const snippetScripts = snippets.map(s => 
      `<script type="application/ld+json">${JSON.stringify(s)}</script>`
    ).join('\n');
    
    // Добавляем в начало файла
    content = snippetScripts + '\n' + content;
    
    fs.writeFileSync(file, content);
    updated++;
    console.log(`[+] ${file} - добавлено ${snippets.length} сниппетов (${pageType}, ${lang})`);
  }
  
  console.log(`\n=== РЕЗУЛЬТАТ ===`);
  console.log(`Обновлено файлов: ${updated}`);
  console.log(`Типы сниппетов: Organization, WebSite, FAQPage, BreadcrumbList, Article`);
}

addSnippets().catch(console.error);
