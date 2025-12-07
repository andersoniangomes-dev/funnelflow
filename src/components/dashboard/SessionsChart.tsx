import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/useApi";

export function SessionsChart() {
  const [data, setData] = useState<Array<{ date: string; sessoes: number; conversoes: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useApi();

  useEffect(() => {
    fetchSessionsData();
  }, []);

  const fetchSessionsData = async () => {
    setIsLoading(true);
    try {
      console.log("📊 Buscando dados de sessões ao longo do tempo...");
      const response = await api.getSessionsOverTime('30daysAgo', 'today');
      console.log("📥 Resposta recebida:", response);
      
      if (response && response.data && Array.isArray(response.data)) {
        console.log(`✅ ${response.data.length} pontos de dados recebidos`);
        if (response.data.length > 0) {
          console.log("📈 Primeiros dados:", response.data.slice(0, 3));
          setData(response.data);
        } else {
          console.warn("⚠️ Array de dados está vazio");
          setData([]);
        }
      } else {
        console.warn("⚠️ Resposta inválida ou sem dados:", response);
        setData([]);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar dados de sessões:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Sessões vs Conversões</h3>
        <p className="text-sm text-muted-foreground">Desempenho dos últimos 30 dias</p>
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
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(215, 20%, 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(215, 20%, 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 10%)",
                border: "1px solid hsl(222, 47%, 16%)",
                borderRadius: "8px",
                color: "hsl(210, 40%, 98%)"
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="sessoes" 
              name="Sessões"
              stroke="hsl(262, 83%, 58%)" 
              strokeWidth={2}
              dot={{ fill: "hsl(262, 83%, 58%)", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "hsl(262, 83%, 58%)" }}
            />
            <Line 
              type="monotone" 
              dataKey="conversoes" 
              name="Conversões"
              stroke="hsl(142, 76%, 36%)" 
              strokeWidth={2}
              dot={{ fill: "hsl(142, 76%, 36%)", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "hsl(142, 76%, 36%)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}
