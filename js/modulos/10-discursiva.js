/* Módulo 10 · Discursivas de grafos que já caíram no ENADE */
(function () {
  const { P, dica, armadilha, nota, lista, passos, tabela, h, tabelaEl } = window.UI;
  const Gf = window.Grafos;
  const fig = (G, est = {}, op = {}) => { const d = document.createElement('div'); Gf.desenha(d, G, est, op); return `<div class="fig-estatica">${d.innerHTML}</div>`; };

  // ENADE 2017 · Discursiva 5: dígrafo com 10 vértices e 14 arcos
  const D2017 = { dirigido: true,
    nos: { p: [0, 30], s: [14, 14], w: [28, 30], q: [41, 0], t: [66, 14], x: [66, 30], z: [66, 46], y: [92, 30], r: [108, 0], u: [122, 14] },
    arestas: [['p', 'w'], ['q', 's'], ['q', 't'], ['q', 'w'], ['r', 'u'], ['r', 'y'], ['s', 'p'], ['t', 'x'], ['t', 'y'], ['u', 'y'], ['w', 's'], ['x', 'z'], ['y', 'q', null, { curva: 20 }], ['z', 'x']] };
  const V2017 = ['p', 'q', 'r', 's', 't', 'u', 'w', 'x', 'y', 'z'];
  // ENADE 2005 · Questão 39: árvore com raiz 33
  const A2005 = { nos: { 33: [50, 0], 15: [24, 16], 41: [76, 16], 38: [63, 32], 47: [89, 32], 34: [55, 48], 43: [81, 48], 49: [97, 48] },
    arestas: [['33', '15'], ['33', '41'], ['41', '38'], ['41', '47'], ['38', '34'], ['47', '43'], ['47', '49']] };

  const liga = (a, b) => D2017.arestas.some(([u, v]) => u === a && v === b);
  const linhasMatriz = V2017.map((a) => [`<b>${a}</b>`, ...V2017.map((b) => (liga(a, b) ? '1' : ''))]);
  const MATRIZ = tabela(['', ...V2017], linhasMatriz, { classe: 'tab-dij' });

  const ENUN2017 =
    P('A busca primeiro em profundidade é um algoritmo de exploração sistemática em grafos, em que as arestas são exploradas a partir do vértice <i>v</i> mais recentemente descoberto que ainda tem arestas inexploradas saindo dele. Quando todas as arestas de <i>v</i> são exploradas, a busca regressa para explorar as arestas que deixam o vértice a partir do qual <i>v</i> foi descoberto. Esse processo continua até que todos os vértices acessíveis a partir do vértice inicial sejam explorados.',
      '<small>CORMEN, T. H. et al. <i>Introduction to algorithms</i>. 3. ed. MIT Press, 2009 (adaptado).</small>') +
    fig(D2017, {}, { rotulo: 'Grafo dirigido com os vértices p, q, r, s, t, u, w, x, y e z' }) +
    P('<small>Figura redesenhada a partir da prova.</small>', 'Considere o grafo acima.',
      '<b>a)</b> Mostre a sequência de vértices descobertos no grafo durante a execução de uma busca em profundidade com controle de estados repetidos. Para isso, utilize o vértice <i>r</i> como inicial. No caso de um vértice explorado ter mais de um vértice adjacente, utilize a ordem alfabética crescente como critério para priorizar a exploração. (valor: 7,0 pontos)',
      '<b>b)</b> Faça uma representação da matriz de adjacências desse grafo, podendo os zeros ser omitidos nessa matriz. (valor: 3,0 pontos)');

  const ENUN2005 =
    fig(A2005, {}, { rotulo: 'Árvore com raiz 33; 33 tem filhos 15 e 41; 41 tem filhos 38 e 47; 38 tem filho 34; 47 tem filhos 43 e 49' }) +
    P('Tendo como base a árvore acima, faça o que se pede nos itens a seguir.',
      '<b>a)</b> Descreva uma ordem de visita dos nós para uma busca em profundidade a partir do nó de valor 41. (valor: 3,0 pontos)',
      '<b>b)</b> Considerando que o nó de valor 33 seja a raiz da árvore, descreva a ordem de visita para uma varredura em pré-ordem (r-e-d, ou pré-fixado à esquerda) na árvore. (valor: 3,0 pontos)',
      '<b>c)</b> Considerando que a árvore cuja raiz é o nó de valor 33 represente uma árvore de busca binária, desenhe a nova árvore que será obtida após a realização das seguintes operações: inserir um nó de valor 21; remover o nó de valor 47; inserir um nó de valor 48. (valor: 4,0 pontos)');

  window.MODULOS.push({
    id: 'discursiva',
    curto: 'Discursivas de grafos',
    titulo: 'Discursivas de grafos que já caíram no ENADE',
    grupo: 'Prova',
    enade: 'ENADE 2017 (discursiva 5) e ENADE 2005 (questão 39), com o padrão de resposta do Inep',
    resumo: 'As duas discursivas de grafos das provas anteriores de Computação, com o enunciado, a resolução comentada e o que o padrão de resposta do Inep aceitou. E o que elas ensinam sobre escrever a resposta.',
    topicos: [
      { t: 'Como a discursiva é corrigida', h:
        P('O componente específico do ENADE tem questões discursivas, corrigidas por um <b>padrão de resposta</b> que o Inep publica depois da prova. Cada item tem um valor, e o padrão diz o que se espera e o que mais foi aceito.',
          'As duas discursivas de grafos das provas de Computação pediram a mesma coisa: <b>executar uma busca em profundidade e mostrar a ordem de visita</b>, e representar a estrutura (matriz de adjacências em 2017, árvore de busca binária em 2005). Nas duas, o padrão aceitou mais de uma resposta, porque a ordem de visita depende de detalhes da implementação.') +
        tabela(['Prova', 'O que pediu', 'Valor'], [
          ['ENADE 2017 · Discursiva 5', 'a) DFS a partir de r, vizinhos em ordem alfabética', '7,0'],
          ['', 'b) matriz de adjacências do grafo dirigido', '3,0'],
          ['ENADE 2005 · Questão 39', 'a) DFS a partir do nó 41 de uma árvore', '3,0'],
          ['', 'b) percurso em pré-ordem', '3,0'],
          ['', 'c) inserir 21, remover 47 e inserir 48 numa árvore de busca binária', '4,0'],
        ]) },
      { t: 'ENADE 2017 · Discursiva 5', h: ENUN2017 },
      { t: 'Resolução do item a (2017)', h:
        P('Três regras: seguir só os arcos que <b>saem</b> do vértice, escolher o vizinho em ordem alfabética e não revisitar ninguém (o “controle de estados repetidos”).') +
        lista(['r → {u, y}: desce em u; u → {y}: desce em y; y → {q}: desce em q.', 'q → {s, t, w}: desce em s; s → {p}: desce em p; p → {w}: desce em w.', 'w → {s}: s já foi visto. Volta até q, que ainda tem t.', 't → {x, y}: y já foi visto, desce em x; x → {z}: desce em z; z → {x}: já visto. Fim.']) +
        P('Sequência: <b>r, u, y, q, s, p, w, t, x, z</b>. Os dez vértices são alcançáveis a partir de r.') +
        nota(P('O padrão aceitou <b>quatro</b> sequências, cada uma obtida por uma implementação correta da DFS:') +
          tabela(['Sequência aceita', 'Como sai'], [
            ['r–u–y–q–s–p–w–t–x–z', 'versão recursiva, exatamente como no livro citado'],
            ['r–y–q–w–t–x–z–s–p–u', 'com pilha, empilhando os vizinhos em ordem alfabética (o topo é o último)'],
            ['r–y–q–w–s–p–t–x–z–u', 'com pilha, permitindo empilhar um vértice mais de uma vez e decidindo ao desempilhar'],
            ['r–u–y–q–s–p–t–x–z–w', 'com pilha, empilhando na ordem inversa para desempilhar perto da ordem alfabética'],
          ]), 'O que o Inep aceitou') +
        armadilha('A ordem da BFS (r, u, y, q, s, t, w, p, x, z) não é DFS. E, em grafo dirigido, um arco só pode ser seguido no sentido da seta: o arco longo vai de y para q, não de q para y.') },
      { t: 'Resolução do item b (2017)', h:
        P('Linha = vértice de origem, coluna = vértice de destino; 1 quando existe o arco. Os zeros podem ser omitidos, como o enunciado permite.') +
        MATRIZ +
        lista(['São 14 arcos, então a matriz tem exatamente 14 uns.', 'A soma de cada linha é o grau de saída; a de cada coluna, o grau de entrada (y recebe 3 arcos: de r, t e u).', 'Como o grafo é dirigido, a matriz <b>não é simétrica</b>. O único par recíproco é x e z.']) +
        nota('O padrão aceitou esta matriz e também a transposta, em que a linha é o destino e a coluna é a origem. O que conta é a convenção ser coerente em toda a matriz.', 'O que o Inep aceitou') },
      { t: 'ENADE 2005 · Questão 39', h: ENUN2005 },
      { t: 'Resolução da questão de 2005', h:
        P('<b>Item a.</b> A DFS vai o mais fundo possível e só volta quando não há vizinho novo. Tratando as ligações como arestas de um grafo, o pai também é vizinho: 41 → 38 → 34, volta; 47 → 43, volta, → 49, volta; 33 → 15. Uma ordem válida: <b>41, 38, 34, 47, 43, 49, 33, 15</b>.') +
        nota(P('O padrão aceitou respostas para os dois jeitos de ler a figura:') +
          lista(['<b>como grafo:</b> 41, 38, 34, 47, 49, 43, 33, 15, ou a versão em que o nó é visitado ao terminar (15, 33, 34, 38, 49, 43, 47, 41);', '<b>como árvore</b>, visitando só a subárvore de 41: 41, 38, 34, 47, 43, 49; 41, 47, 49, 43, 38, 34; e as versões com visita ao terminar (34, 38, 43, 49, 47, 41 e 49, 43, 47, 34, 38, 41).']) +
          P('A análise do item diz que qualquer percurso que siga uma das duas formas do algoritmo (visitar o nó antes ou depois dos vizinhos) está correto, e todas valeram os 3,0 pontos.'), 'O que o Inep aceitou') +
        P('<b>Item b.</b> Pré-ordem (raiz, esquerda, direita) a partir de 33: <b>33, 15, 41, 38, 34, 47, 43, 49</b>.',
          '<b>Item c.</b> Inserir 21: há uma única posição, à direita de 15 (1,0 ponto). Remover 47, que tem dois filhos: sobe 43 (o maior da subárvore esquerda) ou 49 (o menor da subárvore direita); as duas foram aceitas (2,0 pontos). Inserir 48: se 49 subiu, 48 vai à direita de 43; se 43 subiu, 48 vai à esquerda de 49 (1,0 ponto). O padrão também aceitou uma árvore rebalanceada e as três operações desenhadas numa só figura.') },
      { t: 'O que essas correções ensinam', h:
        lista(['<b>Mostre a sequência inteira</b>, na ordem, e não só o resultado final.', '<b>Siga a regra de desempate</b> do enunciado (em 2017, a ordem alfabética). Se o enunciado não fixar uma regra, diga qual você usou.', '<b>Em grafo dirigido</b>, só os arcos de saída contam, e a matriz não é simétrica.', '<b>Diga a convenção</b> da representação: na matriz, o que é linha e o que é coluna.', '<b>Confira por contagem</b>: número de uns = número de arcos; soma das linhas = soma das colunas.', 'Mais de uma resposta pode estar certa. O que não pode é uma sequência que nenhuma versão do algoritmo produz.']) },
      { t: 'Como escrever qualquer resposta de grafos', h:
        passos(['<b>Modele.</b> “Vértices são…, arestas são…, o peso é…, o grafo é (não) dirigido.”', '<b>Escolha e justifique.</b> Nomeie o algoritmo e a propriedade do problema que permite usá-lo.', '<b>Execute à vista.</b> Mostre a ordem de visita ou a tabela passo a passo, com a regra de desempate.', '<b>Responda e confira.</b> Dê o resultado com a unidade do problema e faça uma checagem rápida (contagem, soma, caminho lido de trás para a frente).']) +
        tabela(['Erro', 'Como evitar'], [
          ['Seguir um arco contra a seta.', 'Em dígrafo, leia a lista de saída de cada vértice antes de começar.'],
          ['Ignorar a regra de desempate.', 'Escreva a lista de vizinhos já ordenada ao lado de cada vértice.'],
          ['Entregar a ordem da BFS quando pediram DFS.', 'DFS desce antes de terminar os vizinhos; BFS termina a camada antes de descer.'],
          ['Matriz sem convenção.', 'Escreva “linha = origem, coluna = destino” acima da matriz.'],
          ['Responder só o número.', 'Dê também a sequência, o caminho ou a estrutura que gerou o número.'],
        ]) },
    ],
    exemplos: [
      { t: 'DFS a partir de r (ENADE 2017, item a)', d: P('Versão recursiva, vizinhos em ordem alfabética. Os números são os tempos de descoberta e de término.'),
        mount(el) { Gf.passoAPasso(el, D2017, Gf.dfs(D2017, 'r'), { tabelaEmbaixo: true }); },
        depois: P('Sequência de descoberta: r, u, y, q, s, p, w, t, x, z, a primeira das quatro aceitas pelo padrão.') },
      { t: 'Monte a matriz e confira (ENADE 2017, item b)', d: P('Tente montar a matriz no papel antes de abrir a resposta.'),
        mount(el) {
          const figura = h('div', { class: 'lab-fig' });
          Gf.desenha(figura, D2017, {}, { rotulo: 'Grafo dirigido da discursiva 5 do ENADE 2017' });
          const area = h('div', { hidden: true });
          const saida = V2017.map((a) => D2017.arestas.filter(([u]) => u === a).length);
          const entrada = V2017.map((b) => D2017.arestas.filter(([, v]) => v === b).length);
          area.append(tabelaEl(['', ...V2017, 'saída'], V2017.map((a, i) => [`<b>${a}</b>`, ...V2017.map((b) => (liga(a, b) ? '1' : '')), `<b>${saida[i]}</b>`]).concat([['<b>entrada</b>', ...entrada.map((x) => `<b>${x}</b>`), '<b>14</b>']])));
          const b = h('button', { class: 'btn', type: 'button', onclick: () => { area.hidden = false; b.remove(); } }, 'Mostrar a matriz');
          el.append(h('div', { class: 'lab' }, figura, b, area));
        } },
      { t: 'DFS a partir do 41 (ENADE 2005, item a)', d: P('Tratando a figura como grafo e escolhendo sempre o menor vizinho, a DFS desce primeiro no 33, o pai do 41.'),
        mount(el) { Gf.passoAPasso(el, A2005, Gf.dfs(A2005, '41'), { tabelaEmbaixo: true }); },
        depois: P('Ordem: 41, 33, 15, 38, 34, 47, 43, 49. Ela não está entre os exemplos listados no padrão, mas segue a primeira forma do algoritmo, e o padrão manda aceitar qualquer percurso que siga uma das formas. Por isso, na prova, vale escrever qual ordem de vizinhos você usou.') },
    ],
    atividades: [
      { t: 'O padrão de 2017 aceitaria?', tipo: 'classificar', d: P('Item a da discursiva 5: DFS a partir de r, com ordem alfabética.'),
        cfg: { cats: ['Aceita', 'Não aceita'], itens: [
          { t: 'r, u, y, q, s, p, w, t, x, z', c: 0, e: 'É a versão recursiva, a primeira do padrão.' },
          { t: 'r, y, q, w, t, x, z, s, p, u', c: 0, e: 'Versão com pilha, empilhando em ordem alfabética.' },
          { t: 'r, u, y, q, s, t, w, p, x, z', c: 1, e: 'É a ordem da BFS: termina os vizinhos de q antes de descer.' },
          { t: 'r, u, y, q, s, p, w', c: 1, e: 'Para cedo: t, x e z também são alcançáveis a partir de r.' },
          { t: 'r, u, y, q, s, p, t, x, z, w', c: 0, e: 'Versão com pilha em ordem inversa, a quarta do padrão.' },
          { t: 'r, u, y, q, t, s, p, w, x, z', c: 1, e: 'De q, desce em t antes de s, contrariando a ordem alfabética dos vizinhos de q. Nenhuma das versões aceitas faz isso.' },
        ] } },
      { t: 'Perguntas sobre os grafos das discursivas', tipo: 'qa', itens: [
        { q: 'No grafo de 2017, quais são o grau de saída e o grau de entrada de q? E de y?', a: P('q: sai para s, t e w (saída 3) e recebe só de y (entrada 1). y: sai só para q (saída 1) e recebe de r, t e u (entrada 3).') },
        { q: 'No grafo de 2017, algum vértice não é alcançável a partir de q? E a partir de r?', a: P('A partir de q não se chega em r nem em u, porque ninguém aponta para r e só r aponta para u. A partir de r chega-se a todos os dez.') },
        { q: 'Por que o padrão de 2005 aceitou respostas que nem passam pelo 33?', a: P('Porque a figura pode ser lida como árvore enraizada em 33. Nessa leitura, uma busca a partir de 41 percorre a subárvore de 41 (41, 38, 34, 47, 43, 49) e não sobe para o pai.') },
        { q: 'Na árvore de 2005, qual é o percurso em ordem simétrica (esquerda, raiz, direita)?', a: P('15, 33, 34, 38, 41, 43, 47, 49: numa árvore de busca binária, a ordem simétrica sai sempre ordenada.') },
      ] },
      { t: 'Modele em uma frase', tipo: 'qa', d: P('Para cada enunciado, escreva o que é vértice, aresta e peso, e qual problema resolver. Depois compare.'), itens: [
        { q: 'Uma companhia de saneamento quer saber quantos litros por segundo consegue levar do reservatório até um bairro, sabendo a vazão máxima de cada cano.', a: P('Vértices: reservatório, junções e bairro; arcos <b>dirigidos</b> no sentido da água; peso = capacidade (vazão máxima). Problema: <b>fluxo máximo</b> do reservatório (fonte) ao bairro (sumidouro), por Ford-Fulkerson.') },
        { q: 'Um curso quer saber em que ordem os alunos podem cursar as disciplinas, respeitando os pré-requisitos.', a: P('Vértices: disciplinas; arco X → Y se X é pré-requisito de Y; sem peso. O grafo é um <b>DAG</b>, e a resposta é uma <b>ordenação topológica</b> (Kahn ou DFS).') },
        { q: 'Uma operadora quer usar o menor número de frequências em antenas, sabendo quais pares interferem.', a: P('Vértices: antenas; aresta entre antenas que interferem; sem peso. Problema: <b>coloração</b>; o mínimo de frequências é χ(G). Guloso ou Welsh-Powell dão uma solução, sem garantia de ótimo; uma clique dá o limite inferior.') },
        { q: 'Um condomínio quer saber se o vigia consegue passar por todas as ruas uma única vez e voltar à portaria.', a: P('Vértices: cruzamentos; arestas: ruas. Problema: <b>trajeto euleriano fechado</b>: existe se o grafo é conexo e todos os graus são pares (Fleury constrói).') },
      ] },
      { t: 'Antes de entregar', tipo: 'checklist', id: 'disc-check', d: P('Use na próxima discursiva que fizer. As marcações ficam salvas neste navegador.'),
        itens: ['Disse o que é vértice, aresta e peso, e se o grafo é dirigido.', 'Nomeei o algoritmo e justifiquei pela propriedade do problema.', 'Mostrei a execução completa, com a regra de desempate.', 'Dei o resultado com sequência (ou caminho, árvore, conjunto) e unidade.', 'Respondi cada item com a letra dele (a, b, c…).', 'Indiquei a convenção de qualquer representação (linha e coluna da matriz).', 'Conferi por contagem ou soma.'] },
    ],
    desafios: [
      { fonte: 'ENADE 2017 · Discursiva 5, item b (em múltipla escolha)', enun: P('Na matriz de adjacências do grafo da discursiva 5 do ENADE 2017 (aba Conteúdo), com linha = origem e coluna = destino, é correto afirmar que') + fig(D2017),
        opts: ['a matriz é simétrica, porque cada arco liga dois vértices.', 'a matriz tem 14 entradas iguais a 1, e a coluna de y soma 3.', 'a matriz tem 28 entradas iguais a 1, porque cada arco aparece duas vezes.', 'a linha de y soma 3, porque y é vizinho de r, t e u.'], c: 1,
        e: 'Um 1 por arco: 14. A coluna de y é o grau de entrada (arcos de r, t e u). A matriz de um dígrafo não é simétrica; a linha de y é o grau de saída, que é 1 (só y → q).',
        w: { 3: 'A linha conta os arcos que saem de y: só y → q. Os arcos de r, t e u chegam em y e aparecem na coluna.', 0: 'Só seria simétrica se todo arco tivesse o recíproco; aqui, só x e z formam um par.' } },
      { fonte: 'Inédita · sobre o grafo do ENADE 2017', enun: P('No mesmo grafo dirigido, executa-se uma <b>busca em largura</b> a partir de r, com os vizinhos em ordem alfabética. A ordem de visita é') + fig(D2017),
        opts: ['r, u, y, q, s, p, w, t, x, z', 'r, u, y, q, w, t, s, p, x, z', 'r, y, u, q, t, s, w, x, p, z', 'r, u, y, q, s, t, w, p, x, z'], c: 3,
        e: 'Camada 1: u e y (saem de r). Camada 2: q (de y). Camada 3: s, t e w (de q, em ordem alfabética). Camada 4: p (de s) e x (de t). Camada 5: z (de x). Ordem: r, u, y, q, s, t, w, p, x, z.',
        w: { 0: 'Essa é a ordem da busca em profundidade: desce em s e p antes de terminar os vizinhos de q.' } },
      { fonte: 'ENADE 2005 · Questão 39, item b (em múltipla escolha)', enun: P('Na árvore da questão 39 do ENADE 2005, com raiz 33, a varredura em pré-ordem (raiz, esquerda, direita) visita os nós na ordem') + fig(A2005),
        opts: ['33, 15, 41, 38, 34, 47, 43, 49', '15, 33, 34, 38, 41, 43, 47, 49', '15, 34, 38, 43, 49, 47, 41, 33', '33, 15, 41, 38, 47, 34, 43, 49'], c: 0,
        e: 'Pré-ordem: visita a raiz, depois a subárvore esquerda inteira, depois a direita. 33; esquerda: 15; direita: 41, com 38 (e 34) antes de 47 (e 43, 49). É a resposta do padrão do Inep.',
        w: { 1: 'Essa é a ordem simétrica (esquerda, raiz, direita), que sai ordenada.', 2: 'Essa é a pós-ordem (esquerda, direita, raiz).', 3: 'Essa é a ordem em largura, nível por nível.' } },
      { fonte: 'Inédita · sobre a árvore do ENADE 2005', enun: P('Ainda na árvore com raiz 33, considere uma busca em profundidade a partir do nó 41. Qual das sequências <b>não</b> pode ser produzida por uma busca em profundidade?') + fig(A2005),
        opts: ['41, 38, 34, 47, 43, 49, 33, 15', '41, 47, 49, 43, 38, 34, 33, 15', '41, 38, 47, 34, 43, 49, 33, 15', '41, 33, 15, 38, 34, 47, 43, 49'], c: 2,
        e: 'Em C, depois de 38 vem 47 sem visitar 34, que é filho de 38 e ainda estava por descobrir: isso é largura, não profundidade. As outras descem até o fim de cada ramo antes de voltar, com ordens de vizinhos diferentes.' },
      { fonte: 'Inédita · padrão de resposta', enun: P('No item a da discursiva 5 do ENADE 2017, o enunciado fixou a ordem alfabética para priorizar a exploração, e mesmo assim o padrão de resposta aceitou quatro sequências diferentes. Isso aconteceu porque'),
        opts: ['a ordem alfabética não define um critério único de desempate.', 'o grafo tem ciclos, e a busca em profundidade não termina em grafos com ciclos.', 'implementações corretas da busca em profundidade, recursiva ou com pilha, visitam os vizinhos em ordens diferentes, mesmo respeitando a prioridade alfabética.', 'o Inep aceitou também a ordem da busca em largura.'], c: 2,
        e: 'O padrão explica cada sequência: uma é a versão recursiva; as outras três usam pilha, com diferenças em como e quando os vizinhos são empilhados e marcados. A busca em largura não estava entre as aceitas, e a DFS termina em grafos com ciclo por causa do controle de estados repetidos.' },
      { fonte: 'Inédita · leitura do enunciado', enun: P('Um enunciado diz: “Uma prefeitura quer ligar à central, por fibra óptica, as câmeras de todos os cruzamentos de um bairro, de modo que todas fiquem conectadas, direta ou indiretamente, com o menor comprimento total de cabo.” Um estudante respondeu usando o Dijkstra a partir da central. Sobre essa resposta, é correto afirmar que'),
        opts: ['está errada: “interligar todos com o menor comprimento total” é árvore geradora mínima, e a soma dos caminhos mínimos a partir da central pode ser maior que a AGM.', 'está correta, pois a central é a origem.', 'está errada: o problema é o do caixeiro viajante.', 'está correta, pois a árvore de caminhos mínimos sempre coincide com a AGM.'], c: 0,
        e: 'Partir da central não torna o problema de caminho mínimo: o objetivo é o comprimento total da rede. A árvore de caminhos mínimos e a AGM podem ser diferentes: veja o exemplo “AGM × caminho mínimo” no módulo de árvores.' },
    ],
  });
})();
