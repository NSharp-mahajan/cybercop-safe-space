import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

interface RobotProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  autoplay?: boolean;
  loop?: boolean;
}

const Robot: React.FC<RobotProps> = ({ 
  className = '', 
  size = 'medium', 
  autoplay = true, 
  loop = true 
}) => {
  const [animationData, setAnimationData] = useState(null);

  const sizeClasses = {
    small: 'w-30 h-30',
    medium: 'w-56 h-56 md:w-60 md:h-60',
    large: 'w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80'
  };

  useEffect(() => {
    // Load the robot animation JSON
    fetch('/robot.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading robot animation:', error));
  }, []);

  if (!animationData) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-primary/10 rounded-lg`}>
        <div className="animate-pulse text-primary">🤖</div>
      </div>
    );
  }

  return (
    <div className={`robot-container ${sizeClasses[size]} ${className}`}>
      <div className="robot-float robot-glow">
        <Lottie 
          animationData={animationData}
          autoplay={autoplay}
          loop={loop}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default Robot;