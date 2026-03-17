'use client';

import { useEffect, useCallback } from 'react';
import { useUIStore, useFilterStore } from '@/lib/store';

const SHORTCUTS = {
  // Navigation
  '1': 'executive',
  '2': 'financial',
  '3': 'marketing',
  '4': 'product',
  '5': 'platform',
  '6': 'brand',
  '7': 'forecast',
  
  // Quick actions
  'r': 'refresh',
  'e': 'export',
  'a': 'ai-chat',
  '?': 'help',
} as const;

export function useKeyboardShortcuts() {
  const { setActiveDashboard, toggleAIChat, toggleSidebar } = useUIStore();
  const { setTimeRange } = useFilterStore();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    const key = event.key.toLowerCase();
    
    // Check for modifier keys
    const isMeta = event.metaKey || event.ctrlKey;
    
    // Meta/Ctrl + K: Toggle AI chat
    if (isMeta && key === 'k') {
      event.preventDefault();
      toggleAIChat();
      return;
    }
    
    // Meta/Ctrl + B: Toggle sidebar
    if (isMeta && key === 'b') {
      event.preventDefault();
      toggleSidebar();
      return;
    }

    // Number keys for navigation (without modifiers)
    if (!isMeta && key in SHORTCUTS) {
      const action = SHORTCUTS[key as keyof typeof SHORTCUTS];
      
      if (typeof action === 'string' && ['executive', 'financial', 'marketing', 'product', 'platform', 'brand', 'forecast'].includes(action)) {
        event.preventDefault();
        setActiveDashboard(action as any);
      } else if (action === 'ai-chat') {
        event.preventDefault();
        toggleAIChat();
      } else if (action === 'refresh') {
        event.preventDefault();
        window.location.reload();
      }
    }
    
    // Time range shortcuts with Alt
    if (event.altKey) {
      switch (key) {
        case 't':
          event.preventDefault();
          setTimeRange('today');
          break;
        case 'w':
          event.preventDefault();
          setTimeRange('last7days');
          break;
        case 'm':
          event.preventDefault();
          setTimeRange('last30days');
          break;
        case 'y':
          event.preventDefault();
          setTimeRange('thisYear');
          break;
      }
    }
  }, [setActiveDashboard, toggleAIChat, toggleSidebar, setTimeRange]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Keyboard shortcuts help component
export function KeyboardShortcutsHelp() {
  const shortcuts = [
    { keys: ['⌘', 'K'], description: 'Toggle AI Assistant' },
    { keys: ['⌘', 'B'], description: 'Toggle Sidebar' },
    { keys: ['1-7'], description: 'Switch Dashboard' },
    { keys: ['Alt', 'T'], description: 'Today' },
    { keys: ['Alt', 'W'], description: 'This Week' },
    { keys: ['Alt', 'M'], description: 'This Month' },
    { keys: ['R'], description: 'Refresh' },
  ];

  return (
    <div className="grid gap-2">
      {shortcuts.map((shortcut, index) => (
        <div key={index} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{shortcut.description}</span>
          <div className="flex items-center gap-1">
            {shortcut.keys.map((key, i) => (
              <kbd
                key={i}
                className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded"
              >
                {key}
              </kbd>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
