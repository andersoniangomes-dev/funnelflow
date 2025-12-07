import { Users, Eye, Target, TrendingUp } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { SessionsChart } from "@/components/dashboard/SessionsChart";
import { TrafficSourcesChart } from "@/components/dashboard/TrafficSourcesChart";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";

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

  useApi();

  useEffect(() => {
    fetchKPIs();
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Painel</h1>
            <p className="text-muted-foreground mt-1">Visão geral do desempenho de analytics</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SessionsChart />
          </div>
          <div>
            <TrafficSourcesChart />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">Conversões Recentes</h3>
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
