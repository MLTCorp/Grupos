'use client'

import { useEffect } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useIsMobile } from '@/hooks/use-mobile'

interface TourProviderProps {
  userId: string
  needsOnboarding: boolean
}

export function TourProvider({ userId, needsOnboarding }: TourProviderProps) {
  const isMobile = useIsMobile()

  useEffect(() => {
    // Skip tour on mobile (bottom nav is self-explanatory)
    // Skip if user doesn't need onboarding (has instances)
    if (isMobile || !needsOnboarding) return

    // Wait for DOM elements to be rendered
    const timeoutId = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        showButtons: ['next', 'previous', 'close'],
        nextBtnText: 'Proximo',
        prevBtnText: 'Anterior',
        doneBtnText: 'Comecar!',
        progressText: '{{current}} de {{total}}',
        popoverClass: 'sincron-tour',
        steps: [
          {
            popover: {
              title: 'Bem-vindo ao Sincron Grupos!',
              description: 'Vamos conhecer as funcionalidades do sistema. Este tour vai ajudar voce a entender como navegar pela plataforma.',
            }
          },
          {
            element: '#nav-instances',
            popover: {
              title: 'Instancias',
              description: 'Conecte suas instancias do WhatsApp aqui. Este e o primeiro passo para comecar a usar o sistema!',
              side: 'right',
              align: 'start',
            }
          },
          {
            element: '#nav-categories',
            popover: {
              title: 'Categorias',
              description: 'Organize seus grupos em categorias personalizadas para facilitar o gerenciamento.',
              side: 'right',
              align: 'start',
            }
          },
          {
            element: '#nav-groups',
            popover: {
              title: 'Grupos',
              description: 'Visualize e gerencie todos os grupos conectados as suas instancias.',
              side: 'right',
              align: 'start',
            }
          },
          {
            element: '#nav-messages',
            popover: {
              title: 'Mensagens',
              description: 'Envie mensagens para seus grupos de forma simples e organizada.',
              side: 'right',
              align: 'start',
            }
          },
          {
            element: '#nav-agent',
            popover: {
              title: 'Agente IA',
              description: 'Converse com o assistente de IA para automatizar tarefas e obter ajuda.',
              side: 'right',
              align: 'start',
            }
          },
          {
            element: '#nav-instances',
            popover: {
              title: 'Comece agora!',
              description: 'Clique aqui para conectar sua primeira instancia do WhatsApp e comecar a usar o Sincron Grupos.',
              side: 'right',
              align: 'start',
            },
            onHighlightStarted: (element) => {
              // Add pulsing animation to highlight the CTA
              element?.classList.add('tour-final-highlight')
            },
            onDeselected: (element) => {
              // Remove animation when tour ends
              element?.classList.remove('tour-final-highlight')
            }
          },
        ],
        onDestroyStarted: () => {
          // Clean up any remaining highlight classes
          const highlightedEl = document.querySelector('.tour-final-highlight')
          highlightedEl?.classList.remove('tour-final-highlight')
          // Must call destroy() when using onDestroyStarted hook
          driverObj.destroy()
        }
      })

      // Start the tour
      driverObj.drive()
    }, 500) // Small delay to ensure DOM is ready

    return () => {
      clearTimeout(timeoutId)
    }
  }, [isMobile, needsOnboarding])

  // This component doesn't render anything visible
  return null
}
