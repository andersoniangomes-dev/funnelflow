import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Plus, Search, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

const presetTemplates = [
  { name: "Instagram Stories", source: "instagram", medium: "story", campaign: "" },
  { name: "Link na Bio", source: "instagram", medium: "bio", campaign: "" },
  { name: "TikTok Ads", source: "tiktok", medium: "cpc", campaign: "" },
  { name: "Google Ads", source: "google", medium: "cpc", campaign: "" },
  { name: "Facebook Feed", source: "facebook", medium: "feed", campaign: "" },
];

const sourceOptions = ["instagram", "tiktok", "google", "facebook", "linkedin", "twitter", "email"];
const mediumOptions = ["cpc", "bio", "story", "feed", "video", "email", "organic", "referral"];

const savedUTMs = [
  { id: 1, name: "Campanha Black Friday", url: "https://exemplo.com/promocao", source: "instagram", medium: "story", campaign: "black_friday_2024", createdAt: "25/11/2024" },
  { id: 2, name: "Lançamento Produto", url: "https://exemplo.com/novo-produto", source: "google", medium: "cpc", campaign: "lancamento_produto_q4", createdAt: "20/11/2024" },
  { id: 3, name: "Inscrição Newsletter", url: "https://exemplo.com/newsletter", source: "email", medium: "email", campaign: "newsletter_nov", createdAt: "15/11/2024" },
];

const UTMBuilder = () => {
  const [baseUrl, setBaseUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [content, setContent] = useState("");
  const [term, setTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const buildUTMUrl = () => {
    if (!baseUrl) return "";
    
    const params = new URLSearchParams();
    if (source) params.set("utm_source", source);
    if (medium) params.set("utm_medium", medium);
    if (campaign) params.set("utm_campaign", campaign);
    if (content) params.set("utm_content", content);
    if (term) params.set("utm_term", term);

    const queryString = params.toString();
    if (!queryString) return baseUrl;

    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}${queryString}`;
  };

  const generatedUrl = buildUTMUrl();

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    toast.success("URL UTM copiada para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const applyTemplate = (template: typeof presetTemplates[0]) => {
    setSource(template.source);
    setMedium(template.medium);
    if (template.campaign) setCampaign(template.campaign);
    toast.success(`Template ${template.name} aplicado`);
  };

  const isValid = baseUrl && source && medium && campaign;

  const filteredUTMs = savedUTMs.filter(utm =>
    utm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    utm.campaign.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Criador de UTM</h1>
          <p className="text-muted-foreground mt-1">Crie, gerencie e padronize seus links UTM</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Builder Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preset Templates */}
            <div className="glass-card p-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-foreground mb-4">Templates Rápidos</h3>
              <div className="flex flex-wrap gap-2">
                {presetTemplates.map((template) => (
                  <Button
                    key={template.name}
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(template)}
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="glass-card p-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-foreground mb-6">Construa sua UTM</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="baseUrl">URL Base *</Label>
                  <Input
                    id="baseUrl"
                    placeholder="https://exemplo.com/pagina-destino"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="source">Fonte * (utm_source)</Label>
                    <Select value={source} onValueChange={setSource}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Selecione a fonte" />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="medium">Mídia * (utm_medium)</Label>
                    <Select value={medium} onValueChange={setMedium}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Selecione a mídia" />
                      </SelectTrigger>
                      <SelectContent>
                        {mediumOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="campaign">Campanha * (utm_campaign)</Label>
                  <Input
                    id="campaign"
                    placeholder="ex: black_friday_2024"
                    value={campaign}
                    onChange={(e) => setCampaign(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="content">Conteúdo (utm_content)</Label>
                    <Input
                      id="content"
                      placeholder="ex: banner_topo"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="term">Termo (utm_term)</Label>
                    <Input
                      id="term"
                      placeholder="ex: tenis+corrida"
                      value={term}
                      onChange={(e) => setTerm(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Generated URL */}
            <div className="glass-card p-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-foreground mb-4">URL Gerada</h3>
              
              <div className="p-4 rounded-lg bg-muted border border-border">
                <code className="text-sm text-foreground break-all">
                  {generatedUrl || "Digite uma URL base para gerar seu link UTM"}
                </code>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <Button
                  variant="gradient"
                  onClick={handleCopy}
                  disabled={!isValid}
                  className="gap-2"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado!" : "Copiar URL"}
                </Button>
                <Button variant="outline" disabled={!isValid}>
                  <Plus className="h-4 w-4 mr-2" />
                  Salvar UTM
                </Button>
              </div>

              {/* GA4 Preview */}
              {isValid && (
                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="text-sm font-medium text-foreground mb-2">Visualização no GA4</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Fonte:</span> <span className="text-foreground">{source}</span></p>
                    <p><span className="text-muted-foreground">Mídia:</span> <span className="text-foreground">{medium}</span></p>
                    <p><span className="text-muted-foreground">Campanha:</span> <span className="text-foreground">{campaign}</span></p>
                    {content && <p><span className="text-muted-foreground">Conteúdo:</span> <span className="text-foreground">{content}</span></p>}
                    {term && <p><span className="text-muted-foreground">Termo:</span> <span className="text-foreground">{term}</span></p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Saved UTMs */}
          <div className="space-y-6">
            <div className="glass-card p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">UTMs Salvos</h3>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar UTMs..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                {filteredUTMs.map((utm) => (
                  <div key={utm.id} className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm truncate">{utm.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{utm.url}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{utm.source}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">{utm.medium}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{utm.createdAt}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default UTMBuilder;
