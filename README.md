# Revisão de Teoria dos Grafos

Site de revisão de Teoria dos Grafos para o ENADE 2026 (Ciência da Computação, CESAR School). O conteúdo é explicado do começo, para servir a quem cursou grafos há tempos, em outra turma ou outra instituição, ou só quer relembrar.

São 10 módulos. Cada um tem quatro abas:

- **Conteúdo:** explicação com figuras, pseudocódigo e armadilhas de prova.
- **Exemplos:** passo a passo interativo e laboratórios para mexer nos dados.
- **Atividades:** exercícios de classificar, perguntas com resposta e checklist.
- **Desafios:** questões de múltipla escolha comentadas. As questões de provas anteriores do ENADE aparecem primeiro, com a fonte, o enunciado e as alternativas originais; depois vêm questões inéditas no mesmo formato.

| # | Módulo | Questões do ENADE nos desafios |
|---|---|---|
| 1 | Fundamentos | 2005 (Q44) e 2011 (Q20) |
| 2 | BFS e DFS | 2008 (Q14 e Q73) |
| 3 | Caminhos mínimos | 2017 (Q24), 2021 (Q34) e 2017 Eng. de Computação (Q35) |
| 4 | Árvores e AGM | 2014 (Q30) e 2019 Eng. de Computação (Q24) |
| 5 | Labirintos e A* | 2005 (Q58) e 2008 (Q31 e Q51) |
| 6 | Euler, Hamilton e P × NP | 2011 (Q36), 2014 (Q22) e 2014 Eng. de Computação (Q22) |
| 7 | Gulosos e pseudocódigo | 2017 (Q22) |
| 8 | Coloração e conflito | só inéditas |
| 9 | Fluxo em redes | só inéditas |
| 10 | Discursivas de grafos | 2017 (discursiva 5) e 2005 (Q39), com o padrão de resposta do Inep |

As figuras das questões do ENADE foram redesenhadas a partir das provas. As provas, os gabaritos e os padrões de resposta estão no portal do Inep.

O progresso de cada estudante (desafios feitos e acertos) fica salvo só no navegador dele. O site não coleta dados.

## Publicar no GitHub Pages

1. Envie todos os arquivos desta pasta para a branch `main` de um repositório público.
2. No GitHub, abra **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**, branch `main` e pasta `/ (root)`. Clique em **Save**.
4. Em um ou dois minutos, o site fica no ar em `https://<usuário>.github.io/<repositório>/`.

O arquivo `.nojekyll` faz o GitHub servir os arquivos como estão, sem processamento.

## Abrir no computador

Basta abrir o `index.html` no navegador. Se preferir um servidor local:

```bash
python3 -m http.server 8000
# e abra http://localhost:8000
```

## Estrutura

```text
index.html              página única; carrega os scripts na ordem
css/estilo.css          visual (cores da CESAR School, tema claro e escuro)
js/lib.js               peças de interface: questões, classificação, passo a passo
js/grafos.js            desenho dos grafos em SVG, algoritmos e laboratórios
js/app.js               navegação, abas, busca, progresso e tema
js/modulos/NN-*.js      um arquivo por módulo, com conteúdo, exemplos e questões
```

Os links são do tipo `#arvores-agm` (aba Conteúdo) e `#arvores-agm-desafios` (aba Desafios). Dá para mandar o link direto de uma aba no Classroom.

## Como editar

Cada módulo é um objeto em `js/modulos/`. Para corrigir um texto, edite o arquivo do módulo e publique de novo.

Uma questão de múltipla escolha tem este formato:

```js
{
  fonte: 'Inédita · Kruskal',
  enun: P('Enunciado, que aceita HTML.'),
  opts: ['alternativa A', 'alternativa B', 'alternativa C', 'alternativa D'],
  c: 1,                       // índice da correta, a partir de 0 (aqui, B)
  e: 'Comentário mostrado depois da resposta.',
  w: { 2: 'Por que a C engana (opcional).' },
}
```

Para criar um módulo novo, copie um arquivo de `js/modulos/`, troque o `id` e acrescente a linha do script no `index.html`, antes de `js/app.js`. O módulo aparece sozinho na barra lateral, na página inicial e na busca.

Os resultados dos algoritmos que aparecem no site (tabelas do Dijkstra e do Bellman-Ford, Prim, Kruskal, BFS, DFS, coloração, Ford-Fulkerson, Fleury e o labirinto do A*) são calculados pelo próprio `js/grafos.js`, e não digitados à mão.
