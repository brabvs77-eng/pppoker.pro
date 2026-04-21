const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Определение текстов для разных языков
const cookieTexts = {
  'ru': {
    title: 'Использование файлов куки',
    description: 'Мы используем файлы куки для улучшения вашего опыта использования сайта. Продолжая использовать сайт, вы соглашаетесь с использованием куки.',
    accept: 'Принять',
    decline: 'Отклонить',
    readMore: 'Узнать больше'
  },
  'en': {
    title: 'Cookie Policy',
    description: 'We use cookies to improve your experience on our website. By continuing to use the site, you agree to the use of cookies.',
    accept: 'Accept',
    decline: 'Decline',
    readMore: 'Learn More'
  },
  'uz': {
    title: 'Cookie Siyosati',
    description: 'Biz saytda sizning tajribangizni yaxshilash uchun cookie fayllaridan foydalanamiz. Saytni davom etgan holda, siz cookie fayllaridan foydalanishga rozi bo\'lasiz.',
    accept: 'Qabul qilish',
    decline: 'Rad etish',
    readMore: 'Batafsil'
  },
  'kz': {
    title: 'Cookie саясаты',
    description: 'Біз сайтта сіздің тәжірибеңізді жақсарту үшін cookie файлдарын пайдаланамыз. Сайтты пайдалана беру арқылы сіз cookie файлдарын пайдалануға келісесіз.',
    accept: 'Қабылдау',
    decline: 'Бас тарту',
    readMore: 'Толығырақ'
  },
  'hy': {
    title: 'Cookie քաղաքականություն',
    description: 'Մենք օգտագործում ենք cookie ֆայլեր՝ մեր կայքում ձեր փորձը բարելավելու համար: Կայքը շարունակ օգտագործելով՝ դուք համաձայն եք cookie ֆայլերի օգտագործման հետ:',
    accept: 'Ընդունել',
    decline: 'Մերժել',
    readMore: 'Ավելին'
  },
  'tj': {
    title: 'Сиёсати Cookie',
    description: 'Мо файлҳои cookie -ро барои беҳтарсохти таҷрибаи шумо дар вебсайт истифода мебарем. Бо идомаи истифодаи сайт, шумо бо истифодаи файлҳои cookie розо шумо.',
    accept: 'Қабул кунед',
    decline: 'Рад кунед',
    readMore: 'Бештар'
  }
};

// HTML и CSS для баннера
const cookieBannerHTML = (lang = 'ru') => {
  const text = cookieTexts[lang] || cookieTexts['ru'];
  return `
<!-- Cookie Banner Start -->
<div id="cookie-banner" class="cookie-banner" style="display: none;">
  <div class="cookie-banner-container">
    <div class="cookie-banner-content">
      <h3 class="cookie-banner-title">${text.title}</h3>
      <p class="cookie-banner-text">${text.description}</p>
    </div>
    <div class="cookie-banner-actions">
      <button id="cookie-decline" class="cookie-btn cookie-btn-secondary">${text.decline}</button>
      <button id="cookie-accept" class="cookie-btn cookie-btn-primary">${text.accept}</button>
    </div>
  </div>
</div>

<style>
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #ffffff;
  padding: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.cookie-banner-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.cookie-banner-content {
  flex: 1;
  min-width: 250px;
}

.cookie-banner-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.cookie-banner-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #cccccc;
}

.cookie-banner-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.cookie-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.cookie-btn-primary {
  background-color: #4a7c59;
  color: #ffffff;
}

.cookie-btn-primary:hover {
  background-color: #5a9169;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(74, 124, 89, 0.3);
}

.cookie-btn-secondary {
  background-color: #555555;
  color: #ffffff;
}

.cookie-btn-secondary:hover {
  background-color: #666666;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .cookie-banner {
    padding: 15px;
  }

  .cookie-banner-container {
    flex-direction: column;
    align-items: stretch;
  }

  .cookie-banner-actions {
    width: 100%;
    flex-direction: column;
  }

  .cookie-btn {
    width: 100%;
  }
}
</style>

<script>
(function() {
  // Получение текущего языка из URL
  function getLanguage() {
    const path = window.location.pathname;
    const langMatch = path.match(/\\/(en|uz|kz|hy|tj|ru)\\//);
    return langMatch ? langMatch[1] : 'ru';
  }

  // Функция для проверки согласия с куки
  function checkCookieConsent() {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      showCookieBanner();
    }
  }

  // Показать баннер куки
  function showCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.style.display = 'block';
    }
  }

  // Скрыть баннер куки
  function hideCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.style.display = 'none';
    }
  }

  // Сохранить согласие с куки
  function acceptCookies() {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    hideCookieBanner();
  }

  // Отклонить куки (только необходимые)
  function declineCookies() {
    localStorage.setItem('cookie-consent', 'declined');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    hideCookieBanner();
  }

  // Инициализация при загрузке страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      checkCookieConsent();
      
      const acceptBtn = document.getElementById('cookie-accept');
      const declineBtn = document.getElementById('cookie-decline');
      
      if (acceptBtn) acceptBtn.addEventListener('click', acceptCookies);
      if (declineBtn) declineBtn.addEventListener('click', declineCookies);
    });
  } else {
    checkCookieConsent();
    
    const acceptBtn = document.getElementById('cookie-accept');
    const declineBtn = document.getElementById('cookie-decline');
    
    if (acceptBtn) acceptBtn.addEventListener('click', acceptCookies);
    if (declineBtn) declineBtn.addEventListener('click', declineCookies);
  }
})();
</script>
<!-- Cookie Banner End -->
`;
};

// Добавление куки-баннера в HTML файлы
function addCookieBanner() {
  const htmlFiles = glob.sync('./**/*.html', { 
    ignore: ['./node_modules/**', './.git/**'],
    maxDepth: 10
  });

  console.log(`Найдено ${htmlFiles.length} HTML файлов`);

  let successCount = 0;
  let skipCount = 0;

  htmlFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Проверка, не добавлен ли уже баннер
    if (content.includes('id="cookie-banner"')) {
      console.log(`✓ Пропущен (баннер уже добавлен): ${filePath}`);
      skipCount++;
      return;
    }

    // Определение языка из пути файла
    let lang = 'ru';
    if (filePath.includes('/en/')) lang = 'en';
    else if (filePath.includes('/uz/')) lang = 'uz';
    else if (filePath.includes('/kz/')) lang = 'kz';
    else if (filePath.includes('/hy/')) lang = 'hy';
    else if (filePath.includes('/tj/')) lang = 'tj';

    const banner = cookieBannerHTML(lang);

    // Вставка баннера перед </body> или в конец файла
    if (content.includes('</body>')) {
      content = content.replace('</body>', banner + '\n</body>');
    } else {
      content += '\n' + banner;
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Добавлен баннер: ${filePath} (язык: ${lang})`);
    successCount++;
  });

  console.log(`\n═══════════════════════════════════════════`);
  console.log(`Успешно добавлено: ${successCount}`);
  console.log(`Пропущено (уже добавлено): ${skipCount}`);
  console.log(`Всего обработано: ${htmlFiles.length}`);
  console.log(`═══════════════════════════════════════════`);
}

// Запуск скрипта
addCookieBanner();
