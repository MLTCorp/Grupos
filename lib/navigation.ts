import { Smartphone, FolderTree, Users, MessageSquare, Bot, CreditCard } from 'lucide-react'

export const navigationItems = [
  {
    title: 'Instancias',
    href: '/dashboard/instances',
    icon: Smartphone,
    disabled: false,  // Phase 4
  },
  {
    title: 'Categorias',
    href: '/dashboard/categories',
    icon: FolderTree,
    disabled: true,   // Phase 5
  },
  {
    title: 'Grupos',
    href: '/dashboard/groups',
    icon: Users,
    disabled: true,   // Phase 5
  },
  {
    title: 'Mensagens',
    href: '/dashboard/messages',
    icon: MessageSquare,
    disabled: true,   // Phase 6
  },
  {
    title: 'Agente',
    href: '/dashboard/agent',
    icon: Bot,
    disabled: true,   // Phase 7
  },
]

export const settingsItems = [
  {
    title: 'Faturamento',
    href: '/dashboard/billing',
    icon: CreditCard,
    disabled: false,
  },
]
