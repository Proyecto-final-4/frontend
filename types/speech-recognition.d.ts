/** WebKit prefix used by Chrome and Edge for the Web Speech API. */
interface Window {
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

type SpeechRecognitionAvailability = "available" | "downloaded" | "downloadable" | "unavailable";

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  available?(options: {
    langs: string[];
    processLocally: boolean;
  }): Promise<SpeechRecognitionAvailability>;
  install?(options: { langs: string[] }): Promise<boolean>;
}

interface SpeechRecognition {
  processLocally?: boolean;
}
