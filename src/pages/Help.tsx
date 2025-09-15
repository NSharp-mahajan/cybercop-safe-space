import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  HelpCircle,
  Search,
  BookOpen,
  MessageCircle,
  Phone,
  Mail,
  Shield,
  FileText,
  Lock,
  AlertTriangle,
  Users,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      title: "Getting Started",
      icon: Shield,
      faqs: [
        {
          question: "How do I create my first FIR report?",
          answer: "Navigate to the FIR Generator page, fill in your personal details and incident information, then click 'Generate & Download FIR' to create your report."
        },
        {
          question: "What information do I need for incident reporting?",
          answer: "You'll need your personal details (name, phone, email), incident details (date, time, type), and a detailed description of what happened."
        },
        {
          question: "Is my data secure on CyberCop?",
          answer: "Yes, all data is encrypted and we follow industry-standard security practices. Your personal information is never shared with third parties."
        }
      ]
    },
    {
      title: "Password Security",
      icon: Lock,
      faqs: [
        {
          question: "What makes a password strong?",
          answer: "A strong password should be at least 8 characters long, contain uppercase and lowercase letters, numbers, and special characters, and not be a common password."
        },
        {
          question: "How often should I change my passwords?",
          answer: "Change passwords every 3-6 months, or immediately if you suspect they may have been compromised."
        },
        {
          question: "Should I use the same password for multiple accounts?",
          answer: "Never use the same password across multiple accounts. Each account should have a unique, strong password."
        }
      ]
    },
    {
      title: "Incident Reporting",
      icon: FileText,
      faqs: [
        {
          question: "What types of incidents can I report?",
          answer: "You can report online fraud, identity theft, cyberbullying, phishing, ransomware attacks, data breaches, and other cybersecurity incidents."
        },
        {
          question: "Do I need evidence to file a report?",
          answer: "While evidence helps strengthen your case, it's not mandatory. You can describe any evidence you have in the evidence description field."
        },
        {
          question: "What happens after I submit a FIR?",
          answer: "Take the generated FIR to your nearest police station or cyber crime cell for official registration and investigation."
        }
      ]
    }
  ];

  const resources = [
    {
      title: "Cybersecurity Best Practices Guide",
      description: "Comprehensive guide to staying safe online",
      type: "Guide",
      icon: BookOpen,
    },
    {
      title: "Common Scam Types & Prevention",
      description: "Learn about prevalent scam tactics and how to avoid them",
      type: "Article",
      icon: AlertTriangle,
    },
    {
      title: "Password Manager Setup",
      description: "Step-by-step guide to setting up a password manager",
      type: "Tutorial",
      icon: Lock,
    },
    {
      title: "Social Media Security Settings",
      description: "Secure your social media accounts properly",
      type: "Guide",
      icon: Users,
    }
  ];

  const contactMethods = [
    {
      method: "Live Chat",
      description: "Get instant help from our support team",
      icon: MessageCircle,
      availability: "24/7",
      action: "Start Chat",
      disabled: true, // Coming soon
    },
    {
      method: "Email Support",
      description: "Send us detailed questions or issues",
      icon: Mail,
      availability: "Response in 24h",
      action: "Send Email",
      contact: "support@cybercop.in",
    },
    {
      method: "Phone Support",
      description: "Speak directly with our security experts",
      icon: Phone,
      availability: "Mon-Fri 9AM-6PM",
      action: "Call Now",
      contact: "+91-1800-CYBER-HELP",
    },
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10 glow-primary">
              <HelpCircle className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-primary bg-clip-text text-transparent">Help Center</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to your questions and get the support you need
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8 border-border/40">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 transition-glow focus:glow-primary"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            
            {(searchQuery ? filteredFAQs : faqCategories).map((category, categoryIndex) => (
              <Card key={categoryIndex} className="border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5 text-primary" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => (
                    <div
                      key={faqIndex}
                      className="border border-border/40 rounded-lg p-4 transition-all hover:bg-muted/30"
                    >
                      <h3 className="font-semibold text-primary mb-2 flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 text-muted-foreground" />
                        {faq.question}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed pl-6">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Support */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Need more help? Reach out to our team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactMethods.map((method, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-muted/30 transition-all hover:bg-muted/50"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <method.icon className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{method.method}</h4>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                        {method.contact && (
                          <p className="text-xs text-primary mt-1">{method.contact}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {method.availability}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={method.disabled}
                        className="text-xs transition-glow hover:glow-primary"
                      >
                        {method.disabled ? "Coming Soon" : method.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Resources */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle>Helpful Resources</CardTitle>
                <CardDescription>
                  Guides and articles to enhance your security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {resources.map((resource, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-muted/30 transition-all hover:bg-muted/50 cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <resource.icon className="h-4 w-4 text-primary mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {resource.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">{resource.description}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {resource.type}
                        </Badge>
                      </div>
                      <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Support Form */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle>Quick Question</CardTitle>
                <CardDescription>
                  Send us a message for quick assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    className="transition-glow focus:glow-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your question or issue..."
                    className="min-h-[80px] transition-glow focus:glow-primary"
                  />
                </div>
                <Button className="w-full glow-primary transition-glow" disabled>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send Message (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;