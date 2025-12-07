import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { GitBranch, TrendingDown, Users } from "lucide-react";

interface FunnelStep {
  name: string;
  users: number;
  dropoff: number;
  rate: number;
}

export function FunnelChart() {
  const [funnelSteps, setFunnelSteps] = useState<FunnelStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [funnelName, setFunnelName] = useState("Funil Padrão");
  const [hasData, setHasData] = useState(false);

  useApi();

  useEffect(() => {
    fetchDefaultFunnel();
  }, []);

  const fetchDefaultFunnel = async () => {
    setIsLoading(true);
    try {
      // First, try to get default funnel from saved funnels
      const savedFunnels = await api.getSavedFunnels();
      const defaultFunnel = savedFunnels.funnels?.find((f: any) => f.isDefault);
      
      let stepsToFetch = 'page_view,click_cta,view_checkout,begin_checkout';
      let funnelNameToUse = "Funil Padrão";
      
      if (defaultFunnel && defaultFunnel.steps && Array.isArray(defaultFunnel.steps)) {
        stepsToFetch = defaultFunnel.steps.join(',');
        funnelNameToUse = defaultFunnel.name || "Funil Padrão";
      }
      
      setFunnelName(funnelNameToUse);
      
      // Fetch funnel data
      const response = await api.getFunnel(stepsToFetch, '30daysAgo', 'today');
      
      if (response.steps && response.steps.length > 0) {
        // Filter out steps with 0 users
        const filteredSteps = response.steps.filter((step: FunnelStep) => step.users > 0);
        
        if (filteredSteps.length > 0) {
          setFunnelSteps(filteredSteps);
          setHasData(true);
        } else {
          setFunnelSteps([]);
          setHasData(false);
        }
      } else {
        setFunnelSteps([]);
        setHasData(false);
      }
    } catch (error) {
      console.error("Erro ao buscar funil padrão:", error);
      setFunnelSteps([]);
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate max users for percentage calculation
  const maxUsers = funnelSteps.length > 0 ? funnelSteps[0].users : 0;

  return (
    <div className="glass-card p-4 sm:p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          {funnelName}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">Últimos 30 dias</p>
      </div>

      {isLoading ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Carregando dados do funil...</p>
          </div>
        </div>
      ) : !hasData ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Nenhum dado de funil disponível</p>
            <p className="text-xs text-muted-foreground mt-2">
              Crie um funil na aba "Funis" para visualizar os dados
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {funnelSteps.map((step, index) => {
            const percentage = maxUsers > 0 ? (step.users / maxUsers) * 100 : 0;
            const isLast = index === funnelSteps.length - 1;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-foreground">{step.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="font-medium text-foreground">{step.users.toLocaleString('pt-BR')}</span>
                    </div>
                    {!isLast && (
                      <div className="flex items-center gap-1 text-sm text-destructive">
                        <TrendingDown className="h-4 w-4" />
                        <span>{step.dropoff.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Funnel bar */}
                <div className="relative h-8 bg-secondary rounded-lg overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500 rounded-lg"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-foreground z-10">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {/* Conversion rate */}
                {index > 0 && (
                  <div className="text-xs text-muted-foreground ml-8">
                    Taxa de conversão: {step.rate.toFixed(1)}%
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Summary */}
          {funnelSteps.length > 1 && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Taxa de Conversão Total</p>
                  <p className="text-lg font-bold text-foreground">
                    {funnelSteps.length > 0 
                      ? ((funnelSteps[funnelSteps.length - 1].users / funnelSteps[0].users) * 100).toFixed(2)
                      : '0.00'
                    }%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Abandonos Totais</p>
                  <p className="text-lg font-bold text-destructive">
                    {(funnelSteps[0].users - funnelSteps[funnelSteps.length - 1].users).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

