/* Módulo 4 · Árvores e árvore geradora mínima: Prim e Kruskal */
(function () {
  const { P, dica, armadilha, nota, lista, codigo, tabela, h } = window.UI;
  const Gf = window.Grafos;
  const fig = (G, est = {}, op = {}) => { const d = document.createElement('div'); Gf.desenha(d, G, est, op); return `<div class="fig-estatica">${d.innerHTML}</div>`; };

  const CUSTO37 = { nos: { a: [0, 30], b: [22, 4], c: [50, 4], d: [78, 4], e: [100, 30], f: [78, 56], g: [50, 56], h: [22, 56], i: [38, 30] },
    arestas: [['a', 'b', 4], ['a', 'h', 8], ['b', 'c', 8], ['b', 'h', 11], ['c', 'd', 7], ['c', 'f', 4], ['c', 'i', 2], ['d', 'e', 9], ['d', 'f', 14], ['e', 'f', 10], ['f', 'g', 2], ['g', 'h', 1], ['g', 'i', 6], ['h', 'i', 7]] };
  const OFF37 = { 'c-f': [3, -2], 'd-f': [2.5, 0], 'b-h': [-2.5, 0] };
  const SETE = { nos: { A: [0, 30], B: [32, 3], C: [68, 3], D: [32, 57], E: [68, 57], F: [100, 30], G: [50, 30] },
    arestas: [['A', 'B', 4], ['A', 'D', 3], ['A', 'G', 11], ['B', 'C', 6], ['B', 'G', 5], ['C', 'G', 2], ['C', 'F', 7], ['D', 'G', 8], ['D', 'E', 9], ['E', 'G', 1], ['E', 'F', 10]] };
  const CICLOVIA = { nos: { P: [0, 26], Q: [32, 0], R: [32, 52], S: [66, 0], T: [66, 52], U: [98, 26] },
    arestas: [['P', 'Q', 3], ['P', 'R', 5], ['Q', 'R', 4], ['Q', 'S', 7], ['R', 'S', 2], ['R', 'T', 8], ['S', 'T', 6], ['S', 'U', 9], ['T', 'U', 1]] };

  window.MODULOS.push({
    id: 'arvores-agm',
    curto: 'Árvores e AGM',
    titulo: 'Árvores e árvore geradora mínima: Prim e Kruskal',
    grupo: 'Caminhos e árvores',
    enade: 'ENADE 2014 (questão 30) e ENADE 2019 de Engenharia de Computação (questão 24), nos desafios · ENADE 2017 (questão 24), no módulo de caminhos mínimos',
    resumo: 'O que é uma árvore, como ligar todos os vértices com o menor custo total e por que a árvore geradora mínima não é o mesmo que caminho mínimo.',
    topicos: [
      { t: 'Árvore e floresta', h:
        P('Uma <b>árvore</b> é um grafo conexo, não orientado e sem ciclos. Uma <b>floresta</b> é um grafo cujas componentes são árvores.') +
        lista(['Entre quaisquer dois vértices de uma árvore existe <b>um único caminho</b> simples.', 'Uma árvore com n vértices tem exatamente <b>n − 1 arestas</b>.',
          'Toda aresta de uma árvore é uma <b>ponte</b>: se cair, o grafo desconecta.', 'Acrescentar uma aresta a uma árvore cria exatamente um ciclo.']) +
        nota('“Conexo e acíclico”, “conexo com n − 1 arestas” e “acíclico com n − 1 arestas” descrevem a mesma coisa: se uma alternativa afirma duas delas, é redundante, não errada.') },
      { t: 'Árvores enraizadas e m-árias', h:
        P('Escolhendo um vértice como <b>raiz</b>, a árvore ganha hierarquia:') +
        lista(['<b>Nível</b> de um vértice: o comprimento do caminho da raiz até ele (a raiz tem nível 0). <b>Altura</b>: o maior nível.', '<b>Pai</b>, <b>filhos</b>, <b>ancestrais</b> e <b>descendentes</b> seguem a hierarquia; vértices sem filhos são <b>folhas</b>, os outros são <b>internos</b>.',
          'Uma árvore é <b>m-ária</b> se nenhum vértice interno tem mais de m filhos, e <b>m-ária cheia</b> se todos os internos têm exatamente m. Com m = 2, é <b>binária</b>.', 'É <b>balanceada</b> se todas as folhas estão no nível h ou h − 1.']) },
      { t: 'Árvore geradora e árvore geradora mínima', h:
        P('Uma <b>árvore geradora</b> de G é um subgrafo que é árvore e contém <b>todos</b> os vértices de G, com |V| − 1 arestas. Para obter uma, retire uma aresta de cada ciclo até não sobrar ciclo.',
          'Num grafo ponderado, o custo de uma árvore geradora é a soma dos pesos das suas arestas. A <b>árvore geradora mínima</b> (AGM, ou T<sub>min</sub>) é a de menor custo. É o problema de “ligar tudo gastando o mínimo”: cabos, encanamentos, estradas, fibra óptica.') +
        armadilha('A AGM nem sempre é única. No grafo da aba Exemplos existem duas AGMs diferentes, ambas com custo 37: uma usa (b, c) e a outra usa (a, h). O custo mínimo, esse sim, é único. Com todos os pesos distintos, a AGM é única.') },
      { t: 'Algoritmo de Prim', h:
        P('Robert Prim (1957). Começa de qualquer vértice e cresce <b>uma única árvore</b>: a cada passo, inclui a <b>aresta segura</b>, a mais barata que liga um vértice da árvore a um vértice de fora.') +
        codigo(['Escolha qualquer vértice i;  T ← {i};  V ← N \\ {i};  T_min ← ∅', 'Enquanto T ≠ N faça', '    encontre a aresta (j, k) com j ∈ T, k ∈ V e d_jk mínimo', '    T ← T ∪ {k};  V ← V \\ {k}', '    T_min ← T_min ∪ {(j, k)}', 'Escreva T_min'], 'Prim') +
        P('Custo: O(n²) com matriz e vetor de chaves (bom para grafo denso); O(m log n) com heap.') },
      { t: 'Algoritmo de Kruskal', h:
        P('Joseph Kruskal (1956). A árvore é formada pela inclusão de <b>arestas</b>, não de vértices: ordene as arestas por peso e aceite cada uma se ela não fechar ciclo. Durante a execução, o conjunto escolhido é uma <b>floresta</b>, que só vira uma árvore no fim.') +
        codigo(['Ordene as arestas em ordem crescente de peso:  H = [h1, h2, ..., hm]', 'T ← {h1};  i ← 2', 'Enquanto |T| < n − 1 faça', '    se T ∪ {hi} é acíclico então T ← T ∪ {hi}', '    i ← i + 1', 'Escreva T'], 'Kruskal') +
        P('Para testar se fecha ciclo, guarda-se em qual árvore da floresta cada vértice está (estrutura de conjuntos disjuntos, <i>union-find</i>): se as duas pontas estão na mesma árvore, a aresta é descartada; senão, as árvores se unem. Custo dominado pela ordenação: O(m log m) = O(m log n).') },
      { t: 'Kruskal × Prim', h:
        tabela(['', 'Prim', 'Kruskal'], [
          ['Cresce', 'uma única árvore, a partir de um vértice', 'uma floresta, que se une no fim'],
          ['Escolha gulosa', 'aresta mais barata saindo da árvore', 'aresta mais barata que não fecha ciclo'],
          ['Estrutura típica', 'fila de prioridade (ou vetor)', 'ordenação + conjuntos disjuntos'],
          ['Melhor em', 'grafos densos', 'grafos esparsos'],
        ]) +
        lista(['Aplicados ao mesmo grafo, <b>podem</b> devolver árvores diferentes (quando há pesos repetidos).', 'O <b>custo</b> da árvore é sempre o mesmo.', 'Os dois são gulosos e os dois são ótimos.']) },
      { t: 'AGM não é caminho mínimo', h:
        P('É a confusão que mais derruba questão. A AGM minimiza a <b>soma de todas as arestas da árvore</b>; o caminho mínimo minimiza o custo de <b>um par origem-destino</b>. O caminho entre dois vértices dentro da AGM pode ser mais caro que o caminho mínimo no grafo.') +
        fig(SETE) +
        P('Neste grafo, a AGM custa 22. Dentro dela, ir de A até F custa 4 + 5 + 2 + 7 = 18 (A–B–G–C–F). Mas o menor caminho de A até F no grafo é A–B–C–F, com 4 + 6 + 7 = <b>17</b>, e usa a aresta B–C, que nem está na AGM. Veja na aba Exemplos.') +
        tabela(['O enunciado diz', 'Problema', 'Algoritmo'], [['“ligar todos”, “manter tudo interligado com o menor custo total”', 'árvore geradora mínima', 'Kruskal ou Prim'], ['“menor percurso de A até B”, “rota mais rápida”', 'caminho mínimo', 'Dijkstra (pesos ≥ 0)']]) },
    ],
    exemplos: [
      { t: 'Prim a partir de a', d: P('Os números perto dos vértices de fora são o peso da aresta mais barata que os liga à árvore. Na iteração 2, (a, h) e (b, c) empatam com 8; aqui entra (b, c).'),
        mount(el) { Gf.passoAPasso(el, CUSTO37, Gf.prim(CUSTO37, 'a'), { offPeso: OFF37 }); } },
      { t: 'Kruskal no mesmo grafo', d: P('Arestas em ordem crescente. Laranja: aceitas. Tracejado vermelho: descartadas porque fechariam ciclo.'),
        mount(el) { Gf.passoAPasso(el, CUSTO37, Gf.kruskal(CUSTO37), { offPeso: OFF37 }); },
        depois: P('O Kruskal aceitou (a, h) e descartou (b, c); o Prim fez o contrário. São as duas AGMs diferentes, ambas de custo 37.') },
      { t: 'AGM × caminho mínimo', d: P('Compare as três escolhas no mesmo grafo.'),
        mount(el) {
          const figura = h('div', { class: 'lab-fig' });
          const txt = h('p', { class: 'lab-status', 'aria-live': 'polite' });
          const agm = ['E-G', 'C-G', 'A-D', 'A-B', 'B-G', 'C-F'];
          const vistas = {
            agm: [agm, 'arvore', '<b>AGM</b>: E–G, C–G, A–D, A–B, B–G e C–F. Custo total 1 + 2 + 3 + 4 + 5 + 7 = <b>22</b>.'],
            naarvore: [['A-B', 'B-G', 'C-G', 'C-F'], 'caminho', '<b>De A até F dentro da AGM</b>: A–B–G–C–F = 4 + 5 + 2 + 7 = <b>18</b>.'],
            minimo: [['A-B', 'B-C', 'C-F'], 'caminho', '<b>Caminho mínimo de A até F no grafo</b>: A–B–C–F = 4 + 6 + 7 = <b>17</b>. A aresta B–C nem está na AGM.'],
          };
          const bots = h('div', { class: 'lab-bots' });
          const mostra = (k) => {
            const [ar, cls, msg] = vistas[k];
            const aresta = {};
            ar.forEach((x) => (aresta[x] = cls));
            Gf.desenha(figura, SETE, { aresta });
            txt.innerHTML = msg;
            [...bots.children].forEach((b) => b.classList.toggle('ativo', b.dataset.k === k));
          };
          [['agm', 'Mostrar a AGM'], ['naarvore', 'A até F na AGM'], ['minimo', 'Caminho mínimo de A até F']].forEach(([k, r]) =>
            bots.append(h('button', { class: 'btn-sec', type: 'button', 'data-k': k, onclick: () => mostra(k) }, r)));
          el.append(h('div', { class: 'lab' }, figura, txt, bots));
          mostra('agm');
        } },
    ],
    atividades: [
      { t: 'Une ou descarta?', tipo: 'classificar', d: P('No Kruskal do grafo de custo 37 (aba Exemplos), depois de aceitar (g, h), (c, i), (f, g), (a, b) e (c, f), o que acontece com cada aresta quando chega a vez dela?'),
        cfg: { cats: ['Une', 'Descarta'], itens: [
          { t: '(g, i), peso 6', c: 1, e: 'g e i já estão na mesma árvore {c, f, g, h, i}: fecharia o ciclo g–f–c–i–g.' },
          { t: '(c, d), peso 7', c: 0, e: 'd ainda está sozinho: une {d} à árvore grande.' },
          { t: '(h, i), peso 7, depois de (c, d)', c: 1, e: 'h e i estão na mesma árvore desde a união feita por (c, f).' },
          { t: '(a, h), peso 8', c: 0, e: 'a está em {a, b} e h na árvore grande: une as duas.' },
          { t: '(d, e), peso 9', c: 0, e: 'e é o último vértice sozinho: a aresta entra e completa as n − 1 = 8 arestas.' },
        ] } },
      { t: 'AGM ou caminho mínimo?', tipo: 'classificar', d: P('Qual problema cada situação descreve?'),
        cfg: { cats: ['Árvore geradora mínima', 'Caminho mínimo'], itens: [
          { t: 'Uma prefeitura quer ligar todos os bairros com fibra, gastando o mínimo de cabo.', c: 0, e: 'Ligar todos com menor total: AGM.' },
          { t: 'Um aplicativo quer a rota mais curta da casa do usuário até o hospital.', c: 1, e: 'Um par origem-destino: caminho mínimo.' },
          { t: 'Uma fazenda quer encanar a água do poço até todos os bebedouros com o menor comprimento total de cano.', c: 0, e: 'É a questão do ENADE 2014: AGM, resolvida por Kruskal.' },
          { t: 'Um roteador precisa da menor latência até cada um dos outros roteadores da rede.', c: 1, e: 'Menor custo de uma origem para todos: Dijkstra.' },
        ] } },
    ],
    desafios: [
      { fonte: 'ENADE 2014 · Questão 30', enun:
        P('Uma fazenda possui um único poço artesiano que deve abastecer <i>n</i> bebedouros para o gado. Deseja-se determinar um projeto de ligação entre esses <i>n+1</i> pontos através de encanamentos com a menor extensão total. Um algoritmo proposto para a solução do problema executa os seguintes passos:') +
        '<ol class="enun-afirm"><li>1. Crie <i>n+1</i> conjuntos unitários, cada um contendo um dos pontos a serem ligados entre si e insira esses conjuntos em um conjunto <i>C</i>.</li><li>2. Crie um conjunto <i>D</i> contendo um registro para cada combinação possível de dois pontos distintos a serem ligados. Cada registro deve conter os campos <i>ci</i>, <i>cj</i> e <i>d</i>, em que <i>ci</i> e <i>cj</i> são os dois pontos a serem ligados e <i>d</i> é a distância entre eles.</li><li>3. Enquanto <i>D</i> não estiver vazio faça:<br>3.1. Remova o registro de <i>D</i> com o menor valor de distância <i>d</i>.<br>3.2. Se os valores de <i>c<sub>i</sub></i> e <i>c<sub>j</sub></i> do registro removido pertencerem a conjuntos distintos de <i>C</i>, então:<br>3.2.1. Substitua estes dois conjuntos pela união entre eles.<br>3.2.2. Guarde o registro removido em um conjunto-solução.</li></ol>' +
        P('Com base na descrição do problema e do algoritmo proposto, conclui-se que'),
        opts: ['o problema exemplifica a obtenção de uma árvore geradora mínima, portanto está no conjunto <i>P</i>.', 'o algoritmo é uma heurística para o Problema do Caixeiro Viajante, logo apresenta complexidade polinomial.',
          'o problema descrito é de otimização, logo pertence ao conjunto <i>NP</i>–difícil, mas não ao conjunto <i>NP</i>–completo.', 'uma alternativa para a solução do problema é usar o algoritmo de Dijkstra para obtenção do caminho mínimo entre dois pontos.',
          'o passo de maior custo do algoritmo é a criação do conjunto <i>D</i> com as combinações de pontos, apresentando complexidade computacional <i>O(n!)</i>.'], c: 0,
        e: 'Os passos são o Kruskal: conjuntos unitários (passo 1), as arestas de um grafo completo com peso igual à distância (passo 2), sempre a menor distância primeiro (3.1) e só aceita se as pontas estão em conjuntos diferentes, unindo-os (3.2). Isso dá a árvore geradora mínima, resolvida em tempo polinomial: classe P.',
        w: { 3: 'O Dijkstra dá o menor caminho do poço até cada bebedouro; somar esses caminhos não dá o menor encanamento total.', 1: 'O caixeiro exige um ciclo que passe por todos os pontos; aqui se quer uma árvore.', 2: 'Ser de otimização não torna um problema NP-difícil: a AGM é polinomial.', 4: 'Combinações de dois pontos são (n + 1)n/2 registros: O(n²), não O(n!).' } },
      { fonte: 'Inédita · Kruskal', enun: P('Uma prefeitura vai construir ciclovias para ligar seis praças, de P a U. O grafo mostra os trechos possíveis e seus comprimentos, em km. Deseja-se que seja possível ir de bicicleta de qualquer praça a qualquer outra, com o menor comprimento total de ciclovia.') + fig(CICLOVIA) +
        '<ol class="enun-afirm"><li>I. A rede de menor comprimento total tem 5 trechos e soma 16 km.</li><li>II. Executando o algoritmo de Kruskal, o trecho P–R é analisado antes do trecho S–T e é descartado, porque P e R já estão ligados pelos trechos P–Q e Q–R.</li><li>III. Na rede de menor comprimento total, o caminho de P até R é o menor caminho entre essas duas praças no grafo.</li></ol>' + P('É correto o que se afirma em'),
        opts: ['I, apenas.', 'I e II, apenas.', 'I e III, apenas.', 'II e III, apenas.'], c: 1,
        e: 'Kruskal: T–U (1), R–S (2), P–Q (3), Q–R (4); P–R (5) é descartado, pois P e R já estão na mesma árvore; S–T (6) une tudo. São 5 trechos (n − 1) e 16 km. Na rede, P até R custa P–Q–R = 7, mas no grafo a aresta direta P–R custa 5: AGM não preserva caminhos mínimos.' },
      { fonte: 'ENADE 2019 · Engenharia de Computação · Questão 24', enun:
        P('Protocolos de roteamento de estado de enlace utilizam difusão para propagar informações de estado de enlace que são usadas para calcular rotas individuais. Entretanto, algumas técnicas provocam a transmissão de pacotes redundantes na rede. Idealmente, cada nó deveria receber apenas uma cópia do pacote de difusão.',
          'Uma técnica utilizada para resolver o problema da redundância de pacotes, é a difusão por <i>spanning tree</i>. Uma <i>spanning tree</i> de um grafo G = (N, E) é um grafo G\' = (N, E\') tal que E\' é um subconjunto de E, G\' é conexo, não possui ciclos e contém todos os nós originais em G. Se cada enlace tiver um custo associado e o custo de uma árvore for a soma dos custos dos enlaces, então uma árvore cujo custo seja o mínimo entre todas as <i>spanning trees</i> do grafo é denominada uma <i>spanning tree</i> mínima.',
          '<small>KUROSE, J. F.; ROSS, K. W. <b>Redes de computadores e a Internet</b>: uma abordagem top-down. 6. ed. São Paulo: Pearson Education do Brasil, 2013 (adaptado).</small>',
          'Considere uma rede composta por 6 roteadores, designados pelas letras A, B, C, D, E e F, conectados conforme a seguinte tabela de custos de seus enlaces:') +
        tabela(['Conexão', 'Custo do enlace'], [['A-B', '2'], ['A-C', '2'], ['B-C', '2'], ['B-D', '3'], ['C-D', '3'], ['C-E', '1'], ['C-F', '1'], ['D-F', '2'], ['E-F', '1']]) +
        P('Neste cenário, o custo da <i>spanning tree</i> mínima correspondente é, exatamente:'),
        opts: ['5.', '7.', '8.', '9.', '11.'], c: 2,
        e: 'Kruskal: C-E (1) e C-F (1) entram; E-F (1) fecharia o ciclo C-E-F e é descartada. Depois, entre as de custo 2: A-B entra, A-C entra, B-C fecharia ciclo, D-F entra. São 5 enlaces para 6 roteadores: 1 + 1 + 2 + 2 + 2 = 8.',
        w: { 1: 'Com 6 roteadores, a árvore tem 5 enlaces. 7 só seria possível com três enlaces de custo 1, e os três formam o ciclo C-E-F.' } },
      { fonte: 'Inédita · Kruskal × Prim', enun: P('Em um grafo conexo, ponderado e não dirigido, avalie as afirmações.') +
        '<ol class="enun-afirm"><li>I. Ao longo da execução, o Prim mantém sempre uma única árvore, enquanto o Kruskal mantém uma floresta que só se une no final.</li><li>II. Se todos os pesos forem distintos, a árvore geradora mínima é única, e Prim e Kruskal devolvem exatamente as mesmas arestas.</li><li>III. O Kruskal pode parar assim que tiver aceitado n − 1 arestas.</li></ol>' + P('É correto o que se afirma em'),
        opts: ['I, apenas.', 'I e II, apenas.', 'II e III, apenas.', 'I, II e III.'], c: 3,
        e: 'I é a diferença estrutural entre os dois algoritmos. II: com pesos distintos, a AGM é única, então os dois algoritmos, que são ótimos, só podem devolver ela. III: uma árvore geradora tem exatamente n − 1 arestas; as que sobraram nem precisam ser examinadas.' },
      { fonte: 'Inédita · árvores enraizadas', enun: P('Considere a árvore enraizada em r com as arestas r–a, r–b, a–c, a–d e d–e. Assinale a alternativa correta.'),
        opts: ['A altura da árvore é 2 e as folhas são c, d e e.', 'A árvore é binária cheia, pois todo vértice interno tem 2 filhos.', 'O vértice a é folha, pois tem grau 3.', 'A altura da árvore é 3, as folhas são b, c e e, e o nível de d é 2.'], c: 3,
        e: 'Níveis: r 0; a e b 1; c e d 2; e 3. Altura = maior nível = 3. Folhas são os vértices sem filhos: b, c e e. Não é binária cheia: d é interno e tem um filho só.' },
      { fonte: 'Inédita · contar arestas', enun: P('Um grafo conexo tem 15 vértices e 14 arestas. Sobre ele, é correto afirmar que'),
        opts: ['é uma árvore, e a remoção de qualquer aresta o desconecta.', 'pode ter um ciclo, desde que seja um triângulo.', 'é completo, porque toda aresta liga dois vértices.', 'tem exatamente duas árvores geradoras.'], c: 0,
        e: 'Conexo com n − 1 = 14 arestas é árvore. Árvore não tem ciclo, e toda aresta é ponte. Ele é sua própria (e única) árvore geradora; o completo K₁₅ teria 105 arestas.' },
    ],
  });
})();
