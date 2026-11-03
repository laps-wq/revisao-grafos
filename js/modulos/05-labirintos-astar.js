/* Módulo 5 · Labirintos, heurística e A* */
(function () {
  const { P, dica, armadilha, nota, lista, codigo, tabela, h } = window.UI;
  const Gf = window.Grafos;
  const fig = (G, est = {}, op = {}) => { const d = document.createElement('div'); Gf.desenha(d, G, est, op); return `<div class="fig-estatica">${d.innerHTML}</div>`; };

  const LAB = ['S#...#T', '.......', '.#####.', '...#...', '##...#.'];
  const EXE = ['......', '#.....', '....#.', 'S#...#', '...#.T'];
  const grade = (linhas) => `<pre class="grade-txt">${linhas.join('\n')}</pre>`;
  const p8 = (rot, m) => `<figure class="p8"><table>${m.map((l) => `<tr>${l.map((x) => `<td${x ? '' : ' class="v"'}>${x || ''}</td>`).join('')}</tr>`).join('')}</table><figcaption>${rot}</figcaption></figure>`;

  const ROTAS = { nos: { A: [0, 0], B: [100, 1], C: [28, 13], D: [47, 13], E: [28, 25], F: [47, 25], G: [77, 24], H: [100, 24], I: [76, 33], J: [100, 33], K: [0, 47], L: [48, 47], M: [100, 47] },
    arestas: [['A', 'B', 40], ['A', 'C', 11.18], ['A', 'K', 20], ['C', 'D', 10], ['D', 'F', 5], ['F', 'B', 22.36], ['F', 'L', 10], ['E', 'F', 9], ['E', 'K', 14.14], ['K', 'L', 20], ['L', 'M', 20], ['B', 'H', 10], ['G', 'H', 10], ['G', 'I', 5], ['I', 'J', 10], ['J', 'M', 5]] };

  window.MODULOS.push({
    id: 'labirintos-astar',
    curto: 'Labirintos e A*',
    titulo: 'Labirintos, heurística e A*',
    grupo: 'Caminhos e árvores',
    enade: 'ENADE 2005 (questão 58) e ENADE 2008 (questões 31 e 51), nos desafios',
    resumo: 'O labirinto como grafo, DFS e BFS como as estratégias clássicas, a busca gulosa e o A*: f = g + h, ABERTA e FECHADA, heurística admissível e consistente.',
    topicos: [
      { t: 'Um labirinto é um grafo', h:
        P('Cada <b>célula livre</b> vira um vértice, e células livres vizinhas (cima, baixo, esquerda, direita) viram uma aresta. Paredes não entram no grafo. O labirinto abaixo tem 24 vértices e 26 arestas.') +
        grade(LAB) +
        P('No computador, ele é uma matriz de caracteres: <code>#</code> é parede, <code>.</code> é livre, <code>S</code> é a entrada s e <code>T</code> é a saída t. O vértice é (linha, coluna), contando de 0: aqui s = (0, 0) e t = (0, 6).',
          'O grafo é <b>implícito</b>: não se monta lista de adjacência; os vizinhos de uma célula são calculados na hora. Num labirinto de 1000 × 1000, isso evita montar uma lista com um milhão de vértices antes de começar.') +
        codigo(['def vizinhos(grade, l, c):', '    L, C = len(grade), len(grade[0])', '    # ordem crescente de (linha, coluna): cima, esquerda, direita, baixo', '    for dl, dc in [(-1, 0), (0, -1), (0, 1), (1, 0)]:', '        nl, nc = l + dl, c + dc', "        if 0 <= nl < L and 0 <= nc < C and grade[nl][nc] != '#':", '            yield (nl, nc)'], 'Vizinhos de uma célula') },
      { t: 'As estratégias clássicas já eram DFS e BFS', h:
        lista(['<b>Mão na parede:</b> ande sempre com a mão direita encostada na parede. Funciona quando entrada e saída estão na borda e as paredes são ligadas entre si; com a saída no meio, ou com uma “ilha” de paredes, você pode girar em círculos.',
          '<b>Trémaux (século XIX):</b> marque cada corredor ao passar. Num beco, ou ao reencontrar um corredor marcado, volte e tente outro. É a <b>DFS</b>.',
          '<b>Moore (1959) e Lee (1961):</b> numere as células pela distância até a entrada: 1, 2, 3… A saída recebe o menor número possível. Lee usou a ideia para rotear trilhas em placas de circuito. É a <b>BFS</b>.']) +
        P('No labirinto do exemplo, a DFS chega em t na 12ª visita, com um caminho de 10 passos: acha <b>uma</b> saída, não a melhor. A BFS garante o menor caminho, de 8 passos, mas expande 18 das 24 células, inclusive o canto de baixo, longe da saída, porque não sabe para que lado fica t.') },
      { t: 'Heurística: um palpite sobre o que falta', h:
        P('h(v) é uma estimativa do custo que falta de v até t. Com 4 vizinhos e passo de custo 1, a escolha natural é a <b>distância de Manhattan</b>:') +
        `<div class="formula"><span>h(l, c) = |l − l<sub>t</sub>| + |c − c<sub>t</sub>|</span><small>os passos que faltariam se não houvesse paredes</small></div>` +
        P('Ela é rápida e nunca exagera, porque uma parede só pode aumentar o caminho. No labirinto do exemplo, em (0, 4) temos h = 2, mas o caminho real até t tem 4 passos: a parede em (0, 5) obriga a contornar.') },
      { t: 'Busca gulosa: sempre o mais promissor', h:
        P('Usa a mesma fila de prioridade do Dijkstra, mas ordenada só por h(v): sai primeiro quem <b>parece</b> mais perto de t.') +
        tabela(['', 'Dijkstra', 'Busca gulosa'], [['Prioridade', 'g(v): custo real de s até v', 'h(v): palpite de v até t'], ['Olha para', 'trás: quanto já gastou', 'frente: quanto parece faltar']]) +
        P('No labirinto do exemplo, saindo de (1, 2), as células (0, 2) e (1, 3) empatam com h = 4; pelo desempate, a gulosa entra no bolsão (0, 2) → (0, 3) → (0, 4), que é um beco, desce para (1, 4) e anota p(1, 4) = (0, 4). Resultado: 11 células expandidas, mas caminho de 10 passos. Ela <b>nunca corrige um p já anotado</b>.') },
      { t: 'A*: f(v) = g(v) + h(v)', h:
        P('O Dijkstra olha só para trás; a gulosa, só para frente. O A* (Hart, Nilsson e Raphael, 1968, no projeto do robô Shakey) soma os dois:') +
        lista(['<b>g(v)</b>: custo real do melhor caminho conhecido de s até v (é o d(v) do Dijkstra);', '<b>h(v)</b>: estimativa de v até t;', '<b>f(v) = g(v) + h(v)</b>: estimativa do caminho inteiro de s até t passando por v.']) +
        P('O A* sempre expande o vértice da <b>ABERTA</b> com o menor f.') +
        codigo(['A*(s, t):', '    g(s) = 0;  f(s) = h(s)', '    ABERTA = {s};  FECHADA = ∅', '    enquanto ABERTA não estiver vazia:', '        vi = remove de ABERTA o vértice de menor f', '        se vi = t: retorne o caminho seguindo p a partir de t', '        insere vi em FECHADA', '        para cada vj adjacente a vi:', '            se vj ∈ FECHADA: continue', '            custo = g(vi) + w(vi, vj)', '            se custo < g(vj):              // relaxamento, como no Dijkstra', '                g(vj) = custo;  f(vj) = g(vj) + h(vj);  p(vj) = vi', '                se vj ∉ ABERTA: insere vj em ABERTA', '    retorne "não há caminho"'], 'A*') +
        nota(lista(['<b>Para quando t sai da ABERTA, não quando entra.</b> Quando t entra, ainda pode existir caminho mais barato.', '<b>Relaxa como o Dijkstra:</b> achou caminho mais barato até vj, atualiza g, f e p, mesmo com vj já na ABERTA. É o que a gulosa não faz.', '<b>O caminho vem de p(v):</b> siga p a partir de t até s e inverta.']), 'Três detalhes que derrubam questão') },
      { t: 'ABERTA e FECHADA', h:
        tabela(['Estado', 'Equivale a', 'Significado'], [['Não visitado', 'NAO_VISITADO', 'nunca visto; g(v) = ∞'], ['ABERTA', '≈ VISITADO', 'descoberto, esperando a vez; sai o de menor f'], ['FECHADA', '≈ ENCERRADO', 'já expandido: os vizinhos já foram olhados']]) +
        P('São os mesmos três estados da BFS e da DFS. Muda só <b>quem sai da ABERTA</b>: o de menor f, não o mais antigo nem o mais novo.',
          'No A* passo a passo da aba Exemplos, (1, 4) entra na ABERTA vindo do beco, com g = 7. Uma iteração depois, vindo de (1, 3), aparece g = 5 &lt; 7: o A* atualiza g, f = 8 e p = (1, 3). É esse relaxamento que leva ao caminho de 8 passos com 12 células expandidas.') },
      { t: 'Admissível e consistente', h:
        lista(['<b>Admissível</b> (garante o ótimo): h(v) ≤ h*(v) para todo v, em que h*(v) é o custo real do melhor caminho de v até t. A heurística nunca superestima.',
          '<b>Consistente</b> (garante eficiência): h(u) ≤ w(u, v) + h(v) para toda aresta (u, v), e h(t) = 0. É a desigualdade triangular: f nunca diminui ao longo de um caminho, e um vértice que sai da ABERTA já tem g definitivo.']) +
        P('Toda heurística consistente é admissível. Manhattan, com 4 vizinhos e custo 1, é consistente: cada passo muda h em exatamente 1.') +
        armadilha('Se h exagera, um bom caminho parece caro e fica esquecido na ABERTA: o A* pode devolver um caminho que não é o menor.') },
      { t: 'Qual heurística usar', h:
        tabela(['Movimento', 'Heurística', 'Fórmula'], [['4 direções, custo 1', 'Manhattan', 'Δl + Δc'], ['8 direções, diagonal custa 1', 'Chebyshev', 'max(Δl, Δc)'], ['8 direções, diagonal custa √2', 'Octil', 'max(Δl, Δc) + (√2 − 1) · min(Δl, Δc)'], ['qualquer direção', 'Euclidiana', '√(Δl² + Δc²)']]) +
        P('<b>Regra prática:</b> use a maior heurística que ainda seja admissível. Com 4 direções, a Euclidiana também é admissível, mas é menor que a Manhattan e faz o A* expandir mais.') +
        tabela(['Heurística', 'Algoritmo', 'Comportamento'], [['h = 0', 'Dijkstra', 'ótimo, sem foco (com custo 1, é a BFS)'], ['h admissível', 'A*', 'ótimo e focado'], ['h = custo real', 'A* perfeito', 'vai direto pelo melhor caminho'], ['w · h, com w &gt; 1', 'A* ponderado', 'mais rápido, sem garantia de ótimo'], ['só h, sem g', 'Gulosa', 'rápida e míope']]) +
        P('Pior caso (h inútil): o mesmo custo do Dijkstra, O((V + E) log V) com heap. Na prática, o limite costuma ser a memória: ABERTA e FECHADA crescem com a área explorada.') },
      { t: 'Portas e chaves: o vértice vira um estado', h:
        P('Se o labirinto tem portas e chaves, a posição sozinha não basta: a mesma célula é outro estado com a chave na mão. O vértice passa a ser <b>(linha, coluna, chaves que tenho)</b>. Com k chaves, são até L · C · 2<sup>k</sup> estados.',
          'BFS, Dijkstra e A* não mudam: muda o que é vértice e quem é vizinho. É a mesma ideia do 8-puzzle: cada configuração do tabuleiro é um vértice.') },
      { t: 'Resumo: cinco buscas no mesmo esqueleto', h:
        tabela(['Busca', 'Sai primeiro', 'Menor caminho?', 'Boa para'], [
          ['DFS', 'o último que entrou', 'não garante', 'explorar tudo, ciclos, componentes'],
          ['BFS', 'o primeiro que entrou', 'sim, sem pesos', 'labirintos e grafos sem pesos'],
          ['Dijkstra', 'menor g(v)', 'sim, pesos ≥ 0', 'pesos, sem pista do destino'],
          ['Gulosa', 'menor h(v)', 'não garante', 'resposta rápida, “boa o bastante”'],
          ['A*', 'menor g(v) + h(v)', 'sim, com h admissível', 'destino conhecido e boa heurística'],
        ]) + dica('Em questão de IA do ENADE, “busca cega” é BFS, DFS e custo uniforme (Dijkstra); “busca informada” ou “heurística” é a gulosa e o A*.') },
    ],
    exemplos: [
      { t: 'Os quatro algoritmos no mesmo labirinto', d: P('Escolha o algoritmo e avance passo a passo. O placar embaixo resume os quatro.'),
        mount(el) { Gf.labLabirinto(el, LAB); },
        depois: P('Só BFS e A* garantem o menor caminho, e o A* expandiu 6 células a menos que a BFS. Num labirinto maior, a diferença cresce.') },
      { t: 'Exercício: o A* na mão', d: P('Labirinto de 5 linhas e 6 colunas, s = (3, 0) e t = (4, 5). Mesmas convenções do exemplo: 4 vizinhos, custo 1, h = Manhattan, empate em f pelo menor h e depois pelo menor (linha, coluna). Resolva no papel antes de abrir a simulação: qual caminho o A* devolve, quantas células expande e quantas a BFS expandiria?') + grade(EXE),
        mount(el) {
          const area = h('div');
          const resp = h('div', { class: 'prosa depois', hidden: true, html: P('<b>Resposta:</b> o A* desce logo no início, porque (4, 0) tem f = 1 + 5 = 6 e (2, 0) tem f = 1 + 7 = 8. O caminho é s → (4, 0) → (4, 1) → (4, 2) → (3, 2) → (3, 3) → (3, 4) → (4, 4) → t, com custo 8 e <b>9 células expandidas</b>. A BFS só tira t da fila depois de expandir <b>as 25 células livres</b>: t é a última.') });
          const b = h('button', { class: 'btn', type: 'button', onclick: () => { b.remove(); Gf.labLabirinto(area, EXE); resp.hidden = false; } }, 'Já resolvi: mostrar a simulação e a resposta');
          el.append(b, area, resp);
        } },
    ],
    atividades: [
      { t: 'Quem sai primeiro?', tipo: 'classificar', d: P('Todas usam o mesmo esqueleto; muda o critério de quem sai.'),
        cfg: { cats: ['DFS', 'BFS', 'Dijkstra', 'Gulosa', 'A*'], itens: [
          { t: 'Sai o último que entrou (pilha ou recursão).', c: 0, e: 'Trémaux: vai até o fim do corredor e volta.' },
          { t: 'Sai o primeiro que entrou (fila).', c: 1, e: 'Frente de onda de Moore e Lee.' },
          { t: 'Sai o de menor custo real desde s.', c: 2, e: 'Prioridade g(v), sem pista do destino.' },
          { t: 'Sai o que parece mais perto de t, sem olhar quanto já andou.', c: 3, e: 'Prioridade h(v): rápida e míope.' },
          { t: 'Sai o de menor g(v) + h(v).', c: 4, e: 'É o A*: custo feito mais palpite do que falta.' },
        ] } },
      { t: 'Admissível ou não?', tipo: 'classificar', d: P('Grade com 4 direções e passo de custo 1. A heurística nunca superestima o custo real até t?'),
        cfg: { cats: ['Admissível', 'Não admissível'], itens: [
          { t: 'Distância de Manhattan.', c: 0, e: 'Sem paredes, o caminho real é exatamente Δl + Δc; paredes só aumentam.' },
          { t: 'Distância euclidiana.', c: 0, e: '√(Δl² + Δc²) ≤ Δl + Δc: é admissível, mas menos informada que a Manhattan.' },
          { t: 'h = 0 para todo vértice.', c: 0, e: 'Nunca exagera. O A* vira o Dijkstra (aqui, a BFS).' },
          { t: 'O dobro da distância de Manhattan.', c: 1, e: 'Num corredor livre até t, o custo real é a Manhattan; o dobro exagera.' },
          { t: 'Chebyshev, max(Δl, Δc).', c: 0, e: 'É menor ou igual à Manhattan; admissível, porém menos informada.' },
          { t: 'Número de paredes do mapa inteiro.', c: 1, e: 'Em t, deveria valer 0; um valor fixo positivo já superestima ali.' },
        ] } },
      { t: 'Contas rápidas no labirinto do exemplo', tipo: 'qa', d: P('t = (0, 6). Use a figura da aba Conteúdo.'), itens: [
        { q: 'Quanto vale h(1, 0)? E h(4, 6)?', a: P('h(1, 0) = |1 − 0| + |0 − 6| = 7. h(4, 6) = 4 + 0 = 4.') },
        { q: 'Na iteração 2 do A*, (2, 0) entra com g = 2. Qual é f(2, 0)? Por que ele nunca sai da ABERTA?', a: P('h(2, 0) = 2 + 6 = 8, então f = 2 + 8 = 10. O caminho até t custa 8, e o A* termina quando t sai com f = 8, antes de chegar a vez de qualquer vértice com f = 10.') },
        { q: 'Em (0, 4), h = 2. Qual é o custo real até t? Isso torna a heurística inadmissível?', a: P('O custo real é 4: (0, 4) → (1, 4) → (1, 5) → (1, 6) → t. Não: admissível exige h ≤ custo real, e 2 ≤ 4. Subestimar é permitido; exagerar, não.') },
        { q: 'Por que a gulosa ficou com o caminho de 10 passos e o A* não?', a: P('As duas entram no beco e chegam em (1, 4) vindas de (0, 4), com g = 7. No A*, (1, 3) ainda sai da ABERTA com f = 8 e oferece g = 5: ele relaxa e troca p(1, 4) para (1, 3). A gulosa ordena só por h: (1, 4) tem h = 3, menor que o h = 4 de (1, 3), sai antes, e ela nunca corrige um p já anotado.') },
      ] },
    ],
    desafios: [
      { fonte: 'ENADE 2005 · Questão 58', enun:
        fig(ROTAS, {}, { rotulo: 'Grafo de rotas entre as cidades A e M', r: 3.8 }) +
        P('<small>Figura redesenhada a partir da prova.</small>',
          'Uma forma de analisar e comparar o desempenho de algoritmos de busca heurística é utilizar um problema bem conhecido como referência. Um exemplo desse tipo de problema é o cálculo de rotas entre diferentes cidades. No grafo ilustrado acima, cada nó representa uma cidade distinta, e cada ramo, uma rodovia que interliga as cidades representadas pelos nós que ele une, cujo peso indica a distância, em km, entre essas cidades pela rodovia. Suponha que se deseje encontrar a melhor rota entre as cidades A e M, indicadas nesse grafo. Considere, ainda, os valores indicados na tabela abaixo como distância em linha reta, em km, de cada cidade para a cidade M.') +
        tabela(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'], [['44,72', '20,00', '33,54', '25,00', '30,67', '22,36', '14,14', '10,00', '11,18', '5,00', '40,00', '20,00']]) +
        P('A partir dessas informações, julgue os itens seguintes, relativos a algoritmos de busca.') +
        '<ol class="enun-afirm"><li>I. Utilizando-se o algoritmo A*, a rota entre A e M encontrada no problema acima é ACDFLM e o custo do caminho é 56,18.</li><li>II. Utilizando-se a busca gulosa, a rota encontrada no problema acima é ACDFLM.</li><li>III. Para utilizar algoritmos de busca heurística, deve-se definir uma heurística que superestime o custo da solução.</li><li>IV. O A* é um algoritmo ótimo e completo quando heurísticas admissíveis são utilizadas.</li><li>V. No <i>simulated annealing</i>, é possível haver movimentos para um estado com avaliação pior do que a do estado corrente, dependendo da temperatura do processo e da probabilidade de escolha.</li></ol>' +
        P('Estão certos apenas os itens'),
        opts: ['I, II e III.', 'I, IV e V.', 'I, III, e V.', 'II, III, e IV.', 'II, IV e V.'], c: 1,
        e: 'I: o A* expande A (f = 0 + 44,72), C (11,18 + 33,54 = 44,72), D (21,18 + 25 = 46,18), F (26,18 + 22,36 = 48,54) e L (36,18 + 20 = 56,18) e chega em M com 11,18 + 10 + 5 + 10 + 20 = 56,18. II: a gulosa olha só a distância em linha reta: de A vai para B (20), depois H (10), G, I, J e M, a rota ABHGIJM, de 80 km. III: é o contrário, a heurística não pode superestimar (admissível). IV: certo. V: certo; no <i>simulated annealing</i>, a chance de aceitar um estado pior diminui com a temperatura.',
        w: { 0: 'A gulosa vai primeiro para B, que parece mais perto de M (20 km em linha reta), e termina pela rota ABHGIJM.', 2: 'A heurística do A* não pode superestimar o custo real: é a definição de heurística admissível.' } },
      { fonte: 'ENADE 2008 · Questão 31', enun:
        P('Julgue os itens a seguir, relativos a métodos de busca com informação (busca heurística) e sem informação (busca cega), aplicados a problemas em que todas as ações têm o mesmo custo, o grafo de busca tem fator de ramificação finito e as ações não retornam a estados já visitados.') +
        '<ol class="enun-afirm"><li>I. A primeira solução encontrada pela estratégia de busca em largura é a solução ótima.</li><li>II. A primeira solução encontrada pela estratégia de busca em profundidade é a solução ótima.</li><li>III. As estratégias de busca com informação usam funções heurísticas que, quando bem definidas, permitem melhorar a eficiência da busca.</li><li>IV. A estratégia de busca gulosa é eficiente porque expande apenas os nós que estão no caminho da solução.</li></ol>' + P('Estão certos apenas os itens'),
        opts: ['I e II.', 'I e III.', 'I e IV.', 'II e IV.', 'III e IV.'], c: 1,
        e: 'I: com custos iguais, a BFS acha primeiro a solução mais rasa, que é a ótima. II: a DFS acha uma solução, não necessariamente a melhor (no labirinto do exemplo, 10 passos contra 8). III: é a definição de busca informada. IV: a gulosa também expande nós fora do caminho final; no labirinto do exemplo, ela entra no bolsão sem saída.',
        w: { 4: 'O item IV é falso: a gulosa expande nós que não ficam no caminho, como o beco do labirinto do exemplo.', 0: 'A DFS não garante a solução ótima: acha uma saída, não a melhor.' } },
      { fonte: 'ENADE 2008 · Questão 51', enun:
        P('Considere um jogo do tipo 8-puzzle, cujo objetivo é conduzir o tabuleiro esquematizado na figura abaixo para o seguinte estado final.') +
        `<div class="p8-linha">${p8('Estado final', [[1, 2, 3], [8, 0, 4], [7, 6, 5]])}</div>` +
        P('Considere, ainda, que, em determinado instante do jogo, se tenha o estado E0 a seguir.') +
        `<div class="p8-linha">${p8('E0', [[3, 4, 6], [5, 8, 0], [2, 1, 7]])}</div>` +
        P('Pelas regras desse jogo, sabe-se que os próximos estados possíveis são os estados E1, E2 e E3 mostrados abaixo.') +
        `<div class="p8-linha">${p8('E1', [[3, 4, 6], [5, 0, 8], [2, 1, 7]])}${p8('E2', [[3, 4, 6], [5, 8, 7], [2, 1, 0]])}${p8('E3', [[3, 4, 0], [5, 8, 6], [2, 1, 7]])}</div>` +
        P('Considere uma função heurística h embasada na soma das distâncias das peças em relação ao estado final desejado, em que a distância d a que uma peça p está da posição final é dada pela soma do número de linhas com o número de colunas que a separam da posição final desejada. Por exemplo, em E1, d(1) = 2 + 1 = 3. A partir dessas informações analise as asserções a seguir.',
          'Utilizando-se um algoritmo de busca gulosa pela melhor escolha que utiliza a função h, o próximo estado no desenvolvimento do jogo a partir do estado E0 tem de ser E3',
          '<b>porque</b>',
          'dos três estados E1, E2 e E3 possíveis, o estado com menor soma das distâncias entre a posição atual das peças e a posição final é o estado E3.',
          'Assinale a opção correta a respeito dessas asserções.'),
        opts: ['As duas asserções são proposições verdadeiras, e a segunda é uma justificativa correta da primeira.', 'As duas asserções são proposições verdadeiras, e a segunda não é uma justificativa correta da primeira.', 'A primeira asserção é uma proposição verdadeira, e a segunda é uma proposição falsa.', 'A primeira asserção é uma proposição falsa, e a segunda é uma proposição verdadeira.', 'As duas asserções são proposições falsas.'], c: 0,
        e: 'h é a distância de Manhattan de cada peça, somada. h(E1) = 2 + 2 + 3 + 3 + 2 + 3 + 3 + 2 = 20; h(E2) = 20; h(E3) = 2 + 2 + 3 + 1 + 2 + 3 + 3 + 2 = 18. A gulosa escolhe o menor h, logo E3, e é exatamente por E3 ter a menor soma: a segunda justifica a primeira.' },
      { fonte: 'Inédita · f = g + h', enun: P('Uma grade tem 4 vizinhos por célula, passos de custo 1 e destino t = (4, 5). O A* usa a distância de Manhattan. A célula v = (2, 3) foi alcançada por um caminho de 5 passos a partir de s. Qual é o valor de f(v)?'),
        opts: ['4', '5', '9', '13'], c: 2,
        e: 'g(v) = 5. h(v) = |2 − 4| + |3 − 5| = 2 + 2 = 4. f(v) = g(v) + h(v) = 9.', w: { 0: '4 é só o h(v): falta somar o custo já feito.', 1: '5 é só o g(v): falta somar a estimativa do que resta.' } },
      { fonte: 'Inédita · heurística e movimento', enun: P('Um jogo usa um mapa em grade em que o personagem anda nas 8 direções, e cada passo, inclusive o diagonal, custa 1. O desenvolvedor reaproveitou um A* que usa a distância de Manhattan. Sobre essa escolha, é correto afirmar que'),
        opts: ['a heurística continua admissível, pois paredes só aumentam o caminho.', 'a heurística deixa de ser admissível, pois superestima trajetos com passos diagonais; a de Chebyshev, max(Δl, Δc), seria admissível.', 'a heurística passa a ser consistente, porque um passo diagonal muda h em 2.', 'o A* deixa de terminar, pois a Manhattan não é definida para 8 direções.'], c: 1,
        e: 'De (0, 0) a (1, 1), a Manhattan dá 2, mas um único passo diagonal resolve: custo real 1. Ela superestima, então o A* perde a garantia de ótimo. Com diagonal de custo 1, a heurística certa é a de Chebyshev (tabela do conteúdo).' },
      { fonte: 'Inédita · portas e chaves', enun: P('Um labirinto de 10 × 10 células tem 3 chaves espalhadas. Para resolvê-lo com BFS ou A*, cada vértice passa a ser o estado (linha, coluna, chaves que tenho). Quantos estados existem, no máximo?'),
        opts: ['100', '103', '300', '800'], c: 3,
        e: 'Cada chave pode estar ou não com o jogador: 2³ = 8 combinações. São até L · C · 2^k = 10 · 10 · 8 = 800 estados.' },
      { fonte: 'Inédita · o botão da heurística', enun: P('Sobre o A*, avalie as afirmações.') +
        '<ol class="enun-afirm"><li>I. Com h(v) = 0 para todo v, o A* expande os vértices na mesma ordem do Dijkstra.</li><li>II. O A* pode parar assim que t entra na ABERTA, desde que a heurística seja admissível.</li><li>III. Multiplicar uma heurística admissível por 3 costuma reduzir o número de vértices expandidos, mas o A* perde a garantia de devolver o menor caminho.</li></ol>' + P('É correto o que se afirma em'),
        opts: ['I, apenas.', 'II, apenas.', 'I e III, apenas.', 'II e III, apenas.'], c: 2,
        e: 'I: com h = 0, f = g, que é a prioridade do Dijkstra. II: o A* para quando t <b>sai</b> da ABERTA; quando t entra, ainda pode haver caminho mais barato. III: é o A* ponderado do conteúdo: mais foco, sem garantia de ótimo.' },
    ],
  });
})();
