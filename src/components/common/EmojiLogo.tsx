
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/utils';

interface EmojiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  trackMouse?: boolean;
}

interface ElementPosition {
  x: number;
  y: number;
}

const EmojiLogo: React.FC<EmojiLogoProps> = ({ 
  className, 
  size = 'md', 
  animated = true,
  trackMouse = false
}) => {
  const sizeClasses = {
    'sm': 'w-16 h-16',
    'md': 'w-24 h-24',
    'lg': 'w-40 h-40', 
    'xl': 'w-60 h-60'
  };
  
  const logoRef = useRef<HTMLDivElement>(null);
  const [expressionPosition, setExpressionPosition] = useState<ElementPosition>({ x: 0, y: 0 });
  const [targetExpressionPosition, setTargetExpressionPosition] = useState<ElementPosition>({ x: 0, y: 0 });
  const [isMouseNearLogo, setIsMouseNearLogo] = useState(false);
  
  // Animation frame reference for smooth interpolation
  const animationRef = useRef<number | null>(null);
  
  // Constants for movement - Adjusted for controlled movement
  const EXPRESSION_FACTOR = 2.0;      // Reduced from 3.0 for less exaggerated movement
  const MAX_TRANSLATION = 25;         // Reduced from 45 to limit how far elements can move out
  const INTERPOLATION_SPEED = 0.35;   // Faster interpolation for quicker response
  const RESET_INTERPOLATION_SPEED = 0.2; // Faster reset when mouse leaves
  
  // Detection area around the logo (multiplier of logo dimensions)
  const DETECTION_AREA = 1.5; // Mouse is detected within 1.5x the logo's dimensions
  
  // Handle mouse movement to calculate target positions
  useEffect(() => {
    if (!trackMouse) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!logoRef.current) return;
      
      const rect = logoRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate distance from center as a ratio to logo size
      const detectionRadiusX = rect.width * DETECTION_AREA / 2;
      const detectionRadiusY = rect.height * DETECTION_AREA / 2;
      
      const distanceX = Math.abs(e.clientX - centerX);
      const distanceY = Math.abs(e.clientY - centerY);
      
      const isNear = distanceX <= detectionRadiusX && distanceY <= detectionRadiusY;
      setIsMouseNearLogo(isNear);
      
      if (isNear) {
        // Normalized cursor position (-1 to 1), more sensitive
        const dx = (e.clientX - centerX) / (rect.width / 2); 
        const dy = (e.clientY - centerY) / (rect.height / 2);
        
        // Update target positions with translation only (no rotation)
        setTargetExpressionPosition({
          x: dx * MAX_TRANSLATION * EXPRESSION_FACTOR,
          y: dy * MAX_TRANSLATION * EXPRESSION_FACTOR
        });
      } else {
        // Reset position when mouse is outside detection area
        setTargetExpressionPosition({ x: 0, y: 0 });
      }
    };
    
    const handleMouseLeave = () => {
      setIsMouseNearLogo(false);
      setTargetExpressionPosition({ x: 0, y: 0 });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trackMouse]);
  
  // Smooth interpolation animation
  useEffect(() => {
    if (!trackMouse) return;
    
    const animate = () => {
      // Use faster interpolation when mouse is near, slower when resetting
      const speed = isMouseNearLogo ? INTERPOLATION_SPEED : RESET_INTERPOLATION_SPEED;
      
      setExpressionPosition(prev => ({
        x: prev.x + (targetExpressionPosition.x - prev.x) * speed,
        y: prev.y + (targetExpressionPosition.y - prev.y) * speed
      }));
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trackMouse, targetExpressionPosition, isMouseNearLogo]);

  return (
    <div 
      ref={logoRef}
      className={cn('relative', sizeClasses[size], className)}
    >
      {/* Face */}
      <div className="w-full h-full rounded-full absolute">
        <img 
          src="/lovable-uploads/ae451c53-1760-477b-9394-05fa0af61be8.png" 
          alt="Emoji Face" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Expression (combined sunglasses and mouth) */}
      <div 
        className="absolute w-full h-full top-0 left-0"
        style={{ 
          transform: trackMouse 
            ? `translate(${expressionPosition.x}px, ${expressionPosition.y}px)` 
            : 'none',
          transition: 'transform 0.1s cubic-bezier(0.33, 1, 0.68, 1)' // Fast, sharp transition
        }}
      >
        <img 
          src="/lovable-uploads/780263d9-ca33-48b8-9450-6cd9b9181293.png" 
          alt="Expression" 
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default EmojiLogo;