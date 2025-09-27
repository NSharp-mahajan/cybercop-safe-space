import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

interface RobotLogoProps {
  className?: string;
  size?: number;
}

export const RobotLogo: React.FC<RobotLogoProps> = ({ 
  className = "", 
  size = 32 
}) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch('/animations/robot.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading robot animation:', error));
  }, []);

  if (!animationData) {
    // Fallback to a simple robot emoji while loading
    return (
      <div 
        className={`${className} flex items-center justify-center`} 
        style={{ width: size, height: size }}
      >
        🤖
      </div>
    );
  }

  return (
    <div className={`${className}`} style={{ width: size, height: size }}>
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default RobotLogo;
