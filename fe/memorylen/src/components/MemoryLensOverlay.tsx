import React, { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow, Window } from "@tauri-apps/api/window";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";

interface AiResponse {
  answer: string;
  sources: Array<{
    title: string;
    timestamp: string;
    confidence: number;
    type: string;
  }>;
}

const HOTKEY = "CommandOrControl+Shift+M";

const MemoryLensOverlay: React.FC = () => {
  const [inputQuery, setInputQuery] = useState("");
  const [responseResult, setResponseResult] = useState<AiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const appWindow = useRef<Window | null>(null);

  useEffect(() => {
    let unlistenFocus: (() => void) | undefined;

    const toggleWindow = async () => {
      if (!appWindow.current) return;

      const visible = await appWindow.current.isVisible();

      if (visible) {
        await appWindow.current.hide();
        return;
      }
     await appWindow.current.show();
     await appWindow.current.setFocus();

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    };

    const setup = async () => {
      try {
        appWindow.current = getCurrentWindow();

        console.log("Window initialized");
        console.log("Label:", appWindow.current.label);

        await unregister(HOTKEY).catch(() => {});

        await register(HOTKEY, async (event) => {
          if (event.state !== "Pressed") return;

          console.log("HOTKEY FIRED");

          await toggleWindow();
        });

        console.log("Shortcut registered:", HOTKEY);

        // Start hidden
        await appWindow.current.hide();

        // Optional: hide when clicking outside
        unlistenFocus = await appWindow.current.onFocusChanged(
          async (event) => {
            if (!event.payload) {
              setInputQuery("");
              setResponseResult(null);

              await appWindow.current?.hide();
            }
          }
        );
      } catch (err) {
        console.error("Setup error:", err);
      }
    };

    setup();

    return () => {
      unregister(HOTKEY).catch(() => {});
      unlistenFocus?.();
    };
  }, []);

  const handleQuerySubmit = async () => {
    if (!inputQuery.trim() || isLoading) return;

    setIsLoading(true);
    setResponseResult(null);

    try {
      const result = await invoke<AiResponse>(
        "query_memory_pipeline",
        {
          query: inputQuery,
        }
      );

      setResponseResult(result);
    } catch (error) {
      console.error(error);

      setResponseResult({
        answer: "Failed to query memory pipeline.",
        sources: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      await handleQuerySubmit();
    }

    if (e.key === "Escape") {
      setInputQuery("");
      setResponseResult(null);

      await appWindow.current?.hide();
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="w-[680px] max-h-[80vh] flex flex-col bg-zinc-900/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center px-6 py-5 border-b border-white/10">
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="MemoryLens: query memories..."
            className="flex-1 text-2xl font-medium text-white placeholder-white/40 bg-transparent outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading && (
            <div className="text-white/60">
              Searching memories...
            </div>
          )}

          {!isLoading && !responseResult && (
            <div className="text-center py-12 text-white/40">
              Ready to query...
            </div>
          )}

          {responseResult && (
            <div>
              <div className="text-white whitespace-pre-wrap">
                {responseResult.answer}
              </div>

              {responseResult.sources.length > 0 && (
                <div className="mt-6 space-y-2">
                  {responseResult.sources.map((source, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-white/50 border-t border-white/10 pt-2"
                    >
                      {source.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryLensOverlay;