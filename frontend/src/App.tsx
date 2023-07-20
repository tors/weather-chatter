import { useConversation } from "./useConversation";
import { AudioVisualizer } from "./AudioVisualizer";

function App() {
  const { status, start, stop, analyserNode, transcripts } = useConversation({
    backendUrl: process.env.BACKEND_URL,
    subscribeTranscript: true,
    audioDeviceConfig: {
      inputDeviceId: "default",
      outputDeviceId: "default",
    },
  });

  return (
    <div className="h-screen w-full text-sm flex text-white font-mono">
      <div className="flex items-center justify-center flex-col h-full flex-grow">
        <button
          className="p-2 bg-[#424FC2] ease-in-out hover:scale-110 transition"
          onClick={status === "connected" ? stop : start}
          href="/"
        >
          {status === "connected" ? "Stop" : "Start"}
        </button>
        {analyserNode && (
          <AudioVisualizer analyzer={analyserNode} width={320} height={320} />
        )}
      </div>
      <div className="w-[320px] text-xs bg-[#a26cc6] overflow-x-scroll flex items-end">
        <div className="w-full h-screen anchored">
          {transcripts?.length === 0 && (
            <div className="p-2">
              No transcripts yet. Please press the start button above the wobbly
              orb.
            </div>
          )}
          {transcripts?.map((tx, idx) => (
            <div className="p-2" key={idx}>
              <span className="font-bold">{tx.sender}</span>: {tx.text}
            </div>
          ))}
          <div style={{ overflowAnchor: "auto", height: "1px" }}></div>
        </div>
      </div>
    </div>
  );
}

export default App;
