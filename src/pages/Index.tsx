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

// Fallback data
const fallbackKPIs = [
  { title: "Sessões", value: "42.580", change: 12.5, changeLabel: "vs período anterior", icon: Eye },
  { title: "Usuários", value: "28.392", change: 8.2, changeLabel: "vs período anterior", icon: Users },
  { title: "Conversões", value: "1.847", change: 23.1, changeLabel: "vs período anterior", icon: Target },
  { title: "Taxa de Conversão", value: "4,34%", change: 9.4, changeLabel: "vs período anterior", icon: TrendingUp },
];

const Index = () => {
  const [kpis, setKpis] = useState(fallbackKPIs);
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
      // Keep fallback data on error
      setKpis(fallbackKPIs);
      toast.error("Não foi possível carregar dados do GA4. Usando dados de exemplo.");
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
          <DateRangePicker />
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
            {[
              { event: "compra", source: "google / cpc", time: "2 minutos atrás", value: "R$ 149,00" },
              { event: "cadastro", source: "instagram / story", time: "5 minutos atrás", value: "-" },
              { event: "compra", source: "facebook / feed", time: "12 minutos atrás", value: "R$ 89,00" },
              { event: "compra", source: "tiktok / video", time: "18 minutos atrás", value: "R$ 249,00" },
              { event: "cadastro", source: "direto / nenhum", time: "25 minutos atrás", value: "-" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-4">
                  <div className={`h-2 w-2 rounded-full ${item.event === "compra" ? "bg-success" : "bg-primary"}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.event}</p>
                    <p className="text-xs text-muted-foreground">{item.source}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
