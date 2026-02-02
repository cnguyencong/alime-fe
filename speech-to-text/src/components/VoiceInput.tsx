import { useState, useRef, useCallback, useEffect } from "react";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { LiveAudioVisualizer } from "react-audio-visualize";
import { transcribeAudio } from "../services/whisperService";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";

export function VoiceInput() {
  const [inputValue, setInputValue] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [shouldTranscribe, setShouldTranscribe] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const recorderControls = useAudioRecorder(
    {
      noiseSuppression: true,
      echoCancellation: true,
    },
    (err) => console.error("Recording error:", err),
  );

  // Track cursor position
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  const handleInputClick = () => {
    setCursorPosition(inputRef.current?.selectionStart || 0);
  };

  const handleInputKeyUp = () => {
    setCursorPosition(inputRef.current?.selectionStart || 0);
  };

  // Insert text at cursor position
  const insertTextAtCursor = useCallback(
    (newText: string) => {
      setInputValue((prevValue) => {
        const before = prevValue.substring(0, cursorPosition);
        const after = prevValue.substring(cursorPosition);
        return before + newText + after;
      });

      const newCursorPos = cursorPosition + newText.length;
      setCursorPosition(newCursorPos);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    },
    [cursorPosition],
  );

  // Handle transcription when recording completes
  useEffect(() => {
    if (recorderControls.recordingBlob && shouldTranscribe) {
      transcribeAudio(recorderControls.recordingBlob)
        .then((result) => {
          insertTextAtCursor(result.text);
          setShouldTranscribe(false);
        })
        .catch((err) => {
          console.error("Transcription failed:", err);
          alert(`Transcription failed: ${err.message}`);
          setShouldTranscribe(false);
        });
    }
  }, [recorderControls.recordingBlob, shouldTranscribe, insertTextAtCursor]);

  const handleMicClick = () => {
    setShouldTranscribe(true);
    recorderControls.startRecording();
  };

  const handleCancelRecording = () => {
    setShouldTranscribe(false);
    recorderControls.stopRecording();
  };

  const handleConfirmRecording = () => {
    setShouldTranscribe(true);
    recorderControls.stopRecording();
  };

  const handleSend = () => {
    console.log(inputValue);
  };

  const isRecording = recorderControls.isRecording;
  const isProcessing =
    !recorderControls.isRecording &&
    !!recorderControls.recordingBlob &&
    shouldTranscribe;

  return (
    <div className="w-full">
      {!isRecording && !isProcessing && (
        <div className="flex items-center gap-3 bg-neutral-50 border-[1.5px] border-neutral-100 rounded-xl px-4 py-3 transition-all duration-200 focus-within:border-brand-primary focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(193,95,60,0.1)]">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-neutral-900 text-[0.9375rem] py-1 placeholder:text-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed"
            value={inputValue}
            onChange={handleInputChange}
            onClick={handleInputClick}
            onKeyUp={handleInputKeyUp}
            placeholder="Type or speak your message..."
            disabled={isRecording || isProcessing}
          />

          <Button
            variant="secondary"
            onClick={handleMicClick}
            disabled={isProcessing}
            aria-label="Start recording"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </Button>

          <Button
            variant="primary"
            onClick={handleSend}
            disabled={!inputValue.trim() || isProcessing}
            aria-label="Send message"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </Button>
        </div>
      )}

      {(isRecording || isProcessing) && (
        <div className="flex items-center gap-3 bg-white border-[1.5px] border-brand-primary rounded-xl px-4 py-3 shadow-[0_0_0_3px_rgba(193,95,60,0.1)]">
          {recorderControls.mediaRecorder && isRecording && (
            <LiveAudioVisualizer
              mediaRecorder={recorderControls.mediaRecorder}
              width={400}
              height={60}
              barWidth={2}
              gap={1}
              barColor={"#C15F3C"}
            />
          )}

          {isRecording && (
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="error"
                onClick={handleCancelRecording}
                aria-label="Cancel recording"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Button>

              <Button
                variant="confirm"
                onClick={handleConfirmRecording}
                aria-label="Confirm recording"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </Button>
            </div>
          )}

          {isProcessing && <Spinner />}
        </div>
      )}
    </div>
  );
}
