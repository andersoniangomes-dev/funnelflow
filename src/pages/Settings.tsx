import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Settings = () => {
  const [propertyId, setPropertyId] = useState("123456789");
  const [apiEndpoint, setApiEndpoint] = useState("https://api.exemplo.com/v1");
  const [funnelTracking, setFunnelTracking] = useState(true);
  const [utmLogging, setUtmLogging] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("connected");

  const testConnection = async () => {
    setConnectionStatus("testing");
    toast.info("Testando conexão com a API...");
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setConnectionStatus("connected");
    toast.success("Conexão com a API realizada com sucesso!");
  };

  const handleSave = () => {
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
              <Label htmlFor="propertyId">ID da Propriedade GA4</Label>
              <Input
                id="propertyId"
                placeholder="ex: 123456789"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="mt-1.5 max-w-md"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Encontre seu ID da Propriedade em Google Analytics → Admin → Configurações da Propriedade
              </p>
            </div>

            <div>
              <Label htmlFor="apiEndpoint">URL do Endpoint da API</Label>
              <Input
                id="apiEndpoint"
                placeholder="https://api.exemplo.com/v1"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="mt-1.5 max-w-md"
              />
              <p className="text-xs text-muted-foreground mt-1">
                O endpoint da API REST para buscar dados de analytics
              </p>
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

        {/* Save Button */}
        <div className="flex justify-end">
          <Button variant="gradient" onClick={handleSave}>
            Salvar Configurações
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
