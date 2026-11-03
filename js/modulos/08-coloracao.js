/* Módulo 8 · Conjuntos independentes, coloração e grafos de conflito */
(function () {
  const { P, dica, armadilha, nota, lista, passos, codigo, tabela, h } = window.UI;
  const Gf = window.Grafos;
  const fig = (G, est = {}, op = {}) => { const d = document.createElement('div'); Gf.desenha(d, G, est, op); return `<div class="fig-estatica">${d.innerHTML}</div>`; };
  const ar = (...xs) => xs.map((x) => x.split('-'));

  const NE = { nos: { MA: [0, 22], PI: [22, 40], CE: [40, 14], RN: [64, 6], PB: [72, 24], PE: [54, 40], AL: [76, 50], SE: [66, 66], BA: [36, 68] },
    arestas: ar('MA-PI', 'PI-CE', 'PI-PE', 'PI-BA', 'CE-RN', 'CE-PB', 'CE-PE', 'RN-PB', 'PB-PE', 'PE-AL', 'PE-BA', 'AL-SE', 'AL-BA', 'SE-BA') };
  const PROVAS = { nos: { BD: [50, 0], Comp: [50, 50], Redes: [8, 25], IHC: [30, 25], Alg: [76, 25], Est: [100, 48] },
    arestas: ar('Alg-BD', 'Alg-Comp', 'BD-Comp', 'BD-IHC', 'Comp-IHC', 'BD-Redes', 'Comp-Redes', 'Alg-Est', 'Comp-Est') };
  const LOTES = { nos: { L1: [15, 5], L2: [15, 55], L3: [85, 5], L4: [85, 55], L5: [50, 30] }, arestas: ar('L5-L1', 'L5-L2', 'L5-L3', 'L5-L4', 'L1-L2', 'L3-L4') };
  const RAP = { L1: 46.61, L2: 18.14, L3: 60, L4: 25.56, L5: 91.19 };
  const WPG = { nos: { G: [50, 33], D: [12, 38], B: [28, 6], F: [72, 6], E: [88, 38], C: [66, 64], A: [34, 64] }, arestas: ar('A-C', 'B-D', 'B-F', 'B-G', 'C-E', 'C-G', 'D-G', 'E-F', 'E-G', 'F-G') };
  const PATRO = { nos: { B: [0, 22], A: [25, 0], D: [50, 22], G: [75, 0], E: [100, 22] }, arestas: ar('A-B', 'A-D', 'D-G', 'G-E'), pesoNo: { A: '40', B: '30', D: '28', G: '35', E: '22' } };
  const CAMINHO5 = { nos: { a: [0, 0], b: [22, 0], c: [44, 0], d: [66, 0], e: [88, 0] }, arestas: ar('a-b', 'b-c', 'c-d', 'd-e') };
  const ESTRELA = { nos: { c: [50, 30], 1: [50, 2], 2: [76, 16], 3: [76, 44], 4: [50, 58], 5: [24, 44], 6: [24, 16] }, arestas: ar('c-1', 'c-2', 'c-3', 'c-4', 'c-5', 'c-6') };

  window.MODULOS.push({
    id: 'coloracao',
    curto: 'Coloração e conflito',
    titulo: 'Conjuntos independentes, coloração e grafos de conflito',
    grupo: 'Modelagem e complexidade',
    resumo: 'Quem pode ficar junto (α), quantos grupos são necessários (χ), guloso e Welsh-Powell, quatro cores, e como sair de uma notícia ou de uma tabela para o grafo de conflito.',
    topicos: [
      { t: 'Conjuntos independentes', h:
        P('Um conjunto S de vértices é <b>independente</b> se não existe aresta entre dois vértices de S. O vazio e qualquer vértice sozinho são independentes, e um grafo costuma ter muitos.',
          '<b>Calendário de provas:</b> vértice = disciplina; aresta = as duas têm alunos em comum. Provas no mesmo horário precisam formar um conjunto independente, porque ninguém faz duas provas ao mesmo tempo.') +
        P('<b>Maximal não é máximo.</b> α(G) é o tamanho do maior conjunto independente; um conjunto com esse tamanho é <b>máximo</b>. Um conjunto é <b>maximal</b> quando não dá para acrescentar nenhum vértice a ele.') +
        fig(ESTRELA, { no: { c: 'sel' } }) +
        P('Na estrela, S = {centro} (em laranja) é maximal, com |S| = 1: qualquer folha é vizinha dele. As 6 folhas formam o conjunto máximo, α(G) = 6. Todo máximo é maximal, mas nem todo maximal é máximo. Achar um maximal é fácil; o máximo, nem sempre.') },
      { t: 'Coloração e número cromático', h:
        P('Colorir é dar uma cor a cada vértice de modo que vizinhos tenham cores diferentes. Cada cor é um conjunto independente: colorir é dividir os vértices em conjuntos independentes. O <b>número cromático χ(G)</b> é o menor número de cores possível.') +
        nota(lista(['<b>k bastam:</b> mostre uma pintura com k cores.', '<b>menos não dá:</b> ache um pedaço que já obrigue k cores, como um triângulo, que obriga 3.']), 'Como mostrar que χ(G) = k') +
        `<div class="formula"><span>ω(G) ≤ χ(G) ≤ Δ(G) + 1</span><small>ω = tamanho da maior clique · Δ = maior grau</small></div>` +
        lista(['<b>Limite inferior, a clique:</b> k vértices ligados dois a dois precisam de k cores.', '<b>Limite superior, o guloso:</b> ao colorir um vértice, os vizinhos bloqueiam no máximo Δ cores; sempre sobra uma entre 1 e Δ + 1.', '<b>Bipartido</b> ⇔ 2 cores bastam ⇔ não tem ciclo ímpar. Testar é fácil, com BFS.', '<b>Difícil:</b> decidir se χ(G) ≤ 3 já é NP-completo.']) +
        armadilha('Sem triângulo não quer dizer 2 cores: o ciclo C<sub>5</sub> não tem triângulo e precisa de 3, porque é ímpar.') },
      { t: 'Qual é o χ? Regras que resolvem rápido', h:
        tabela(['Grafo', 'χ', 'Regra geral'], [['K<sub>4</sub> (completo)', '4', 'completo K<sub>n</sub>: χ = n'], ['C<sub>6</sub> (ciclo par)', '2', 'ciclo par: χ = 2'], ['C<sub>5</sub> (ciclo ímpar)', '3', 'ciclo ímpar: χ = 3'], ['árvore', '2', 'árvore com n ≥ 2: χ = 2'], ['K<sub>3,3</sub> (bipartido)', '2', 'bipartido: χ = 2'], ['roda: centro + C<sub>5</sub>', '4', 'roda com aro ímpar: χ = 4']]) },
      { t: 'Força bruta, guloso e Welsh-Powell', h:
        P('Com k cores e n vértices há k<sup>n</sup> maneiras de pintar. A 1 bilhão de colorações por segundo, com k = 3:') +
        tabela(['n', 'Colorações (k = 3)', 'Tempo'], [['20', '3,5 bilhões', '3,5 segundos'], ['30', '2,1 × 10¹⁴', '2,4 dias'], ['50', '7,2 × 10²³', '23 milhões de anos']]) +
        P('<b>Guloso:</b> escolha uma ordem e, para cada vértice, use a menor cor que nenhum vizinho já colorido usa. Rápido e sempre válido, mas <b>o número de cores depende da ordem</b>.',
          '<b>Welsh-Powell (1967):</b> ordene por grau decrescente (empate: ordem alfabética); dê a cor 1 ao primeiro e, seguindo a lista, a todo vértice que não é vizinho de quem já tem a cor 1; repita com a cor 2 para os que sobraram, e assim por diante. É o guloso com uma ordem esperta. Costuma ir bem, mas <b>não garante</b> χ(G).') +
        codigo(['COLORE-GULOSO(G)', '1  para cada v ∈ V faça cor[v] ← 0          // 0 = sem cor', '2  ordene V por grau decrescente           // critério (Welsh-Powell)', '3  para cada v ∈ V nessa ordem faça', '4      U ← {cor[u] : u vizinho de v}', '5      c ← 1', '6      enquanto c ∈ U faça c ← c + 1     // menor cor livre', '7      cor[v] ← c', '8  devolva cor'], 'Pseudocódigo do guloso') +
        P('Custo: O(n log n) para ordenar mais O(n + m) para olhar cada aresta. Aqui todo vértice entra; o que o guloso decide é a cor.') +
        dica('No Nordeste (aba Exemplos), em ordem alfabética o guloso usa 4 cores; o Welsh-Powell usa 3, que é o χ. E o contrário também acontece: há grafos em que a ordem alfabética acerta e o Welsh-Powell usa uma cor a mais.') },
      { t: 'Onde a coloração aparece', h:
        tabela(['Aplicação', 'Vértice', 'Aresta', 'Cor'], [['provas e horários', 'disciplina', 'alunos em comum', 'horário'], ['frequências e Wi-Fi', 'antena ou roteador', 'interferência', 'canal (2,4 GHz: 1, 6 e 11)'], ['produtos químicos', 'produto', 'combinação perigosa', 'compartimento'], ['compiladores', 'variável', 'vivas ao mesmo tempo', 'registrador'], ['Sudoku', 'casa', 'mesma linha, coluna ou bloco', 'dígito de 1 a 9'], ['mapas', 'região', 'fronteira', 'cor no mapa']]) +
        P('<b>Registradores:</b> se o grafo de interferência precisa de mais cores do que há registradores, alguma variável vai para a memória (<i>spill</i>). <b>Sudoku</b> é coloração com 9 cores: 81 casas, 20 vizinhos por casa, 810 arestas e χ = 9; resolver é completar uma coloração que já vem começada.') },
      { t: 'Quatro cores bastam', h:
        tabela(['Ano', 'Quem', 'O quê'], [['1852', 'Francis Guthrie', 'conjectura: 4 cores bastam para qualquer mapa'], ['1879', 'Alfred Kempe', 'publica uma prova… que está errada'], ['1890', 'Percy Heawood', 'acha o erro e prova que 5 cores bastam'], ['1976', 'Appel e Haken', 'provam com ajuda de computador (mais de mil casos)'], ['1996', 'Robertson, Sanders, Seymour e Thomas', 'prova com 633 casos'], ['2005', 'Gonthier', 'verifica a prova inteira no assistente Coq']]) +
        nota('<b>Teorema das Quatro Cores:</b> todo grafo planar tem χ(G) ≤ 4.', 'Teorema') +
        P('O mapa do Brasil vira um grafo planar com 27 vértices e 51 arestas, e precisa das 4 cores: os 5 vizinhos de Goiás (MT, TO, BA, MG, MS) formam um ciclo ímpar, que já exige 3 cores, e Goiás encosta nos 5. É a roda com aro ímpar da tabela acima.') },
      { t: 'Grafo de conflito: a aresta é impedimento', h:
        P('<b>Vértice</b> = um item a alocar: disciplina, tarefa, antena, variável, lote. <b>Aresta {u, v}</b> = u e v <b>não podem</b> ficar juntos: mesmo horário, mesmo recurso, mesma escolha. Sobre o mesmo grafo, o ENADE faz três perguntas:') +
        tabela(['Pergunta', 'Problema', 'Notação'], [['em quantos horários, no mínimo, cabe tudo?', 'coloração de vértices', 'χ(G)'], ['quantos itens podem ficar juntos, no máximo?', 'conjunto independente máximo', 'α(G)'], ['e se cada item vale um valor diferente?', 'conjunto independente de peso máximo', '—']]) +
        armadilha('O erro mais comum é inverter o sentido da aresta: ela é impedimento, não afinidade. E os três problemas são NP-difíceis em grafos gerais: guloso, ali, é heurística.') },
      { t: 'Da tabela ao grafo', h:
        P('Uma coordenação precisa marcar seis provas, e a tabela diz quem faz o quê. A regra: duas disciplinas são vizinhas quando <b>algum estudante faz as duas</b>.') +
        tabela(['Estudante', 'Alg', 'BD', 'Comp', 'Est', 'IHC', 'Redes'], [['Ana', 'X', 'X', 'X', '', '', ''], ['Bruno', '', 'X', 'X', '', 'X', ''], ['Carla', '', 'X', 'X', '', '', 'X'], ['Davi', 'X', '', 'X', 'X', '', ''], ['Elis', '', 'X', '', '', '', 'X']]) +
        P('Leia por linha: <b>cada linha vira uma clique</b>. Ana faz Alg, BD e Comp: as três ficam ligadas duas a duas. São 9 arestas no total (Elis não cria nenhuma nova: Carla já ligou BD e Redes). Graus: Comp 5, BD 4, Alg 3, os outros 2; soma 18 = 2 × 9.') +
        fig(PROVAS, {}, { r: 6 }) +
        P('Welsh-Powell dá Comp = 1, BD = 2, Alg = 3, Est = 2, IHC = 3, Redes = 3: três horários. E 3 é o mínimo, porque Alg, BD e Comp formam um triângulo. O passo a passo está na aba Exemplos.') },
      { t: 'Da notícia ao grafo: o leilão da ANEEL', h:
        passos(['<b>Quem são os atores?</b> Substantivos que se repetem e podem ser contados: vértices.', '<b>Que relação existe entre eles?</b> Conecta, liga, compartilha, conflita: arestas.', '<b>A relação tem direção?</b> Se A → B não implica B → A, o grafo é dirigido.', '<b>Que número acompanha o quê?</b> Número da relação: peso na aresta. Número do ator: peso no vértice.', '<b>Qual é a pergunta?</b> Menor percurso: caminho mínimo · ligar tudo pelo menor total: AGM · quantos grupos: coloração · maior conjunto compatível: conjunto independente.']) +
        P('Em 27/03/2026, na B3, o Leilão de Transmissão 1/2026 da ANEEL viabilizou R$ 3,3 bilhões em investimentos em 11 estados. Cada lote vai para quem aceita a menor <b>RAP</b>, a receita anual permitida: a recompensa que a concessionária recebe por ano.') +
        tabela(['Lote', 'Estados', 'RAP anual (recompensa)'], [['L1', 'SP, MG, RJ', 'R$ 46,61 mi'], ['L2', 'PR, SC', 'R$ 18,14 mi'], ['L3', 'CE, RN', 'R$ 60,00 mi *'], ['L4', 'BA, SE', 'R$ 25,56 mi'], ['L5', 'MT, PA', 'R$ 91,19 mi']]) +
        P('<small>* O Lote 3 saiu em quatro sublotes que somam R$ 104,60 mi; neste exemplo ele entra como um lote só, com o valor didático de R$ 60,00 mi. Fontes: ANEEL, via eixos, Cenário Energia, InfoMoney e Movimento Econômico.</small>') +
        P('<b>Hipótese do problema</b> (viria escrita no enunciado): um consórcio de médio porte não consegue tocar todas as obras. L5 ocupa toda a sua capacidade e conflita com todos; L1 e L2 disputam a mesma equipe; L3 e L4 têm a mesma janela de obra. Vértices = lotes, peso no vértice = RAP, aresta = conflito.') +
        fig({ ...LOTES, pesoNo: { L1: '46,61', L2: '18,14', L3: '60,00', L4: '25,56', L5: '91,19' } }, {}, { r: 5.2 }) +
        lista(['<b>Guloso por maior RAP:</b> L5 entra e bloqueia todos: R$ 91,19 mi.', '<b>Melhor possível:</b> com L5, ele fica sozinho; sem L5, escolhe-se um de cada par: L1 + L3 = <b>R$ 106,61 mi</b>. O guloso errou por R$ 15,42 mi por ano.', '<b>Outra pergunta, coloração:</b> em quantas janelas de obra cabem os cinco lotes? L5, L1 e L2 formam um triângulo, então χ = 3: {L5}, {L1, L3}, {L2, L4}.']) +
        P('Por que o guloso errou? Não vale a propriedade da escolha gulosa: o lote de maior RAP não está em nenhuma solução ótima. No laboratório da aba Exemplos, troque a RAP do L3 pelo valor real, R$ 104,60 mi: o guloso acerta. Acertar em um caso não prova nada.') },
    ],
    exemplos: [
      { t: 'Pinte o Nordeste', d: P('Clique num estado para trocar a cor. Ou use os botões para ver o guloso em ordem alfabética e o Welsh-Powell.'),
        mount(el) { Gf.labColorir(el, NE, { ordens: [['Guloso em ordem alfabética', ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE']], ['Welsh-Powell', Gf.ordemGrau(NE)]], chi: 3, maxCor: 4, rotAcima: ['CE', 'RN', 'MA', 'PB'] }); },
        depois: P('χ(Nordeste) = 3: PE, PB e CE formam um triângulo (há 6 triângulos), e a coloração do Welsh-Powell usa 3. Na ordem alfabética, PI chega quando já tem vizinhos com as cores 1, 2 e 3 e leva a 4ª.') },
      { t: 'Welsh-Powell no calendário de provas', d: P('Ordem por grau: Comp (5), BD (4), Alg (3), depois Est, IHC e Redes (2), em ordem alfabética.'),
        mount(el) { Gf.passoAPasso(el, PROVAS, Gf.coloracao(PROVAS, Gf.ordemGrau(PROVAS)), { tabelaEmbaixo: true, r: 6 }); },
        depois: P('Horário 1: Compiladores · Horário 2: BD e Estatística · Horário 3: Algoritmos, IHC e Redes. Prova de que é o mínimo: o triângulo Alg–BD–Comp.') },
      { t: 'Leilão da ANEEL: guloso × melhor possível', d: P('Mude a RAP de qualquer lote e veja o guloso e o ótimo mudarem. Em laranja, o melhor conjunto sem conflito.'),
        mount(el) { Gf.labPesos(el, LOTES, RAP, { id: 'aneel', rotCor: 'janelas de obra', presets: [['Valores do exemplo (L3 = 60,00)', { ...RAP }], ['L3 real (104,60)', { ...RAP, L3: 104.6 }]] }); } },
    ],
    atividades: [
      { t: 'Qual é o χ?', tipo: 'classificar', d: P('Use as regras do conteúdo.'),
        cfg: { cats: ['2', '3', '4', '5'], itens: [
          { t: 'K<sub>5</sub>', c: 3, e: 'Completo: χ = n.' },
          { t: 'Ciclo C<sub>7</sub>', c: 1, e: 'Ciclo ímpar: 3.' },
          { t: 'Ciclo C<sub>8</sub>', c: 0, e: 'Ciclo par: alterna duas cores.' },
          { t: 'Árvore com 10 vértices', c: 0, e: 'Árvore é bipartida: cores por nível alternado.' },
          { t: 'K<sub>2,5</sub>', c: 0, e: 'Bipartido completo: um lado de cada cor.' },
          { t: 'Roda: centro ligado a um C<sub>6</sub>', c: 1, e: 'O aro par usa 2 cores, e o centro, vizinho de todos, uma 3ª.' },
          { t: 'Roda: centro ligado a um C<sub>7</sub>', c: 2, e: 'Aro ímpar exige 3, mais o centro: 4.' },
        ] } },
      { t: 'Qual pergunta o enunciado faz?', tipo: 'classificar', d: P('Mesmo grafo de conflito, perguntas diferentes.'),
        cfg: { cats: ['Coloração (χ)', 'Independente máximo (α)', 'Independente de peso máximo'], itens: [
          { t: 'Qual o menor número de horários para todas as provas?', c: 0, e: 'Cada horário é uma cor.' },
          { t: 'Quantas provas, no máximo, podem acontecer no mesmo horário?', c: 1, e: 'O maior grupo sem conflito.' },
          { t: 'Que lotes o consórcio deve disputar para ter a maior receita, sem conflitos?', c: 2, e: 'Cada lote vale um valor: soma máxima.' },
          { t: 'Quantos canais de frequência bastam para as antenas, sem interferência?', c: 0, e: 'Cada canal é uma cor.' },
          { t: 'Quantas variáveis, no máximo, podem dividir o mesmo registrador ao mesmo tempo?', c: 1, e: 'Um registrador só guarda variáveis que não interferem entre si: um conjunto independente.' },
        ] } },
      { t: 'Modele você', tipo: 'qa', itens: [
        { q: 'Seis comissões precisam marcar reuniões, e duas comissões com algum membro em comum não podem se reunir no mesmo horário. Membros: Rita (Ensino, Pesquisa, Orçamento), Caio (Pesquisa, Extensão), Lia (Extensão, Eventos, Estágio), Davi (Orçamento, Eventos) e Bia (Ensino, Estágio). Desenhe o grafo, conte as arestas e encontre o menor número de horários.', a:
          P('Cada membro gera uma clique: Rita, o triângulo Ensino–Pesquisa–Orçamento; Lia, o triângulo Extensão–Eventos–Estágio; Caio, Pesquisa–Extensão; Davi, Orçamento–Eventos; Bia, Ensino–Estágio. São <b>9 arestas</b>, e todos os vértices têm grau 3 (soma 18 = 2 × 9).',
            '<b>χ = 3:</b> o triângulo de Rita obriga 3 cores, e 3 bastam: horário 1 = Ensino e Extensão; horário 2 = Pesquisa e Eventos; horário 3 = Orçamento e Estágio.') },
        { q: 'No exemplo da ANEEL, o guloso por RAP ficou com R$ 91,19 mi e o ótimo era R$ 106,61 mi. Como você justificaria, por escrito, que 106,61 é mesmo o máximo?', a:
          P('Por casos. Se o conjunto contém L5, ele não pode ter mais nenhum lote (L5 conflita com todos): total 91,19. Se não contém L5, os conflitos L1–L2 e L3–L4 obrigam a escolher no máximo um de cada par; o melhor de cada par é L1 (46,61) e L3 (60,00), e L1 e L3 não conflitam: 106,61. Como 106,61 &gt; 91,19, é o máximo.') },
        { q: 'Por que o guloso de coloração nunca usa mais que Δ + 1 cores?', a: P('Quando o guloso vai colorir v, só os vizinhos de v podem bloquear cores, e v tem no máximo Δ vizinhos. Então, entre as cores 1, 2, …, Δ + 1, pelo menos uma está livre, e o guloso pega a menor delas.') },
      ] },
    ],
    desafios: [
      { fonte: 'Inédita · Welsh-Powell', enun: P('Aplica-se o algoritmo de Welsh-Powell ao grafo abaixo, ordenando os vértices por grau decrescente e desempatando pela ordem alfabética.') + fig(WPG) + P('O número de cores usadas pelo algoritmo e o número cromático do grafo são, respectivamente,'),
        opts: ['3 cores, e χ(G) = 3.', '4 cores, e χ(G) = 4.', '4 cores, e χ(G) = 3.', '5 cores, e χ(G) = 3.'], c: 2,
        e: 'Graus: G 5; B, C, E e F 3; D 2; A 1. Ordem: G, B, C, E, F, D, A. Cor 1: G e A. Cor 2: B e C. Cor 3: E e D. F é vizinho de G (1), B (2) e E (3): leva a cor 4. Mas χ = 3: há triângulos (B–F–G) e a ordem alfabética já pinta com 3 (A, B, E = 1; C, D, F = 2; G = 3).',
        w: { 1: 'O grafo não tem K₄, e existe coloração com 3 cores (por exemplo, em ordem alfabética). O Welsh-Powell é heurística: usar 4 não prova que 4 é o mínimo.' } },
      { fonte: 'Inédita · registradores', enun: P('Na alocação de registradores, duas variáveis que estão vivas ao mesmo tempo não podem ocupar o mesmo registrador. A tabela mostra as linhas em que cada variável de um trecho de código está viva (intervalos fechados).') +
        tabela(['Variável', 'a', 'b', 'c', 'd', 'e', 'f'], [['Viva nas linhas', '1 a 3', '2 a 5', '3 a 6', '4 a 7', '6 a 8', '7 a 9']]) + P('Qual é o menor número de registradores que permite guardar todas as variáveis sem nenhuma ir para a memória?'),
        opts: ['2', '3', '4', '6'], c: 1,
        e: 'No grafo de interferência, há aresta quando os intervalos se cruzam: a–b, a–c, b–c, b–d, c–d, c–e, d–e, d–f, e–f. Na linha 3 estão vivas a, b e c, que formam um triângulo: pelo menos 3. E 3 bastam: R1 = a, d; R2 = b, e; R3 = c, f. Em grafos de intervalos, χ é exatamente o maior número de variáveis vivas ao mesmo tempo.' },
      { fonte: 'Inédita · asserção e razão', enun: P('Todo grafo planar pode ter seus vértices coloridos com, no máximo, 4 cores, sem que vértices adjacentes recebam a mesma cor', '<b>porque</b>', 'todo grafo planar possui pelo menos um vértice de grau menor ou igual a 3.', 'A respeito dessas asserções, assinale a opção correta.'),
        opts: ['As duas asserções são proposições verdadeiras, e a segunda é uma justificativa correta da primeira.', 'As duas asserções são proposições verdadeiras, mas a segunda não é uma justificativa correta da primeira.', 'A primeira asserção é uma proposição verdadeira, e a segunda é uma proposição falsa.', 'A primeira asserção é uma proposição falsa, e a segunda é uma proposição verdadeira.', 'As duas asserções são proposições falsas.'], c: 2,
        e: 'A primeira é o Teorema das Quatro Cores (Appel e Haken, 1976). A segunda é falsa: o que vale é que todo grafo planar tem um vértice de grau no máximo 5. O icosaedro é planar e todos os seus vértices têm grau 5.' },
      { fonte: 'Inédita · ciclo ímpar', enun: P('Um grafo G não possui triângulos, mas possui um ciclo de comprimento 7. Sobre o número cromático de G, é correto afirmar que'),
        opts: ['χ(G) = 2, pois G não possui triângulos.', 'χ(G) = 7, pois cada vértice do ciclo precisa de uma cor diferente.', 'G é bipartido, pois seus ciclos têm comprimento ímpar.', 'χ(G) ≥ 3, pois um ciclo de comprimento ímpar não pode ser colorido com 2 cores.'], c: 3,
        e: 'Andando pelo ciclo com 2 cores, elas se alternam; com 7 vértices, o primeiro e o último ficariam com a mesma cor, e eles são vizinhos. Logo χ ≥ 3. Bipartido é justamente não ter ciclo ímpar. Um ciclo de 7, sozinho, se pinta com 3 cores.',
        w: { 0: 'Triângulo é só um tipo de ciclo ímpar. Qualquer ciclo ímpar já exige 3 cores.' } },
      { fonte: 'Inédita · maximal × máximo', enun: P('Considere o caminho com 5 vértices a–b–c–d–e e o conjunto S = {b, d}.') + fig(CAMINHO5, { no: { b: 'sel', d: 'sel' } }, { r: 5.4 }) + P('Assinale a alternativa correta.'),
        opts: ['S é um conjunto independente maximal, mas não máximo, e α(G) = 3.', 'S é um conjunto independente máximo, pois nenhum vértice pode ser acrescentado a ele.', 'α(G) = 2, pois todo conjunto independente maximal do caminho tem 2 vértices.', '{a, c, e} não é independente, pois a e e são as pontas do caminho.'], c: 0,
        e: 'Não dá para acrescentar nenhum vértice a S: a e c são vizinhos de b, e e é vizinho de d. Então S é maximal. Mas {a, c, e} também é independente e tem 3 vértices: α(G) = 3, e S não é máximo.',
        w: { 1: 'Não poder acrescentar ninguém é a definição de maximal. Máximo é ter o maior tamanho possível, e {a, c, e} é maior.' } },
      { fonte: 'Inédita · conflito com valores', enun: P('Cinco empresas querem patrocinar um evento, com os valores indicados nos vértices, em R$ mil. Pares ligados por aresta não podem patrocinar juntos, por concorrência ou cláusula de exclusividade.') + fig(PATRO, {}, { r: 5.2 }) +
        P('A organização usa um algoritmo guloso: ordena as empresas por valor decrescente e aceita cada uma que não conflita com as já aceitas. O valor obtido pelo guloso e o maior valor possível são, respectivamente,'),
        opts: ['R$ 75 mil e R$ 75 mil.', 'R$ 62 mil e R$ 80 mil.', 'R$ 80 mil e R$ 80 mil.', 'R$ 75 mil e R$ 80 mil.'], c: 3,
        e: 'Guloso: A (40) entra; G (35) não conflita com A e entra; B, D e E são rejeitadas. Total 75. Mas B, D e E não conflitam entre si: 30 + 28 + 22 = 80. É o conjunto independente de peso máximo, e o guloso por valor não garante achá-lo.' },
    ],
  });
})();
