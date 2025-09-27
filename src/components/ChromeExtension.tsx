import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  Zap, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';

const ChromeExtension: React.FC = () => {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const imageVariants = {
    hidden: { 
      opacity: 0, 
      x: -50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const textVariants = {
    hidden: { 
      opacity: 0, 
      x: 50,
      y: 20
    },
    visible: { 
      opacity: 1, 
      x: 0,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/10 to-purple-500/5" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='m0 40l40-40h20v20l-20 20zm40 0v-20h20l-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          {/* Left Side - Image */}
          <motion.div 
            variants={imageVariants}
            className="relative order-2 lg:order-1"
          >
            <div className="relative group">
              {/* Glowing Border Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-blue-500/30 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              
              {/* Main Image Container */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-2 border-cyan-500/20 shadow-2xl group-hover:shadow-cyan-500/20 transition-all duration-500">
                <CardContent className="p-0">
                  {/* Your Chrome Extension Image */}
                  <div className="relative h-96 lg:h-[500px] overflow-hidden rounded-lg">
                    <img 
                      src="/images/chrome-extension.png" 
                      alt="CyberCop Chrome Extension Screenshot" 
                      className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Floating Elements for Visual Interest */}
                    <div className="absolute top-8 right-8 w-4 h-4 bg-cyan-400/30 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-8 left-8 w-3 h-3 bg-blue-400/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-8 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                  </div>
                </CardContent>
              </Card>
              
            </div>
          </motion.div>

          {/* Right Side - Content */}
          <motion.div 
            variants={textVariants}
            className="space-y-8 order-1 lg:order-2"
          >
            {/* Header */}
            <div className="space-y-4">
              <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30 px-4 py-2 text-sm font-semibold">
                <ExternalLink className="w-4 h-4 mr-2" />
                Browser Extension
              </Badge>
              
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  CyberCop Chrome Extension
                </span>
              </h2>
              
              <p className="text-xl text-slate-300 leading-relaxed">
                Your always-on cyber shield, right in your browser.
              </p>
            </div>

            {/* Features List */}
            <motion.div 
              variants={containerVariants}
              className="space-y-6"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={featureVariants}
                  className="flex items-start space-x-4 group"
                >
                  <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 group-hover:from-cyan-500/20 group-hover:to-blue-500/20 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors duration-300 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>


            {/* Stats */}
            <motion.div 
              variants={textVariants}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-700"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">50K+</div>
                <div className="text-sm text-slate-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">99.9%</div>
                <div className="text-sm text-slate-400">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">24/7</div>
                <div className="text-sm text-slate-400">Protection</div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ChromeExtension;
