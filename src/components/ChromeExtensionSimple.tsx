import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  Zap, 
  CheckCircle,
  ExternalLink,
  Sparkles,
  Star,
  Crown
} from 'lucide-react';

const ChromeExtensionSimple: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  const features = [
    {
      icon: AlertTriangle,
      title: "Real-time fraud detection while browsing",
      description: "Advanced AI algorithms scan every page you visit for potential threats"
    },
    {
      icon: Shield,
      title: "Instant scam alerts before you click suspicious links",
      description: "Get warned about malicious websites before you even click on them"
    },
    {
      icon: Zap,
      title: "One-click reporting directly from your browser",
      description: "Report suspicious activities instantly without leaving your current page"
    }
  ];

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  // Mouse tracking for 3D effect
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-slate-800/20 to-slate-900/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/3 via-blue-500/5 to-purple-500/3" />
      
      {/* Minimal Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='m0 60l60-60h30v30l-30 30zm60 0v-30h30l-30 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Minimal Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.slice(0, 8).map((particle) => (
          <div
            key={particle.id}
            className="absolute w-0.5 h-0.5 bg-cyan-400/20 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Subtle Light Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-cyan-500/3 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-blue-500/3 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Image with Refined Effects */}
          <div className="relative order-2 lg:order-1">
            <div 
              className="relative group cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                transform: `perspective(1000px) rotateX(${(mousePosition.y - 50) * 0.05}deg) rotateY(${(mousePosition.x - 50) * 0.05}deg)`,
                transition: isHovered ? 'none' : 'transform 0.3s ease-out'
              }}
            >
              {/* Subtle Glow Effects */}
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-blue-500/25 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/10 via-blue-400/15 to-purple-400/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
              
              {/* Refined Award Badge */}
              <div className="absolute -top-3 -right-3 z-20">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg award-winning-crown">
                  <Crown className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Main Image Container - Square Box */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-900/90 border border-cyan-500/20 shadow-xl group-hover:shadow-cyan-500/30 transition-all duration-500 group-hover:scale-102">
                <CardContent className="p-0">
                  {/* Chrome Extension Image - Square Container */}
                  <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-lg">
                    <img 
                      src="/images/chrome-extension.png" 
                      alt="CyberCop Chrome Extension Screenshot" 
                      className="w-full h-full object-contain rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:brightness-105"
                    />
                    
                    {/* Subtle Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/3 via-transparent to-blue-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Minimal Floating Elements */}
                    <div className="absolute top-4 right-4 w-4 h-4 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-md award-winning-float">
                      <Sparkles className="w-2.5 h-2.5 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="absolute bottom-4 left-4 w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-md award-winning-float" style={{ animationDelay: '1s' }}>
                      <Star className="w-2 h-2 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>

                    {/* Subtle Shimmer */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"></div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Header with Improved Visibility */}
            <div className="space-y-4">
              <div className="relative">
                <Badge className="bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border-cyan-500/40 px-4 py-2 text-sm font-semibold shadow-lg shadow-cyan-500/20">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Browser Extension
                </Badge>
              </div>
              
              <div className="relative">
                <h2 className="text-3xl lg:text-4xl font-bold leading-tight text-white">
                  <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
                    CyberCop Chrome Extension
                  </span>
                </h2>
                {/* Subtle text shadow for better visibility */}
                <div className="absolute inset-0 text-3xl lg:text-4xl font-bold text-white/20 blur-sm -z-10">
                  CyberCop Chrome Extension
                </div>
              </div>
              
              <p className="text-lg text-slate-200 leading-relaxed font-medium">
                Your always-on cyber shield, right in your browser.
              </p>
            </div>

            {/* Features List with Refined Effects */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="relative group"
                >
                  {/* Feature Card with Subtle Effects */}
                  <div className="flex items-start space-x-3 p-4 rounded-lg bg-gradient-to-r from-slate-800/40 to-slate-900/40 border border-slate-700/30 hover:border-cyan-500/30 transition-all duration-300 group-hover:scale-102 group-hover:shadow-lg group-hover:shadow-cyan-500/10 relative overflow-hidden">
                    {/* Subtle Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/3 via-blue-500/3 to-purple-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Icon with Refined Animation */}
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md shadow-cyan-500/10">
                      <feature.icon className="w-5 h-5 text-cyan-400 group-hover:text-white transition-colors duration-300" />
                    </div>
                    
                    {/* Content with Clean Typography */}
                    <div className="flex-1 relative z-10">
                      <h3 className="text-base font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors duration-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    
                    {/* Subtle Shimmer */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats with Refined Effects */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-700/50">
              <div className="text-center group">
                <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                  50K+
                </div>
                <div className="text-xs text-slate-400 group-hover:text-cyan-300 transition-colors duration-300">Active Users</div>
              </div>
              
              <div className="text-center group">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                  99.9%
                </div>
                <div className="text-xs text-slate-400 group-hover:text-blue-300 transition-colors duration-300">Accuracy Rate</div>
              </div>
              
              <div className="text-center group">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                  24/7
                </div>
                <div className="text-xs text-slate-400 group-hover:text-purple-300 transition-colors duration-300">Protection</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChromeExtensionSimple;
