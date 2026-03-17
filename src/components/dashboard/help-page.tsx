'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  HelpCircle,
  Book,
  MessageCircle,
  Mail,
  Phone,
  Video,
  FileText,
  ExternalLink,
  Search,
  ChevronRight,
} from 'lucide-react';

const faqs = [
  {
    question: 'How often does data sync from connected platforms?',
    answer: 'Data syncs automatically at different intervals depending on the data type. Orders and transactions sync every 5 minutes, product catalogs every hour, and a full data warehouse refresh occurs daily at 2 AM. You can also trigger manual syncs from the Data Sources page.',
  },
  {
    question: 'How do I connect a new sales channel?',
    answer: 'Navigate to the Integrations page, click "Add Integration", and select the platform you want to connect. You\'ll need to provide API credentials or OAuth authorization depending on the platform. Our setup wizard will guide you through the process.',
  },
  {
    question: 'Can I customize the dashboard views?',
    answer: 'Yes! You can filter data by brand, platform, and time range using the controls in the header. Settings can be configured to change default views, currency display, and notification preferences.',
  },
  {
    question: 'How accurate is the AI Assistant?',
    answer: 'The AI Assistant is trained on your business data and can provide accurate insights for most queries. However, for complex financial decisions, we recommend cross-referencing with the detailed dashboard views. The AI learns and improves over time based on your usage patterns.',
  },
  {
    question: 'What metrics are used for ROAS calculation?',
    answer: 'ROAS (Return on Ad Spend) is calculated as Total Revenue from Ads divided by Total Ad Spend. We attribute conversions using a last-click attribution model with a 7-day window. Custom attribution models are available in Settings.',
  },
  {
    question: 'How do I export data for external analysis?',
    answer: 'Each dashboard has an export button that allows you to download data in CSV or Excel format. You can also use the API to pull data programmatically. Contact your administrator for API access.',
  },
  {
    question: 'Can multiple users access the platform?',
    answer: 'Yes, DataHub supports multiple users with different roles (Admin, Executive, Analyst). Each role has different permissions for viewing and editing data. User management is available in Settings for Admin users.',
  },
  {
    question: 'How is my data secured?',
    answer: 'All data is encrypted at rest and in transit using industry-standard encryption. We use OAuth 2.0 for platform connections, and sensitive credentials are stored using AES-256 encryption. We\'re SOC 2 Type II certified.',
  },
];

const resources = [
  {
    title: 'Getting Started Guide',
    description: 'Learn the basics of DataHub',
    icon: Book,
    link: '#',
  },
  {
    title: 'Video Tutorials',
    description: 'Watch step-by-step tutorials',
    icon: Video,
    link: '#',
  },
  {
    title: 'API Documentation',
    description: 'Technical documentation for developers',
    icon: FileText,
    link: '#',
  },
  {
    title: 'Release Notes',
    description: 'See what\'s new in DataHub',
    icon: ExternalLink,
    link: '#',
  },
];

export function HelpPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">Find answers and get support for DataHub</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search for help articles, FAQs, tutorials..." 
              className="pl-10 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {resources.map((resource) => (
          <Card key={resource.title} className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <resource.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{resource.title}</p>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 mb-4">
                <MessageCircle className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Chat with our support team in real-time
              </p>
              <Button className="w-full">Start Chat</Button>
              <p className="text-xs text-muted-foreground mt-2">
                Available Mon-Fri, 9AM-6PM SGT
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Send us an email and we'll respond within 24 hours
              </p>
              <Button variant="outline" className="w-full">
                support@datahub-ctg.com
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 mb-4">
                <Phone className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Call our dedicated support line
              </p>
              <Button variant="outline" className="w-full">
                +65 1234 5678
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Enterprise plans only
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            System Status
            <Badge className="bg-emerald-500">All Systems Operational</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Dashboard', status: 'operational' },
              { name: 'Data Sync', status: 'operational' },
              { name: 'API Services', status: 'operational' },
              { name: 'AI Assistant', status: 'operational' },
            ].map((service) => (
              <div key={service.name} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="font-medium">{service.name}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-muted-foreground capitalize">{service.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">DataHub by CTG</p>
              <p className="text-sm text-muted-foreground">Version 2.1.0 • Last updated: January 2025</p>
            </div>
            <Button variant="outline">
              Check for Updates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
