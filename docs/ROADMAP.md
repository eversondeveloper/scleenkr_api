# $cleenkr — Roadmap de Refatoração Arquitetural

> **Contexto:** PDV desenvolvido para o desafio StartUp Experience (Estácio).
> Stack: Node.js + Express + PostgreSQL (Docker) · React + Vite
> Repos: [`scleenkr_api`](.) (backend) · [`scleenkr`](../scleenkr) (frontend)
>
> **Decisão arquitetural:** monolito modular primeiro — não microsserviços.
> Banco único, sem ORM pesado, sem mensageria neste estágio.
> Motivo: qualidade e manutenibilidade do código como motor principal.

---

## Estado atual (baseline)

### Backend — `scleenkr_api`

| Arquivo | Tamanho | Problema |
|---|---|---|
| `servidor.js` | ~502 linhas | 32 rotas misturadas, sem separação de responsabilidades |
| `consultas.js` | ~475 linhas | SQL raw direto, sem camadas |
| `configuracaoBanco.js` | — | Config do pool na raiz, sem `src/` |

- Sem autenticação (JWT)
- CORS aberto (`*`)
- Sem validação de entrada
- Sem handler de erros centralizado
- `.env.example` existente mas incompleto

### Frontend — `scleenkr`

| Página | Hooks | Problema |
|---|---|---|
| `pdv/` | useVendas, useEmpresa, useFiltros, useOrganizacao... | URLs da API hardcoded |
| `cadastro_produtos/` | useProdutos, useArrastaSolta | URLs hardcoded |
| `cadastro_atendentes/` | useAtendentes, useEmpresa, useSessoesCaixa... | URLs hardcoded |
| `relatorio_vendas/` | useVendas, useRetiradas, useCalculos... | URLs hardcoded |
| `gerar_cupom/` | useCupom | URLs hardcoded |

- Sem `src/api/client.js` centralizado
- `VITE_API_URL` não utilizado

---

## Estrutura-alvo (backend)

```
scleenkr_api/
├── src/
│   ├── config/
│   │   └── database.js          # ← configuracaoBanco.js migrado
│   ├── middlewares/
│   │   └── errorHandler.js      # handler central de erros
│   └── modules/
│       ├── empresas/
│       │   ├── empresas.routes.js
│       │   ├── empresas.controller.js
│       │   ├── empresas.service.js
│       │   └── empresas.repository.js
│       ├── produtos/
│       │   └── (idem)
│       ├── atendentes/
│       │   └── (idem)
│       ├── sessoes/
│       │   └── (idem)
│       ├── pagamentos/
│       │   └── (idem)
│       ├── retiradas/
│       │   └── (idem)
│       ├── relatorios/
│       │   └── (idem)
│       └── vendas/              # ← por último (transação ACID)
│           └── (idem)
└── servidor.js                  # orquestrador — só require + app.use
```

```
scleenkr/src/
└── api/
    └── client.js                # fetch centralizado via VITE_API_URL
```

---

## Regras de branch (não negociável)

- ❌ **Nunca** dar push direto em `main` ou `develop` sem autorização explícita
- Fluxo: `refactor/modulo-<dominio>` → `develop` → `main`
- Cada módulo vira uma branch-filha: `refactor/modulo-<dominio>`
- Merge sempre via PR — nunca push direto
- `develop` → `main` somente após todos os módulos revisados (aprovação explícita)

---

## Fases e checkboxes

### Fase 0 — Fundações `refactor/fase-0-fundacoes`

> Sem alterar nenhuma rota existente. Zero regressão.

- [x] Criar estrutura de pastas `src/config/` e `src/modules/`
- [x] Mover `configuracaoBanco.js` → `src/config/database.js`
- [x] Criar `src/middlewares/errorHandler.js` (captura erros não tratados)
- [x] Atualizar `.env.example` com todas as variáveis usadas no projeto
- [x] Criar `src/api/client.js` no frontend com `VITE_API_URL` (fetch wrapper)
- [x] Substituir URLs hardcoded nos hooks do frontend pelo client centralizado
- [x] Abrir PR: `refactor/fase-0-fundacoes` → `develop` ✅

---

### Fase 1 — Módulo piloto: Empresas `refactor/modulo-empresas`

> Piloto que define o padrão de todos os outros módulos.

- [x] Criar `src/modules/empresas/empresas.repository.js` (SQL extraído de `consultas.js`)
- [x] Criar `src/modules/empresas/empresas.service.js` (regra de negócio, chama repository)
- [x] Criar `src/modules/empresas/empresas.controller.js` (req/res, chama service)
- [x] Criar `src/modules/empresas/empresas.routes.js` (Express Router)
- [x] Registrar router no `servidor.js` (`app.use('/empresas', empresasRoutes)`)
- [x] Remover rotas de empresas do `servidor.js` e queries do `consultas.js`
- [x] Validar: todos os endpoints de empresas respondem igual ao baseline
- [x] Abrir PR: `refactor/modulo-empresas` → `develop` ✅

---

### Fase 2 — Módulos independentes `refactor/modulo-<nome>`

> Mesma estrutura do piloto. Um PR por módulo.

- [x] `produtos` — inclui gestão de estoque e categorias ✅
- [x] `atendentes` — cadastro e listagem ✅
- [x] `pagamentos` — atualização de pagamentos por venda ✅
- [x] `retiradas` — fluxo de retirada de caixa ✅
- [x] `observacoes` — observações diárias (CRUD) ✅
- ~~`relatorios`~~ — não há queries de agregação no backend; cálculos feitos no frontend
- [x] Remover rotas e queries correspondentes de `servidor.js` / `consultas.js` ✅

---

### Fase 3 — Módulo crítico: Sessões `refactor/modulo-sessoes`

> Sessões de caixa: dependente de atendentes. Fazer após Fase 2 completa.

- [ ] Criar módulo `sessoes` completo (routes/controller/service/repository)
- [ ] Garantir que abertura/fechamento de sessão seja transação atômica
- [ ] Validar integração com módulo `atendentes`
- [ ] Abrir PR: `refactor/modulo-sessoes` → `develop`

---

### Fase 4 — Módulo crítico: Vendas `refactor/modulo-vendas`

> **Por último.** `criarVenda` toca 4 tabelas em uma única transação ACID:
> `vendas` + `pagamentos` + `itens_vendidos` + `produtos` (estoque).
> Qualquer erro no meio deve dar rollback total.

- [ ] Criar `vendas.repository.js` com transação explícita (`BEGIN / COMMIT / ROLLBACK`)
- [ ] Criar `vendas.service.js` mantendo toda a lógica de negócio de venda
- [ ] Criar `vendas.controller.js` e `vendas.routes.js`
- [ ] Validar: cenário de falha no meio da venda deve reverter tudo
- [ ] Após esta fase, `consultas.js` deve estar vazio (pode ser deletado)
- [ ] Abrir PR: `refactor/modulo-vendas` → `develop`

---

### Fase 5 — Segurança `refactor/fase-5-seguranca`

> Hoje: sem auth, CORS `*`, sem validação.

- [ ] Adicionar `helmet` (headers HTTP de segurança)
- [ ] Configurar CORS com lista de origens permitidas (não `*`)
- [ ] Implementar JWT (login de atendente/empresa, token por sessão de caixa)
- [ ] Adicionar `express-validator` ou `zod` nas rotas de entrada
- [ ] Implementar `rate-limit` nas rotas públicas
- [ ] Abrir PR: `refactor/fase-5-seguranca` → `develop`

---

### Fase 6 — Sync em nuvem `refactor/modulo-sync`

> Módulo de sincronização: candidato a serviço independente depois desta fase.

- [ ] Definir estratégia: pull periódico vs. webhook vs. fila
- [ ] Implementar como módulo dentro do monolito primeiro
- [ ] Documentar interface pública (candidatura a microserviço futuro)
- [ ] Abrir PR: `refactor/modulo-sync` → `develop`

---

### Fase 7 — Merge final e performance `develop` → `main`

- [ ] Adicionar índices no banco (colunas usadas em WHERE/JOIN frequentes)
- [ ] Revisar queries N+1 (principal suspeito da lentidão reportada)
- [ ] Smoke test completo dos endpoints
- [ ] Atualizar `README.md` com nova estrutura e instruções de setup
- [ ] PR de merge: `develop` → `main` (com aprovação explícita)

---

## Domínios mapeados

| Domínio | Backend | Frontend (hook) |
|---|---|---|
| empresas | `src/modules/empresas/` ✅ | `useEmpresa.js` (PDV + atendentes) |
| produtos | `src/modules/produtos/` ✅ | `useProdutos.jsx` |
| atendentes | `servidor.js` (legado) | `useAtendentes.jsx` |
| sessões de caixa | `servidor.js` (legado) | `useSessoesCaixa.jsx` |
| vendas | `servidor.js` (legado) | `useVendas.jsx` (PDV + relatórios) |
| pagamentos | `consultas.js` (legado) | `MetodosPagamento.jsx` |
| retiradas | `servidor.js` (legado) | `useRetiradas.jsx` |
| relatórios | `consultas.js` (legado) | `useCalculos.jsx`, `useGeracaoPDF.jsx` |
| cupom | `consultas.js` (legado) | `useCupom.jsx` |

---

## Por que monolito modular (e não microsserviços)?

- `criarVenda` é uma transação ACID de 4 tabelas — fatiamento exigiria SAGA/outbox pattern, overhead desnecessário agora
- Escala organizacional de microsserviços não se aplica a time pequeno
- A lentidão reportada é quase certamente ausência de índices, não arquitetura
- Monolito modular entrega as mesmas fronteiras de domínio sem o custo operacional de múltiplos serviços

---

*Última atualização: 2026-04-24 — Fase 0 ✅ · Fase 1 ✅ · Fase 2 ✅ · Fase 3 em andamento*
