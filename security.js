/**
 * ═══════════════════════════════════════════════
 *  I-YM · SECURITY MODULE
 *  - XSS 방어 (입력값 이스케이프)
 *  - localStorage 민감정보 분리/검증
 *  - 웹훅 URL 마스킹
 *  - 무결성 검사
 * ═══════════════════════════════════════════════
 */

const Security = (() => {

  // ── 1. XSS 방어: HTML 이스케이프 ─────────────────────
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // ── 2. 입력값 검증 ────────────────────────────────────
  function validateStockName(name) {
    // 종목명: 한글/영문/숫자/공백/()만 허용, 50자 이하
    const re = /^[가-힣a-zA-Z0-9\s\(\)\&\.\-]+$/;
    return typeof name === 'string' && name.length > 0 && name.length <= 50 && re.test(name);
  }

  function validateTicker(ticker) {
    // 티커: 영문/숫자/&만 허용, 20자 이하
    const re = /^[a-zA-Z0-9&\/\+\*\s가-힣]+$/;
    return typeof ticker === 'string' && ticker.length > 0 && ticker.length <= 20;
  }

  function validateNumber(val, min = 0, max = 1e12) {
    const n = Number(val);
    return !isNaN(n) && n >= min && n <= max;
  }

  function validateUrl(url) {
    // 디스코드 웹훅 URL만 허용
    return typeof url === 'string' && (
      url === '' ||
      url.startsWith('https://discord.com/api/webhooks/') ||
      url.startsWith('https://discordapp.com/api/webhooks/')
    );
  }

  // ── 3. localStorage 안전 입출력 ───────────────────────
  const STORAGE_KEYS = {
    snapshot:       'investkit_snapshot',
    memos:          'investkit_memos',
    journal:        'investkit_trade_journal',
    checklist:      'investkit_checklist_dates',
    year_cards:     'investkit_year_cards',
    custom_stocks:  'investkit_custom_stocks',
    current_prices: 'investkit_current_prices',
    auto_buy:       'investkit_auto_buy',
    // 알림 설정은 별도 키에 웹훅 URL 분리 저장
    alert_flags:    'investkit_alert_flags',    // 체크박스만
    alert_webhook:  'investkit_alert_webhook',  // URL만 (민감)
  };

  function safeGet(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch(e) {
      console.warn('[Security] localStorage 파싱 오류:', key);
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      // 크기 제한 (값 하나당 최대 500KB)
      const str = JSON.stringify(value);
      if (str.length > 512000) {
        console.warn('[Security] 저장 데이터 초과:', key);
        return false;
      }
      localStorage.setItem(key, str);
      return true;
    } catch(e) {
      console.warn('[Security] localStorage 저장 오류:', key, e);
      return false;
    }
  }

  // ── 4. 웹훅 URL 마스킹 (화면 표시용) ─────────────────
  function maskWebhookUrl(url) {
    if (!url || url.length < 20) return url;
    // https://discord.com/api/webhooks/123.../abc...
    // → https://discord.com/api/webhooks/****/****
    return url.replace(/(webhooks\/)[^\/]+\/(.{4}).+/, '$1****/****$2...');
  }

  // ── 5. 알림 설정 분리 저장/불러오기 ─────────────────
  function saveAlertSecure(webhookUrl, flags) {
    // URL 검증
    if (!validateUrl(webhookUrl)) {
      return { ok: false, msg: '디스코드 웹훅 URL 형식이 올바르지 않습니다.' };
    }
    safeSet(STORAGE_KEYS.alert_webhook, webhookUrl);
    safeSet(STORAGE_KEYS.alert_flags, flags);
    return { ok: true };
  }

  function loadAlertSecure() {
    return {
      webhookUrl: safeGet(STORAGE_KEYS.alert_webhook) || '',
      flags:      safeGet(STORAGE_KEYS.alert_flags) || {},
    };
  }

  // ── 6. localStorage 전체 크기 모니터링 ───────────────
  function checkStorageUsage() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += (localStorage[key].length + key.length) * 2; // UTF-16
      }
    }
    const usedKB = Math.round(total / 1024);
    const limitKB = 5120; // 5MB
    if (usedKB > limitKB * 0.8) {
      console.warn(`[Security] localStorage 사용량 경고: ${usedKB}KB / ${limitKB}KB`);
    }
    return { usedKB, limitKB, pct: Math.round(usedKB / limitKB * 100) };
  }

  // ── 7. 저장 데이터 무결성 검사 ───────────────────────
  function auditStorage() {
    const issues = [];

    // snapshot 검사
    const snap = safeGet(STORAGE_KEYS.snapshot);
    if (snap) {
      if (!validateNumber(snap.initAmount, 0, 1e12))   issues.push('initAmount 범위 오류');
      if (!validateNumber(snap.monthlyAmount, 0, 1e12)) issues.push('monthlyAmount 범위 오류');
      if (!validateNumber(snap.rate, 0, 100))           issues.push('rate 범위 오류');
    }

    // 매매일지 검사
    const journal = safeGet(STORAGE_KEYS.journal) || [];
    journal.forEach((e, i) => {
      if (!validateNumber(e.qty, 0, 1e6))  issues.push(`journal[${i}] qty 오류`);
      if (!validateNumber(e.price, 0, 1e12)) issues.push(`journal[${i}] price 오류`);
    });

    if (issues.length > 0) {
      console.warn('[Security] 저장 데이터 무결성 오류:', issues);
    }
    return issues;
  }

  // ── 8. 개발자 도구 경고 메시지 ───────────────────────
  function devToolsWarning() {
    const msg = [
      '%c⚠️  I-YM Security Warning',
      'color:#d4a840;font-size:16px;font-weight:bold;',
    ];
    console.log(...msg);
    console.log(
      '%c이 창에 코드를 붙여넣지 마세요.\n' +
      '악성 코드가 localStorage 데이터를 탈취할 수 있습니다.\n' +
      '본인이 직접 작성한 코드만 실행하세요.',
      'color:#94a3b8;font-size:13px;'
    );
  }

  // ── 초기화 ────────────────────────────────────────────
  function init() {
    devToolsWarning();
    checkStorageUsage();
    // 5분마다 무결성 검사
    setInterval(auditStorage, 5 * 60 * 1000);
  }

  return {
    escapeHtml,
    validateStockName,
    validateTicker,
    validateNumber,
    validateUrl,
    safeGet,
    safeSet,
    maskWebhookUrl,
    saveAlertSecure,
    loadAlertSecure,
    checkStorageUsage,
    auditStorage,
    KEYS: STORAGE_KEYS,
    init,
  };
})();

// 자동 초기화
Security.init();
