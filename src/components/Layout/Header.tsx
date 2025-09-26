import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { 
  Menu, 
  Shield, 
  FileText, 
  Lock, 
  Bot, 
  ScanText, 
  BookOpen, 
  BarChart3, 
  HelpCircle,
  MessageCircle,
  AlertTriangle,
  Users,
  Search,
  Home,
  MessageSquare,
  Newspaper
} from "lucide-react";
import UrlChecker from "@/components/UrlChecker";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const securityTools = [
    { name: "OCR Fraud Detection", href: "/ocr-fraud", icon: ScanText, desc: "Analyze documents for fraud" },
    { name: "Fraud Message Detector", href: "/fraud-message-detector", icon: MessageSquare, desc: "Detect fraud in WhatsApp messages" },
    { name: "Password Checker", href: "/password-checker", icon: Lock, desc: "Check password strength" },
    { name: "Report Scam", href: "/report-scam", icon: AlertTriangle, desc: "Report suspicious activities" },
  ];

  const resources = [
    { name: "Fraud News", href: "/fraud-news", icon: Newspaper, desc: "Latest cybercrime news updates" },
    { name: "Scam Library", href: "/scam-library", icon: BookOpen, desc: "Browse known scams" },
    { name: "Scam Map", href: "/scam-map", icon: Search, desc: "View cyber fraud statistics on India map" },
    { name: "Community Reports", href: "/community-reports", icon: Users, desc: "View community reports" },
    { name: "Law Learning", href: "/law-learning", icon: BookOpen, desc: "Learn cybersecurity laws" },
  ];

  const support = [
    { name: "FIR Generator", href: "/fir-generator", icon: FileText, desc: "Generate FIR reports" },
    { name: "Chat AI", href: "/chat", icon: MessageCircle, desc: "AI-powered assistance" },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3, desc: "View your dashboard" },
    { name: "Help", href: "/help", icon: HelpCircle, desc: "Get help and support" },
  ];

  const mobileNavigation = [
    ...securityTools,
    ...resources,
    ...support
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 transition-all hover:scale-105">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              CyberCop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Home Link */}
            <Button
              variant={isActive("/") ? "ghost" : "ghost"}
              asChild
              className="transition-all hover:scale-105"
            >
              <Link to="/" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span className="text-sm font-medium">Home</span>
              </Link>
            </Button>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">Security Tools</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <div className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            to="/ocr-fraud"
                          >
                            <ScanText className="h-6 w-6" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              OCR Fraud Detection
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              AI-powered document analysis to detect fraud
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                      <div className="grid gap-1">
                        {securityTools.slice(1).map((item) => (
                          <NavigationMenuLink key={item.name} asChild>
                            <Link
                              to={item.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                <item.icon className="h-4 w-4" />
                                {item.name}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {item.desc}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">Resources</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {resources.map((item) => (
                        <NavigationMenuLink key={item.name} asChild>
                          <Link
                            to={item.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm font-medium leading-none">
                              <item.icon className="h-4 w-4" />
                              {item.name}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {item.desc}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">Support</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {support.map((item) => (
                        <NavigationMenuLink key={item.name} asChild>
                          <Link
                            to={item.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm font-medium leading-none">
                              <item.icon className="h-4 w-4" />
                              {item.name}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {item.desc}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* URL Checker */}
            <div className="flex items-center">
              <UrlChecker showInput={false} size="sm" />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="transition-all hover:bg-accent">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] border-l border-border/40">
                <div className="flex flex-col space-y-1 mt-8">
                  <div className="mb-4">
                    <UrlChecker showInput={true} size="sm" />
                  </div>
                  
                  {/* Home Link for Mobile */}
                  <div className="mb-4">
                    <Button
                      variant={isActive("/") ? "default" : "ghost"}
                      asChild
                      className="w-full justify-start"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link to="/" className="flex items-center space-x-2">
                        <Home className="h-4 w-4" />
                        <span className="text-sm">Home</span>
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">Security Tools</h4>
                      {securityTools.map((item) => (
                        <Button
                          key={item.name}
                          variant={isActive(item.href) ? "default" : "ghost"}
                          asChild
                          className="w-full justify-start mb-1"
                          onClick={() => setIsOpen(false)}
                        >
                          <Link to={item.href} className="flex items-center space-x-2">
                            <item.icon className="h-4 w-4" />
                            <span className="text-sm">{item.name}</span>
                          </Link>
                        </Button>
                      ))}
                    </div>

                    <div>
                      <h4 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">Resources</h4>
                      {resources.map((item) => (
                        <Button
                          key={item.name}
                          variant={isActive(item.href) ? "default" : "ghost"}
                          asChild
                          className="w-full justify-start mb-1"
                          onClick={() => setIsOpen(false)}
                        >
                          <Link to={item.href} className="flex items-center space-x-2">
                            <item.icon className="h-4 w-4" />
                            <span className="text-sm">{item.name}</span>
                          </Link>
                        </Button>
                      ))}
                    </div>

                    <div>
                      <h4 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">Support</h4>
                      {support.map((item) => (
                        <Button
                          key={item.name}
                          variant={isActive(item.href) ? "default" : "ghost"}
                          asChild
                          className="w-full justify-start mb-1"
                          onClick={() => setIsOpen(false)}
                        >
                          <Link to={item.href} className="flex items-center space-x-2">
                            <item.icon className="h-4 w-4" />
                            <span className="text-sm">{item.name}</span>
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;