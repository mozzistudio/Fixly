'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Messages"
        subtitle="WhatsApp conversations with customers"
      />

      <div className="flex-1 overflow-auto p-6">
        <Card className="h-full">
          <CardContent className="flex flex-col items-center justify-center h-full py-12">
            <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-primary-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">WhatsApp Integration</h3>
            <p className="text-text-secondary text-center max-w-md">
              Connect your WhatsApp Business account to start receiving and sending messages directly from Fixly.
              Configure your WhatsApp settings to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
