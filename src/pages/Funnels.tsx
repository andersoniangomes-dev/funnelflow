import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { Plus, ArrowRight, Trash2, Play, Star } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { CreateFunnelDialog } from "@/components/funnels/CreateFunnelDialog";
import { loadSavedFunnels, saveFunnels } from "@/components/funnels/CreateFunnelDialog";

const Funnels = () => {
  const [funnelSteps, setFunnelSteps] = useState<Array<{
    name: string;
    users: number;
    dropoff: number;
    rate: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [funnelSummary, setFunnelSummary] = useState({
    totalConversionRate: "0%",
    totalDropoffs: "0",
    totalRevenue: "R$ 0"
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [savedFunnels, setSavedFunnels] = useState<any[]>([]);
  const [selectedFunnelId, setSelectedFunnelId] = useState<number | null>(null);
  const [currentFunnelName, setCurrentFunnelName] = useState("");
  const [startDate, setStartDate] = useState("30daysAgo");
  const [endDate, setEndDate] = useState("today");
  const [isLoadingFunnels, setIsLoadingFunnels] = useState(true);

  useApi();

  useEffect(() => {
    loadSavedFunnelsList();
  }, []);

  useEffect(() => {
    // Load default funnel if exists
    const defaultFunnel = savedFunnels.find((f: any) => f.isDefault);
    
    if (defaultFunnel && defaultFunnel.steps) {
      setSelectedFunnelId(defaultFunnel.id);
      setCurrentFunnelName(defaultFunnel.name);
      // fetchFunnel será chamado automaticamente pelo useEffect quando selectedFunnelId mudar
    }
  }, [savedFunnels]);

  useEffect(() => {
    // Reload funnel when date range, selected funnel, or saved funnels changes
    if (selectedFunnelId) {
      const selectedFunnel = savedFunnels.find(f => f.id === selectedFunnelId);
      const steps = selectedFunnel?.steps?.join(",");
      if (steps) {
        fetchFunnel(steps);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, selectedFunnelId, savedFunnels]);

  const loadSavedFunnelsList = async () => {
    setIsLoadingFunnels(true);
    try {
      const funnels = await loadSavedFunnels();
      setSavedFunnels(funnels);
    } catch (error) {
      console.error("Erro ao carregar funis:", error);
      setSavedFunnels([]);
    } finally {
      setIsLoadingFunnels(false);
    }
  };

  const handleFunnelCreated = () => {
    loadSavedFunnelsList();
  };

  const setDefaultFunnel = async (funnelId: number) => {
    try {
      const updated = savedFunnels.map((f: any) => ({
        ...f,
        isDefault: f.id === funnelId
      }));
      
      // Save to database
      await saveFunnels(updated);
      setSavedFunnels(updated);
      toast.success("Funil definido como padrão!");
      
      // Se o funil selecionado for o padrão, atualizar o nome
      if (funnelId === selectedFunnelId) {
        const defaultFunnel = updated.find((f: any) => f.id === funnelId);
        if (defaultFunnel) {
          setCurrentFunnelName(defaultFunnel.name);
        }
      }
    } catch (error) {
      console.error("Erro ao definir funil padrão:", error);
      toast.error("Erro ao definir funil padrão");
    }
  };

  const fetchFunnel = async (steps?: string) => {
    setIsLoading(true);
    try {
      // Garantir que a API está configurada com a URL correta
      const apiEndpoint = localStorage.getItem("api_endpoint") || "http://localhost:3000";
      api.setBaseUrl(apiEndpoint);

      const stepsToFetch = steps || (selectedFunnelId 
        ? savedFunnels.find(f => f.id === selectedFunnelId)?.steps.join(",")
        : null
      );
      
      if (!stepsToFetch) {
        setIsLoading(false);
        return;
      }

      const response = await api.getFunnel(stepsToFetch, startDate, endDate);
      
      if (response.steps && response.steps.length > 0) {
        setFunnelSteps(response.steps);
        if (response.summary) {
          setFunnelSummary({
            totalConversionRate: response.summary.totalConversionRate || "0%",
            totalDropoffs: response.summary.totalDropoffs || "0",
            totalRevenue: response.summary.totalRevenue || "R$ 0"
          });
        } else {
          // Reset to zero if no summary
          setFunnelSummary({
            totalConversionRate: "0%",
            totalDropoffs: "0",
            totalRevenue: "R$ 0"
          });
        }

        // Update current funnel name
        if (selectedFunnelId) {
          const selectedFunnel = savedFunnels.find(f => f.id === selectedFunnelId);
          if (selectedFunnel) {
            setCurrentFunnelName(selectedFunnel.name);
          }
        }
      } else {
        // Reset to zero if no steps
        setFunnelSteps([]);
        setFunnelSummary({
          totalConversionRate: "0%",
          totalDropoffs: "0",
          totalRevenue: "R$ 0"
        });
      }
    } catch (error) {
      console.error("Erro ao buscar funil:", error);
      toast.error("Não foi possível carregar dados do funil do GA4.");
      // Set empty data on error
      setFunnelSteps([]);
      setFunnelSummary({
        totalConversionRate: "0%",
        totalDropoffs: "0",
        totalRevenue: "R$ 0"
      });
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
            <h1 className="text-2xl font-bold text-foreground">Funis</h1>
            <p className="text-muted-foreground mt-1">Visualize a jornada do usuário pelo seu funil de conversão</p>
          </div>
          <div className="flex items-center gap-3">
            <DateRangePicker 
              onDateChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
                // fetchFunnel será chamado automaticamente pelo useEffect quando startDate/endDate mudarem
              }}
            />
            <Button 
              variant="gradient" 
              className="gap-2"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4" />
              Novo Funil
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Fonte / Mídia:</span>
            <Select 
              defaultValue="all"
              onValueChange={(value) => {
                toast.info(`Filtro aplicado: ${value === "all" ? "Todas as Fontes" : value}`);
                // TODO: Implementar filtro real quando backend suportar
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Fontes</SelectItem>
                <SelectItem value="google-cpc">Google / CPC</SelectItem>
                <SelectItem value="instagram-story">Instagram / Story</SelectItem>
                <SelectItem value="facebook-feed">Facebook / Feed</SelectItem>
                <SelectItem value="tiktok-video">TikTok / Vídeo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Campanha:</span>
            <Select 
              defaultValue="all"
              onValueChange={(value) => {
                toast.info(`Filtro aplicado: ${value === "all" ? "Todas as Campanhas" : value}`);
                // TODO: Implementar filtro real quando backend suportar
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Campanhas</SelectItem>
                <SelectItem value="black-friday">Black Friday 2024</SelectItem>
                <SelectItem value="summer-sale">Promoção de Verão</SelectItem>
                <SelectItem value="new-product">Lançamento de Produto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Funnel Visualization */}
        <div className="glass-card p-8 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold text-foreground">
              {currentFunnelName || "Selecione um funil para visualizar"}
            </h3>
            {selectedFunnelId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFunnelId(null);
                  setCurrentFunnelName("");
                  setFunnelSteps([]);
                  setFunnelSummary({
                    totalConversionRate: "0%",
                    totalDropoffs: "0",
                    totalRevenue: "R$ 0"
                  });
                }}
              >
                Limpar Seleção
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">Carregando dados do funil...</p>
            </div>
          ) : funnelSteps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">Nenhum dado de funil disponível</p>
              <p className="text-xs text-muted-foreground mt-2">Configure o GA4 e aguarde a coleta de dados</p>
            </div>
          ) : (
          <div className="flex flex-col gap-4">
            {funnelSteps.map((step, index) => {
              const widthPercent = step.rate;
              const isLast = index === funnelSteps.length - 1;
              
              return (
                <div key={step.name} className="relative">
                  <div className="flex items-center gap-4">
                    {/* Step bar */}
                    <div className="flex-1 relative">
                      <div 
                        className="h-16 rounded-lg bg-gradient-to-r from-primary to-purple-400 flex items-center justify-between px-6 transition-all duration-500"
                        style={{ width: `${Math.max(widthPercent, 20)}%` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-background/20 flex items-center justify-center text-sm font-bold text-primary-foreground">
                            {index + 1}
                          </div>
                          <span className="font-medium text-primary-foreground">{step.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-primary-foreground">
                          {step.users.toLocaleString("pt-BR")} usuários
                        </span>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="w-48 flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{step.rate}%</p>
                        <p className="text-xs text-muted-foreground">Conversão</p>
                      </div>
                      {!isLast && step.dropoff > 0 && (
                        <div className="text-center">
                          <p className="text-lg font-semibold text-destructive">-{step.dropoff}%</p>
                          <p className="text-xs text-muted-foreground">Abandono</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  {!isLast && (
                    <div className="flex items-center justify-center my-2 ml-[10%]">
                      <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
          
          {/* Summary */}
          {funnelSteps.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold gradient-text">{funnelSummary.totalConversionRate}</p>
                <p className="text-sm text-muted-foreground mt-1">Taxa de Conversão Total</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{funnelSummary.totalDropoffs}</p>
                <p className="text-sm text-muted-foreground mt-1">Total de Abandonos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-success">{funnelSummary.totalRevenue}</p>
                <p className="text-sm text-muted-foreground mt-1">Receita Gerada</p>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Saved Funnels */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">Funis Salvos</h3>
          {savedFunnels.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Nenhum funil salvo</p>
              <p className="text-xs text-muted-foreground mt-2">Use o botão "Novo Funil" para criar funis personalizados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedFunnels.map((funnel) => (
                <div
                  key={funnel.id}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    selectedFunnelId === funnel.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => {
                    setSelectedFunnelId(funnel.id);
                    setCurrentFunnelName(funnel.name);
                    // fetchFunnel será chamado automaticamente pelo useEffect quando selectedFunnelId mudar
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{funnel.name}</h4>
                        {funnel.isDefault && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-500">
                            <Star className="h-3 w-3 fill-current" />
                            Padrão
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {funnel.steps?.length || 0} etapas
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {funnel.steps?.slice(0, 3).map((step: string, idx: number) => (
                          <code key={idx} className="text-xs px-1.5 py-0.5 rounded bg-muted">
                            {step}
                          </code>
                        ))}
                        {funnel.steps?.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{funnel.steps.length - 3}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(funnel.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${funnel.isDefault ? "text-yellow-500 hover:text-yellow-600" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDefaultFunnel(funnel.id);
                        }}
                        title={funnel.isDefault ? "Funil padrão" : "Definir como padrão"}
                      >
                        <Star className={`h-3.5 w-3.5 ${funnel.isDefault ? "fill-current" : ""}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFunnelId(funnel.id);
                          setCurrentFunnelName(funnel.name);
                          // fetchFunnel será chamado automaticamente pelo useEffect quando selectedFunnelId mudar
                        }}
                        title="Visualizar funil"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                            if (confirm(`Tem certeza que deseja deletar o funil "${funnel.name}"?`)) {
                            const wasDefault = funnel.isDefault;
                            
                            try {
                              const apiEndpoint = localStorage.getItem("api_endpoint") || "http://localhost:3000";
                              api.setBaseUrl(apiEndpoint);
                              
                              // Try to delete from database
                              try {
                                await api.deleteFunnel(funnel.id);
                              } catch (dbError) {
                                console.warn("Erro ao deletar do banco, usando localStorage:", dbError);
                              }
                              
                              const updated = savedFunnels.filter(f => f.id !== funnel.id);
                              await saveFunnels(updated);
                              setSavedFunnels(updated);
                              
                              if (selectedFunnelId === funnel.id) {
                                // Se era o funil padrão, carregar o novo padrão ou o padrão do sistema
                                const newDefaultFunnel = updated.find((f: any) => f.isDefault);
                                if (newDefaultFunnel) {
                                  setSelectedFunnelId(newDefaultFunnel.id);
                                  setCurrentFunnelName(newDefaultFunnel.name);
                                } else {
                                  setSelectedFunnelId(null);
                                  setCurrentFunnelName("");
                                  setFunnelSteps([]);
                                  setFunnelSummary({
                                    totalConversionRate: "0%",
                                    totalDropoffs: "0",
                                    totalRevenue: "R$ 0"
                                  });
                                }
                              }
                              
                              toast.success("Funil deletado com sucesso!");
                              
                              if (wasDefault && updated.length > 0) {
                                toast.info("O funil padrão foi removido. Defina um novo funil como padrão se desejar.");
                              }
                            } catch (error) {
                              console.error("Erro ao deletar funil:", error);
                              toast.error("Erro ao deletar funil");
                            }
                          }
                        }}
                        title="Deletar funil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Funnel Dialog */}
        <CreateFunnelDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onFunnelCreated={handleFunnelCreated}
        />
      </div>
    </AppLayout>
  );
};

export default Funnels;
