/* grafos.js — desenho de grafos em SVG, algoritmos passo a passo e laboratórios.
   Convenções: tabela do Dijkstra com (distância, predecessor),
   vizinhos em ordem crescente, estados NAO_VISITADO / VISITADO / ENCERRADO, ABERTA e FECHADA no A*. */
(function () {
  'use strict';
  const { h, stepper, tabelaEl } = window.UI;
  const NS = 'http://www.w3.org/2000/svg';
  const INF = Infinity;
  const fmt = (x) => (x === INF ? '∞' : x === -INF ? '−∞' : String(x).replace('-', '−').replace('.', ','));
  const brl = (x) => x.toFixed(2).replace('.', ',');

  function S(tag, attrs = {}, txt) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (txt != null) e.textContent = txt;
    return e;
  }
  const chave = (G, u, v) => (G.dirigido ? `${u}>${v}` : u < v ? `${u}-${v}` : `${v}-${u}`);
  const ordenar = (a, b) => String(a).localeCompare(String(b), 'pt', { numeric: true });
  const vertices = (G) => Object.keys(G.nos);

  function vizinhos(G) {
    const a = {};
    for (const id in G.nos) a[id] = [];
    for (const [u, v, w] of G.arestas) {
      a[u].push([v, w]);
      if (!G.dirigido) a[v].push([u, w]);
    }
    for (const id in a) a[id].sort((x, y) => ordenar(x[0], y[0]));
    return a;
  }

  // ------------------------------------------------------------------- desenho ---
  /**
   * G = {nos: {id: [x, y]}, arestas: [[u, v, w?]], dirigido?, pesoNo?: {id: texto}}
   * est = {no: {id: classe}, aresta: {chave: classe}, rot: {id: texto}, rotAresta: {chave: texto}}
   */
  function desenha(alvo, G, est = {}, op = {}) {
    const R = op.r || 4.6;
    const pts = Object.values(G.nos);
    const pad = op.pad ?? 9;
    const minx = Math.min(...pts.map((p) => p[0])) - pad, maxx = Math.max(...pts.map((p) => p[0])) + pad;
    const miny = Math.min(...pts.map((p) => p[1])) - pad, maxy = Math.max(...pts.map((p) => p[1])) + pad;
    const svg = S('svg', { viewBox: `${minx} ${miny} ${maxx - minx} ${maxy - miny}`, class: 'grafo', role: 'img',
      'aria-label': op.rotulo || 'Desenho do grafo', style: `max-width:${Math.round((maxx - minx) * (op.escala || 5.6))}px` });
    const uidm = op.uid || 0;
    if (G.dirigido) {
      const defs = S('defs');
      for (const c of ['base', 'arvore', 'atual', 'rej', 'caminho', 'leve', 'satur']) {
        const m = S('marker', { id: `seta-${c}-${uidm}`, viewBox: '0 0 10 10', refX: '9', refY: '5', markerUnits: 'userSpaceOnUse',
          markerWidth: '3.6', markerHeight: '3.6', orient: 'auto-start-reverse' });
        m.append(S('path', { d: 'M0,0 L10,5 L0,10 z', class: `seta ${c}` }));
        defs.append(m);
      }
      svg.append(defs);
    }
    const gA = S('g'), gP = S('g'), gN = S('g');
    const existe = new Set(G.arestas.map(([u, v]) => `${u}>${v}`));
    for (const [u, v, w, extra] of G.arestas) {
      const k = chave(G, u, v);
      const cls = (est.aresta && est.aresta[k]) || '';
      let [x1, y1] = G.nos[u], [x2, y2] = G.nos[v];
      const d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d;
      const rr = G.pesoNo ? R * 1.25 : R;
      const curva = (extra && extra.curva) || 0;
      const rot = est.rotAresta && est.rotAresta[k] != null ? est.rotAresta[k] : w;
      const off = (op.offPeso && op.offPeso[k]) || [0, 0];
      const marca = (el) => { if (G.dirigido) el.setAttribute('marker-end', `url(#seta-${cls.split(' ')[0] || 'base'}-${uidm})`); };
      const escreve = (mx, my) => {
        if (rot != null && rot !== '' && op.pesos !== false)
          gP.append(S('text', { x: mx + off[0], y: my + off[1], class: `peso ${cls}`, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, typeof rot === 'number' ? fmt(rot) : rot));
      };
      if (curva) {
        // aresta curva (arestas paralelas ou que precisam contornar um vértice): Bézier quadrática
        const cx = (x1 + x2) / 2 - uy * curva, cy = (y1 + y2) / 2 + ux * curva;
        const enc = (px, py, qx, qy, r) => { const dd = Math.hypot(qx - px, qy - py); return [px + ((qx - px) / dd) * r, py + ((qy - py) / dd) * r]; };
        const [a1, b1] = enc(x1, y1, cx, cy, rr + (G.dirigido ? 0.4 : 0));
        const [a2, b2] = enc(x2, y2, cx, cy, rr + (G.dirigido ? 1.3 : 0));
        const pth = S('path', { d: `M${a1},${b1} Q${cx},${cy} ${a2},${b2}`, class: `aresta ${cls}`, fill: 'none' });
        marca(pth);
        gA.append(pth);
        const bx = (x1 + 2 * cx + x2) / 4, by = (y1 + 2 * cy + y2) / 4, sg = Math.sign(curva);
        escreve(bx - uy * 2.6 * sg, by + ux * 2.6 * sg);
        continue;
      }
      // arcos antiparalelos (u→v e v→u) ficam lado a lado, sem se sobrepor
      const desl = G.dirigido && existe.has(`${v}>${u}`) ? 1.7 : 0;
      if (desl) { x1 += -uy * desl; y1 += ux * desl; x2 += -uy * desl; y2 += ux * desl; }
      if (G.dirigido) { x1 += ux * (rr + 0.4); y1 += uy * (rr + 0.4); x2 -= ux * (rr + 1.3); y2 -= uy * (rr + 1.3); }
      const ln = S('line', { x1, y1, x2, y2, class: `aresta ${cls}` });
      marca(ln);
      gA.append(ln);
      const t = op.posPeso ?? 0.5;
      const lado = desl ? 2.7 + desl * 1.6 : 2.7;
      escreve(G.nos[u][0] + (G.nos[v][0] - G.nos[u][0]) * t - uy * lado, G.nos[u][1] + (G.nos[v][1] - G.nos[u][1]) * t + ux * lado);
    }
    for (const id of vertices(G)) {
      const [x, y] = G.nos[id];
      const cls = (est.no && est.no[id]) || '';
      const g = S('g', { class: `no ${cls}`, 'data-id': id });
      const rr = G.pesoNo ? R * 1.25 : R;
      g.append(S('circle', { cx: x, cy: y, r: rr }));
      if (G.pesoNo) {
        g.append(S('text', { x, y: y - 1.7, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'no-rot' }, id));
        g.append(S('text', { x, y: y + 2.5, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'no-peso' }, G.pesoNo[id]));
      } else {
        const nome = G.rot && G.rot[id] != null ? G.rot[id] : id;
        if (nome !== '') g.append(S('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'no-rot' + (nome.length > 3 ? ' longo' : '') }, nome));
      }
      if (est.rot && est.rot[id] != null) {
        const acima = op.rotAcima && op.rotAcima.includes(id);
        const dy = acima ? -(rr + 3.3) : rr + 3.7;
        g.append(S('text', { x, y: y + dy, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'no-sub' }, est.rot[id]));
      }
      gN.append(g);
    }
    svg.append(gA, gP, gN);
    alvo.replaceChildren(svg);
    return svg;
  }

  // -------------------------------------------------------------- linha do tempo ---
  function desenhaTempo(alvo, ativs, est = {}, op = {}) {
    const t0 = op.t0 ?? Math.min(...ativs.map((a) => a.ini)), t1 = op.t1 ?? Math.max(...ativs.map((a) => a.fim));
    const esq = op.nomes ? 34 : 4, larg = 100, alt = ativs.length * 7 + 12;
    const esc = (t) => esq + ((t - t0) / (t1 - t0)) * (larg - esq - 3);
    const svg = S('svg', { viewBox: `0 0 ${larg} ${alt}`, class: 'tempo', role: 'img', 'aria-label': 'Linha do tempo das reservas' });
    for (let t = t0; t <= t1; t++) {
      svg.append(S('line', { x1: esc(t), y1: 2, x2: esc(t), y2: alt - 8, class: (t - t0) % 2 ? 'grade fina' : 'grade' }));
      if ((t - t0) % (op.passo || 2) === 0) svg.append(S('text', { x: esc(t), y: alt - 3.5, class: 'eixo', 'text-anchor': 'middle' }, `${t}h`));
    }
    ativs.forEach((a, i) => {
      const y = 4 + i * 7, cls = est[a.id] || '';
      svg.append(S('rect', { x: esc(a.ini) + 0.3, y, width: esc(a.fim) - esc(a.ini) - 0.6, height: 5, rx: 1.3, class: `barra ${cls}` }));
      const rot = a.val != null && op.valores ? `${a.id} · ${a.val}` : a.id;
      svg.append(S('text', { x: (esc(a.ini) + esc(a.fim)) / 2, y: y + 2.6, class: `barra-rot ${cls}`, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, rot));
      if (op.nomes && a.nome) svg.append(S('text', { x: esq - 1.5, y: y + 2.6, class: `barra-nome ${cls}`, 'text-anchor': 'end', 'dominant-baseline': 'central' }, a.nome));
    });
    alvo.replaceChildren(svg);
    return svg;
  }

  // ===================================================================== ALGORITMOS ===

  // ---------------------------------------------------------------- Dijkstra ---
  /** Tabela com uma coluna por passo, célula (distância, predecessor), * = já fechado. */
  function dijkstra(G, s) {
    const A = vizinhos(G), V = vertices(G);
    const dist = {}, pai = {}, fech = {};
    V.forEach((v) => { dist[v] = INF; pai[v] = null; });
    dist[s] = 0;
    const colunas = [];
    const frames = [];
    const est = (u, atuais = []) => {
      const no = {}, aresta = {}, rot = {};
      V.forEach((v) => { no[v] = fech[v] ? 'fechado' : dist[v] < INF ? 'fila' : ''; rot[v] = fmt(dist[v]); });
      if (u) no[u] = 'atual';
      V.forEach((v) => { if (pai[v]) aresta[chave(G, pai[v], v)] = 'arvore'; });
      atuais.forEach((k) => (aresta[k] = 'atual'));
      return { no, aresta, rot };
    };
    const tabela = () => ({ cab: ['Vértice', ...colunas.map((_, i) => `Passo ${i + 1}`)], linhas: V.map((v) => [v, ...colunas.map((c) => c[v])]) });
    frames.push({ est: est(null), tabela: { cab: ['Vértice', 'Início'], linhas: V.map((v) => [v, v === s ? `(0, ${s})` : '∞']) },
      texto: `<b>Início.</b> d[${s}] = 0 e d[v] = ∞ para os outros vértices. Todos começam abertos.` });
    for (;;) {
      let u = null;
      for (const v of V) if (!fech[v] && dist[v] < INF && (u === null || dist[v] < dist[u])) u = v;
      if (u === null) break;
      const jaFech = { ...fech };
      fech[u] = true;
      const rel = [], atuais = [];
      for (const [v, w] of A[u]) {
        if (fech[v]) continue;
        const novo = dist[u] + w;
        if (novo < dist[v]) {
          rel.push(`<b>${v}</b>: ${fmt(dist[v])} → <b>${fmt(novo)}</b> (${fmt(dist[u])} + ${fmt(w)}, p[${v}] = ${u})`);
          dist[v] = novo; pai[v] = u; atuais.push(chave(G, u, v));
        } else rel.push(`<b>${v}</b>: fica ${fmt(dist[v])} (${fmt(dist[u])} + ${fmt(w)} = ${fmt(novo)} não é menor)`);
      }
      const col = {};
      V.forEach((v) => {
        if (jaFech[v]) col[v] = '*';
        else if (dist[v] === INF) col[v] = '∞';
        else col[v] = v === u ? `<b>(${fmt(dist[v])}, ${pai[v] || s})</b>` : `(${fmt(dist[v])}, ${pai[v] || s})`;
      });
      colunas.push(col);
      frames.push({ est: est(u, atuais), tabela: tabela(),
        texto: `<b>Passo ${colunas.length}: fecha ${u}</b>, o aberto de menor estimativa (${fmt(dist[u])}). ${rel.length ? 'Relaxa as arestas para os vizinhos abertos: ' + rel.join('; ') + '.' : 'Não há vizinho aberto para relaxar.'}` });
    }
    const caminho = (t) => { const c = []; for (let x = t; x; x = pai[x]) c.unshift(x); return c; };
    const resumo = V.filter((v) => v !== s && dist[v] < INF).map((v) => `${v} = ${fmt(dist[v])} (${caminho(v).join(' → ')})`).join(' · ');
    frames.push({ est: est(null), tabela: tabela(), texto: `<b>Fim.</b> Para ler um caminho, siga os predecessores de trás para a frente. ${resumo}.` });
    return { frames, dist, pai, caminho };
  }

  // ------------------------------------------------------------- Bellman-Ford ---
  function bellmanFord(G, s) {
    const V = vertices(G);
    const dist = {}, pai = {};
    V.forEach((v) => { dist[v] = INF; pai[v] = null; });
    dist[s] = 0;
    const linhas = [['Início', ...V.map((v) => fmt(dist[v]))]];
    const cab = ['Ao final de', ...V];
    const frames = [];
    const est = (mudou = []) => {
      const aresta = {}, rot = {}, no = {};
      V.forEach((v) => { rot[v] = fmt(dist[v]); if (pai[v]) aresta[chave(G, pai[v], v)] = 'arvore'; });
      mudou.forEach((v) => (no[v] = 'atual'));
      return { aresta, rot, no };
    };
    frames.push({ est: est(), tabela: { cab, linhas: [...linhas] }, texto: `<b>Início.</b> d[${s}] = 0 e os outros = ∞. Cada iteração relaxa <b>todas</b> as arestas, na ordem da lista.` });
    let r = 0, convergiu = false;
    for (r = 1; r <= V.length - 1; r++) {
      const mud = [], quem = [];
      for (const [u, v, w] of G.arestas) {
        if (dist[u] !== INF && dist[u] + w < dist[v]) {
          mud.push(`${u}→${v}: ${v} = ${fmt(dist[u])} ${w < 0 ? '− ' + fmt(-w) : '+ ' + fmt(w)} = ${fmt(dist[u] + w)}`);
          dist[v] = dist[u] + w; pai[v] = u; quem.push(v);
        }
      }
      linhas.push([`${r}ª iteração`, ...V.map((v) => fmt(dist[v]))]);
      frames.push({ est: est(quem), tabela: { cab, linhas: [...linhas], dest: [linhas.length - 1] },
        texto: mud.length ? `<b>${r}ª iteração.</b> ${mud.join('; ')}.` : `<b>${r}ª iteração.</b> Nenhuma mudança: as distâncias convergiram e dá para parar.` });
      if (!mud.length) { convergiu = true; break; }
    }
    const neg = G.arestas.filter(([u, v, w]) => dist[u] !== INF && dist[u] + w < dist[v]);
    frames.push({ est: est(neg.map((e) => e[1])), tabela: { cab, linhas },
      texto: neg.length ? `<b>Rodada extra.</b> A aresta ${neg[0][0]}→${neg[0][1]} ainda melhora uma distância depois de |V| − 1 = ${V.length - 1} iterações: existe <b>ciclo negativo</b> alcançável, e o menor caminho não está definido.`
        : `<b>Rodada extra.</b> Nenhuma aresta melhora mais nada: não há ciclo negativo. As distâncias da última linha são as menores.` });
    return { frames, dist, pai, cicloNegativo: neg.length > 0, iteracoes: convergiu ? r : V.length - 1 };
  }

  // ----------------------------------------------------------------- Kruskal ---
  function kruskal(G) {
    const V = vertices(G);
    const ar = [...G.arestas].sort((a, b) => a[2] - b[2] || ordenar(a[0] + a[1], b[0] + b[1]));
    const comp = {};
    V.forEach((v) => (comp[v] = v));
    const find = (x) => (comp[x] === x ? x : (comp[x] = find(comp[x])));
    const floresta = () => {
      const g = {};
      V.forEach((v) => { const r = find(v); (g[r] = g[r] || []).push(v); });
      return Object.values(g).map((x) => '{' + x.sort(ordenar).join(', ') + '}').join(' ');
    };
    const dec = {}, frames = [];
    let tot = 0, nAce = 0;
    const est = (atual) => {
      const aresta = {};
      ar.forEach(([u, v]) => { const k = chave(G, u, v); if (dec[k] === 'une') aresta[k] = 'arvore'; else if (dec[k] === 'descarta') aresta[k] = 'rej'; });
      if (atual) aresta[atual] = dec[atual] === 'une' ? 'atual' : 'rej';
      return { aresta, no: {} };
    };
    const tab = (i) => ({ cab: ['#', 'Aresta', 'Peso', 'Ação'], linhas: ar.map(([u, v, w], j) => {
      const d = dec[chave(G, u, v)];
      return [j + 1, `(${u}, ${v})`, fmt(w), d === 'une' ? '<span class="ok">une</span>' : d === 'descarta' ? '<span class="nok">descarta (ciclo)</span>' : ''];
    }), dest: i != null ? [i] : [] });
    frames.push({ est: est(), tabela: tab(), texto: `<b>Início.</b> Um conjunto (árvore) para cada vértice: ${floresta()}. Arestas em ordem crescente de peso.` });
    for (let i = 0; i < ar.length && nAce < V.length - 1; i++) {
      const [u, v, w] = ar[i], k = chave(G, u, v);
      if (find(u) !== find(v)) {
        comp[find(u)] = find(v); dec[k] = 'une'; tot += w; nAce++;
        frames.push({ est: est(k), tabela: tab(i), texto: `<b>(${u}, ${v}) = ${fmt(w)}</b>: ${u} e ${v} estão em árvores diferentes. <b>Une</b> e a aresta entra. Floresta: ${floresta()}. Custo até aqui: ${tot}.` });
      } else {
        dec[k] = 'descarta';
        frames.push({ est: est(k), tabela: tab(i), texto: `<b>(${u}, ${v}) = ${fmt(w)}</b>: ${u} e ${v} já estão na mesma árvore. A aresta fecharia um ciclo: <b>descarta</b>.` });
      }
    }
    frames.push({ est: est(), tabela: tab(), texto: `<b>Fim.</b> ${nAce} arestas (n − 1 = ${V.length - 1}) e custo <b>${tot}</b>. As arestas restantes nem precisam ser olhadas.` });
    return { frames, total: tot, aceitas: Object.keys(dec).filter((k) => dec[k] === 'une') };
  }

  // -------------------------------------------------------------------- Prim ---
  function prim(G, r) {
    const A = vizinhos(G), V = vertices(G);
    const ch = {}, pai = {}, dentro = {};
    V.forEach((v) => { ch[v] = INF; pai[v] = null; });
    ch[r] = 0;
    const frames = [], linhas = [];
    let tot = 0, it = 0;
    const est = (u) => {
      const no = {}, aresta = {}, rot = {};
      V.forEach((v) => { no[v] = dentro[v] ? 'fechado' : ch[v] < INF ? 'fila' : ''; rot[v] = dentro[v] ? '' : fmt(ch[v]); });
      if (u) no[u] = 'atual';
      V.forEach((v) => { if (dentro[v] && pai[v]) aresta[chave(G, pai[v], v)] = 'arvore'; });
      if (u && pai[u]) aresta[chave(G, pai[u], u)] = 'atual';
      return { no, aresta, rot };
    };
    const cab = ['Iteração', 'Aresta segura', 'Peso', 'Vértice incluído'];
    frames.push({ est: est(null), tabela: { cab, linhas: [] }, texto: `<b>Início no vértice ${r}.</b> Os números perto dos vértices são o peso da aresta mais barata que liga cada um à árvore.` });
    for (;;) {
      let u = null;
      for (const v of V) if (!dentro[v] && ch[v] < INF && (u === null || ch[v] < ch[u])) u = v;
      if (u === null) break;
      dentro[u] = true;
      if (pai[u]) { tot += ch[u]; it++; linhas.push([it, `(${pai[u]}, ${u})`, fmt(ch[u]), u]); }
      for (const [v, w] of A[u]) if (!dentro[v] && w < ch[v]) { ch[v] = w; pai[v] = u; }
      if (pai[u]) frames.push({ est: est(u), tabela: { cab, linhas: [...linhas], dest: [linhas.length - 1] },
        texto: `<b>Iteração ${it}.</b> A aresta mais barata que sai da árvore é (${pai[u]}, ${u}) = ${fmt(ch[u])}: ${u} entra. Custo até aqui: ${tot}.` });
    }
    frames.push({ est: est(null), tabela: { cab, linhas }, texto: `<b>Fim.</b> Árvore geradora mínima com custo <b>${tot}</b> e ${V.length - 1} arestas.` });
    return { frames, total: tot, linhas };
  }

  // ---------------------------------------------------------------- BFS e DFS ---
  function bfs(G, s) {
    const A = vizinhos(G), V = vertices(G);
    const est0 = {}; V.forEach((v) => (est0[v] = 'NAO_VISITADO'));
    est0[s] = 'VISITADO';
    const d = { [s]: 0 }, p = { [s]: null }, ordem = [], fila = [s];
    const frames = [], linhas = [];
    const est = (u) => {
      const no = {}, aresta = {}, rot = {};
      V.forEach((v) => { no[v] = est0[v] === 'ENCERRADO' ? 'fechado' : est0[v] === 'VISITADO' ? 'fila' : ''; if (d[v] != null) rot[v] = `d = ${d[v]}`; });
      if (u) no[u] = 'atual';
      V.forEach((v) => { if (p[v]) aresta[chave(G, p[v], v)] = 'arvore'; });
      return { no, aresta, rot };
    };
    const cab = ['Passo', 'Sai da fila', 'Entram na fila', 'Fila depois'];
    frames.push({ est: est(null), tabela: { cab, linhas: [] }, extra: { fila: [...fila] }, texto: `<b>Início.</b> ${s} é marcado como VISITADO, com d = 0, e entra na fila.` });
    while (fila.length) {
      const u = fila.shift();
      const novos = [];
      for (const [v] of A[u]) if (est0[v] === 'NAO_VISITADO') { est0[v] = 'VISITADO'; d[v] = d[u] + 1; p[v] = u; fila.push(v); novos.push(v); }
      est0[u] = 'ENCERRADO'; ordem.push(u);
      linhas.push([linhas.length + 1, u, novos.join(', ') || '—', fila.join(' ') || 'vazia']);
      frames.push({ est: est(u), tabela: { cab, linhas: [...linhas], dest: [linhas.length - 1] }, extra: { fila: [...fila] },
        texto: `<b>${u} sai da fila</b> (FIFO: o primeiro que entrou). ${novos.length ? `Vizinhos NAO_VISITADO entram no fim da fila com d = ${d[u] + 1}: ${novos.join(', ')}.` : 'Nenhum vizinho novo.'} ${u} fica ENCERRADO.` });
    }
    frames.push({ est: est(null), tabela: { cab, linhas }, extra: { fila: [] },
      texto: `<b>Fim.</b> Ordem de visita: ${ordem.join(', ')}. d(v) é o menor número de arestas de ${s} até v; os predecessores formam a árvore de busca em largura.` });
    return { frames, ordem, d, p };
  }

  /** DFS recursiva, vizinhos em ordem crescente, com tempos de descoberta e término */
  function dfs(G, s) {
    const A = vizinhos(G), V = vertices(G);
    const estado = {}, p = {}, dsc = {}, fim = {}, ordem = [];
    V.forEach((v) => (estado[v] = 'NAO_VISITADO'));
    const pilha = [], frames = [], arvore = [], retorno = [];
    let tempo = -1;
    const est = (u) => {
      const no = {}, aresta = {}, rot = {};
      V.forEach((v) => { no[v] = estado[v] === 'ENCERRADO' ? 'fechado' : estado[v] === 'VISITADO' ? 'fila' : ''; if (dsc[v] != null) rot[v] = fim[v] != null ? `${dsc[v]}/${fim[v]}` : `${dsc[v]}/`; });
      if (u) no[u] = 'atual';
      arvore.forEach((k) => (aresta[k] = 'arvore'));
      retorno.forEach((k) => (aresta[k] = 'rej'));
      return { no, aresta, rot };
    };
    function visita(u) {
      tempo++; estado[u] = 'VISITADO'; dsc[u] = tempo; ordem.push(u); pilha.push(u);
      frames.push({ est: est(u), extra: { pilha: [...pilha], ordem: [...ordem] }, texto: `<b>Descobre ${u}</b> no tempo ${tempo}. Agora desce pelo primeiro vizinho NAO_VISITADO, em ordem crescente.` });
      for (const [v] of A[u]) {
        if (estado[v] === 'NAO_VISITADO') { p[v] = u; arvore.push(chave(G, u, v)); visita(v); }
        else if (estado[v] === 'VISITADO' && v !== p[u] && !G.dirigido) {
          const k = chave(G, u, v);
          if (!retorno.includes(k) && !arvore.includes(k)) {
            retorno.push(k);
            frames.push({ est: est(u), extra: { pilha: [...pilha], ordem: [...ordem] }, texto: `Em ${u}, olha ${v}: ele ainda está aberto (VISITADO) e não é o pai. A aresta ${u}–${v} é de <b>retorno</b>: há um ciclo.` });
          }
        }
      }
      tempo++; estado[u] = 'ENCERRADO'; fim[u] = tempo; pilha.pop();
      frames.push({ est: est(pilha[pilha.length - 1] || null), extra: { pilha: [...pilha], ordem: [...ordem] },
        texto: `<b>${u} encerra</b> no tempo ${tempo}: todos os vizinhos já foram vistos. ${pilha.length ? `Volta para ${pilha[pilha.length - 1]}.` : 'A pilha esvaziou.'}` });
    }
    visita(s);
    frames.push({ est: est(null), extra: { pilha: [], ordem },
      texto: `<b>Fim.</b> Sequência DFS: ${ordem.join(', ')}. Os números são descoberta/término. Arestas em laranja são de árvore; tracejadas são de retorno.` });
    return { frames, ordem, dsc, fim, arvore, retorno };
  }

  // ------------------------------------------------- ordenação topológica (Kahn) ---
  function kahn(G) {
    const V = vertices(G), A = vizinhos(G);
    const grau = {};
    V.forEach((v) => (grau[v] = 0));
    G.arestas.forEach(([, v]) => grau[v]++);
    const fila = V.filter((v) => grau[v] === 0).sort(ordenar);
    const saida = [], frames = [];
    const est = (u) => {
      const no = {}, rot = {};
      V.forEach((v) => { no[v] = saida.includes(v) ? 'fechado' : fila.includes(v) ? 'fila' : ''; if (!saida.includes(v)) rot[v] = `entrada ${grau[v]}`; });
      if (u) no[u] = 'atual';
      return { no, rot, aresta: {} };
    };
    frames.push({ est: est(null), extra: { fila: [...fila], ordem: [] }, texto: `<b>Início.</b> Conta o grau de entrada de cada vértice. Os de grau 0 (${fila.join(', ')}) não dependem de ninguém e entram na fila.` });
    while (fila.length) {
      const u = fila.shift();
      saida.push(u);
      const lib = [];
      for (const [v] of A[u]) { grau[v]--; if (grau[v] === 0) { fila.push(v); lib.push(v); } }
      fila.sort(ordenar);
      frames.push({ est: est(u), extra: { fila: [...fila], ordem: [...saida] },
        texto: `<b>${u}</b> sai da fila e vai para a ordem. Cada sucessor perde 1 de grau de entrada${lib.length ? `; ${lib.join(', ')} chegou a 0 e entra na fila` : ''}.` });
    }
    const ok = saida.length === V.length;
    frames.push({ est: est(null), extra: { fila: [], ordem: saida },
      texto: ok ? `<b>Fim.</b> Ordenação topológica: ${saida.join(', ')}.` : `<b>Parou antes do fim:</b> sobraram vértices com grau de entrada maior que 0. Isso só acontece quando há ciclo, e aí não existe ordenação topológica.` });
    return { frames, ordem: saida, ok };
  }

  /** tarefas = {id: {d, pre: []}} → início e fim mais cedo, folga e caminho crítico */
  function caminhoCritico(tarefas) {
    const ids = Object.keys(tarefas), ES = {}, EF = {}, ordem = [];
    while (ordem.length < ids.length) {
      for (const t of ids) {
        if (ordem.includes(t) || !tarefas[t].pre.every((x) => ordem.includes(x))) continue;
        ES[t] = Math.max(0, ...tarefas[t].pre.map((x) => EF[x]));
        EF[t] = ES[t] + tarefas[t].d;
        ordem.push(t);
      }
    }
    const fimProj = Math.max(...ids.map((t) => EF[t]));
    const LF = {}, LS = {};
    const suc = (t) => ids.filter((x) => tarefas[x].pre.includes(t));
    [...ordem].reverse().forEach((t) => {
      const ss = suc(t);
      LF[t] = ss.length ? Math.min(...ss.map((x) => LS[x])) : fimProj;
      LS[t] = LF[t] - tarefas[t].d;
    });
    const folga = {};
    ids.forEach((t) => (folga[t] = LS[t] - ES[t]));
    return { ES, EF, LS, LF, folga, fim: fimProj, criticas: ids.filter((t) => folga[t] === 0) };
  }

  // ---------------------------------------------------------------- coloração ---
  function ordemGrau(G) {
    const A = vizinhos(G);
    return vertices(G).sort((a, b) => A[b].length - A[a].length || ordenar(a, b));
  }

  function coloracao(G, ordem) {
    const A = vizinhos(G);
    const cor = {}, frames = [], linhas = [];
    const cab = ['Vértice', 'Grau', 'Vizinhos já coloridos', 'Cor'];
    const est = (u) => {
      const no = {}, rot = {};
      vertices(G).forEach((v) => { if (cor[v]) { no[v] = 'c' + Math.min(cor[v], 4); rot[v] = `cor ${cor[v]}`; } });
      if (u) no[u] = (no[u] || '') + ' atual';
      return { no, rot };
    };
    frames.push({ est: est(null), tabela: { cab, linhas: [] }, texto: `<b>Ordem:</b> ${ordem.join(', ')}. Cada vértice recebe a menor cor que nenhum vizinho já colorido usa.` });
    for (const v of ordem) {
      const viz = A[v].filter(([u]) => cor[u]).map(([u]) => `${u} (${cor[u]})`);
      const usadas = new Set(A[v].filter(([u]) => cor[u]).map(([u]) => cor[u]));
      let c = 1;
      while (usadas.has(c)) c++;
      cor[v] = c;
      linhas.push([v, A[v].length, viz.join(', ') || '—', `<b>${c}</b>`]);
      frames.push({ est: est(v), tabela: { cab, linhas: [...linhas], dest: [linhas.length - 1] },
        texto: `<b>${v}</b>: vizinhos coloridos ${viz.length ? viz.join(', ') : 'nenhum'}. Menor cor livre: <b>${c}</b>.` });
    }
    const k = Math.max(...Object.values(cor));
    frames.push({ est: est(null), tabela: { cab, linhas }, texto: `<b>Fim.</b> O guloso usou <b>${k}</b> cores nesta ordem. Para saber se é o mínimo, procure um pedaço do grafo que obrigue ${k} cores.` });
    return { frames, cor, k };
  }

  function cromatico(G) {
    const A = vizinhos(G), V = ordemGrau(G);
    for (let k = 1; k <= V.length; k++) {
      const cor = {};
      const tenta = (i) => {
        if (i === V.length) return true;
        for (let c = 1; c <= k; c++) {
          if (A[V[i]].some(([u]) => cor[u] === c)) continue;
          cor[V[i]] = c;
          if (tenta(i + 1)) return true;
          delete cor[V[i]];
        }
        return false;
      };
      if (tenta(0)) return { k, cor };
    }
  }

  // ------------------------------------------------- conjunto independente com pesos ---
  function independentePeso(G, peso, fmtP = brl) {
    const A = vizinhos(G), V = vertices(G);
    const ordem = [...V].sort((a, b) => peso[b] - peso[a] || ordenar(a, b));
    const S = [], frames = [], linhas = [];
    let tot = 0;
    const est = (u) => {
      const no = {};
      V.forEach((v) => { if (S.includes(v)) no[v] = 'sel'; else if (linhas.some((l) => l[0] === v)) no[v] = 'rej'; });
      if (u) no[u] = (no[u] || '') + ' atual';
      return { no };
    };
    const cab = ['Item', 'Valor', 'Decisão'];
    frames.push({ est: est(null), tabela: { cab, linhas: [] }, texto: `<b>Ordem por valor:</b> ${ordem.join(', ')}. Cada item entra se não conflitar com nenhum já escolhido.` });
    for (const v of ordem) {
      const conf = A[v].map(([u]) => u).filter((u) => S.includes(u));
      if (!conf.length) { S.push(v); tot += peso[v]; linhas.push([v, fmtP(peso[v]), '<span class="ok">aceita</span>']); }
      else linhas.push([v, fmtP(peso[v]), `<span class="nok">rejeita: conflita com ${conf.join(', ')}</span>`]);
      frames.push({ est: est(v), tabela: { cab, linhas: [...linhas], dest: [linhas.length - 1] },
        texto: conf.length ? `<b>${v}</b> conflita com ${conf.join(', ')}, que já está na solução: fica de fora.` : `<b>${v}</b> não conflita com ninguém escolhido: entra. Total: ${fmtP(tot)}.` });
    }
    return { frames, S, total: Math.round(tot * 100) / 100 };
  }

  function otimoPeso(G, peso) {
    const A = vizinhos(G), V = vertices(G);
    let best = -1, arg = [];
    for (let m = 0; m < 1 << V.length; m++) {
      const c = V.filter((_, i) => m & (1 << i));
      if (c.some((u) => A[u].some(([v]) => c.includes(v)))) continue;
      const s = Math.round(c.reduce((a, u) => a + peso[u], 0) * 100) / 100;
      if (s > best) { best = s; arg = c; }
    }
    return { total: best, S: arg };
  }

  // ---------------------------------------------------------- seleção de atividades ---
  const compat = (a, b) => a.fim <= b.ini || b.fim <= a.ini;
  function selecao(ativs, criterio) {
    const chaves = { fim: (a) => [a.fim, a.ini], ini: (a) => [a.ini, a.fim], dur: (a) => [a.fim - a.ini, a.ini], val: (a) => [-a.val, a.ini] };
    const k = chaves[criterio];
    const ordem = [...ativs].sort((a, b) => { const x = k(a), y = k(b); return x[0] - y[0] || x[1] - y[1]; });
    const S = [], frames = [], est = {}, linhas = [];
    const nome = { fim: 'término', ini: 'início', dur: 'duração', val: 'maior valor' }[criterio];
    const cab = ['Ordem', 'Reserva', 'Decisão'];
    frames.push({ est: { ...est }, tabela: { cab, linhas: [] }, texto: `<b>Critério: ${nome}.</b> Ordem: ${ordem.map((a) => a.id).join(', ')}.` });
    ordem.forEach((a, i) => {
      const choque = S.find((b) => !compat(a, b));
      if (!choque) { S.push(a); est[a.id] = 'sel'; } else est[a.id] = 'rej';
      linhas.push([`${i + 1}º`, `${a.id} ${a.ini}h–${a.fim}h`, choque ? `<span class="nok">rejeita: bate com ${choque.id}</span>` : '<span class="ok">aceita</span>']);
      frames.push({ est: { ...est, [a.id]: est[a.id] + ' atual' }, tabela: { cab, linhas: [...linhas], dest: [i] },
        texto: choque ? `<b>${a.id}</b> (${a.ini}h–${a.fim}h) bate com ${choque.id}, já aceita: rejeita.` : `<b>${a.id}</b> (${a.ini}h–${a.fim}h) não bate com nenhuma aceita: entra.` });
    });
    const val = S.reduce((s, a) => s + (a.val || 0), 0);
    frames.push({ est: { ...est }, tabela: { cab, linhas }, texto: `<b>Fim.</b> ${S.length} reservas: ${S.map((a) => a.id).join(', ')}${ativs[0].val != null ? `, valor total ${val}` : ''}.` });
    return { frames, S, val };
  }

  // -------------------------------------------------------- fluxo (Ford-Fulkerson) ---
  /** G dirigido com capacidades; caminhos = lista de caminhos aumentantes */
  function fordFulkerson(G, s, t, caminhos) {
    const cap = {}, f = {};
    G.arestas.forEach(([u, v, c]) => { cap[`${u}>${v}`] = c; f[`${u}>${v}`] = 0; });
    const frames = [], linhas = [];
    let total = 0;
    const rotulos = () => { const r = {}; G.arestas.forEach(([u, v]) => (r[`${u}>${v}`] = `${f[`${u}>${v}`]}/${cap[`${u}>${v}`]}`)); return r; };
    const est = (cam) => {
      const aresta = {};
      G.arestas.forEach(([u, v]) => { const k = `${u}>${v}`; if (f[k] === cap[k]) aresta[k] = 'satur'; });
      (cam || []).forEach((k) => (aresta[k] = 'caminho'));
      return { aresta, rotAresta: rotulos(), no: { [s]: 'fechado', [t]: 'fechado' } };
    };
    const cab = ['It.', 'Caminho aumentante', 'Gargalo Δ', 'Fluxo total'];
    frames.push({ est: est(), tabela: { cab, linhas: [] }, texto: '<b>Início.</b> Fluxo 0 em todos os arcos. Cada rótulo é f/c: fluxo atual / capacidade.' });
    caminhos.forEach((cam, i) => {
      const res = [];
      for (let j = 0; j < cam.length - 1; j++) {
        const u = cam[j], v = cam[j + 1];
        if (cap[`${u}>${v}`] != null) res.push(cap[`${u}>${v}`] - f[`${u}>${v}`]);
        else res.push(f[`${v}>${u}`]);
      }
      const delta = Math.min(...res);
      const usados = [];
      for (let j = 0; j < cam.length - 1; j++) {
        const u = cam[j], v = cam[j + 1];
        if (cap[`${u}>${v}`] != null) { f[`${u}>${v}`] += delta; usados.push(`${u}>${v}`); }
        else { f[`${v}>${u}`] -= delta; usados.push(`${v}>${u}`); }
      }
      total += delta;
      const satur = usados.filter((k) => f[k] === cap[k]).map((k) => k.replace('>', '→'));
      linhas.push([i + 1, cam.join('→'), delta, total]);
      frames.push({ est: est(usados), tabela: { cab, linhas: [...linhas], dest: [i] },
        texto: `<b>Iteração ${i + 1}:</b> caminho ${cam.join(' → ')}, com folgas ${res.join(', ')}. O gargalo é Δ = <b>${delta}</b>. ${satur.length ? `Satura ${satur.join(', ')}.` : ''} Fluxo total: ${total}.` });
    });
    // corte mínimo: alcançáveis a partir de s no grafo residual
    const alc = new Set([s]), fila = [s];
    while (fila.length) {
      const u = fila.shift();
      G.arestas.forEach(([a, b]) => {
        const k = `${a}>${b}`;
        if (a === u && !alc.has(b) && cap[k] - f[k] > 0) { alc.add(b); fila.push(b); }
        if (b === u && !alc.has(a) && f[k] > 0) { alc.add(a); fila.push(a); }
      });
    }
    const corte = G.arestas.filter(([a, b]) => alc.has(a) && !alc.has(b));
    const capCorte = corte.reduce((x, [, , c]) => x + c, 0);
    const est2 = est();
    corte.forEach(([a, b]) => (est2.aresta[`${a}>${b}`] = 'rej'));
    frames.push({ est: est2, tabela: { cab, linhas },
      texto: `<b>Fim:</b> não há mais caminho aumentante. A partir de ${s} ainda se alcançam {${[...alc].join(', ')}}. Os arcos que saem desse conjunto (${corte.map(([a, b]) => `${a}→${b}`).join(', ')}) estão saturados e somam ${capCorte}: é o <b>corte mínimo</b>, igual ao fluxo máximo, <b>${total}</b>.` });
    return { frames, total, corte: capCorte, alcancaveis: [...alc] };
  }

  // ----------------------------------------------------------------- Fleury ---
  function fleury(G, inicio) {
    const rest = G.arestas.map(([u, v, n]) => ({ u, v, n }));
    const usados = [], trajeto = [inicio], frames = [];
    const conectados = (a, b, lista) => {
      const vis = new Set([a]), fila = [a];
      while (fila.length) { const x = fila.shift(); lista.forEach((e) => { const y = e.u === x ? e.v : e.v === x ? e.u : null; if (y != null && !vis.has(y)) { vis.add(y); fila.push(y); } }); }
      return vis.has(b);
    };
    const est = (atual) => {
      const aresta = {}, no = {};
      usados.forEach((e) => (aresta[chave(G, e.u, e.v)] = 'leve'));
      if (usados.length) { const e = usados[usados.length - 1]; aresta[chave(G, e.u, e.v)] = 'caminho'; }
      no[atual] = 'atual';
      return { aresta, no };
    };
    frames.push({ est: est(inicio), texto: `<b>Início em ${inicio}.</b> Regra: apague cada aresta depois de passar por ela e só atravesse uma ponte se não houver outra opção.` });
    let u = inicio;
    while (rest.length) {
      const cand = rest.filter((e) => e.u === u || e.v === u).map((e) => ({ e, x: e.u === u ? e.v : e.u })).sort((a, b) => ordenar(a.x, b.x));
      let esc = cand[0], obs = '';
      if (cand.length > 1) {
        for (const c of cand) {
          const sem = rest.filter((e) => e !== c.e);
          if (conectados(u, c.x, sem)) { esc = c; break; }
          obs = ` ${u}–${c.x} seria ponte; pulou.`;
        }
      }
      rest.splice(rest.indexOf(esc.e), 1);
      usados.push(esc.e);
      u = esc.x;
      trajeto.push(u);
      frames.push({ est: est(u), texto: `Passa pela aresta <b>${esc.e.n}</b> (${esc.e.u}–${esc.e.v}) e chega em <b>${u}</b>.${obs} Trajeto: ${trajeto.join(' → ')}.` });
    }
    frames.push({ est: est(u), texto: `<b>Fim.</b> Todas as arestas foram percorridas uma única vez: ${trajeto.join(' → ')}.` });
    return { frames, trajeto };
  }

  // -------------------------------------------------------------- caixeiro ---
  function caixeiro(G, inicio) {
    const A = vizinhos(G), V = vertices(G);
    const w = (a, b) => { const x = A[a].find(([y]) => y === b); return x ? x[1] : INF; };
    const outros = V.filter((v) => v !== inicio);
    let best = INF, rota = null, cont = 0;
    const perm = (pref, resto) => {
      if (!resto.length) {
        const r = [inicio, ...pref, inicio];
        if (ordenar(r[1], r[r.length - 2]) > 0) return; // conta cada circuito uma vez (sentido único)
        cont++;
        const c = r.slice(1).reduce((s, v, i) => s + w(r[i], v), 0);
        if (c < best) { best = c; rota = r; }
        return;
      }
      resto.forEach((x, i) => perm([...pref, x], [...resto.slice(0, i), ...resto.slice(i + 1)]));
    };
    perm([], outros);
    // vizinho mais próximo
    const nn = [inicio];
    while (nn.length < V.length) {
      const u = nn[nn.length - 1];
      const prox = V.filter((v) => !nn.includes(v)).sort((a, b) => w(u, a) - w(u, b) || ordenar(a, b))[0];
      nn.push(prox);
    }
    nn.push(inicio);
    const custoNN = nn.slice(1).reduce((s, v, i) => s + w(nn[i], v), 0);
    return { otimo: best, rota, circuitos: cont, vizinho: nn, custoVizinho: custoNN };
  }

  // ============================================================= LABIRINTO (grade) ===
  function grade(linhas) {
    const L = linhas.length, C = linhas[0].length;
    let s, t;
    linhas.forEach((ln, l) => [...ln].forEach((ch, c) => { if (ch === 'S') s = [l, c]; if (ch === 'T') t = [l, c]; }));
    const livre = (l, c) => l >= 0 && l < L && c >= 0 && c < C && linhas[l][c] !== '#';
    const viz = (l, c) => [[-1, 0], [0, -1], [0, 1], [1, 0]].map(([dl, dc]) => [l + dl, c + dc]).filter(([a, b]) => livre(a, b));
    return { linhas, L, C, s, t, livre, viz };
  }
  const k2 = (p) => `${p[0]},${p[1]}`;
  const cmpCel = (a, b) => a[0] - b[0] || a[1] - b[1];

  /** modo: 'dfs' | 'bfs' | 'gulosa' | 'astar' — vizinhos em ordem crescente de (linha, coluna). */
  function buscaGrade(Gr, modo) {
    const { s, t, viz } = Gr;
    const hM = (p) => Math.abs(p[0] - t[0]) + Math.abs(p[1] - t[1]);
    const ordemExp = {}, p = {}, g = {}, aberta = [], frames = [];
    let n = 0, achou = false;
    const caminho = () => { const c = []; for (let x = k2(t); x; x = p[x]) c.unshift(x); return c; };
    const snap = (atual, txt) => frames.push({ ordem: { ...ordemExp }, atual, aberta: aberta.map((a) => k2(a.p || a)), g: { ...g }, texto: txt });
    if (modo === 'dfs') {
      const vis = new Set();
      const visita = (u) => {
        if (achou) return;
        vis.add(k2(u)); ordemExp[k2(u)] = ++n;
        snap(k2(u), `Visita (${u[0]}, ${u[1]}): ${n}ª célula.`);
        if (k2(u) === k2(t)) { achou = true; return; }
        for (const v of viz(u[0], u[1])) if (!vis.has(k2(v)) && !achou) { p[k2(v)] = k2(u); visita(v); }
      };
      visita(s);
    } else if (modo === 'bfs') {
      const vis = new Set([k2(s)]), fila = [s];
      g[k2(s)] = 0;
      while (fila.length && !achou) {
        const u = fila.shift();
        ordemExp[k2(u)] = ++n;
        if (k2(u) === k2(t)) { achou = true; aberta.length = 0; fila.forEach((x) => aberta.push(x)); snap(k2(u), `t sai da fila: menor caminho garantido, com ${g[k2(u)]} passos.`); break; }
        for (const v of viz(u[0], u[1])) if (!vis.has(k2(v))) { vis.add(k2(v)); p[k2(v)] = k2(u); g[k2(v)] = g[k2(u)] + 1; fila.push(v); }
        aberta.length = 0; fila.forEach((x) => aberta.push(x));
        snap(k2(u), `Sai da fila (${u[0]}, ${u[1]}), a ${g[k2(u)]} passo(s) de s. Vizinhos novos entram no fim da fila.`);
      }
    } else {
      const fech = new Set();
      g[k2(s)] = 0;
      const ab = new Map([[k2(s), s]]);
      const f = (q) => (modo === 'astar' ? g[k2(q)] + hM(q) : hM(q));
      while (ab.size && !achou) {
        const lista = [...ab.values()].sort((a, b) => f(a) - f(b) || hM(a) - hM(b) || cmpCel(a, b));
        const u = lista[0];
        ab.delete(k2(u));
        fech.add(k2(u));
        ordemExp[k2(u)] = ++n;
        if (k2(u) === k2(t)) {
          achou = true; aberta.length = 0; ab.forEach((x) => aberta.push(x));
          snap(k2(u), `t sai da ABERTA com ${modo === 'astar' ? `f = ${g[k2(u)]} + 0 = ${g[k2(u)]}` : 'h = 0'}. Fim.`);
          break;
        }
        const msgs = [];
        for (const v of viz(u[0], u[1])) {
          const kv = k2(v);
          if (fech.has(kv)) continue;
          const custo = g[k2(u)] + 1;
          if (modo === 'gulosa') {
            if (!ab.has(kv)) { g[kv] = custo; p[kv] = k2(u); ab.set(kv, v); msgs.push(`(${v[0]}, ${v[1]}) entra com h = ${hM(v)}`); }
          } else if (g[kv] == null || custo < g[kv]) {
            const atualiza = g[kv] != null;
            g[kv] = custo; p[kv] = k2(u);
            if (!ab.has(kv)) ab.set(kv, v);
            msgs.push(`(${v[0]}, ${v[1]}) ${atualiza ? 'atualiza para' : 'entra com'} f = ${custo} + ${hM(v)} = ${custo + hM(v)}`);
          }
        }
        aberta.length = 0; ab.forEach((x) => aberta.push(x));
        snap(k2(u), `Sai (${u[0]}, ${u[1]}) com ${modo === 'astar' ? `f = ${g[k2(u)]} + ${hM(u)} = ${g[k2(u)] + hM(u)}` : `h = ${hM(u)}`}. ${msgs.length ? msgs.join('; ') + '.' : 'Nenhum vizinho novo.'}`);
      }
    }
    const cam = achou ? caminho() : [];
    frames.push({ ordem: { ...ordemExp }, atual: null, aberta: [], g: { ...g }, caminho: cam,
      texto: `<b>Resultado:</b> ${n} células expandidas e caminho com ${cam.length - 1} passos.` });
    return { frames, expandidas: n, passos: cam.length - 1, caminho: cam };
  }

  function desenhaGrade(alvo, Gr, fr, op = {}) {
    const tam = 10;
    const svg = S('svg', { viewBox: `-1 -1 ${Gr.C * tam + 2} ${Gr.L * tam + 2}`, class: 'labirinto', role: 'img', 'aria-label': 'Labirinto em grade',
      style: `max-width:${Math.round((Gr.C * tam + 2) * 6.4)}px` });
    const cam = new Set(fr.caminho || []), ab = new Set(fr.aberta || []);
    for (let l = 0; l < Gr.L; l++) for (let c = 0; c < Gr.C; c++) {
      const k = `${l},${c}`, ch = Gr.linhas[l][c];
      let cls = ch === '#' ? 'parede' : 'livre';
      if (fr.ordem && fr.ordem[k] != null) cls += ' exp';
      if (ab.has(k)) cls += ' aberta';
      if (cam.has(k)) cls += ' cam';
      if (fr.atual === k) cls += ' atual';
      svg.append(S('rect', { x: c * tam, y: l * tam, width: tam, height: tam, class: `cel ${cls}` }));
      let txt = ch === 'S' ? 's' : ch === 'T' ? 't' : '';
      if (fr.ordem && fr.ordem[k] != null && ch !== 'S' && ch !== 'T') txt = String(fr.ordem[k]);
      if (txt) svg.append(S('text', { x: c * tam + tam / 2, y: l * tam + tam / 2, class: `cel-t ${ch === 'S' || ch === 'T' ? 'st' : ''} ${cam.has(k) ? 'cam' : ''}`, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, txt));
    }
    alvo.replaceChildren(svg);
  }

  // ==================================================================== COMPONENTES ===
  let uid = 0;

  function passoAPasso(alvo, G, resultado, op = {}) {
    const id = ++uid;
    stepper(alvo, resultado.frames, (f, fig, lado) => {
      if (op.tabelaEmbaixo) {
        const box = h('div', { class: 'st-figbox' });
        fig.replaceChildren(box);
        desenha(box, G, f.est, { ...op, uid: id });
        if (f.tabela) fig.append(tabelaEl(f.tabela.cab, f.tabela.linhas, f.tabela.dest));
      } else {
        desenha(fig, G, f.est, { ...op, uid: id });
        lado.replaceChildren();
        if (f.tabela) lado.append(tabelaEl(f.tabela.cab, f.tabela.linhas, f.tabela.dest));
      }
      const alvoSeq = op.tabelaEmbaixo ? fig : lado;
      if (f.extra) {
        const blocos = [];
        if (f.extra.fila) blocos.push(['Fila (início → fim)', f.extra.fila]);
        if (f.extra.pilha) blocos.push(['Pilha de chamadas (base → topo)', f.extra.pilha]);
        if (f.extra.ordem) blocos.push(['Ordem', f.extra.ordem]);
        blocos.forEach(([t, xs]) => alvoSeq.append(h('div', { class: 'st-seq' }, h('span', { class: 'st-seq-t' }, t),
          h('span', { class: 'st-seq-v' }, xs.length ? xs.map((x) => h('span', { class: 'tok' }, x)) : h('span', { class: 'vazio' }, 'vazia')))));
      }
    }, { sozinha: !!op.tabelaEmbaixo });
  }

  function passoTempo(alvo, ativs, resultado, op = {}) {
    stepper(alvo, resultado.frames, (f, fig, lado) => {
      desenhaTempo(fig, ativs, f.est, op);
      lado.replaceChildren();
      if (f.tabela) lado.append(tabelaEl(f.tabela.cab, f.tabela.linhas, f.tabela.dest));
    });
  }

  /** Laboratório do labirinto: os quatro algoritmos no mesmo mapa. */
  function labLabirinto(alvo, linhas) {
    const Gr = grade(linhas);
    const area = h('div');
    const nomes = [['dfs', 'DFS'], ['bfs', 'BFS'], ['gulosa', 'Busca gulosa'], ['astar', 'A*']];
    const placar = h('div', { class: 'tabela-wrap' });
    const res = {};
    nomes.forEach(([m]) => (res[m] = buscaGrade(Gr, m)));
    placar.append(tabelaEl(['Algoritmo', 'Células expandidas', 'Passos no caminho', 'Menor caminho?'],
      nomes.map(([m, n]) => [n, res[m].expandidas, res[m].passos, res[m].passos === res.bfs.passos ? '<span class="ok">sim</span>' : '<span class="nok">não</span>'])));
    const bots = h('div', { class: 'lab-bots' });
    const roda = (m) => {
      [...bots.children].forEach((b) => b.classList.toggle('ativo', b.dataset.m === m));
      stepper(area, res[m].frames, (f, fig) => {
        const box = h('div', { class: 'st-figbox' });
        fig.replaceChildren(box);
        desenhaGrade(box, Gr, f);
      }, { sozinha: true });
    };
    nomes.forEach(([m, n]) => bots.append(h('button', { class: 'btn-sec', type: 'button', 'data-m': m, onclick: () => roda(m) }, n)));
    alvo.replaceChildren(h('div', { class: 'lab' }, bots, area, h('p', { class: 'leg-lab' }, 'Número na célula: ordem em que foi expandida (na DFS, ordem de visita). Laranja: caminho final. Contorno azul: na fila ou na ABERTA.'), placar));
    roda('astar');
  }

  function labColorir(alvo, G, op = {}) {
    let cor = {};
    const fig = h('div', { class: 'lab-fig' });
    const status = h('p', { class: 'lab-status', 'aria-live': 'polite' });
    const ordens = op.ordens || [];
    const maxCor = op.maxCor || 4;
    function pinta() {
      const no = {}, aresta = {}, rot = {};
      vertices(G).forEach((v) => { if (cor[v]) { no[v] = 'c' + cor[v]; rot[v] = `cor ${cor[v]}`; } });
      let conflitos = 0;
      G.arestas.forEach(([u, v]) => { if (cor[u] && cor[u] === cor[v]) { aresta[chave(G, u, v)] = 'rej'; conflitos++; } });
      const svg = desenha(fig, G, { no, aresta, rot }, op);
      svg.querySelectorAll('.no').forEach((g) => {
        g.setAttribute('tabindex', '0');
        g.setAttribute('role', 'button');
        g.setAttribute('aria-label', `Vértice ${g.dataset.id}, ${cor[g.dataset.id] ? 'cor ' + cor[g.dataset.id] : 'sem cor'}. Clique para trocar a cor.`);
        const troca = () => { const v = g.dataset.id; cor[v] = ((cor[v] || 0) % maxCor) + 1; pinta(); };
        g.addEventListener('click', troca);
        g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); troca(); } });
      });
      const usados = new Set(Object.values(cor)).size;
      const falta = vertices(G).filter((v) => !cor[v]).length;
      status.innerHTML = conflitos ? `<span class="nok">${conflitos} aresta(s) com as duas pontas da mesma cor.</span>`
        : falta ? `Faltam ${falta} vértice(s). Cores usadas até agora: ${usados}.`
        : `<span class="ok">Coloração válida com ${usados} cor(es).</span>${op.chi ? (usados === op.chi ? ' É o mínimo para este grafo.' : ` Dá para fazer com ${op.chi}.`) : ''}`;
    }
    const botoes = h('div', { class: 'lab-bots' },
      h('button', { class: 'btn-sec', type: 'button', onclick: () => { cor = {}; pinta(); } }, 'Limpar'),
      ordens.map(([rot, ordem]) => h('button', { class: 'btn-sec', type: 'button', onclick: () => { cor = coloracao(G, ordem).cor; pinta(); } }, rot)));
    alvo.replaceChildren(h('div', { class: 'lab' }, fig, status, botoes));
    pinta();
  }

  function labPesos(alvo, G, pesoIni, op = {}) {
    const peso = { ...pesoIni };
    const fig = h('div', { class: 'lab-fig' });
    const res = h('div', { class: 'lab-res', 'aria-live': 'polite' });
    const campos = h('div', { class: 'lab-campos' });
    function calcula() {
      const g = independentePeso(G, peso), o = otimoPeso(G, peso), c = cromatico(G);
      const Gp = { ...G, pesoNo: Object.fromEntries(vertices(G).map((v) => [v, brl(peso[v])])) };
      const no = {};
      vertices(G).forEach((v) => { if (o.S.includes(v)) no[v] = 'sel'; });
      desenha(fig, Gp, { no }, { r: 5.2 });
      const igual = Math.abs(g.total - o.total) < 1e-9;
      res.innerHTML = `<p><b>Guloso por maior valor:</b> {${g.S.join(', ')}} = ${brl(g.total)}</p>
        <p><b>Melhor possível:</b> {${o.S.join(', ')}} = ${brl(o.total)} <span class="leg">(em laranja na figura)</span></p>
        <p class="${igual ? 'ok' : 'nok'}"><b>${igual ? 'Aqui o guloso acertou.' : `O guloso perdeu ${brl(o.total - g.total)}.`}</b> ${igual ? 'Acertar neste caso não prova que ele sempre acerta.' : 'Basta esse caso para mostrar que o guloso não é ótimo.'}</p>
        <p><b>Coloração (${op.rotCor || 'grupos'}):</b> χ = ${c.k}</p>`;
    }
    vertices(G).forEach((v) => {
      const id = `peso-${op.id || 'lab'}-${v}`;
      const inp = h('input', { type: 'number', id, step: '0.01', min: '0', value: peso[v] });
      inp.addEventListener('input', () => { const x = parseFloat(inp.value); if (!isNaN(x) && x >= 0) { peso[v] = x; calcula(); } });
      campos.append(h('label', { for: id }, h('span', {}, v), inp));
    });
    const pres = h('div', { class: 'lab-bots' }, (op.presets || []).map(([rot, vals]) => h('button', {
      class: 'btn-sec', type: 'button',
      onclick: () => { Object.assign(peso, vals); [...campos.querySelectorAll('input')].forEach((i, k) => (i.value = peso[vertices(G)[k]])); calcula(); },
    }, rot)));
    alvo.replaceChildren(h('div', { class: 'lab lab-2' }, h('div', {}, fig), h('div', {}, campos, pres, res)));
    calcula();
  }

  function labTroco(alvo) {
    const inpM = h('input', { type: 'text', id: 'troco-moedas', value: '1, 3, 4' });
    const inpV = h('input', { type: 'number', id: 'troco-valor', value: '6', min: '1', max: '500' });
    const out = h('div', { class: 'lab-res', 'aria-live': 'polite' });
    function calc() {
      const ms = inpM.value.split(/[,; ]+/).map(Number).filter((x) => Number.isInteger(x) && x > 0);
      const v = parseInt(inpV.value, 10);
      if (!ms.includes(1) || !(v > 0) || v > 500) { out.innerHTML = '<p class="nok">Use moedas inteiras, inclua a moeda 1 e um troco entre 1 e 500.</p>'; return; }
      const g = []; let r = v;
      [...ms].sort((a, b) => b - a).forEach((m) => { while (r >= m) { g.push(m); r -= m; } });
      const best = [0], esc = [0];
      for (let x = 1; x <= v; x++) { best[x] = INF; for (const m of ms) if (m <= x && best[x - m] + 1 < best[x]) { best[x] = best[x - m] + 1; esc[x] = m; } }
      const o = []; for (let x = v; x > 0; x -= esc[x]) o.push(esc[x]);
      o.sort((a, b) => b - a);
      out.innerHTML = `<p><b>Guloso:</b> ${g.join(' + ')} = ${g.length} moeda(s)</p><p><b>Mínimo (programação dinâmica):</b> ${o.join(' + ')} = ${o.length} moeda(s)</p>
        <p class="${g.length === o.length ? 'ok' : 'nok'}"><b>${g.length === o.length ? 'O guloso acertou este troco.' : 'Contraexemplo: o guloso não é ótimo para este sistema.'}</b></p>`;
    }
    inpM.addEventListener('input', calc);
    inpV.addEventListener('input', calc);
    alvo.replaceChildren(h('div', { class: 'lab' }, h('div', { class: 'lab-campos larg' },
      h('label', { for: 'troco-moedas' }, h('span', {}, 'Moedas (separadas por vírgula)'), inpM), h('label', { for: 'troco-valor' }, h('span', {}, 'Troco'), inpV)),
      h('div', { class: 'lab-bots' }, [['Real (centavos)', '1, 5, 10, 25, 50, 100', 68], ['{1, 3, 4}', '1, 3, 4', 6], ['{1, 5, 6, 9}', '1, 5, 6, 9', 11]].map(([r, m, v]) =>
        h('button', { class: 'btn-sec', type: 'button', onclick: () => { inpM.value = m; inpV.value = v; calc(); } }, r))), out));
    calc();
  }

  function labCriterios(alvo, ativs, op = {}) {
    const fig = h('div', { class: 'lab-fig larga' });
    const out = h('p', { class: 'lab-status', 'aria-live': 'polite' });
    const crits = op.criterios || [['ini', 'Início mais cedo'], ['dur', 'Menor duração'], ['fim', 'Término mais cedo']];
    const bots = h('div', { class: 'lab-bots' });
    function roda(c) {
      const r = selecao(ativs, c);
      const est = {};
      ativs.forEach((a) => (est[a.id] = r.S.includes(a) ? 'sel' : 'rej'));
      desenhaTempo(fig, ativs, est, { nomes: op.nomes, valores: op.valores });
      [...bots.children].forEach((b) => b.classList.toggle('ativo', b.dataset.c === c));
      out.innerHTML = `<b>${crits.find((x) => x[0] === c)[1]}:</b> ${r.S.length} evento(s), ${r.S.map((a) => a.id).join(', ')}${op.valores ? ` · valor total ${r.val}` : ''}.`;
    }
    crits.forEach(([c, rot]) => bots.append(h('button', { class: 'btn-sec', type: 'button', 'data-c': c, onclick: () => roda(c) }, rot)));
    alvo.replaceChildren(h('div', { class: 'lab' }, fig, out, bots));
    roda(crits[crits.length - 1][0]);
  }

  window.Grafos = { desenha, desenhaTempo, desenhaGrade, vizinhos, vertices, chave, dijkstra, bellmanFord, kruskal, prim, bfs, dfs,
    kahn, caminhoCritico, coloracao, ordemGrau, cromatico, independentePeso, otimoPeso, selecao, fordFulkerson, fleury,
    caixeiro, grade, buscaGrade, passoAPasso, passoTempo, labLabirinto, labColorir, labPesos, labTroco, labCriterios, fmt, brl };
})();
