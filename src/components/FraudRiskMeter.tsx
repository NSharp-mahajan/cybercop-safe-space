import React from 'react';
import { cn } from '@/lib/utils';

interface FraudRiskMeterProps {
  riskScore: number; // 0-10
  className?: string;
}

export const FraudRiskMeter: React.FC<FraudRiskMeterProps> = ({ riskScore, className }) => {
  // Calculate angle for needle (0-180 degrees)
  const angle = (riskScore / 10) * 180;
  
  // Determine color based on risk score
  const getColor = (score: number) => {
    if (score <= 3) return '#22c55e'; // green
    if (score <= 5) return '#eab308'; // yellow
    if (score <= 7) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const color = getColor(riskScore);

  return (
    <div className={cn("relative w-48 h-24", className)}>
      {/* SVG Gauge */}
      <svg viewBox="0 0 200 100" className="w-full h-full">
        {/* Background arc */}
        <path
          d="M 10 90 A 80 80 0 0 1 190 90"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
        />
        
        {/* Colored sections */}
        <path
          d="M 10 90 A 80 80 0 0 1 60 30"
          fill="none"
          stroke="#22c55e"
          strokeWidth="10"
          opacity="0.3"
        />
        <path
          d="M 60 30 A 80 80 0 0 1 100 20"
          fill="none"
          stroke="#eab308"
          strokeWidth="10"
          opacity="0.3"
        />
        <path
          d="M 100 20 A 80 80 0 0 1 140 30"
          fill="none"
          stroke="#f97316"
          strokeWidth="10"
          opacity="0.3"
        />
        <path
          d="M 140 30 A 80 80 0 0 1 190 90"
          fill="none"
          stroke="#ef4444"
          strokeWidth="10"
          opacity="0.3"
        />
        
        {/* Needle */}
        <g transform={`translate(100, 90) rotate(${angle - 90})`}>
          <line
            x1="0"
            y1="0"
            x2="70"
            y2="0"
            stroke={color}
            strokeWidth="3"
          />
          <circle cx="0" cy="0" r="5" fill={color} />
        </g>
        
        {/* Center dot */}
        <circle cx="100" cy="90" r="3" fill="#374151" />
        
        {/* Labels */}
        <text x="20" y="98" fill="#9ca3af" fontSize="12" textAnchor="middle">Low</text>
        <text x="100" y="15" fill="#9ca3af" fontSize="12" textAnchor="middle">Medium</text>
        <text x="180" y="98" fill="#9ca3af" fontSize="12" textAnchor="middle">Critical</text>
      </svg>
      
      {/* Risk Score Display */}
      <div className="absolute inset-x-0 -bottom-2 text-center">
        <div className="text-2xl font-bold" style={{ color }}>
          {riskScore}/10
        </div>
        <div className="text-xs text-muted-foreground">Risk Score</div>
      </div>
    </div>
  );
};
