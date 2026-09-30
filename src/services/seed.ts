import type { Exercise, Workout } from '../types/workout';
import { createId } from '../utils/id';

/** Link de busca no YouTube: sempre funciona, mesmo sem um vídeo específico escolhido. */
const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${q} execução correta`)}`;

type ExSeed = [name: string, sets: number, reps: string, load: string, rest: number, notes: string];

function ex([name, sets, reps, load, rest, notes]: ExSeed): Exercise {
  return { id: createId(), name, imageId: null, sets, reps, load, restSeconds: rest, notes, videoUrl: yt(name) };
}

function workout(
  tag: string,
  name: string,
  muscleGroup: string,
  description: string,
  notes: string,
  exercises: ExSeed[],
  order: number
): Workout {
  const now = new Date().toISOString();
  return {
    id: createId(),
    tag,
    name,
    muscleGroup,
    description,
    notes,
    exercises: exercises.map(ex),
    order,
    createdAt: now,
    updatedAt: now
  };
}

export function buildSampleWorkouts(startOrder = 0): Workout[] {
  return [
    workout(
      'A',
      'Pernas',
      'Pernas',
      'Foco em quadríceps, com base de força para a semana.',
      'Aquecer 5 min na bike antes de começar.',
      [
        ['Agachamento livre', 4, '12', '20 kg', 90, 'Descer até a coxa ficar paralela ao chão, joelhos alinhados com os pés.'],
        ['Leg press 45°', 4, '12', '80 kg', 90, 'Não travar os joelhos no final do movimento.'],
        ['Cadeira extensora', 3, '15', '25 kg', 60, 'Segurar 1 segundo lá em cima.'],
        ['Afundo com halteres', 3, '10 cada perna', '6 kg cada', 60, ''],
        ['Panturrilha em pé', 4, '20', '30 kg', 45, 'Amplitude completa, descendo bem o calcanhar.']
      ],
      startOrder
    ),
    workout(
      'B',
      'Glúteos',
      'Glúteos',
      'Glúteos e posterior de coxa, com foco em contração.',
      'Ativação com elástico antes: 2 × 20 abduções.',
      [
        ['Elevação pélvica', 4, '12', '40 kg', 90, 'Queixo levemente para baixo, subir contraindo o glúteo.'],
        ['Stiff com halteres', 4, '12', '12 kg cada', 75, 'Coluna neutra, quadril vai para trás.'],
        ['Cadeira flexora', 3, '15', '20 kg', 60, ''],
        ['Abdução na máquina', 3, '20', '35 kg', 45, 'Tronco levemente inclinado à frente.'],
        ['Coice no cabo', 3, '15 cada perna', '10 kg', 45, '']
      ],
      startOrder + 1
    ),
    workout(
      'C',
      'Costas e bíceps',
      'Costas',
      'Puxadas e remadas, fechando com bíceps.',
      '',
      [
        ['Puxada frontal', 4, '12', '30 kg', 75, 'Levar a barra até a parte alta do peito, sem balançar.'],
        ['Remada baixa', 4, '12', '30 kg', 75, 'Ombros para trás e para baixo.'],
        ['Remada unilateral com halter', 3, '10 cada lado', '10 kg', 60, ''],
        ['Rosca direta', 3, '12', '8 kg barra', 60, 'Cotovelos colados no corpo.'],
        ['Rosca martelo', 3, '12', '6 kg cada', 45, '']
      ],
      startOrder + 2
    ),
    workout(
      'D',
      'Ombros e abdômen',
      'Ombros',
      'Ombros completos e core firme.',
      'Terminar com 5 min de alongamento.',
      [
        ['Desenvolvimento com halteres', 4, '12', '6 kg cada', 75, ''],
        ['Elevação lateral', 4, '15', '4 kg cada', 45, 'Subir até a altura dos ombros, cotovelo levemente flexionado.'],
        ['Elevação frontal', 3, '12', '4 kg cada', 45, ''],
        ['Crucifixo inverso', 3, '15', '15 kg', 45, ''],
        ['Prancha', 3, '40 segundos', 'Peso do corpo', 30, 'Abdômen contraído, quadril alinhado.']
      ],
      startOrder + 3
    )
  ];
}
