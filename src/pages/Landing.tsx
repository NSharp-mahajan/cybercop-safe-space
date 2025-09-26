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
  Phone,
  MessageSquare,
  BookOpen,
  Users,
  Zap,
  CheckCircle,
  Award,
  Globe,
  ArrowRight,
} from "lucide-react";
import QuickScamReport from "@/components/QuickScamReport";
import Robot from "@/components/Robot";

const Landing = () => {
  const features = [
    {
      icon: FileText,
      title: "Smart FIR Generator",
      description: "AI-powered First Information Report generation with multi-language support and legal templates",
      status: "Available",
      href: "/fir-generator",
    },
    {
      icon: Lock,
      title: "Advanced Password Security",
      description: "Real-time password strength analysis with breach detection and security recommendations",
      status: "Available",
      href: "/password-checker",
    },
    {
      icon: Bot,
      title: "AI Security Assistant",
      description: "24/7 intelligent cybersecurity guidance with natural language processing",
      status: "Available",
      href: "/chat",
    },
    {
      icon: Map,
      title: "Live Threat Map",
      description: "Real-time visualization of cyber threats and scams across India with predictive analytics",
      status: "Available",
      href: "/scam-map",
    },
    {
      icon: Eye,
      title: "OCR Fraud Detection",
      description: "Advanced document scanning with AI-powered fraud pattern recognition",
      status: "Available",
      href: "/ocr-fraud",
    },
    {
      icon: BookOpen,
      title: "Scam Intelligence Library",
      description: "Comprehensive database of 10,000+ scam patterns with prevention strategies",
      status: "Available",
      href: "/scam-library",
    },
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 border-border/40">
                <CardHeader>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 shadow-lg">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <Badge 
                      variant={feature.status === "Available" ? "default" : "secondary"}
                      className={feature.status === "Available" ? "glow-accent" : ""}
                    >
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300 mb-3">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <Link to={feature.href}>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Try Now
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Scam Report Widget */}
          <div className="mt-16 max-w-2xl mx-auto">
            <QuickScamReport />
          </div>
        </div>
      </section>




      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">CyberCop</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                India's premier cybersecurity platform providing comprehensive protection 
                against digital threats and fraud.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center hover:bg-primary/30 transition-colors cursor-pointer">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center hover:bg-primary/30 transition-colors cursor-pointer">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center hover:bg-primary/30 transition-colors cursor-pointer">
                  <Users className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/fir-generator" className="text-slate-300 hover:text-primary transition-colors">FIR Generator</Link></li>
                <li><Link to="/password-checker" className="text-slate-300 hover:text-primary transition-colors">Password Checker</Link></li>
                <li><Link to="/chat" className="text-slate-300 hover:text-primary transition-colors">AI Assistant</Link></li>
                <li><Link to="/scam-map" className="text-slate-300 hover:text-primary transition-colors">Threat Map</Link></li>
                <li><Link to="/scam-library" className="text-slate-300 hover:text-primary transition-colors">Scam Library</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-slate-300 hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link to="/community-reports" className="text-slate-300 hover:text-primary transition-colors">Community Reports</Link></li>
                <li><Link to="/fraud-news" className="text-slate-300 hover:text-primary transition-colors">Fraud News</Link></li>
                <li><a href="#" className="text-slate-300 hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-300 hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-slate-300">+91 1800-CYBER-COP</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="text-slate-300">support@cybercop.in</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Map className="h-4 w-4 text-primary" />
                  <span className="text-slate-300">New Delhi, India</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Landing;