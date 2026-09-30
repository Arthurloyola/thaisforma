# Thaís Maromba

Os treinos da Thaís, organizados e sempre à mão. PWA mobile-first, 100% local e offline.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173 (e no IP da rede, para abrir no celular)
npm test           # testes de persistência (IndexedDB)
npm run build      # gera /dist pronto para publicar
npm run preview    # serve o build localmente
```

> Pelo IP da rede (http) o app funciona, mas o **service worker/instalação só ativa em HTTPS ou localhost**.

## Publicar e instalar no celular

1. Faça o build e publique a pasta `dist/` em qualquer hospedagem estática com HTTPS
   (Netlify Drop, Vercel, Cloudflare Pages, GitHub Pages). O app usa `HashRouter` e `base: './'`,
   então não precisa de nenhuma configuração de rotas.
2. **iPhone (Safari):** Compartilhar → *Adicionar à Tela de Início*.
3. **Android (Chrome):** menu ⋮ → *Instalar app* (ou pelo botão em Ajustes).

## Onde os dados ficam

| Dado | Armazenamento |
|---|---|
| Treinos e exercícios | IndexedDB (`workouts`) |
| Imagens da galeria | IndexedDB (`images`), comprimidas para até 1400 px (JPEG 85%) |
| Treino em andamento e histórico | IndexedDB (`activeSessions`, `history`) |
| Nome e meta semanal | localStorage (`thaisforma:settings`) |
| Rascunho de edição não salvo | localStorage (`thaisforma:draft:*`) |

- A foto escolhida é copiada para dentro do app; nada depende do arquivo original da galeria.
- Imagens sem uso (trocadas/removidas) são limpas automaticamente; imagens compartilhadas por treinos duplicados são preservadas.
- O app pede `navigator.storage.persist()` para o navegador não apagar os dados sob pouco espaço.
- **iPhone:** o Safari pode limpar dados de sites não usados por ~7 dias. **Instalado na Tela de Início, isso não se aplica.** Mesmo assim, use *Ajustes → Salvar cópia de segurança* de vez em quando (JSON com treinos, histórico e imagens).

## Arquitetura

```
src/
  types/        modelos (Workout, Exercise, ActiveSession, SessionRecord…)
  storage/
    contracts.ts          interfaces WorkoutRepository, ImageRepository, SessionRepository, MetaRepository
    indexeddb/            implementação com Dexie
    settingsStore.ts      configurações em localStorage
    index.ts              ← ponto único de troca da persistência
  services/     regras de negócio (duplicar, excluir + limpar imagens, sessão, backup, seed)
  hooks/        leitura reativa dos repositórios, URL de imagens, wake lock, PWA
  components/   UI reutilizável (cards, editor de exercício, seletor de imagem, cronômetro…)
  pages/        Início, Meus treinos, Treino, Editar, Evolução, Ajustes
  styles/       tokens de design, base, componentes e páginas
  utils/        formatação, datas, URLs, imagem, binário
```

As telas nunca acessam o Dexie diretamente — só os contratos de `storage/contracts.ts`.

### Trocando por Supabase/Firebase no futuro

1. Crie, por exemplo, `storage/supabase/SupabaseWorkoutRepository.ts` implementando `WorkoutRepository`
   (o `Workout` com `exercises` embutidos cabe direto numa coluna `jsonb`).
2. Faça o mesmo para `ImageRepository` (Supabase Storage / Firebase Storage) e `SessionRepository`.
3. Em `storage/index.ts`, troque `createIndexedDbRepositories()` pela sua fábrica. Nenhuma página muda.
4. Para migrar os dados existentes, reaproveite o formato de `services/backupService.ts`.

`subscribe()` nos repositórios é o gancho para atualização em tempo real (ex.: Supabase Realtime).

## Recursos do modo treino

- Progresso fixo no topo (“3 de 5 exercícios concluídos” + barra e %), salvo a cada toque.
- Ao concluir um exercício, a tela rola sozinha para o próximo pendente.
- Cronômetro de descanso com vibração e aviso sonoro, +15 s.
- Tela permanece acesa durante o treino (Wake Lock, quando suportado).
- Toque na foto para ampliar; *Assistir exercício* abre o YouTube.
- *Finalizar treino* registra no histórico da tela Evolução.

## Ícones

Gerados a partir de `scripts/icon.svg` (o “T” formado por uma barra de halteres).
