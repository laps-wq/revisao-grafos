/* Módulo 9 · Fluxo em redes, Ford-Fulkerson e corte mínimo */
(function () {
  const { P, dica, armadilha, nota, lista, passos, codigo, tabela } = window.UI;
  const Gf = window.Grafos;
  const fig = (G, est = {}, op = {}) => { const d = document.createElement('div'); Gf.desenha(d, G, est, op); return `<div class="fig-estatica">${d.innerHTML}</div>`; };

  const REDE = { dirigido: true, nos: { s: [0, 50], A: [25, 15], C: [25, 50], E: [25, 85], B: [55, 15], D: [55, 50], F: [55, 85], t: [80, 50] },
    arestas: [['s', 'A', 13], ['s', 'C', 10], ['s', 'E', 10], ['A', 'B', 24], ['C', 'A', 5], ['B', 'D', 1], ['B', 't', 9], ['C', 'E', 15], ['C', 'F', 7], ['D', 'F', 6], ['D', 't', 13], ['E', 'F', 15], ['F', 't', 16]] };
  const CAMINHOS = [['s', 'A', 'B', 't'], ['s', 'E', 'F', 't'], ['s', 'C', 'E', 'F', 't'], ['s', 'C', 'F', 't'], ['s', 'C', 'A', 'B', 'D', 't']];
  const REV = { dirigido: true, nos: { s: [0, 25], a: [35, 0], b: [35, 50], t: [70, 25] }, arestas: [['s', 'a', 1], ['s', 'b', 1], ['a', 'b', 1], ['a', 't', 1], ['b', 't', 1]] };
  const UV = { dirigido: true, nos: { u: [0, 0], v: [40, 0] }, arestas: [['u', 'v', 10]] };
  const UVRES = { dirigido: true, nos: { u: [0, 0], v: [40, 0] }, arestas: [['u', 'v', 4], ['v', 'u', 6]] };
  const DESAFIO = { dirigido: true, nos: { s: [0, 30], a: [30, 0], b: [30, 60], c: [65, 0], d: [65, 60], t: [95, 30] },
    arestas: [['s', 'a', 10], ['s', 'b', 8], ['a', 'b', 5], ['a', 'c', 4], ['a', 'd', 6], ['b', 'd', 7], ['d', 'c', 3], ['c', 't', 8], ['d', 't', 6]] };

  window.MODULOS.push({
    id: 'fluxo',
    curto: 'Fluxo em redes',
    titulo: 'Fluxo em redes, Ford-Fulkerson e corte mínimo',
    grupo: 'Modelagem e complexidade',
    resumo: 'Quanto, no máximo, dá para levar da fonte ao sumidouro sem estourar nenhuma capacidade: conservação, caminho aumentante, grafo residual e o teorema do fluxo máximo e corte mínimo.',
    topicos: [
      { t: 'Por que estudar fluxo', h:
        tabela(['Sistema', 'O que flui'], [['abastecimento', 'litros por segundo em cada tubulação'], ['trânsito urbano', 'veículos por hora em cada via'], ['redes de computadores', 'largura de banda de cada enlace'], ['logística', 'caminhões por dia entre depósitos']]) +
        nota('Qual é a maior quantidade que conseguimos levar da origem s ao destino t sem ultrapassar a capacidade de nenhuma ligação?', 'Pergunta central') },
      { t: 'Rede de fluxo e rotulação dos arcos', h:
        P('Uma rede R = (V, E, F, U) é um grafo <b>direcionado</b> com um fluxo f(i, j) em cada arco, limites u(i, j), uma <b>fonte</b> s, que oferta, e um <b>sumidouro</b> t, que consome.',
          'Cada arco pode ter a tripla [ℓ, f, u]: limite mínimo, fluxo atual e limite máximo. O fluxo é <b>válido</b> se ℓ ≤ f ≤ u. Com ℓ = 0, escreve-se só f/u: 4/4 é fluxo 4 com capacidade 4. Quando f = u, o arco está <b>saturado</b>: não cabe mais nada.') },
      { t: 'Conservação de fluxo', h:
        `<div class="formula"><span>Σ f(i, x) que chega = Σ f(x, j) que sai</span><small>para todo vértice de passagem x ≠ s, t (1ª Lei de Kirchhoff)</small></div>` +
        P('Por exemplo, se num vértice de passagem chegam 2 + 3 = 5 unidades, saem exatamente 5. Fonte e sumidouro não são vértices de passagem: s oferta e t demanda.',
          'Por isso o valor do fluxo é o que sai de s: pela conservação, nada se perde no caminho, e o que sai de s é exatamente o que chega em t.') },
      { t: 'Várias fontes e vários sumidouros', h:
        passos(['Crie uma <b>superfonte</b> s ligada a cada fonte, com capacidade igual à oferta dela, e um <b>supersumidouro</b> t que recebe de cada sumidouro, com capacidade igual à demanda.', 'Se quiser que todo vértice conserve fluxo, acrescente o <b>arco de retorno</b> (t, s), com capacidade min(oferta total, demanda total). Por exemplo, com ofertas que somam 36 e demandas que somam 45, a capacidade é min(36, 45) = 36.']) },
      { t: 'O problema do fluxo máximo', h:
        lista(['<b>Maximizar</b> |f| = Σ<sub>j</sub> f(s, j), o que sai de s;', '<b>sujeito a</b> 0 ≤ f(i, j) ≤ c(i, j) em todo arco (capacidade);', 'e conservação em todo x ≠ s, t.']) +
        P('Se os dois únicos arcos que saem de s têm capacidades 4 e 3 e estão saturados, com 4 + 3 = 7 chegando em t, não dá para enviar mais que 7. <b>Arcos saturados que separam s de t limitam o fluxo.</b>') },
      { t: 'Ford-Fulkerson e o grafo residual', h:
        passos(['<b>Encontre</b> um caminho de s a t em que todos os arcos têm capacidade sobrando: um <b>caminho aumentante</b>.', '<b>Envie</b> por ele o <b>gargalo</b> Δ, a menor capacidade residual do caminho.', '<b>Atualize</b> as capacidades residuais e repita enquanto houver caminho.']) +
        P('No <b>grafo residual</b>, cada arco (u, v) com fluxo f e capacidade c vira dois: o <b>direto</b> u → v, com c − f (o que ainda cabe), e o <b>reverso</b> v → u, com f (o que pode ser desfeito). O arco 6/10 abaixo vira um direto de 4 e um reverso de 6.') +
        `<div class="figs-lado">${fig(UV, { rotAresta: { 'u>v': '6/10' } }, { rotulo: 'Arco u para v com fluxo 6 e capacidade 10' })}${fig(UVRES, { aresta: { 'v>u': 'leve' } }, { rotulo: 'No grafo residual: arco direto u para v com 4 e arco reverso v para u com 6' })}</div>` +
        P('Caminho aumentante é qualquer caminho de s a t no residual, só com arcos de capacidade &gt; 0. Enviar Δ por um arco reverso é <b>cancelar</b> Δ do fluxo no arco original: é assim que o algoritmo corrige uma escolha ruim.') +
        codigo(['FORD-FULKERSON(G, s, t)', '    para cada arco (u, v) de G: f(u, v) ← 0', '    enquanto existe caminho P de s a t em G_f:', '        Δ ← min{ c_f(u, v) : (u, v) em P }     // gargalo', '        para cada arco (u, v) em P:', '            se (u, v) é arco de G: f(u, v) ← f(u, v) + Δ', '            senão: f(v, u) ← f(v, u) − Δ        // reverso', '    retorne f'], 'Ford-Fulkerson') +
        lista(['O caminho P sai de qualquer busca no residual: DFS ou BFS.', 'Com capacidades inteiras, cada iteração soma pelo menos 1: o algoritmo termina, em O(E · |f*|).', 'Com BFS (o caminho com menos arcos), chama-se <b>Edmonds-Karp</b>, O(V · E²), independente das capacidades.']) },
      { t: 'Corte mínimo', h:
        P('Um <b>corte</b> (S, T) divide os vértices em dois lados, com s ∈ S e t ∈ T. Sua <b>capacidade</b> é a soma das capacidades dos arcos que vão <b>de S para T</b>. Arcos de T para S não contam.') +
        nota(P('<b>Teorema do fluxo máximo e corte mínimo:</b> o valor do fluxo máximo é igual à capacidade do corte mínimo.', 'Qualquer fluxo é ≤ qualquer corte, porque tudo o que vai de s a t atravessa o corte. No fim do Ford-Fulkerson, S = vértices ainda alcançáveis a partir de s no residual: todo arco de S para T está saturado e todo arco de T para S está vazio, então o fluxo é igual à capacidade desse corte.'), 'Teorema') +
        P('Na rede da aba Exemplos, ao final S = {s, A, B, C, E, F} e T = {D, t}. Os arcos de S para T são B→D (1), B→t (9) e F→t (16): 1 + 9 + 16 = <b>26</b>, o fluxo máximo. O arco D→F vai de T para S e não entra na soma.') +
        armadilha('A capacidade do corte {s} (13 + 10 + 10 = 33) e a do corte {t} (9 + 13 + 16 = 38) são limites, não o fluxo máximo. O fluxo máximo é o <b>menor</b> de todos os cortes.') },
    ],
    exemplos: [
      { t: 'Ford-Fulkerson passo a passo', d: P('Os caminhos aumentantes foram escolhidos à mão, um por iteração. Rótulo f/c em cada arco. Laranja: o caminho da iteração. Arcos saturados ficam marcados; no fim, em vermelho tracejado, o corte mínimo.'),
        mount(el) { Gf.passoAPasso(el, REDE, Gf.fordFulkerson(REDE, 's', 't', CAMINHOS), { tabelaEmbaixo: true, pad: 11 }); },
        depois: P('Escolhendo os caminhos pela BFS (Edmonds-Karp), a sequência muda: s→A→B→t (9), s→C→F→t (7), s→E→F→t (9) e s→A→B→D→t (1). O total continua 26: o valor máximo não depende dos caminhos escolhidos.') },
      { t: 'Para que serve o arco reverso', d: P('Rede com todas as capacidades iguais a 1. O primeiro caminho escolhido, s→a→b→t, parece bom, mas bloqueia tudo. Sem arco reverso, o algoritmo pararia com fluxo 1.'),
        mount(el) { Gf.passoAPasso(el, REV, Gf.fordFulkerson(REV, 's', 't', [['s', 'a', 'b', 't'], ['s', 'b', 'a', 't']]), { tabelaEmbaixo: true }); },
        depois: P('Na iteração 2, o caminho s→b→a→t usa o arco <b>reverso</b> b→a do grafo residual: o fluxo de a→b é cancelado e volta a 0/1. Resultado: duas unidades, por s→a→t e s→b→t. O corte {s} tem capacidade 2, então 2 é o máximo.') },
    ],
    atividades: [
      { t: 'Válido ou inválido?', tipo: 'classificar', d: P('Cada item descreve parte de um fluxo, com limite mínimo 0.'),
        cfg: { cats: ['Válido', 'Inválido'], itens: [
          { t: 'Um arco com rótulo 7/5.', c: 1, e: 'Fluxo maior que a capacidade.' },
          { t: 'Um arco com rótulo 0/4.', c: 0, e: 'Fluxo zero é permitido.' },
          { t: 'Vértice de passagem: entram 3 + 5, saem 6 + 2.', c: 0, e: '8 = 8: conserva.' },
          { t: 'Vértice de passagem: entram 4 + 4, saem 5.', c: 1, e: 'Chegam 8 e saem 5: viola a conservação.' },
          { t: 'A fonte s: saem 10, não entra nada.', c: 0, e: 's não é vértice de passagem: ela oferta.' },
          { t: 'Um arco com rótulo 6/6.', c: 0, e: 'Válido e saturado.' },
        ] } },
      { t: 'Contas na rede do exemplo', tipo: 'qa', d: P('Use a rede da aba Exemplos.'), itens: [
        { q: 'Na iteração 3, o caminho é s→C→E→F→t. Quais são as capacidades residuais e o gargalo?', a: P('s→C: 10 − 0 = 10; C→E: 15 − 0 = 15; E→F: 15 − 10 = 5; F→t: 16 − 10 = 6. Gargalo Δ = 5, que satura E→F.') },
        { q: 'Qual é a capacidade do corte S = {s, A, C, E}, T = {B, D, F, t}? Por que ela não é o fluxo máximo?', a: P('Arcos de S para T: A→B (24), C→F (7) e E→F (15): 46. É um corte válido, e todo fluxo é ≤ 46; mas o fluxo máximo é a capacidade do <b>menor</b> corte, 26.') },
        { q: 'Uma rede tem duas fontes, com ofertas 20 e 15, e dois sumidouros, com demandas 10 e 30. Como transformar em uma rede com uma fonte e um sumidouro? Qual a capacidade do arco de retorno?', a: P('Superfonte s com arcos s → fonte 1 (20) e s → fonte 2 (15); supersumidouro t com arcos sumidouro 1 → t (10) e sumidouro 2 → t (30). Arco de retorno (t, s) com capacidade min(35, 40) = 35.') },
      ] },
    ],
    desafios: [
      { fonte: 'Inédita · conservação', enun: P('Em uma rede de fluxo, um vértice de passagem x recebe dois arcos, com fluxos 4 e 7, e tem dois arcos de saída, um com fluxo 5 e outro com fluxo f. Para que o fluxo seja válido, f deve valer'),
        opts: ['2', '6', '11', '16'], c: 1,
        e: 'Conservação: o que chega (4 + 7 = 11) é igual ao que sai (5 + f). Logo f = 6.' },
      { fonte: 'Inédita · gargalo', enun: P('Durante o Ford-Fulkerson, encontrou-se o caminho aumentante s → p → q → r → t, cujos arcos têm capacidades residuais 8, 3, 12 e 5, nessa ordem. Após enviar o fluxo por esse caminho, é correto afirmar que'),
        opts: ['o fluxo total aumenta 28, a soma das residuais.', 'o fluxo total aumenta 12, e o arco q → r fica saturado.', 'o fluxo total aumenta 3, e o arco p → q fica saturado.', 'o fluxo total aumenta 5, e o arco r → t fica saturado.'], c: 2,
        e: 'O gargalo é a menor residual do caminho: Δ = min(8, 3, 12, 5) = 3. Enviar 3 zera a residual de p → q, que fica saturado; as outras passam a 5, 9 e 2.' },
      { fonte: 'Inédita · fluxo máximo', enun: P('Na rede abaixo, os números são as capacidades dos arcos.') + fig(DESAFIO, {}, { pad: 10 }) + P('Qual é o fluxo máximo de s para t?'),
        opts: ['13', '14', '18', '20'], c: 0,
        e: 'Caminhos: s→a→c→t (4), s→a→d→t (6) e s→b→d→c→t (3): total 13. Não há mais caminho aumentante: a partir de s ainda se alcançam s, b, d e, pelo arco reverso de a→d, a. O corte S = {s, a, b, d} tem arcos de S para T a→c (4), d→c (3) e d→t (6): 13. O corte {t} vale 14 e o corte {s} vale 18: são limites, não o máximo.',
        w: { 1: '14 é a soma dos arcos que chegam em t (8 + 6). É um corte, mas não o menor: a→c e d→c só conseguem levar 7 até c.', 2: '18 é o que sai de s (10 + 8): não cabe tudo isso no resto da rede.' } },
      { fonte: 'Inédita · grafo residual', enun: P('Em uma rede, o arco (u, v) tem capacidade 12 e fluxo atual 5. No grafo residual correspondente, existem'),
        opts: ['apenas o arco u → v, com capacidade 7.', 'o arco u → v, com capacidade 12, e o arco v → u, com capacidade 5.', 'o arco u → v, com capacidade 5, e o arco v → u, com capacidade 7.', 'o arco u → v, com capacidade 7, e o arco v → u, com capacidade 5.'], c: 3,
        e: 'Direto: o que ainda cabe, c − f = 7. Reverso: o que pode ser desfeito, f = 5. O reverso é o que permite ao algoritmo cancelar fluxo de uma escolha anterior.' },
      { fonte: 'Inédita · Edmonds-Karp', enun: P('Quando o Ford-Fulkerson escolhe, em cada iteração, o caminho aumentante com o menor número de arcos, encontrado por busca em largura no grafo residual, o algoritmo é conhecido como'),
        opts: ['Edmonds-Karp, com complexidade O(V · E²), independente das capacidades.', 'Bellman-Ford, com complexidade O(V · E).', 'Dijkstra, com complexidade O((V + E) log V).', 'Prim, com complexidade O(E log V).'], c: 0,
        e: 'É o Edmonds-Karp. Com BFS, o número de iterações fica limitado por O(V · E), e cada BFS custa O(E): O(V · E²). Sem essa escolha, com capacidades inteiras, o custo depende do valor do fluxo máximo, O(E · |f*|).' },
      { fonte: 'Inédita · corte mínimo', enun: P('Sobre fluxo máximo em uma rede com fonte s e sumidouro t, avalie as afirmações.') +
        '<ol class="enun-afirm"><li>I. O valor de qualquer fluxo de s para t é menor ou igual à capacidade de qualquer corte que separa s de t.</li><li>II. Quando o Ford-Fulkerson termina, os vértices alcançáveis a partir de s no grafo residual definem um corte cuja capacidade é igual ao fluxo obtido.</li><li>III. A capacidade de um corte (S, T) é a soma das capacidades dos arcos de S para T mais a dos arcos de T para S.</li></ol>' + P('É correto o que se afirma em'),
        opts: ['I, apenas.', 'III, apenas.', 'I e II, apenas.', 'I, II e III.'], c: 2,
        e: 'I: tudo o que vai de s a t atravessa o corte. II: é o corte mínimo que o algoritmo deixa pronto no fim, e é por isso que o fluxo obtido é máximo. III é falsa: só contam os arcos de S para T.' },
    ],
  });
})();
