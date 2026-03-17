import { useState, useEffect, useRef, useCallback } from 'react';

// Simulate real-time data updates
export function useRealTimeData() {
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const updateCountRef = useRef(0);
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    // Initialize on client-side only
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Needed to avoid hydration mismatch with SSR
    setLastUpdate(new Date());
    
    // Simulate connection
    const interval = setInterval(() => {
      setIsConnected(true);
      setLastUpdate(new Date());
      updateCountRef.current += 1;
      setUpdateCount(updateCountRef.current);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { isConnected, lastUpdate, updateCount };
}

// Hook for animated number counting
export function useAnimatedNumber(targetValue: number, duration: number = 1000) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setDisplayValue(Math.floor(easeOutQuart * targetValue));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [targetValue, duration]);

  return displayValue;
}

// Hook for simulating metric changes
export function useSimulatedMetric(baseValue: number, variance: number = 0.1, interval: number = 30000) {
  const [value, setValue] = useState(baseValue);

  useEffect(() => {
    const timer = setInterval(() => {
      const change = baseValue * variance * (Math.random() * 2 - 1);
      setValue(Math.round(baseValue + change));
    }, interval);

    return () => clearInterval(timer);
  }, [baseValue, variance, interval]);

  return value;
}

// Hook for random data generation at intervals
export function usePeriodicData<T>(generator: () => T, interval: number = 60000) {
  const [data, setData] = useState<T | null>(null);
  const generateRef = useRef(generator);
  
  // Keep generator ref updated
  useEffect(() => {
    generateRef.current = generator;
  }, [generator]);

  useEffect(() => {
    // Initial generation
    const initialData = generateRef.current();
    setData(initialData);
    
    const timer = setInterval(() => {
      const newData = generateRef.current();
      setData(newData);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return data;
}

// Hook for toast notifications
export function useDataNotifications() {
  const addNotification = useCallback((message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    // Using console for now, could integrate with sonner
    console.log(`[${type.toUpperCase()}] ${message}`);
  }, []);

  return { addNotification };
}
