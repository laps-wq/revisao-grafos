/* Módulo 2 · Buscas em largura e em profundidade, ordenação topológica e caminho crítico */
(function () {
  const { P, dica, armadilha, nota, lista, codigo, tabela } = window.UI;
  const Gf = window.Grafos;
  const fig = (G, est = {}, op = {}) => { const d = document.createElement('div'); Gf.desenha(d, G, est, op); return `<div class="fig-estatica">${d.innerHTML}</div>`; };

  const GRAFO_BFS = { nos: { A: [40, 2], B: [10, 26], C: [40, 26], D: [70, 26], E: [22, 50], F: [58, 50], G: [58, 74] },
    arestas: [['A', 'B'], ['A', 'C'], ['A', 'D'], ['B', 'E'], ['C', 'E'], ['C', 'F'], ['D', 'F'], ['F', 'G']] };
  const GUIADO = { nos: { v1: [10, 25], v2: [35, 5], v3: [35, 45], v4: [60, 25], v5: [85, 5], v6: [85, 45] },
    arestas: [['v1', 'v2'], ['v1', 'v3'], ['v2', 'v4'], ['v3', 'v4'], ['v4', 'v5'], ['v4', 'v6'], ['v5', 'v6']] };
  const DISC = { dirigido: true, nos: { P1: [5, 10], MD: [5, 50], P2: [28, 10], LC: [40, 62], ED: [52, 10], TG: [72, 34], BD: [76, 0], IA: [95, 54] },
    arestas: [['P1', 'P2'], ['P2', 'ED'], ['ED', 'TG'], ['MD', 'TG'], ['ED', 'BD'], ['MD', 'LC'], ['TG', 'IA'], ['LC', 'IA']] };
  const PROJ = { dirigido: true, nos: { A: [0, 25], B: [22, 25], C: [48, 4], D: [48, 46], E: [75, 25], F: [102, 4], G: [102, 46], H: [126, 25] },
    arestas: [['A', 'B', 3], ['B', 'C', 2], ['B', 'E', 1], ['B', 'D', 4], ['C', 'F', 5], ['C', 'E', 3], ['D', 'E', 5], ['D', 'G', 1], ['E', 'F', 2], ['E', 'H', 5], ['E', 'G', 3], ['F', 'H', 4], ['G', 'H', 3]] };
  const Q_BFS = { nos: { S: [5, 30], A: [28, 8], B: [28, 52], C: [52, 30], D: [75, 8], E: [75, 52], F: [96, 30] },
    arestas: [['S', 'A'], ['S', 'B'], ['A', 'C'], ['B', 'C'], ['A', 'D'], ['C', 'E'], ['D', 'F'], ['E', 'F']] };

  window.MODULOS.push({
    id: 'buscas',
    curto: 'BFS e DFS',
    titulo: 'Buscas em largura (BFS) e em profundidade (DFS)',
    grupo: 'Base',
    enade: 'ENADE 2008 (questões 14 e 73), nos desafios · ENADE 2017 (discursiva 5), no módulo da discursiva',
    resumo: 'Como visitar todos os vértices de um grafo: fila e camadas na BFS, pilha e retrocesso na DFS. E dois usos de grafos dirigidos acíclicos: ordenação topológica e caminho crítico.',
    topicos: [
      { t: 'Para que servem as buscas', h:
        P('Buscar é visitar sistematicamente os vértices a partir de uma origem. Os dois algoritmos básicos, a busca em largura e a busca em profundidade, são a base de quase tudo que vem depois: caminho mínimo, componentes conexas, detecção de ciclos, ordenação topológica, labirintos.',
          'Uma forma comum de descrever as buscas usa três estados para cada vértice:') +
        tabela(['Estado', 'Significado'], [['NAO_VISITADO', 'a busca ainda não o encontrou'], ['VISITADO', 'a busca o encontrou, mas ainda não olhou todos os seus vizinhos'], ['ENCERRADO', 'a busca o encontrou e já olhou todos os vizinhos']]) },
      { t: 'Busca em largura (BFS)', h:
        P('Proposta por Moore (1959) e desenvolvida por Lee (1961). A partir da origem, visita primeiro <b>todos</b> os vizinhos, depois os vizinhos dos vizinhos, e assim por diante: explora em <b>camadas</b>. Usa uma <b>fila</b> (FIFO): quem é descoberto primeiro é explorado primeiro.') +
        codigo(['BFS(s):', '    estado(s) = VISITADO;  d(s) = 0', '    Q = fila vazia;  insere s no fim de Q', '    enquanto Q não estiver vazia:', '        vi = remove o início de Q',
          '        para cada vj adjacente a vi:', '            se estado(vj) = NAO_VISITADO:', '                estado(vj) = VISITADO', '                d(vj) = d(vi) + 1', '                p(vj) = vi',
          '                insere vj no fim de Q', '        estado(vi) = ENCERRADO'], 'Busca em largura') +
        lista(['d(v) é o <b>menor número de arestas</b> de s até v. A BFS não soma pesos: conta saltos.', 'p(v) é o predecessor. Guardar só o pai cabe num vetor: é o <b>vetor de roteamento</b> R(G), que descreve a árvore de busca em largura.']) +
        armadilha('“A BFS encontra o caminho mínimo” só vale quando todas as arestas têm o mesmo peso (ou não têm peso). Com pesos diferentes, quem resolve é o Dijkstra.') },
      { t: 'Busca em profundidade (DFS)', h:
        P('Idealizada por Trémaux no século XIX para sair de labirintos. A partir do vértice atual, segue o primeiro vizinho ainda não visitado e vai até o fim do caminho; quando não há para onde ir, <b>volta</b> (backtracking) e tenta outro ramo. Usa <b>pilha</b>, explícita ou pela recursão (LIFO).') +
        codigo(['VisitaVertice(vi):', '    tempo = tempo + 1', '    estado(vi) = VISITADO;  t(vi) = tempo', '    para cada vj adjacente a vi:', '        se estado(vj) = NAO_VISITADO:',
          '            p(vj) = vi', '            VisitaVertice(vj)', '    estado(vi) = ENCERRADO', '    tempo = tempo + 1'], 'Busca em profundidade, recursiva') +
        P('Cada vértice ganha um tempo de <b>descoberta</b> d(v) e de <b>término</b> f(v). Nem sempre a DFS alcança o grafo todo a partir de um vértice: num grafo desconexo, é preciso recomeçar de um vértice ainda não visitado.') },
      { t: 'Duas versões da DFS, duas ordens', h:
        P('No grafo A–B, A–C, A–D, B–E, C–E, C–F, D–F, F–G, duas implementações comuns dão ordens diferentes, e as duas são DFS:') +
        tabela(['Versão', 'Como escolhe o próximo', 'Ordem a partir de A'], [
          ['Recursiva, vizinhos em ordem crescente', 'desce pelo menor vizinho ainda não visitado', 'A, B, E, C, F, D, G'],
          ['Iterativa com pilha', 'empilha todos os vizinhos do vértice explorado e segue pelo topo', 'A, D, F, G, C, E, B'],
        ]) +
        nota('Na prova, o enunciado costuma fixar a ordem dos vizinhos. Na discursiva 5 do ENADE 2017, a ordem era alfabética, e o padrão de resposta aceitou quatro sequências, uma para cada versão do algoritmo (veja o módulo da discursiva). O que não muda: a DFS vai fundo antes de voltar, e a BFS termina cada camada antes de passar para a próxima.') },
      { t: 'Classificação das arestas na DFS', h:
        lista(['<b>De árvore:</b> usadas para chegar a um vértice pela primeira vez.', '<b>De retorno:</b> ligam um vértice a um antecessor ainda aberto na árvore. Em grafo não dirigido, encontrar uma aresta de retorno significa que há <b>ciclo</b>.',
          '<b>De avanço:</b> fora da árvore, ligam um vértice a um descendente (aparecem em dígrafos).', '<b>De cruzamento:</b> ligam vértices que não são antecessor nem descendente um do outro.']) +
        P('Na DFS guiada da aba Exemplos, as arestas de retorno são v3–v1 e v6–v4: cada uma fecha um ciclo.') },
      { t: 'BFS × DFS', h:
        tabela(['', 'BFS', 'DFS'], [
          ['Estrutura', 'fila (FIFO)', 'pilha ou recursão (LIFO)'],
          ['Como explora', 'por camadas, a partir da origem', 'até o fim de um caminho, depois volta'],
          ['Garante', 'menor número de arestas até cada vértice', 'visita tudo o que alcança, não o caminho mais curto'],
          ['Serve para', 'distância em saltos, bipartição, labirintos sem peso', 'ciclos, componentes, ordenação topológica'],
          ['Custo com lista', 'Θ(n + m)', 'Θ(n + m)'],
          ['Custo com matriz', 'Θ(n²)', 'Θ(n²)'],
        ]) },
      { t: 'Ordenação topológica', h:
        P('Num grafo <b>dirigido acíclico</b> (DAG), como pré-requisitos de disciplinas ou etapas de um projeto, uma ordenação topológica é uma ordem dos vértices em que todo arco u → v tem u antes de v.') +
        lista(['<b>Pelo grau de entrada (Kahn):</b> coloque numa fila os vértices sem predecessores; ao retirar um, apague seus arcos de saída; quem ficar com grau de entrada 0 entra na fila.',
          '<b>Pela DFS:</b> a ordem decrescente dos tempos de término f(v) é uma ordenação topológica.',
          'Existe ordenação topológica <b>se, e somente se,</b> o grafo não tem ciclo. Um ciclo deixa vértices que nunca chegam a grau de entrada 0.']) +
        fig(DISC, {}, { rotulo: 'Pré-requisitos de disciplinas' }) +
        P('<small>Pré-requisitos: P1, P2 Programação 1 e 2 · MD Matemática Discreta · ED Estruturas de Dados · LC Lógica · TG Teoria dos Grafos · BD Banco de Dados · IA Inteligência Artificial.</small>') +
        dica('Com várias disciplinas por semestre, o número mínimo de semestres é o número de vértices do caminho mais longo do DAG. Aqui, P1 → P2 → ED → TG → IA: 5 semestres.') },
      { t: 'Caminho crítico: o caminho mais longo de um DAG', h:
        P('Num projeto, os vértices são eventos, os arcos são atividades e o peso é a duração. Seguindo a ordenação topológica, o <b>tempo mais cedo</b> de cada evento é o <b>maior</b> caminho até ele: um evento só acontece quando todas as atividades que chegam nele terminaram.') +
        `<div class="formula"><span>cedo(v) = máx { cedo(u) + duração(u, v) : u → v }</span><small>a duração do projeto é o tempo mais cedo do evento final</small></div>` +
        lista(['<b>Caminho crítico:</b> o caminho mais longo do início ao fim. Atrasar uma atividade dele atrasa o projeto inteiro.', '<b>Folga</b> de uma atividade: quanto ela pode atrasar sem atrasar o projeto. Atividades críticas têm folga zero.', 'Para <b>encurtar</b> o projeto em uma unidade, é preciso encurtar <b>todos</b> os caminhos críticos ao mesmo tempo. É o que a questão 73 do ENADE 2008 cobra, nos desafios.']) +
        armadilha('Caminho mais longo em grafo qualquer é um problema difícil (NP-difícil). Num DAG, ele é fácil: basta percorrer os vértices em ordem topológica, em O(n + m).') },
    ],
    exemplos: [
      { t: 'BFS a partir de A', d: P('Acompanhe a fila: sai sempre quem está no início, e os vizinhos novos entram no fim. O número perto de cada vértice é d(v).'),
        mount(el) { Gf.passoAPasso(el, GRAFO_BFS, Gf.bfs(GRAFO_BFS, 'A')); } },
      { t: 'DFS guiada', d: P('Vizinhos em ordem crescente. Os números são descoberta/término. Tracejado: aresta de retorno.'),
        mount(el) { Gf.passoAPasso(el, GUIADO, Gf.dfs(GUIADO, 'v1')); },
        depois: P('Resultado: sequência v1, v2, v4, v3, v5, v6; d/f: v1 0/11 · v2 1/10 · v4 2/9 · v3 3/4 · v5 5/8 · v6 6/7; retorno em v3–v1 e v6–v4. A BFS, para comparar, daria v1, v2, v3, v4, v5, v6.') },
      { t: 'Ordenação topológica dos pré-requisitos (Kahn)', d: P('Os números são os graus de entrada que ainda faltam. Quando um vértice chega a 0, ele entra na fila.'),
        mount(el) { Gf.passoAPasso(el, DISC, Gf.kahn(DISC)); } },
    ],
    atividades: [
      { t: 'BFS ou DFS?', tipo: 'classificar', d: P('Qual busca é a mais indicada para cada tarefa?'),
        cfg: { cats: ['BFS', 'DFS'], itens: [
          { t: 'Menor número de conexões entre duas pessoas numa rede social.', c: 0, e: 'Distância em número de arestas é exatamente o que a BFS calcula, camada por camada.' },
          { t: 'Descobrir se um grafo não dirigido tem ciclo.', c: 1, e: 'Uma aresta de retorno na DFS indica ciclo.' },
          { t: 'Saída de um labirinto com o menor número de passos.', c: 0, e: 'Sem pesos, a BFS garante o menor caminho. A DFS acha uma saída, não necessariamente a mais curta.' },
          { t: 'Ordem topológica das etapas de um projeto.', c: 1, e: 'A ordem decrescente de término da DFS é uma ordenação topológica (o algoritmo de Kahn é a alternativa).' },
          { t: 'Testar se um grafo é bipartido, pintando camadas alternadas.', c: 0, e: 'Pinte as camadas pares de uma cor e as ímpares de outra: se surgir aresta dentro de uma camada, há ciclo ímpar.' },
        ] } },
      { t: 'Simule à mão', tipo: 'qa', itens: [
        { q: 'No grafo do exemplo de BFS (A–B, A–C, A–D, B–E, C–E, C–F, D–F, F–G), qual a distância d(A, G) calculada pela BFS? Por qual caminho?', a: P('d(A, G) = 3. A BFS chega em F pela camada 2 (via C) e em G pela camada 3: A → C → F → G.') },
        { q: 'No mesmo grafo, quais arestas <b>não</b> entram na árvore de busca em largura a partir de A?', a: P('A árvore usa A–B, A–C, A–D, B–E, C–F e F–G. Ficam de fora C–E (E já foi descoberto por B) e D–F (F já foi descoberto por C).') },
        { q: 'No grafo da DFS guiada, por que v3 é descoberto só no tempo 3, se ele é vizinho de v1?', a: P('Porque a DFS desce pelo menor vizinho primeiro: de v1 vai para v2, de v2 para v4, e só de v4 chega em v3. Quando volta a v1, v3 já está encerrado.') },
        { q: 'Se acrescentarmos o arco IA → P1 no grafo de pré-requisitos, ainda existe ordenação topológica?', a: P('Não. P1 → P2 → ED → TG → IA → P1 vira um ciclo, e nenhum desses vértices chega a grau de entrada 0.') },
      ] },
    ],
    desafios: [
      { fonte: 'ENADE 2008 · Questão 14', enun:
        P('Um programador propôs um algoritmo não-recursivo para o percurso em preordem de uma árvore binária com as seguintes características.') +
        lista(['Cada nó da árvore binária é representado por um registro com três campos: <code>chave</code>, que armazena seu identificador; <code>esq</code> e <code>dir</code>, ponteiros para os filhos esquerdo e direito, respectivamente.', 'O algoritmo deve ser invocado inicialmente tomando o ponteiro para o nó raiz da árvore binária como argumento.', 'O algoritmo utiliza <code>push()</code> e <code>pop()</code> como funções auxiliares de empilhamento e desempilhamento de ponteiros para nós de árvore binária, respectivamente.']) +
        P('A seguir, está apresentado o algoritmo proposto, em que λ representa o ponteiro nulo.') +
        codigo(['Procedimento preordem (ptraiz : PtrNoArvBin)', '  Var ptr : PtrNoArvBin;', '  ptr := ptraiz;', '  Enquanto (ptr ≠ λ) Faça', '    escreva (ptr↑.chave);', '    Se (ptr↑.dir ≠ λ) Então', '      push(ptr↑.dir);', '    Se (ptr↑.esq ≠ λ) Então', '      push(ptr↑.esq);', '    ptr := pop();', '  Fim_Enquanto', 'Fim_Procedimento']) +
        P('Com base nessas informações e supondo que a raiz de uma árvore binária com <i>n</i> nós seja passada ao procedimento <code>preordem()</code>, julgue os itens seguintes.') +
        '<ol class="enun-afirm"><li>I. O algoritmo visita cada nó da árvore binária exatamente uma vez ao longo do percurso.</li><li>II. O algoritmo só funcionará corretamente se o procedimento <code>pop()</code> for projetado de forma a retornar λ caso a pilha esteja vazia.</li><li>III. Empilhar e desempilhar ponteiros para nós da árvore são operações que podem ser implementadas com custo constante.</li><li>IV. A complexidade do pior caso para o procedimento <code>preordem()</code> é O(n).</li></ol>' +
        P('Assinale a opção correta.'),
        opts: ['Apenas um item está certo.', 'Apenas os itens I e IV estão certos.', 'Apenas os itens I, II e III estão certos.', 'Apenas os itens II, III e IV estão certos.', 'Todos os itens estão certos.'], c: 4,
        e: 'É a DFS iterativa com pilha: empilha primeiro o filho direito e depois o esquerdo, para que o esquerdo saia antes (pré-ordem: raiz, esquerda, direita). I: numa árvore cada nó é empilhado uma única vez, pelo pai. II: o laço termina quando <code>ptr</code> vira λ, então <code>pop()</code> precisa devolver λ com a pilha vazia. III: push e pop custam O(1). IV: cada nó é escrito, empilhado e desempilhado uma vez: O(n).',
        w: { 1: 'II e III também estão certos: sem pop() devolvendo λ o laço não para, e operações de pilha são O(1).' } },
      { fonte: 'ENADE 2008 · Questão 73', enun:
        P('Uma das técnicas que auxiliam na gerência de projetos de <i>software</i> é o gráfico de atividades, por meio do qual é possível calcular, por exemplo, a duração de um projeto, as atividades críticas e as atividades que possuem folga para sua execução. Nesse gráfico, os círculos representam os eventos iniciais e finais de cada atividade, as arestas representam as atividades, e os números associados às arestas representam a duração dessas atividades.') +
        fig(PROJ, {}, { rotulo: 'Gráfico de atividades de A até H' }) +
        tabela(['atividade', 'unidades de aceleração permitidas', 'custo de aceleração por unidade de tempo (R$)'], [['C-F', '2', '50'], ['D-E', '1', '300'], ['E-F', '2', '100'], ['E-G', '1', '80'], ['E-H', '2', '75'], ['F-H', '2', '85']]) +
        P('Considerando-se o gráfico de atividades acima e a tabela de custo de aceleração das atividades da rede que podem ser aceleradas, qual(is) atividade(s) deve(m) ser acelerada(s) para que o tempo do projeto associado a esse gráfico seja reduzido em uma unidade de tempo e para que o custo total de aceleração seja o menor possível?'),
        opts: ['apenas a atividade (C-F)', 'apenas as atividades (D-E) e (E-G)', 'apenas a atividade (E-G)', 'apenas as atividades (E-G) e (F-H)', 'apenas a atividade (E-H)'], c: 3,
        e: 'Tempos mais cedo, em ordem topológica: B 3, C 5, D 7, E = máx(3 + 1, 5 + 3, 7 + 5) = 12, F = máx(5 + 5, 12 + 2) = 14, G = máx(7 + 1, 12 + 3) = 15, H = máx(12 + 5, 14 + 4, 15 + 3) = 18. Há <b>dois</b> caminhos críticos de 18: A-B-D-E-F-H e A-B-D-E-G-H (E-H soma 17 e tem folga). Para o projeto cair para 17, os dois precisam encurtar: D-E sozinho custa R$ 300; E-G mais F-H, R$ 80 + R$ 85 = R$ 165; E-G mais E-F, R$ 180. O mais barato é E-G e F-H.',
        w: { 2: 'Acelerar só E-G deixa o caminho A-B-D-E-F-H com 18: o projeto não encurta.', 0: 'C-F não está em nenhum caminho crítico.', 1: 'D-E sozinho já reduz os dois caminhos; somar E-G só aumenta o custo (R$ 380).' } },
      { fonte: 'Inédita · BFS', enun: P('Aplica-se a busca em largura a partir de S no grafo a seguir, visitando os vizinhos em ordem alfabética.') + fig(Q_BFS) + P('Assinale a alternativa correta.'),
        opts: ['A ordem de visita é S, A, C, B, D, E, F.', 'A ordem de visita é S, A, B, C, D, E, F, e d(S, F) = 3.', 'd(S, F) = 4, pois o caminho S–A–C–E–F tem 4 arestas.', 'C é visitado antes de B, porque é vizinho de A.'], c: 1,
        e: 'Camada 1: A e B (vizinhos de S). Camada 2: C e D (A traz C e D; B traria C, que já está). Camada 3: E (de C) e F (de D). Ordem S, A, B, C, D, E, F, e F está a 3 arestas: S–A–D–F.',
        w: { 0: 'S, A, C… é a ordem de uma DFS, que desce antes de terminar a camada.', 2: 'Existe um caminho mais curto, S–A–D–F, com 3 arestas: é ele que a BFS encontra.' } },
      { fonte: 'Inédita · labirinto', enun: P('Em um labirinto representado por uma grade, em que cada passo custa o mesmo, deseja-se encontrar a saída com o menor número de passos. A estratégia adequada é'),
        opts: ['a busca em profundidade, porque usa pilha e gasta menos memória.', 'qualquer uma das duas, porque ambas devolvem o caminho mais curto.', 'a busca em profundidade, porque visita todas as células antes de parar.', 'a busca em largura, porque explora em camadas de distância crescente a partir da entrada.'], c: 3,
        e: 'Com custo igual em todos os passos, a BFS encontra a saída pela menor camada possível. No labirinto do módulo de A*, a DFS acha um caminho de 10 passos; a BFS, o de 8.' },
      { fonte: 'Inédita · DFS com pilha', enun: P('Considere a versão iterativa da DFS: ao explorar um vértice, empilham-se os seus vizinhos ainda não visitados, em ordem alfabética, e o próximo a ser explorado é sempre o do topo da pilha. No grafo com arestas S–A, S–B, A–C, B–C, C–D, a partir de S, a ordem de exploração é'),
        opts: ['S, A, B, C, D.', 'S, A, C, B, D.', 'S, B, C, D, A.', 'S, B, A, C, D.'], c: 2,
        e: 'S empilha A e B (B fica no topo). Explora B, que empilha C. Explora C, que empilha D (A já está na pilha). Explora D. Por último, A. Ordem: S, B, C, D, A.',
        w: { 0: 'S, A, B, C, D é a ordem da BFS.', 1: 'Essa é a DFS recursiva com vizinhos em ordem crescente. Na versão com pilha, o último empilhado sai primeiro.' } },
      { fonte: 'Inédita · arestas de retorno', enun: P('Durante uma busca em profundidade em um grafo não dirigido, encontra-se uma aresta que liga o vértice atual a um antecessor que ainda está aberto (VISITADO), diferente do seu pai na árvore. Isso indica que'),
        opts: ['o grafo tem um ciclo.', 'o grafo é bipartido.', 'o grafo é desconexo.', 'a busca em largura produziria a mesma árvore.'], c: 0,
        e: 'É uma aresta de retorno: junto com o caminho da árvore entre o antecessor e o vértice atual, ela fecha um ciclo. Em grafos não dirigidos, ter aresta de retorno equivale a ter ciclo.' },
      { fonte: 'Inédita · complexidade', enun: P('Um grafo esparso, com n vértices e m arestas, está armazenado em matriz de adjacência. A busca em largura sobre ele custa'),
        opts: ['Θ(n + m), como na lista de adjacência.', 'Θ(n · m), porque cada aresta é testada para cada vértice.', 'Θ(m log n), por causa da fila.', 'Θ(n²), porque encontrar os vizinhos de cada vértice exige percorrer uma linha inteira da matriz.'], c: 3,
        e: 'Com matriz, listar os vizinhos de um vértice custa Θ(n), e isso é feito para os n vértices: Θ(n²). Com lista, o custo cai para Θ(n + m). A fila da BFS é simples, com inserção e remoção em Θ(1).' },
      { fonte: 'Inédita · ordenação topológica', enun: P('O grafo de pré-requisitos do conteúdo deste módulo tem os arcos P1 → P2, P2 → ED, ED → TG, MD → TG, ED → BD, MD → LC, TG → IA e LC → IA. Avalie as afirmações.') +
        '<ol class="enun-afirm"><li>I. A sequência P1, P2, MD, ED, TG, LC, BD, IA respeita todos os pré-requisitos.</li><li>II. Podendo cursar várias disciplinas por semestre, são necessários, no mínimo, 5 semestres.</li><li>III. Se fosse incluído o pré-requisito IA → P1, ainda existiria uma ordenação topológica.</li></ol>' + P('É correto o que se afirma em'),
        opts: ['I, apenas.', 'III, apenas.', 'I e II, apenas.', 'II e III, apenas.'], c: 2,
        e: 'I: todo arco vai de um vértice que aparece antes para um que aparece depois. II: o caminho mais longo, P1 → P2 → ED → TG → IA, tem 5 vértices. III: IA → P1 fecharia o ciclo P1 → P2 → ED → TG → IA → P1, e grafo com ciclo não tem ordenação topológica.' },
    ],
  });
})();
