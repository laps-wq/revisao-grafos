/* Módulo 6 · Euler, Hamilton, caixeiro viajante e P × NP */
(function () {
  const { P, dica, armadilha, nota, lista, passos, tabela, h, tabelaEl } = window.UI;
  const Gf = window.Grafos;
  const fig = (G, est = {}, op = {}) => { const d = document.createElement('div'); Gf.desenha(d, G, est, op); return `<div class="fig-estatica">${d.innerHTML}</div>`; };

  const KONIGSBERG = { nos: { C: [0, 0], A: [0, 30], B: [0, 60], D: [44, 30] },
    arestas: [['A', 'C', null, { curva: 7 }], ['A', 'C', null, { curva: -7 }], ['A', 'B', null, { curva: 7 }], ['A', 'B', null, { curva: -7 }], ['A', 'D'], ['C', 'D'], ['B', 'D']] };
  const FLEURY = { nos: { 1: [20, 0], 2: [50, 0], 3: [80, 0], 4: [5, 30], 5: [35, 30], 6: [65, 30], 7: [95, 30] },
    arestas: [['1', '4', 'a'], ['1', '5', 'b'], ['2', '5', 'c'], ['2', '6', 'd'], ['3', '6', 'e'], ['3', '7', 'f'], ['4', '5', 'g'], ['5', '6', 'h'], ['6', '7', 'i']] };
  const K5 = { nos: { A: [50, 0], B: [95, 33], C: [78, 85], D: [22, 85], E: [5, 33] },
    arestas: [['A', 'B', 2], ['A', 'C', 9], ['A', 'D', 10], ['A', 'E', 7], ['B', 'C', 6], ['B', 'D', 4], ['B', 'E', 3], ['C', 'D', 8], ['C', 'E', 5], ['D', 'E', 6]] };
  const COND = { nos: { A: [25, 0], B: [55, 0], C: [75, 25], D: [55, 50], E: [25, 50], G: [5, 25] },
    arestas: [['G', 'A'], ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'G'], ['A', 'D']] };

  /** todos os circuitos hamiltonianos de um grafo completo, cada um contado uma vez */
  function circuitos(G, ini) {
    const A = Gf.vizinhos(G), w = (a, b) => A[a].find(([x]) => x === b)[1];
    const outros = Gf.vertices(G).filter((v) => v !== ini), out = [];
    const perm = (p, resto) => {
      if (!resto.length) {
        const r = [ini, ...p, ini];
        if (r[1] > r[r.length - 2]) return;
        out.push({ r, custo: r.slice(1).reduce((s, v, i) => s + w(r[i], v), 0) });
        return;
      }
      resto.forEach((x, i) => perm([...p, x], [...resto.slice(0, i), ...resto.slice(i + 1)]));
    };
    perm([], outros);
    return out.sort((a, b) => a.custo - b.custo || a.r.join('').localeCompare(b.r.join('')));
  }
  const arestasDe = (r) => r.slice(1).map((v, i) => (r[i] < v ? `${r[i]}-${v}` : `${v}-${r[i]}`));

  window.MODULOS.push({
    id: 'euler-hamilton',
    curto: 'Euler, Hamilton e P × NP',
    titulo: 'Euler, Hamilton, caixeiro viajante e P × NP',
    grupo: 'Modelagem e complexidade',
    enade: 'ENADE 2014 (questão 22), ENADE 2014 de Engenharia de Computação (questão 22) e ENADE 2011 (questão 36), nos desafios',
    resumo: 'Passar por todas as arestas (Euler) é fácil de decidir; passar por todos os vértices (Hamilton) é difícil. Daí o caixeiro viajante e as classes P, NP e NP-completo.',
    topicos: [
      { t: 'As pontes de Königsberg', h:
        P('É possível passear pela cidade, começando e terminando no mesmo lugar, passando por cada ponte uma única vez? Em grafo: existe um trajeto <b>fechado</b> que inclua todas as arestas?') +
        P('Em Königsberg, o rio Pregel separava a cidade em quatro regiões: as duas margens (B e C), a ilha central (A) e a região a leste, entre os dois braços do rio (D). Sete pontes as ligavam: duas entre A e B, duas entre A e C, e uma de A, de B e de C até D. Cada região vira um vértice e cada ponte, uma aresta:') +
        fig(KONIGSBERG, {}, { rotulo: 'Grafo de Königsberg: A ligado duas vezes a B, duas vezes a C e uma vez a D; B e C ligados a D' }) +
        P('Pelo Teorema de Euler, a resposta é não: os quatro vértices têm grau ímpar (A tem grau 5; B, C e D têm grau 3). Repare que o grafo tem arestas paralelas: é um multigrafo.') },
      { t: 'Trajeto euleriano e o Teorema de Euler', h:
        lista(['<b>Trajeto euleriano:</b> inclui todas as arestas, cada uma uma única vez (vértices podem se repetir).', '<b>Grafo euleriano:</b> conexo e com um trajeto euleriano <b>fechado</b>.', '<b>Semi-euleriano:</b> não é euleriano, mas tem um trajeto euleriano aberto.']) +
        nota(P('<b>Teorema de Euler (1736):</b> um grafo conexo é euleriano se, e somente se, todo vértice tem grau par.', '<b>Corolário:</b> um grafo conexo é semi-euleriano se, e somente se, tem <b>exatamente dois</b> vértices de grau ímpar. O trajeto começa em um deles e termina no outro.'), 'Teorema') +
        passos(['O grafo é conexo? Se não, não há trajeto euleriano.', 'Conte os vértices de grau ímpar: 0 → euleriano; 2 → semi-euleriano; mais de 2 → nenhum dos dois.']) +
        dica('Não existe grafo com exatamente um vértice de grau ímpar: pela soma dos graus, a quantidade de vértices de grau ímpar é sempre par.') },
      { t: 'Algoritmo de Fleury', h:
        P('Para um grafo conexo com todos os graus pares (ou começando num vértice de grau ímpar, no caso semi-euleriano):') +
        passos(['Comece em um vértice e percorra arestas;', 'exclua cada aresta depois de passar por ela, e os vértices que ficarem isolados;', 'passe por uma <b>ponte</b> (aresta cuja remoção desconecta o que sobrou) somente se não houver outra alternativa;', 'continue até percorrer todas as arestas.']) +
        P('No grafo da aba Exemplos, começando em 5, o trajeto é 5 → 1 → 4 → 5 → 2 → 6 → 3 → 7 → 6 → 5. Veja na aba Exemplos.') },
      { t: 'Digrafos eulerianos', h:
        P('Num digrafo conexo, a direção das arestas conta:') +
        lista(['<b>Euleriano</b> se, e somente se, é <b>balanceado</b>: d<sub>e</sub>(v) = d<sub>s</sub>(v) em todo vértice (entra o mesmo número que sai).', '<b>Semi-euleriano</b> se, e somente se, um vértice x tem d<sub>s</sub>(x) − d<sub>e</sub>(x) = 1 (início), um vértice y tem d<sub>e</sub>(y) − d<sub>s</sub>(y) = 1 (fim) e todos os outros são balanceados.']) },
      { t: 'Hamilton: todos os vértices', h:
        tabela(['Trajeto euleriano', 'Circuito hamiltoniano'], [['todas as <b>arestas</b>, cada uma uma vez', 'todos os <b>vértices</b>, cada um uma vez'], ['vértices podem se repetir', 'volta ao vértice inicial, formando um circuito'], ['decidir é fácil: contar graus, O(n + m)', 'decidir é difícil: NP-completo']]) +
        lista(['<b>Grafo hamiltoniano:</b> tem um circuito que contém todos os vértices.', '<b>Semi-hamiltoniano:</b> não é hamiltoniano, mas tem um caminho que contém todos os vértices.']) +
        P('<b>Observações úteis</b> para montar ou descartar um circuito:') +
        lista(['arestas paralelas e laços não entram no circuito;', 'num vértice de grau 2, as duas arestas incidentes <b>têm</b> de estar no circuito;', 'não se pode fechar um subcircuito antes de visitar todos os vértices;', 'depois que um vértice já tem suas duas arestas no circuito, as outras arestas dele podem ser descartadas.']) },
      { t: 'Ore e Dirac: condições suficientes', h:
        nota(P('<b>Ore (1960):</b> se G é simples, n ≥ 3 e d(v) + d(w) ≥ n para todo par de vértices <b>não adjacentes</b> v e w, então G é hamiltoniano.', '<b>Dirac (1952):</b> se G é simples, n ≥ 3 e d(v) ≥ n/2 para todo vértice, então G é hamiltoniano. É um caso especial de Ore.'), 'Teoremas') +
        armadilha('As duas condições são <b>suficientes, não necessárias</b>. Se o grafo não satisfaz Dirac, não se conclui nada. O ciclo C<sub>6</sub> tem todos os graus iguais a 2 &lt; 6/2 e mesmo assim é hamiltoniano: ele próprio é o circuito.') },
      { t: 'Grafos completos e contagem de circuitos', h:
        P('Todo K<sub>n</sub> com n ≥ 3 é hamiltoniano (satisfaz Dirac: d(v) = n − 1 ≥ n/2): basta seguir 1, 2, …, n, 1.') +
        `<div class="formula"><span>circuitos hamiltonianos distintos em K<sub>n</sub> = (n − 1)! / 2</span><small>fixe a origem e permute os outros n − 1; divida por 2 porque {a, b, c, d, a} e {a, d, c, b, a} são o mesmo circuito</small></div>` +
        P('Para n ≥ 3 ímpar, K<sub>n</sub> tem (n − 1)/2 circuitos hamiltonianos <b>aresta-disjuntos</b>: as n(n − 1)/2 arestas se dividem em (n − 1)/2 circuitos de n arestas.') +
        armadilha('A tabela de explosão combinatória do caixeiro (logo abaixo) conta (n − 1)! <b>rotas</b>, porque ali percorrer em um sentido ou no outro conta duas vezes. <b>Circuitos distintos</b> são (n − 1)!/2. Leia o que a questão pede.') },
      { t: 'O problema do caixeiro viajante', h:
        P('Visitar cada cidade exatamente uma vez e voltar à origem, com a menor distância total. Em grafo valorado: vértices são cidades, arestas são estradas, pesos são distâncias, e o objetivo é o <b>circuito hamiltoniano de menor custo</b>.') +
        tabela(['Cidades', 'Rotas possíveis', 'Tempo para testar todas (1 milhão de rotas por segundo)'], [['10', '9! = 362.880', '0,36 s'], ['20', '19! ≈ 1,22 × 10¹⁷', 'cerca de 3.800 anos']]) +
        P('Como a força bruta explode, na prática usam-se <b>heurísticas de construção</b>, como a do <b>vizinho mais próximo</b>: saia da origem, vá sempre para a cidade não visitada mais perto e, no fim, volte. É rápida, mas não garante o ótimo, e o resultado depende de onde se começa.') },
      { t: 'P, NP e NP-completo', h:
        lista(['<b>P:</b> problemas de decisão resolvidos em tempo polinomial (O(n<sup>k</sup>)).', '<b>NP:</b> problemas cuja resposta “sim” pode ser <b>verificada</b> em tempo polinomial, dado um certificado. Dado um circuito, verificar que ele passa por todos os vértices uma vez é fácil; achar um é que é difícil. Todo problema de P está em NP.',
          '<b>NP-difícil:</b> pelo menos tão difícil quanto qualquer problema de NP: todo problema de NP se reduz a ele em tempo polinomial.', '<b>NP-completo:</b> está em NP <b>e</b> é NP-difícil. Se um único NP-completo tiver algoritmo polinomial, então P = NP, questão em aberto.']) +
        P('<b>Redução:</b> para mostrar que um problema novo X é difícil, reduz-se um problema difícil conhecido <b>a</b> X: se X fosse fácil, o conhecido também seria. É o que a questão do ENADE 2014 diz com “o problema do caixeiro-viajante se reduz a ele”.') +
        tabela(['Parece fácil, e é (P)', 'Parece parecido, mas é difícil'], [['trajeto euleriano', 'circuito hamiltoniano (NP-completo)'], ['árvore geradora mínima', 'caixeiro viajante (otimização: NP-difícil)'], ['caminho mínimo (pesos ≥ 0)', 'caminho simples mais longo (NP-difícil)'], ['2-coloração: o grafo é bipartido?', 'k-coloração com k ≥ 3 (NP-completo)']]) +
        armadilha('“É de otimização, logo é NP-difícil” está errado: AGM e caminho mínimo são de otimização e estão em P. E “não se conhece algoritmo polinomial” não é o mesmo que “está provado que não existe”.') },
    ],
    exemplos: [
      { t: 'Fleury a partir de 5', d: P('As letras são os nomes das arestas. Cinza claro: já percorridas (e apagadas). Laranja: a última.'),
        mount(el) { Gf.passoAPasso(el, FLEURY, Gf.fleury(FLEURY, '5'), { tabelaEmbaixo: true }); },
        depois: P('Todos os vértices têm grau par (5 e 6 têm grau 4; os outros, 2), então o trajeto fecha em 5. Saindo de 5, as quatro arestas servem; o Fleury só proíbe atravessar ponte quando há alternativa.') },
      { t: 'Caixeiro viajante em K5: vizinho mais próximo × força bruta', d: P('Cinco cidades, todas ligadas. Compare a heurística com o ótimo.'),
        mount(el) {
          const figura = h('div', { class: 'lab-fig' });
          const txt = h('p', { class: 'lab-status', 'aria-live': 'polite' });
          const tabCirc = h('div', { class: 'tabela-wrap' });
          const todos = circuitos(K5, 'A');
          const marca = (r, cls) => { const aresta = {}; arestasDe(r).forEach((k) => (aresta[k] = cls)); return { aresta, no: { [r[0]]: 'fechado' } }; };
          const bots = h('div', { class: 'lab-bots' });
          const vistas = {};
          ['A', 'B'].forEach((s) => {
            const x = Gf.caixeiro(K5, s);
            vistas['nn' + s] = [x.vizinho, 'caminho', `<b>Vizinho mais próximo a partir de ${s}:</b> ${x.vizinho.join(' → ')} = <b>${x.custoVizinho}</b>.${s === 'A' ? ' Começa bem (2 e 3) e é obrigado a pagar 8 e 10 no fim.' : ' Saindo de B, a mesma heurística acha um circuito de custo ótimo: o resultado depende da origem.'}`];
          });
          const o = Gf.caixeiro(K5, 'A');
          vistas.otimo = [o.rota, 'arvore', `<b>Ótimo pela força bruta:</b> ${o.rota.join(' → ')} = <b>${o.otimo}</b>. Foram testados os (5 − 1)!/2 = ${o.circuitos} circuitos da tabela.`];
          const mostra = (k) => {
            const [r, cls, msg] = vistas[k];
            Gf.desenha(figura, K5, marca(r, cls));
            txt.innerHTML = msg;
            [...bots.children].forEach((b) => b.classList.toggle('ativo', b.dataset.k === k));
          };
          [['nnA', 'Vizinho mais próximo (A)'], ['nnB', 'Vizinho mais próximo (B)'], ['otimo', 'Ótimo (força bruta)']].forEach(([k, r]) =>
            bots.append(h('button', { class: 'btn-sec', type: 'button', 'data-k': k, onclick: () => mostra(k) }, r)));
          tabCirc.append(tabelaEl(['#', 'Circuito', 'Custo'], todos.map((c, i) => [i + 1, c.r.join(' → '), c.custo]), todos.map((c, i) => (c.custo === todos[0].custo ? i : -1)).filter((i) => i >= 0)));
          el.append(h('div', { class: 'lab' }, figura, txt, bots, h('details', { class: 'lab-det' }, h('summary', {}, 'Ver os 12 circuitos'), tabCirc)));
          mostra('nnA');
        },
        depois: P('Com 5 cidades, a força bruta testa 12 circuitos. Com 20, seriam 19!/2 ≈ 6 × 10¹⁶. Daí as heurísticas.') },
    ],
    atividades: [
      { t: 'Euleriano, semi-euleriano ou nenhum?', tipo: 'classificar', d: P('Todos os grafos são não dirigidos, salvo quando dito.'),
        cfg: { cats: ['Euleriano', 'Semi-euleriano', 'Nenhum'], itens: [
          { t: 'Conexo, graus 2, 2, 4, 2, 2.', c: 0, e: 'Conexo e todos os graus pares.' },
          { t: 'Conexo, graus 3, 2, 2, 3.', c: 1, e: 'Exatamente dois vértices de grau ímpar: o trajeto começa em um e termina no outro.' },
          { t: 'K<sub>4</sub> (graus 3, 3, 3, 3).', c: 2, e: 'Quatro vértices de grau ímpar.' },
          { t: 'As pontes de Königsberg (graus 5, 3, 3, 3).', c: 2, e: 'Quatro vértices de grau ímpar: a resposta de Euler.' },
          { t: 'Dois triângulos separados (desconexo), todos os graus 2.', c: 2, e: 'Graus pares não bastam: um trajeto não salta de uma componente para a outra.' },
          { t: 'Digrafo conexo em que cada vértice tem d<sub>e</sub> = d<sub>s</sub>.', c: 0, e: 'Balanceado: é a condição dos digrafos.' },
          { t: 'K<sub>5</sub> (graus 4, 4, 4, 4, 4).', c: 0, e: 'Todo K<sub>n</sub> com n ímpar tem graus n − 1, pares.' },
        ] } },
      { t: 'Euler ou Hamilton?', tipo: 'classificar', d: P('O que o problema exige percorrer?'),
        cfg: { cats: ['Euler (arestas)', 'Hamilton (vértices)'], itens: [
          { t: 'Um carteiro precisa passar por todas as ruas do bairro e voltar à agência.', c: 0, e: 'Cada rua é uma aresta.' },
          { t: 'Um entregador precisa visitar cada cliente uma vez e voltar ao depósito.', c: 1, e: 'Cada cliente é um vértice.' },
          { t: 'Desenhar uma figura sem tirar o lápis do papel e sem repetir traço.', c: 0, e: 'Cada traço é uma aresta.' },
          { t: 'O cavalo do xadrez deve passar por todas as 64 casas, uma vez cada.', c: 1, e: 'Cada casa é um vértice.' },
          { t: 'Um robô de inspeção deve percorrer todos os dutos de uma tubulação.', c: 0, e: 'Cada duto é uma aresta.' },
        ] } },
      { t: 'Ore, Dirac e contagem', tipo: 'qa', itens: [
        { q: 'Um grafo simples tem 8 vértices, todos de grau 4. Dirac garante que ele é hamiltoniano?', a: P('Sim: n/2 = 4 e todo vértice tem grau ≥ 4.') },
        { q: 'Um grafo simples de 8 vértices tem um vértice de grau 3. O que Dirac diz?', a: P('Nada: a condição não é satisfeita, e Dirac é só suficiente. O grafo pode ou não ser hamiltoniano.') },
        { q: 'Quantos circuitos hamiltonianos distintos há em K<sub>6</sub>?', a: P('(6 − 1)!/2 = 120/2 = 60.') },
        { q: 'Quantos circuitos hamiltonianos aresta-disjuntos existem em K<sub>7</sub>? Confira contando arestas.', a: P('(7 − 1)/2 = 3. K<sub>7</sub> tem 7 · 6/2 = 21 arestas, e cada circuito usa 7: 3 · 7 = 21.') },
        { q: 'Em um grafo, o vértice X tem grau 2, com vizinhos Y e Z. O que isso diz sobre qualquer circuito hamiltoniano?', a: P('As arestas X–Y e X–Z estão obrigatoriamente no circuito: é o único jeito de entrar e sair de X.') },
      ] },
    ],
    desafios: [
      { fonte: 'ENADE 2014 · Questão 22', enun:
        P('Considere o processo de fabricação de um produto siderúrgico que necessita passar por <i>n</i> tratamentos térmicos e químicos para ficar pronto. Cada uma das <i>n</i> etapas de tratamento é realizada uma única vez na mesma caldeira. Além do custo próprio de cada etapa do tratamento, existe o custo de se passar de uma etapa para outra, uma vez que, dependendo da sequência escolhida, pode ser necessário alterar a temperatura da caldeira e limpá-la para evitar a reação entre os produtos químicos utilizados. Assuma que o processo de fabricação inicia e termina com a caldeira limpa. Deseja-se projetar um algoritmo para indicar a sequência de tratamentos que possibilite fabricar o produto com o menor custo total. Nessa situação, conclui-se que'),
        opts: ['a solução do problema é obtida em tempo de ordem <i>O</i>(<i>n</i> log <i>n</i>), utilizando-se um algoritmo ótimo de ordenação.', 'uma heurística para a solução do problema de coloração de grafos solucionará o problema em tempo polinomial.', 'o problema se reduz a encontrar a árvore geradora mínima para o conjunto de etapas do processo, requerendo tempo de ordem polinomial para ser solucionado.', 'a utilização do algoritmo de Dijkstra para se determinar o caminho de custo mínimo entre o estado inicial e o final soluciona o problema em tempo polinomial.', 'qualquer algoritmo conhecido para a solução do problema descrito possui ordem de complexidade de tempo não-polinomial, uma vez que o problema do caixeiro viajante se reduz a ele.'], c: 4,
        e: 'Etapas são vértices, custos de transição são pesos, e a sequência passa por todas as etapas uma vez, saindo e voltando à caldeira limpa: é um circuito hamiltoniano de custo mínimo, o caixeiro viajante. Como o caixeiro se reduz a esse problema, ele é pelo menos tão difícil quanto o caixeiro, e não se conhece algoritmo polinomial para ele.',
        w: { 2: 'A AGM liga tudo com o menor total, mas é uma árvore: não define uma sequência que passe por cada etapa uma vez e volte.', 3: 'O caminho mínimo de um estado a outro não obriga a passar por todas as etapas.', 0: 'Ordenar não leva em conta o custo de transição entre pares de etapas.', 1: 'Coloração trata conflitos (quem não pode ficar junto), não a ordem de uma sequência.' } },
      { fonte: 'ENADE 2014 · Engenharia de Computação · Questão 22', enun:
        P('Dois conhecidos problemas de pesquisa operacional possuem uma ampla gama de aplicações em comunicação, transporte e planejamento: o problema do carteiro chinês (PCC), e o problema do caixeiro viajante (PCV). O primeiro consiste em minimizar o esforço de um carteiro que precisa percorrer todas as ruas de uma cidade. O segundo consiste em minimizar o deslocamento do vendedor que precisa visitar todas as cidades interconectadas de uma dada região, retornando à cidade de origem. Esses problemas têm sido modelados com teoria dos grafos, de onde se destacam dois conceitos relacionados: <i>circuito euleriano</i> e <i>ciclo hamiltoniano</i>.',
          'Uma <b>trilha</b> é uma sequência de arestas adjacentes em que não há repetição de arestas, e seu comprimento é a quantidade de arestas. A trilha é dita fechada se inicia e finaliza no mesmo vértice. Assim, um grafo com <i>m</i> arestas é euleriano se nele existe uma trilha fechada de comprimento <i>m</i> (trilha euleriana). Um ciclo hamiltoniano é uma trilha fechada que passa sem repetir por todos os vértices.',
          'Com base nos conceitos acima, avalie as afirmações a seguir.') +
        '<ol class="enun-afirm"><li>I. Se o grafo das cidades e suas interconexões for euleriano, então o PCV pode ser resolvido de uma forma tal que o caixeiro não terá que fazer visitas repetidas.</li><li>II. Se todas as cidades se conectam com todas as outras, então a solução do PCV é um ciclo hamiltoniano correspondente ao menor deslocamento.</li><li>III. Se o grafo for euleriano e possuir um ciclo hamiltoniano, então o PCC e o PCV darão como resultado a mesma trilha.</li></ol>' +
        P('É correto o que se afirma em'),
        opts: ['II, apenas.', 'III, apenas.', 'I e II, apenas.', 'I e III, apenas.', 'I, II e III.'], c: 0,
        e: 'II: com todas as cidades ligadas entre si (grafo completo), existe ciclo hamiltoniano, e o melhor deles é a solução do caixeiro. I é falsa: ser euleriano fala de passar por todas as <b>arestas</b> uma vez, e não garante um ciclo que passe por todos os <b>vértices</b> sem repetir. III é falsa: o carteiro percorre todas as arestas, o caixeiro só as do ciclo; as trilhas só coincidiriam se o próprio ciclo hamiltoniano usasse todas as arestas.',
        w: { 2: 'A I mistura os conceitos: euleriano é sobre arestas, e o caixeiro precisa de um ciclo pelos vértices.', 3: 'A III é falsa: a trilha do carteiro usa todas as arestas; a do caixeiro, só as n arestas do ciclo.' } },
      { fonte: 'ENADE 2011 · Questão 36', enun:
        P('O problema P <i>versus</i> NP é um problema ainda não resolvido e um dos mais estudados em Computação. Em linhas gerais, deseja-se saber se todo problema cuja solução pode ser eficientemente verificada por um computador, também pode ser eficientemente obtida por um computador. Por “eficientemente” ou “eficiente” significa “em tempo polinomial”.',
          'A classe dos problemas cujas soluções podem ser eficientemente obtidas por um computador é chamada de classe P. Os algoritmos que solucionam os problemas dessa classe têm complexidade de pior caso polinomial no tamanho das suas entradas.',
          'Para alguns problemas computacionais, não se conhece solução eficiente, isto é, não se conhece algoritmo eficiente para resolvê-los. No entanto, se para uma dada solução de um problema é possível verificá-la eficientemente, então o problema é dito estar em NP. Dessa forma, a classe de problemas para os quais suas soluções podem ser eficientemente verificadas é chamada de classe NP. Um problema é dito ser NP-completo se pertence à classe NP e, além disso, se qualquer outro problema na classe NP pode ser eficientemente transformado nesse problema. Essa transformação eficiente envolve as entradas e saídas dos problemas.',
          'Considerando as noções de complexidade computacional apresentadas acima, analise as afirmações que se seguem.') +
        '<ol class="enun-afirm"><li>I. Existem problemas na classe P que não estão na classe NP.</li><li>II. Se o problema A pode ser eficientemente transformado no problema B e B está na classe P, então A está na classe P.</li><li>III. Se P = NP, então um problema NP-completo pode ser solucionado eficientemente.</li><li>IV. Se P é diferente de NP, então existem problemas na classe P que são NP-completos.</li></ol>' +
        P('É correto apenas o que se afirma em'),
        opts: ['I.', 'IV.', 'I e III.', 'II e III.', 'II e IV.'], c: 3,
        e: 'I é falsa: todo problema de P está em NP (se dá para resolver em tempo polinomial, dá para verificar). II é verdadeira: transforma A em B e resolve B, tudo em tempo polinomial. III é verdadeira: se P = NP, os NP-completos, que estão em NP, ficam em P. IV é falsa: se algum NP-completo estivesse em P, todo NP estaria em P, ou seja, P = NP.',
        w: { 4: 'A IV é falsa: um NP-completo em P derrubaria a hipótese P ≠ NP.', 2: 'A I é falsa: P está contido em NP.' } },
      { fonte: 'Inédita · condomínio', enun: P('O grafo representa as ruas de um condomínio: os vértices são cruzamentos, e G é a portaria. O vigia quer fazer uma ronda que passe por cada rua exatamente uma vez.') + fig(COND) +
        '<ol class="enun-afirm"><li>I. O vigia consegue sair da portaria G, passar por cada rua exatamente uma vez e voltar à portaria.</li><li>II. Existe uma ronda que passa por cada rua exatamente uma vez, começando no cruzamento A e terminando no cruzamento D.</li><li>III. Como o grafo tem vértices de grau ímpar, não existe ronda alguma que passe por cada rua exatamente uma vez.</li></ol>' + P('É correto o que se afirma em'),
        opts: ['I, apenas.', 'II, apenas.', 'I e III, apenas.', 'II e III, apenas.'], c: 1,
        e: 'Graus: A 3, D 3 e os outros 2. Com exatamente dois vértices ímpares, o grafo é semi-euleriano: há trajeto aberto de A até D (por exemplo, A → B → C → D → A → G → E → D), mas não fechado. I é falsa porque não é euleriano; III é falsa porque dois ímpares ainda permitem o trajeto aberto.' },
      { fonte: 'Inédita · Königsberg', enun: P('Na cidade de Königsberg, quatro regiões, A, B, C e D, são ligadas por sete pontes: duas entre A e B, duas entre A e C, uma entre A e D, uma entre B e D e uma entre C e D. Qual é o <b>menor</b> número de pontes que precisariam ser construídas para que fosse possível um passeio que começa e termina na mesma região e atravessa cada ponte exatamente uma vez?'),
        opts: ['1', '2', '3', '4'], c: 1,
        e: 'Graus: A 5, B 3, C 3, D 3: quatro ímpares. Cada ponte nova muda a paridade de duas regiões. Com 2 pontes (por exemplo, A–B e C–D), todos os graus ficam pares e o grafo, que é conexo, vira euleriano. Uma ponte só deixaria dois ímpares: daria passeio aberto, não fechado.' },
      { fonte: 'Inédita · Dirac', enun: P('Um grafo simples G tem 10 vértices. Sobre G, assinale a alternativa correta.'),
        opts: ['Se todo vértice tem grau 5, então G é hamiltoniano.', 'Se algum vértice tem grau 4, então G não é hamiltoniano.', 'Se G é hamiltoniano, então todo vértice tem grau pelo menos 5.', 'Se todo vértice tem grau par, então G é hamiltoniano.'], c: 0,
        e: 'Com n = 10, Dirac exige d(v) ≥ 5 para todos: é o caso da A. B e C invertem a implicação: Dirac é suficiente, não necessário (o ciclo C₁₀ é hamiltoniano com graus 2). D confunde com Euler: graus pares, com conexidade, garantem trajeto euleriano, não circuito hamiltoniano.',
        w: { 2: 'O ciclo C₁₀ é hamiltoniano e todos os graus são 2: a condição de Dirac não é necessária.', 3: 'Graus pares é a condição de Euler (arestas), não de Hamilton (vértices).' } },
      { fonte: 'Inédita · força bruta', enun: P('Um sistema de entregas precisa visitar 10 clientes e voltar ao depósito, de modo que entre quaisquer dois pontos há rota. Quantos circuitos hamiltonianos distintos existem no grafo completo com esses 11 pontos?'),
        opts: ['11!', '10!', '10!/2 = 1.814.400', '9!/2 = 181.440'], c: 2,
        e: 'São 11 vértices (10 clientes e o depósito). Em K₁₁, há (11 − 1)!/2 = 10!/2 = 1.814.400 circuitos distintos. 9!/2 seria a resposta se só os 10 clientes formassem o grafo, sem o depósito.',
        w: { 3: '9!/2 é o número de circuitos em K₁₀; aqui são 11 pontos, contando o depósito.', 1: '10! conta cada circuito duas vezes, uma em cada sentido.' } },
      { fonte: 'Inédita · P × NP', enun:
        P('Um aluno afirmou: “decidir se um grafo tem um circuito hamiltoniano é tão fácil quanto decidir se ele tem um trajeto euleriano fechado, pois nos dois casos basta examinar os graus dos vértices”.') +
        P('Sobre essa afirmação, é correto dizer que'),
        opts: ['ela está correta, pois os dois problemas estão em P.', 'ela está errada: o problema de Hamilton está em P, e o de Euler é NP-completo.', 'ela está errada, pois os dois problemas são NP-completos.', 'ela está errada: o problema de Euler está em P, pois basta verificar conexidade e paridade dos graus, enquanto o de Hamilton é NP-completo e não se conhece algoritmo polinomial para ele.'], c: 3,
        e: 'Euler: conexidade (BFS ou DFS) e contagem de graus, O(n + m). Hamilton: NP-completo; dado um circuito, verificar é fácil, mas encontrar um não tem algoritmo polinomial conhecido. Os teoremas de Ore e Dirac só dão condições suficientes, não um teste.' },
    ],
  });
})();
