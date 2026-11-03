/* Módulo 7 · Algoritmos gulosos e pseudocódigo */
(function () {
  const { P, dica, armadilha, nota, lista, passos, codigo, tabela, h } = window.UI;
  const Gf = window.Grafos;

  const AUD = [
    { id: 'A', ini: 8, fim: 16, nome: 'Feira de estágios', val: 9 }, { id: 'B', ini: 9, fim: 11, nome: 'Oficina de Git', val: 3 },
    { id: 'C', ini: 10, fim: 12, nome: 'Palestra de IA', val: 5 }, { id: 'D', ini: 11, fim: 14, nome: 'Workshop de UX', val: 4 },
    { id: 'E', ini: 13, fim: 15, nome: 'Mesa-redonda', val: 6 }, { id: 'F', ini: 14, fim: 17, nome: 'Minicurso de Python', val: 3 },
    { id: 'G', ini: 17, fim: 18, nome: 'Defesa de TCC', val: 2 },
  ];
  const T6 = [['T1', 8, 12], ['T2', 10, 11], ['T3', 11, 13], ['T4', 13, 16], ['T5', 15, 17], ['T6', 16, 18]];
  const COD_ATIV = ['SELECIONA-ATIVIDADES(a)          // a[i] = (inicio[i], fim[i])', '1  ordene a por fim crescente     // critério', '2  S ← {a[1]};  k ← 1             // a primeira sempre entra',
    '3  para i ← 2 até n faça', '4      se inicio[i] ≥ fim[k] então  // viabilidade', '5          S ← S ∪ {a[i]}         // atualização', '6          k ← i', '7  devolva S                      // retorno'];

  /** melhor subconjunto compatível por força bruta (para comparar com os gulosos) */
  function melhorValor(ativs) {
    const comp = (a, b) => a.fim <= b.ini || b.fim <= a.ini;
    let best = { val: -1, S: [] };
    for (let m = 1; m < 1 << ativs.length; m++) {
      const S = ativs.filter((_, i) => m & (1 << i));
      if (S.some((a, i) => S.some((b, j) => i < j && !comp(a, b)))) continue;
      const val = S.reduce((s, a) => s + a.val, 0);
      if (val > best.val) best = { val, S };
    }
    return best;
  }

  window.MODULOS.push({
    id: 'gulosos',
    curto: 'Gulosos e pseudocódigo',
    titulo: 'Algoritmos gulosos e como escrever o pseudocódigo',
    grupo: 'Modelagem e complexidade',
    enade: 'ENADE 2017 (questão 22) e ENADE 2014 (questão 30, no módulo de árvores), nos desafios',
    resumo: 'O que torna um guloso ótimo, uma receita de cinco perguntas para escrever qualquer guloso, seleção de atividades, troco, mochila e os contraexemplos que derrubam alternativas.',
    topicos: [
      { t: 'O que define um algoritmo guloso', h:
        P('Um <b>guloso</b> constrói a solução em etapas e, em cada etapa, faz a escolha que parece a melhor <b>naquele momento</b>, sem nunca voltar atrás. É rápido e simples. A pergunta é quando isso dá a resposta ótima.') +
        lista(['<b>Propriedade da escolha gulosa:</b> existe uma solução ótima que começa pela escolha gulosa. É o que separa o guloso da programação dinâmica.', '<b>Subestrutura ótima:</b> depois da primeira escolha, sobra um problema menor do mesmo tipo, e a solução ótima dele completa a do todo. Guloso e programação dinâmica exigem essa propriedade.']) +
        P('<b>Gulosos que vocês já viram:</b> Dijkstra fecha o vértice de menor distância; Kruskal pega a aresta mais leve que não fecha ciclo; Prim pega a aresta mais leve que sai da árvore. Os três são ótimos.') +
        nota('A programação dinâmica também usa subestrutura ótima, mas não confia na escolha gulosa: testa várias escolhas, guarda os resultados e só depois decide. O guloso decide e segue.') },
      { t: 'Quando o guloso é ótimo, e quando não é', h:
        tabela(['Domínio', 'Guloso é ótimo', 'Guloso falha'], [
          ['Moedas', 'sistemas canônicos, como o real', 'sistemas arbitrários, como {1, 3, 4}'],
          ['Mochila', 'fracionária (pela razão valor/peso)', '0/1: precisa de programação dinâmica'],
          ['Grafos', 'Kruskal, Prim e Dijkstra (pesos ≥ 0)', 'coloração, conjunto independente, caixeiro'],
          ['Escalonamento', 'seleção de atividades (por término)', 'seleção com valores diferentes'],
        ]) +
        P('<b>Moedas {1, 3, 4}, troco 6:</b> o guloso pega 4 + 1 + 1, três moedas. O ótimo é 3 + 3, duas.') +
        armadilha('Um contraexemplo basta para provar que um guloso não é ótimo. Acertar em um caso, ou em dez, não prova nada.') },
      { t: 'Receita: cinco perguntas para escrever um guloso', h:
        passos(['<b>Entrada e saída.</b> O que recebo? O que devolvo?', '<b>Critério.</b> Em que ordem olho os candidatos? É a escolha gulosa.', '<b>Viabilidade.</b> O candidato pode entrar sem quebrar a regra?', '<b>Atualização.</b> O que muda quando ele entra?', '<b>Retorno e custo.</b> O que devolvo e quanto custa? Ordenar já custa O(n log n).']) +
        codigo(['GULOSO(C)                        // 1: C = candidatos', '1  S ← ∅', '2  ordene C pelo critério        // 2', '3  para cada c ∈ C nessa ordem faça', '4      se S ∪ {c} é viável então  // 3', '5          S ← S ∪ {c}            // 4', '6  devolva S                     // 5'], 'Esqueleto do guloso') +
        P('O que entra nunca sai (linha 5). É isso que deixa o guloso rápido, e é exatamente por isso que ele pode errar: não existe arrependimento.') },
      { t: 'Seleção de atividades, construída pela receita', h:
        P('<b>Problema:</b> um auditório recebeu sete pedidos de reserva para sábado, cada um com início e fim. Queremos atender o <b>maior número</b> de eventos sem sobreposição.') +
        lista(['<b>Entrada:</b> n reservas, a[i] = (inicio[i], fim[i]). <b>Saída:</b> o conjunto S.', '<b>Critério:</b> fim crescente: quem libera o auditório mais cedo.', '<b>Viável:</b> começa depois que a última aceita termina.', '<b>Atualização:</b> entra em S e vira a última aceita (k).', '<b>Custo:</b> ordenar, O(n log n), mais um laço, O(n).']) +
        codigo(COD_ATIV, 'Seleção de atividades') +
        P('Com a lista ordenada por fim, basta comparar cada reserva com a última aceita: é o k. Executando no auditório (aba Exemplos), a ordem por fim é B, C, D, E, A, F, G, e o resultado é S = {B, D, F, G}: quatro eventos, o máximo possível.') +
        armadilha('O teste é <b>≥</b>: começar exatamente quando a outra termina pode. D começa às 11h, quando B termina. Com &gt; no lugar de ≥, o algoritmo descarta reservas que cabiam.') },
      { t: 'Por que ordenar pelo término?', h:
        lista(['<b>Início mais cedo:</b> a feira (8h–16h) começa primeiro e ocupa o dia; só sobra G. Dois eventos.', '<b>Menor duração:</b> G e B são curtas, mas E (13h–15h) entra e bloqueia D e F. Três eventos.', '<b>Término mais cedo:</b> quem termina primeiro libera o auditório mais cedo e sobra mais tempo para o resto. Quatro eventos.']) +
        P('<b>Prova por troca:</b> pegue qualquer solução ótima O. Se ela não começa pela reserva a<sub>1</sub>, de menor término, troque a primeira reserva de O por a<sub>1</sub>: como a<sub>1</sub> termina antes, nada passa a se sobrepor, e o tamanho continua o mesmo. Logo existe solução ótima que começa pela escolha gulosa.') },
      { t: 'O mesmo esqueleto, outros algoritmos', h:
        tabela(['Algoritmo', 'Critério (linha 2)', 'Viabilidade (linha 4)', 'Ótimo?'], [
          ['Seleção de atividades', 'fim crescente', 'início ≥ fim da última aceita', '<span class="ok">sim</span>'],
          ['Kruskal (AGM)', 'peso crescente', 'não fecha ciclo: FIND-SET(u) ≠ FIND-SET(v)', '<span class="ok">sim</span>'],
          ['Troco', 'maior moeda primeiro', 'não passa do valor que falta', 'só no sistema canônico'],
          ['Mochila fracionária', 'maior valor/peso', 'cabe inteiro? senão, leva a fração que cabe', '<span class="ok">sim</span>'],
          ['Lotes com recompensa', 'maior recompensa', 'não conflita com nenhum escolhido', '<span class="nok">não</span>'],
          ['Coloração gulosa', 'grau decrescente', 'sempre entra, com a menor cor livre', '<span class="nok">não</span>'],
        ]) +
        P('Para trocar de problema, troque só as linhas 2 e 4 do esqueleto. Prim e Dijkstra seguem a mesma lógica com fila de prioridade: extraem o vértice de menor chave e nunca mais o reabrem.') +
        dica('Na prova, se pedirem um guloso que você nunca viu, comece pelo esqueleto e decida a linha 2 e a linha 4.') },
      { t: 'Troco: quando a maior moeda resolve', h:
        P('O guloso do troco percorre as moedas da maior para a menor e, enquanto a moeda couber no valor que falta, usa a moeda e desconta. No real, ele sempre devolve o mínimo: 68 centavos = 50 + 10 + 5 + 1 + 1 + 1, seis moedas. Sistemas em que isso sempre vale se chamam <b>canônicos</b>.',
          'Com moedas {1, 3, 4}, troco 6, ele devolve 4 + 1 + 1, três moedas, mas 3 + 3 resolve com duas. Para sistemas arbitrários, o mínimo vem da programação dinâmica: mín[v] = 1 + menor mín[v − m] entre as moedas m ≤ v.') +
        dica('No laboratório da aba Exemplos, teste {1, 5, 6, 9} com troco 11: o guloso faz 9 + 1 + 1, e o mínimo é 6 + 5.') },
      { t: 'Mochila fracionária × mochila 0/1', h:
        P('Uma mochila aguenta 50 kg. Itens: 10 kg valendo R$ 60 (6/kg), 20 kg valendo R$ 100 (5/kg) e 30 kg valendo R$ 120 (4/kg).') +
        lista(['<b>Fracionária</b> (pode levar pedaço): ordene por valor/peso e encha. Leva os dois primeiros inteiros e 20 kg do terceiro: 60 + 100 + 80 = <b>R$ 240</b>, o ótimo.', '<b>0/1</b> (tudo ou nada): o mesmo critério leva 10 kg + 20 kg = R$ 160 e não cabe mais nada inteiro. O ótimo é 20 kg + 30 kg = <b>R$ 220</b>. Aqui o guloso falha, e a resposta vem da programação dinâmica.']) },
      { t: 'Seleção com valores: o guloso não basta', h:
        P('Se cada reserva tem um valor e o objetivo é o <b>valor total</b>, nenhum critério guloso simples garante o ótimo. No auditório, com os valores da aba Exemplos:') +
        tabela(['Estratégia', 'Escolhe', 'Valor total'], [['Maior valor primeiro', 'A, G', '11'], ['Término mais cedo', 'B, D, F, G', '12'], ['Melhor possível', 'C, E, G', '<b>13</b>']]) +
        P('A técnica correta é programação dinâmica: ordene por término e, para cada reserva, compare “usar a reserva” (valor dela mais o melhor até a última compatível) com “não usar”.') },
    ],
    exemplos: [
      { t: 'Três critérios no mesmo sábado', d: P('Troque o critério e veja quantos eventos cabem. Laranja: aceita. Cinza: rejeitada.'),
        mount(el) { Gf.labCriterios(el, AUD, { nomes: true }); } },
      { t: 'Rastro do algoritmo por término', d: P('A tabela é a mesma que se monta na prova: ordem, reserva e decisão.'),
        mount(el) { Gf.passoTempo(el, AUD, Gf.selecao(AUD, 'fim'), { nomes: true }); } },
      { t: 'Seleção com valores: guloso × melhor possível', d: P('Agora cada evento rende um valor (número na barra). O objetivo é o maior valor total.'),
        mount(el) {
          const figura = h('div', { class: 'lab-fig larga' });
          const txt = h('p', { class: 'lab-status', 'aria-live': 'polite' });
          const bots = h('div', { class: 'lab-bots' });
          const o = melhorValor(AUD);
          const vistas = {
            val: [Gf.selecao(AUD, 'val').S, 'Maior valor primeiro'], fim: [Gf.selecao(AUD, 'fim').S, 'Término mais cedo'], otimo: [o.S, 'Melhor possível (testa as 127 combinações)'],
          };
          const mostra = (k) => {
            const [S, rot] = vistas[k];
            const est = {};
            AUD.forEach((a) => (est[a.id] = S.includes(a) ? 'sel' : 'rej'));
            Gf.desenhaTempo(figura, AUD, est, { nomes: true, valores: true });
            const v = S.reduce((s, a) => s + a.val, 0);
            txt.innerHTML = `<b>${rot}:</b> ${S.map((a) => a.id).join(', ')} · valor total <b>${v}</b>${k === 'otimo' ? '.' : ` (o melhor possível é ${o.val}).`}`;
            [...bots.children].forEach((b) => b.classList.toggle('ativo', b.dataset.k === k));
          };
          [['val', 'Maior valor'], ['fim', 'Término'], ['otimo', 'Melhor possível']].forEach(([k, r]) => bots.append(h('button', { class: 'btn-sec', type: 'button', 'data-k': k, onclick: () => mostra(k) }, r)));
          el.append(h('div', { class: 'lab' }, figura, txt, bots));
          mostra('val');
        } },
      { t: 'Laboratório do troco', d: P('Digite um sistema de moedas e um valor. O site compara o guloso com o mínimo calculado por programação dinâmica.'),
        mount(el) { Gf.labTroco(el); } },
    ],
    atividades: [
      { t: 'O guloso é ótimo aqui?', tipo: 'classificar', d: P('Para cada problema, o guloso indicado garante a melhor resposta?'),
        cfg: { cats: ['Sempre ótimo', 'Pode falhar'], itens: [
          { t: 'Troco com as moedas do real, maior moeda primeiro.', c: 0, e: 'O real é um sistema canônico.' },
          { t: 'Troco com moedas {1, 3, 4}, maior moeda primeiro.', c: 1, e: 'Troco 6: 4 + 1 + 1 contra 3 + 3.' },
          { t: 'Mochila fracionária, maior valor/peso primeiro.', c: 0, e: 'Poder levar pedaço torna a escolha gulosa segura.' },
          { t: 'Mochila 0/1, maior valor/peso primeiro.', c: 1, e: 'O exemplo de 50 kg: R$ 160 contra R$ 220.' },
          { t: 'Maior número de reservas, por término mais cedo.', c: 0, e: 'É a seleção de atividades, com prova por troca.' },
          { t: 'Maior valor total de reservas, por maior valor.', c: 1, e: 'No auditório: 11 contra 13.' },
          { t: 'Caminho mínimo com pesos negativos, pelo Dijkstra.', c: 1, e: 'Com aresta negativa, um vértice fechado pode ainda melhorar.' },
          { t: 'Árvore geradora mínima pelo Kruskal.', c: 0, e: 'A aresta mais leve que não fecha ciclo é sempre segura.' },
        ] } },
      { t: 'Cada linha responde a qual pergunta?', tipo: 'classificar', d: P('Pseudocódigo guloso da mochila fracionária. Associe cada linha a uma pergunta da receita.'),
        cfg: { cats: ['Critério', 'Viabilidade', 'Atualização', 'Retorno'], itens: [
          { t: '<code>ordene os itens por valor[i]/peso[i] decrescente</code>', c: 0, e: 'Define a ordem: é a escolha gulosa.' },
          { t: '<code>se peso[i] ≤ cap então</code>', c: 1, e: 'Testa se o item cabe inteiro.' },
          { t: '<code>cap ← cap − peso[i];  total ← total + valor[i]</code>', c: 2, e: 'O que muda quando o item entra.' },
          { t: '<code>senão total ← total + valor[i] · cap/peso[i];  cap ← 0</code>', c: 2, e: 'Leva a fração que cabe e enche a mochila.' },
          { t: '<code>devolva total</code>', c: 3, e: 'O que o algoritmo entrega.' },
        ] } },
      { t: 'Escreva você', tipo: 'qa', itens: [
        { q: 'Escreva o pseudocódigo guloso da mochila fracionária, com capacidade C e n itens (peso[i], valor[i]). Qual é o custo?', a:
          codigo(['MOCHILA-FRACIONARIA(peso, valor, C)', '1  ordene os itens por valor[i]/peso[i] decrescente', '2  cap ← C;  total ← 0', '3  para i ← 1 até n faça', '4      se cap = 0 então pare', '5      se peso[i] ≤ cap então', '6          cap ← cap − peso[i];  total ← total + valor[i]', '7      senão', '8          total ← total + valor[i] · cap / peso[i];  cap ← 0', '9  devolva total']) + P('Custo: O(n log n) pela ordenação; o laço é O(n).') },
        { q: 'Mostre, com um exemplo de três reservas, que o critério “menor duração primeiro” não maximiza o número de eventos.', a: P('Reservas 8h–11h, 10h–12h e 11h–14h. A mais curta, 10h–12h (2 h), entra primeiro e bate com as outras duas: 1 evento. Por término, entram 8h–11h e 11h–14h: 2 eventos.') },
        { q: 'No esqueleto guloso, o que muda da seleção de atividades para o Kruskal?', a: P('Só as linhas 2 e 4. Critério: peso crescente das arestas, em vez de fim crescente. Viabilidade: a aresta não fecha ciclo (FIND-SET(u) ≠ FIND-SET(v)), em vez de “começa depois da última aceita”. A atualização do Kruskal ainda une as duas árvores (UNION).') },
      ] },
    ],
    desafios: [
      { fonte: 'Inédita · completar o pseudocódigo', enun: P('O pseudocódigo a seguir deve devolver as moedas do troco de um valor v, pelo critério guloso. O vetor m[1..k] guarda os valores das moedas em ordem decrescente, e m[k] = 1.') +
        codigo(['TROCO(m, v)', '1  S ← lista vazia', '2  para i ← 1 até k faça', '3      enquanto ___ I ___ faça', '4          acrescente m[i] a S', '5          ___ II ___', '6  devolva S']) + P('Assinale a alternativa que completa corretamente as lacunas I e II.'),
        opts: ['I: <code>v > m[i]</code>  ·  II: <code>v ← v − m[i]</code>', 'I: <code>v ≠ 0</code>  ·  II: <code>v ← v − m[i]</code>', 'I: <code>m[i] ≤ v</code>  ·  II: <code>v ← v − m[i]</code>', 'I: <code>m[i] ≤ v</code>  ·  II: <code>i ← i + 1</code>'], c: 2,
        e: 'Enquanto a moeda couber no que falta (m[i] ≤ v), ela entra e o valor diminui. Com m = (4, 3, 1) e v = 6, o algoritmo devolve 4, 1, 1: está correto como guloso, mesmo não sendo o mínimo nesse sistema.',
        w: { 0: 'Com &gt;, a moeda que é exatamente igual ao que falta nunca entra: no fim, com m[k] = 1 e v = 1, o laço para e sobra 1 sem pagar.', 1: 'Com v ≠ 0, a moeda grande é descontada mesmo quando não cabe, e v fica negativo.', 3: 'Sem descontar v, a condição não muda; mexer em i dentro do laço “para” quebra a varredura das moedas.' } },
      { fonte: 'Inédita · rastrear o pseudocódigo', enun: P('Seis tarefas disputam a mesma sala, nos horários da tabela. Executa-se o algoritmo SELECIONA-ATIVIDADES (fim crescente e teste inicio[i] ≥ fim[k]).') +
        tabela(['Tarefa', 'Início', 'Fim'], T6.map(([t, a, b]) => [t, `${a}h`, `${b}h`])) + P('O conjunto devolvido pelo algoritmo é'),
        opts: ['{T2, T4}.', '{T2, T3, T4, T6}.', '{T1, T4, T6}.', '{T2, T3, T5}.'], c: 1,
        e: 'Ordem por fim: T2 (11h), T1 (12h), T3 (13h), T4 (16h), T5 (17h), T6 (18h). T2 entra; T1 começa às 8h &lt; 11h, rejeita; T3 começa às 11h ≥ 11h, entra; T4 começa às 13h ≥ 13h, entra; T5 começa às 15h &lt; 16h, rejeita; T6 começa às 16h ≥ 16h, entra.',
        w: { 0: 'É o que sai com &gt; no lugar de ≥: T3 e T6 começam exatamente quando a anterior termina e podiam entrar.', 2: 'É o resultado de ordenar por início.', 3: 'É o resultado de ordenar por duração.' } },
      { fonte: 'ENADE 2017 · Questão 22', enun:
        P('Um país utiliza moedas de 1, 5, 10, 25 e 50 centavos. Um programador desenvolveu o método a seguir, que implementa a estratégia gulosa para o problema do troco mínimo. Esse método recebe como parâmetro um valor inteiro, em centavos, e retorna um <i>array</i> no qual cada posição indica a quantidade de moedas de cada valor.') +
        codigo(['public static int[] troco(int valor){', '    int[] moedas = new int[5];', '    moedas[4] = valor / 50;', '    valor = valor % 50;', '    moedas[3] = valor / 25;', '    valor = valor % 25;', '    moedas[2] = valor / 10;', '    valor = valor % 10;', '    moedas[1] = valor / 5;', '    valor = valor % 5;', '    moedas[0] = valor;', '    return(moedas);', '}']) +
        P('Considerando o método apresentado, avalie as asserções a seguir e a relação proposta entre elas.', 'I. O método guloso encontra o menor número de moedas para o valor de entrada, considerando as moedas do país.') +
        '<p class="porque">PORQUE</p>' +
        P('II. Métodos gulosos sempre encontram a solução global ótima.', 'A respeito dessas asserções, assinale a opção correta.'),
        opts: ['As asserções I e II são proposições verdadeiras, e a II é uma justificativa correta da I.', 'As asserções I e II são proposições verdadeiras, mas a II não é uma justificativa correta da I.', 'A asserção I é uma proposição verdadeira, e a II é uma proposição falsa.', 'A asserção I é uma proposição falsa, e a II é uma proposição verdadeira.', 'As asserções I e II são proposições falsas.'], c: 2,
        e: 'I é verdadeira: {1, 5, 10, 25, 50} é um sistema canônico, como o real, e para ele pegar sempre a maior moeda que cabe dá o mínimo. II é falsa: com moedas {1, 3, 4} e troco 6, o guloso usa 4 + 1 + 1 e o mínimo é 3 + 3. O guloso acerta aqui por causa das moedas, não por ser guloso.',
        w: { 0: 'A II é falsa: um contraexemplo basta, como {1, 3, 4} com troco 6.', 3: 'A I é verdadeira para essas moedas: o sistema é canônico.' } },
      { fonte: 'Inédita · mochila fracionária', enun: P('Uma mochila suporta 10 kg. Há três mercadorias, que podem ser fracionadas: X com 6 kg e valor R$ 30, Y com 5 kg e valor R$ 40, e Z com 4 kg e valor R$ 24. Qual é o maior valor que cabe na mochila?'),
        opts: ['R$ 62', 'R$ 64', 'R$ 65', 'R$ 69'], c: 3,
        e: 'Valor por kg: Y 8, Z 6, X 5. Leva Y inteira (5 kg, R$ 40), Z inteira (4 kg, R$ 24) e 1 kg de X (R$ 5): R$ 69. R$ 62 é pegar na ordem da lista (X inteira e 4 kg de Y); R$ 64, a resposta da mochila 0/1; R$ 65, o guloso por valor absoluto.',
        w: { 0: 'É pegar as mercadorias na ordem em que aparecem (X inteira e 4 kg de Y), sem critério guloso.', 1: 'R$ 64 é o ótimo da mochila 0/1 (Y e Z inteiras). Aqui as mercadorias podem ser fracionadas: ainda cabe 1 kg de X.', 2: 'É o guloso por maior valor (Y, depois 5/6 de X), que ignora o peso.' } },
      { fonte: 'Inédita · Kruskal no esqueleto', enun: P('No esqueleto genérico de um algoritmo guloso, a linha de viabilidade decide se um candidato pode entrar na solução. No algoritmo de Kruskal, com a estrutura de conjuntos disjuntos, essa linha corresponde a'),
        opts: ['FIND-SET(u) ≠ FIND-SET(v).', 'peso(u, v) &lt; peso da última aresta aceita.', 'u ainda não foi visitado.', 'grau(u) &lt; 2 e grau(v) &lt; 2.'], c: 0,
        e: 'A aresta (u, v) só entra se u e v estão em árvores diferentes da floresta; senão, fecharia um ciclo. Depois de aceitar, UNION(u, v) une as árvores. A ordem por peso já está garantida pela linha do critério.',
        w: { 3: 'Limitar grau a 2 é condição de construção de caminho ou circuito (caixeiro), não de árvore geradora.', 2: '“Visitado” é condição do Prim ou das buscas, que crescem a partir de um vértice.' } },
      { fonte: 'Inédita · seleção com valores', enun: P('Um auditório recebe pedidos de reserva, cada um com início, fim e um valor em reais. Deseja-se o maior valor total sem sobreposição.') +
        '<ol class="enun-afirm"><li>I. Ordenar por maior valor e aceitar cada reserva compatível com as já aceitas sempre produz o valor máximo.</li><li>II. Ordenar por término mais cedo e aceitar cada reserva compatível sempre produz o valor máximo.</li><li>III. Para garantir o valor máximo, é preciso uma técnica que compare combinações, como a programação dinâmica.</li></ol>' + P('É correto o que se afirma em'),
        opts: ['I, apenas.', 'III, apenas.', 'I e II, apenas.', 'II e III, apenas.'], c: 1,
        e: 'I falha com X 8h–12h (R$ 10), Y 8h–10h (R$ 6) e Z 10h–12h (R$ 6): por valor, só X (R$ 10); o ótimo é Y + Z (R$ 12). II falha com Y 8h–10h (R$ 1), X 8h–12h (R$ 10) e Z 10h–12h (R$ 1): por término, Y + Z (R$ 2); o ótimo é X. O término maximiza a <b>quantidade</b>, não o valor.' },
    ],
  });
})();
