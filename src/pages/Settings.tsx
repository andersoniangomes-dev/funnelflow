import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, AlertCircle, RefreshCw, Upload, FileText, Database, Server, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const Settings = () => {
  // Get default API URL from environment or use Render URL
  const getDefaultApiUrl = () => {
    return import.meta.env.VITE_API_URL || 'https://funnelflow-backend.onrender.com';
  };

  const [apiEndpoint, setApiEndpoint] = useState(() => {
    return localStorage.getItem("api_endpoint") || getDefaultApiUrl();
  });
  const [propertyId, setPropertyId] = useState("");
  const [serviceAccountJson, setServiceAccountJson] = useState("");
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("disconnected");
  const [healthData, setHealthData] = useState<any>(null);
  const [isEnvVar, setIsEnvVar] = useState(false);

  // Check if API URL comes from environment variable
  useEffect(() => {
    const envUrl = import.meta.env.VITE_API_URL;
    setIsEnvVar(!!envUrl && !localStorage.getItem("api_endpoint"));
  }, []);

  // Update API base URL when endpoint changes
  useEffect(() => {
    if (apiEndpoint) {
      console.log("🔧 Atualizando API base URL para:", apiEndpoint);
      api.setBaseUrl(apiEndpoint);
    }
  }, [apiEndpoint]);

  // Load configuration on mount
  useEffect(() => {
    console.log("📋 Carregando configuração, endpoint:", apiEndpoint);
    loadConfiguration();
    testConnection();
  }, [apiEndpoint]);

  const loadConfiguration = async () => {
    setIsLoadingConfig(true);
    try {
      api.setBaseUrl(apiEndpoint);
      const config = await api.getConfig();
      setPropertyId(config.propertyId || "");
      // Don't load the full JSON for security, just indicate if it exists
      if (config.hasCredentials) {
        setServiceAccountJson("*** Credenciais já configuradas ***");
      } else {
        setServiceAccountJson("");
      }
    } catch (error) {
      console.error("Erro ao carregar configuração:", error);
      // If config doesn't exist, that's ok
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        // Validate JSON
        JSON.parse(content);
        setServiceAccountJson(content);
        toast.success("Arquivo carregado com sucesso!");
      } catch (error) {
        toast.error("Arquivo inválido. Por favor, selecione um arquivo JSON válido.");
      }
    };
    reader.readAsText(file);
  };

  const testConnection = async () => {
    setConnectionStatus("testing");
    
    try {
      // Update API base URL
      const currentEndpoint = apiEndpoint || getDefaultApiUrl();
      api.setBaseUrl(currentEndpoint);
      
      console.log("🧪 Testando conexão com:", currentEndpoint);
      
      // Test health endpoint
      const response = await api.health();
      setHealthData(response);
      
      console.log("✅ Resposta do health:", response);
      
      if (response.status === "ok" && response.ga4 === "connected") {
        setConnectionStatus("connected");
      } else {
        setConnectionStatus("disconnected");
      }
    } catch (error: any) {
      console.error("❌ Erro ao testar conexão:", error);
      setConnectionStatus("disconnected");
      setHealthData(null);
      
      // Show helpful error message
      if (error?.status === 404 || error?.message?.includes("404")) {
        toast.error("Backend não encontrado. Verifique se o serviço está online ou se a URL está correta.");
      } else if (error?.name === "AbortError") {
        toast.error("Timeout: O backend pode estar suspenso (plano gratuito). Aguarde 1-2 minutos.");
      }
    }
  };

  const handleSaveGA4Config = async () => {
    if (!propertyId.trim()) {
      toast.error("Por favor, insira o Property ID do GA4");
      return;
    }

    if (!serviceAccountJson.trim() || serviceAccountJson.includes("***")) {
      toast.error("Por favor, insira ou faça upload do arquivo JSON do Service Account");
      return;
    }

    setIsSavingConfig(true);
    try {
      // Ensure API base URL is set correctly
      const currentEndpoint = apiEndpoint || getDefaultApiUrl();
      api.setBaseUrl(currentEndpoint);
      
      console.log("🔗 Salvando configuração para:", currentEndpoint);
      
      // Validate JSON
      let credentialsObj;
      try {
        credentialsObj = JSON.parse(serviceAccountJson);
      } catch (error) {
        toast.error("JSON do Service Account inválido. Verifique o formato.");
        setIsSavingConfig(false);
        return;
      }

      // Make sure we're using the correct endpoint
      const response = await api.saveConfig(propertyId.trim(), credentialsObj);
      
      console.log("✅ Configuração salva:", response);
      toast.success("Configuração do GA4 salva com sucesso!");
      
      // Reload config to update UI
      await loadConfiguration();
      
      // Test connection after saving
      setTimeout(() => {
        testConnection();
      }, 1000);
      
    } catch (error: any) {
      console.error("❌ Erro ao salvar configuração:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      const status = error?.status || error?.response?.status;
      
      if (status === 404) {
        toast.error(`Erro 404: Endpoint não encontrado. Verifique se a URL do backend está correta: ${apiEndpoint || getDefaultApiUrl()}`);
      } else if (status === 400) {
        toast.error("Erro 400: Dados inválidos. Verifique o Property ID e o JSON do Service Account.");
      } else {
        toast.error(`Erro ao salvar configuração: ${errorMessage}`);
      }
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleSaveEndpoint = () => {
    // Only save if not from environment variable
    if (!isEnvVar) {
      localStorage.setItem("api_endpoint", apiEndpoint);
    }
    
    // Update API base URL
    api.setBaseUrl(apiEndpoint);
    
    toast.success("URL do endpoint atualizada!");
    testConnection();
  };

  const handleClearCache = () => {
    if (confirm("Tem certeza que deseja limpar o cache local? Isso não afetará os dados salvos no banco de dados.")) {
      // Only clear local cache, not database data
      localStorage.removeItem("api_endpoint");
      localStorage.removeItem("saved_funnels"); // Local fallback only
      
      // Reset to default
      const defaultUrl = getDefaultApiUrl();
      setApiEndpoint(defaultUrl);
      setIsEnvVar(!!import.meta.env.VITE_API_URL);
      
      toast.success("Cache local limpo com sucesso!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Configure sua integração de analytics e preferências</p>
        </div>

        {/* System Status */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Status do Sistema
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Backend API</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {apiEndpoint}
                    {isEnvVar && (
                      <span className="ml-2 text-xs text-primary">(Variável de ambiente)</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {connectionStatus === "connected" && (
                  <CheckCircle className="h-5 w-5 text-success" />
                )}
                {connectionStatus === "disconnected" && (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                {connectionStatus === "testing" && (
                  <RefreshCw className="h-5 w-5 text-primary animate-spin" />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testConnection}
                  disabled={connectionStatus === "testing"}
                >
                  {connectionStatus === "testing" ? "Testando..." : "Testar"}
                </Button>
              </div>
            </div>

            {healthData && (
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Banco de Dados</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {healthData.ga4 === "connected" ? "Conectado ao Neon PostgreSQL" : "Não configurado"}
                    </p>
                  </div>
                </div>
                {healthData.ga4 === "connected" && (
                  <CheckCircle className="h-5 w-5 text-success" />
                )}
              </div>
            )}

            {healthData && healthData.propertyId && (
              <div className="p-4 rounded-lg border border-border bg-muted/50">
                <p className="text-sm font-medium text-foreground">Google Analytics 4</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Property ID: {healthData.propertyId}
                </p>
                <p className="text-xs text-muted-foreground">
                  Status: {healthData.ga4 === "connected" ? "Conectado" : "Não conectado"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* API Endpoint Configuration */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-6">Configuração da API</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiEndpoint">URL do Endpoint da API</Label>
              <Input
                id="apiEndpoint"
                placeholder={getDefaultApiUrl()}
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="mt-1.5 max-w-md"
                disabled={isEnvVar}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {isEnvVar 
                  ? "Configurado via variável de ambiente (VITE_API_URL). Não pode ser alterado aqui."
                  : "URL do backend (ex: http://localhost:3000 ou https://funnelflow-backend.onrender.com)"}
              </p>
            </div>

            {!isEnvVar && (
              <Button
                variant="outline"
                onClick={handleSaveEndpoint}
                className="gap-2"
              >
                Salvar URL do Endpoint
              </Button>
            )}
          </div>
        </div>

        {/* GA4 Configuration */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-6">Configuração do GA4</h3>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="propertyId">ID da Propriedade GA4 *</Label>
              <Input
                id="propertyId"
                placeholder="ex: 123456789"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="mt-1.5 max-w-md"
                disabled={isLoadingConfig}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Encontre seu ID da Propriedade em Google Analytics → Admin → Configurações da Propriedade
              </p>
            </div>

            <div>
              <Label htmlFor="serviceAccount">Service Account JSON *</Label>
              <div className="mt-1.5 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={isLoadingConfig}
                  />
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent text-sm"
                  >
                    <Upload className="h-4 w-4" />
                    Fazer Upload do JSON
                  </Label>
                  <span className="text-xs text-muted-foreground">ou</span>
                  <span className="text-xs text-muted-foreground">cole o conteúdo abaixo</span>
                </div>
                <Textarea
                  id="serviceAccount"
                  placeholder={serviceAccountJson.includes("***") 
                    ? "Credenciais já configuradas. Clique em 'Limpar e Reconfigurar' para editar."
                    : 'Cole aqui o conteúdo do arquivo JSON do Service Account...'}
                  value={serviceAccountJson}
                  onChange={(e) => setServiceAccountJson(e.target.value)}
                  className="min-h-[200px] font-mono text-xs"
                  disabled={isLoadingConfig || serviceAccountJson.includes("***")}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Faça upload ou cole o conteúdo do arquivo JSON do Service Account do Google Cloud.
                <br />
                <span className="text-warning">⚠️ Este arquivo contém credenciais sensíveis. Mantenha-o seguro.</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="gradient"
                onClick={handleSaveGA4Config}
                disabled={isSavingConfig || isLoadingConfig || serviceAccountJson.includes("***")}
                className="gap-2"
              >
                {isSavingConfig ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Salvar Configuração GA4
                  </>
                )}
              </Button>
              {serviceAccountJson.includes("***") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setServiceAccountJson("");
                    setPropertyId("");
                  }}
                  className="gap-2"
                >
                  Limpar e Reconfigurar
                </Button>
              )}
              {isLoadingConfig && (
                <span className="text-sm text-muted-foreground">Carregando configuração...</span>
              )}
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-6">Gerenciamento de Dados</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Exportar Dados</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Baixar todos os seus dados de analytics em CSV
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  try {
                    api.setBaseUrl(apiEndpoint);
                    
                    // Fetch all data
                    const [kpis, events, traffic] = await Promise.all([
                      api.getKPIs().catch(() => null),
                      api.getEvents().catch(() => null),
                      api.getTrafficSources().catch(() => null)
                    ]);

                    // Convert to CSV format
                    let csv = "Tipo,Dados\n";
                    
                    if (kpis) {
                      csv += `KPIs,"Sessões: ${kpis.sessions.value}, Usuários: ${kpis.users.value}, Conversões: ${kpis.conversions.value}, Taxa: ${kpis.conversionRate.value}"\n`;
                    }
                    
                    if (events && events.events) {
                      csv += "\nEventos,Nome,Contagem,Usuários\n";
                      events.events.forEach((e: any) => {
                        csv += `,"${e.name}",${e.count},${e.users}\n`;
                      });
                    }
                    
                    if (traffic && traffic.sources) {
                      csv += "\nFontes de Tráfego,Fonte,Sessões,Conversões\n";
                      traffic.sources.forEach((s: any) => {
                        csv += `,"${s.source}",${s.sessions},${s.conversions}\n`;
                      });
                    }

                    // Download CSV
                    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                    const link = document.createElement("a");
                    const url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", `funnelflow-export-${new Date().toISOString().split('T')[0]}.csv`);
                    link.style.visibility = "hidden";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    toast.success("Dados exportados com sucesso!");
                  } catch (error) {
                    toast.error("Erro ao exportar dados");
                    console.error(error);
                  }
                }}
              >
                Exportar
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
              <div>
                <p className="text-sm font-medium text-foreground">Limpar Cache Local</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Limpar apenas dados em cache local. Dados no banco de dados não serão afetados.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={handleClearCache}
              >
                Limpar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
