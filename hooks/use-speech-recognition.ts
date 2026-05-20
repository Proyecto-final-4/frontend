"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseSpeechRecognitionOptions {
  /** BCP-47 language code (defaults to Spanish). */
  lang?: string;
  onTranscript?: (text: string, isFinal: boolean) => void;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  toggle: () => void;
}

type StartStrategy = "auto" | "local" | "cloud";

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Permiso de micrófono denegado.",
  "service-not-allowed": "El dictado por voz no está disponible en este contexto.",
  "audio-capture": "No se detectó ningún micrófono.",
  "language-not-supported":
    "Idioma no disponible sin conexión. En Chrome, instala el paquete de español en ajustes de idioma.",
};

/** Contextual message when the Google cloud speech service connection fails. */
export function getNetworkErrorMessage(): string {
  if (typeof window === "undefined") {
    return "No se pudo conectar al servicio de reconocimiento de voz.";
  }

  if (!window.isSecureContext) {
    return "El dictado requiere HTTPS o localhost. Abre la app en https:// o en http://localhost:3000.";
  }

  const { protocol, hostname } = window.location;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  if (protocol === "http:" && !isLocalhost) {
    return "El dictado no funciona en HTTP remoto. Usa https:// o abre http://localhost:3000 en Chrome.";
  }

  if (navigator.userAgent.includes("Electron")) {
    return "El visor integrado (Cursor/Electron) no soporta dictado en la nube. Abre la app en Chrome: http://localhost:3000";
  }

  return "No se pudo conectar al servicio de voz. Abre la app en Chrome (no en el visor de Cursor), desactiva VPN o bloqueadores, o espera a que Chrome descargue el idioma para dictado offline.";
}

async function prepareLocalRecognition(lang: string): Promise<boolean> {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor?.available) return false;

  try {
    let status = await Ctor.available({ langs: [lang], processLocally: true });

    if (status === "downloadable" && Ctor.install) {
      const installed = await Ctor.install({ langs: [lang] });
      if (!installed) return false;
      status = await Ctor.available({ langs: [lang], processLocally: true });
    }

    return status === "available" || status === "downloaded";
  } catch {
    return false;
  }
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionReturn {
  const { lang = "es-ES", onTranscript } = options;
  const [isSupported] = useState(() => getSpeechRecognitionCtor() !== null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const startingRef = useRef(false);
  const modeRef = useRef<"local" | "cloud">("cloud");
  const runStartRef = useRef<(strategy: StartStrategy) => Promise<void>>(async () => undefined);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const stop = useCallback(() => {
    startingRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const runStart = useCallback(
    async (strategy: StartStrategy) => {
      if (startingRef.current) return;
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        setError("Tu navegador no admite dictado por voz. Prueba Chrome o Edge.");
        return;
      }

      startingRef.current = true;
      setError(null);

      let useLocal = false;
      if (strategy === "local") {
        useLocal = await prepareLocalRecognition(lang);
        if (!useLocal) {
          setError(getNetworkErrorMessage());
          startingRef.current = false;
          return;
        }
      } else if (strategy === "auto") {
        useLocal = await prepareLocalRecognition(lang);
      }

      modeRef.current = useLocal ? "local" : "cloud";

      const recognition = new Ctor();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;
      if (useLocal) recognition.processLocally = true;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0]?.transcript ?? "";
          if (result.isFinal) final += transcript;
          else interim += transcript;
        }
        if (final) onTranscriptRef.current?.(final.trim(), true);
        else if (interim) onTranscriptRef.current?.(interim.trim(), false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "aborted" || event.error === "no-speech") return;

        if (event.error === "network" && modeRef.current === "cloud") {
          recognitionRef.current = null;
          setIsListening(false);
          startingRef.current = false;
          void runStartRef.current("local");
          return;
        }

        const message =
          event.error === "network"
            ? getNetworkErrorMessage()
            : (ERROR_MESSAGES[event.error] ?? "No se pudo capturar el audio.");
        setError(message);
        stop();
      };

      recognition.onend = () => {
        if (recognitionRef.current === recognition) {
          recognitionRef.current = null;
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;

      try {
        recognition.start();
      } catch {
        if (!useLocal && strategy !== "local") {
          startingRef.current = false;
          await runStartRef.current("local");
          return;
        }
        setError("No se pudo iniciar el micrófono.");
        setIsListening(false);
        recognitionRef.current = null;
      } finally {
        startingRef.current = false;
      }
    },
    [lang, stop],
  );

  useEffect(() => {
    runStartRef.current = runStart;
  }, [runStart]);

  const start = useCallback(async () => {
    await runStart("auto");
  }, [runStart]);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else void start();
  }, [isListening, start, stop]);

  useEffect(() => () => stop(), [stop]);

  return { isSupported, isListening, error, start, stop, toggle };
}
