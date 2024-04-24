import React, { useEffect, useRef } from "react";
import { useClientContext } from "@/client/components/contexts/ClientContextReactContext";
import { log } from "@/shared/logging";
import crypto from "crypto";

function decrypt(text: string, secret: string) {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift() || "", "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(secret, "hex"),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function removeTextWithinAsterisks(text: string) {
  // This regex matches text within asterisks, including the asterisks themselves
  const regex = /\*[^*]+\*/g;
  // Replace matched text with an empty string
  return text.replace(regex, "   ");
}

export const VoiceChat: React.FunctionComponent<{
  text?: string;
  voice?: string;
  language?: string;
}> = ({ text, voice, language }) => {
  const { audioManager } = useClientContext();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    log.info("Initializing voice chat");
    const fetchAudio = async () => {
      if (!text?.length || !voice?.length || !audioRef.current) {
        return;
      }

      audioRef.current.pause();
      audioRef.current.src = "";

      const processedText = removeTextWithinAsterisks(text);

      const apiKey = decrypt(
        "635ab0b85f63b5cbadaa10258e5f4367:5bc9cf3f9612f12da6137aecee9fb9e7ddcccf111e93311ca3902aacdda0c4a17b04aab74e3d4eed3507bd5d1fae5fb8",
        "3e19d8a961bebc6c619045faa943181605cef9d973fb3a3177ee833acc4a0b25"
      );
      const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream`;
      const requestData = {
        method: "POST",
        body: JSON.stringify({ text: processedText, voice, language }),
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey, // Replace 'SECRET' with your actual API key
        },
      };

      try {
        const response = await fetch(apiUrl, requestData);
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Failed to get reader from response body");
        }
        const audioChunks: BlobPart[] | undefined = [];

        const readStream = async () => {
          let result = await reader.read();
          while (!result.done) {
            audioChunks.push(result.value);
            result = await reader.read();
          }
          const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
          if (audioRef.current) {
            audioRef.current.src = URL.createObjectURL(audioBlob);
            const volume = audioManager.getVolume("settings.volume.voice");
            if (volume !== undefined) {
              audioRef.current.volume = volume;
            }
            void audioRef.current.play();
          }
        };

        await readStream();
      } catch (error) {
        log.error("Error streaming audio:");
      }
    };

    void fetchAudio();
  }, [text, voice, language]); // Dependency array to trigger re-fetch on change

  return <audio ref={audioRef} autoPlay={true} />;
};
