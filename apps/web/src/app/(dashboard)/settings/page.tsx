'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, Users, MessageSquare, Bot, Bell, Ticket, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  const settingSections = [
    {
      title: 'Organization',
      description: 'Manage your shop details, logo, and business information',
      icon: Building2,
      href: '/settings/organization',
    },
    {
      title: 'Team',
      description: 'Invite team members and manage roles',
      icon: Users,
      href: '/settings/team',
    },
    {
      title: 'WhatsApp',
      description: 'Configure WhatsApp Business integration',
      icon: MessageSquare,
      href: '/settings/whatsapp',
    },
    {
      title: 'AI Settings',
      description: 'Configure AI features and spending limits',
      icon: Bot,
      href: '/settings/ai',
    },
    {
      title: 'Notifications',
      description: 'Manage notification preferences',
      icon: Bell,
      href: '/settings/notifications',
    },
    {
      title: 'Ticket Workflow',
      description: 'Customize statuses and default settings',
      icon: Ticket,
      href: '/settings/workflow',
    },
    {
      title: 'Billing',
      description: 'Manage subscription and payment methods',
      icon: CreditCard,
      href: '/settings/billing',
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Settings"
        subtitle="Manage your organization and preferences"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {settingSections.map((section) => (
            <Card
              key={section.title}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => window.location.href = section.href}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                    <section.icon className="h-5 w-5 text-text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
