/* Módulo 1 · Fundamentos */
(function () {
  const { P, dica, armadilha, nota, lista, formula, tabela, h } = window.UI;
  const Gf = window.Grafos;
  const fig = (G, est = {}, op = {}) => { const d = document.createElement('div'); Gf.desenha(d, G, est, op); return `<div class="fig-estatica">${d.innerHTML}</div>`; };

  const TORNEIO = { nos: { '6A': [8, 30], '7A': [33, 4], '6B': [67, 4], '8A': [92, 30], '8B': [67, 56], '7B': [33, 56] },
    arestas: [['6A', '7A'], ['6A', '7B'], ['6A', '8B'], ['6B', '7A'], ['6B', '8A'], ['6B', '8B'], ['7B', '8A'], ['7B', '8B'], ['8A', '8B']] };
  const REPR = { nos: { u: [6, 8], v: [50, 0], w: [94, 8], x: [76, 48], y: [30, 46] },
    arestas: [['u', 'y'], ['u', 'v'], ['v', 'w'], ['w', 'y'], ['w', 'x'], ['x', 'y'], ['v', 'y']] };
  const QUADRADO = { nos: { A: [0, 0], B: [36, 0], C: [36, 30], D: [0, 30] }, arestas: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['A', 'D'], ['A', 'C']] };

  window.MODULOS.push({
    id: 'fundamentos',
    curto: 'Fundamentos',
    titulo: 'Fundamentos: o vocabulário dos grafos',
    grupo: 'Base',
    enade: 'ENADE 2005 (questão 44) e ENADE 2011 (questão 20), nos desafios',
    resumo: 'Vértice, aresta, grau, caminho, conexidade, tipos de grafo e as quatro formas de representar um grafo no computador.',
    topicos: [
      { t: 'Grafo, ordem e tamanho', h:
        P('Um grafo formaliza <b>relações</b> entre elementos de um conjunto. Ele tem <b>vértices</b> (ou nós), desenhados como pontos, e <b>arestas</b> (ou arcos), que ligam os vértices. Escrevemos <b>G = (V, E)</b>; alguns livros usam G = (N, M).',
          'Num grafo <b>não direcionado</b>, a aresta {i, j} vale nos dois sentidos. Num grafo <b>direcionado</b> (dígrafo), o arco (i, j) não é necessariamente igual a (j, i). Se arestas ou vértices têm números associados (custo, distância, tempo, valor), o grafo é <b>ponderado</b>.') +
        tabela(['Termo', 'O que é', 'No torneio da figura'], [
          ['<b>Ordem</b>', 'quantidade de vértices, |V| = n', '6 turmas'],
          ['<b>Tamanho</b>', 'quantidade de arestas, |E| = m', '9 jogos'],
          ['<b>Grau</b> d(v)', 'quantas arestas incidem em v', 'd(6A) = 3, d(7A) = 2'],
        ]) +
        fig(TORNEIO, {}, { rotulo: 'Grafo do torneio entre as turmas' }) +
        P('<small>Um torneio entre seis turmas: cada turma é um vértice e cada jogo já realizado é uma aresta. O grafo não é direcionado: jogar contra é uma relação de mão dupla.</small>') },
      { t: 'Tipos de grafo que aparecem nos enunciados', h:
        tabela(['Tipo', 'Definição', 'Para guardar'], [
          ['Simples', 'sem laços e sem arestas paralelas', 'quando a questão diz só “grafo”, em geral é simples'],
          ['Multigrafo', 'tem arestas paralelas (o mesmo par ligado mais de uma vez)', ''],
          ['Pseudografo', 'tem pelo menos um laço (aresta de um vértice para ele mesmo)', 'o laço conta 2 no grau'],
          ['Completo K<sub>n</sub>', 'todo par de vértices é ligado', 'm = n(n − 1)/2 e todo vértice tem grau n − 1'],
          ['Regular (k-regular)', 'todos os vértices têm o mesmo grau k', 'K<sub>n</sub> é (n − 1)-regular'],
          ['Bipartido', 'V se divide em V<sub>1</sub> e V<sub>2</sub> sem arestas dentro de cada parte', 'bipartido ⇔ não tem ciclo ímpar'],
          ['Bipartido completo K<sub>p,q</sub>', 'cada vértice de V<sub>1</sub> ligado a todos de V<sub>2</sub>', 'm = p · q'],
          ['Árvore', 'conexo e sem ciclo', 'tem exatamente n − 1 arestas'],
          ['Vazio, nulo, trivial', 'sem arestas · sem vértices · um único vértice', ''],
        ]) +
        dica('Conte arestas para reconhecer o tipo: com n vértices, uma rede conexa com n − 1 arestas é árvore; com n(n − 1)/2 arestas, é completa. É assim que se resolve a questão da fibra óptica do ENADE 2005, nos desafios.') },
      { t: 'Grau e o teorema da soma dos graus', h:
        formula('Σ d(v) = 2m', 'a soma dos graus de todos os vértices é o dobro do número de arestas') +
        P('<b>Por quê?</b> Ao somar os graus, cada aresta é contada duas vezes, uma em cada extremidade. No torneio: 3 + 3 + 2 + 3 + 3 + 4 = 18 = 2 × 9 jogos.',
          '<b>Corolário:</b> todo grafo tem um número <b>par</b> de vértices de grau ímpar. Se fosse ímpar, a soma dos graus seria ímpar, mas ela é sempre 2m.') +
        lista(['O <b>laço</b> conta 2 no grau, para o teorema continuar valendo.',
          'Em dígrafo, cada arco soma 1 ao grau de saída de quem sai e 1 ao grau de entrada de quem recebe: Σ entradas = Σ saídas = m.',
          '<b>Sequência de graus</b>: os graus em ordem decrescente. No torneio: (4, 3, 3, 3, 3, 2).',
          'Vértice de grau 0 é <b>isolado</b>; de grau 1, <b>pendente</b>.']) +
        armadilha('“Existe um grafo com graus 3, 3, 3, 2, 2?” A soma é 13, ímpar. Não existe. O ENADE de 2011 cobrou exatamente essa consequência em formato asserção-razão.') },
      { t: 'Vizinhança, adjacência e fecho transitivo', h:
        lista(['<b>Vizinhança aberta</b> N(v): os vértices adjacentes a v. Alguns livros escrevem Γ(v).',
          '<b>Vizinhança fechada</b> N[v] = N(v) ∪ {v}. No torneio: N(7B) = {6A, 8A, 8B} e N[7B] = {6A, 7B, 8A, 8B}.',
          'Em dígrafo: N⁺(v) são os <b>sucessores</b> (arcos que saem de v) e N⁻(v) os <b>antecessores</b>.',
          'Duas arestas são adjacentes quando têm um vértice em comum.',
          '<b>Fecho transitivo direto</b> R⁺(v): todos os vértices que se alcançam a partir de v. <b>Inverso</b> R⁻(v): todos os que alcançam v.']) },
      { t: 'Passeio, trilha, caminho e ciclo', h:
        tabela(['Nome', 'Pode repetir aresta?', 'Pode repetir vértice?', 'Fechado?'], [
          ['Passeio (percurso)', 'sim', 'sim', 'tanto faz'],
          ['Trilha (cadeia)', 'não', 'sim', 'tanto faz'],
          ['Caminho', 'não', 'não', 'não'],
          ['Ciclo', 'não', 'não (só o início = fim)', 'sim'],
        ]) +
        P('O <b>comprimento</b> é o número de arestas. A <b>distância</b> entre u e v é o menor comprimento de um caminho entre eles. Um grafo é <b>conexo</b> se existe caminho entre quaisquer dois vértices; se não for, ele se divide em <b>componentes conexas</b>.') +
        nota('Se dois vértices estão em componentes diferentes, não há caminho entre eles, nem com escalas. Já a falta de aresta direta não basta para dizer que não há caminho: pode haver um caminho passando por outros vértices.') },
      { t: 'Subgrafo, subgrafo induzido e isomorfismo', h:
        lista(['G<sub>s</sub> é <b>subgrafo</b> de G se seus vértices e arestas são subconjuntos dos de G.',
          'O <b>subgrafo induzido</b> por um conjunto de vértices S traz <b>todas</b> as arestas de G entre vértices de S. A palavra “induzido” é a pegadinha: não dá para escolher só algumas arestas.',
          'Dois grafos são <b>isomorfos</b> se existe uma correspondência 1 a 1 entre os vértices que preserva as adjacências. Mesmo número de vértices, de arestas e a mesma sequência de graus são necessários, mas não bastam.']) },
      { t: 'Representações: lista, matriz de adjacência, matriz de incidência', h:
        P('Desenho é bom para nós; o computador precisa de uma estrutura. As quatro mais usadas são a <b>lista de arestas</b>, a <b>lista de adjacência</b>, a <b>matriz de adjacência</b> (n × n) e a <b>matriz de incidência</b> (n × m). Veja as três principais lado a lado na aba Exemplos.') +
        tabela(['Operação', 'Matriz de adjacência', 'Lista de adjacência'], [
          ['Espaço', 'Θ(n²)', 'Θ(n + m)'],
          ['Testar se (u, v) é aresta', 'Θ(1)', 'Θ(d(u))'],
          ['Percorrer os vizinhos de u', 'Θ(n)', 'Θ(d(u))'],
          ['BFS ou DFS no grafo todo', 'Θ(n²)', 'Θ(n + m)'],
          ['Melhor para', 'grafo denso, muitos testes de adjacência', 'grafo esparso (o caso comum)'],
        ]) +
        P('Exemplo: com 1 milhão de vértices e 10 vizinhos por vértice, qual representação? A <b>lista</b>: a matriz teria 10¹² posições; a lista guarda cerca de 10⁷ entradas.') +
        dica('Em grafo direcionado, a matriz de adjacência não precisa ser simétrica. Na matriz de incidência de um dígrafo, a coluna do arco tem 1 na origem e −1 no destino.') },
      { t: 'Do enunciado ao grafo', h:
        P('Toda questão de grafo começa pela modelagem. Faça quatro perguntas ao texto:') +
        lista(['<b>Quem são os vértices?</b> Os substantivos que se repetem e podem ser contados: cidades, roteadores, turmas, tarefas.',
          '<b>Quem são as arestas?</b> As relações: liga, joga contra, depende de, conflita com.',
          '<b>Tem peso?</b> Custo, distância, tempo. E o número acompanha a ligação (peso na aresta) ou o item (peso no vértice)?',
          '<b>Tem direção?</b> Mão única, pré-requisito, voo de ida: dirigido.']) +
        P('E escreva com todas as letras: “Modelo como G = (V, E, w), não dirigido, em que V são os roteadores, E são os enlaces e w(e) é o custo de cada enlace.” Desenho sem legenda não é modelagem.') },
    ],
    exemplos: [
      { t: 'Grau e vizinhança no torneio', d: P('Clique em uma turma para ver a vizinhança N(v) e o grau. Abaixo, a conta do teorema da soma dos graus.'),
        mount(el) {
          const fig = h('div', { class: 'lab-fig' });
          const info = h('p', { class: 'lab-status', 'aria-live': 'polite' });
          const A = Gf.vizinhos(TORNEIO);
          const soma = Object.values(A).reduce((s, x) => s + x.length, 0);
          const pinta = (v) => {
            const no = {}, aresta = {}, rot = {};
            Object.keys(A).forEach((x) => (rot[x] = `d = ${A[x].length}`));
            if (v) { no[v] = 'atual'; A[v].forEach(([u]) => { no[u] = 'sel'; aresta[Gf.chave(TORNEIO, v, u)] = 'arvore'; }); }
            const svg = Gf.desenha(fig, TORNEIO, { no, aresta, rot });
            svg.querySelectorAll('.no').forEach((g) => {
              g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', `Turma ${g.dataset.id}`);
              g.addEventListener('click', () => pinta(g.dataset.id));
              g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pinta(g.dataset.id); } });
            });
            info.innerHTML = v ? `<b>N(${v}) = {${A[v].map((x) => x[0]).join(', ')}}</b>, então d(${v}) = ${A[v].length}. N[${v}] = {${[v, ...A[v].map((x) => x[0])].sort().join(', ')}}.`
              : 'Clique em uma turma.';
          };
          el.append(h('div', { class: 'lab' }, fig, info, h('p', {}, `Soma dos graus = ${Object.keys(A).map((x) => A[x].length).join(' + ')} = ${soma} = 2 × ${TORNEIO.arestas.length} arestas.`)));
          pinta('7B');
        } },
      { t: 'O mesmo grafo em três representações', d: P('Um grafo com cinco vértices e sete arestas, numeradas de e1 a e7.'),
        mount(el) {
          const ar = { 'u-y': 'e1', 'u-v': 'e2', 'v-w': 'e3', 'w-y': 'e4', 'w-x': 'e5', 'x-y': 'e6', 'v-y': 'e7' };
          const fig = h('div', { class: 'lab-fig' });
          Gf.desenha(fig, REPR, { rotAresta: ar }, { rotulo: 'Grafo com vértices u, v, w, x, y' });
          const V = ['u', 'v', 'w', 'x', 'y'], A = Gf.vizinhos(REPR);
          const liga = (a, b) => A[a].some(([z]) => z === b);
          const lista = V.map((v) => [v, A[v].map((x) => x[0]).join(', ')]);
          const mat = V.map((a) => [a, ...V.map((b) => (liga(a, b) ? '1' : '0'))]);
          const nomes = Object.entries(ar).sort((a, b) => a[1].localeCompare(b[1], 'pt', { numeric: true }));
          const inc = V.map((v) => [v, ...nomes.map(([k]) => (k.split('-').includes(v) ? '1' : '0'))]);
          const caixa = (t, cab, l) => h('div', { class: 'repr' }, h('h3', {}, t), window.UI.tabelaEl(cab, l));
          el.append(h('div', { class: 'lab' }, fig, h('div', { class: 'repr-grade' },
            caixa('Lista de adjacência', ['Vértice', 'Adjacentes'], lista),
            caixa('Matriz de adjacência', ['', ...V], mat),
            caixa('Matriz de incidência', ['', ...nomes.map((x) => x[1])], inc))));
        },
        depois: P('Repare: a matriz de adjacência é simétrica (grafo não direcionado), cada coluna da matriz de incidência tem exatamente dois 1 (as duas pontas da aresta) e a soma de cada linha da incidência é o grau do vértice.') },
    ],
    atividades: [
      { t: 'Passeio, trilha, caminho ou ciclo?', tipo: 'classificar',
        d: P('No quadrado A–B–C–D com a diagonal A–C, classifique cada sequência de vértices.') + fig(QUADRADO, {}, { rotulo: 'Quadrado ABCD com diagonal AC' }),
        cfg: { cats: ['Passeio', 'Trilha', 'Caminho', 'Ciclo'], itens: [
          { t: 'A, B, C, D', c: 2, e: 'Nenhum vértice nem aresta se repete e não volta ao início.' },
          { t: 'A, B, C, A', c: 3, e: 'Volta ao início sem repetir aresta nem outro vértice: ciclo de comprimento 3.' },
          { t: 'A, B, C, A, D', c: 1, e: 'As arestas são todas diferentes, mas o vértice A aparece duas vezes: trilha.' },
          { t: 'A, B, A, D', c: 0, e: 'A aresta A–B é usada duas vezes: só pode ser passeio.' },
          { t: 'A, C, B, A, D, C', c: 1, e: 'Cinco arestas diferentes (A–C, C–B, B–A, A–D, D–C), com A e C repetidos: trilha.' },
        ] } },
      { t: 'Matriz ou lista?', tipo: 'classificar',
        d: P('Para cada situação, qual representação é a escolha mais adequada?'),
        cfg: { cats: ['Matriz de adjacência', 'Lista de adjacência'], itens: [
          { t: 'Rede social com 10⁶ usuários, 200 amigos em média, e a operação principal é listar os amigos de alguém.', c: 1, e: 'Grafo esparso: a lista ocupa Θ(n + m) e lista os vizinhos em Θ(d(u)). A matriz teria 10¹² posições.' },
          { t: 'Grafo pequeno e denso, com milhões de consultas do tipo “u e v estão ligados?”.', c: 0, e: 'Teste de adjacência em Θ(1) é a vantagem da matriz, e o espaço Θ(n²) não pesa num grafo pequeno.' },
          { t: 'Rodar BFS em um mapa de ruas com 500 mil esquinas.', c: 1, e: 'Com lista, a BFS custa Θ(n + m); com matriz, Θ(n²).' },
          { t: 'Grafo completo K₃₀₀ em que o algoritmo consulta o peso de pares (i, j) a todo momento.', c: 0, e: 'Num grafo completo m ≈ n², então a matriz não desperdiça espaço e o acesso a (i, j) é direto.' },
        ] } },
    ],
    desafios: [
      { fonte: 'ENADE 2005 · Questão 44', enun:
        P('Deseja-se supervisionar as redes de comunicação de dados de um conjunto de empresas. Cada empresa tem a sua própria rede, que é independente das redes das outras empresas e é constituída de ramos de fibra óptica. Cada ramo conecta duas filiais distintas (ponto-a-ponto) da empresa. Há, no máximo, um ramo de fibra interligando diretamente um mesmo par de filiais. A comunicação entre duas filiais pode ser feita diretamente por um ramo de fibra que as interliga, se este existir, ou, indiretamente, por meio de uma seqüência de ramos e filiais. A rede de cada empresa permite a comunicação entre todas as suas filiais. A tabela abaixo apresenta algumas informações acerca das redes dessas empresas.') +
        tabela(['empresa', 'n.º de filiais', 'número de ramos de fibra entre filiais'], [['E1', '9', '18'], ['E2', '10', '45'], ['E3', '14', '13'], ['E4', '8', '24']]) +
        P('Com relação à situação apresentada acima, é correto deduzir que,') +
        '<ol class="enun-afirm"><li>I. no caso da empresa E1, a falha de um ramo de rede certamente fará que, ao menos, uma filial não possa mais comunicar-se diretamente com todas as outras filiais da empresa.</li><li>II. na rede da empresa E2, a introdução de um novo ramo de rede certamente violará a informação de que há somente um par de fibras entre duas filiais.</li><li>III. no caso da empresa E3, a falha de um único ramo de rede certamente fará que, ao menos, uma filial não possa mais comunicar-se, direta ou indiretamente, com todas as outras filiais da empresa.</li><li>IV. na rede da empresa E4, todas as filiais da empresa comunicam-se entre si diretamente.</li></ol>' +
        P('Estão certos apenas os itens'),
        opts: ['I e II.', 'I e IV.', 'II e III.', 'II e IV.', 'III e IV.'], c: 2,
        e: 'Filiais são vértices, ramos são arestas, e toda rede é conexa. E2: 45 = 10 · 9/2, então a rede já é o completo K<sub>10</sub> e não cabe ramo novo sem repetir um par (II certo). E3: 13 = 14 − 1 arestas e conexa, então é uma árvore, e toda aresta de árvore é ponte (III certo). E1: com 18 ramos para 9 filiais, bem mais que n − 1 = 8, a rede tem ciclos; e a comunicação direta com todas já não existia antes da falha, pois o K<sub>9</sub> teria 36 ramos (I errado). E4: 24 &lt; 28 = 8 · 7/2, faltam ligações diretas (IV errado).' },
      { fonte: 'ENADE 2011 · Questão 20', enun:
        P('Considere que G é um grafo qualquer e que V e E são os conjuntos de vértices e de arestas de G, respectivamente. Considere também que grau (v) é o grau de um vértice v pertencente ao conjunto V. Nesse contexto, analise as seguintes asserções.',
          'Em G, a quantidade de vértices com grau ímpar é ímpar.') +
        '<p class="porque">PORQUE</p>' +
        P('Para G, vale a identidade dada pela expressão') + '<div class="formula"><span>Σ<sub>v ∈ V</sub> grau(v) = 2|E|</span></div>' +
        P('Acerca dessas asserções, assinale a opção correta.'),
        opts: ['As duas asserções são proposições verdadeiras, e a segunda é uma justificativa correta da primeira.',
          'As duas asserções são proposições verdadeiras, mas a segunda não é uma justificativa correta da primeira.',
          'A primeira asserção é uma proposição verdadeira, e a segunda uma proposição falsa.',
          'A primeira asserção é uma proposição falsa, e a segunda uma proposição verdadeira.',
          'Tanto a primeira quanto a segunda asserções são proposições falsas.'], c: 3,
        e: 'A segunda é o teorema da soma dos graus, verdadeiro. E é justamente ela que derruba a primeira: como a soma dos graus é par, a quantidade de vértices de grau ímpar é sempre <b>par</b>. A armadilha é marcar A só porque a segunda parece explicar a primeira.',
        w: { 0: 'A segunda asserção é verdadeira, mas prova o contrário da primeira. Julgue cada asserção sozinha antes de olhar a relação entre elas.' } },
      { fonte: 'Inédita · soma dos graus', enun:
        P('Um projetista quer ligar 9 roteadores de modo que cada um tenha exatamente 3 enlaces diretos com outros roteadores, sem enlaces repetidos. Sobre esse projeto, é correto afirmar que'),
        opts: ['ele precisa de exatamente 27 enlaces.', 'ele precisa de 13 enlaces e meio, arredondados para 14.',
          'ele é impossível, porque a soma dos graus seria ímpar.', 'ele precisa de 12 enlaces, porque o grafo é uma árvore.'], c: 2,
        e: 'A soma dos graus seria 9 × 3 = 27. Mas a soma dos graus é sempre 2m, um número par. Nenhum grafo tem 9 vértices de grau 3 (seria um número ímpar de vértices de grau ímpar).',
        w: { 0: '27 é a soma dos graus, e cada enlace entra duas vezes nessa soma.', 1: 'Número de arestas é inteiro. Quando a conta dá fração, o projeto é que é impossível.' } },
      { fonte: 'Inédita · representações e complexidade', enun:
        P('Um grafo tem n = 10.000 vértices e m = 30.000 arestas e está armazenado em lista de adjacência. Assinale a alternativa correta.'),
        opts: ['A lista ocupa espaço Θ(n²), como a matriz.', 'Trocar para matriz de adjacência deixaria a BFS mais rápida, em Θ(n).', 'Testar se dois vértices são adjacentes custa Θ(1) no pior caso.', 'Uma busca em largura no grafo todo custa Θ(n + m).'], c: 3,
        e: 'Com lista, cada vértice entra uma vez na fila e cada lista de adjacência é percorrida uma vez: Θ(n + m). Teste de adjacência em Θ(1) é vantagem da matriz; com matriz, a BFS custa Θ(n²), porque percorrer os vizinhos de um vértice custa Θ(n).' },
      { fonte: 'Inédita · bipartido', enun:
        P('Em um campeonato de duas divisões, todo jogo é disputado entre um time da série A e um time da série B; nunca entre dois times da mesma série. O grafo em que os vértices são os times e as arestas são os jogos realizados é necessariamente'),
        opts: ['completo.', 'bipartido.', 'uma árvore.', 'regular.'], c: 1,
        e: 'As séries A e B formam a partição V<sub>1</sub>, V<sub>2</sub>: toda aresta liga um time de cada lado. Por isso o grafo não tem ciclo ímpar e pode ser pintado com 2 cores. Não precisa ser completo (nem todos jogaram contra todos), nem árvore, nem regular.' },
      { fonte: 'Inédita · componentes conexas', enun:
        P('Em um jogo de viagens espaciais, as rotas possíveis são Terra–Mercúrio, Plutão–Vênus, Terra–Plutão, Plutão–Mercúrio, Mercúrio–Vênus, Urano–Netuno, Netuno–Saturno, Saturno–Júpiter, Júpiter–Marte e Marte–Urano. Não é possível viajar da Terra para Marte porque'),
        opts: ['Terra e Marte estão em componentes conexas diferentes.', 'o grafo é direcionado e as rotas têm um único sentido.', 'não existe uma rota direta entre Terra e Marte.', 'o grafo tem ciclos, e a viagem ficaria presa num deles.'], c: 0,
        e: 'O grafo tem duas componentes: {Terra, Mercúrio, Plutão, Vênus} e {Urano, Netuno, Saturno, Júpiter, Marte}. Não há caminho entre vértices de componentes diferentes. A falta de aresta direta, sozinha, não impediria a viagem: poderia haver escalas.',
        w: { 2: 'Sem aresta direta ainda poderia existir um caminho com escalas. O que impede é estarem em componentes diferentes.' } },
    ],
  });
})();
