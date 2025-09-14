import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { callWebhook } from '@/utils/webhooks';

const editUserSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  perfil: z.string().min(1, 'Perfil é obrigatório'),
  empresaId: z.string().min(1, 'Empresa é obrigatória'),
  ativo: z.boolean(),
  senha: z.string().optional(),
  TipoPlano: z.string().min(1, 'Tipo de plano é obrigatório'),
  permissoes: z.string().optional(),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface User {
  id: string;
  email: string;
  nome: string;
  tipo: string;
  ativo: boolean;
  empresa: string;
  empresa_id: string;
  plano: string;
  created_at: string;
}

interface Company {
  id: string;
  nome: string;
}

interface Profile {
  id: string;
  nome: string;
}

interface EditUserFormProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function EditUserForm({ user, open, onOpenChange, onUserUpdated }: EditUserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      nome: '',
      email: '',
      perfil: '',
      empresaId: '',
      ativo: true,
      senha: '',
      TipoPlano: 'Básico',
      permissoes: '',
      tipo: 'supervisor',
    },
  });

  // Load companies and profiles
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        // Load companies
        const companiesResponse = await callWebhook('list-company', { 
          method: 'POST',
          body: JSON.stringify({}) 
        });

        console.log('Companies response:', companiesResponse);

        if (companiesResponse.success && companiesResponse.data) {
          let companyData = [];
          
          // Handle different response formats
          if (Array.isArray(companiesResponse.data)) {
            companyData = companiesResponse.data;
          } else if (companiesResponse.data.companies && Array.isArray(companiesResponse.data.companies)) {
            companyData = companiesResponse.data.companies;
          } else if (companiesResponse.data.data && Array.isArray(companiesResponse.data.data)) {
            companyData = companiesResponse.data.data;
          }
          
          setCompanies(companyData);
        }

        // Load profiles
        const profilesResponse = await callWebhook('list-profile', { 
          method: 'POST',
          body: JSON.stringify({}) 
        });

        console.log('Profiles response:', profilesResponse);

        if (profilesResponse.success && profilesResponse.data) {
          let profileData = [];
          
          // Handle different response formats
          if (Array.isArray(profilesResponse.data)) {
            profileData = profilesResponse.data;
          } else if (profilesResponse.data.profiles && Array.isArray(profilesResponse.data.profiles)) {
            profileData = profilesResponse.data.profiles;
          } else if (profilesResponse.data.data && Array.isArray(profilesResponse.data.data)) {
            profileData = profilesResponse.data.data;
          }
          
          setProfiles(profileData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar dados do formulário.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    if (open) {
      loadData();
    }
  }, [open, toast]);

  // Update form when user changes
  useEffect(() => {
    if (user && open) {
      form.reset({
        nome: user.nome,
        email: user.email,
        perfil: '', // Will need to be mapped from user data
        empresaId: user.empresa_id,
        ativo: user.ativo,
        senha: '',
        TipoPlano: user.plano || 'Básico',
        permissoes: '',
        tipo: user.tipo || 'supervisor',
      });
    }
  }, [user, open, form]);

  const onSubmit = async (data: EditUserFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const payload = {
        action: 'edit',
        userId: user.id,
        nome: data.nome,
        email: data.email,
        perfil: data.perfil,
        empresaId: data.empresaId,
        ativo: data.ativo,
        senha: data.senha || null,
        TipoPlano: data.TipoPlano,
        permissoes: data.permissoes || '',
        tipo: data.tipo,
      };

      const response = await callWebhook('edit-users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Usuário atualizado com sucesso!',
        });
        onUserUpdated();
        onOpenChange(false);
        form.reset();
      } else {
        throw new Error(response.error || 'Erro ao atualizar usuário');
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o usuário.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize as informações do usuário {user?.nome}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="empresaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingData}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma empresa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="perfil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingData}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="operador">Operador</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="TipoPlano"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Plano</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o plano" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Básico">Básico</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Deixe vazio para manter a senha atual" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissões</FormLabel>
                  <FormControl>
                    <Input placeholder="Permissões do usuário" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Usuário Ativo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Determine se o usuário está ativo no sistema
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}