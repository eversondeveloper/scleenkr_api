# $cleenkr — Roadmap de Refatoração Arquitetural

> **Contexto:** PDV desenvolvido para o desafio StartUp Experience (Estácio).
> Stack: Node.js + Express + PostgreSQL (Docker) · React + Vite
> Repos: [`scleenkr_api`](.) (backend) · [`scleenkr`](../scleenkr) (frontend)
>
> **Decisão arquitetural:** monolito modular.
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
- `.env.example` existente mas ainda incompleto

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

## Fluxo de branch

- ❌ **Nunca** dar push direto em `main` ou `develop` sem autorização
- Branch-mãe da refatoração: `refactor/modular-architecture`
- Cada módulo/fase vira branch-filha: `refactor/modulo-<dominio>`
- Merge das branches-filha → mãe primeiro; mãe → develop/main só após revisão

---

## Fases e checkboxes

### Fase 0 — Fundações `refactor/fase-0-fundacoes`

> Sem alterar nenhuma rota existente. Zero regressão.

- [ ] Criar estrutura de pastas `src/config/` e `src/modules/`
- [ ] Mover `configuracaoBanco.js` → `src/config/database.js`
- [ ] Criar `src/middlewares/errorHandler.js` (captura erros não tratados)
- [ ] Atualizar `.env.example` com todas as variáveis usadas no projeto
- [ ] Criar `src/api/client.js` no frontend com `VITE_API_URL` (fetch wrapper)
- [ ] Substituir URLs hardcoded nos hooks do frontend pelo client centralizado
- [ ] Abrir PR: `refactor/fase-0-fundacoes` → `refactor/modular-architecture`

---

### Fase 1 — Módulo piloto: Empresas `refactor/modulo-empresas`

> Piloto que define o padrão de todos os outros módulos.

- [ ] Criar `src/modules/empresas/empresas.repository.js` (SQL extraído de `consultas.js`)
- [ ] Criar `src/modules/empresas/empresas.service.js` (regra de negócio, chama repository)
- [ ] Criar `src/modules/empresas/empresas.controller.js` (req/res, chama service)
- [ ] Criar `src/modules/empresas/empresas.routes.js` (Express Router)
- [ ] Registrar router no `servidor.js` (`app.use('/empresas', empresasRoutes)`)
- [ ] Remover rotas de empresas do `servidor.js` e queries do `consultas.js`
- [ ] Validar: todos os endpoints de empresas respondem igual ao baseline
- [ ] Abrir PR: `refactor/modulo-empresas` → `refactor/modular-architecture`

---

### Fase 2 — Módulos independentes `refactor/modulo-<nome>`

> Mesma estrutura do piloto. Um PR por módulo.

- [ ] `produtos` — inclui gestão de estoque e categorias
- [ ] `atendentes` — cadastro e listagem
- [ ] `pagamentos` — tipos e registros
- [ ] `retiradas` — fluxo de retirada de caixa
- [ ] `relatorios` — queries de agregação/resumo
- [ ] Remover rotas e queries correspondentes de `servidor.js` / `consultas.js`

---

### Fase 3 — Módulo crítico: Sessões `refactor/modulo-sessoes`

> Sessões de caixa: dependente de atendentes. Fazer após Fase 2 completa.

- [ ] Criar módulo `sessoes` completo (routes/controller/service/repository)
- [ ] Garantir que abertura/fechamento de sessão seja transação atômica
- [ ] Validar integração com módulo `atendentes`
- [ ] Abrir PR: `refactor/modulo-sessoes` → `refactor/modular-architecture`

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
- [ ] Abrir PR: `refactor/modulo-vendas` → `refactor/modular-architecture`

---

### Fase 5 — Segurança `refactor/fase-5-seguranca`

> Hoje: sem auth, CORS `*`, sem validação.

- [ ] Adicionar `helmet` (headers HTTP de segurança)
- [ ] Configurar CORS com lista de origens permitidas (não `*`)
- [ ] Implementar JWT (login de atendente/empresa, token por sessão de caixa)
- [ ] Adicionar `express-validator` ou `zod` nas rotas de entrada
- [ ] Implementar `rate-limit` nas rotas públicas
- [ ] Abrir PR: `refactor/fase-5-seguranca` → `refactor/modular-architecture`

---

### Fase 6 — Sync em nuvem `refactor/modulo-sync`

> Módulo de sincronização: candidato a serviço independente depois desta fase.

- [ ] Definir estratégia: pull periódico vs. webhook vs. fila
- [ ] Implementar como módulo dentro do monolito primeiro
- [ ] Documentar interface pública (candidatura a microserviço futuro)
- [ ] Abrir PR: `refactor/modulo-sync` → `refactor/modular-architecture`

---

### Fase 7 — Merge final e performance `refactor/modular-architecture` → `develop`

- [ ] Adicionar índices no banco (colunas usadas em WHERE/JOIN frequentes)
- [ ] Revisar queries N+1 (principal suspeito da lentidão reportada)
- [ ] Smoke test completo dos endpoints
- [ ] Atualizar `README.md` com nova estrutura e instruções de setup
- [ ] PR de merge: `refactor/modular-architecture` → `develop` (com aprovação explícita)

---

## Domínios mapeados

| Domínio | Backend | Frontend (hook) |
|---|---|---|
| empresas | `servidor.js` (rotas mistas) | `useEmpresa.js` (PDV + atendentes) |
| produtos | `servidor.js` | `useProdutos.jsx` |
| atendentes | `servidor.js` | `useAtendentes.jsx` |
| sessões de caixa | `servidor.js` | `useSessoesCaixa.jsx` |
| vendas | `servidor.js` | `useVendas.jsx` (PDV + relatórios) |
| pagamentos | `consultas.js` | `MetodosPagamento.jsx` |
| retiradas | `servidor.js` | `useRetiradas.jsx` |
| relatórios | `consultas.js` | `useCalculos.jsx`, `useGeracaoPDF.jsx` |
| cupom | `consultas.js` | `useCupom.jsx` |

---

---

*Última atualização: 2026-04-23*
