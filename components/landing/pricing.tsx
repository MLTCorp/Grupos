"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ShineBorder } from "@/components/magicui/shine-border"

const plan = {
  name: "Profissional",
  description: "Tudo que voce precisa para gerenciar seus grupos",
  price: "R$ 147",
  period: "/mes por instancia",
  trial: "7 dias gratis",
  features: [
    "Grupos ilimitados",
    "Agendamento de mensagens",
    "Categorias personalizadas",
    "IA integrada",
    "Mensagens em massa",
    "Historico completo",
    "Suporte prioritario",
  ],
  cta: "Comecar Trial Gratis",
  href: "/signup",
}

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-medium text-primary mb-4"
          >
            PRECOS
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
          >
            Planos para <span className="text-primary">todos os tamanhos</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Preco simples e transparente. Teste gratis por 7 dias.
          </motion.p>
        </div>

        {/* Single Plan Card */}
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <ShineBorder
              className="w-full"
              color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
            >
              <div className="p-8 h-full flex flex-col">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    {plan.trial}
                  </span>
                </div>

                <div className="mb-6 text-center">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                </div>

                <div className="mb-6 text-center">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild className="w-full">
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            </ShineBorder>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
