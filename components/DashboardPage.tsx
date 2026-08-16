import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Gift,
  PlusCircle,
  ReceiptText,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import { Customer, Template, Transaction } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from './AuthProvider';
import { loadFromStorage, saveToStorage } from '../lib/storage';
import { cn } from '../lib/utils';

interface DashboardPageProps {
  campaigns: Template[];
  customers: Customer[];
}

interface ChecklistStep {
  title: string;
  description: string;
  href: string;
  complete: boolean;
  buttonLabel: string;
}

interface ActivityItem extends Transaction {
  customerName: string;
  campaignName: string;
}

interface DashboardDismissState {
  getStarted: boolean;
}

const dashboardDismissStateKey = (ownerId: string) => `dashboard:dismissed:${ownerId}`;
const defaultDismissState: DashboardDismissState = {
  getStarted: false,
};

const formatAction = (type: Transaction['type']) => {
  switch (type) {
    case 'issued':
      return 'Tarjeta emitida';
    case 'redeem':
      return 'Premio canjeado';
    case 'stamp_remove':
      return 'Sello eliminado';
    default:
      return 'Sello agregado';
  }
};

const formatTimestamp = (timestamp: number) =>
  new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const DashboardPage: React.FC<DashboardPageProps> = ({ campaigns, customers }) => {
  const { currentOwner } = useAuth();
  const cards = useMemo(() => customers.flatMap((customer) => customer.cards), [customers]);
  const [dismissedSections, setDismissedSections] = useState<DashboardDismissState>(defaultDismissState);

  const recentActivity = useMemo<ActivityItem[]>(
    () =>
      customers
        .flatMap((customer) =>
          customer.cards.flatMap((card) =>
            (card.history || []).map((transaction) => ({
              ...transaction,
              customerName: customer.name,
              campaignName: card.campaignName,
            }))
          )
        )
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5),
    [customers]
  );

  const activeCardCount = cards.filter((card) => card.status === 'Active').length;
  const redeemedCardCount = cards.filter((card) => card.status === 'Redeemed').length;
  const hasStampActivity = recentActivity.some((transaction) => transaction.type === 'stamp_add') ||
    customers.some((customer) =>
      customer.cards.some((card) => (card.history || []).some((transaction) => transaction.type === 'stamp_add'))
    );

  const steps: ChecklistStep[] = [
    {
      title: 'Crear campaña',
      description: 'Crea tu primera campaña de fidelidad.',
      href: '/gallery',
      complete: campaigns.length > 0,
      buttonLabel: 'Crear campaña',
    },
    {
      title: 'Emitir tarjeta',
      description: 'Emite tu primera tarjeta de fidelidad a un cliente.',
      href: '/issued-cards',
      complete: cards.length > 0,
      buttonLabel: 'Emitir tarjeta',
    },
    {
      title: 'Sellar una tarjeta',
      description: 'Abre una tarjeta emitida y agrega el primer sello.',
      href: '/issued-cards',
      complete: hasStampActivity,
      buttonLabel: 'Agregar sello',
    },
  ];

  const completedSteps = steps.filter((step) => step.complete).length;
  const setupComplete = completedSteps === steps.length;
  const progressPercent = (completedSteps / steps.length) * 100;
  const showGetStarted = !setupComplete || !dismissedSections.getStarted;

  const statCards = [
    {
      label: 'Campañas',
      value: campaigns.length,
      detail: campaigns.length === 1 ? '1 campaña activa' : `${campaigns.length} campañas activas`,
      icon: CreditCard,
    },
    {
      label: 'Tarjetas emitidas',
      value: cards.length,
      detail: cards.length === 1 ? '1 tarjeta emitida' : `${cards.length} tarjetas emitidas`,
      icon: Wallet,
    },
    {
      label: 'Clientes',
      value: customers.length,
      detail: customers.length === 1 ? '1 cliente registrado' : `${customers.length} clientes registrados`,
      icon: Users,
    },
    {
      label: 'Tarjetas activas',
      value: activeCardCount,
      detail: `${redeemedCardCount} canjeadas`,
      icon: Sparkles,
    },
  ];

  useEffect(() => {
    if (!currentOwner?.id) {
      setDismissedSections(defaultDismissState);
      return;
    }

    const stored = loadFromStorage<DashboardDismissState>(dashboardDismissStateKey(currentOwner.id));
    setDismissedSections({
      getStarted: stored?.getStarted ?? false,
    });
  }, [currentOwner?.id]);

  const dismissSection = (section: keyof DashboardDismissState) => {
    if (!setupComplete || !currentOwner?.id) return;

    const nextState = {
      ...dismissedSections,
      [section]: true,
    };

    setDismissedSections(nextState);
    saveToStorage(dashboardDismissStateKey(currentOwner.id), nextState);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50/50 p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-[28px] border border-border/80 bg-card px-6 py-6 shadow-subtle md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                Resumen del negocio
              </Badge>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Panel</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                  Pon tu programa de fidelidad en marcha en tres pasos. El progreso se actualiza automáticamente al crear campañas, emitir tarjetas y comenzar a sellar.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/campaigns">Ver campañas</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/gallery">Crear campaña</Link>
              </Button>
            </div>
          </div>
        </header>

        {showGetStarted && (
          <Card className="rounded-[28px] border-border/80">
            <CardHeader className="gap-4 border-b border-border/70 pb-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">Comenzar</CardTitle>
                    {setupComplete && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                        onClick={() => dismissSection('getStarted')}
                        aria-label="Descartar inicio"
                      >
                        Descartar
                      </Button>
                    )}
                  </div>
                  <CardDescription className="mt-1 text-sm">
                    Lanza tu programa de fidelidad en tres pasos.
                  </CardDescription>
                </div>
                <Badge
                  variant={setupComplete ? 'default' : 'outline'}
                  className={cn(
                    'w-fit rounded-full px-3 py-1',
                    setupComplete && 'bg-emerald-600 text-white hover:bg-emerald-600'
                  )}
                >
                  {setupComplete ? 'Configuración completa' : `${completedSteps} de ${steps.length} completados`}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {setupComplete ? (
                  <p className="text-sm text-muted-foreground">
                    Tu flujo de fidelidad está listo. Vuelve a campañas o tarjetas emitidas cuando quieras.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Completa cada paso en orden. La siguiente acción está a un clic.
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/70 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                          step.complete
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-border bg-card text-foreground'
                        )}
                      >
                        {step.complete ? <CheckCircle2 size={20} /> : <span>{index + 1}</span>}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                          {step.complete && (
                            <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
                              Completado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    {step.complete ? (
                      <Button asChild variant="ghost" className="justify-start rounded-full md:justify-center">
                        <Link to={step.href}>
                          {setupComplete
                            ? step.title === 'Crear campaña'
                              ? 'Crear otra'
                              : 'Abrir flujo'
                            : 'Revisar'}
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild className="justify-start rounded-full md:justify-center">
                        <Link to={step.href}>
                          {step.buttonLabel}
                          <ArrowRight size={16} className="ml-2" />
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {setupComplete && (
                <div className="flex flex-wrap gap-3 border-t border-border/70 pt-2">
                  <Button asChild variant="outline" className="rounded-full">
                    <Link to="/gallery">Crear campaña</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link to="/campaigns">Ver campañas</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link to="/issued-cards">Ver tarjetas emitidas</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => (
            <Card key={item.label} className="rounded-[24px]">
              <CardContent className="flex items-start justify-between p-6">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{item.value}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <div className="rounded-2xl bg-muted p-3 text-foreground">
                  <item.icon size={20} />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="rounded-[28px]">
          <CardHeader className="border-b border-border/70 pb-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl">Actividad reciente</CardTitle>
                <CardDescription className="mt-1">
                  Últimas transacciones en todas las tarjetas emitidas.
                </CardDescription>
              </div>
              <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {recentActivity.length} mostradas
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {recentActivity.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-subtle">
                  <ReceiptText size={20} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Sin actividad aún</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Completa la lista anterior para comenzar.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-muted p-3 text-foreground">
                        {transaction.type === 'redeem' ? (
                          <Gift size={18} />
                        ) : transaction.type === 'issued' ? (
                          <Wallet size={18} />
                        ) : (
                          <PlusCircle size={18} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{formatAction(transaction.type)}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.customerName} en {transaction.campaignName}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground md:text-right">
                      <div>{formatTimestamp(transaction.timestamp)}</div>
                      <div className="text-xs uppercase tracking-[0.14em]">{transaction.actorRole ?? 'propietario'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
