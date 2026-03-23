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

// ========== تحجيم الصفحة (resize) – مع إصلاح الأطراف البيضاء ==========
function getPageHeight() {
  if (document.body.classList.contains('home-page')) {
    return 1185;
  } else {
    return 853;
  }
}

const page = { width: 393 };

// دالة لاستخراج خلفية الصفحة الرئيسية وتطبيقها على <html>
function applyPageBackground() {
  const container = document.getElementById('container');
  if (!container) return;
  // أول عنصر فرعي مباشر داخل #container يحتوي على الخلفية
  const bgElement = container.querySelector('div:first-child');
  if (bgElement) {
    const bgStyle = window.getComputedStyle(bgElement).background;
    if (bgStyle && bgStyle !== 'none') {
      document.documentElement.style.background = bgStyle;
      return;
    }
  }
  // إذا لم نجد خلفية، نستخدم لون افتراضي (يتناسب مع أغلب الصفحات)
  document.documentElement.style.backgroundColor = '#d2cec8';
}

const resizePage = () => {
  const viewWidth = window.innerWidth;
  const container = document.getElementById('container');
  if (!container) return;
  const scale = viewWidth / page.width;
  const displayHeight = getPageHeight() * scale || 0;

  // ضبط التباعد العلوي
  document.body.style.paddingTop = displayHeight + 'px';
  document.body.style.width = '100%';
  document.body.style.minWidth = '100%';
  // لا نضبط backgroundColor هنا؛ نعتمد على الخلفية المطبقة على <html>

  // ضمان عرض وارتفاع ثابتين للحاوية قبل التحجيم
  container.style.width = page.width + 'px';
  container.style.height = getPageHeight() + 'px';

  // نقطة الارتكاز أعلى اليسار لمنع الانزلاق
  container.style.transformOrigin = '0 0';

  // تطبيق التحجيم وإظهار الحاوية
  container.style.transform = 'scale(' + scale + ')';
  container.style.display = 'block';
  container.style.overflow = 'visible';
};

// تنفيذ التحجيم أول مرة
resizePage();
applyPageBackground(); // تطبيق الخلفية على html

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
  applyPageBackground(); // تحديث الخلفية أيضاً (لاحتمال تغيرها)
});

// ========== نافذة التسجيل الإلزامية ==========
const popupOverlay = document.getElementById('popupOverlay');

window.addEventListener('load', function() {
  if (localStorage.getItem('userRegistered')) {
    console.log('User already registered, popup hidden');
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

// ========== دالة التسجيل الجديدة مع Supabase ==========
window.submitPopup = async function() {
  const name = document.getElementById('popupName').value.trim();
  const phone = document.getElementById('popupPhone').value.trim();
  const agree = document.getElementById('popupPrivacyCheck').checked;
  const messageDiv = document.getElementById('popupMessage');

  if (!name || !phone) {
    messageDiv.textContent = 'Please fill in all fields';
    messageDiv.className = 'popup-error';
    return;
  }

  const phoneRegex = /^05\d{8}$/;
  if (!phoneRegex.test(phone)) {
    messageDiv.textContent = 'Phone number must be 10 digits and start with 05';
    messageDiv.className = 'popup-error';
    return;
  }

  if (!agree) {
    messageDiv.textContent = 'You must agree to the privacy policy';
    messageDiv.className = 'popup-error';
    return;
  }

  const btn = document.querySelector('.popup-button');
  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    const { error } = await supabaseClient
      .from('customers')
      .insert([{ name, phone, consent: agree }]);

    if (error) {
      if (error.code === '23505') {
        messageDiv.textContent = 'This phone number is already registered.';
      } else {
        throw error;
      }
      messageDiv.className = 'popup-error';
    } else {
      messageDiv.textContent = 'Registration successful! Thank you.';
      messageDiv.className = 'popup-success';
      localStorage.setItem('userRegistered', 'true');
      document.getElementById('popupName').value = '';
      document.getElementById('popupPhone').value = '';
      document.getElementById('popupPrivacyCheck').checked = false;
      setTimeout(closePopup, 2000);
    }
  } catch (error) {
    console.error(error);
    messageDiv.textContent = 'An error occurred. Please try again.';
    messageDiv.className = 'popup-error';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Register';
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

// ========== إصلاح مشكلة الأطراف البيضاء عند التكبير/التصغير (مراقبة إضافية) ==========
if (window.ResizeObserver) {
  const resizeObserver = new ResizeObserver(() => {
    resizePage();
    applyPageBackground();
  });
  resizeObserver.observe(document.documentElement);
} else {
  // حل بديل للمتصفحات القديمة
  let lastWidth = window.innerWidth;
  window.addEventListener('touchmove', function() {
    if (window.innerWidth !== lastWidth) {
      lastWidth = window.innerWidth;
      resizePage();
      applyPageBackground();
    }
  });
}
