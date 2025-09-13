import React, { useState, useEffect } from 'react';
import { getWebhookUrl } from '@/utils/webhooks';

interface DashboardHeaderProps {
  className?: string;
}

export function DashboardHeader({ className }: DashboardHeaderProps) {
  const [title, setTitle] = useState('Área do Cliente');
  const [subtitle, setSubtitle] = useState('');

  const updateTitle = async () => {
    try {
      // 1. Try webhook first
      const webhookUrl = getWebhookUrl('dashboard-title') || 
                        getWebhookUrl('dashboard_meta') || 
                        getWebhookUrl('webhook-dashboard-title');
      
      if (webhookUrl) {
        console.log('[DashboardHeader] Fetching title from webhook:', webhookUrl);
        const response = await fetch(webhookUrl);
        if (response.ok) {
          const data = await response.json();
          console.log('[DashboardHeader] Webhook response:', data);
          
          if (data.title) {
            setTitle(data.title);
            setSubtitle(data.subtitle || '');
            return;
          }
        }
      }

      // 2. Try empresa atual from localStorage
      const selectedEmpresa = localStorage.getItem('selected_empresa_nome');
      if (selectedEmpresa) {
        console.log('[DashboardHeader] Using empresa from localStorage:', selectedEmpresa);
        setTitle(`Área • ${selectedEmpresa}`);
        setSubtitle('');
        return;
      }

      // 3. Try dashboard_title or app_area_title from localStorage
      const dashboardTitle = localStorage.getItem('dashboard_title') || 
                           localStorage.getItem('app_area_title');
      if (dashboardTitle) {
        console.log('[DashboardHeader] Using title from localStorage:', dashboardTitle);
        setTitle(dashboardTitle);
        setSubtitle('');
        return;
      }

      // 4. Fallback
      console.log('[DashboardHeader] Using fallback title');
      setTitle('Área do Cliente');
      setSubtitle('');

    } catch (error) {
      console.error('[DashboardHeader] Error updating title:', error);
      setTitle('Área do Cliente');
      setSubtitle('');
    }
  };

  useEffect(() => {
    updateTitle();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selected_empresa_nome' || 
          e.key === 'dashboard_title' || 
          e.key === 'app_area_title' ||
          e.key === 'webhookSettings') {
        console.log('[DashboardHeader] Storage change detected:', e.key);
        updateTitle();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className={className}>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}