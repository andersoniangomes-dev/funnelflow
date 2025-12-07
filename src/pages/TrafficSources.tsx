import { AppLayout } from "@/components/layout/AppLayout";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";


const platformColors = [
  { name: "Google Ads", value: 35, color: "hsl(262, 83%, 58%)" },
  { name: "Meta Ads", value: 30, color: "hsl(280, 87%, 65%)" },
  { name: "TikTok Ads", value: 15, color: "hsl(340, 82%, 52%)" },
  { name: "LinkedIn Ads", value: 12, color: "hsl(38, 92%, 50%)" },
  { name: "Outros", value: 8, color: "hsl(142, 76%, 36%)" },
];

const TrafficSources = () => {
  const [sourceData, setSourceData] = useState<Array<{
    source: string;
    sessions: number;
    conversions: number;
    revenue: number;
  }>>([]);
  const [campaignData, setCampaignData] = useState<Array<{
    name: string;
    sessions: number;
    conversions: number;
    ctr: string;
    roas: number | string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("30daysAgo");
  const [endDate, setEndDate] = useState("today");
  const [hasError, setHasError] = useState(false);

  useApi();

  useEffect(() => {
    fetchTrafficData();
  }, [startDate, endDate]);

  const fetchTrafficData = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      // Garantir que a API está configurada com a URL correta
      const apiEndpoint = localStorage.getItem("api_endpoint") || "http://localhost:3000";
      api.setBaseUrl(apiEndpoint);

      // Fetch sources
      const sourcesResponse = await api.getTrafficSources(startDate, endDate);
      if (sourcesResponse.sources && sourcesResponse.sources.length > 0) {
        const formattedSources = sourcesResponse.sources.map((s: any) => ({
          source: s.source || "unknown",
          sessions: s.sessions || 0,
          conversions: s.conversions || 0,
          revenue: s.revenue || 0
        }));
        setSourceData(formattedSources);
      }

      // Fetch campaigns
      const campaignsResponse = await api.getCampaigns(startDate, endDate);
      if (campaignsResponse.campaigns && campaignsResponse.campaigns.length > 0) {
        const formattedCampaigns = campaignsResponse.campaigns.map((c: any) => ({
          name: c.name || "unknown",
          sessions: c.sessions || 0,
          conversions: c.conversions || 0,
          ctr: c.conversionRate || "0%",
          roas: c.revenue > 0 && c.sessions > 0 ? (c.revenue / (c.sessions * 10)).toFixed(1) : "0"
        }));
        setCampaignData(formattedCampaigns);
      }
    } catch (error) {
      console.error("Erro ao buscar fontes de tráfego:", error);
      
      // Só mostrar toast se não tiver mostrado erro antes (evitar loop)
      if (!hasError) {
        setHasError(true);
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        
        if (errorMessage.includes("GA4 not configured") || errorMessage.includes("503")) {
          toast.error("GA4 não está configurado. Configure nas Configurações.");
        } else if (errorMessage.includes("timeout")) {
          toast.error("A requisição demorou muito. Tente novamente.");
        } else {
          toast.error("Não foi possível carregar dados de tráfego do GA4.");
        }
      }
      
      // Set empty data on error
      setSourceData([]);
      setCampaignData([]);
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
            <h1 className="text-2xl font-bold text-foreground">Fontes de Tráfego</h1>
            <p className="text-muted-foreground mt-1">Analise sua aquisição de tráfego e desempenho de campanhas</p>
          </div>
          <DateRangePicker 
            onDateChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
              // fetchTrafficData será chamado automaticamente pelo useEffect quando startDate/endDate mudarem
            }}
          />
        </div>

        {/* Source Performance Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground mb-6">Sessões por Fonte</h3>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Carregando dados...</p>
              </div>
            ) : sourceData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Nenhum dado de fonte disponível</p>
              </div>
            ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="source" type="category" stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} width={80} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 10%)",
                      border: "1px solid hsl(222, 47%, 16%)",
                      borderRadius: "8px",
                      color: "hsl(210, 40%, 98%)"
                    }}
                  />
                  <Bar dataKey="sessions" name="Sessões" fill="hsl(262, 83%, 58%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            )}
          </div>

          <div className="glass-card p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground mb-6">Distribuição por Plataforma</h3>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Carregando dados...</p>
              </div>
            ) : sourceData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
              </div>
            ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformColors}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {platformColors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 10%)",
                      border: "1px solid hsl(222, 47%, 16%)",
                      borderRadius: "8px",
                      color: "hsl(210, 40%, 98%)"
                    }}
                    formatter={(value: number) => [`${value}%`, "Participação"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            )}
            {sourceData.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {platformColors.map((platform) => (
                <div key={platform.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: platform.color }} />
                  <span className="text-sm text-muted-foreground">{platform.name}</span>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>

        {/* Source Details Table */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">Detalhes de Desempenho por Fonte</h3>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Carregando dados...</p>
            </div>
          ) : sourceData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Nenhum dado de fonte disponível</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fonte</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Sessões</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Conversões</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Taxa Conv.</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Receita</th>
                </tr>
              </thead>
              <tbody>
                {sourceData.map((source) => (
                  <tr key={source.source} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-foreground">{source.source}</td>
                    <td className="py-3 px-4 text-sm text-right text-foreground">{source.sessions.toLocaleString("pt-BR")}</td>
                    <td className="py-3 px-4 text-sm text-right text-foreground">{source.conversions.toLocaleString("pt-BR")}</td>
                    <td className="py-3 px-4 text-sm text-right text-foreground">
                      {source.sessions > 0 
                        ? ((source.conversions / source.sessions) * 100).toFixed(2).replace(".", ",")
                        : "0,00"
                      }%
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-success font-medium">
                      R$ {source.revenue.toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Campaign Performance */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">Desempenho de Campanhas</h3>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Carregando dados...</p>
            </div>
          ) : campaignData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Nenhum dado de campanha disponível</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {campaignData.map((campaign) => (
              <div key={campaign.name} className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <h4 className="font-medium text-foreground text-sm truncate">{campaign.name}</h4>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sessões</span>
                    <span className="text-foreground">{campaign.sessions.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Conversões</span>
                    <span className="text-foreground">{campaign.conversions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CTR</span>
                    <span className="text-foreground">{campaign.ctr}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ROAS</span>
                    <span className={`font-medium ${campaign.roas >= 3 ? "text-success" : campaign.roas >= 2 ? "text-warning" : "text-destructive"}`}>
                      {campaign.roas}x
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default TrafficSources;
