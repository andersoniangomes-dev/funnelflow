import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, AlertCircle, RefreshCw, Upload, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const Settings = () => {
  const [apiEndpoint, setApiEndpoint] = useState(() => {
    return localStorage.getItem("api_endpoint") || "http://localhost:3000";
  });
  const [propertyId, setPropertyId] = useState("");
  const [serviceAccountJson, setServiceAccountJson] = useState("");
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [funnelTracking, setFunnelTracking] = useState(true);
  const [utmLogging, setUtmLogging] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("disconnected");

  // Update API base URL when endpoint changes
  useEffect(() => {
    if (apiEndpoint) {
      api.setBaseUrl(apiEndpoint);
    }
  }, [apiEndpoint]);

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration();
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
    toast.info("Testando conexão com a API...");
    
    try {
      // Update API base URL
      api.setBaseUrl(apiEndpoint);
      
      // Test health endpoint
      const response = await api.health();
      
      if (response.status === "ok" && response.ga4 === "connected") {
        setConnectionStatus("connected");
        toast.success("Conexão com a API realizada com sucesso! GA4 conectado.");
      } else {
        setConnectionStatus("disconnected");
        toast.error(response.message || "Falha na conexão com GA4");
      }
    } catch (error) {
      setConnectionStatus("disconnected");
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao conectar: ${errorMessage}`);
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
      api.setBaseUrl(apiEndpoint);
      
      // Validate JSON
      let credentialsObj;
      try {
        credentialsObj = JSON.parse(serviceAccountJson);
      } catch (error) {
        toast.error("JSON do Service Account inválido. Verifique o formato.");
        setIsSavingConfig(false);
        return;
      }

      await api.saveConfig(propertyId.trim(), credentialsObj);
      
      toast.success("Configuração do GA4 salva com sucesso!");
      
      // Reload config to update UI
      await loadConfiguration();
      
      // Test connection after saving
      setTimeout(() => {
        testConnection();
      }, 1000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao salvar configuração: ${errorMessage}`);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleSave = () => {
    // Save API endpoint to localStorage
    localStorage.setItem("api_endpoint", apiEndpoint);
    
    // Update API base URL
    api.setBaseUrl(apiEndpoint);
    
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Configure sua integração de analytics e preferências</p>
        </div>

        {/* GA4 Configuration */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-6">Configuração do GA4</h3>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="apiEndpoint">URL do Endpoint da API</Label>
              <Input
                id="apiEndpoint"
                placeholder="http://localhost:3000"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="mt-1.5 max-w-md"
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL do backend (ex: http://localhost:3000 ou https://api.seudominio.com)
              </p>
            </div>

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

            {/* Connection Status */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted border border-border max-w-md">
              <div className="flex items-center gap-3">
                {connectionStatus === "connected" && (
                  <CheckCircle className="h-5 w-5 text-success" />
                )}
                {connectionStatus === "disconnected" && (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                {connectionStatus === "testing" && (
                  <RefreshCw className="h-5 w-5 text-primary animate-spin" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {connectionStatus === "connected" && "Conectado"}
                    {connectionStatus === "disconnected" && "Desconectado"}
                    {connectionStatus === "testing" && "Testando..."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {connectionStatus === "connected" && "A API está respondendo corretamente"}
                    {connectionStatus === "disconnected" && "Não foi possível conectar à API"}
                    {connectionStatus === "testing" && "Verificando conexão"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={testConnection}
                disabled={connectionStatus === "testing"}
              >
                Testar
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-6">Funcionalidades</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="funnelTracking" className="text-base">Rastreamento de Funis</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Habilitar visualização e análise de funis personalizados
                </p>
              </div>
              <Switch
                id="funnelTracking"
                checked={funnelTracking}
                onCheckedChange={setFunnelTracking}
              />
            </div>

            <div className="border-t border-border" />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="utmLogging" className="text-base">Registro de UTMs</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Registrar e salvar automaticamente todos os links UTM criados
                </p>
              </div>
              <Switch
                id="utmLogging"
                checked={utmLogging}
                onCheckedChange={setUtmLogging}
              />
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
              <Button variant="outline" size="sm">Exportar</Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
              <div>
                <p className="text-sm font-medium text-foreground">Limpar Cache</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Limpar todos os dados de analytics em cache
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive/10">
                Limpar
              </Button>
            </div>
          </div>
        </div>

        {/* Save Button - For other settings */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleSave}>
            Salvar Outras Configurações
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
