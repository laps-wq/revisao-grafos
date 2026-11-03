/* lib.js — peças de interface do site de revisão (sem dependências). */
(function () {
  'use strict';

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  /** Cria um elemento: h('div', {class: 'x', onclick: fn}, filhos...) */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'class') el.className = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }

  // ------------------------------------------------ marcação de conteúdo (HTML) ---
  const P = (...ps) => ps.map((p) => `<p>${p}</p>`).join('');
  const caixa = (tipo, titulo, corpo) =>
    `<aside class="caixa caixa-${tipo}"><div class="caixa-tit">${titulo}</div>${corpo.startsWith('<') ? corpo : `<p>${corpo}</p>`}</aside>`;
  const dica = (c, t = 'Dica') => caixa('dica', t, c);
  const armadilha = (c, t = 'Armadilha de prova') => caixa('armadilha', t, c);
  const nota = (c, t = 'Para guardar') => caixa('nota', t, c);
  const lista = (itens) => `<ul>${itens.map((i) => `<li>${i}</li>`).join('')}</ul>`;
  const passos = (itens) => `<ol class="passos">${itens.map((i) => `<li>${i}</li>`).join('')}</ol>`;
  const formula = (s, legenda) => `<div class="formula"><span>${s}</span>${legenda ? `<small>${legenda}</small>` : ''}</div>`;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /** Bloco de pseudocódigo: linhas numeradas; "// comentário" vira destaque. */
  function codigo(linhas, titulo) {
    const corpo = linhas
      .map((l, i) => {
        const [cod, com] = l.split('//');
        const num = /^\s*\d+\s/.test(l) ? '' : '';
        return `<span class="cl">${num}${esc(cod)}${com != null ? `<em>// ${esc(com.trim())}</em>` : ''}</span>`;
      })
      .join('\n');
    return `<figure class="codigo">${titulo ? `<figcaption>${titulo}</figcaption>` : ''}<pre><code>${corpo}</code></pre></figure>`;
  }

  function tabela(cab, linhas, op = {}) {
    const th = cab.map((c) => `<th>${c}</th>`).join('');
    const tr = linhas
      .map((l, i) => `<tr${op.destaque && op.destaque.includes(i) ? ' class="dest"' : ''}>${l.map((c) => `<td>${c}</td>`).join('')}</tr>`)
      .join('');
    return `<div class="tabela-wrap"><table class="${op.classe || ''}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
  }

  // ------------------------------------------------------------ progresso ---
  const CHAVE = 'revisao-grafos-v1';
  function lerProgresso() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE)) || {};
    } catch (e) {
      return {};
    }
  }
  function gravarProgresso(p) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(p));
    } catch (e) {
      /* sem armazenamento: o site funciona do mesmo jeito */
    }
  }

  // ------------------------------------------------------- múltipla escolha ---
  const LETRAS = 'ABCDE';

  /** q = {enun, opts, c, e, fonte?, w?}; onResp(acertou) é chamado na 1ª resposta. */
  function renderMCQ(alvo, q, onResp, op = {}) {
    alvo.replaceChildren();
    const card = h('div', { class: 'mcq' });
    if (op.titulo || q.fonte) {
      card.append(
        h('div', { class: 'mcq-cab' },
          op.titulo ? h('span', { class: 'mcq-num' }, op.titulo) : null,
          q.fonte ? h('span', { class: 'mcq-fonte' }, q.fonte) : null)
      );
    }
    card.append(h('div', { class: 'mcq-enun', html: q.enun }));
    const lista = h('div', { class: 'mcq-opts', role: 'group', 'aria-label': 'Alternativas' });
    const fb = h('div', { class: 'mcq-fb', hidden: true, 'aria-live': 'polite' });
    let respondida = false;
    q.opts.forEach((o, i) => {
      const b = h('button', { class: 'opt', type: 'button', 'data-i': i },
        h('span', { class: 'opt-l' }, LETRAS[i]), h('span', { class: 'opt-t', html: o }));
      b.addEventListener('click', () => {
        if (respondida) return;
        respondida = true;
        const ok = i === q.c;
        $$('.opt', lista).forEach((x, j) => {
          x.disabled = true;
          if (j === q.c) x.classList.add('certa');
          else if (j === i) x.classList.add('errada');
        });
        fb.hidden = false;
        fb.className = 'mcq-fb ' + (ok ? 'ok' : 'nok');
        fb.innerHTML = `<strong>${ok ? 'Certo.' : `Não é essa. A resposta é a ${LETRAS[q.c]}.`}</strong> ${q.e}`;
        if (!ok && q.w && q.w[i]) fb.innerHTML += `<p class="mcq-w"><b>Por que a ${LETRAS[i]} engana:</b> ${q.w[i]}</p>`;
        fb.append(h('button', { class: 'btn-link', type: 'button', onclick: () => renderMCQ(alvo, q, null, op) }, 'Tentar de novo'));
        if (onResp) onResp(ok);
      });
      lista.append(b);
    });
    card.append(lista, fb);
    alvo.append(card);
    return card;
  }

  // ------------------------------------------------------------- classificar ---
  /** cfg = {pergunta, cats: [...], itens: [{t, c, e?}]} */
  function renderClassify(alvo, cfg) {
    alvo.replaceChildren();
    let feitos = 0, acertos = 0;
    const placar = h('p', { class: 'placar', 'aria-live': 'polite' });
    const atualiza = () => (placar.textContent = `${acertos} de ${feitos} certos · ${cfg.itens.length - feitos} para fazer`);
    if (cfg.pergunta) alvo.append(h('p', { class: 'ativ-perg', html: cfg.pergunta }));
    const ul = h('div', { class: 'classif' });
    cfg.itens.forEach((it) => {
      const linha = h('div', { class: 'classif-item' });
      const txt = h('div', { class: 'classif-t', html: it.t });
      const bots = h('div', { class: 'classif-b' });
      const fb = h('div', { class: 'classif-fb', hidden: true });
      cfg.cats.forEach((cat, ci) => {
        bots.append(h('button', {
          class: 'chip', type: 'button',
          onclick: (ev) => {
            if (linha.dataset.ok) return;
            const ok = ci === it.c;
            linha.dataset.ok = ok ? 's' : 'n';
            feitos++; if (ok) acertos++;
            [...bots.children].forEach((b, j) => {
              b.disabled = true;
              if (j === it.c) b.classList.add('certa');
              else if (j === ci) b.classList.add('errada');
            });
            fb.hidden = false;
            fb.innerHTML = `<strong>${ok ? 'Certo' : `É ${cfg.cats[it.c]}`}.</strong> ${it.e || ''}`;
            atualiza();
          },
        }, cat));
      });
      linha.append(txt, bots, fb);
      ul.append(linha);
    });
    alvo.append(ul, placar);
    atualiza();
  }

  // ---------------------------------------------------------------- checklist ---
  function renderChecklist(alvo, cfg) {
    alvo.replaceChildren();
    const chave = 'chk-' + cfg.id;
    let marc = {};
    try { marc = JSON.parse(localStorage.getItem(chave)) || {}; } catch (e) { marc = {}; }
    const ul = h('ul', { class: 'check' });
    cfg.itens.forEach((it, i) => {
      const id = `${cfg.id}-${i}`;
      const cb = h('input', { type: 'checkbox', id, checked: marc[i] ? true : null });
      cb.addEventListener('change', () => {
        marc[i] = cb.checked;
        try { localStorage.setItem(chave, JSON.stringify(marc)); } catch (e) { /* ok */ }
      });
      ul.append(h('li', {}, cb, h('label', { for: id, html: it })));
    });
    alvo.append(ul);
  }

  // ------------------------------------------------------- pergunta e resposta ---
  function renderQA(alvo, itens) {
    alvo.replaceChildren();
    itens.forEach((it, i) => {
      const resp = h('div', { class: 'qa-r', hidden: true, html: it.a });
      const b = h('button', { class: 'btn-sec', type: 'button', 'aria-expanded': 'false' }, 'Mostrar resposta');
      b.addEventListener('click', () => {
        resp.hidden = !resp.hidden;
        b.textContent = resp.hidden ? 'Mostrar resposta' : 'Esconder resposta';
        b.setAttribute('aria-expanded', String(!resp.hidden));
      });
      alvo.append(h('div', { class: 'qa' }, h('div', { class: 'qa-q', html: `<span class="qa-n">${i + 1}</span>${it.q}` }), b, resp));
    });
  }

  // ------------------------------------------------------------------ passo a passo ---
  /** frames = [{texto, ...}]; desenhar(frame, areaFigura, areaTabela) */
  function stepper(alvo, frames, desenhar, op = {}) {
    alvo.replaceChildren();
    let i = 0;
    const fig = h('div', { class: 'st-fig' });
    const lado = h('div', { class: 'st-lado' });
    const texto = h('div', { class: 'st-texto', 'aria-live': 'polite' });
    const cont = h('span', { class: 'st-cont' });
    const ant = h('button', { class: 'btn-sec', type: 'button' }, '← Anterior');
    const prox = h('button', { class: 'btn', type: 'button' }, 'Próximo →');
    const ini = h('button', { class: 'btn-link', type: 'button' }, 'Recomeçar');
    const barra = h('div', { class: 'st-barra' }, h('div', { class: 'st-prog' }));
    const caixa = h('div', { class: 'stepper', tabindex: '0' },
      h('div', { class: 'st-corpo' + (op.sozinha ? ' sozinha' : '') }, fig, op.sozinha ? null : lado),
      barra, texto, h('div', { class: 'st-ctrl' }, ant, cont, prox, ini));
    function mostra() {
      const f = frames[i];
      desenhar(f, fig, lado);
      texto.innerHTML = f.texto;
      cont.textContent = `Passo ${i + 1} de ${frames.length}`;
      ant.disabled = i === 0;
      prox.disabled = i === frames.length - 1;
      barra.firstChild.style.width = `${((i + 1) / frames.length) * 100}%`;
    }
    ant.onclick = () => { if (i > 0) { i--; mostra(); } };
    prox.onclick = () => { if (i < frames.length - 1) { i++; mostra(); } };
    ini.onclick = () => { i = 0; mostra(); };
    caixa.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { prox.onclick(); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { ant.onclick(); e.preventDefault(); }
    });
    alvo.append(caixa);
    mostra();
  }

  /** Tabela simples para o painel do passo a passo. */
  function tabelaEl(cab, linhas, destaque) {
    const t = h('table', { class: 'st-tab' });
    t.append(h('thead', {}, h('tr', {}, cab.map((c) => h('th', {}, c)))));
    const tb = h('tbody');
    linhas.forEach((l, i) => {
      const tr = h('tr', { class: destaque && destaque.includes(i) ? 'dest' : null });
      l.forEach((c) => tr.append(h('td', { html: String(c) })));
      tb.append(tr);
    });
    t.append(tb);
    return h('div', { class: 'tabela-wrap' }, t);
  }

  window.UI = { $, $$, h, P, caixa, dica, armadilha, nota, lista, passos, formula, codigo, tabela, esc,
    lerProgresso, gravarProgresso, renderMCQ, renderClassify, renderChecklist, renderQA, stepper, tabelaEl, LETRAS };
})();
