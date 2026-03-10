'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, applicationsAtom, ApplicationStatus } from '@/lib/mock-data';
import { PlusCircle, Search, UserCheck } from 'lucide-react';
import OnboardingFlow from '@/components/onboarding/onboarding-flow';
import ApplicationReview from '../onboarding/application-review';
import { User } from '@/lib/users';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';

const getStatusVariant = (status: ApplicationStatus) => {
  switch (status) {
    case 'Signed': return 'success';
    case 'Pending Supervisor':
    case 'In Review':
    case 'Pending Executive Signature': return 'secondary';
    case 'Rejected':
    case 'Returned to ATL': return 'destructive';
    default: return 'outline';
  }
};

interface BusinessBankingDashboardProps {
    user: User;
}

export default function BusinessBankingDashboard({ user }: BusinessBankingDashboardProps) {
  const [isCreatingApplication, setIsCreatingApplication] = React.useState(false);
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
  const [applications] = useAtom(applicationsAtom);
  const [searchTerm, setSearchTerm] = React.useState('');

  const myApplications = applications
    .filter(app => app.submittedBy === user.name)
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

  const filteredApplications = myApplications.filter(app => {
    return app.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
           app.clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const applicationForReview = selectedApplication 
      ? applications.find(app => app.id === selectedApplication.id) 
      : null;

  if (isCreatingApplication) {
    return <OnboardingFlow user={user} onCancel={() => setIsCreatingApplication(false)} />;
  }

  if (applicationForReview) {
    return <ApplicationReview application={applicationForReview} onBack={() => setSelectedApplication(null)} user={user} />;
  }

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
              <h2 className="text-3xl font-bold">Business Banking Portal</h2>
              <p className="text-muted-foreground">Manage corporate account onboarding and relationship pipeline.</p>
          </div>
          <Button onClick={() => setIsCreatingApplication(true)} className="bg-primary text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Corporate App
          </Button>
        </div>

        <Tabs defaultValue="my-apps" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <TabsList className="bg-muted/50 p-1">
                  <TabsTrigger value="my-apps" className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Portfolio ({filteredApplications.length})
                  </TabsTrigger>
              </TabsList>
              <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                      placeholder="Search Client Name..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>

          <TabsContent value="my-apps">
              <Card className="border-none shadow-md overflow-hidden">
                  <CardHeader className="bg-muted/30">
                      <CardTitle>Business Portfolio Tracking</CardTitle>
                      <CardDescription>Status oversight for your managed business accounts.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                      {filteredApplications.length > 0 ? (
                          <Table>
                              <TableHeader>
                                  <TableRow className="bg-muted/10">
                                      <TableHead className="pl-6">Client ID</TableHead>
                                      <TableHead>Legal Entity</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead className="text-right pr-6">Action</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {filteredApplications.map((app) => (
                                      <TableRow key={app.id} className="hover:bg-muted/5">
                                          <TableCell className="font-mono text-xs pl-6">{app.id}</TableCell>
                                          <TableCell>
                                              <div className="font-medium">{app.clientName}</div>
                                              <div className="text-[10px] text-muted-foreground">{app.clientType}</div>
                                          </TableCell>
                                          <TableCell>
                                              <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                                          </TableCell>
                                          <TableCell className="text-right pr-6">
                                              <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(app)}>Review</Button>
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      ) : (
                          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground italic">
                              <p>Portfolio is currently empty.</p>
                          </div>
                      )}
                  </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
