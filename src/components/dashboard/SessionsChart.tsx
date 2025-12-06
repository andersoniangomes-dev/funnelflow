import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { date: "1 Nov", sessoes: 4200, conversoes: 186 },
  { date: "5 Nov", sessoes: 5100, conversoes: 245 },
  { date: "10 Nov", sessoes: 4800, conversoes: 201 },
  { date: "15 Nov", sessoes: 6200, conversoes: 312 },
  { date: "20 Nov", sessoes: 5800, conversoes: 289 },
  { date: "25 Nov", sessoes: 7100, conversoes: 378 },
  { date: "30 Nov", sessoes: 6500, conversoes: 342 },
];

export function SessionsChart() {
  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Sessões vs Conversões</h3>
        <p className="text-sm text-muted-foreground">Desempenho dos últimos 30 dias</p>
      </div>
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
    </div>
  );
}
