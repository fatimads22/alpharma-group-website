/* ============================================================
   ALPHARMA GROUP — JavaScript
   Replace PHONE_NUMBER with your actual WhatsApp number,
   e.g.  +224XXXXXXXXX  (Guinea country code is +224)
   ============================================================ */

const PHONE_NUMBER = '+33627291646';  // WhatsApp principal — France
const PHONE_FRANCE  = '+33627291646';  // France — Montmagny

/* =====================
   NAVBAR SCROLL
   ===================== */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

/* =====================
   MOBILE MENU
   ===================== */
const navToggle  = document.getElementById('navToggle');
const navLinks   = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* =====================
   ANIMATED COUNTERS
   ===================== */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current);
  }, 16);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => counterObserver.observe(el));

/* scroll-reveal disabled */

/* =====================
   PRODUCT FILTER TABS
   ===================== */
const filterTabs = document.querySelectorAll('.filter-tab');
const productCards = document.querySelectorAll('.product-card[data-category]');

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const category = tab.dataset.filter;
    productCards.forEach(card => {
      if (category === 'all' || card.dataset.category === category) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

/* =====================
   ORDER PAGE TABS
   ===================== */
document.querySelectorAll('.order-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.order-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.order-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const target = document.getElementById(btn.dataset.tab);
    if (target) target.classList.add('active');
  });
});

/* Open correct tab from URL hash; also expand product block if hash targets one */
function openTabFromHash() {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return;
  const tabBtn = document.querySelector(`.order-tab-btn[data-tab="${hash}"]`);
  if (tabBtn) { tabBtn.click(); return; }
  const block = document.getElementById(hash);
  if (block && block.classList.contains('product-order-block')) {
    const bulkBtn = document.querySelector('.order-tab-btn[data-tab="bulk"]');
    if (bulkBtn) bulkBtn.click();
    block.querySelector('.pob-header').classList.add('open');
    block.querySelector('.pob-body').classList.add('open');
    block.classList.add('active-block');
    if (typeof updateSummary === 'function') updateSummary();
    setTimeout(function () { block.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 250);
  }
}
window.addEventListener('DOMContentLoaded', openTabFromHash);

/* On products.html: point Commander buttons to the matching order block */
(function () {
  const MAP = {
    boots: 'pob-footwear', gloves: 'pob-gloves', helmets: 'pob-helmets',
    eye: 'pob-eye', respiratory: 'pob-respiratory', hearing: 'pob-hearing', body: 'pob-hivis'
  };
  document.querySelectorAll('.product-card[data-category]').forEach(function (card) {
    const cat = card.dataset.category;
    let target = MAP[cat];
    if (!target && cat === 'trousers') {
      const title = (card.querySelector('h3') || {}).textContent || '';
      if      (/t[- ]?shirt/i.test(title))                           target = 'pob-tshirt';
      else if (/uniform|chemise|shirt|tenue de travail/i.test(title)) target = 'pob-uniform';
      else if (/pluie|rain|imperm/i.test(title))                      target = 'pob-rainsuit';
      else if (/cargo|pantalon/i.test(title))                         target = 'pob-cargo';
      else                                                             target = 'pob-coveralls';
    }
    if (target) {
      card.querySelectorAll('a[href="order.html#bulk"]').forEach(function (btn) {
        btn.href = 'order.html#' + target;
      });
    }
  });
})();

/* =====================
   BULK ORDER FORM — Product Blocks
   ===================== */
document.querySelectorAll('.pob-header').forEach(header => {
  header.addEventListener('click', () => {
    const block = header.closest('.product-order-block');
    const body  = block.querySelector('.pob-body');
    const isOpen = header.classList.contains('open');
    header.classList.toggle('open', !isOpen);
    body.classList.toggle('open', !isOpen);
    block.classList.toggle('active-block', !isOpen);
    updateSummary();
  });
});

document.querySelectorAll('.size-qty input').forEach(input => {
  input.addEventListener('input', () => {
    updateBlockSubtotal(input.closest('.product-order-block'));
    updateSummary();
  });
});

function updateBlockSubtotal(block) {
  if (!block) return;
  const inputs = block.querySelectorAll('.size-qty input');
  let total = 0;
  inputs.forEach(inp => { total += parseInt(inp.value) || 0; });
  const el = block.querySelector('.pob-subtotal-val');
  if (el) el.textContent = total.toLocaleString();
  const countEl = block.querySelector('.pob-count');
  if (countEl) countEl.textContent = total > 0 ? `${total.toLocaleString()} units` : '';
}

function updateSummary() {
  const summaryItems = document.getElementById('summaryItems');
  const summaryTotal = document.getElementById('summaryTotal');
  if (!summaryItems || !summaryTotal) return;

  let grandTotal = 0;
  let rows = '';

  document.querySelectorAll('.product-order-block').forEach(block => {
    const header = block.querySelector('.pob-header');
    if (!header.classList.contains('open')) return;
    const name = block.querySelector('.pob-title').textContent.trim();
    const inputs = block.querySelectorAll('.size-qty input');
    let blockTotal = 0;
    inputs.forEach(inp => { blockTotal += parseInt(inp.value) || 0; });
    if (blockTotal > 0) {
      grandTotal += blockTotal;
      rows += `<div class="summary-row"><span>${name}</span><span>${blockTotal.toLocaleString()} units</span></div>`;
    }
  });

  summaryItems.innerHTML = rows || '<p style="opacity:.55;font-size:.85rem">No products selected yet — check products above.</p>';
  summaryTotal.textContent = grandTotal.toLocaleString();
}

/* =====================
   BUILD WHATSAPP MESSAGE — Bulk Order
   ===================== */
function buildBulkWhatsAppMessage() {
  const company = val('company');
  const contact = val('contactName');
  const phone   = val('orderPhone');
  const email   = val('orderEmail');
  const country = val('orderCountry');
  const payPref = checkedRadio('paymentPref') || 'To be discussed';
  const notes   = val('orderNotes');

  let msg = `*📦 BULK ORDER REQUEST — ALPHARMA GROUP*\n\n`;
  msg += `*Company:* ${company}\n`;
  msg += `*Contact:* ${contact}\n`;
  msg += `*Phone:* ${phone}\n`;
  if (email)   msg += `*Email:* ${email}\n`;
  if (country) msg += `*Location:* ${country}\n`;
  msg += `\n*─── ORDER DETAILS ───*\n\n`;

  const isLangEn = document.getElementById('htmlRoot').classList.contains('lang-en');
  let grandTotal = 0;
  document.querySelectorAll('.product-order-block').forEach(block => {
    const header = block.querySelector('.pob-header');
    if (!header.classList.contains('open')) return;
    const titleEl = block.querySelector('.pob-title');
    const name    = (titleEl.querySelector(isLangEn ? '.en-text' : '.fr-text') || titleEl).textContent.trim();
    const inputs = block.querySelectorAll('.size-qty input');
    const lines  = [];
    inputs.forEach(inp => {
      const qty = parseInt(inp.value) || 0;
      if (qty > 0) {
        lines.push(`  • ${inp.dataset.size}: ${qty}`);
        grandTotal += qty;
      }
    });
    if (lines.length) {
      msg += `*${name}:*\n${lines.join('\n')}\n\n`;
      const notesEl = block.querySelector('.pob-spec');
      if (notesEl && notesEl.value.trim()) msg += `  _Specs: ${notesEl.value.trim()}_\n\n`;
    }
  });

  msg += `*Total Units:* ${grandTotal.toLocaleString()}\n`;
  msg += `*Payment Preference:* ${payPref}\n`;
  if (notes) msg += `*Additional Notes:* ${notes}\n`;
  msg += `\n_Sent via alpharmagroup.com_`;
  return msg;
}

function submitBulkOrder(e) {
  e.preventDefault();
  if (!validateBulkForm()) return;
  const msg = buildBulkWhatsAppMessage();
  openWhatsApp(msg);
  showSuccess('bulkSuccess');
}

function emailBulkOrder() {
  if (!validateBulkForm()) return;
  var company = val('company');
  var contact = val('contactName');
  var phone   = val('orderPhone');
  var email   = val('orderEmail');
  var country = val('orderCountry');
  var payPref = checkedRadio('paymentPref') || 'To be discussed';
  var notes   = val('orderNotes');
  var isEn    = document.getElementById('htmlRoot').classList.contains('lang-en');
  var div     = '------------------------------------------------------------';

  var subject = isEn
    ? 'Bulk Order Request \u2014 ' + company
    : 'Demande de Commande Group\u00e9e \u2014 ' + company;

  var body = isEn ? 'Dear Alpharma Group,\n\n' : 'Bonjour Alpharma Group,\n\n';
  body += isEn
    ? 'Please find below our bulk PPE order request. We kindly ask you to confirm availability and provide a formal quotation at your earliest convenience.\n\n'
    : 'Veuillez trouver ci-dessous notre demande de commande group\u00e9e d\u2019\u00c9PI. Nous vous prions de confirmer la disponibilit\u00e9 et de nous transmettre un devis formel dans les meilleurs d\u00e9lais.\n\n';

  body += div + '\n';
  body += isEn ? 'COMPANY INFORMATION\n' : 'INFORMATIONS ENTREPRISE\n';
  body += div + '\n';
  body += (isEn ? 'Company:         ' : 'Entreprise :     ') + company + '\n';
  body += (isEn ? 'Contact Person:  ' : 'Contact :        ') + contact + '\n';
  body += (isEn ? 'Phone:           ' : 'T\u00e9l\u00e9phone :      ') + phone   + '\n';
  if (email)   body += (isEn ? 'Email:           ' : 'E-mail :         ') + email   + '\n';
  if (country) body += (isEn ? 'Location:        ' : 'Localisation :   ') + country + '\n';

  body += '\n' + div + '\n';
  body += isEn ? 'ORDER DETAILS\n' : 'D\u00c9TAILS DE LA COMMANDE\n';
  body += div + '\n\n';

  var grandTotal = 0;
  document.querySelectorAll('.product-order-block').forEach(function (block) {
    var header  = block.querySelector('.pob-header');
    if (!header.classList.contains('open')) return;
    var titleEl = block.querySelector('.pob-title');
    var name    = (titleEl.querySelector(isEn ? '.en-text' : '.fr-text') || titleEl).textContent.trim();
    var inputs  = block.querySelectorAll('.size-qty input');
    var lines   = [];
    inputs.forEach(function (inp) {
      var qty = parseInt(inp.value) || 0;
      if (qty > 0) { lines.push('    - ' + inp.dataset.size + ': ' + qty + ' unit(s)'); grandTotal += qty; }
    });
    if (lines.length) {
      body += name + ':\n' + lines.join('\n') + '\n';
      var specEl = block.querySelector('.pob-spec');
      if (specEl && specEl.value.trim()) body += '    Specifications: ' + specEl.value.trim() + '\n';
      body += '\n';
    }
  });

  body += div + '\n';
  body += isEn ? 'ORDER SUMMARY\n' : 'R\u00c9CAPITULATIF\n';
  body += div + '\n';
  body += (isEn ? 'Total Units:       ' : 'Total d\u2019unit\u00e9s :    ') + grandTotal.toLocaleString() + '\n';
  body += (isEn ? 'Payment Method:    ' : 'Mode de paiement : ') + payPref + '\n';
  if (notes) body += (isEn ? 'Additional Notes:  ' : 'Notes :            ') + notes + '\n';
  body += div + '\n\n';
  body += isEn
    ? 'We look forward to your response.\n\nBest regards,\n' + contact + '\n' + company
    : 'Dans l\u2019attente de votre r\u00e9ponse, veuillez agr\u00e9er nos cordiales salutations.\n\nCordialement,\n' + contact + '\n' + company;

  window.location.href = 'mailto:alpharmagroup1@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}

function validateBulkForm() {
  const required = ['company', 'contactName', 'orderPhone'];
  let ok = true;
  required.forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value.trim()) {
      el.style.borderColor = 'var(--danger)';
      ok = false;
    } else if (el) {
      el.style.borderColor = '';
    }
  });
  if (!ok) alert('Please fill in all required fields (Company, Contact Name, Phone).');
  return ok;
}

/* =====================
   BUILD WHATSAPP MESSAGE — Individual Order
   ===================== */
function submitIndividualOrder(e) {
  e.preventDefault();
  const name    = val('indName');
  const phone   = val('indPhone');
  const product = val('indProduct');
  const size    = val('indSize');
  const qty     = val('indQty');
  const payPref = val('indPayment');
  const notes   = val('indNotes');

  if (!name || !phone || !product) {
    alert('Please fill in Name, Phone and Product selection.');
    return;
  }

  let msg = `*🛒 INDIVIDUAL ORDER — ALPHARMA GROUP*\n\n`;
  msg += `*Name:* ${name}\n*Phone:* ${phone}\n`;
  msg += `*Product:* ${product}\n`;
  if (size) msg += `*Size:* ${size}\n`;
  if (qty)  msg += `*Quantity:* ${qty}\n`;
  if (payPref) msg += `*Payment:* ${payPref}\n`;
  if (notes)   msg += `*Notes:* ${notes}\n`;
  msg += `\n_Sent via alpharmagroup.com_`;

  openWhatsApp(msg);
  showSuccess('indSuccess');
}

/* =====================
   BUILD WHATSAPP MESSAGE — Inquiry
   ===================== */
function submitInquiry(e) {
  e.preventDefault();
  const name    = val('inqName');
  const company = val('inqCompany');
  const phone   = val('inqPhone');
  const email   = val('inqEmail');
  const message = val('inqMessage');

  if (!name || !phone || !message) {
    alert('Please fill in Name, Phone and your message.');
    return;
  }

  let msg = `*💬 INQUIRY — ALPHARMA GROUP*\n\n`;
  msg += `*Name:* ${name}\n`;
  if (company) msg += `*Company:* ${company}\n`;
  msg += `*Phone:* ${phone}\n`;
  if (email)   msg += `*Email:* ${email}\n`;
  msg += `\n*Message:*\n${message}\n`;
  msg += `\n_Sent via alpharmagroup.com_`;

  openWhatsApp(msg);
  showSuccess('inqSuccess');
}

/* =====================
   CONTACT FORM
   ===================== */
function submitContactForm(e) {
  e.preventDefault();
  const name    = val('ctName');
  const phone   = val('ctPhone');
  const subject = val('ctSubject');
  const message = val('ctMessage');

  if (!name || !phone || !message) {
    alert('Please fill in Name, Phone and Message.');
    return;
  }

  let msg = `*📩 CONTACT FORM — ALPHARMA GROUP*\n\n`;
  msg += `*Name:* ${name}\n*Phone:* ${phone}\n`;
  if (subject) msg += `*Subject:* ${subject}\n`;
  msg += `\n*Message:*\n${message}`;

  openWhatsApp(msg);
  showSuccess('ctSuccess');
}

/* =====================
   HELPERS
   ===================== */
function val(id)          { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function checkedRadio(name) { const el = document.querySelector(`input[name="${name}"]:checked`); return el ? el.value : null; }
function openWhatsApp(msg) { window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank'); }

function showSuccess(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('show'); el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
}

/* =====================
   QUICK WHATSAPP INQUIRY FROM PRODUCT PAGE
   ===================== */
function inquireProduct(productName) {
  const fr = document.getElementById('htmlRoot') && document.getElementById('htmlRoot').classList.contains('lang-en');
  const msg = fr
    ? `Hello Alpharma Group,\n\nI am interested in: *${productName}*\n\nPlease send me pricing, available sizes and ordering details.\n\nThank you.`
    : `Bonjour Alpharma Group,\n\nJe suis intéressé(e) par : *${productName}*\n\nMerci de m'envoyer les détails sur les prix, tailles disponibles et comment commander.\n\nCordialement.`;
  openWhatsApp(msg);
}

/* =====================
   LANGUAGE TOGGLE (FR default)
   ===================== */
(function () {
  const root   = document.getElementById('htmlRoot');
  const toggle = document.getElementById('langToggle');
  if (!root || !toggle) return;

  function applyLangToOptions(isEn) {
    document.querySelectorAll('option[data-fr]').forEach(function (opt) {
      opt.textContent = isEn ? opt.dataset.en : opt.dataset.fr;
    });
    document.querySelectorAll('optgroup[data-fr]').forEach(function (og) {
      og.label = isEn ? og.dataset.en : og.dataset.fr;
    });
    document.querySelectorAll('[data-placeholder-fr]').forEach(function (el) {
      el.placeholder = isEn ? el.dataset.placeholderEn : el.dataset.placeholderFr;
    });
  }

  const saved = localStorage.getItem('alpharma-lang') || 'fr';
  if (saved === 'en') root.classList.add('lang-en');
  applyLangToOptions(saved === 'en');

  toggle.addEventListener('click', () => {
    const isEn = root.classList.toggle('lang-en');
    localStorage.setItem('alpharma-lang', isEn ? 'en' : 'fr');
    applyLangToOptions(isEn);
  });
})();

/* =====================
   PRINT / SAVE PDF QUOTE
   ===================== */
function printQuote() {
  var isEn = !!(document.getElementById('htmlRoot') && document.getElementById('htmlRoot').classList.contains('lang-en'));
  var company = val('company')     || (isEn ? 'Not provided'   : 'Non renseign&#233;');
  var contact = val('contactName') || '&mdash;';
  var phone   = val('orderPhone')  || '&mdash;';
  var email   = val('orderEmail')  || '&mdash;';
  var country = val('orderCountry')|| '&mdash;';
  var pay     = checkedRadio('paymentPref') || (isEn ? 'To be discussed' : '&#192; discuter');
  var notes   = val('orderNotes');
  var date    = new Date().toLocaleDateString(isEn ? 'en-GB' : 'fr-FR', {day:'2-digit', month:'long', year:'numeric'});

  var rows = ''; var grandTotal = 0;
  document.querySelectorAll('.product-order-block').forEach(function(block) {
    if (!block.querySelector('.pob-header').classList.contains('open')) return;
    var name   = block.querySelector('.pob-title').textContent.trim();
    var inputs = block.querySelectorAll('.size-qty input');
    var lines  = [];
    inputs.forEach(function(inp) {
      var qty = parseInt(inp.value) || 0;
      if (qty > 0) {
        grandTotal += qty;
        lines.push('<tr><td class="td-s">' + (inp.dataset.size || '?') + '</td><td class="td-q">' + qty.toLocaleString() + '</td></tr>');
      }
    });
    if (lines.length) {
      rows += '<tr class="tr-cat"><td colspan="2">' + name + '</td></tr>' + lines.join('');
      var specEl = block.querySelector('.pob-spec');
      var spec   = specEl ? specEl.value.trim() : '';
      if (spec) rows += '<tr><td colspan="2" class="td-spec">' + spec + '</td></tr>';
    }
  });

  var lbl = {
    title : isEn ? 'ORDER QUOTE'        : 'DEVIS DE COMMANDE',
    sub   : isEn ? 'Certified PPE &mdash; Mining &amp; Industry &mdash; Conakry, Guinea' : '&#201;PI Certifi&#233;s &mdash; Mines &amp; Industrie &mdash; Conakry, Guin&#233;e',
    ci    : isEn ? 'Client Information' : 'Informations Client',
    co    : isEn ? 'Company'            : 'Soci&#233;t&#233;',
    ct    : isEn ? 'Contact'            : 'Contact',
    ph    : isEn ? 'Phone'              : 'T&#233;l&#233;phone',
    lo    : isEn ? 'Location'           : 'Localisation',
    pm    : isEn ? 'Payment Method'     : 'Mode de Paiement',
    od    : isEn ? 'Order Details'      : 'D&#233;tail de la Commande',
    ps    : isEn ? 'Product / Size'     : 'Produit / Taille',
    qty   : isEn ? 'Qty'               : 'Qt&#233;',
    tot   : isEn ? 'TOTAL UNITS'        : 'TOTAL UNIT&#201;S',
    sr    : isEn ? 'Special Requirements': 'Exigences Sp&#233;ciales',
    none  : isEn ? 'No products selected.' : 'Aucun produit s&#233;lectionn&#233;.'
  };

  var orderTable = rows
    ? '<table><thead><tr style="background:#f4a620"><th class="th-l">' + lbl.ps + '</th><th class="th-r">' + lbl.qty + '</th></tr></thead><tbody>' + rows + '</tbody><tfoot><tr class="tr-tot"><td>' + lbl.tot + '</td><td class="td-qt">' + grandTotal.toLocaleString() + '</td></tr></tfoot></table>'
    : '<p class="empty">' + lbl.none + '</p>';

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
    + '<title>' + lbl.title + ' &mdash; Alpharma Group</title>'
    + '<style>'
    + '*{box-sizing:border-box;margin:0;padding:0}'
    + 'body{font-family:Arial,sans-serif;color:#1a2744;padding:28px 36px;font-size:13px}'
    + '.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #f4a620;padding-bottom:14px;margin-bottom:20px}'
    + '.brand{font-size:22px;font-weight:800}.brand span{color:#f4a620}'
    + '.sub{font-size:11px;color:#666;margin-top:3px}'
    + '.meta{font-size:11px;color:#555;text-align:right;line-height:1.8}'
    + 'h2{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #ddd;padding-bottom:5px;margin:18px 0 8px}'
    + 'table{width:100%;border-collapse:collapse}'
    + '.il{color:#555;width:35%;padding:5px 10px 5px 0;vertical-align:top;font-size:12px}'
    + '.iv{font-weight:600;padding:5px 0;font-size:12px}'
    + '.pay-row td{background:#f0f4ff;font-weight:700}'
    + '.tr-cat td{background:#1a2744;color:#fff;font-weight:600;padding:6px 10px;font-size:12px}'
    + '.td-s{padding:5px 10px;border-bottom:1px solid #eee}'
    + '.td-q{padding:5px 10px;border-bottom:1px solid #eee;text-align:right}'
    + '.td-spec{padding:4px 10px 8px;font-size:11px;color:#666;font-style:italic;border-bottom:1px solid #eee}'
    + '.tr-tot td{font-weight:700;font-size:14px;padding:10px;border-top:2px solid #1a2744}'
    + '.td-qt{text-align:right}'
    + '.th-l{padding:7px 10px;text-align:left;color:#1a2744}'
    + '.th-r{padding:7px 10px;text-align:right;color:#1a2744}'
    + '.notes{background:#fffbf0;border:1px solid #f4a620;border-radius:4px;padding:10px;font-size:12px;margin-top:6px}'
    + '.empty{opacity:.5;font-size:12px;margin-top:6px}'
    + '.footer{margin-top:28px;border-top:1px solid #ddd;padding-top:10px;font-size:10px;color:#888;text-align:center;line-height:1.8}'
    + '@page{margin:1.5cm}'
    + '.logo-svg{width:40px;height:40px;flex-shrink:0}'
    + '</style></head><body>'
    + '<div class="hdr"><div style="display:flex;align-items:center;gap:12px">'
    + '<svg class="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44" fill="none"><polygon points="22,2 42,18 22,42 2,18" fill="#f4a620"/><polygon points="22,2 42,18 22,22" fill="#1a2744" opacity=".18"/><polygon points="22,2 2,18 22,22" fill="#fff" opacity=".12"/><polygon points="22,10 34,20 22,34 10,20" fill="#1a2744" opacity=".4"/><circle cx="22" cy="20" r="2.5" fill="#fff" opacity=".65"/></svg>'
    + '<div><div class="brand">Alpha<span>rma</span> Group</div><div class="sub">' + lbl.sub + '</div></div></div>'
    + '<div class="meta"><strong>' + lbl.title + '</strong><br>' + date + '<br>alpharmagroup1@gmail.com<br>+33 6 27 29 16 46</div></div>'
    + '<h2>' + lbl.ci + '</h2>'
    + '<table>'
    + '<tr><td class="il">' + lbl.co + '</td><td class="iv">' + company + '</td></tr>'
    + '<tr><td class="il">' + lbl.ct + '</td><td class="iv">' + contact + '</td></tr>'
    + '<tr><td class="il">' + lbl.ph + '</td><td class="iv">' + phone   + '</td></tr>'
    + '<tr><td class="il">Email</td><td class="iv">'          + email   + '</td></tr>'
    + '<tr><td class="il">' + lbl.lo + '</td><td class="iv">' + country + '</td></tr>'
    + '<tr class="pay-row"><td class="il">' + lbl.pm + '</td><td class="iv">' + pay + '</td></tr>'
    + '</table>'
    + '<h2>' + lbl.od + '</h2>'
    + orderTable
    + (notes ? '<h2>' + lbl.sr + '</h2><div class="notes">' + notes + '</div>' : '')
    + '<div class="footer">Alpharma Group &mdash; March&#233; Sangoyah, Conakry, R&#233;publique de Guin&#233;e<br>'
    + 'Correspondant commercial : 14 Rue des Carrieres, 95360 Montmagny, France<br>'
    + 'alpharmagroup1@gmail.com &middot; +33 6 27 29 16 46 &middot; +224 611 40 80 54</div>'
    + '<scr' + 'ipt>window.onload=function(){window.focus();window.print();window.onafterprint=function(){window.close();};}</scr' + 'ipt>'
    + '</body></html>';

  var w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); w.focus(); }
}
