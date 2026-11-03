/* app.js — navegação, páginas dos módulos, busca, progresso e tema. */
(function () {
  'use strict';
  const { $, $$, h, renderMCQ, renderClassify, renderChecklist, renderQA, lerProgresso, gravarProgresso } = window.UI;
  const MODULOS = window.MODULOS || [];
  const ABAS = [['conteudo', 'Conteúdo'], ['exemplos', 'Exemplos'], ['atividades', 'Atividades'], ['desafios', 'Desafios']];
  const GRUPOS = ['Base', 'Caminhos e árvores', 'Modelagem e complexidade', 'Prova'];
  let prog = lerProgresso();

  // ---------------------------------------------------------------- rotas ---
  // Rotas simples, só letras, números e hífen: #inicio, #agm, #agm-desafios ...
  function rotaAtual() {
    const hs = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!hs || hs === 'inicio') return { pag: 'inicio' };
    for (const m of MODULOS) {
      if (hs === m.id) return { pag: 'mod', m, aba: 'conteudo' };
      for (const [a] of ABAS) if (hs === `${m.id}-${a}`) return { pag: 'mod', m, aba: a };
    }
    return { pag: 'inicio' };
  }
  const link = (m, aba) => `#${m.id}${aba && aba !== 'conteudo' ? '-' + aba : ''}`;

  // ------------------------------------------------------------ progresso ---
  function registra(mid, i, ok) {
    prog[mid] = prog[mid] || {};
    if (prog[mid][i] == null) prog[mid][i] = ok;
    gravarProgresso(prog);
    atualizaBarra();
  }
  function placar(m) {
    const p = prog[m.id] || {};
    const feitas = Object.keys(p).length;
    const certas = Object.values(p).filter(Boolean).length;
    return { feitas, certas, total: m.desafios.length };
  }

  // -------------------------------------------------------------- barra lateral ---
  function montaLateral() {
    const nav = $('#lateral-nav');
    nav.replaceChildren();
    nav.append(h('a', { href: '#inicio', class: 'lat-inicio' }, 'Início'));
    GRUPOS.forEach((g) => {
      const ms = MODULOS.filter((m) => m.grupo === g);
      if (!ms.length) return;
      nav.append(h('div', { class: 'lat-grupo' }, g));
      ms.forEach((m) => {
        nav.append(h('a', { href: link(m), class: 'lat-mod', 'data-id': m.id },
          h('span', { class: 'lat-num' }, String(MODULOS.indexOf(m) + 1)),
          h('span', { class: 'lat-tit' }, m.curto),
          h('span', { class: 'lat-prog', 'aria-hidden': 'true' }, h('i'))));
      });
    });
    atualizaBarra();
  }
  function atualizaBarra() {
    $$('.lat-mod').forEach((a) => {
      const m = MODULOS.find((x) => x.id === a.dataset.id);
      const p = placar(m);
      a.querySelector('.lat-prog i').style.width = `${p.total ? (p.feitas / p.total) * 100 : 0}%`;
      a.title = `${p.feitas} de ${p.total} desafios feitos`;
    });
  }

  // ------------------------------------------------------------------ início ---
  function paginaInicio(main) {
    const todos = MODULOS.flatMap((m) => m.desafios.map((q, i) => ({ m, q, i })));
    const hero = h('section', { class: 'hero' },
      h('div', { class: 'hero-txt' },
        h('p', { class: 'olho' }, 'Revisão ENADE 2026 · Ciência da Computação · CESAR School'),
        h('h1', {}, 'Revisão de Teoria dos Grafos'),
        h('p', { class: 'lead' }, 'Tudo explicado do começo, para quem cursou grafos há tempos, em outra turma ou quer só relembrar. Exemplos que andam passo a passo, questões de provas anteriores do ENADE e questões inéditas comentadas.')),
      h('div', { class: 'hero-fig', html: HERO_SVG }));
    const comecar = h('section', { class: 'bloco' }, h('h2', {}, 'Por onde começar'),
      h('div', { class: 'trilhas' },
        trilha('Se a base está fraca', 'Comece pelo vocabulário, pelas representações e pelas buscas. Elas sustentam todo o resto.', ['fundamentos', 'buscas']),
        trilha('Para a discursiva', 'Buscas, Dijkstra e árvore geradora mínima, e as discursivas de grafos que já caíram, com o que o Inep aceitou.', ['buscas', 'caminhos-minimos', 'discursiva']),
        trilha('Modelagem', 'Gulosos, pseudocódigo, grafos de conflito e coloração, com um exemplo feito a partir de uma notícia real.', ['gulosos', 'coloracao']),
        trilha('Para ir além', 'Labirintos e A*, Euler e Hamilton com P × NP, e fluxo máximo: mais assuntos de grafos que podem cair na prova.', ['labirintos-astar', 'euler-hamilton', 'fluxo'])));
    const grade = h('div', { class: 'cards' });
    MODULOS.forEach((m, k) => {
      const p = placar(m);
      grade.append(h('a', { href: link(m), class: 'card-mod' },
        h('span', { class: 'card-olho' }, `Módulo ${k + 1} · ${m.grupo}`),
        h('span', { class: 'card-tit' }, m.titulo),
        h('span', { class: 'card-txt' }, m.resumo),
        h('span', { class: 'card-rodape' }, h('span', { class: 'card-barra' }, h('i', { style: `width:${p.total ? (p.feitas / p.total) * 100 : 0}%` })),
          h('span', {}, `${p.feitas}/${p.total} desafios`))));
    });
    const relampago = h('section', { class: 'bloco relampago' }, h('h2', {}, 'Questão relâmpago'),
      h('p', { class: 'sub' }, 'Uma questão sorteada de qualquer módulo. Responda, leia o comentário e sorteie outra.'));
    const area = h('div');
    const sorteia = () => {
      const { m, q, i } = todos[Math.floor(Math.random() * todos.length)];
      renderMCQ(area, q, (ok) => registra(m.id, i, ok), { titulo: `${m.curto} · desafio ${i + 1}` });
    };
    relampago.append(area, h('button', { class: 'btn', type: 'button', onclick: sorteia }, 'Sortear outra'));
    main.replaceChildren(hero, comecar, h('section', { class: 'bloco' }, h('h2', {}, 'Módulos'), grade), relampago);
    sorteia();
    document.title = 'Revisão de Teoria dos Grafos · ENADE';
  }
  function trilha(tit, txt, ids) {
    return h('div', { class: 'trilha' }, h('h3', {}, tit), h('p', {}, txt),
      h('div', { class: 'trilha-links' }, ids.map((id) => { const m = MODULOS.find((x) => x.id === id); return m ? h('a', { href: link(m) }, m.curto) : null; })));
  }

  // ------------------------------------------------------------------ módulo ---
  function paginaModulo(main, m, aba) {
    const k = MODULOS.indexOf(m);
    const cab = h('header', { class: 'mod-cab' },
      h('p', { class: 'olho' }, `Módulo ${k + 1} · ${m.grupo}`),
      h('h1', {}, m.titulo),
      h('p', { class: 'lead' }, m.resumo),
      m.enade ? h('p', { class: 'mod-enade' }, h('span', {}, 'Já caiu'), ` ${m.enade}`) : null);
    const p = placar(m);
    const abas = h('nav', { class: 'abas', 'aria-label': 'Seções do módulo' }, ABAS.map(([a, rot]) =>
      h('a', { href: link(m, a), class: 'aba' + (a === aba ? ' ativa' : ''), 'aria-current': a === aba ? 'page' : null },
        rot, a === 'desafios' ? h('span', { class: 'aba-n' }, `${p.feitas}/${p.total}`) : null)));
    const corpo = h('div', { class: 'mod-corpo' });
    if (aba === 'conteudo') abaConteudo(corpo, m);
    if (aba === 'exemplos') abaExemplos(corpo, m);
    if (aba === 'atividades') abaAtividades(corpo, m);
    if (aba === 'desafios') abaDesafios(corpo, m);
    const nav = h('nav', { class: 'mod-nav', 'aria-label': 'Navegação entre módulos' },
      k > 0 ? h('a', { href: link(MODULOS[k - 1]) }, `← ${MODULOS[k - 1].curto}`) : h('span'),
      k < MODULOS.length - 1 ? h('a', { href: link(MODULOS[k + 1]) }, `${MODULOS[k + 1].curto} →`) : h('span'));
    main.replaceChildren(cab, abas, corpo, nav);
    document.title = `${m.curto} · Revisão de Grafos`;
  }

  function abaConteudo(el, m) {
    const sumario = h('nav', { class: 'sumario', 'aria-label': 'Tópicos' }, m.topicos.map((t, i) =>
      h('a', { href: `#${m.id}`, onclick: (e) => { e.preventDefault(); document.getElementById(`t-${m.id}-${i}`).scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, t.t)));
    el.append(sumario);
    m.topicos.forEach((t, i) => {
      el.append(h('section', { class: 'topico', id: `t-${m.id}-${i}` }, h('h2', {}, t.t), h('div', { class: 'prosa', html: t.h })));
    });
    el.append(h('p', { class: 'proximo' }, 'Agora veja os ', h('a', { href: link(m, 'exemplos') }, 'exemplos passo a passo'), ' e depois teste nos ', h('a', { href: link(m, 'desafios') }, 'desafios'), '.'));
  }

  function abaExemplos(el, m) {
    m.exemplos.forEach((ex) => {
      const area = h('div', { class: 'ex-area' });
      el.append(h('section', { class: 'exemplo' }, h('h2', {}, ex.t), h('div', { class: 'prosa', html: ex.d }), area));
      try { ex.mount(area); } catch (err) { area.append(h('p', { class: 'nok' }, 'Não foi possível montar este exemplo.')); console.error(err); }
      if (ex.depois) el.lastChild.append(h('div', { class: 'prosa depois', html: ex.depois }));
    });
  }

  function abaAtividades(el, m) {
    m.atividades.forEach((at) => {
      const area = h('div', { class: 'ativ-area' });
      el.append(h('section', { class: 'atividade' }, h('h2', {}, at.t), at.d ? h('div', { class: 'prosa', html: at.d }) : null, area));
      if (at.tipo === 'classificar') renderClassify(area, at.cfg);
      if (at.tipo === 'checklist') renderChecklist(area, at.cfg || { id: at.id, itens: at.itens });
      if (at.tipo === 'qa') renderQA(area, at.itens);
    });
  }

  function abaDesafios(el, m) {
    const p = placar(m);
    const topo = h('div', { class: 'desafios-topo' },
      h('p', {}, h('b', {}, `${p.certas} certas`), ` em ${p.feitas} respondidas de ${p.total}. Conta a primeira resposta de cada questão.`),
      h('button', { class: 'btn-link', type: 'button', onclick: () => { delete prog[m.id]; gravarProgresso(prog); atualizaBarra(); render(); } }, 'Zerar este módulo'));
    el.append(topo);
    m.desafios.forEach((q, i) => {
      const area = h('div', { class: 'desafio', id: `d-${m.id}-${i}` });
      el.append(area);
      renderMCQ(area, q, (ok) => registra(m.id, i, ok), { titulo: `Desafio ${i + 1}` });
    });
  }

  // ------------------------------------------------------------------- busca ---
  let indice = null;
  function montaIndice() {
    const tira = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    indice = [];
    MODULOS.forEach((m) => {
      m.topicos.forEach((t) => indice.push({ m, aba: 'conteudo', tit: t.t, txt: tira(t.h) }));
      m.exemplos.forEach((x) => indice.push({ m, aba: 'exemplos', tit: x.t, txt: tira(x.d) }));
      m.desafios.forEach((q, i) => indice.push({ m, aba: 'desafios', tit: `Desafio ${i + 1}`, txt: tira(q.enun) }));
    });
  }
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  function busca(termo) {
    const box = $('#busca-res');
    const t = norm(termo.trim());
    if (t.length < 2) { box.hidden = true; return; }
    if (!indice) montaIndice();
    const achados = indice.filter((x) => norm(x.tit + ' ' + x.txt).includes(t)).slice(0, 12);
    box.replaceChildren();
    if (!achados.length) box.append(h('p', { class: 'busca-vazio' }, 'Nada encontrado. Tente outra palavra, como “Dijkstra” ou “clique”.'));
    achados.forEach((x) => {
      const i = norm(x.txt).indexOf(t);
      const trecho = i >= 0 ? '…' + x.txt.slice(Math.max(0, i - 40), i + 70) + '…' : x.txt.slice(0, 100) + '…';
      box.append(h('a', { href: link(x.m, x.aba), class: 'busca-item', onclick: () => { box.hidden = true; $('#busca').value = ''; } },
        h('span', { class: 'busca-mod' }, `${x.m.curto} · ${ABAS.find((a) => a[0] === x.aba)[1]}`), h('span', { class: 'busca-tit' }, x.tit), h('span', { class: 'busca-trecho' }, trecho)));
    });
    box.hidden = false;
  }

  // -------------------------------------------------------------------- tema ---
  function iniciaTema() {
    let salvo = null;
    try { salvo = localStorage.getItem('revisao-grafos-tema'); } catch (e) { salvo = null; }
    if (salvo === 'light' || salvo === 'dark') document.documentElement.dataset.theme = salvo;
    $('#tema').addEventListener('click', () => {
      const atual = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const novo = atual === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = novo;
      try { localStorage.setItem('revisao-grafos-tema', novo); } catch (e) { /* ok */ }
    });
  }

  // ------------------------------------------------------------------ render ---
  function render() {
    const r = rotaAtual();
    const main = $('#conteudo');
    if (r.pag === 'inicio') paginaInicio(main);
    else paginaModulo(main, r.m, r.aba);
    $$('.lat-mod').forEach((a) => a.classList.toggle('ativo', !!(r.m && a.dataset.id === r.m.id)));
    document.body.classList.remove('menu-aberto');
    window.scrollTo(0, 0);
  }

  const HERO_SVG = `<svg viewBox="0 0 220 150" role="img" aria-label="Grafo com um caminho mínimo em destaque">
    <g class="h-ar"><line x1="25" y1="75" x2="80" y2="30"/><line x1="25" y1="75" x2="80" y2="120"/><line x1="80" y1="30" x2="80" y2="120"/>
    <line x1="80" y1="30" x2="145" y2="40"/><line x1="80" y1="120" x2="145" y2="110"/><line x1="145" y1="40" x2="145" y2="110"/><line x1="145" y1="40" x2="198" y2="75"/><line x1="145" y1="110" x2="198" y2="75"/></g>
    <g class="h-cam"><line x1="25" y1="75" x2="80" y2="120"/><line x1="80" y1="120" x2="80" y2="30"/><line x1="80" y1="30" x2="145" y2="40"/><line x1="145" y1="40" x2="198" y2="75"/></g>
    <g class="h-pe"><text x="45" y="45">7</text><text x="44" y="110">3</text><text x="88" y="78">2</text><text x="112" y="27">4</text><text x="112" y="128">8</text><text x="153" y="78">2</text><text x="176" y="50">5</text><text x="176" y="106">9</text></g>
    <g class="h-no"><circle cx="25" cy="75" r="11"/><circle cx="80" cy="30" r="11"/><circle cx="80" cy="120" r="11"/><circle cx="145" cy="40" r="11"/><circle cx="145" cy="110" r="11"/><circle cx="198" cy="75" r="11"/></g>
    <g class="h-ro"><text x="25" y="75">A</text><text x="80" y="30">B</text><text x="80" y="120">C</text><text x="145" y="40">D</text><text x="145" y="110">E</text><text x="198" y="75">F</text></g></svg>`;

  // ------------------------------------------------------------------- início ---
  function boot() {
    montaLateral();
    iniciaTema();
    $('.pular').addEventListener('click', (e) => { e.preventDefault(); $('#conteudo').focus(); });
    $('#menu').addEventListener('click', () => document.body.classList.toggle('menu-aberto'));
    $('#fecha-menu').addEventListener('click', () => document.body.classList.remove('menu-aberto'));
    const b = $('#busca');
    b.addEventListener('input', () => busca(b.value));
    b.addEventListener('keydown', (e) => { if (e.key === 'Escape') { b.value = ''; busca(''); } });
    document.addEventListener('click', (e) => { if (!e.target.closest('.busca')) $('#busca-res').hidden = true; });
    window.addEventListener('hashchange', render);
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
