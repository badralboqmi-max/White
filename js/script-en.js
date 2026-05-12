// ========== رابط Google Apps Script (غيّره إلى رابطك الشخصي) ==========
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbypiBQ3fzMlh5rWkSgSAIc34ZzVjfLMjf8nfY8SKN8mf43cAAkRxQGV8cqQ21FdM8Zkaw/exec';

// ========== التحكم في القائمة الجانبية ==========
const menuIcon = document.getElementById('menuIcon');
const menu = document.getElementById('menu');
const overlay = document.getElementById('overlay');

function closeMenu() {
  menu.classList.remove('show');
  overlay.classList.remove('show');
}

closeMenu();

window.addEventListener('pageshow', function() {
  closeMenu();
});

menuIcon.addEventListener('click', function(event) {
  event.stopPropagation();
  menu.classList.toggle('show');
  overlay.classList.toggle('show');
});

document.addEventListener('click', function(event) {
  if (!menu.contains(event.target) && !menuIcon.contains(event.target)) {
    closeMenu();
  }
});

// ========== تحجيم الصفحة وتكيفها ==========
function getPageHeight() {
  return document.body.classList.contains('home-page') ? 1185 : 853;
}

const page = { width: 393 };

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
      if (bgImage && bgImage !== 'none') bgStyle = bgImage;
      else if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') bgStyle = bgColor;
    }
    if (bgStyle && bgStyle !== 'none') {
      document.documentElement.style.background = bgStyle;
      document.body.style.background = bgStyle;
      ['backgroundSize', 'backgroundRepeat', 'backgroundAttachment', 'backgroundPosition'].forEach(prop => {
        document.documentElement.style[prop] = document.body.style[prop] = 
          prop === 'backgroundSize' ? 'cover' : (prop === 'backgroundRepeat' ? 'no-repeat' : (prop === 'backgroundAttachment' ? 'scroll' : 'center center'));
      });
      return;
    }
  }
  const defaultBg = '#d2cec8';
  document.documentElement.style.background = defaultBg;
  document.body.style.background = defaultBg;
  document.body.style.backgroundImage = 'none';
}

function adjustBodyHeight() {
  const container = document.getElementById('container');
  if (!container) return;
  const scale = window.innerWidth / page.width;
  const containerHeight = getPageHeight() * scale;
  const minBodyHeight = Math.max(containerHeight, window.innerHeight);
  document.body.style.minHeight = document.documentElement.style.minHeight = minBodyHeight + 'px';
}

const resizePage = () => {
  const container = document.getElementById('container');
  if (!container) return;
  const scale = window.innerWidth / page.width;
  document.body.style.paddingTop = (getPageHeight() * scale) + 'px';
  container.style.width = page.width + 'px';
  container.style.height = getPageHeight() + 'px';
  container.style.transform = `scale(${scale})`;
  container.style.transformOrigin = '0 0';
  adjustBodyHeight();
  applyPageBackground();
};

resizePage();

window.addEventListener('resize', () => {
  requestAnimationFrame(resizePage);
});

// ========== نافذة التسجيل المنبثقة ==========
const popupOverlay = document.getElementById('popupOverlay');

window.addEventListener('load', () => {
  if (!localStorage.getItem('userRegistered')) {
    setTimeout(() => {
      popupOverlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    }, 4000);
  }
});

window.closePopup = function() {
  popupOverlay.classList.remove('show');
  document.body.style.overflow = 'auto';
};

// دالة التسجيل الرئيسية (ترسل إلى Google Sheets)
window.submitPopup = async function() {
  const name = document.getElementById('popupName').value.trim();
  const phone = document.getElementById('popupPhone').value.trim();
  const agree = document.getElementById('popupPrivacyCheck').checked;
  const messageDiv = document.getElementById('popupMessage');

  messageDiv.textContent = '';
  
  if (!name || !phone) {
    messageDiv.textContent = 'Please fill in all fields';
    messageDiv.className = 'popup-error';
    return;
  }
  if (!/^05\d{8}$/.test(phone)) {
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
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, consent: agree })
    });
    const result = await response.json();
    if (result.success) {
      messageDiv.textContent = 'Registration successful! Thank you.';
      messageDiv.className = 'popup-success';
      localStorage.setItem('userRegistered', 'true');
      document.getElementById('popupName').value = '';
      document.getElementById('popupPhone').value = '';
      document.getElementById('popupPrivacyCheck').checked = false;
      setTimeout(() => closePopup(), 2000);
    } else {
      messageDiv.textContent = result.error || 'Server error.';
      messageDiv.className = 'popup-error';
    }
  } catch (error) {
    console.error('Fetch error details:', error);
    messageDiv.textContent = 'Connection failed. Check console for details.';
    messageDiv.className = 'popup-error';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Register';
  }
};

// ========== تأثيرات الحركة عند التمرير ==========
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.fade-up, .fade-in').forEach(el => observer.observe(el));
});

// ========== انتقال الصفحات (Page Transition) ==========
let transitionAnimation = null;
const transitionDiv = document.getElementById('page-transition');
const animationContainer = document.getElementById('transition-animation');
if (animationContainer) {
  transitionAnimation = lottie.loadAnimation({
    container: animationContainer,
    renderer: 'svg',
    loop: false,
    autoplay: false,
    path: '../assets/Sample-Animation.json'
  });
}
if (transitionDiv) {
  transitionDiv.style.opacity = '0';
  transitionDiv.style.visibility = 'hidden';
}
document.querySelectorAll('a').forEach(link => {
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
  if (href.startsWith('http') && !href.includes(window.location.hostname)) return;
  if (link.getAttribute('target') === '_blank') return;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    if (transitionDiv) {
      transitionDiv.style.visibility = 'visible';
      transitionDiv.style.opacity = '1';
    }
    if (transitionAnimation) {
      transitionAnimation.goToAndPlay(0);
      transitionAnimation.addEventListener('complete', () => {
        window.location.href = href;
      }, { once: true });
    } else {
      setTimeout(() => window.location.href = href, 700);
    }
  });
});
window.addEventListener('pageshow', () => {
  if (transitionDiv) {
    transitionDiv.style.visibility = 'hidden';
    transitionDiv.style.opacity = '0';
  }
});
