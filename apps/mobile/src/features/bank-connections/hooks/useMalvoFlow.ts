import { todayISODate } from '@guara/utils';
import { useEffect, useState } from 'react';

import { CONSENT_MONTHS, MALVO_FINDINGS, SUPPORTED_BANKS } from '../data';
import { consentEnd } from '../lib/consent';
import { useBankConnectionsStore } from '../store';

export type MalvoMode = 'connect' | 'renew';
export type MalvoStep = 'authorize' | 'connecting' | 'success' | 'error';

/** "Autorização", "contas e cartões", "investimentos", "categorias": done one by one. */
export const CONNECTING_STEPS = 4;
/** Time each connecting step takes in the simulation (the API reports real progress). */
export const CONNECTING_STEP_MS = 900;

/**
 * Open Finance connection through the Malvo: consent → bank app → importing → result.
 * Until the API exists, the bank app is a sheet where the user authorizes or cancels.
 */
export function useMalvoFlow(bankId: string | undefined, mode: MalvoMode) {
  const { connections, connect, renew } = useBankConnectionsStore();
  const bank = SUPPORTED_BANKS.find((item) => item.id === bankId) ?? null;
  const connection = connections.find((item) => item.id === bankId) ?? null;
  const [step, setStep] = useState<MalvoStep>('authorize');
  const [bankAppOpen, setBankAppOpen] = useState(false);
  /** Connecting steps finished (0–4). */
  const [progress, setProgress] = useState(0);
  const [authorizedAt, setAuthorizedAt] = useState<Date | null>(null);
  const [failedAt, setFailedAt] = useState<Date | null>(null);
  const authorizedUntil = consentEnd(todayISODate(), CONSENT_MONTHS);

  const save = () => {
    if (!bank) return;
    if (mode === 'renew') renew(bank.id, authorizedUntil);
    else connect(bank.id, authorizedUntil);
  };

  useEffect(() => {
    if (step !== 'connecting') return;
    const timer = setTimeout(() => {
      if (progress + 1 >= CONNECTING_STEPS) {
        save();
        setStep('success');
      }
      setProgress(progress + 1);
    }, CONNECTING_STEP_MS);
    return () => clearTimeout(timer);
  });

  return {
    bank,
    connection,
    mode,
    step,
    progress,
    authorizedAt,
    failedAt,
    authorizedUntil,
    findings: bank ? (MALVO_FINDINGS[bank.id] ?? null) : null,
    bankAppOpen,
    /** "Continuar para o Itaú": the Malvo opens the bank app. */
    openBankApp: () => setBankAppOpen(true),
    closeBankApp: () => setBankAppOpen(false),
    /** The user authorized in the bank app and came back. */
    authorize: () => {
      setBankAppOpen(false);
      setAuthorizedAt(new Date());
      setProgress(1);
      setStep('connecting');
    },
    /** The user canceled in the bank app (or it did not answer). */
    fail: () => {
      setBankAppOpen(false);
      setFailedAt(new Date());
      setStep('error');
    },
    /** "Continuar usando o app": the import goes on and the user is told when it ends. */
    finishInBackground: save,
    retry: () => {
      setProgress(0);
      setStep('authorize');
    },
  };
}

export type MalvoFlow = ReturnType<typeof useMalvoFlow>;
