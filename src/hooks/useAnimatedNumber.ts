import { useState, useEffect, useRef } from 'react';

export const useAnimatedNumber = (
  endValue: number,
  duration: number = 1500,
  decimals: number = 0
) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setIsAnimating(true);
    const startTime = performance.now();
    startTimeRef.current = startTime;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out quart)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const animatedValue = endValue * easeOutQuart;
      setCurrentValue(animatedValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setCurrentValue(endValue);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [endValue, duration]);

  return {
    value: currentValue,
    isAnimating,
    formatted: currentValue.toFixed(decimals)
  };
};
