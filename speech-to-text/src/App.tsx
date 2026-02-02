import { VoiceInput } from "./components/VoiceInput";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-neutral-50 sm:p-4">
      <div className="w-full max-w-[720px] bg-white rounded-2xl p-12 shadow-sm border border-neutral-100 sm:p-8 sm:px-6">
        <h1 className="text-3xl font-semibold text-center mb-2 text-neutral-900 tracking-tight sm:text-2xl">
          Voice Transcription
        </h1>

        <VoiceInput />
      </div>
    </div>
  );
}

export default App;
