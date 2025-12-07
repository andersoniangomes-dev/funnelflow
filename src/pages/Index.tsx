import { Users, Eye, Target, TrendingUp, Link2, MousePointerClick, BarChart3 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { SessionsChart } from "@/components/dashboard/SessionsChart";
import { TrafficSourcesChart } from "@/components/dashboard/TrafficSourcesChart";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Empty KPIs template
const emptyKPIs = [
  { title: "Sessões", value: "0", change: 0, changeLabel: "vs período anterior", icon: Eye },
  { title: "Usuários", value: "0", change: 0, changeLabel: "vs período anterior", icon: Users },
  { title: "Conversões", value: "0", change: 0, changeLabel: "vs período anterior", icon: Target },
  { title: "Taxa de Conversão", value: "0%", change: 0, changeLabel: "vs período anterior", icon: TrendingUp },
];

const Index = () => {
  const [kpis, setKpis] = useState(emptyKPIs);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("30daysAgo");
  const [endDate, setEndDate] = useState("today");
  const [utmStats, setUtmStats] = useState<any>(null);
  const [savedUTMs, setSavedUTMs] = useState<any[]>([]);
  const [isLoadingUTMs, setIsLoadingUTMs] = useState(true);
  const navigate = useNavigate();

  useApi();

  useEffect(() => {
    fetchKPIs();
    fetchUTMData();
  }, [startDate, endDate]);

  const fetchKPIs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getKPIs(startDate, endDate);
      
      // Map API response to KPI format
      setKpis([
        { 
          title: "Sessões", 
          value: data.sessions.value, 
          change: data.sessions.change, 
          changeLabel: data.sessions.changeLabel, 
          icon: Eye 
        },
        { 
          title: "Usuários", 
          value: data.users.value, 
          change: data.users.change, 
          changeLabel: data.users.changeLabel, 
          icon: Users 
        },
        { 
          title: "Conversões", 
          value: data.conversions.value, 
          change: data.conversions.change, 
          changeLabel: data.conversions.changeLabel, 
          icon: Target 
        },
        { 
          title: "Taxa de Conversão", 
          value: data.conversionRate.value, 
          change: data.conversionRate.change, 
          changeLabel: data.conversionRate.changeLabel, 
          icon: TrendingUp 
        },
      ]);
    } catch (error) {
      console.error("Erro ao buscar KPIs:", error);
      // Set empty data on error
      setKpis(emptyKPIs);
      toast.error("Não foi possível carregar dados do GA4.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUTMData = async () => {
    setIsLoadingUTMs(true);
    try {
      // Fetch saved UTMs
      const utmsResponse = await api.getSavedUTMs();
      const utms = utmsResponse.utms || [];
      setSavedUTMs(utms);

      // Fetch UTM stats
      const statsResponse = await api.getUTMStats();
      setUtmStats(statsResponse);
    } catch (error) {
      console.error("Erro ao buscar dados de UTMs:", error);
    } finally {
      setIsLoadingUTMs(false);
    }
  };

  // Calculate UTM metrics
  const utmMetrics = utmStats ? {
    totalUTMs: utmStats.totalUTMs || 0,
    totalClicks: utmStats.totalClicks || 0,
    topUTMs: savedUTMs
      .map((utm: any) => {
        const stats = utmStats.stats?.find((s: any) => String(s.utmId) === String(utm.id));
        return {
          ...utm,
          totalClicks: stats?.totalClicks || 0,
          recentClicks: stats?.recentClicks || 0,
          lastClick: stats?.lastClick
        };
      })
      .sort((a: any, b: any) => b.totalClicks - a.totalClicks)
      .slice(0, 5)
  } : null;

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Painel</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Visão geral do desempenho de analytics</p>
          </div>
          <DateRangePicker 
            onDateChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
          />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <KPICard
              key={kpi.title}
              {...kpi}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <SessionsChart />
          </div>
          <div>
            <TrafficSourcesChart />
          </div>
        </div>

        {/* UTM Statistics Section */}
        {!isLoadingUTMs && utmMetrics && (
          <div className="glass-card p-4 sm:p-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">UTMs e Tracking</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Estatísticas das suas campanhas UTM</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/utm-builder")}
                className="gap-2"
              >
                <Link2 className="h-4 w-4" />
                Gerenciar UTMs
              </Button>
            </div>

            {/* UTM KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="h-4 w-4 text-primary" />
                  <span className="text-xs sm:text-sm text-muted-foreground">UTMs Criadas</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{utmMetrics.totalUTMs}</p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-success/5 border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointerClick className="h-4 w-4 text-success" />
                  <span className="text-xs sm:text-sm text-muted-foreground">Total Cliques</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{utmMetrics.totalClicks}</p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-xs sm:text-sm text-muted-foreground">UTMs Ativas</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {utmMetrics.topUTMs.filter((u: any) => u.totalClicks > 0).length}
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-secondary-foreground" />
                  <span className="text-xs sm:text-sm text-muted-foreground">Média/UTM</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {utmMetrics.totalUTMs > 0 
                    ? Math.round(utmMetrics.totalClicks / utmMetrics.totalUTMs) 
                    : 0}
                </p>
              </div>
            </div>

            {/* Top UTMs */}
            {utmMetrics.topUTMs.length > 0 ? (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Top UTMs por Cliques</h4>
                <div className="space-y-2">
                  {utmMetrics.topUTMs.map((utm: any, index: number) => (
                    <div
                      key={utm.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{utm.name || "Sem nome"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {utm.source && (
                              <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                                {utm.source}
                              </span>
                            )}
                            {utm.medium && (
                              <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                                {utm.medium}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">{utm.totalClicks}</p>
                          <p className="text-xs text-muted-foreground">cliques</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">Nenhuma UTM criada ainda</p>
                <p className="text-xs text-muted-foreground mt-2">Crie UTMs para começar a rastrear cliques</p>
              </div>
            )}
          </div>
        )}

        {/* Recent Activity */}
        <div className="glass-card p-4 sm:p-6 animate-fade-in">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Conversões Recentes</h3>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Carregando conversões recentes...</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Nenhuma conversão recente encontrada</p>
                <p className="text-xs text-muted-foreground mt-2">Os dados aparecerão aqui quando houver conversões no período selecionado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
