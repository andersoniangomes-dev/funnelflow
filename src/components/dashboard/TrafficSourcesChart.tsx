import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export function TrafficSourcesChart() {
  // Empty data - will be populated when GA4 data is available
  const data: Array<{ name: string; value: number; color: string }> = [];

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Tráfego por Fonte / Mídia</h3>
        <p className="text-sm text-muted-foreground">Distribuição das fontes de tráfego</p>
      </div>
      {data.length === 0 ? (
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
