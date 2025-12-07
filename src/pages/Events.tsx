import { AppLayout } from "@/components/layout/AppLayout";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
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
  const [startDate, setStartDate] = useState("30daysAgo");
  const [endDate, setEndDate] = useState("today");

  useApi();

  useEffect(() => {
    fetchEvents();
  }, [startDate, endDate]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response: any = await api.getEvents(startDate, endDate);
      
      // Check if response has events array
      if (response && response.events && Array.isArray(response.events)) {
        const events = response.events.map((event: any) => ({
          name: event.name,
          count: event.count || 0,
          users: event.users || 0,
          status: event.status || "ativo"
        }));
        setEventsData(events);
      } else {
        // If no events in response, set empty array
        setEventsData([]);
        if (response && response.error) {
          toast.error(response.error || "Erro ao buscar eventos");
        }
      }
    } catch (error: any) {
      console.error("Erro ao buscar eventos:", error);
      
      // Check if it's a configuration error
      if (error?.status === 503 || error?.response?.error === 'GA4 not configured') {
        toast.error("GA4 não está configurado. Configure nas Configurações.");
      } else {
      toast.error("Não foi possível carregar eventos do GA4.");
      }
      
      // Set empty data on error
      setEventsData([]);
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
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchEvents()}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          <DateRangePicker 
            onDateChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
                // fetchEvents will be called automatically by useEffect when dates change
            }}
          />
          </div>
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
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Carregando eventos...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                {eventsData.length === 0 
                  ? "Nenhum evento encontrado no período selecionado" 
                  : "Nenhum evento corresponde à sua busca"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {eventsData.length === 0 
                  ? "Configure o GA4 nas Configurações ou aguarde a coleta de dados" 
                  : "Tente ajustar os filtros de busca"}
              </p>
            </div>
          ) : (
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
                    {event.users > 0 
                      ? (event.count / event.users).toFixed(2).replace(".", ",")
                      : "0,00"
                    }
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
          )}
        </div>

        {/* Debug Panel */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">Informações de Depuração</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Último Evento Recebido</h4>
              {eventsData.length > 0 ? (
                <code className="block p-4 rounded-lg bg-muted text-sm text-foreground">
                  {`{
  "event_name": "${eventsData[0]?.name || "N/A"}",
  "count": ${eventsData[0]?.count || 0},
  "users": ${eventsData[0]?.users || 0},
  "status": "${eventsData[0]?.status || "N/A"}"
}`}
                </code>
              ) : (
                <div className="p-4 rounded-lg bg-muted text-sm text-muted-foreground">
                  Nenhum evento disponível
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Problemas de Rastreamento</h4>
              {eventsData.filter(e => e.status !== "ativo").length > 0 ? (
                <div className="space-y-3">
                  {eventsData
                    .filter(e => e.status !== "ativo")
                    .map((event, index) => (
                      <div 
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          event.status === "alerta" 
                            ? "bg-warning/10 border-warning/20"
                            : "bg-destructive/10 border-destructive/20"
                        }`}
                      >
                        <AlertCircle className={`h-4 w-4 mt-0.5 ${
                          event.status === "alerta" ? "text-warning" : "text-destructive"
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{event.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Status: {event.status} | Contagem: {event.count} | Usuários: {event.users}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-muted text-sm text-muted-foreground">
                  Nenhum problema detectado
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Events;
