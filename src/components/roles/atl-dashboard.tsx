'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, applicationsAtom, ApplicationStatus } from '@/lib/mock-data';
import { PlusCircle, Search, MapPin, Inbox, UserCheck, AlertCircle } from 'lucide-react';
import OnboardingFlow from '@/components/onboarding/onboarding-flow';
import ApplicationReview from '../onboarding/application-review';
import { User } from '@/lib/users';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const getStatusVariant = (status: ApplicationStatus) => {
  switch (status) {
    case 'Signed':
      return 'success';
    case 'Pending Supervisor':
    case 'In Review':
    case 'Pending Executive Signature':
      return 'secondary';
    case 'Rejected':
    case 'Returned to ATL':
      return 'destructive';
    case 'Submitted':
      return 'outline';
    default:
      return 'outline';
  }
};

const translateStatus = (status: ApplicationStatus) => {
    switch (status) {
        case 'Submitted': return 'Sent';
        case 'In Review': return 'Checking';
        case 'Pending Supervisor': return 'Manager Check';
        case 'Pending Executive Signature': return 'Final Check';
        case 'Signed': return 'Done';
        case 'Rejected': return 'Declined';
        case 'Returned to ATL': return 'Need Fixes';
        case 'Archived': return 'Saved';
        default: return status;
    }
}

interface AtlDashboardProps {
    user: User;
}

export default function AtlDashboard({ user }: AtlDashboardProps) {
  const [isCreatingApplication, setIsCreatingApplication] = React.useState(false);
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
  const [applications] = useAtom(applicationsAtom);
  const [searchTerm, setSearchTerm] = React.useState('');

  const myApplications = applications
    .filter(app => app.submittedBy === user.name && ['Submitted', 'Returned to ATL', 'Signed', 'Rejected', 'Pending Supervisor', 'Pending Executive Signature'].includes(app.status))
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    
  const customerLeads = applications
    .filter(app => app.submittedBy === 'Customer' && app.status === 'Submitted')
    .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());

  const filteredApplications = myApplications.filter(app => {
    return app.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
           app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           app.region.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredLeads = customerLeads.filter(app => {
    return app.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
           app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           app.region.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const applicationForReview = selectedApplication 
      ? applications.find(app => app.id === selectedApplication.id) 
      : null;

  if (isCreatingApplication) {
    return <OnboardingFlow user={user} onCancel={() => setIsCreatingApplication(false)} />;
  }

  if (applicationForReview) {
    return <ApplicationReview 
                application={applicationForReview} 
                onBack={() => setSelectedApplication(null)} 
                user={user}
            />;
  }

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
              <h2 className="text-3xl font-bold">Team Leader Home</h2>
              <p className="text-muted-foreground">Send and track requests from customers here.</p>
          </div>
          <Button onClick={() => setIsCreatingApplication(true)} className="shadow-lg hover:scale-105 transition-transform bg-primary text-primary-foreground font-bold">
              <PlusCircle className="mr-2 h-4 w-4" />
              Start New Sign Up
          </Button>
        </div>

        <Tabs defaultValue="my-apps" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <TabsList className="bg-muted/50 p-1">
                  <TabsTrigger value="my-apps" className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      My Work ({filteredApplications.length})
                  </TabsTrigger>
                  <TabsTrigger value="leads" className="flex items-center gap-2">
                      <Inbox className="h-4 w-4" />
                      Customer Sign Ups ({filteredLeads.length})
                      {filteredLeads.length > 0 && <Badge variant="destructive" className="ml-1 h-2 w-2 p-0 rounded-full animate-pulse" />}
                  </TabsTrigger>
              </TabsList>
              <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                      placeholder="Search by name or place..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>

          <TabsContent value="my-apps">
              <Card className="border-none shadow-md overflow-hidden">
                  <CardHeader className="bg-muted/30">
                      <CardTitle>Work Tracker</CardTitle>
                      <CardDescription>See what is happening with your requests.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                      {filteredApplications.length > 0 ? (
                          <Table>
                              <TableHeader>
                                  <TableRow className="bg-muted/10">
                                      <TableHead className="pl-6">ID</TableHead>
                                      <TableHead>Customer Name</TableHead>
                                      <TableHead>Region</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Latest Update</TableHead>
                                      <TableHead className="text-right pr-6">Action</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {filteredApplications.map((app) => {
                                      const lastHistory = app.history[app.history.length - 1];
                                      return (
                                          <TableRow key={app.id} className="hover:bg-muted/5 group">
                                              <TableCell className="font-mono text-xs pl-6">{app.id}</TableCell>
                                              <TableCell>
                                                  <div className="font-medium">{app.clientName}</div>
                                                  <div className="text-[10px] text-muted-foreground">{app.clientType}</div>
                                              </TableCell>
                                              <TableCell>
                                                  <div className="flex items-center gap-1">
                                                      <MapPin className="h-3 w-3 text-muted-foreground" />
                                                      <span className="text-xs">{app.region}</span>
                                                  </div>
                                              </TableCell>
                                              <TableCell>
                                                  <Badge variant={getStatusVariant(app.status)}>{translateStatus(app.status)}</Badge>
                                              </TableCell>
                                              <TableCell>
                                                  <div className="flex items-center gap-2">
                                                      <div className="text-xs truncate max-w-[150px]">
                                                          <span className="text-muted-foreground">{lastHistory.action}</span>
                                                          {lastHistory.notes && (
                                                              <Tooltip>
                                                                  <TooltipTrigger asChild>
                                                                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 text-destructive">
                                                                          <AlertCircle className="h-3 w-3" />
                                                                      </Button>
                                                                  </TooltipTrigger>
                                                                  <TooltipContent className="max-w-xs">
                                                                      <p className="font-bold mb-1">Fix Needed:</p>
                                                                      <p className="text-xs">{lastHistory.notes}</p>
                                                                  </TooltipContent>
                                                              </Tooltip>
                                                          )}
                                                      </div>
                                                  </div>
                                              </TableCell>
                                              <TableCell className="text-right pr-6">
                                                  <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>
                                                      {app.status === 'Returned to ATL' ? 'Fix It' : 'View'}
                                                  </Button>
                                              </TableCell>
                                          </TableRow>
                                      );
                                  })}
                              </TableBody>
                          </Table>
                      ) : (
                          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                              <p>Nothing found here yet.</p>
                          </div>
                      )}
                  </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="leads">
              <Card className="border-primary/20 bg-primary/5 shadow-md overflow-hidden">
                  <CardHeader className="bg-primary/10">
                      <CardTitle className="flex items-center gap-2">
                          <Inbox className="h-5 w-5 text-primary" />
                          New Customer Sign Ups
                      </CardTitle>
                      <CardDescription className="text-primary/80">These people signed up themselves. Please pick them up and check their details.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                      {filteredLeads.length > 0 ? (
                          <Table>
                              <TableHeader>
                                  <TableRow className="bg-primary/5">
                                      <TableHead className="pl-6">ID</TableHead>
                                      <TableHead>Customer / Company</TableHead>
                                      <TableHead>Region</TableHead>
                                      <TableHead>Account Type</TableHead>
                                      <TableHead>Date Sent</TableHead>
                                      <TableHead className="text-right pr-6">Action</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {filteredLeads.map((app) => (
                                      <TableRow key={app.id} className="hover:bg-primary/10 group animate-in slide-in-from-left-2 duration-300">
                                          <TableCell className="font-mono text-xs pl-6">{app.id}</TableCell>
                                          <TableCell className="font-medium">{app.clientName}</TableCell>
                                          <TableCell>
                                              <Badge variant="outline" className="font-normal bg-background">{app.region}</Badge>
                                          </TableCell>
                                          <TableCell className="text-xs">{app.clientType}</TableCell>
                                          <TableCell className="text-xs text-muted-foreground">{app.submittedDate}</TableCell>
                                          <TableCell className="text-right pr-6">
                                              <Button variant="default" size="sm" onClick={() => setSelectedApplication(app)}>Open Request</Button>
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      ) : (
                          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                              <Inbox className="h-12 w-12 mb-2 opacity-20" />
                              <p>No new customer sign ups right now.</p>
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
