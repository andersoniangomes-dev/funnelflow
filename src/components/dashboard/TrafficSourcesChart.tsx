import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Google / CPC", value: 35, color: "hsl(262, 83%, 58%)" },
  { name: "Instagram / Story", value: 25, color: "hsl(280, 87%, 65%)" },
  { name: "Facebook / Feed", value: 20, color: "hsl(340, 82%, 52%)" },
  { name: "TikTok / Vídeo", value: 12, color: "hsl(38, 92%, 50%)" },
  { name: "Direto", value: 8, color: "hsl(142, 76%, 36%)" },
];

export function TrafficSourcesChart() {
  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Tráfego por Fonte / Mídia</h3>
        <p className="text-sm text-muted-foreground">Distribuição das fontes de tráfego</p>
      </div>
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
    </div>
  );
}
