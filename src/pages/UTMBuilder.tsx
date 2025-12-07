import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Plus, Search, Trash2, BarChart3, Eye, TrendingUp, Pencil, X, Link2, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/useApi";

const presetTemplates = [
  { name: "Instagram Stories", source: "instagram", medium: "story", campaign: "" },
  { name: "Link na Bio", source: "instagram", medium: "bio", campaign: "" },
  { name: "TikTok Ads", source: "tiktok", medium: "cpc", campaign: "" },
  { name: "Google Ads", source: "google", medium: "cpc", campaign: "" },
  { name: "Facebook Feed", source: "facebook", medium: "feed", campaign: "" },
];

const sourceOptions = ["instagram", "tiktok", "google", "facebook", "linkedin", "twitter", "email"];
const mediumOptions = ["cpc", "bio", "story", "feed", "video", "email", "organic", "referral"];

// Get default API URL from environment or use Render URL
const getDefaultApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, ''); // Remove trailing slash
  }
  return 'https://funnelflow-backend.onrender.com';
};

// Load saved UTMs - try database first, then localStorage
const loadSavedUTMs = async () => {
  try {
    // Try to load from database first
    const apiEndpoint = localStorage.getItem("api_endpoint") || getDefaultApiUrl();
    api.setBaseUrl(apiEndpoint);
    
    try {
      const response = await api.getSavedUTMs();
      console.log("📥 Resposta do banco de dados:", response);
      if (response.utms && response.utms.length > 0) {
        console.log("📥 UTMs carregados do banco de dados:", response.utms.length);
        // Convert IDs to numbers for compatibility with existing code
        const formattedUTMs = response.utms.map((utm: any) => ({
          ...utm,
          id: typeof utm.id === 'string' ? parseInt(utm.id) : (typeof utm.id === 'number' ? utm.id : parseInt(String(utm.id)))
        }));
        console.log("📥 UTMs formatados:", formattedUTMs);
        // Also save to localStorage as backup
        localStorage.setItem("saved_utms", JSON.stringify(formattedUTMs));
        return formattedUTMs;
      } else {
        console.log("📥 Nenhum UTM no banco de dados, tentando localStorage...");
      }
    } catch (dbError) {
      console.warn("⚠️ Erro ao carregar UTMs do banco, usando localStorage:", dbError);
    }
    
    // Fallback to localStorage
    const saved = localStorage.getItem("saved_utms");
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log("📥 UTMs carregados do localStorage:", parsed.length);
      return parsed;
    }
    
    return [];
  } catch (error) {
    console.error("❌ Erro ao carregar UTMs:", error);
    return [];
  }
};

// Save UTMs - try database first, then localStorage
const saveUTMs = async (utms: any[]) => {
  try {
    // Try to save to database first
    const apiEndpoint = localStorage.getItem("api_endpoint") || getDefaultApiUrl();
    api.setBaseUrl(apiEndpoint);
    
    // Save each UTM to database
    for (const utm of utms) {
      try {
        await api.saveUTM({
          id: utm.id?.toString(),
          name: utm.name,
          url: utm.url,
          trackingUrl: utm.trackingUrl,
          shortUrl: utm.shortUrl,
          source: utm.source,
          medium: utm.medium,
          campaign: utm.campaign,
          content: utm.content,
          term: utm.term
        });
      } catch (dbError) {
        console.warn(`⚠️ Erro ao salvar UTM ${utm.id} no banco:`, dbError);
      }
    }
    
    // Also save to localStorage as backup
    localStorage.setItem("saved_utms", JSON.stringify(utms));
    console.log("✅ UTMs salvos (banco + localStorage)");
  } catch (error) {
    console.error("❌ Erro ao salvar UTMs:", error);
    // Fallback to localStorage only
    try {
      localStorage.setItem("saved_utms", JSON.stringify(utms));
    } catch (localError) {
      console.error("❌ Erro ao salvar no localStorage:", localError);
    }
  }
};

const UTMBuilder = () => {
  const [baseUrl, setBaseUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [content, setContent] = useState("");
  const [term, setTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isShortening, setIsShortening] = useState(false);
  const [copiedShort, setCopiedShort] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedUTMs, setSavedUTMs] = useState<any[]>([]);
  const [utmName, setUtmName] = useState("");
  const [utmStats, setUtmStats] = useState<Record<string, { totalClicks: number; recentClicks: number; lastClick: string | null }>>({});
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [editingUtmId, setEditingUtmId] = useState<number | null>(null);

  useApi();

  // Load saved UTMs on mount
  useEffect(() => {
    const loadUTMs = async () => {
      console.log("🔄 Carregando UTMs salvos...");
      const utms = await loadSavedUTMs();
      console.log("✅ UTMs carregados:", utms.length, utms);
      
      if (utms.length === 0) {
        console.log("⚠️ Nenhum UTM encontrado. Se você tinha UTMs antes, eles podem estar no localStorage com IDs antigos.");
        setSavedUTMs([]);
        return;
      }
      
      // Update old UTMs that don't have trackingUrl or have localhost URLs
      const apiEndpoint = localStorage.getItem("api_endpoint") || getDefaultApiUrl();
      const updatedUTMs = utms.map((utm: any) => {
        // Ensure ID is a number
        const utmId = typeof utm.id === 'string' ? parseInt(utm.id) : (typeof utm.id === 'number' ? utm.id : parseInt(String(utm.id)));
        
        // Update if no trackingUrl or if it contains localhost
        if (!utm.trackingUrl || (utm.trackingUrl && utm.trackingUrl.includes('localhost'))) {
          if (utm.url) {
            return {
              ...utm,
              id: utmId,
              trackingUrl: `${apiEndpoint}/utm/track/${utmId}?url=${encodeURIComponent(utm.url)}`
            };
          }
        }
        return {
          ...utm,
          id: utmId
        };
      });
      
      const hasChanges = updatedUTMs.some((utm: any, index: number) => 
        utm.trackingUrl !== utms[index]?.trackingUrl || utm.id !== utms[index]?.id
      );
      
      if (hasChanges) {
        console.log("🔄 Atualizando URLs de tracking dos UTMs salvos");
        await saveUTMs(updatedUTMs);
        setSavedUTMs(updatedUTMs);
      } else {
        setSavedUTMs(updatedUTMs);
      }
    };
    loadUTMs();
  }, []);

  // Load stats when savedUTMs change
  useEffect(() => {
    // Only load stats if we have UTMs loaded
    if (savedUTMs.length > 0) {
      console.log("📊 Carregando stats para", savedUTMs.length, "UTMs");
      loadStats();
      
      const interval = setInterval(() => {
        loadStats();
      }, 10000); // Update every 10 seconds
      
      return () => clearInterval(interval);
    } else {
      console.log("⏳ Aguardando UTMs serem carregados antes de buscar stats...");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedUTMs]); // Run when savedUTMs change

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const apiEndpoint = localStorage.getItem("api_endpoint") || getDefaultApiUrl();
      api.setBaseUrl(apiEndpoint);
      
      console.log("📊 Carregando estatísticas de UTMs, endpoint:", apiEndpoint);
      const statsResponse = await api.getUTMStats();
      console.log("📥 Resposta de estatísticas:", statsResponse);
      
      const statsMap: Record<string, any> = {};
      
      if (statsResponse.stats) {
        statsResponse.stats.forEach((stat: any) => {
          // Convert utmId to string to match with saved UTMs
          // Handle both string and number utmIds
          const utmIdKey = String(stat.utmId);
          statsMap[utmIdKey] = {
            totalClicks: stat.totalClicks || 0,
            recentClicks: stat.recentClicks || 0,
            lastClick: stat.lastClick
          };
          console.log(`📈 Estatísticas para UTM ${utmIdKey}:`, statsMap[utmIdKey]);
        });
      }
      
      // Log saved UTMs for debugging
      console.log("📋 UTMs salvos:", savedUTMs.length, savedUTMs.map(u => ({ 
        id: u.id, 
        idString: String(u.id), 
        name: u.name 
      })));
      console.log("📊 Mapa de estatísticas completo:", Object.keys(statsMap).map(k => ({ utmId: k, stats: statsMap[k] })));
      
      // Check for UTMs without stats and stats without UTMs
      if (savedUTMs.length > 0) {
        savedUTMs.forEach((utm: any) => {
          const utmIdKey = String(utm.id);
          if (!statsMap[utmIdKey]) {
            console.log(`⚠️ UTM ${utmIdKey} (${utm.name}) não tem estatísticas ainda`);
          } else {
            console.log(`✅ UTM ${utmIdKey} (${utm.name}) tem ${statsMap[utmIdKey].totalClicks} cliques`);
          }
        });
        
        // Check for stats without corresponding UTMs - these are "orphan" clicks
        const orphanStats: string[] = [];
        Object.keys(statsMap).forEach((statUtmId) => {
          const foundUtm = savedUTMs.find((utm: any) => String(utm.id) === statUtmId);
          if (!foundUtm) {
            orphanStats.push(statUtmId);
            console.log(`⚠️ Estatísticas encontradas para UTM ${statUtmId} (${statsMap[statUtmId].totalClicks} cliques), mas UTM não está salvo. Pode ser um UTM antigo deletado.`);
          }
        });
        
        // If there are orphan stats, we should still show them
        // The stats will be displayed even if the UTM is not saved
        if (orphanStats.length > 0) {
          console.log(`💡 ${orphanStats.length} UTMs com cliques não estão mais salvos. As estatísticas ainda serão exibidas.`);
        }
      } else {
        console.log("⚠️ Nenhum UTM salvo encontrado para corresponder com estatísticas");
        if (Object.keys(statsMap).length > 0) {
          console.log(`💡 ${Object.keys(statsMap).length} UTMs têm cliques mas não estão salvos. As estatísticas ainda serão exibidas.`);
        }
      }
      
      // IMPORTANT: Set stats even for orphan UTMs so they can be displayed
      setUtmStats(statsMap);
    } catch (error) {
      console.error("❌ Erro ao carregar estatísticas:", error);
      // Não mostrar erro para não poluir a interface
    } finally {
      setIsLoadingStats(false);
    }
  };

  const buildUTMUrl = useCallback((includeTracking: boolean = false, utmId?: string) => {
    try {
      if (!baseUrl || typeof baseUrl !== 'string') return "";
      
      const params = new URLSearchParams();
      if (source && typeof source === 'string') params.set("utm_source", source);
      if (medium && typeof medium === 'string') params.set("utm_medium", medium);
      if (campaign && typeof campaign === 'string') params.set("utm_campaign", campaign);
      if (content && typeof content === 'string') params.set("utm_content", content);
      if (term && typeof term === 'string') params.set("utm_term", term);

      const queryString = params.toString();
      const separator = baseUrl.includes("?") ? "&" : "?";
      const finalUrl = queryString ? `${baseUrl}${separator}${queryString}` : baseUrl;

      // If tracking is enabled and we have a UTM ID, return tracking URL
      if (includeTracking && utmId) {
        return api.getTrackingUrl(utmId.toString(), finalUrl);
      }

      return finalUrl;
    } catch (error) {
      console.error("Erro em buildUTMUrl:", error);
      return "";
    }
  }, [baseUrl, source, medium, campaign, content, term]);

  const generatedUrl = useMemo(() => {
    try {
      return buildUTMUrl();
    } catch (error) {
      console.error("Erro ao gerar URL:", error);
      return "";
    }
  }, [buildUTMUrl]);

  const trackingUrl = useMemo(() => {
    try {
      if (!generatedUrl || !savedUTMs || savedUTMs.length === 0) {
        return "";
      }
      const matchingUtm = savedUTMs.find(u => u.url === generatedUrl);
      if (matchingUtm?.id) {
        return api.getTrackingUrl(matchingUtm.id.toString(), generatedUrl);
      }
      return "";
    } catch (error) {
      console.error("Erro ao gerar tracking URL:", error);
      return "";
    }
  }, [generatedUrl, savedUTMs]);

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    toast.success("URL UTM copiada para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTracking = () => {
    if (!generatedUrl) return;
    const utmId = Date.now().toString(); // Temporary ID for preview
    const apiEndpoint = localStorage.getItem("api_endpoint") || getDefaultApiUrl();
    const trackingUrl = `${apiEndpoint}/utm/track/${utmId}?url=${encodeURIComponent(generatedUrl)}`;
    navigator.clipboard.writeText(trackingUrl);
    setCopiedTracking(true);
    toast.success("URL de tracking copiada! Use esta URL para monitorar cliques.");
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleShortenUrl = async () => {
    if (!generatedUrl || !isValid) {
      toast.error("Gere uma URL válida primeiro");
      return;
    }

    setIsShortening(true);
    try {
      const apiEndpoint = localStorage.getItem("api_endpoint") || getDefaultApiUrl();
      api.setBaseUrl(apiEndpoint);
      
      // Get tracking URL first
      const utmId = Date.now().toString(); // Temporary ID for preview
      const trackingUrl = `${apiEndpoint}/utm/track/${utmId}?url=${encodeURIComponent(generatedUrl)}`;
      
      console.log("🔗 Tentando encurtar URL:", trackingUrl);
      console.log("🌐 API Endpoint:", apiEndpoint);
      console.log("📡 URL completa da requisição:", `${apiEndpoint}/s/shorten`);
      
      // Shorten the tracking URL
      const response = await api.shortenUrl(trackingUrl);
      
      console.log("✅ Resposta recebida:", response);
      setShortUrl(response.shortUrl);
      toast.success("URL encurtada com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao encurtar URL:", error);
      console.error("❌ Detalhes do erro:", {
        message: error instanceof Error ? error.message : "Erro desconhecido",
        status: (error as any)?.status,
        response: (error as any)?.response
      });
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao encurtar URL: ${errorMessage}`);
    } finally {
      setIsShortening(false);
    }
  };

  const handleCopyShortUrl = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    setCopiedShort(true);
    toast.success("URL encurtada copiada!");
    setTimeout(() => setCopiedShort(false), 2000);
  };

  const applyTemplate = (template: typeof presetTemplates[0]) => {
    setSource(template.source);
    setMedium(template.medium);
    if (template.campaign) setCampaign(template.campaign);
    toast.success(`Template ${template.name} aplicado`);
  };

  const isValid = useMemo(() => {
    try {
      return !!(baseUrl && source && medium && campaign);
    } catch (error) {
      console.error("Erro ao calcular isValid:", error);
      return false;
    }
  }, [baseUrl, source, medium, campaign]);

  const handleEditUTM = (utm: any) => {
    if (!utm || !utm.id) {
      toast.error("UTM inválida para edição");
      return;
    }
    
    setEditingUtmId(utm.id);
    setUtmName(utm.name || "");
    
    // Extract base URL (everything before ? or #)
    if (utm.url) {
      try {
        const urlObj = new URL(utm.url);
        setBaseUrl(`${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`);
      } catch (error) {
        // Fallback: simple split if URL parsing fails
        setBaseUrl(utm.url.split('?')[0].split('#')[0]);
      }
    } else {
      setBaseUrl("");
    }
    
    setSource(utm.source || "");
    setMedium(utm.medium || "");
    setCampaign(utm.campaign || "");
    setContent(utm.content || "");
    setTerm(utm.term || "");
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info("Editando UTM. Modifique os campos e salve.");
  };

  const handleCancelEdit = () => {
    setEditingUtmId(null);
    setUtmName("");
    setBaseUrl("");
    setSource("");
    setMedium("");
    setCampaign("");
    setContent("");
    setTerm("");
  };

  const handleSaveUTM = async () => {
    if (!isValid || !utmName.trim()) {
      toast.error("Preencha todos os campos obrigatórios, incluindo o nome da UTM");
      return;
    }

    if (editingUtmId) {
      // Update existing UTM
      const existingUtm = savedUTMs.find(u => u.id === editingUtmId);
      if (!existingUtm) {
        toast.error("UTM não encontrada para edição");
        return;
      }

      const updatedUTMs = savedUTMs.map(utm => {
        if (utm.id === editingUtmId) {
          const updated = {
            ...utm,
            name: utmName,
            url: generatedUrl,
            trackingUrl: utm.trackingUrl, // Keep existing tracking URL to preserve clicks
            source: source,
            medium: medium,
            campaign: campaign,
            content: content || "",
            term: term || "",
            updatedAt: new Date().toLocaleDateString("pt-BR")
          };
          return updated;
        }
        return utm;
      });

      setSavedUTMs(updatedUTMs);
      await saveUTMs(updatedUTMs);
      toast.success("UTM atualizada com sucesso!");
      handleCancelEdit();
    } else {
      // Create new UTM
      // IMPORTANT: Save to database FIRST to get the correct ID, then create short URL
      const apiEndpoint = localStorage.getItem("api_endpoint") || getDefaultApiUrl();
      api.setBaseUrl(apiEndpoint);
      
      let utmId: string | number = Date.now(); // Temporary ID (fallback)
      let trackingUrlForNewUTM = `${apiEndpoint}/utm/track/${utmId}?url=${encodeURIComponent(generatedUrl)}`;
      let shortUrlForUTM = null;
      
      // Save to database first (without trackingUrl, backend will generate it)
      try {
        console.log("💾 Salvando UTM no banco de dados...");
        const dbResponse = await api.saveUTM({
          name: utmName,
          url: generatedUrl,
          // Don't send trackingUrl - backend will generate it with correct ID
          source: source,
          medium: medium,
          campaign: campaign,
          content: content || "",
          term: term || ""
        });
        
        console.log("📥 Resposta do banco:", dbResponse);
        
        // Use database ID if available
        if (dbResponse && dbResponse.id) {
          utmId = typeof dbResponse.id === 'string' ? parseInt(dbResponse.id) : dbResponse.id;
          // Update tracking URL with correct ID from database
          trackingUrlForNewUTM = `${apiEndpoint}/utm/track/${utmId}?url=${encodeURIComponent(generatedUrl)}`;
          console.log("✅ UTM salvo no banco com ID:", utmId, "(tipo:", typeof utmId, ")");
          console.log("✅ Tracking URL atualizado:", trackingUrlForNewUTM);
          
          // NOW create the short URL with the correct tracking URL
          try {
            console.log("🔗 Criando link encurtado para:", trackingUrlForNewUTM);
            const shortenResponse = await api.shortenUrl(trackingUrlForNewUTM);
            shortUrlForUTM = shortenResponse.shortUrl;
            console.log("✅ Link encurtado criado:", shortUrlForUTM);
            
            // Update the UTM in database with the short URL and tracking URL
            console.log("💾 Atualizando UTM no banco com link encurtado...");
            const updateResponse = await api.saveUTM({
              id: utmId.toString(),
              name: utmName,
              url: generatedUrl,
              trackingUrl: trackingUrlForNewUTM,
              shortUrl: shortUrlForUTM,
              source: source,
              medium: medium,
              campaign: campaign,
              content: content || "",
              term: term || ""
            });
            console.log("✅ UTM atualizado no banco:", updateResponse);
          } catch (shortenError) {
            console.error("❌ Erro ao criar/encurtar URL:", shortenError);
            // Continue without short URL, but still update tracking URL
            try {
              await api.saveUTM({
                id: utmId.toString(),
                name: utmName,
                url: generatedUrl,
                trackingUrl: trackingUrlForNewUTM,
                source: source,
                medium: medium,
                campaign: campaign,
                content: content || "",
                term: term || ""
              });
              console.log("✅ UTM atualizado com tracking URL (sem link encurtado)");
            } catch (updateError) {
              console.error("❌ Erro ao atualizar UTM:", updateError);
            }
          }
        } else {
          console.warn("⚠️ Resposta do banco não contém ID:", dbResponse);
        }
      } catch (dbError) {
        console.error("❌ Erro ao salvar UTM no banco:", dbError);
        // Fallback: try to shorten with temporary ID (not ideal, but better than nothing)
        try {
          const shortenResponse = await api.shortenUrl(trackingUrlForNewUTM);
          shortUrlForUTM = shortenResponse.shortUrl;
        } catch (error) {
          console.warn("Não foi possível encurtar URL automaticamente:", error);
        }
      }
      
      const newUTM = {
        id: typeof utmId === 'string' ? parseInt(utmId) : utmId, // Keep as number for compatibility
        name: utmName,
        url: generatedUrl,
        trackingUrl: trackingUrlForNewUTM,
        shortUrl: shortUrlForUTM,
        source: source,
        medium: medium,
        campaign: campaign,
        content: content || "",
        term: term || "",
        createdAt: new Date().toLocaleDateString("pt-BR")
      };

      const updatedUTMs = [...savedUTMs, newUTM];
      setSavedUTMs(updatedUTMs);
      
      // Don't call saveUTMs here - the UTM was already saved to database above
      // Just update localStorage as backup
      localStorage.setItem("saved_utms", JSON.stringify(updatedUTMs));
      console.log("✅ UTM salvo no localStorage como backup");
      
      toast.success("UTM salva com sucesso!");
      setUtmName("");
      setBaseUrl("");
      setSource("");
      setMedium("");
      setCampaign("");
      setContent("");
      setTerm("");
      setShortUrl(null); // Reset short URL
    }
    
    // Reload stats after saving
    setTimeout(() => loadStats(), 1000);
  };

  const handleCopyUTM = (utm: any, useTracking: boolean = true) => {
    if (!utm) {
      toast.error("UTM inválida");
      return;
    }
    
    const urlToCopy = useTracking && utm.trackingUrl ? utm.trackingUrl : (utm.url || "");
    if (!urlToCopy) {
      toast.error("URL não disponível");
      return;
    }
    
    navigator.clipboard.writeText(urlToCopy);
    toast.success(useTracking ? "URL com tracking copiada!" : "URL copiada!");
  };

  const handleDeleteUTM = async (id: number) => {
    if (editingUtmId === id) {
      handleCancelEdit();
    }
    
    // Try to delete from database
    try {
      const apiEndpoint = localStorage.getItem("api_endpoint") || getDefaultApiUrl();
      api.setBaseUrl(apiEndpoint);
      await api.deleteUTM(String(id));
    } catch (dbError) {
      console.warn("⚠️ Erro ao deletar UTM do banco:", dbError);
    }
    
    const updatedUTMs = savedUTMs.filter(utm => utm.id !== id);
    setSavedUTMs(updatedUTMs);
    await saveUTMs(updatedUTMs);
    toast.success("UTM deletada com sucesso!");
  };

  const filteredUTMs = savedUTMs.filter(utm => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = utm.name?.toLowerCase().includes(searchLower) || false;
    const campaignMatch = utm.campaign?.toLowerCase().includes(searchLower) || false;
    return nameMatch || campaignMatch;
  });

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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
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
                    value={campaign || ""}
                    onChange={(e) => {
                      try {
                        setCampaign(e.target.value);
                      } catch (error) {
                        console.error("Erro ao atualizar campaign:", error);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="utmName">Nome da UTM (para salvar) *</Label>
                  <Input
                    id="utmName"
                    placeholder="ex: Campanha Black Friday"
                    value={utmName}
                    onChange={(e) => setUtmName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Dê um nome descritivo para identificar esta UTM
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="content">Conteúdo (utm_content)</Label>
                    <Input
                      id="content"
                      placeholder="ex: banner_topo"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Generated URL */}
            <div className="glass-card p-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-foreground mb-4">URL Gerada</h3>
              
              <div className="space-y-4">
                {/* URL Original */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">URL Original (UTM)</Label>
                  <div className="p-4 rounded-lg bg-muted border border-border">
                    <code className="text-sm text-foreground break-all">
                      {generatedUrl || "Digite uma URL base para gerar seu link UTM"}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!isValid}
                    className="gap-2 mt-2 w-full"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copiado!" : "Copiar URL Original"}
                  </Button>
                </div>

                {/* URL de Tracking */}
                {isValid && (
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      URL de Tracking (Recomendado)
                    </Label>
                    <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                      <code className="text-sm text-foreground break-all">
                        {(() => {
                          const utmId = Date.now().toString();
                          const apiEndpoint = localStorage.getItem("api_endpoint") || getDefaultApiUrl();
                          return `${apiEndpoint}/utm/track/${utmId}?url=${encodeURIComponent(generatedUrl)}`;
                        })()}
                      </code>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={handleCopyTracking}
                        disabled={!isValid}
                        className="gap-2 flex-1"
                      >
                        {copiedTracking ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copiedTracking ? "Copiado!" : "Copiar Tracking"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShortenUrl}
                        disabled={!isValid || isShortening}
                        className="gap-2"
                      >
                        {isShortening ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Link2 className="h-4 w-4" />
                        )}
                        Encurtar
                      </Button>
                    </div>
                    
                    {shortUrl && (
                      <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <Label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
                          <Link2 className="h-4 w-4" />
                          URL Encurtada
                        </Label>
                        <div className="p-2 rounded bg-muted border border-border mb-2">
                          <code className="text-sm text-foreground break-all">{shortUrl}</code>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyShortUrl}
                          className="gap-2 w-full"
                        >
                          {copiedShort ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          {copiedShort ? "Copiado!" : "Copiar URL Encurtada"}
                        </Button>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 Use a URL de tracking para monitorar cliques. A URL encurtada facilita o compartilhamento.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mt-6">
                {editingUtmId && (
                  <Button 
                    variant="outline" 
                    onClick={handleCancelEdit}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancelar Edição
                  </Button>
                )}
                <Button 
                  variant={editingUtmId ? "gradient" : "outline"}
                  disabled={!isValid || !utmName.trim()}
                  onClick={handleSaveUTM}
                  className="gap-2"
                >
                  {editingUtmId ? (
                    <>
                      <Check className="h-4 w-4" />
                      Atualizar UTM
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Salvar UTM
                    </>
                  )}
                </Button>
                {isValid && !utmName.trim() && (
                  <p className="text-xs text-muted-foreground">
                    Digite um nome para salvar a UTM
                  </p>
                )}
              </div>

              {/* GA4 Preview */}
              {isValid && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="text-sm font-medium text-foreground mb-2">Visualização no GA4</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Fonte:</span> <span className="text-foreground">{source}</span></p>
                      <p><span className="text-muted-foreground">Mídia:</span> <span className="text-foreground">{medium}</span></p>
                      <p><span className="text-muted-foreground">Campanha:</span> <span className="text-foreground">{campaign}</span></p>
                      {content && <p><span className="text-muted-foreground">Conteúdo:</span> <span className="text-foreground">{content}</span></p>}
                      {term && <p><span className="text-muted-foreground">Termo:</span> <span className="text-foreground">{term}</span></p>}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Tracking de Cliques
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Ao salvar esta UTM, você receberá uma URL de tracking que registra automaticamente cada clique. 
                      Use essa URL nos seus links para monitorar o desempenho.
                    </p>
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      loadStats();
                      toast.info("Estatísticas atualizadas!");
                    }}
                    disabled={isLoadingStats}
                    className="gap-2"
                  >
                    {isLoadingStats ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}
                    Atualizar
                  </Button>
                </div>
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
                {filteredUTMs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Nenhuma UTM salva</p>
                    <p className="text-xs text-muted-foreground mt-1">Crie e salve UTMs para começar a rastrear cliques</p>
                  </div>
                ) : (
                  <>
                  {filteredUTMs.map((utm) => {
                    if (!utm || !utm.id) return null;
                    
                    const utmIdString = String(utm.id);
                    const stats = utmStats[utmIdString] || { totalClicks: 0, recentClicks: 0, lastClick: null };
                    const trackingUrl = utm.trackingUrl || (utm.url ? api.getTrackingUrl(utmIdString, utm.url) : "");
                    const hasShortUrl = !!utm.shortUrl;
                    
                    return (
                      <div key={utm.id} className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-foreground text-sm truncate">{utm.name || "Sem nome"}</h4>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                stats.totalClicks > 0 
                                  ? "bg-success/10 text-success" 
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                <Eye className="h-3 w-3" />
                                {stats.totalClicks || "0"}
                              </span>
                            </div>
                            {utm.url && (
                              <p className="text-xs text-muted-foreground mt-1 truncate" title={utm.url}>
                                {utm.url}
                              </p>
                            )}
                            {hasShortUrl ? (
                              <div className="mt-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-success font-medium flex items-center gap-1 flex-1">
                                    <Link2 className="h-3 w-3" />
                                    URL Encurtada: <span className="truncate">{utm.shortUrl}</span>
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => {
                                      navigator.clipboard.writeText(utm.shortUrl);
                                      toast.success("URL encurtada copiada!");
                                    }}
                                    title="Copiar URL encurtada"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                {trackingUrl && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Tracking: {trackingUrl.length > 50 ? `${trackingUrl.substring(0, 50)}...` : trackingUrl}
                                  </p>
                                )}
                              </div>
                            ) : (
                              trackingUrl && (
                                <p className="text-xs text-primary mt-1 font-medium">
                                  📊 URL de Tracking: {trackingUrl.length > 60 ? `${trackingUrl.substring(0, 60)}...` : trackingUrl}
                                </p>
                              )
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {utm.source && (
                                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{utm.source}</span>
                              )}
                              {utm.medium && (
                                <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">{utm.medium}</span>
                              )}
                            </div>
                            
                            {/* Stats - Always visible */}
                            <div className="mt-2 pt-2 border-t border-border">
                              {stats.totalClicks > 0 ? (
                                <>
                                  <div className="flex items-center gap-4 text-xs mb-2">
                                    <div className="flex items-center gap-1">
                                      <TrendingUp className="h-3 w-3 text-success" />
                                      <span className="text-muted-foreground">Total de cliques:</span>
                                      <span className="font-bold text-success text-sm">{stats.totalClicks}</span>
                                    </div>
                                    {stats.recentClicks > 0 && (
                                      <div className="flex items-center gap-1">
                                        <BarChart3 className="h-3 w-3 text-primary" />
                                        <span className="text-muted-foreground">Últimos 30 dias:</span>
                                        <span className="font-medium text-primary">{stats.recentClicks}</span>
                                      </div>
                                    )}
                                  </div>
                                  {stats.lastClick && (
                                    <p className="text-xs text-muted-foreground">
                                      Último clique: <span className="font-medium text-foreground">{new Date(stats.lastClick).toLocaleString("pt-BR")}</span>
                                    </p>
                                  )}
                                </>
                              ) : (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Eye className="h-3 w-3" />
                                  <span>Nenhum clique registrado ainda. Use a URL de tracking para começar a monitorar.</span>
                                </div>
                              )}
                            </div>
                            
                            {utm.createdAt && (
                              <p className="text-xs text-muted-foreground mt-2">{utm.createdAt}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-2">
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleEditUTM(utm)}
                                title="Editar UTM"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              {hasShortUrl && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-success"
                                  onClick={() => {
                                    navigator.clipboard.writeText(utm.shortUrl);
                                    toast.success("URL encurtada copiada!");
                                  }}
                                  title="Copiar URL encurtada"
                                >
                                  <Link2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => {
                                  handleCopyUTM(utm, true);
                                  console.log(`📋 URL de tracking copiada para UTM ${utm.id}: ${trackingUrl}`);
                                }}
                                title="Copiar URL com tracking (recomendado)"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-primary"
                                onClick={() => {
                                  window.open(trackingUrl, '_blank');
                                  toast.info("Abrindo URL de tracking em nova aba para teste");
                                  // Reload stats after 3 seconds to allow click to be registered
                                  setTimeout(() => {
                                    console.log("🔄 Recarregando estatísticas após teste de clique");
                                    loadStats();
                                  }, 3000);
                                }}
                                title="Testar URL de tracking (abre em nova aba)"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteUTM(utm.id)}
                                title="Deletar UTM"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <span className="text-xs text-muted-foreground text-center">Use URL tracking</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Show orphan UTMs (with clicks but not saved) */}
                  {(() => {
                    // Find stats that don't have corresponding saved UTMs
                    const orphanStats = Object.keys(utmStats).filter(statUtmId => {
                      return !savedUTMs.find((utm: any) => String(utm.id) === statUtmId) && utmStats[statUtmId].totalClicks > 0;
                    });
                    
                    if (orphanStats.length === 0) return null;
                    
                    return (
                      <>
                        <div className="mt-6 pt-6 border-t border-border">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-sm font-semibold text-foreground">UTMs com Cliques (Não Salvos)</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Estes UTMs têm cliques registrados mas não estão mais salvos. Você pode recriá-los se desejar.
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {orphanStats.map((utmId) => {
                              const stats = utmStats[utmId];
                              const apiEndpoint = localStorage.getItem("api_endpoint") || getDefaultApiUrl();
                              
                              return (
                                <div key={utmId} className="p-3 rounded-lg border border-warning/20 bg-warning/5">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-foreground text-sm">UTM {utmId}</h4>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                                          <Eye className="h-3 w-3" />
                                          {stats.totalClicks} cliques
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
                                          Não salvo
                                        </span>
                                      </div>
                                      
                                      <div className="mt-2 pt-2 border-t border-border">
                                        <div className="flex items-center gap-4 text-xs mb-2">
                                          <div className="flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3 text-success" />
                                            <span className="text-muted-foreground">Total de cliques:</span>
                                            <span className="font-bold text-success text-sm">{stats.totalClicks}</span>
                                          </div>
                                          {stats.recentClicks > 0 && (
                                            <div className="flex items-center gap-1">
                                              <BarChart3 className="h-3 w-3 text-primary" />
                                              <span className="text-muted-foreground">Últimos 30 dias:</span>
                                              <span className="font-medium text-primary">{stats.recentClicks}</span>
                                            </div>
                                          )}
                                        </div>
                                        {stats.lastClick && (
                                          <p className="text-xs text-muted-foreground">
                                            Último clique: <span className="font-medium text-foreground">{new Date(stats.lastClick).toLocaleString("pt-BR")}</span>
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 ml-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                          // Get click details to try to reconstruct UTM
                                          try {
                                            const apiEndpoint = localStorage.getItem("api_endpoint") || getDefaultApiUrl();
                                            api.setBaseUrl(apiEndpoint);
                                            const clickDetails = await api.getUTMStatsById(utmId);
                                            
                                            if (clickDetails.clicks && clickDetails.clicks.length > 0) {
                                              // Try to extract URL from first click
                                              const firstClick = clickDetails.clicks[0];
                                              const url = firstClick.url || '';
                                              
                                              // Parse URL to extract UTM parameters
                                              try {
                                                const urlObj = new URL(url);
                                                const params = urlObj.searchParams;
                                                
                                                setBaseUrl(urlObj.origin + urlObj.pathname);
                                                setSource(params.get('utm_source') || '');
                                                setMedium(params.get('utm_medium') || '');
                                                setCampaign(params.get('utm_campaign') || '');
                                                setContent(params.get('utm_content') || '');
                                                setTerm(params.get('utm_term') || '');
                                                setUtmName(`UTM ${utmId} (Recuperado)`);
                                                
                                                toast.success("UTM recuperado! Preencha o nome e salve.");
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                              } catch (urlError) {
                                                toast.error("Não foi possível extrair informações da URL");
                                              }
                                            } else {
                                              toast.error("Não há informações suficientes para recuperar este UTM");
                                            }
                                          } catch (error) {
                                            console.error("Erro ao recuperar UTM:", error);
                                            toast.error("Erro ao recuperar informações do UTM");
                                          }
                                        }}
                                        className="gap-2"
                                      >
                                        <Plus className="h-3.5 w-3.5" />
                                        Recuperar UTM
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default UTMBuilder;
