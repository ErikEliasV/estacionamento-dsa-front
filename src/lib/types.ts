export type Vaga = {
  numero: number;
  ocupada: boolean;
  placaVeiculo: string | null;
};

export type FilaItem = {
  posicao: number;
  placa: string;
  prioridade: number;
  prioridadeLabel: string;
  horarioChegada: string;
};

export type Stats = {
  totalVagas: number;
  vagasOcupadas: number;
  vagasLivres: number;
  taxaOcupacao: number;
  filaEspera: number;
  filaPorPrioridade: Record<string, number>;
};

export type EntradaResponse = {
  sucesso: boolean;
  tipo: "ESTACIONADO" | "FILA" | "ERRO";
  mensagem: string;
  placa: string | null;
  vagaNumero: number | null;
  prioridade: number | null;
  prioridadeLabel: string | null;
};

export type SaidaResponse = {
  sucesso: boolean;
  mensagem: string;
  placaSaida: string | null;
  vagaLiberada: number | null;
  veiculoEntrante: {
    placa: string;
    prioridade: number;
    prioridadeLabel: string;
    vagaOcupada: number;
  } | null;
};

export type BstNode = {
  numero: number;
  ocupada: boolean;
  placaVeiculo: string | null;
  left: BstNode | null;
  right: BstNode | null;
} | null;

export type EstadoSnapshot = {
  vagas: Vaga[];
  fila: FilaItem[];
  stats: Stats;
  tree: BstNode;
};

export const PRIORIDADES = [
  { value: 1, label: "PCD" },
  { value: 2, label: "Idoso" },
  { value: 3, label: "Gestante" },
  { value: 4, label: "Comum" },
] as const;

export type PlacaSugerida = {
  placa: string;
  prioridade: number;
  hint: string;
};

export const PLACAS_SUGERIDAS: PlacaSugerida[] = [
  { placa: "ACE1A23", prioridade: 1, hint: "Cadeirante" },
  { placa: "BMG2B34", prioridade: 2, hint: "Idoso" },
  { placa: "CFP3C45", prioridade: 3, hint: "Gestante" },
  { placa: "DRK4D56", prioridade: 4, hint: "Comum" },
  { placa: "EVT5E67", prioridade: 4, hint: "Comum" },
  { placa: "FHX6F78", prioridade: 2, hint: "Idoso" },
];
