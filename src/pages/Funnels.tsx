import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { Plus, ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const funnelSteps = [
  { name: "page_view", users: 42580, dropoff: 0, rate: 100 },
  { name: "click_cta", users: 18420, dropoff: 56.7, rate: 43.3 },
  { name: "view_checkout", users: 8540, dropoff: 53.6, rate: 20.1 },
  { name: "purchase", users: 1847, dropoff: 78.4, rate: 4.3 },
];

const Funnels = () => {
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
            <DateRangePicker />
            <Button variant="gradient" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Funil
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Fonte / Mídia:</span>
            <Select defaultValue="all">
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
            <Select defaultValue="all">
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
          <h3 className="text-lg font-semibold text-foreground mb-8">Funil de Compra</h3>
          
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
          
          {/* Summary */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold gradient-text">4,3%</p>
                <p className="text-sm text-muted-foreground mt-1">Taxa de Conversão Total</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">40.733</p>
                <p className="text-sm text-muted-foreground mt-1">Total de Abandonos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-success">R$ 274.806</p>
                <p className="text-sm text-muted-foreground mt-1">Receita Gerada</p>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Funnels */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">Funis Salvos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Funil de Compra", steps: 4, conversion: "4,3%", status: "ativo" },
              { name: "Geração de Leads", steps: 3, conversion: "12,8%", status: "ativo" },
              { name: "Inscrição Newsletter", steps: 2, conversion: "28,4%", status: "rascunho" },
            ].map((funnel) => (
              <div key={funnel.name} className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{funnel.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{funnel.steps} etapas</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    funnel.status === "ativo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  }`}>
                    {funnel.status}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground mt-4">{funnel.conversion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Funnels;
