'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft, Store, Users, ShieldCheck, User, Calendar,
} from 'lucide-react';

interface Loja {
  id: number;
  nome: string;
  segmento: string;
  ativo: number;
  criadoEm: string;
  logoUrl: string | null;
  corPrimaria: string | null;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: string;
  ativo: number;
  criadoEm: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Dono da Loja',
  employee: 'Funcionario',
  super_admin: 'Super Admin',
};

export default function AdminTenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { fetchWithAuth } = useAuth();
  const [loja, setLoja] = useState<Loja | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTenant = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`/api/admin/tenants/${id}`);
      if (!res.ok) {
        toast.error('Loja não encontrada');
        router.push('/admin');
        return;
      }
      const data = await res.json();
      setLoja(data.loja);
      setUsuarios(data.usuarios);
    } catch {
      toast.error('Erro ao carregar loja');
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, id, router]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-24 rounded-[2rem]" />
            <Skeleton className="h-24 rounded-[2rem]" />
            <Skeleton className="h-24 rounded-[2rem]" />
          </div>
          <Skeleton className="h-64 rounded-[2rem]" />
        </div>
      </AppLayout>
    );
  }

  if (!loja) return null;

  const admins = usuarios.filter(u => u.role === 'owner');
  const employees = usuarios.filter(u => u.role === 'employee');

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push('/admin')}>
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{loja.nome}</h1>
              <Badge variant={loja.ativo ? 'default' : 'destructive'}>
                {loja.ativo ? 'Ativa' : 'Suspensa'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 capitalize">
              {loja.segmento}
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <InfoCard
            label="Total de usuários"
            value={usuarios.length}
            icon={<Users className="size-5" />}
            color="bg-[#C1B8FF]/10 text-[#C1B8FF]"
          />
          <InfoCard
            label="Administradores"
            value={admins.length}
            icon={<ShieldCheck className="size-5" />}
            color="bg-[#C1B8FF]/10 text-[#C1B8FF]"
          />
          <InfoCard
            label="Data de criação"
            value={formatDate(loja.criadoEm)}
            icon={<Calendar className="size-5" />}
            color="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            valueSize="text-2xl"
          />
        </div>

        {/* Users Table */}
        <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Usuarios desta Loja
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usuarios.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="size-10 text-muted-foreground/30" />
                <p className="mt-3 text-muted-foreground">Nenhum usuário cadastrado.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Desde</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-[#C1B8FF]/10 text-xs font-bold text-[#C1B8FF]">
                            {u.nome.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{u.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === 'owner' ? 'default' : 'secondary'}>
                          {ROLE_LABELS[u.role] || u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.ativo ? 'default' : 'destructive'}>
                          {u.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(u.criadoEm)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function InfoCard({ label, value, icon, color, valueSize = 'text-3xl' }: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  valueSize?: string;
}) {
  return (
    <Card className="bg-card border border-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] transition-all hover:shadow-[0_12px_40px_rgb(37,99,235,0.08)] hover:-translate-y-0.5">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
            <p className={`mt-2 ${valueSize} font-bold tracking-tight text-foreground leading-none`}>{value}</p>
          </div>
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
