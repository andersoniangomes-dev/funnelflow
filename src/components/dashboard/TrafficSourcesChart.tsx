import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/useApi";

const COLORS = [
  "hsl(262, 83%, 58%)",
  "hsl(280, 87%, 65%)",
  "hsl(340, 82%, 52%)",
  "hsl(38, 92%, 50%)",
  "hsl(142, 76%, 36%)",
  "hsl(217, 91%, 60%)",
  "hsl(0, 72%, 51%)",
];

export function TrafficSourcesChart() {
  const [data, setData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useApi();

  useEffect(() => {
    fetchTrafficData();
  }, []);

  const fetchTrafficData = async () => {
    setIsLoading(true);
    try {
      const response = await api.getTrafficSources('30daysAgo', 'today');
      if (response.sources && response.sources.length > 0) {
        // Get top 5 sources by sessions
        const topSources = response.sources
          .slice(0, 5)
          .map((source: any, index: number) => ({
            name: source.source || 'unknown',
            value: source.sessions || 0,
            color: COLORS[index % COLORS.length]
          }));
        setData(topSources);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Erro ao buscar dados de tráfego:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Tráfego por Fonte / Mídia</h3>
        <p className="text-sm text-muted-foreground">Distribuição das fontes de tráfego</p>
      </div>
      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
            <p className="text-xs text-muted-foreground mt-2">Configure o GA4 para ver os dados do gráfico</p>
          </div>
        </div>
      ) : (
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
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
            <Legend 
              wrapperStyle={{ color: "hsl(210, 40%, 98%)" }}
              formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}
