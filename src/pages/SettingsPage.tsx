import { useEffect, useId, useState, type ChangeEvent } from 'react';
import { Download, HardDrive, Share, Smartphone, Sparkles, Trash2, Upload } from 'lucide-react';
import { Stepper } from '../components/Stepper';
import { useConfirm, useToast } from '../components/Feedback';
import { useSettings } from '../hooks/useSettings';
import { settingsStore } from '../storage';
import { createBackup, eraseEverything, restoreBackup, saveBackupFile } from '../services/backupService';
import { addSampleWorkouts, requestPersistentStorage } from '../services/bootstrap';
import { isIOS, isStandalone, useInstallPrompt } from '../pwa/install';

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
}

export function SettingsPage() {
  const settings = useSettings();
  const confirm = useConfirm();
  const toast = useToast();
  const restoreId = useId();
  const { canPrompt, install } = useInstallPrompt();
  const [storage, setStorage] = useState<{ used?: number; persisted?: boolean }>({});
  const [busy, setBusy] = useState(false);
  const standalone = isStandalone();

  const refreshStorage = async () => {
    const [estimate, persisted] = await Promise.all([
      navigator.storage?.estimate?.().catch(() => undefined),
      navigator.storage?.persisted?.().catch(() => undefined)
    ]);
    setStorage({ used: estimate?.usage, persisted });
  };
  useEffect(() => {
    void refreshStorage();
  }, []);

  async function handleBackup() {
    setBusy(true);
    try {
      const result = await saveBackupFile(await createBackup());
      toast(result === 'shared' ? 'Cópia pronta para guardar' : 'Cópia de segurança baixada');
    } catch (err) {
      if ((err as DOMException)?.name !== 'AbortError') toast('Não foi possível criar a cópia de segurança.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleRestore(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const ok = await confirm({
      title: 'Restaurar esta cópia?',
      message: 'Os treinos, imagens e histórico atuais deste celular serão substituídos pelos da cópia.',
      confirmLabel: 'Restaurar cópia',
      danger: true
    });
    if (!ok) return;
    setBusy(true);
    try {
      const n = await restoreBackup(file);
      toast(`Cópia restaurada com ${n} treinos`);
      void refreshStorage();
    } catch (err) {
      toast((err as Error).message || 'Não foi possível restaurar a cópia.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleSamples() {
    const n = await addSampleWorkouts();
    toast(`${n} treinos de exemplo adicionados`);
  }

  async function handleErase() {
    const ok = await confirm({
      title: 'Apagar todos os dados?',
      message: 'Treinos, imagens e histórico serão removidos deste celular. Salve uma cópia de segurança antes, se quiser guardar.',
      confirmLabel: 'Apagar tudo',
      danger: true
    });
    if (!ok) return;
    await eraseEverything();
    toast('Todos os dados foram apagados');
    void refreshStorage();
  }

  async function handlePersist() {
    const granted = await requestPersistentStorage();
    toast(granted ? 'Armazenamento protegido' : 'O navegador não liberou agora. Instalar o app ajuda.');
    void refreshStorage();
  }

  return (
    <div className="page settings">
      <h1 className="page-title">Ajustes</h1>

      <section className="settings__group section">
        <label className="field">
          <span className="field__label">Seu nome</span>
          <input className="input" value={settings.userName} onChange={(e) => settingsStore.set({ userName: e.target.value })} autoComplete="given-name" />
        </label>
        <div className="field">
          <span className="field__label">Meta de treinos por semana</span>
          <Stepper label="meta semanal" value={settings.weeklyGoal} min={1} max={7} onChange={(weeklyGoal) => settingsStore.set({ weeklyGoal })} />
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Usar como aplicativo</h2>
        <div className="settings__group">
          {standalone ? (
            <p className="settings__row">
              <Smartphone aria-hidden="true" /> O Thaís Maromba já está instalado neste celular.
            </p>
          ) : canPrompt ? (
            <>
              <p className="settings__text">Instale para abrir direto da tela inicial, em tela cheia e sem internet.</p>
              <button type="button" className="btn btn--primary btn--block" onClick={() => install()}>
                <Smartphone aria-hidden="true" /> Instalar aplicativo
              </button>
            </>
          ) : isIOS() ? (
            <p className="settings__text">
              No Safari, toque em <Share className="inline-icon" aria-label="Compartilhar" /> Compartilhar e depois em <strong>Adicionar à Tela de Início</strong>. No iPhone, isso também protege seus dados contra limpeza automática.
            </p>
          ) : (
            <p className="settings__text">
              Abra o menu do navegador e escolha <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.
            </p>
          )}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Seus dados</h2>
        <div className="settings__group">
          <p className="settings__row">
            <HardDrive aria-hidden="true" />
            <span>
              Tudo fica salvo neste celular{storage.used !== undefined ? `, usando ${formatBytes(storage.used)}` : ''}.
              {storage.persisted === true && ' Armazenamento protegido.'}
            </span>
          </p>
          {storage.persisted === false && (
            <button type="button" className="btn btn--soft btn--block" onClick={handlePersist}>
              Proteger armazenamento
            </button>
          )}
          <p className="settings__text">Salve uma cópia de vez em quando para não perder nada se trocar de celular ou limpar o navegador.</p>
          <button type="button" className="btn btn--primary btn--block" onClick={handleBackup} disabled={busy}>
            <Download aria-hidden="true" /> Salvar cópia de segurança
          </button>
          <label htmlFor={restoreId} className="btn btn--outline btn--block" aria-disabled={busy}>
            <Upload aria-hidden="true" /> Restaurar cópia
          </label>
          <input id={restoreId} className="visually-hidden" type="file" accept="application/json,.json" onChange={handleRestore} />
        </div>
      </section>

      <section className="section">
        <div className="settings__group">
          <button type="button" className="btn btn--ghost btn--block" onClick={handleSamples}>
            <Sparkles aria-hidden="true" /> Adicionar treinos de exemplo
          </button>
          <button type="button" className="btn btn--ghost btn--block settings__danger" onClick={handleErase}>
            <Trash2 aria-hidden="true" /> Apagar todos os dados
          </button>
        </div>
      </section>

      <p className="settings__about">Thaís Maromba 1.0. Feito com carinho para a Thaís.</p>
    </div>
  );
}
