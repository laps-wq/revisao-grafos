/* Módulo 3 · Caminhos mínimos: Dijkstra, Bellman-Ford e Floyd-Warshall */
(function () {
  const { P, dica, armadilha, nota, lista, formula, codigo, tabela } = window.UI;
  const Gf = window.Grafos;
  const fig = (G, est = {}, op = {}) => { const d = document.createElement('div'); Gf.desenha(d, G, est, op); return `<div class="fig-estatica">${d.innerHTML}</div>`; };

  const GRAFO_DIJ = { nos: { A: [5, 30], B: [40, 4], C: [40, 56], D: [62, 30], E: [94, 30] },
    arestas: [['A', 'B', 2], ['A', 'C', 4], ['A', 'D', 6], ['B', 'D', 3], ['B', 'E', 7], ['C', 'E', 9], ['D', 'E', 1]] };
  const TREINO = { nos: { A: [4, 30], B: [36, 4], C: [36, 56], D: [70, 4], E: [70, 56], F: [98, 30] },
    arestas: [['A', 'B', 7], ['A', 'C', 3], ['B', 'C', 2], ['B', 'D', 4], ['C', 'D', 8], ['C', 'E', 7], ['D', 'E', 2], ['D', 'F', 5], ['E', 'F', 9]] };
  const QUEBRA = { dirigido: true, nos: { A: [5, 26], B: [55, 4], C: [55, 50] }, arestas: [['A', 'B', 2], ['A', 'C', 5], ['C', 'B', -10]] };
  const BF = { dirigido: true, nos: { S: [0, 30], A: [32, 6], B: [64, 30], C: [92, 6], D: [64, 58], E: [32, 58] },
    arestas: [['S', 'A', 10], ['S', 'E', 8], ['A', 'C', 2], ['B', 'A', 1], ['C', 'B', -2], ['D', 'A', -4], ['D', 'C', -1], ['E', 'D', 1]] };
  const CICLO = { dirigido: true, nos: { 1: [0, 30], 2: [30, 4], 3: [30, 56], 4: [64, 56], 5: [64, 4], 6: [96, 30] },
    arestas: [['1', '2', 1], ['1', '3', 3], ['2', '3', 1], ['2', '4', 3], ['2', '5', 2], ['3', '4', 2], ['4', '5', -1], ['5', '4', -3], ['4', '6', 2], ['6', '5', 3]] };
  const Q12 = { nos: { A: [0, 20], B: [32, 0], C: [32, 40], D: [63, 20], E: [94, 0] },
    arestas: [['A', 'B', 6], ['A', 'C', 2], ['C', 'B', 3], ['C', 'D', 7], ['B', 'D', 2], ['B', 'E', 6], ['D', 'E', 1]] };

  const E2021 = { dirigido: true, nos: { A: [26, 2], B: [58, 16], C: [102, 0], D: [0, 27], E: [102, 27], F: [56, 52], G: [100, 52] },
    arestas: [['D', 'A', 5], ['A', 'B', 2], ['D', 'B', 9], ['D', 'E', 5], ['D', 'F', 1], ['B', 'C', 8], ['E', 'B', 1], ['E', 'C', 5], ['F', 'E', 3], ['F', 'G', 1], ['G', 'E', 1]] };
  const E2017 = { nos: { n1: [19, 13], n2: [71, 13], i: [6, 33], n3: [32, 33], n4: [50, 24], w: [51, 43], j: [73, 35], k: [96, 31], n5: [16, 53], n6: [63, 55] },
    rot: { n1: '', n2: '', n3: '', n4: '', n5: '', n6: '' },
    arestas: [['i', 'n1', 4], ['n1', 'n2', 2], ['n2', 'j', 1], ['i', 'n3', 2], ['n3', 'n4', 1], ['n4', 'j', 2], ['n3', 'w', 2], ['w', 'j', 1], ['j', 'k', 2], ['i', 'n5', 1], ['n5', 'n6', 15], ['n6', 'j', 1]] };
  const ROT2017 = { nos: { 1: [0, 19], 2: [17, 0], 3: [32, 31], 4: [49, 0], 5: [66, 31], 6: [82, 0], 7: [97, 31] },
    arestas: [['1', '2', 4], ['1', '3', 'A'], ['2', '3', 'B'], ['2', '4', 'C'], ['3', '4', 3], ['4', '5', 1], ['3', '5', 'D'], ['4', '6', 5], ['5', '6', 'E'], ['6', '7', 'F'], ['5', '7', 4]] };

  window.MODULOS.push({
    id: 'caminhos-minimos',
    curto: 'Caminhos mínimos',
    titulo: 'Caminhos mínimos: Dijkstra, Bellman-Ford e Floyd-Warshall',
    grupo: 'Caminhos e árvores',
    enade: 'ENADE 2017 (questão 24), ENADE 2021 (questão 34) e ENADE 2017 de Engenharia de Computação (questão 35), nos desafios',
    resumo: 'Relaxamento, a tabela do Dijkstra passo a passo, por que ele exige pesos não negativos, o Bellman-Ford e como escolher o algoritmo.',
    topicos: [
      { t: 'O problema do caminho mínimo', h:
        P('Num grafo ponderado, cada aresta tem um peso (custo, distância, tempo). Queremos o caminho cujo <b>custo total</b> é o menor possível. Há três versões do problema:') +
        tabela(['Versão', 'Pergunta', 'Algoritmos'], [
          ['Origem única', 'menor caminho de um vértice para todos os outros', 'Dijkstra, Bellman-Ford'],
          ['Par único', 'menor caminho entre dois vértices específicos', 'os mesmos, parando ao chegar no destino; A*'],
          ['Todos os pares', 'menores caminhos entre todos os pares', 'Floyd-Warshall'],
        ]) +
        P('Aparece em roteamento de pacotes, GPS, logística e análise de redes. E já caiu no ENADE: veja as questões de 2017 e de 2021 na aba Desafios.') },
      { t: 'Relaxamento: a operação central', h:
        formula('se d(v) > d(u) + w(u, v), então d(v) ← d(u) + w(u, v) e p(v) ← u', 'relaxar a aresta (u, v)') +
        P('d(v) é a <b>estimativa</b> do menor custo de s até v; começa em ∞ e só diminui. p(v) é o <b>predecessor</b>: quem vem antes de v no melhor caminho conhecido. Relaxar é perguntar: “chegar em v passando por u fica mais barato do que o que eu já tinha?”',
          'Exemplo: se dist(A, B) = 3 e dist(B, C) = 2, então dist(A, C) ≤ 5. Se a estimativa de C for maior que 5, ela melhora via B.') +
        nota('A subestrutura ótima sustenta tudo: se o menor caminho de s até t passa por w, o trecho de w até t também é mínimo. Se houvesse um trecho melhor, trocá-lo daria um caminho de s até t ainda menor, um absurdo.') },
      { t: 'Dijkstra: a ideia e a tabela', h:
        P('Edsger Dijkstra (1959). A cada iteração, o algoritmo <b>fecha</b> o vértice aberto de <b>menor estimativa</b> e relaxa as arestas para os seus vizinhos abertos. Um vértice fechado nunca mais muda.') +
        codigo(['DIJKSTRA(G, w, s)', '    para cada vértice v: d(v) ← ∞; anterior(v) ← nulo', '    d(s) ← 0', '    enquanto houver vértice aberto:', '        u ← vértice aberto com menor d(u)       // escolha gulosa',
          '        feche u', '        para cada aresta (u, v) com v aberto:', '            se d(v) > d(u) + w(u, v):', '                d(v) ← d(u) + w(u, v)', '                anterior(v) ← u', '    retorna d, anterior'], 'Dijkstra') +
        P('À mão, a forma mais segura de resolver é uma tabela: uma coluna por passo, cada célula com <b>(distância, predecessor)</b>, em negrito o vértice fechado no passo e <b>*</b> para quem já estava fechado. No grafo abaixo, a partir de A:') +
        fig(GRAFO_DIJ) +
        tabela(['Vértice', 'Passo 1', 'Passo 2', 'Passo 3', 'Passo 4', 'Passo 5'], [
          ['A', '<b>(0, A)</b>', '*', '*', '*', '*'], ['B', '(2, A)', '<b>(2, A)</b>', '*', '*', '*'], ['C', '(4, A)', '(4, A)', '<b>(4, A)</b>', '*', '*'],
          ['D', '(6, A)', '(5, B)', '(5, B)', '<b>(5, B)</b>', '*'], ['E', '∞', '(9, B)', '(9, B)', '(6, D)', '<b>(6, D)</b>']]) +
        P('Menor caminho de A até E: seguindo os predecessores de trás para a frente, E ← D ← B ← A, ou seja, <b>A → B → D → E</b>, custo 6. A aresta direta A–D custa 6, mas A → B → D custa 5: o caminho mínimo raramente é a aresta direta.') },
      { t: 'Dijkstra é guloso, e por isso exige pesos não negativos', h:
        P('A escolha gulosa do Dijkstra é fechar o vértice de menor estimativa e nunca reconsiderar. Isso só é seguro se nenhum caminho futuro puder ficar mais barato, e isso só vale com <b>pesos ≥ 0</b>.') +
        fig(QUEBRA, {}, { rotulo: 'A para B custa 2, A para C custa 5, C para B custa menos 10' }) +
        P('Exemplo: A → B = 2, A → C = 5, C → B = −10. O Dijkstra fecha B com custo 2. Depois fecha C, mas B já está fechado. Ele devolve d(B) = 2; o correto é A → C → B = 5 − 10 = <b>−5</b>.') +
        armadilha('O Dijkstra não trava, não entra em laço infinito e não acusa erro: ele termina normalmente e devolve a resposta errada. Alternativa que diz “entra em laço infinito” é falsa.') },
      { t: 'Bellman-Ford e os ciclos negativos', h:
        P('Bellman-Ford (Shimbel 1955, Ford 1956, Bellman 1958, Moore 1959) aceita pesos negativos. Em vez de fechar vértices, ele <b>relaxa todas as arestas</b>, repetindo |V| − 1 vezes, e faz uma rodada extra para detectar ciclo negativo.') +
        codigo(['BELLMAN-FORD(G, w, s)', '    para cada vértice v: d(v) ← ∞; anterior(v) ← nulo', '    d(s) ← 0', '    repita (|V| − 1) vezes:', '        para cada aresta (u, v):',
          '            se d(v) > d(u) + w(u, v): d(v) ← d(u) + w(u, v); anterior(v) ← u', '    para cada aresta (u, v):                  // rodada extra',
          '        se d(v) > d(u) + w(u, v): retorna "ciclo negativo"'], 'Bellman-Ford') +
        lista(['<b>Por que |V| − 1 rodadas bastam?</b> Um caminho simples tem no máximo |V| − 1 arestas, e cada rodada garante pelo menos mais uma aresta do caminho correta.',
          '<b>Ciclo negativo</b>: a soma dos pesos de um ciclo é menor que zero (A → B = 2, B → C = −5, C → A = 1 soma −2). Cada volta reduz o custo, então não existe caminho mínimo definido.',
          'Se depois de |V| − 1 rodadas alguma aresta ainda relaxa, o caminho correspondente teria |V| arestas e repetiria um vértice: há ciclo, e ele é negativo.',
          'Se uma rodada inteira não muda nada, as distâncias já convergiram e dá para parar antes.']) },
      { t: 'Qual algoritmo usar?', h:
        tabela(['Situação', 'Algoritmo', 'Complexidade'], [
          ['Sem pesos, ou todos iguais', 'BFS', 'O(n + m)'],
          ['Uma origem, pesos ≥ 0', 'Dijkstra', 'O(n²) com vetor · O((n + m) log n) com heap'],
          ['Uma origem, com pesos negativos', 'Bellman-Ford', 'O(n · m)'],
          ['Detectar ciclo negativo', 'Bellman-Ford (rodada extra)', 'O(n · m)'],
          ['Todos os pares', 'Floyd-Warshall (programação dinâmica)', 'O(n³)'],
          ['Um destino e uma boa heurística', 'A*', 'no pior caso, como o Dijkstra'],
        ]) +
        dica('Notação de complexidade varia: O(V²) é o mesmo que O(n²), e O(E log V) com heap é o mesmo que O(m log n) num grafo conexo. Leia n = |V| e m = |E|.') +
        P('O Dijkstra domina em grafos grandes com pesos positivos; o Bellman-Ford é necessário com pesos negativos; o Floyd-Warshall é prático só para grafos pequenos ou densos.') },
      { t: 'Como mostrar a resolução', h:
        P('Quando a questão pede a resolução, e não só a alternativa, mostre quatro coisas:') +
        lista(['<b>Modelagem explícita:</b> o que é vértice, o que é aresta, o que é o peso, se é dirigido.',
          '<b>Justificativa do algoritmo:</b> “Dijkstra, porque os pesos são não negativos e queremos o caminho de uma origem.”',
          '<b>Execução:</b> a tabela (distância, predecessor) passo a passo.',
          '<b>Resposta e interpretação:</b> o caminho lido pelos predecessores e o custo, na unidade do problema.']) +
        P('O módulo <a href="#discursiva">Discursivas de grafos</a> traz as discursivas de grafos que já caíram no ENADE, com o padrão de resposta do Inep.') },
    ],
    exemplos: [
      { t: 'Dijkstra passo a passo', d: P('A tabela cresce uma coluna por passo, no formato (distância, predecessor). O número perto de cada vértice é a estimativa atual d(v).'),
        mount(el) { Gf.passoAPasso(el, GRAFO_DIJ, Gf.dijkstra(GRAFO_DIJ, 'A'), { tabelaEmbaixo: true }); } },
      { t: 'Treine antes de clicar', d: P('Grafo novo. Antes de avançar, escreva no papel qual vértice será fechado e quais estimativas mudam. Depois confira.'),
        mount(el) { Gf.passoAPasso(el, TREINO, Gf.dijkstra(TREINO, 'A'), { tabelaEmbaixo: true }); } },
      { t: 'Onde o Dijkstra quebra', d: P('O contraexemplo do conteúdo. Repare que, quando C é fechado, B já está fechado e a aresta de −10 não é mais relaxada.'),
        mount(el) { Gf.passoAPasso(el, QUEBRA, Gf.dijkstra(QUEBRA, 'A'), { tabelaEmbaixo: true }); },
        depois: P('O Bellman-Ford, no mesmo grafo, chega em d(B) = −5 na primeira rodada, relaxando A → C e depois C → B.') },
      { t: 'Bellman-Ford passo a passo', d: P('As arestas são relaxadas na ordem S→A, S→E, A→C, B→A, C→B, D→A, D→C, E→D. A tabela mostra as distâncias ao final de cada iteração.'),
        mount(el) { Gf.passoAPasso(el, BF, Gf.bellmanFord(BF, 'S'), { tabelaEmbaixo: true }); },
        depois: P('Menores caminhos a partir de S: E = 8 (S→E), D = 9 (S→E→D), A = 5 (S→E→D→A), C = 7 (S→E→D→A→C) e B = 5 (S→E→D→A→C→B).') },
      { t: 'Bellman-Ford encontra um ciclo negativo', d: P('Este grafo tem o ciclo 4 → 5 → 4, de peso −1 + (−3) = −4. Veja a rodada extra acusar.'),
        mount(el) { Gf.passoAPasso(el, CICLO, Gf.bellmanFord(CICLO, '1'), { tabelaEmbaixo: true }); } },
    ],
    atividades: [
      { t: 'Qual algoritmo?', tipo: 'classificar', d: P('Escolha o algoritmo adequado para cada situação.'),
        cfg: { cats: ['BFS', 'Dijkstra', 'Bellman-Ford', 'Floyd-Warshall'], itens: [
          { t: 'Menor número de conexões de voo entre duas cidades, sem olhar preço nem distância.', c: 0, e: 'Sem pesos, cada aresta conta 1: é distância em saltos, a BFS resolve.' },
          { t: 'Menor tempo de um depósito para todas as lojas, com tempos positivos nas estradas.', c: 1, e: 'Origem única e pesos não negativos: Dijkstra.' },
          { t: 'Menor custo de uma origem para todos, com alguns trechos que dão crédito (peso negativo).', c: 2, e: 'Pesos negativos invalidam o Dijkstra. Bellman-Ford, que ainda detecta ciclo negativo.' },
          { t: 'Tabela de distâncias entre todos os pares de 80 cidades.', c: 3, e: 'Todos os pares de uma vez: Floyd-Warshall, O(n³), viável para 80 vértices.' },
          { t: 'Verificar se uma rede de câmbio de moedas permite lucro infinito comprando e vendendo em ciclo.', c: 2, e: 'Lucro infinito é um ciclo negativo (com pesos −log da taxa). A rodada extra do Bellman-Ford detecta.' },
        ] } },
      { t: 'Exercícios', tipo: 'qa', itens: [
        { q: 'Dijkstra a partir de A no grafo dirigido A→B 5, A→C 1, B→C 4, C→B 2, B→D 2, C→D 5, B→E 4, C→E 5, D→E 2. Qual o menor caminho de A até E?', a: P('Fecham, nesta ordem: A (0), C (1), B (3, via C), D (5, via B) e E (6, via C).', 'Menor caminho de A até E: <b>A → C → E, custo 6</b>. (Por B fica A → C → B → E = 7.)') },
        { q: 'Bellman-Ford a partir de A no grafo A→B −1, A→C 4, B→C 3, B→D 2, B→E 2, D→B 1, D→C 5, E→D −3. Quais as menores distâncias?', a: P('B = −1 (A→B), C = 2 (A→B→C), E = 1 (A→B→E) e D = −2 (A→B→E→D). Não há ciclo negativo: D→B 1 e B→E→D somam 2 − 3 + 1 = 0.') },
        { q: 'No exemplo da tabela do conteúdo, por que o vértice C é fechado no passo 3, antes do D?', a: P('No começo do passo 3, os abertos são C (4), D (5) e E (9). O Dijkstra sempre fecha o de menor estimativa: C, com 4.') },
      ] },
    ],
    desafios: [
      { fonte: 'ENADE 2021 · Questão 34', enun:
        P('O algoritmo de Dijkstra para o problema do caminho mínimo em dígrafos com pesos utiliza uma fila de prioridades de vértices, na qual as prioridades são uma estimativa do custo final. A cada iteração, um vértice é retirado da fila, e os arcos que começam nesse vértice são analisados. Considere o seguinte grafo, no qual deseja-se conhecer o custo de um caminho mínimo para cada vértice, a partir do vértice D. Considere que -1 representa um custo “infinito”, ou seja, nenhum caminho até o vértice foi até o momento descoberto.') +
        fig(E2021, {}, { rotulo: 'Dígrafo com vértices de A a G' }) +
        P('Com base nas informações e no grafo apresentados, assinale a alternativa que representa a estimativa de custo após duas iterações do algoritmo.'),
        opts: ['A: 5 B: 6 C: 10 D: 0 E: 4 F: 1 G: -1', 'A: 5 B: 9 C: -1 D: 0 E: 5 F: 1 G: -1', 'A: 5 B: 9 C: -1 D: 0 E: 4 F: 1 G: 2', 'A: 5 B: 7 C: 8 D: 0 E: 4 F: 1 G: 2', 'A: 5 B: 6 C: 8 D: 0 E: 3 F: 1 G: 2'], c: 2,
        e: 'Início: D = 0 e os outros −1. Iteração 1: sai D e relaxa seus arcos: A = 5, B = 9, E = 5, F = 1. Iteração 2: sai F, a menor estimativa da fila (1), e relaxa F → E (1 + 3 = 4 &lt; 5) e F → G (1 + 1 = 2). Continuando, sairiam G (E vira 3) e E (B vira 4 e C vira 8): o resultado final é A 5, B 4, C 8, D 0, E 3, F 1, G 2.',
        w: { 1: 'Esse é o estado depois de uma iteração só, quando apenas D saiu da fila.' } },
      { fonte: 'ENADE 2017 · Questão 24', enun:
        P('A figura a seguir exibe um grafo que representa um mapa rodoviário, no qual os vértices representam cidades e as arestas representam vias. Os pesos indicam o tempo atual de deslocamento entre duas cidades.') +
        fig(E2017, {}, { rotulo: 'Mapa rodoviário com as cidades i, j, k e w' }) +
        P('Considerando que os tempos de ida e volta são iguais para qualquer via, avalie as afirmações a seguir acerca desse grafo.') +
        '<ol class="enun-afirm"><li>I. Dado o vértice de origem i, o algoritmo de Dijkstra encontra o menor tempo de deslocamento entre a cidade i e todas as demais cidades do grafo.</li><li>II. Uma árvore geradora de custo mínimo gerada pelo algoritmo de Kruskal contém um caminho de custo mínimo cuja origem é i e cujo destino é k.</li><li>III. Se um caminho de custo mínimo entre os vértices i e k contém o vértice w, então o subcaminho de origem w e destino k deve também ser mínimo.</li></ol>' +
        P('É correto o que se afirma em'),
        opts: ['I, apenas.', 'II, apenas.', 'I e III, apenas.', 'II e III, apenas.', 'I, II e III.'], c: 4,
        e: 'I: pesos positivos e uma origem, exatamente o problema do Dijkstra. II: o Kruskal pega as cinco arestas de peso 1 e depois as de peso 2 que não fecham ciclo; das duas ligações de peso 2 que saem do vértice central sem nome rumo a j (por cima até j, por baixo até w), só uma entra, porque a outra fecharia ciclo. As de peso 4 e 15 ficam de fora. Na árvore, i → k custa 2 + 1 + 2 + 2 = 7, que é o mínimo do grafo (por cima são 9; por baixo, 19). III: subestrutura ótima; se houvesse um trecho de w a k mais barato, trocá-lo daria um caminho de i a k mais barato que o mínimo.',
        w: { 2: 'A II vale <b>neste</b> grafo: o caminho de i a k dentro da árvore de Kruskal custa 7, o mínimo. Em geral a AGM não preserva caminhos mínimos, mas a afirmação é sobre este grafo.' } },
      { fonte: 'ENADE 2017 · Engenharia de Computação · Questão 35', enun:
        P('Em um algoritmo de roteamento de estado de enlace, a topologia da rede e todos os custos de enlace são conhecidos. Isso é alcançado fazendo-se cada nó transmitir pacotes de estado de enlace a todos os outros nós da rede, uma vez que cada um desses pacotes contém as identidades e os custos dos enlaces ligados a ele. O resultado dessa transmissão dos custos por difusão é que todos os nós dispõem de informações idênticas e completas da rede. Cada nó pode, então, rodar o algoritmo de estado de enlace e calcular o mesmo conjunto de caminhos de menor custo para todos os outros nós.',
          'O algoritmo de Dijkstra pode ser usado para calcular o caminho de menor custo entre um nó de origem e todos os outros nós da rede. Durante sua execução, este algoritmo atualiza o vetor D, sendo D(v) o custo do caminho de menor custo entre o nó de origem e o nó v.',
          'O grafo a seguir representa uma rede de roteadores. As arestas são rotuladas com os respectivos custos de cada ligação.') +
        fig(ROT2017, {}, { rotulo: 'Rede de sete roteadores com custos e arestas A a F' }) +
        P('Após a execução do algoritmo de Dijkstra pelo roteador de número 1, o vetor D retornou contendo os seguintes valores:') +
        tabela(['', '1', '2', '3', '4', '5', '6', '7'], [['D', '0', '3', '2', '4', '5', '7', '8']]) +
        P('Nesse cenário, quais são os custos das arestas A, B, C, D, E e F, respectivamente?'),
        opts: ['1, 2, 3, 2, 4 e 1.', '1, 2, 1, 2, 1 e 4.', '2, 1, 1, 4, 2 e 1.', '2, 1, 3, 1, 2 e 1.', '1, 1, 3, 4, 1 e 1.'], c: 2,
        e: 'Leia o vetor do menor para o maior. D(3) = 2 só pode vir da aresta 1–3 (por 2 já custaria pelo menos 4): A = 2. D(2) = 3 &lt; 4 vem por 3: 2 + B = 3, B = 1. D(4) = 4: por 3 seria 2 + 3 = 5, então vem por 2: 3 + C = 4, C = 1. D(5) = 5 = D(4) + 1, logo D ≥ 3 (senão D(5) seria menor). D(6) = 7 = D(5) + E, E = 2 (por 4 seria 9). D(7) = 8 = D(6) + F, F = 1 (por 5 seria 9). Só a alternativa C bate.' },
      { fonte: 'Inédita · Dijkstra', enun: P('O grafo mostra o tempo, em minutos, dos trechos entre cinco pontos de uma rede de entregas. Os trechos podem ser percorridos nos dois sentidos. Aplica-se o algoritmo de Dijkstra a partir de A.') + fig(Q12) +
        '<ol class="enun-afirm"><li>I. Quando C é fechado, a estimativa de B diminui de 6 para 5 minutos.</li><li>II. O ponto D é fechado antes do ponto B, pois D é vizinho de C, fechado na iteração anterior.</li><li>III. O menor tempo de A até E é de 8 minutos, pelo caminho A–C–B–D–E.</li></ol>' + P('É correto o que se afirma em'),
        opts: ['I, apenas.', 'I e III, apenas.', 'II e III, apenas.', 'I, II e III.'], c: 1,
        e: 'Ordem de fechamento: A (0), C (2), B (5, via C), D (7, via B), E (8, via D). I: ao fechar C, B passa de 6 para 2 + 3 = 5. II: D é fechado depois de B, porque 5 < 9; ser vizinho do último fechado não dá prioridade. III: A–C–B–D–E = 2 + 3 + 2 + 1 = 8.',
        w: { 2: 'O Dijkstra escolhe pela menor estimativa, não por ser vizinho do último fechado.', 3: 'A II é falsa: o Dijkstra escolhe pela menor estimativa, não por ser vizinho do último fechado.' } },
      { fonte: 'Inédita · asserção-razão', enun: P('Uma transportadora modela suas rotas como um grafo dirigido e ponderado. Alguns trechos recebem peso negativo porque geram crédito para a empresa, e o grafo não tem ciclos de peso negativo.') +
        '<ol class="enun-afirm"><li>I. Aplicado a esse grafo, o algoritmo de Dijkstra pode devolver distâncias mínimas incorretas.</li></ol><p class="porque">PORQUE</p><ol class="enun-afirm"><li>II. Ao encontrar uma aresta de peso negativo, o algoritmo de Dijkstra entra em laço infinito, pois o custo do caminho passa a diminuir indefinidamente.</li></ol>' + P('A respeito dessas asserções, assinale a opção correta.'),
        opts: ['As asserções I e II são proposições verdadeiras, e a II é uma justificativa correta da I.', 'As asserções I e II são proposições verdadeiras, mas a II não é uma justificativa correta da I.',
          'A asserção I é uma proposição verdadeira, e a II é uma proposição falsa.', 'A asserção I é uma proposição falsa, e a II é uma proposição verdadeira.', 'As asserções I e II são proposições falsas.'], c: 2,
        e: 'I é verdadeira: com peso negativo, um vértice já fechado pode ter um caminho mais barato que o Dijkstra nunca reconsidera. II é falsa: o Dijkstra fecha cada vértice uma única vez e termina normalmente, com a resposta errada. Laço sem fim só faria sentido com ciclo negativo, e o enunciado diz que não há.' },
      { fonte: 'Inédita · complexidade', enun: P('Em um grafo com n vértices e m arestas, representado por lista de adjacência, a complexidade do algoritmo de Dijkstra com fila de prioridade implementada em heap binário é'),
        opts: ['O((n + m) log n).', 'O(n · m).', 'O(n²).', 'O(n³).'], c: 0,
        e: 'São n extrações do mínimo e até m atualizações de chave, cada uma O(log n) no heap: O((n + m) log n). O(n²) é a versão com vetor simples; O(n · m) é o Bellman-Ford; O(n³), o Floyd-Warshall.' },
      { fonte: 'Inédita · escolha do algoritmo', enun: P('Um aplicativo de viagens precisa, todos os dias, da menor tarifa entre <b>todos os pares</b> de 60 aeroportos. Algumas conexões têm desconto que funciona como crédito (peso negativo), mas não existe ciclo de peso negativo. A escolha mais adequada é'),
        opts: ['executar o Dijkstra uma vez, a partir de qualquer aeroporto.', 'executar a busca em largura a partir de cada aeroporto.', 'o algoritmo de Kruskal.', 'o algoritmo de Floyd-Warshall.'], c: 3,
        e: 'Todos os pares e pesos negativos sem ciclo negativo: Floyd-Warshall, O(n³), tranquilo para 60 vértices. O Dijkstra não aceita peso negativo e, executado uma vez, só dá uma origem. A BFS ignora as tarifas. Kruskal constrói árvore geradora mínima, que é outro problema.' },
      { fonte: 'Inédita · Bellman-Ford', enun: P('Sobre o algoritmo de Bellman-Ford aplicado a um grafo dirigido com n vértices, assinale a alternativa correta.'),
        opts: ['Ele relaxa todas as arestas n − 1 vezes, porque um caminho simples tem no máximo n − 1 arestas.', 'Ele fecha um vértice por iteração, como o Dijkstra, e por isso não aceita pesos negativos.', 'Ele precisa de n² rodadas para garantir as distâncias corretas.', 'Se uma aresta ainda relaxar na rodada extra, as distâncias calculadas são as menores possíveis.'], c: 0,
        e: 'Cada rodada relaxa todas as arestas; após n − 1 rodadas, todo caminho simples (com até n − 1 arestas) já foi considerado. Se a rodada extra ainda melhora alguma distância, existe ciclo negativo, e aí não há caminho mínimo definido.' },
      { fonte: 'Inédita · relaxamento', enun: P('Durante a execução de um algoritmo de caminho mínimo, d(u) = 7, d(v) = 12 e a aresta (u, v) tem peso 3. Ao relaxar (u, v),'),
        opts: ['nada muda, porque d(v) já é finito.', 'd(v) passa a valer 15, a soma de 12 e 3.', 'd(u) passa a valer 9, porque 12 − 3 = 9.', 'd(v) passa a valer 10 e o predecessor de v passa a ser u.'], c: 3,
        e: 'Como d(v) = 12 > d(u) + w(u, v) = 7 + 3 = 10, a estimativa de v melhora para 10, e o predecessor de v vira u. Relaxar só altera o vértice de destino da aresta.' },
    ],
  });
})();
