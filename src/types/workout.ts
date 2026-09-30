export type ID = string;

export interface Exercise {
  id: ID;
  name: string;
  /** Referência à imagem guardada no ImageRepository (nunca o caminho da galeria). */
  imageId: ID | null;
  sets: number;
  /** Texto livre para aceitar "12", "10 a 12", "até a falha"... */
  reps: string;
  /** Texto livre para aceitar "10 kg", "peso do corpo", "elástico forte"... */
  load: string;
  restSeconds: number;
  notes: string;
  videoUrl: string;
}

export interface Workout {
  id: ID;
  /** Letra ou sigla curta exibida no card (ex.: "A"). */
  tag: string;
  name: string;
  description: string;
  muscleGroup: string;
  notes: string;
  exercises: Exercise[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

/** Treino em andamento: quais exercícios já foram concluídos. */
export interface ActiveSession {
  workoutId: ID;
  startedAt: string;
  updatedAt: string;
  completedExerciseIds: ID[];
}

/** Registro de um treino finalizado (base da tela Evolução). */
export interface SessionRecord {
  id: ID;
  workoutId: ID;
  workoutName: string;
  startedAt: string;
  finishedAt: string;
  completedCount: number;
  totalCount: number;
}

export interface StoredImage {
  id: ID;
  type: string;
  data: ArrayBuffer;
  createdAt: string;
}

export interface AppSettings {
  userName: string;
  weeklyGoal: number;
}
