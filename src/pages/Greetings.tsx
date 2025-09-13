import React from 'react';
import { GreetingManager } from '@/components/greetings/GreetingManager';

export default function Greetings() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Saudação Personalizada</h1>
        <p className="text-muted-foreground mt-1">
          Crie e gerencie mensagens de saudação para o agente de prospecção
        </p>
      </div>

      {/* Greeting Manager */}
      <GreetingManager />
    </div>
  );
}