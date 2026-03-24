// ========== تعريف Supabase ==========
const SUPABASE_URL = 'https://qyhpbdvcvxqhnptqzouw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8aNuoaA4T8oWKs3ta0x6iw_o5jkQn_c';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== التحكم في المنيو ==========
const menuIcon = document.getElementById('menuIcon');
const menu = document.getElementById('menu');
const overlay = document.getElementById('overlay');

menuIcon.addEventListener('click', function(event) {
  event.stopPropagation();
  menu.classList.toggle('show');
  overlay.classList.toggle('show');
});

document.addEventListener('click', function(event) {
  if (!menu.contains(event.target) && !menuIcon.contains(event.target)) {
    menu.classList.remove('show');
    overlay.classList.remove('show');
  }
});

// ========== تحجيم الصفحة (resize) – إصلاح الأطراف البيضاء ==========
function getPageHeight() {
  if (document.body.classList.contains('home-page')) {
    return 1178;
  } else {
    return 853;
  }
}

const page = { width: 393 };

// دالة لاستخراج خلفية الصفحة وتطبيقها على <html> و <body>
function applyPageBackground() {
  const container = document.getElementById('container');
  if (!container) return;
  const bgElement = container.querySelector('div:first-child');
  if (bgElement) {
    const computedStyle = window.getComputedStyle(bgElement);
    let bgStyle = computedStyle.background;
    
    if (!bgStyle || bgStyle === 'none' || bgStyle === 'rgba(0, 0, 0, 0)') {
      const bgImage = computedStyle.backgroundImage;
      const bgColor = computedStyle.backgroundColor;
      if (bgImage && bgImage !== 'none') {
        bgStyle = bgImage;
      } else if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
        bgStyle = bgColor;
      }
    }
    
    if (bgStyle && bgStyle !== 'none') {
      document.documentElement.style.background = bgStyle;
      document.body.style.background = bgStyle;
      document.documentElement.style.backgroundSize = 'cover';
      document.body.style.backgroundSize = 'cover';
      document.documentElement.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.documentElement.style.backgroundAttachment = 'scroll';
      document.body.style.backgroundAttachment = 'scroll';
      document.documentElement.style.backgroundPosition = 'center center';
      document.body.style.backgroundPosition = 'center center';
      return;
    }
  }
  const defaultBg = '#d2cec8';
  document.documentElement.style.background = defaultBg;
  document.body.style.background = defaultBg;
  document.body.style.backgroundImage = 'none';
  document.documentElement.style.backgroundImage = 'none';
}

// دالة لضبط ارتفاع body ليلائم المحتوى المحجَّم
function adjustBodyHeight() {
  const container = document.getElementById('container');
  if (!container) return;
  const viewWidth = window.innerWidth;
  const scale = viewWidth / page.width;
  const containerHeight = getPageHeight() * scale;
  const minBodyHeight = Math.max(containerHeight, window.innerHeight);
  document.body.style.minHeight = minBodyHeight + 'px';
  document.documentElement.style.minHeight = minBodyHeight + 'px';
}

const resizePage = () => {
  const viewWidth = window.innerWidth;
  const container = document.getElementById('container');
  if (!container) return;
  const scale = viewWidth / page.width;
  const displayHeight = getPageHeight() * scale || 0;

  document.body.style.paddingTop = displayHeight + 'px';
  document.body.style.width = '100%';
  document.body.style.minWidth = '100%';

  container.style.width = page.width + 'px';
  container.style.height = getPageHeight() + 'px';
  container.style.transformOrigin = '0 0';
  container.style.transform = 'scale(' + scale + ')';
  container.style.display = 'block';
  container.style.overflow = 'visible';

  adjustBodyHeight();
  applyPageBackground();
};

// تنفيذ التحجيم أول مرة
resizePage();

// تحسين الأداء عند تغيير حجم النافذة
(function () {
  var throttle = function (type, name, obj) {
    obj = obj || window;
    var running = false;
    var func = function () {
      if (running) return;
      running = true;
      requestAnimationFrame(function () {
        obj.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };
    obj.addEventListener(type, func);
  };
  throttle("resize", "optimizedResize");
})();

window.addEventListener("optimizedResize", function() {
  resizePage();
});

// ========== نافذة التسجيل الإلزامية (عربية) ==========
const popupOverlay = document.getElementById('popupOverlay');

window.addEventListener('load', function() {
  if (localStorage.getItem('userRegistered')) {
    console.log('المستخدم مسجل مسبقاً، لن تظهر النافذة');
    return;
  }
  setTimeout(function() {
    popupOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }, 2000);
});

window.closePopup = function() {
  popupOverlay.classList.remove('show');
  document.body.style.overflow = 'auto';
};

// ========== دالة التسجيل مع Supabase ==========
window.submitPopup = async function() {
  const name = document.getElementById('popupName').value.trim();
  const phone = document.getElementById('popupPhone').value.trim();
  const agree = document.getElementById('popupPrivacyCheck').checked;
  const messageDiv = document.getElementById('popupMessage');

  if (!name || !phone) {
    messageDiv.textContent = 'الرجاء ملء جميع الحقول';
    messageDiv.className = 'popup-error';
    return;
  }

  const phoneRegex = /^05\d{8}$/;
  if (!phoneRegex.test(phone)) {
    messageDiv.textContent = 'رقم الجوال يجب أن يكون 10 أرقام ويبدأ بـ 05';
    messageDiv.className = 'popup-error';
    return;
  }

  if (!agree) {
    messageDiv.textContent = 'يجب الموافقة على سياسة الخصوصية';
    messageDiv.className = 'popup-error';
    return;
  }

  const btn = document.querySelector('.popup-button');
  btn.disabled = true;
  btn.textContent = 'جاري التسجيل...';

  try {
    const { error } = await supabaseClient
      .from('customers')
      .insert([{ name, phone, consent: agree }]);

    if (error) {
      if (error.code === '23505') {
        messageDiv.textContent = 'هذا الرقم مسجل مسبقاً';
      } else {
        throw error;
      }
      messageDiv.className = 'popup-error';
    } else {
      messageDiv.textContent = 'تم التسجيل بنجاح! شكراً لك.';
      messageDiv.className = 'popup-success';
      localStorage.setItem('userRegistered', 'true');
      document.getElementById('popupName').value = '';
      document.getElementById('popupPhone').value = '';
      document.getElementById('popupPrivacyCheck').checked = false;
      setTimeout(closePopup, 2000);
    }
  } catch (error) {
    console.error(error);
    messageDiv.textContent = 'حدث خطأ، حاول مرة أخرى';
    messageDiv.className = 'popup-error';
  } finally {
    btn.disabled = false;
    btn.textContent = 'تسجيل';
  }
};

// ========== تأثيرات الظهور عند التمرير ==========
document.addEventListener('DOMContentLoaded', function() {
  const animatedElements = document.querySelectorAll('.fade-up, .fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  animatedElements.forEach(el => observer.observe(el));
});

// ========== مراقبة إضافية للتصغير/التكبير ==========
if (window.ResizeObserver) {
  const resizeObserver = new ResizeObserver(() => {
    resizePage();
  });
  resizeObserver.observe(document.documentElement);
} else {
  let lastWidth = window.innerWidth;
  window.addEventListener('touchmove', function() {
    if (window.innerWidth !== lastWidth) {
      lastWidth = window.innerWidth;
      resizePage();
    }
  });
}
