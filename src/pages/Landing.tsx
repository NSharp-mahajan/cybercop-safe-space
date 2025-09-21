import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Shield,
  FileText,
  Bot,
  Map,
  Eye,
  Lock,
  GraduationCap,
  Phone,
  MessageSquare,
  BookOpen,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import QuickScamReport from "@/components/QuickScamReport";
import Robot from "@/components/Robot";

const Landing = () => {
  const features = [
    {
      icon: FileText,
      title: "FIR Generator",
      description: "Generate First Information Reports for cyber incidents with multi-language support",
      status: "Available",
      href: "/fir-generator",
    },
    {
      icon: Lock,
      title: "Password Strength Checker",
      description: "Analyze and strengthen your password security",
      status: "Available",
      href: "/password-checker",
    },
    {
      icon: Bot,
      title: "AI Chatbot Assistant",
      description: "24/7 AI-powered cybersecurity guidance and support",
      status: "Available",
      href: "/chat",
    },
    {
      icon: Map,
      title: "Scam Map",
      description: "Real-time visualization of scams and frauds across regions",
      status: "Coming Soon",
    },
    {
      icon: Eye,
      title: "OCR + Fraud Detection",
      description: "Scan and analyze documents for fraudulent content",
      status: "Available",
      href: "/ocr-fraud",
    },
    {
      icon: GraduationCap,
      title: "Gamified Law Learning",
      description: "Interactive cybersecurity law education platform",
      status: "Coming Soon",
    },
    {
      icon: Phone,
      title: "Fraud Call Detection",
      description: "AI-powered analysis of suspicious phone calls",
      status: "Coming Soon",
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Bot",
      description: "WhatsApp integration for instant cybersecurity alerts",
      status: "Coming Soon",
    },
    {
      icon: BookOpen,
      title: "Scam Awareness Library",
      description: "Comprehensive database of known scam patterns and prevention",
      status: "Available",
      href: "/scam-library",
    },
    {
      icon: Users,
      title: "Community Forum",
      description: "Connect with cybersecurity experts and share experiences",
      status: "Coming Soon",
    },
  ];

  const stats = [
    { label: "Active Users Protected", value: "10K+", icon: Shield },
    { label: "Threats Detected", value: "50K+", icon: AlertTriangle },
    { label: "Incidents Resolved", value: "5K+", icon: CheckCircle },
    { label: "Security Reports Generated", value: "25K+", icon: FileText },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 gradient-dark opacity-80" />
        <div className="relative container mx-auto">
          <div className="grid lg:grid-cols-[1.4fr_0.6fr] gap-3 lg:gap-4 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <div className="mb-8 flex justify-center lg:justify-start">
                <Badge variant="secondary" className="px-4 py-2 text-sm glow-primary">
                  <Zap className="mr-2 h-4 w-4" />
                  India's Premier Cybersecurity Platform
                </Badge>
              </div>
              
              <h1 className="mb-6 text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="gradient-primary bg-clip-text text-transparent">CyberCop</span>
                <br />
                <span className="text-foreground">Your Digital Guardian</span>
              </h1>
              
              <p className="mb-8 text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Complete cybersecurity protection suite with AI-powered threat detection, 
                incident reporting, and community-driven security solutions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" asChild className="glow-primary transition-glow">
                  <Link to="/fir-generator">
                    <FileText className="mr-2 h-5 w-5" />
                    Generate FIR
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="transition-glow hover:glow-accent">
                  <Link to="/dashboard">
                    <Shield className="mr-2 h-5 w-5" />
                    Security Dashboard
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column - Robot Animation */}
            <div className="flex justify-center lg:justify-end lg:mr-8 xl:mr-12">
              <div className="relative robot-container">
                {/* Glowing background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-3xl transform scale-150 robot-pulse-bg" />
                <Robot 
                  size="large" 
                  className="relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-300" 
                />
                {/* Floating elements around robot */}
                <div className="absolute top-8 right-8 w-6 h-6 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                <div className="absolute bottom-12 left-8 w-4 h-4 bg-blue-500/30 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
                <div className="absolute top-20 left-4 w-3 h-3 bg-accent/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y border-border/40">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10 glow-primary">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              {/* <Robot size="small" className="opacity-60" /> */}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Comprehensive <span className="gradient-primary bg-clip-text text-transparent">Security Suite</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From incident reporting to AI-powered threat detection, we provide everything you need 
              to stay secure in the digital world.
            </p>
          </div>

          {/* <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group transition-all duration-300 hover:glow-primary border-border/40">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:glow-primary transition-all">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge 
                      variant={feature.status === "Available" ? "default" : "secondary"}
                      className={feature.status === "Available" ? "glow-accent" : ""}
                    >
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {feature.href ? (
                    <Button asChild className="w-full transition-glow hover:glow-primary">
                      <Link to={feature.href}>
                        Try Now
                      </Link>
                    </Button>
                  ) : (
                    <Button disabled className="w-full">
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div> */}

          {/* Quick Scam Report Widget */}
          <div className="mt-16 max-w-2xl mx-auto">
            <QuickScamReport />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-4 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Secure Your Digital Life?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust CyberCop for their cybersecurity needs. 
            Start protecting yourself today.
          </p>
          <Button size="lg" asChild className="glow-primary transition-glow">
            <Link to="/fir-generator">
              <Shield className="mr-2 h-5 w-5" />
              Get Started Now
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;