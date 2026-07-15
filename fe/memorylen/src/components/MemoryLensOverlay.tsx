import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow, Window } from '@tauri-apps/api/window';
import { register, unregister } from '@tauri-apps/plugin-global-shortcut';

interface AiResponse {
  answer: string;
  sources: Array<{ title: string; timestamp: string; confidence: number; type: string }>;
}

const MemoryLensOverlay: React.FC = () => {
  const [inputQuery, setInputQuery] = useState<string>('');
  const [responseResult, setResponseResult] = useState<AiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Use a ref to hold the window instance to prevent re-render crashes
  const appWindow = useRef<Window | null>(null);

  useEffect(() => {
    // Debug: Initialize window and log availability
    appWindow.current = getCurrentWindow();
    console.log("Window initialized:", appWindow.current?.label);

    let unlistenFocus: (() => void) | undefined;

    const setup = async () => {
      try {
        // Register Global Shortcut
        await unregister('CommandOrControl+Shift+Space');
        await register('CommandOrControl+Shift+Space', async (event) => {
          if (event.state === 'Pressed' && appWindow.current) {
            console.log("Hotkey pressed, toggling visibility...");
            const isVisible = await appWindow.current.isVisible();
            if (isVisible) {
              await appWindow.current.hide();
            } else {
              await appWindow.current.show();
              await appWindow.current.setFocus();
              inputRef.current?.focus();
            }
          }
        });
        console.log("Global shortcut registered successfully.");

        // Setup Focus Listener
        if (appWindow.current) {
          unlistenFocus = await appWindow.current.onFocusChanged(async (event) => {
            const focused = event.payload; // Tauri v2 event payload
            console.log("Focus changed:", focused);
            if (!focused) {
              setInputQuery('');
              setResponseResult(null);
              await appWindow.current?.hide();
            }
          });
        }
      } catch (err) {
        console.error("Setup Error:", err);
      }
    };

    setup();

    return () => {
      unregister('CommandOrControl+Shift+Space');
      if (unlistenFocus) unlistenFocus();
    };
  }, []);

  const handleQuerySubmit = async () => {
    if (!inputQuery.trim() || isLoading) return;

    setIsLoading(true);
    setResponseResult(null);

    try {
      console.log("Invoking backend...");
      const result = await invoke<AiResponse>('query_memory_pipeline', { query: inputQuery });
      setResponseResult(result);
    } catch (error) {
      console.error('Backend query failed:', error);
      setResponseResult({ answer: 'Error connecting to memory pipeline.', sources: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      await handleQuerySubmit();
    } else if (e.key === 'Escape') {
      setInputQuery('');
      setResponseResult(null);
      await appWindow.current?.hide();
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center pointer-events-none">
      <div 
        className="pointer-events-auto w-[680px] max-h-[80vh] flex flex-col bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* HEADER */}
        <div className={`flex items-center px-6 py-5 border-b transition-all ${isFocused ? 'border-sky-400/50 bg-white/10' : 'border-white/10'}`}>
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="MemoryLens: query memories..."
            className="flex-1 text-2xl font-medium text-white placeholder-white/40 bg-transparent outline-none"
          />
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
           {/* ... existing rendering logic ... */}
           {!isLoading && !responseResult && (
            <div className="text-center py-12 text-white/40">Ready to query...</div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MemoryLensOverlay;