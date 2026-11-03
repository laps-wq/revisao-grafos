/* aulas.js — lista dos slides do semestre, mostrada na página #aulas.
   Para acrescentar uma aula: copie o arquivo para a pasta aulas/ e inclua uma linha aqui.
   tema agrupa as aulas na página; mod é o id do módulo de revisão relacionado (ou null). */
window.AULAS = [
  { n: '01', tit: 'Introdução à Teoria dos Grafos', desc: 'As pontes de Königsberg, onde os grafos aparecem (logística, redes, IA) e a definição de grafo.', arq: 'aulas/aula-01-introducao.pdf', pags: 20, kb: 776, tema: 'Fundamentos', mod: 'fundamentos' },
  { n: '02', tit: 'Conceitos fundamentais', desc: 'Notação, tipos de grafo (multigrafo, pseudografo, hipergrafo), grau, isomorfismo e conexidade.', arq: 'aulas/aula-02-conceitos-fundamentais.pdf', pags: 25, kb: 948, tema: 'Fundamentos', mod: 'fundamentos' },
  { n: '03', tit: 'Representações de grafos (TAD)', desc: 'O grafo como tipo abstrato de dados: lista de arestas, matriz de adjacência, matriz de incidência e lista de adjacência.', arq: 'aulas/aula-03-representacoes.pdf', pags: 23, kb: 375, tema: 'Fundamentos', mod: 'fundamentos' },
  { n: '04', tit: 'Subgrafos e grafos completos', desc: 'Subgrafos, grafos completos e bipartidos, com atividade de representação.', arq: 'aulas/aula-04-subgrafos-e-grafos-completos.pdf', pags: 25, kb: 668, tema: 'Fundamentos', mod: 'fundamentos' },
  { n: '05', tit: 'Caminho mais curto: Dijkstra', desc: 'O problema do menor caminho e o algoritmo de Dijkstra passo a passo.', arq: 'aulas/aula-05-dijkstra.pdf', pags: 18, kb: 365, tema: 'Caminhos mínimos', mod: 'caminhos-minimos' },
  { n: '06', tit: 'Bellman-Ford', desc: 'Pesos negativos e o Bellman-Ford iteração por iteração.', arq: 'aulas/aula-06-bellman-ford.pdf', pags: 28, kb: 945, tema: 'Caminhos mínimos', mod: 'caminhos-minimos' },
  { n: '07', tit: 'Algoritmos de caminhos mínimos', desc: 'Exercícios de Bellman-Ford, detecção de ciclos negativos e Floyd-Warshall.', arq: 'aulas/aula-07-algoritmos-de-caminhos-minimos.pdf', pags: 22, kb: 384, tema: 'Caminhos mínimos', mod: 'caminhos-minimos' },
  { n: '08', tit: 'Grafos eulerianos', desc: 'Definições, o teorema de Euler e o algoritmo de Fleury.', arq: 'aulas/aula-08-grafos-eulerianos.pdf', pags: 19, kb: 377, tema: 'Euler e Hamilton', mod: 'euler-hamilton' },
  { n: '09', tit: 'Grafos hamiltonianos', desc: 'Ciclos hamiltonianos, o teorema de Dirac e o caixeiro viajante.', arq: 'aulas/aula-09-grafos-hamiltonianos.pdf', pags: 25, kb: 403, tema: 'Euler e Hamilton', mod: 'euler-hamilton' },
  { n: '10', tit: 'Árvores', desc: 'Árvores, árvores enraizadas, árvore geradora e o algoritmo de Prim.', arq: 'aulas/aula-10-arvores.pdf', pags: 41, kb: 1006, tema: 'Árvores', mod: 'arvores-agm' },
  { n: '11', tit: 'Árvore geradora mínima: Kruskal', desc: 'Árvore geradora mínima e o algoritmo de Kruskal com a floresta de componentes.', arq: 'aulas/aula-11-agm-kruskal.pdf', pags: 42, kb: 861, tema: 'Árvores', mod: 'arvores-agm' },
  { n: '14', tit: 'Busca em profundidade (DFS)', desc: 'A ideia de Trémaux, os estados dos vértices e a DFS passo a passo.', arq: 'aulas/aula-14-busca-em-profundidade.pdf', pags: 26, kb: 379, tema: 'Buscas', mod: 'buscas' },
  { n: '16', tit: 'Busca em largura (BFS)', desc: 'A fila, as camadas e as distâncias em número de arestas, com a tabela da BFS.', arq: 'aulas/aula-16-busca-em-largura.pdf', pags: 35, kb: 1001, tema: 'Buscas', mod: 'buscas' },
  { n: '20', tit: 'Busca em profundidade com pilha', desc: 'Revisão da BFS e a DFS com a pilha de chamadas, passo a passo.', arq: 'aulas/aula-20-busca-em-profundidade-pilha.pdf', pags: 33, kb: 500, tema: 'Buscas', mod: 'buscas' },
  { n: '21', tit: 'A* e resolução de labirintos', desc: 'O labirinto como grafo, DFS, BFS, busca gulosa e A*, com as soluções. Abre como página, com slides navegáveis.', arq: 'aulas/aula-21-a-estrela-e-labirintos.html', pags: 39, kb: 2080, tema: 'Labirintos e A*', mod: 'labirintos-astar', html: true },
  { n: '18', tit: 'Coloração de grafos', desc: 'Conjuntos independentes, número cromático, guloso e Welsh-Powell, e o mapa do Brasil.', arq: 'aulas/aula-18-coloracao.pdf', pags: 35, kb: 662, tema: 'Coloração e fluxo', mod: 'coloracao' },
  { n: '19', tit: 'Fluxo em redes', desc: 'Capacidade, conservação, caminhos aumentantes, Ford-Fulkerson e corte mínimo.', arq: 'aulas/aula-19-fluxo-em-redes.pdf', pags: 29, kb: 379, tema: 'Coloração e fluxo', mod: 'fluxo' },
  { n: '26', tit: 'Bancos de dados de grafos: Neo4j', desc: 'NoSQL, o modelo de grafo, o Neo4j AuraDB e consultas em Cypher.', arq: 'aulas/aula-26-neo4j.pdf', pags: 44, kb: 1407, tema: 'Grafos na prática', mod: null },
];
