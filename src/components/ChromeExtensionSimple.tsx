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
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Award-Winning Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/10 to-purple-500/5" />
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full animate-pulse" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='m0 40l40-40h20v20l-20 20zm40 0v-20h20l-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Particles System */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Neon Light Rays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Image with Award-Winning Effects */}
          <div className="relative order-2 lg:order-1">
            <div 
              className="relative group cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                transform: `perspective(1000px) rotateX(${(mousePosition.y - 50) * 0.1}deg) rotateY(${(mousePosition.x - 50) * 0.1}deg)`,
                transition: isHovered ? 'none' : 'transform 0.3s ease-out'
              }}
            >
              {/* Multi-Layer Glow Effects */}
              <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500/30 via-blue-500/40 to-purple-500/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700" />
              <div className="absolute -inset-6 bg-gradient-to-r from-cyan-400/20 via-blue-400/30 to-purple-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-300/10 via-blue-300/20 to-purple-300/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
              
              {/* Award Crown Badge */}
              <div className="absolute -top-4 -right-4 z-20">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl award-winning-crown award-winning-neon">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full blur-md animate-pulse"></div>
                </div>
              </div>

              {/* Main Image Container with 3D Effects */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 border-2 border-cyan-500/30 shadow-2xl group-hover:shadow-cyan-500/40 transition-all duration-700 group-hover:scale-105">
                <CardContent className="p-0">
                  {/* Your Chrome Extension Image with Advanced Effects */}
                  <div className="relative h-96 lg:h-[500px] overflow-hidden rounded-lg">
                    <img 
                      src="/images/chrome-extension.png" 
                      alt="CyberCop Chrome Extension Screenshot" 
                      className="w-full h-full object-cover rounded-lg transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                    />
                    
                    {/* Animated Overlay Effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Floating Elements with Enhanced Animation */}
                    <div className="absolute top-8 right-8 w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-lg shadow-cyan-500/50 award-winning-float">
                      <Sparkles className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="absolute bottom-8 left-8 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg shadow-blue-500/50 award-winning-float" style={{ animationDelay: '1s' }}>
                      <Star className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="absolute top-1/2 left-8 w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-lg shadow-purple-500/50 award-winning-float" style={{ animationDelay: '2s' }}>
                      <Zap className="w-2 h-2 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 award-winning-shimmer"></div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-8 order-1 lg:order-2">
            {/* Header with Award-Winning Effects */}
            <div className="space-y-4">
              <div className="relative">
                <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30 px-4 py-2 text-sm font-semibold animate-pulse shadow-lg shadow-cyan-500/20">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Browser Extension
                </Badge>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg blur-sm animate-pulse"></div>
              </div>
              
              <div className="relative">
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent award-winning-gradient">
                    CyberCop Chrome Extension
                  </span>
                </h2>
                {/* Text Glow Effect */}
                <div className="absolute inset-0 text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent blur-sm opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}>
                  CyberCop Chrome Extension
                </div>
              </div>
              
              <p className="text-xl text-slate-300 leading-relaxed relative">
                <span className="relative z-10">Your always-on cyber shield, right in your browser.</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-lg blur-sm -z-10"></div>
              </p>
            </div>

            {/* Features List with Award-Winning Effects */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="relative group"
                  style={{
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  {/* Feature Card with Advanced Effects */}
                  <div className="flex items-start space-x-4 p-6 rounded-xl bg-gradient-to-r from-slate-800/60 to-slate-900/60 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-cyan-500/20 relative overflow-hidden">
                    {/* Animated Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Floating Particles for Each Feature */}
                    <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400/40 rounded-full animate-pulse" style={{ animationDelay: `${index * 0.5}s` }}></div>
                    <div className="absolute bottom-2 left-2 w-1 h-1 bg-blue-400/40 rounded-full animate-pulse" style={{ animationDelay: `${index * 0.7}s` }}></div>
                    
                    {/* Icon with Enhanced Animation */}
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-xl flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-cyan-500/20 relative">
                      <feature.icon className="w-7 h-7 text-cyan-400 group-hover:text-white transition-colors duration-300" />
                      {/* Icon Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    
                    {/* Content with Enhanced Typography */}
                    <div className="flex-1 relative z-10">
                      <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors duration-300 relative">
                        {feature.title}
                        {/* Text Underline Effect */}
                        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-500"></div>
                      </h3>
                      <p className="text-slate-400 group-hover:text-slate-200 transition-colors duration-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats with Award-Winning Effects */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-700 relative">
              {/* Animated Background for Stats */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 rounded-xl blur-sm"></div>
              
              <div className="text-center relative z-10 group">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent animate-pulse group-hover:scale-110 transition-transform duration-300">
                  50K+
                </div>
                <div className="text-sm text-slate-400 group-hover:text-cyan-300 transition-colors duration-300">Active Users</div>
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-cyan-400/40 rounded-full animate-pulse"></div>
              </div>
              
              <div className="text-center relative z-10 group">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent animate-pulse group-hover:scale-110 transition-transform duration-300" style={{ animationDelay: '0.5s' }}>
                  99.9%
                </div>
                <div className="text-sm text-slate-400 group-hover:text-blue-300 transition-colors duration-300">Accuracy Rate</div>
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-400/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
              
              <div className="text-center relative z-10 group">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent animate-pulse group-hover:scale-110 transition-transform duration-300" style={{ animationDelay: '1s' }}>
                  24/7
                </div>
                <div className="text-sm text-slate-400 group-hover:text-purple-300 transition-colors duration-300">Protection</div>
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-purple-400/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChromeExtensionSimple;
