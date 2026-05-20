import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSpeechRecognition, getNetworkErrorMessage } from "@/hooks/use-speech-recognition";

describe("getNetworkErrorMessage", () => {
  it("detects Electron embedded viewer", () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      userAgent: "Mozilla/5.0 Electron/30.0.0",
    });
    Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });

    expect(getNetworkErrorMessage()).toContain("Chrome");
    expect(getNetworkErrorMessage()).toContain("localhost");
  });
});

describe("useSpeechRecognition", () => {
  const originalSpeechRecognition = window.SpeechRecognition;
  const originalWebkit = window.webkitSpeechRecognition;

  beforeEach(() => {
    vi.stubGlobal("SpeechRecognition", undefined);
    window.webkitSpeechRecognition = undefined;
  });

  afterEach(() => {
    vi.stubGlobal("SpeechRecognition", originalSpeechRecognition);
    window.webkitSpeechRecognition = originalWebkit;
  });

  it("reports isSupported=false when the API is missing", () => {
    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.isSupported).toBe(false);
  });

  it("reports isSupported=true when SpeechRecognition exists", () => {
    class MockRecognition {
      lang = "";
      continuous = false;
      interimResults = false;
      processLocally = false;
      onstart: (() => void) | null = null;
      onresult: ((event: SpeechRecognitionEvent) => void) | null = null;
      onerror: ((event: SpeechRecognitionErrorEvent) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        this.onstart?.();
      }
      stop() {
        this.onend?.();
      }
    }
    vi.stubGlobal("SpeechRecognition", MockRecognition);

    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.isSupported).toBe(true);
  });

  it("calls onTranscript with final text", async () => {
    const onTranscript = vi.fn();
    const instances: MockRecognition[] = [];

    class MockRecognition {
      lang = "";
      continuous = false;
      interimResults = false;
      processLocally = false;
      onstart: (() => void) | null = null;
      onresult: ((event: SpeechRecognitionEvent) => void) | null = null;
      onerror: ((event: SpeechRecognitionErrorEvent) => void) | null = null;
      onend: (() => void) | null = null;
      constructor() {
        instances.push(this);
      }
      start() {
        this.onstart?.();
      }
      stop() {
        this.onend?.();
      }
    }
    vi.stubGlobal("SpeechRecognition", MockRecognition);

    const { result } = renderHook(() => useSpeechRecognition({ onTranscript, lang: "es-CO" }));

    await act(async () => {
      await result.current.start();
    });

    const recognition = instances[0];
    act(() => {
      recognition.onresult?.({
        resultIndex: 0,
        results: [
          {
            isFinal: true,
            0: { transcript: "hola mundo" },
            length: 1,
          },
        ],
      } as unknown as SpeechRecognitionEvent);
    });

    expect(onTranscript).toHaveBeenCalledWith("hola mundo", true);
  });

  it("retries in local mode after cloud network error", async () => {
    const instances: MockRecognition[] = [];

    class MockRecognition {
      lang = "";
      continuous = false;
      interimResults = false;
      processLocally = false;
      onstart: (() => void) | null = null;
      onresult: ((event: SpeechRecognitionEvent) => void) | null = null;
      onerror: ((event: SpeechRecognitionErrorEvent) => void) | null = null;
      onend: (() => void) | null = null;
      constructor() {
        instances.push(this);
      }
      start() {
        this.onstart?.();
        if (!this.processLocally) {
          this.onerror?.({ error: "network" } as SpeechRecognitionErrorEvent);
        }
      }
      stop() {
        this.onend?.();
      }
      static available = vi
        .fn()
        .mockResolvedValueOnce("unavailable")
        .mockResolvedValue("available");
      static install = vi.fn().mockResolvedValue(true);
    }

    vi.stubGlobal("SpeechRecognition", MockRecognition);

    const { result } = renderHook(() => useSpeechRecognition());

    await act(async () => {
      await result.current.start();
    });

    await waitFor(() => {
      expect(instances.length).toBeGreaterThanOrEqual(2);
    });
    expect(instances.at(-1)?.processLocally).toBe(true);
  });
});
