import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, FileText, Eye, ExternalLink, Rocket, RotateCcw } from "lucide-react";

interface ProcessStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface FIRProcessFlowProps {
  currentStep?: number;
}

const FIRProcessFlow: React.FC<FIRProcessFlowProps> = ({ currentStep = 1 }) => {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const toggleCard = (stepId: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };
  const steps: ProcessStep[] = [
    {
      id: 1,
      title: "Start Your Journey",
      description: "Begin by accessing the FIR Generator from our landing page",
      icon: <Rocket className="h-6 w-6" />,
      image: "/images/fir-landing.jpg", // You'll add this image
      status: currentStep >= 1 ? 'completed' : 'upcoming'
    },
    {
      id: 2,
      title: "Fill FIR Details",
      description: "Complete the comprehensive form with incident details and personal information",
      icon: <FileText className="h-6 w-6" />,
      image: "/images/fir-form.jpg", // You'll add this image
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'upcoming'
    },
    {
      id: 3,
      title: "Submit FIR & Preview",
      description: "Click 'Submit FIR' to generate and preview your FIR document, then get redirected to the government portal",
      icon: <Eye className="h-6 w-6" />,
      image: "/images/fir-submit-preview.jpg", // You'll add this image
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'upcoming'
    },
    {
      id: 4,
      title: "Portal Login & Submit",
      description: "On the government portal, scroll down to find the login form, enter your credentials, and submit your complaint through the official system",
      icon: <ExternalLink className="h-6 w-6" />,
      image: "/images/fir-portal-login.jpg", // You'll add this image
      status: currentStep === 4 ? 'current' : 'upcoming'
    }
  ];

  const getStepStyles = (step: ProcessStep) => {
    const baseStyles = "relative transition-all duration-500 hover:scale-105";
    
    switch (step.status) {
      case 'completed':
        return `${baseStyles} opacity-100`;
      case 'current':
        return `${baseStyles} opacity-100 ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/20`;
      case 'upcoming':
        return `${baseStyles} opacity-60`;
      default:
        return baseStyles;
    }
  };

  const getBadgeStyles = (step: ProcessStep) => {
    switch (step.status) {
      case 'completed':
        return "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg";
      case 'current':
        return "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30";
      case 'upcoming':
        return "bg-gradient-to-r from-slate-500 to-slate-600 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const getProgressPercentage = () => {
    return ((currentStep - 1) / 3) * 100;
  };

  return (
    <div className="w-full py-12 px-4">
      <style jsx>{`
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
      {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
            FIR Generation Process Flow
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Follow these simple steps to generate and submit your FIR with ease
          </p>
        </div>

        {/* Process Steps - Zigzag Layout */}
        <div className="relative">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          {/* Steps Container - 2x2 Grid Layout */}
          <div className="relative">
            {/* Grid Container */}
            <div className="grid grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Step 1 - Landing Page */}
              <div className="relative">
                <div 
                  className={`relative h-80 cursor-pointer transition-transform duration-700 transform-gpu ${
                    flippedCards.has(1) ? 'rotate-y-180' : ''
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                  onClick={() => toggleCard(1)}
                >
                  {/* Front Side - Text Content */}
                  <div className={`absolute inset-0 w-full h-full backface-hidden ${flippedCards.has(1) ? 'hidden' : 'block'}`}>
                    <Card className={`${getStepStyles(steps[0])} bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-2 border-cyan-500/20 shadow-2xl h-full`}>
                      <CardContent className="p-6 h-full flex flex-col justify-center">
                        <div className="text-center">
                          <div className="mb-6">
                            <Badge className={`${getBadgeStyles(steps[0])} text-lg font-bold px-4 py-2 rounded-full`}>
                              {steps[0].status === 'completed' ? <CheckCircle className="h-5 w-5 mr-2" /> : null}
                              1
                            </Badge>
                          </div>
                          <div className={`p-4 rounded-full mx-auto mb-4 w-16 h-16 flex items-center justify-center ${steps[0].status === 'completed' ? 'bg-emerald-500/20' : steps[0].status === 'current' ? 'bg-cyan-500/20' : 'bg-slate-500/20'}`}>
                            {steps[0].icon}
                          </div>
                          <h3 className={`text-2xl font-bold mb-4 ${steps[0].status === 'completed' ? 'text-emerald-400' : steps[0].status === 'current' ? 'text-cyan-400' : 'text-slate-400'}`}>
                            {steps[0].title}
                          </h3>
                          <p className="text-slate-300 leading-relaxed mb-6">
                            {steps[0].description}
                          </p>
                          <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm">
                            <RotateCcw className="h-4 w-4" />
                            <span>Click to see image</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
      </div>

                  {/* Back Side - Image Content */}
                  <div className={`absolute inset-0 w-full h-full backface-hidden ${flippedCards.has(1) ? 'block' : 'hidden'}`} style={{ transform: 'rotateY(180deg)' }}>
                    <Card className={`${getStepStyles(steps[0])} bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-2 border-cyan-500/20 shadow-2xl h-full`}>
                      <CardContent className="p-0 h-full">
                        <div className="relative h-full overflow-hidden rounded-xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/5 to-slate-100/5"></div>
                          <img 
                            src={steps[0].image} 
                            alt={steps[0].title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling!.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-full bg-gradient-to-br from-slate-100/95 to-slate-200/95 items-center justify-center">
                            <div className="text-center p-8">
                              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                                {steps[0].icon}
                              </div>
                              <h3 className="text-slate-800 text-xl font-bold mb-2">Step 1: Landing Page</h3>
                              <p className="text-slate-600 text-sm mb-4">Screenshot of the main landing page</p>
                              <div className="inline-flex items-center gap-2 bg-cyan-500/10 rounded-full px-4 py-2 text-cyan-400 text-xs">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                <span>Add your screenshot here</span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-4 left-4">
                            <Badge className={`${getBadgeStyles(steps[0])} text-lg font-bold px-4 py-2 rounded-full`}>
                              {steps[0].status === 'completed' ? <CheckCircle className="h-5 w-5 mr-2" /> : null}
                              1
                            </Badge>
                          </div>
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                            <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm rounded-full px-4 py-2 text-cyan-400 text-sm">
                              <RotateCcw className="h-4 w-4" />
                              <span>Click to see details</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
              
              {/* Step 2 - FIR Form */}
              <div className="relative">
                <div 
                  className={`relative h-80 cursor-pointer transition-transform duration-700 transform-gpu ${
                    flippedCards.has(2) ? 'rotate-y-180' : ''
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                  onClick={() => toggleCard(2)}
                >
                  {/* Front Side - Text Content */}
                  <div className={`absolute inset-0 w-full h-full backface-hidden ${flippedCards.has(2) ? 'hidden' : 'block'}`}>
                    <Card className={`${getStepStyles(steps[1])} bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-2 border-cyan-500/20 shadow-2xl h-full`}>
                      <CardContent className="p-6 h-full flex flex-col justify-center">
                        <div className="text-center">
                          <div className="mb-6">
                            <Badge className={`${getBadgeStyles(steps[1])} text-lg font-bold px-4 py-2 rounded-full`}>
                              {steps[1].status === 'completed' ? <CheckCircle className="h-5 w-5 mr-2" /> : null}
                              2
                            </Badge>
                          </div>
                          <div className={`p-4 rounded-full mx-auto mb-4 w-16 h-16 flex items-center justify-center ${steps[1].status === 'completed' ? 'bg-emerald-500/20' : steps[1].status === 'current' ? 'bg-cyan-500/20' : 'bg-slate-500/20'}`}>
                            {steps[1].icon}
                          </div>
                          <h3 className={`text-2xl font-bold mb-4 ${steps[1].status === 'completed' ? 'text-emerald-400' : steps[1].status === 'current' ? 'text-cyan-400' : 'text-slate-400'}`}>
                            {steps[1].title}
                          </h3>
                          <p className="text-slate-300 leading-relaxed mb-6">
                            {steps[1].description}
                          </p>
                          <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm">
                            <RotateCcw className="h-4 w-4" />
                            <span>Click to see image</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Back Side - Image Content */}
                  <div className={`absolute inset-0 w-full h-full backface-hidden ${flippedCards.has(2) ? 'block' : 'hidden'}`} style={{ transform: 'rotateY(180deg)' }}>
                    <Card className={`${getStepStyles(steps[1])} bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-2 border-cyan-500/20 shadow-2xl h-full`}>
                      <CardContent className="p-0 h-full">
                        <div className="relative h-full overflow-hidden rounded-xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/5 to-slate-100/5"></div>
                          <img 
                            src={steps[1].image} 
                            alt={steps[1].title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling!.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-full bg-gradient-to-br from-slate-100/95 to-slate-200/95 items-center justify-center">
                            <div className="text-center p-8">
                              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                                {steps[1].icon}
                              </div>
                              <h3 className="text-slate-800 text-xl font-bold mb-2">Step 2: FIR Form</h3>
                              <p className="text-slate-600 text-sm mb-4">Screenshot of the form filling interface</p>
                              <div className="inline-flex items-center gap-2 bg-cyan-500/10 rounded-full px-4 py-2 text-cyan-400 text-xs">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                <span>Add your screenshot here</span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-4 left-4">
                            <Badge className={`${getBadgeStyles(steps[1])} text-lg font-bold px-4 py-2 rounded-full`}>
                              {steps[1].status === 'completed' ? <CheckCircle className="h-5 w-5 mr-2" /> : null}
                              2
                            </Badge>
                          </div>
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                            <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm rounded-full px-4 py-2 text-cyan-400 text-sm">
                              <RotateCcw className="h-4 w-4" />
                              <span>Click to see details</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
              
              {/* Step 3 - Preview FIR */}
              <div className="relative">
                <div 
                  className={`relative h-80 cursor-pointer transition-transform duration-700 transform-gpu ${
                    flippedCards.has(3) ? 'rotate-y-180' : ''
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                  onClick={() => toggleCard(3)}
                >
                  {/* Front Side - Text Content */}
                  <div className={`absolute inset-0 w-full h-full backface-hidden ${flippedCards.has(3) ? 'hidden' : 'block'}`}>
                    <Card className={`${getStepStyles(steps[2])} bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-2 border-cyan-500/20 shadow-2xl h-full`}>
                      <CardContent className="p-6 h-full flex flex-col justify-center">
                        <div className="text-center">
                          <div className="mb-6">
                            <Badge className={`${getBadgeStyles(steps[2])} text-lg font-bold px-4 py-2 rounded-full`}>
                              {steps[2].status === 'completed' ? <CheckCircle className="h-5 w-5 mr-2" /> : null}
                              3
                            </Badge>
                          </div>
                          <div className={`p-4 rounded-full mx-auto mb-4 w-16 h-16 flex items-center justify-center ${steps[2].status === 'completed' ? 'bg-emerald-500/20' : steps[2].status === 'current' ? 'bg-cyan-500/20' : 'bg-slate-500/20'}`}>
                            {steps[2].icon}
                          </div>
                          <h3 className={`text-2xl font-bold mb-4 ${steps[2].status === 'completed' ? 'text-emerald-400' : steps[2].status === 'current' ? 'text-cyan-400' : 'text-slate-400'}`}>
                            {steps[2].title}
                          </h3>
                          <p className="text-slate-300 leading-relaxed mb-6">
                            {steps[2].description}
                          </p>
                          <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm">
                            <RotateCcw className="h-4 w-4" />
                            <span>Click to see image</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Back Side - Image Content */}
                  <div className={`absolute inset-0 w-full h-full backface-hidden ${flippedCards.has(3) ? 'block' : 'hidden'}`} style={{ transform: 'rotateY(180deg)' }}>
                    <Card className={`${getStepStyles(steps[2])} bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-2 border-cyan-500/20 shadow-2xl h-full`}>
                      <CardContent className="p-0 h-full">
                        <div className="relative h-full overflow-hidden rounded-xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/5 to-slate-100/5"></div>
                          <img 
                            src={steps[2].image} 
                            alt={steps[2].title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling!.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-full bg-gradient-to-br from-slate-100/95 to-slate-200/95 items-center justify-center">
                            <div className="text-center p-8">
                              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                                {steps[2].icon}
                              </div>
                              <h3 className="text-slate-800 text-xl font-bold mb-2">Step 3: Submit & Preview</h3>
                              <p className="text-slate-600 text-sm mb-4">Screenshot of submit action and FIR preview</p>
                              <div className="inline-flex items-center gap-2 bg-cyan-500/10 rounded-full px-4 py-2 text-cyan-400 text-xs">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                <span>Add your screenshot here</span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-4 left-4">
                            <Badge className={`${getBadgeStyles(steps[2])} text-lg font-bold px-4 py-2 rounded-full`}>
                              {steps[2].status === 'completed' ? <CheckCircle className="h-5 w-5 mr-2" /> : null}
                              3
                            </Badge>
                          </div>
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                            <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm rounded-full px-4 py-2 text-cyan-400 text-sm">
                              <RotateCcw className="h-4 w-4" />
                              <span>Click to see details</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
              
              {/* Step 4 - Submit + Portal */}
              <div className="relative">
                <div 
                  className={`relative h-80 cursor-pointer transition-transform duration-700 transform-gpu ${
                    flippedCards.has(4) ? 'rotate-y-180' : ''
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                  onClick={() => toggleCard(4)}
                >
                  {/* Front Side - Text Content */}
                  <div className={`absolute inset-0 w-full h-full backface-hidden ${flippedCards.has(4) ? 'hidden' : 'block'}`}>
                    <Card className={`${getStepStyles(steps[3])} bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-2 border-cyan-500/20 shadow-2xl h-full`}>
                      <CardContent className="p-6 h-full flex flex-col justify-center">
                        <div className="text-center">
                          <div className="mb-6">
                            <Badge className={`${getBadgeStyles(steps[3])} text-lg font-bold px-4 py-2 rounded-full`}>
                              {steps[3].status === 'completed' ? <CheckCircle className="h-5 w-5 mr-2" /> : null}
                              4
                            </Badge>
                          </div>
                          <div className={`p-4 rounded-full mx-auto mb-4 w-16 h-16 flex items-center justify-center ${steps[3].status === 'completed' ? 'bg-emerald-500/20' : steps[3].status === 'current' ? 'bg-cyan-500/20' : 'bg-slate-500/20'}`}>
                            {steps[3].icon}
                          </div>
                          <h3 className={`text-2xl font-bold mb-4 ${steps[3].status === 'completed' ? 'text-emerald-400' : steps[3].status === 'current' ? 'text-cyan-400' : 'text-slate-400'}`}>
                            {steps[3].title}
                          </h3>
                          <p className="text-slate-300 leading-relaxed mb-6">
                            {steps[3].description}
                          </p>
                          <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm">
                            <RotateCcw className="h-4 w-4" />
                            <span>Click to see image</span>
                          </div>
                          <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                            <div className="flex items-center justify-center gap-2 text-blue-400">
                              <ExternalLink className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                Login with your credentials to submit complaint
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Back Side - Image Content */}
                  <div className={`absolute inset-0 w-full h-full backface-hidden ${flippedCards.has(4) ? 'block' : 'hidden'}`} style={{ transform: 'rotateY(180deg)' }}>
                    <Card className={`${getStepStyles(steps[3])} bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-2 border-cyan-500/20 shadow-2xl h-full`}>
                      <CardContent className="p-0 h-full">
                        <div className="relative h-full overflow-hidden rounded-xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/5 to-slate-100/5"></div>
                          <img 
                            src={steps[3].image} 
                            alt={steps[3].title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling!.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-full bg-gradient-to-br from-slate-100/95 to-slate-200/95 items-center justify-center">
                            <div className="text-center p-8">
                              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                                {steps[3].icon}
                              </div>
                              <h3 className="text-slate-800 text-xl font-bold mb-2">Step 4: Portal Login</h3>
                              <p className="text-slate-600 text-sm mb-4">Screenshot of government portal login page</p>
                              <div className="inline-flex items-center gap-2 bg-cyan-500/10 rounded-full px-4 py-2 text-cyan-400 text-xs">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                <span>Add your screenshot here</span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-4 left-4">
                            <Badge className={`${getBadgeStyles(steps[3])} text-lg font-bold px-4 py-2 rounded-full`}>
                              {steps[3].status === 'completed' ? <CheckCircle className="h-5 w-5 mr-2" /> : null}
                              4
                            </Badge>
                          </div>
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                            <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm rounded-full px-4 py-2 text-cyan-400 text-sm">
                              <RotateCcw className="h-4 w-4" />
                              <span>Click to see details</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>

            {/* Curved Arrows - Removed for cleaner design */}
            {/* <div className="absolute inset-0 pointer-events-none">
              Arrow elements removed for cleaner look
            </div> */}
          </div>
      </div>

      {/* Progress Tracker */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 border-2 border-cyan-500/20 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Your Progress</h3>
                <p className="text-slate-400">Track your journey through the FIR generation process</p>
        </div>
              
              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
          </div>
                
                {/* Progress Markers */}
                <div className="flex justify-between mt-4">
                  {[0, 25, 50, 75, 100].map((percentage) => (
                    <div key={percentage} className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mb-2 transition-all duration-500 ${
                        getProgressPercentage() >= percentage 
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/30' 
                          : 'bg-slate-600'
                      }`}></div>
                      <span className="text-xs text-slate-400 font-medium">{percentage}%</span>
              </div>
            ))}
          </div>
              </div>

              {/* Current Step Info */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 bg-cyan-500/10 rounded-full px-4 py-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-cyan-400 font-medium">
                    Currently on Step {currentStep} of 4
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FIRProcessFlow;