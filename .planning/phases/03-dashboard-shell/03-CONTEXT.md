# Phase 3: Dashboard Shell - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Sistema de navegação e feedback visual consistente para toda a aplicação. Estabelece como os usuários navegam entre funcionalidades e recebem feedback de suas ações. Inclui sidebar responsiva, notificações toast, e onboarding para novos usuários.

</domain>

<decisions>
## Implementation Decisions

### Navegação Desktop
- Sidebar colapsável com toggle manual
- Estado (expandida/colapsada) persiste entre páginas e sessões
- Usuário controla quando expandir ou colapsar via botão
- **Implementação**: Usar AppSidebar existente (components/app-sidebar.tsx) com shadcn/ui Sidebar
- **Componentes base**: SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter já implementados
- **Hook**: useSidebar para controlar estado (expanded/collapsed)

### Navegação Mobile
- Bottom navigation bar com ícones fixos na parte inferior da tela
- Sempre visível, não colapsa ou esconde
- Substitui a sidebar lateral no mobile
- **Implementação**: Criar componente separado para bottom nav (não usar drawer do Sidebar)

### Itens de Navegação
- Mostrar todos os 6 itens desde o início: Instâncias, Categorias, Grupos, Mensagens, Agente, Gatilhos
- Itens ainda não disponíveis (fases futuras) aparecem desabilitados/bloqueados
- Dá ao usuário visão completa da estrutura do sistema desde o primeiro acesso

### Indicação Visual
- Página ativa: item com background destacado
- Itens bloqueados/desabilitados: opacity reduzida (esmaecidos)
- Contraste visual claro entre ativo, disponível, e bloqueado

### Notificações Toast
- Posição: canto superior direito da tela
- Duração variável por tipo: success desaparece em 3s, error em 7s
- Tipos suportados: apenas success e error (sem info, warning, ou loading)
- **Implementação**: Sonner do shadcn/ui (já instalado via package sonner)
- **Padrão**: Sonner empilha notificações automaticamente (comportamento nativo)
- **Integração**: Toaster component no root layout

### Onboarding
- Formato: tour interativo com tooltips guiados
- Quando mostrar: sempre que usuário não tiver instâncias conectadas (não é "só uma vez")
- Conteúdo do tour: visão geral da sidebar, explicação de itens bloqueados, indicação de próximos passos
- Final do tour: highlight visual no item "Instâncias" da sidebar para sinalizar próximo passo
- **Efeitos visuais para chamar atenção**:
  - Shine Border do MagicUI (instalar via shadcn) para destacar elementos no tour
  - Glow component (já instalado em components/ui/glow.tsx) como efeito de fundo/destaque
  - AnimatedGroup (já instalado) para animar sequência de tooltips
- **Componentes a usar**: shadcn/ui + MagicUI (importar conforme necessário)
- **Biblioteca de tour**: Decidir entre react-joyride, shepherd.js, ou driver.js

### Componentes Existentes a Reutilizar
**Sidebar (shadcn/ui - completo)**:
- AppSidebar (components/app-sidebar.tsx) - estrutura principal
- NavMain (components/nav-main.tsx) - menu com subitens collapsible
- NavUser (components/nav-user.tsx) - menu de usuário no footer
- TeamSwitcher (components/team-switcher.tsx) - seletor de organizações
- NavProjects (components/nav-projects.tsx) - seção de projetos/categorias
- Todos os primitivos: SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarRail, SidebarMenu, SidebarMenuItem, SidebarMenuButton
- Hook useSidebar: state, open, setOpen, isMobile, toggleSidebar
- Persistência via cookies (sidebar_state, 7 dias)
- Collapsible mode: "icon" (já configurado)
- Atalho: Ctrl/Cmd + B

**MagicUI (já instalados)**:
- Glow (components/ui/glow.tsx) - efeitos de iluminação com 5 variantes (top, above, bottom, below, center)
- AnimatedGroup (components/ui/animated-group.tsx) - animações em grupo com 10 presets (fade, slide, scale, blur, blur-slide, zoom, flip, bounce, rotate, swing)

**shadcn/ui (instalados)**:
- Sonner (toast) - notificações
- Badge - para trial badge e contadores
- Button, Input, Label - formulários
- Card, Separator - estrutura
- Tooltip - hints
- Sheet - drawer mobile (se necessário)
- Skeleton - loading states

**MagicUI (a instalar se necessário)**:
- Shine Border - para destacar elementos no onboarding

### Claude's Discretion
- Sistema de tema dark/light (implementação, toggle, padrão inicial, transição visual)
- Biblioteca específica para tour interativo (react-joyride, shepherd.js, ou outra)
- Animações de transição entre estados da sidebar
- Detalhes de acessibilidade (ARIA labels, keyboard navigation)
- Persistência do estado de onboarding (localStorage, database, etc)

</decisions>

<specifics>
## Specific Ideas

- Bottom nav no mobile ao invés do padrão drawer/hamburger menu
- Mostrar estrutura completa desde o início (itens bloqueados visíveis) para dar senso de progressão
- Onboarding "persistente" até conclusão do setup básico (conectar primeira instância)
- Duração de toast diferenciada: erros precisam de mais tempo de leitura que sucessos
- **Reutilizar AppSidebar existente**: Apenas customizar dados (trocar exemplo por itens reais do app)
- **Shine Border no highlight**: Usar para criar efeito "brilhante" chamando atenção no item "Instâncias" ao final do tour
- **Glow para background**: Adicionar efeito de iluminação sutil atrás de elementos destacados no tour
- **AnimatedGroup**: Animar aparição sequencial dos tooltips do tour (preset "blur-slide" ou "fade")
- **Importar de shadcn/magicui conforme necessário**: Se precisar de componente não instalado, usar npx shadcn@latest add ou buscar em magicui.design

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-dashboard-shell*
*Context gathered: 2026-01-28*
