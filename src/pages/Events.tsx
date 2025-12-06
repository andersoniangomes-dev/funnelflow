import { AppLayout } from "@/components/layout/AppLayout";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle, CheckCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [eventsData, setEventsData] = useState<Array<{
    name: string;
    count: number;
    users: number;
    status: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useApi();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await api.getEvents();
      const events = response.events.map((event: any) => ({
        name: event.name,
        count: event.count,
        users: event.users,
        status: event.status || "ativo"
      }));
      setEventsData(events);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      toast.error("Não foi possível carregar eventos do GA4.");
      // Fallback data
      setEventsData([
        { name: "page_view", count: 0, users: 0, status: "erro" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = eventsData.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Eventos</h1>
            <p className="text-muted-foreground mt-1">Acompanhe e depure seus eventos do GA4</p>
          </div>
          <DateRangePicker />
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <div className="glass-card px-4 py-2 flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm text-foreground">{eventsData.filter(e => e.status === "ativo").length} Ativos</span>
            </div>
            <div className="glass-card px-4 py-2 flex items-center gap-3">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span className="text-sm text-foreground">{eventsData.filter(e => e.status === "alerta").length} Alerta</span>
            </div>
            <div className="glass-card px-4 py-2 flex items-center gap-3">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-foreground">{eventsData.filter(e => e.status === "erro").length} Erro</span>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="glass-card animate-fade-in">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Nome do Evento</TableHead>
                <TableHead className="text-muted-foreground text-right">Contagem</TableHead>
                <TableHead className="text-muted-foreground text-right">Usuários</TableHead>
                <TableHead className="text-muted-foreground text-right">Média por Usuário</TableHead>
                <TableHead className="text-muted-foreground text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.name} className="border-border hover:bg-secondary/50 cursor-pointer">
                  <TableCell className="font-medium text-foreground">
                    <code className="px-2 py-1 rounded bg-muted text-sm">{event.name}</code>
                  </TableCell>
                  <TableCell className="text-right text-foreground">{event.count.toLocaleString("pt-BR")}</TableCell>
                  <TableCell className="text-right text-foreground">{event.users.toLocaleString("pt-BR")}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {(event.count / event.users).toFixed(2).replace(".", ",")}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === "ativo" 
                        ? "bg-success/10 text-success" 
                        : event.status === "alerta"
                        ? "bg-warning/10 text-warning"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {event.status === "ativo" && <CheckCircle className="h-3 w-3" />}
                      {event.status !== "ativo" && <AlertCircle className="h-3 w-3" />}
                      {event.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Debug Panel */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">Informações de Depuração</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Último Evento Recebido</h4>
              <code className="block p-4 rounded-lg bg-muted text-sm text-foreground">
                {`{
  "event_name": "page_view",
  "timestamp": "2024-11-30T14:32:18Z",
  "user_id": "usr_abc123",
  "page_location": "/produtos/item-1"
}`}
              </code>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Problemas de Rastreamento</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">video_complete com baixa taxa de disparo</p>
                    <p className="text-xs text-muted-foreground mt-1">Apenas 22% dos eventos video_start levam a video_complete</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">form_submit sem parâmetros obrigatórios</p>
                    <p className="text-xs text-muted-foreground mt-1">O parâmetro form_id não está sendo enviado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Events;
