import { AppLayout } from "@/components/layout/AppLayout";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const sourceData = [
  { source: "Google", sessions: 18420, conversions: 892, revenue: 128450 },
  { source: "Instagram", sessions: 12840, conversions: 456, revenue: 67230 },
  { source: "Facebook", sessions: 8920, conversions: 312, revenue: 45890 },
  { source: "TikTok", sessions: 5680, conversions: 187, revenue: 27650 },
  { source: "Direto", sessions: 4230, conversions: 98, revenue: 14580 },
  { source: "LinkedIn", sessions: 1890, conversions: 45, revenue: 12340 },
];

const campaignData = [
  { name: "Black Friday 2024", sessions: 15420, conversions: 723, ctr: "4,7%", roas: 5.2 },
  { name: "Promoção de Verão", sessions: 8920, conversions: 312, ctr: "3,5%", roas: 3.8 },
  { name: "Lançamento Produto", sessions: 6540, conversions: 245, ctr: "3,7%", roas: 4.1 },
  { name: "Reconhecimento Marca", sessions: 12340, conversions: 156, ctr: "1,3%", roas: 1.9 },
  { name: "Remarketing Q4", sessions: 4560, conversions: 289, ctr: "6,3%", roas: 7.2 },
];

const platformColors = [
  { name: "Google Ads", value: 35, color: "hsl(262, 83%, 58%)" },
  { name: "Meta Ads", value: 30, color: "hsl(280, 87%, 65%)" },
  { name: "TikTok Ads", value: 15, color: "hsl(340, 82%, 52%)" },
  { name: "LinkedIn Ads", value: 12, color: "hsl(38, 92%, 50%)" },
  { name: "Outros", value: 8, color: "hsl(142, 76%, 36%)" },
];

const TrafficSources = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fontes de Tráfego</h1>
            <p className="text-muted-foreground mt-1">Analise sua aquisição de tráfego e desempenho de campanhas</p>
          </div>
          <DateRangePicker />
        </div>

        {/* Source Performance Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground mb-6">Sessões por Fonte</h3>
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
          </div>

          <div className="glass-card p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground mb-6">Distribuição por Plataforma</h3>
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
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {platformColors.map((platform) => (
                <div key={platform.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: platform.color }} />
                  <span className="text-sm text-muted-foreground">{platform.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Source Details Table */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">Detalhes de Desempenho por Fonte</h3>
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
                      {((source.conversions / source.sessions) * 100).toFixed(2).replace(".", ",")}%
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-success font-medium">
                      R$ {source.revenue.toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Campaign Performance */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">Desempenho de Campanhas</h3>
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
        </div>
      </div>
    </AppLayout>
  );
};

export default TrafficSources;
