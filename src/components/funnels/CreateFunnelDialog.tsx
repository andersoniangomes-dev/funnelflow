import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Plus, X, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface FunnelStep {
  eventName: string;
  order: number;
}

interface CreateFunnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFunnelCreated: () => void;
}

export function CreateFunnelDialog({ open, onOpenChange, onFunnelCreated }: CreateFunnelDialogProps) {
  const [funnelName, setFunnelName] = useState("");
  const [selectedSteps, setSelectedSteps] = useState<FunnelStep[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Array<{ name: string; count: number }>>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      loadAvailableEvents();
    }
  }, [open]);

  const loadAvailableEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const response = await api.getEvents();
      if (response.events) {
        setAvailableEvents(
          response.events.map((e: any) => ({
            name: e.name,
            count: e.count || 0
          }))
        );
      }
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      toast.error("Não foi possível carregar eventos disponíveis");
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const addStep = (eventName: string) => {
    if (selectedSteps.some(step => step.eventName === eventName)) {
      toast.error("Este evento já está no funil");
      return;
    }

    const newStep: FunnelStep = {
      eventName,
      order: selectedSteps.length + 1
    };

    setSelectedSteps([...selectedSteps, newStep]);
    setSearchQuery("");
  };

  const removeStep = (index: number) => {
    const newSteps = selectedSteps.filter((_, i) => i !== index);
    // Reorder
    const reorderedSteps = newSteps.map((step, i) => ({
      ...step,
      order: i + 1
    }));
    setSelectedSteps(reorderedSteps);
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === selectedSteps.length - 1) return;

    const newSteps = [...selectedSteps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    // Reorder
    const reorderedSteps = newSteps.map((step, i) => ({
      ...step,
      order: i + 1
    }));
    
    setSelectedSteps(reorderedSteps);
  };

  const handleSave = () => {
    if (!funnelName.trim()) {
      toast.error("Por favor, insira um nome para o funil");
      return;
    }

    if (selectedSteps.length < 2) {
      toast.error("Um funil precisa ter pelo menos 2 eventos");
      return;
    }

    // Load saved funnels
    const savedFunnels = loadSavedFunnels();
    
    const newFunnel = {
      id: Date.now(),
      name: funnelName.trim(),
      steps: selectedSteps.map(s => s.eventName),
      createdAt: new Date().toISOString(),
      isDefault: false
    };

    savedFunnels.push(newFunnel);
    saveFunnels(savedFunnels);

    toast.success("Funil criado com sucesso!");
    onFunnelCreated();
    onOpenChange(false);
    
    // Reset form
    setFunnelName("");
    setSelectedSteps([]);
  };

  const filteredEvents = availableEvents.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedSteps.some(step => step.eventName === event.name)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Funil</DialogTitle>
          <DialogDescription>
            Selecione os eventos na ordem que deseja analisar no funil de conversão
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Funnel Name */}
          <div>
            <Label htmlFor="funnelName">Nome do Funil *</Label>
            <Input
              id="funnelName"
              placeholder="ex: Funil de Compra Completo"
              value={funnelName}
              onChange={(e) => setFunnelName(e.target.value)}
              className="mt-1.5"
            />
          </div>

          {/* Selected Steps */}
          <div>
            <Label>Etapas do Funil ({selectedSteps.length})</Label>
            {selectedSteps.length === 0 ? (
              <div className="mt-2 p-4 rounded-lg border border-dashed border-border text-center">
                <p className="text-sm text-muted-foreground">Nenhuma etapa adicionada</p>
                <p className="text-xs text-muted-foreground mt-1">Adicione eventos abaixo para criar o funil</p>
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                {selectedSteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {index + 1}.
                      </span>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {step.eventName}
                      </code>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveStep(index, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveStep(index, "down")}
                        disabled={index === selectedSteps.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeStep(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Event */}
          <div>
            <Label>Adicionar Evento</Label>
            <div className="mt-1.5 border rounded-lg overflow-hidden">
              <Command>
                <CommandInput
                  placeholder="Buscar evento..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  {isLoadingEvents ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Carregando eventos...
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <CommandEmpty>
                      {searchQuery ? "Nenhum evento encontrado" : "Nenhum evento disponível"}
                    </CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {filteredEvents.slice(0, 10).map((event) => (
                        <CommandItem
                          key={event.name}
                          onSelect={() => addStep(event.name)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <code className="text-sm">{event.name}</code>
                            <span className="text-xs text-muted-foreground">
                              {event.count.toLocaleString("pt-BR")} ocorrências
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="gradient"
            onClick={handleSave}
            disabled={!funnelName.trim() || selectedSteps.length < 2}
          >
            Criar Funil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions
function loadSavedFunnels() {
  try {
    const saved = localStorage.getItem("saved_funnels");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveFunnels(funnels: any[]) {
  try {
    localStorage.setItem("saved_funnels", JSON.stringify(funnels));
  } catch (error) {
    console.error("Erro ao salvar funis:", error);
  }
}

export { loadSavedFunnels, saveFunnels };

