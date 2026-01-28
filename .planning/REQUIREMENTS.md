# Requirements: Sincron Grupos

**Defined:** 2026-01-28
**Core Value:** Automacao inteligente de grupos WhatsApp sem precisar compartilhar acesso a instancia

## v1 Requirements

### Autenticacao (AUTH)

- [ ] **AUTH-01**: Usuario pode criar conta com email/senha via Supabase Auth
- [ ] **AUTH-02**: Usuario ve pagina de signup com shadcn signup-01 component
- [ ] **AUTH-03**: Usuario ve pagina de login com shadcn login-01 component
- [ ] **AUTH-04**: Usuario e redirecionado ao dashboard apos login
- [ ] **AUTH-05**: Usuario pode fazer logout de qualquer pagina
- [ ] **AUTH-06**: Sessao persiste entre refreshes (cookies Supabase)
- [ ] **AUTH-07**: Rotas protegidas redirecionam para login se nao autenticado

### Billing/Stripe (BILL)

- [ ] **BILL-01**: Usuario cadastra cartao durante signup via Stripe Checkout
- [ ] **BILL-02**: Sistema inicia trial de 7 dias automaticamente apos signup
- [ ] **BILL-03**: Usuario ve countdown do trial no dashboard (dias restantes)
- [ ] **BILL-04**: Sistema cobra R$ 147/mes por instancia apos trial expirar
- [ ] **BILL-05**: Usuario pode acessar Customer Portal Stripe (atualizar cartao/cancelar)
- [ ] **BILL-06**: Sistema processa webhooks Stripe (subscription events)
- [ ] **BILL-07**: Usuario recebe notificacao de falha no pagamento
- [ ] **BILL-08**: Sistema bloqueia acesso se assinatura inativa/cancelada
- [ ] **BILL-09**: Usuario ve status da assinatura no dashboard (ativo/trial/cancelado)
- [ ] **BILL-10**: Usuario ve historico de faturas via Customer Portal

### Landing Page (LAND)

- [ ] **LAND-01**: Landing page preserva estrutura atual (Header, Hero, Features, HowItWorks, FAQ, CTA, Footer)
- [ ] **LAND-02**: Pricing section mostra plano unico R$ 147/mes por instancia
- [ ] **LAND-03**: Botao "Comecar" redireciona para signup com Stripe checkout
- [ ] **LAND-04**: Landing page e responsiva (mobile + desktop)
- [ ] **LAND-05**: CTAs claros direcionam para signup

### Dashboard (DASH)

- [ ] **DASH-01**: Dashboard tem sidebar com navegacao (Instances, Categories, Groups, Messages, Agent)
- [ ] **DASH-02**: Layout responsivo com sidebar colapsavel em mobile
- [ ] **DASH-03**: Tema dark/light mode persistido
- [ ] **DASH-04**: Feedback visual para acoes (toasts via Sonner)
- [ ] **DASH-05**: Onboarding guiado para usuarios novos (primeira instancia)
- [ ] **DASH-06**: Banner mostra trial countdown quando aplicavel

### Instancias WhatsApp (INST)

- [ ] **INST-01**: Usuario pode adicionar instancia (nome + token UAZAPI)
- [ ] **INST-02**: Sistema valida token UAZAPI antes de salvar
- [ ] **INST-03**: Usuario ve lista de instancias com status (conectado/desconectado/conectando)
- [ ] **INST-04**: Usuario pode conectar instancia via QR Code
- [ ] **INST-05**: Sistema polling detecta conexao (30s interval)
- [ ] **INST-06**: Sistema configura webhook N8N automaticamente apos primeira conexao
- [ ] **INST-07**: Usuario pode desconectar instancia
- [ ] **INST-08**: Usuario ve historico de conexoes da instancia
- [ ] **INST-09**: Health check mostra status em tempo real

### Categorias (CAT)

- [ ] **CAT-01**: Usuario pode criar categoria (nome + cor)
- [ ] **CAT-02**: Usuario pode editar categoria existente
- [ ] **CAT-03**: Usuario pode deletar categoria vazia
- [ ] **CAT-04**: Sistema mostra contador de grupos por categoria
- [ ] **CAT-05**: Lista de categorias ordenada alfabeticamente

### Grupos (GRP)

- [ ] **GRP-01**: Usuario pode importar grupos da instancia conectada
- [ ] **GRP-02**: Durante importacao, usuario seleciona categoria para cada grupo
- [ ] **GRP-03**: Usuario ve lista de grupos com: nome, categoria, participantes
- [ ] **GRP-04**: Usuario pode filtrar grupos por categoria
- [ ] **GRP-05**: Usuario pode buscar grupos por nome
- [ ] **GRP-06**: Usuario pode reatribuir grupo para outra categoria
- [ ] **GRP-07**: Usuario pode remover grupo (desvincula, nao deleta no WhatsApp)
- [ ] **GRP-08**: Acoes em massa (mover varios grupos de categoria)

### Mensagens (MSG)

- [ ] **MSG-01**: Usuario pode enviar mensagem de texto para um grupo
- [ ] **MSG-02**: Usuario pode enviar mensagem para multiplos grupos (selecao manual)
- [ ] **MSG-03**: Usuario pode enviar mensagem para categoria inteira
- [ ] **MSG-04**: Usuario pode agendar mensagem (data + hora futura)
- [ ] **MSG-05**: Usuario pode cancelar mensagem agendada pendente
- [ ] **MSG-06**: Usuario ve historico de mensagens enviadas
- [ ] **MSG-07**: Sistema executa mensagens agendadas no horario correto
- [ ] **MSG-08**: Preview da mensagem antes de enviar
- [ ] **MSG-09**: Templates de mensagens reutilizaveis

### Agent IA (AGNT)

- [ ] **AGNT-01**: Usuario acessa chat do agent via sidebar
- [ ] **AGNT-02**: Agent usa Vercel AI SDK com streaming
- [ ] **AGNT-03**: Chat preserva historico de conversas (sessoes)
- [ ] **AGNT-04**: Indicadores de digitacao durante resposta
- [ ] **AGNT-05**: Agent tem contexto: instancias, grupos, categorias do usuario
- [ ] **AGNT-06**: Agent pode executar MCP tools (via AI SDK tool calling)
- [ ] **AGNT-07**: Agent responde queries naturais ("quantos grupos em Vendas?")
- [ ] **AGNT-08**: Agent executa acoes com confirmacao ("envie mensagem para grupo X")
- [ ] **AGNT-09**: Agent mostra resultados de tools com UI estruturada
- [ ] **AGNT-10**: Sugestoes proativas baseadas em padroes

### MCP Tools (MCP)

- [ ] **MCP-01**: Tool `get_instance_status` - obtem status da instancia
- [ ] **MCP-02**: Tool `list_categories` - lista categorias com contagem
- [ ] **MCP-03**: Tool `list_groups` - lista grupos (paginado)
- [ ] **MCP-04**: Tool `sync_groups` - importa grupos do WhatsApp
- [ ] **MCP-05**: Tool `send_message` - envia mensagem imediata
- [ ] **MCP-06**: Tool `schedule_message` - agenda mensagem futura
- [ ] **MCP-07**: Tool `configure_webhook` - configura webhook N8N
- [ ] **MCP-08**: Tool `create_trigger` - cria gatilhos automaticos
- [ ] **MCP-09**: Tool `create_command` - cria comandos chatbot
- [ ] **MCP-10**: Tool `create_agent` - cria agentes IA UAZAPI
- [ ] **MCP-11**: Tool `view_subscription` - visualiza assinatura Stripe
- [ ] **MCP-12**: Discovery endpoint `/api/mcp` lista tools disponiveis
- [ ] **MCP-13**: Autenticacao via API key (header `x-api-key`)
- [ ] **MCP-14**: MCP server standalone funciona com Claude Desktop

## v2 Requirements

### Triggers UI

- **TRIG-01**: Usuario pode criar gatilhos via UI (nao apenas via Agent)
- **TRIG-02**: Usuario ve lista de gatilhos ativos
- **TRIG-03**: Usuario pode ativar/desativar gatilhos
- **TRIG-04**: Usuario pode editar gatilhos existentes
- **TRIG-05**: Metricas de execucao de gatilhos

### Analytics

- **ANLY-01**: Dashboard mostra metricas de mensagens (enviadas/recebidas)
- **ANLY-02**: Graficos de uso por periodo
- **ANLY-03**: Metricas por grupo/categoria

### Team

- **TEAM-01**: Usuario pode convidar membros para organizacao
- **TEAM-02**: Roles: admin, editor, viewer
- **TEAM-03**: Audit log de acoes

## Out of Scope

| Feature | Reason |
|---------|--------|
| OAuth login (Google, GitHub) | v1 foca em email/senha, OAuth adiciona complexidade |
| Multiplos planos Stripe | v1 tem plano unico, multiplos planos apos validar pricing |
| Real-time chat (mensagens recebidas no dashboard) | Complexidade alta, N8N processa, foco em envio |
| Mobile app nativo | Web-first, mobile responsive e suficiente |
| API publica documentada | MCP cobre casos de uso, API formal v2+ |
| Exportacao relatorios (PDF/CSV) | Analytics basico primeiro, exportacao v2 |
| Transcricao de audios | Codigo existe mas nao refazemos UI |
| Comandos via UI | Apenas via Agent IA no v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| AUTH-06 | Phase 1 | Complete |
| AUTH-07 | Phase 1 | Complete |
| LAND-01 | Phase 1 | Complete |
| LAND-04 | Phase 1 | Complete |
| BILL-01 | Phase 2 | Pending |
| BILL-02 | Phase 2 | Pending |
| BILL-03 | Phase 2 | Pending |
| BILL-04 | Phase 2 | Pending |
| BILL-05 | Phase 2 | Pending |
| BILL-06 | Phase 2 | Pending |
| BILL-07 | Phase 2 | Pending |
| BILL-08 | Phase 2 | Pending |
| BILL-09 | Phase 2 | Pending |
| BILL-10 | Phase 2 | Pending |
| LAND-02 | Phase 2 | Pending |
| LAND-03 | Phase 2 | Pending |
| LAND-05 | Phase 2 | Pending |
| MCP-11 | Phase 2 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| DASH-03 | Phase 3 | Pending |
| DASH-04 | Phase 3 | Pending |
| DASH-05 | Phase 3 | Pending |
| DASH-06 | Phase 3 | Pending |
| INST-01 | Phase 4 | Pending |
| INST-02 | Phase 4 | Pending |
| INST-03 | Phase 4 | Pending |
| INST-04 | Phase 4 | Pending |
| INST-05 | Phase 4 | Pending |
| INST-06 | Phase 4 | Pending |
| INST-07 | Phase 4 | Pending |
| INST-08 | Phase 4 | Pending |
| INST-09 | Phase 4 | Pending |
| MCP-01 | Phase 4 | Pending |
| MCP-07 | Phase 4 | Pending |
| MCP-12 | Phase 4 | Pending |
| MCP-13 | Phase 4 | Pending |
| CAT-01 | Phase 5 | Pending |
| CAT-02 | Phase 5 | Pending |
| CAT-03 | Phase 5 | Pending |
| CAT-04 | Phase 5 | Pending |
| CAT-05 | Phase 5 | Pending |
| GRP-01 | Phase 5 | Pending |
| GRP-02 | Phase 5 | Pending |
| GRP-03 | Phase 5 | Pending |
| GRP-04 | Phase 5 | Pending |
| GRP-05 | Phase 5 | Pending |
| GRP-06 | Phase 5 | Pending |
| GRP-07 | Phase 5 | Pending |
| GRP-08 | Phase 5 | Pending |
| MCP-02 | Phase 5 | Pending |
| MCP-03 | Phase 5 | Pending |
| MCP-04 | Phase 5 | Pending |
| MSG-01 | Phase 6 | Pending |
| MSG-02 | Phase 6 | Pending |
| MSG-03 | Phase 6 | Pending |
| MSG-04 | Phase 6 | Pending |
| MSG-05 | Phase 6 | Pending |
| MSG-06 | Phase 6 | Pending |
| MSG-07 | Phase 6 | Pending |
| MSG-08 | Phase 6 | Pending |
| MSG-09 | Phase 6 | Pending |
| MCP-05 | Phase 6 | Pending |
| MCP-06 | Phase 6 | Pending |
| AGNT-01 | Phase 7 | Pending |
| AGNT-02 | Phase 7 | Pending |
| AGNT-03 | Phase 7 | Pending |
| AGNT-04 | Phase 7 | Pending |
| AGNT-05 | Phase 7 | Pending |
| AGNT-06 | Phase 7 | Pending |
| AGNT-07 | Phase 7 | Pending |
| AGNT-08 | Phase 7 | Pending |
| AGNT-09 | Phase 7 | Pending |
| AGNT-10 | Phase 7 | Pending |
| MCP-08 | Phase 7 | Pending |
| MCP-09 | Phase 7 | Pending |
| MCP-10 | Phase 7 | Pending |
| MCP-14 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 72 total
- Mapped to phases: 72
- Unmapped: 0

---
*Requirements defined: 2026-01-28*
*Last updated: 2026-01-28 (Phase 1 complete)*
