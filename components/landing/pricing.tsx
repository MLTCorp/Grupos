"use client"

import Link from "next/link"
import { Check, X, Clock, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShineBorder } from "@/components/magicui/shine-border"

const plans = [
  {
    name: "Inicial",
    description: "Perfeito para comecar",
    price: "R$ 147",
    period: "/mes",
    hasTrial: true,
    features: {
      instances: "1 instancia",
      groups: "Ate 10 grupos",
      scheduled: true,
      categories: true,
      history: true,
      ai: false,
      support: "Email",
    },
    cta: "Comecar Trial",
    href: "/signup",
    isEnterprise: false,
  },
  {
    name: "Profissional",
    description: "Para equipes em crescimento",
    price: "R$ 347",
    period: "/mes",
    hasTrial: true,
    features: {
      instances: "3 instancias",
      groups: "Ate 30 grupos",
      scheduled: true,
      categories: true,
      history: true,
      ai: true,
      support: "Prioritario",
    },
    cta: "Comecar Trial",
    href: "/signup",
    isEnterprise: false,
  },
  {
    name: "Enterprise",
    description: "Para grandes operacoes",
    price: "Sob consulta",
    period: "",
    hasTrial: false,
    features: {
      instances: "Ilimitadas",
      groups: "Ilimitados",
      scheduled: true,
      categories: true,
      history: true,
      ai: true,
      support: "Dedicado",
    },
    cta: "Fale Conosco",
    href: "https://wa.me/5511999999999?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20plano%20Enterprise%20do%20Sincron%20Grupos",
    isEnterprise: true,
  },
]

const featureLabels = [
  { key: "instances", label: "Instancias WhatsApp" },
  { key: "groups", label: "Grupos por instancia" },
  { key: "scheduled", label: "Mensagens agendadas" },
  { key: "categories", label: "Categorias personalizadas" },
  { key: "history", label: "Historico de mensagens" },
  { key: "ai", label: "Agente IA" },
  { key: "support", label: "Suporte" },
]

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
            Escolha o plano ideal para suas necessidades
          </motion.p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <ShineBorder
                className="w-full h-full"
                color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
              >
                <div className="p-6 h-full flex flex-col">
                  {/* Trial Badge */}
                  {plan.hasTrial && (
                    <Badge
                      variant="secondary"
                      className="mb-4 self-start text-green-600 border-green-200 bg-green-50"
                    >
                      <Clock className="h-3 w-3" />
                      7 dias gratis
                    </Badge>
                  )}

                  {/* Plan Header */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>

                  {/* Features Summary */}
                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm">{plan.features.instances}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm">{plan.features.groups}</span>
                    </li>
                    {plan.features.ai ? (
                      <li className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm">Agente IA incluso</span>
                      </li>
                    ) : (
                      <li className="flex items-center gap-3 text-muted-foreground">
                        <X className="w-4 h-4 shrink-0" />
                        <span className="text-sm">Sem Agente IA</span>
                      </li>
                    )}
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm">Suporte {plan.features.support}</span>
                    </li>
                  </ul>

                  {/* CTA Button */}
                  {plan.isEnterprise ? (
                    <Button asChild variant="outline" className="w-full">
                      <a
                        href={plan.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {plan.cta}
                      </a>
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href={plan.href}>{plan.cta}</Link>
                    </Button>
                  )}
                </div>
              </ShineBorder>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="text-xl font-semibold text-center mb-8">
            Comparacao de recursos
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground">
                    Recurso
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.name}
                      className="text-center py-4 px-4 font-semibold"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureLabels.map((feature, index) => (
                  <tr
                    key={feature.key}
                    className={index < featureLabels.length - 1 ? "border-b" : ""}
                  >
                    <td className="py-4 px-4 text-sm">{feature.label}</td>
                    {plans.map((plan) => {
                      const value = plan.features[feature.key as keyof typeof plan.features]
                      return (
                        <td
                          key={`${plan.name}-${feature.key}`}
                          className="text-center py-4 px-4"
                        >
                          {typeof value === "boolean" ? (
                            value ? (
                              <Check className="w-5 h-5 text-primary mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{value}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
