import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Shield, Zap, Scan, BookOpen, Trophy } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: Shield },
    { name: "FIR Generator", href: "/fir-generator", icon: Zap },
    { name: "Password Check", href: "/password-checker", icon: Shield },
    { name: "OCR Fraud Detect", href: "/ocr-fraud", icon: Scan },
    { name: "Scam Library", href: "/scam-library", icon: BookOpen },
    { name: "Law Learning", href: "/law-learning", icon: Trophy },
    { name: "Dashboard", href: "/dashboard", icon: Shield },
    { name: "Help", href: "/help", icon: Shield },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 transition-glow hover:glow-primary">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              CyberCop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={isActive(item.href) ? "default" : "ghost"}
                asChild
                className={`transition-glow ${
                  isActive(item.href) ? "glow-primary" : "hover:glow-primary"
                }`}
              >
                <Link to={item.href} className="flex items-center space-x-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              </Button>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="transition-glow hover:glow-primary">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] border-l border-border/40">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Button
                      key={item.name}
                      variant={isActive(item.href) ? "default" : "ghost"}
                      asChild
                      className={`justify-start transition-glow ${
                        isActive(item.href) ? "glow-primary" : "hover:glow-primary"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Link to={item.href} className="flex items-center space-x-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </Button>
                  ))}
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