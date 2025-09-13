import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Building2, 
  Upload, 
  TrendingUp, 
  Activity,
  MessageSquare,
  Settings,
  BarChart3
} from 'lucide-react';

export default function Dashboard() {
  const stats = [
    {
      title: 'Total de Usuários',
      value: '1,234',
      description: '+20.1% em relação ao mês passado',
      icon: Users,
      trend: 'up'
    },
    {
      title: 'Empresas Ativas',
      value: '89',
      description: '+12 novas empresas este mês',
      icon: Building2,
      trend: 'up'
    },
    {
      title: 'Uploads Realizados',
      value: '456',
      description: '+15% em relação à semana passada',
      icon: Upload,
      trend: 'up'
    },
    {
      title: 'Leads Prospectados',
      value: '2,345',
      description: '+8.2% conversão média',
      icon: TrendingUp,
      trend: 'up'
    }
  ];

  const recentActivity = [
    {
      action: 'Upload de planilha realizado',
      user: 'João Silva',
      time: '2 minutos atrás',
      icon: Upload
    },
    {
      action: 'Nova empresa cadastrada',
      user: 'Maria Santos',
      time: '5 minutos atrás',
      icon: Building2
    },
    {
      action: 'Webhook configurado',
      user: 'Pedro Costa',
      time: '10 minutos atrás',
      icon: Settings
    },
    {
      action: 'Saudação personalizada criada',
      user: 'Ana Lima',
      time: '15 minutos atrás',
      icon: MessageSquare
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <DashboardHeader />

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-gradient hover:shadow-glow transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Chart */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Atividade Semanal
            </CardTitle>
            <CardDescription>
              Visão geral das atividades da última semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              {/* Placeholder for chart */}
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Gráfico de atividades seria exibido aqui</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
            <CardDescription>
              Últimas ações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      por {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}