'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, applicationsAtom, ApplicationStatus } from '@/lib/mock-data';
import { PlusCircle, Search, Inbox, UserCheck, User, Building2, Landmark, ChevronDown } from 'lucide-react';
import OnboardingFlow from '@/components/onboarding/onboarding-flow';
import ApplicationReview from '../onboarding/application-review';
import { User as UserProfile } from '@/lib/users';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getStatusVariant = (status: ApplicationStatus) => {
  switch (status) {
    case 'Signed':
    case 'Archived':
      return 'success';
    case 'Pending Supervisor':
    case 'In Review':
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
        case 'Submitted': return 'Submitted';
        case 'In Review': return 'In Review';
        case 'Pending Supervisor': return 'Pending Supervisor';
        case 'Signed': return 'Signed';
        case 'Rejected': return 'Rejected';
        case 'Returned to ATL': return 'Returned to ASL';
        case 'Archived': return 'Finalized';
        default: return status;
    }
}

interface AtlDashboardProps {
    user: UserProfile;
}

export default function AtlDashboard({ user }: AtlDashboardProps) {
  const [isCreatingApplication, setIsCreatingApplication] = React.useState(false);
  const [preselectedType, setPreselectedType] = React.useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
  const [applications] = useAtom(applicationsAtom);
  const [searchTerm, setSearchTerm] = React.useState('');

  const myApplications = applications
    .filter(app => app.submittedBy === user.name && ['Submitted', 'Returned to ATL', 'Signed', 'Rejected', 'Pending Supervisor', 'Archived'].includes(app.status))
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    
  const customerLeads = applications
    .filter(app => app.submittedBy === 'Customer' && app.status === 'Submitted')
    .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());

  const filteredApplications = myApplications.filter(app => {
    return app.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
           app.clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredLeads = customerLeads.filter(app => {
    return app.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
           app.clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleStartApplication = (type: string) => {
    setPreselectedType(type);
    setIsCreatingApplication(true);
  };

  const applicationForReview = selectedApplication 
      ? applications.find(app => app.id === selectedApplication.id) 
      : null;

  if (isCreatingApplication) {
    return <OnboardingFlow user={user} onCancel={() => { setIsCreatingApplication(false); setPreselectedType(null); }} preselectedType={preselectedType} />;
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
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
              <h2 className="text-3xl font-bold">ASL Dashboard</h2>
              <p className="text-muted-foreground">Manage your onboarding portfolio and process new leads.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
              {/* Personal Accounts Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 px-6 border-primary/20 hover:bg-primary/5 font-bold shadow-sm">
                        <User className="mr-2 h-4 w-4 text-primary" />
                        Personal Accounts
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Personal Banking</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer py-3" onClick={() => handleStartApplication('Individual Accounts')}>
                        1. Individual Accounts
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-3" onClick={() => handleStartApplication('Sole traders')}>
                        2. Sole traders
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Corporate Banking Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 px-6 border-secondary/20 hover:bg-secondary/5 font-bold shadow-sm">
                        <Building2 className="mr-2 h-4 w-4 text-secondary" />
                        Corporate Banking
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>Corporate Entities</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer py-3" onClick={() => handleStartApplication('Private Limited (Pvt) Company')}>
                        1. Private Limited (Pvt) Company
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-3" onClick={() => handleStartApplication('Private Business Corporate (PBC)')}>
                        2. Private Business Corporate (PBC)
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-3" onClick={() => handleStartApplication('Public Limited company')}>
                        3. Public Limited company
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-3" onClick={() => handleStartApplication('Partnerships')}>
                        4. Partnerships
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-3" onClick={() => handleStartApplication('Investment Group')}>
                        5. Investment Group
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-3" onClick={() => handleStartApplication('Parastatal')}>
                        6. Parastatal
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Institutions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 px-6 border-accent/20 hover:bg-accent/5 font-bold shadow-sm">
                        <Landmark className="mr-2 h-4 w-4 text-accent" />
                        Institutions
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Institutional Classes</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer py-3" onClick={() => handleStartApplication('NGO')}>
                        1. NGO
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-3" onClick={() => handleStartApplication('Church')}>
                        2. Church
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-3" onClick={() => handleStartApplication('School')}>
                        3. School
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-3" onClick={() => handleStartApplication('Society')}>
                        4. Society
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-3" onClick={() => handleStartApplication('Club/ Association')}>
                        5. Club/ Association
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="my-apps" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <TabsList className="bg-muted/50 p-1">
                  <TabsTrigger value="my-apps" className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      My Applications ({filteredApplications.length})
                  </TabsTrigger>
                  <TabsTrigger value="leads" className="flex items-center gap-2">
                      <Inbox className="h-4 w-4" />
                      Pending Registrations ({filteredLeads.length})
                      {filteredLeads.length > 0 && <Badge variant="destructive" className="ml-1 h-2 w-2 p-0 rounded-full animate-pulse" />}
                  </TabsTrigger>
              </TabsList>
              <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                      placeholder="Search Client..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>

          <TabsContent value="my-apps">
              <Card className="border-none shadow-md overflow-hidden">
                  <CardHeader className="bg-muted/30">
                      <CardTitle>Active Portfolio</CardTitle>
                      <CardDescription>Status tracking for your applications.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                      {filteredApplications.length > 0 ? (
                          <Table>
                              <TableHeader>
                                  <TableRow className="bg-muted/10">
                                      <TableHead className="pl-6">ID</TableHead>
                                      <TableHead>Client Name</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead className="text-right pr-6">Actions</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {filteredApplications.map((app) => {
                                      return (
                                          <TableRow key={app.id} className="hover:bg-muted/5 group">
                                              <TableCell className="font-mono text-xs pl-6">{app.id}</TableCell>
                                              <TableCell>
                                                  <div className="font-medium">{app.clientName}</div>
                                                  <div className="text-[10px] text-muted-foreground">{app.clientType}</div>
                                              </TableCell>
                                              <TableCell>
                                                  <Badge variant={getStatusVariant(app.status)}>{translateStatus(app.status)}</Badge>
                                              </TableCell>
                                              <TableCell className="text-right pr-6">
                                                  <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>
                                                      {app.status === 'Returned to ATL' ? 'Edit' : 'View'}
                                                  </Button>
                                              </TableCell>
                                          </TableRow>
                                      );
                                  })}
                              </TableBody>
                          </Table>
                      ) : (
                          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                              <p>No active applications found.</p>
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
                          New Sign Ups
                      </CardTitle>
                      <CardDescription className="text-primary/80">Pending registrations from customer portals.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                      {filteredLeads.length > 0 ? (
                          <Table>
                              <TableHeader>
                                  <TableRow className="bg-primary/5">
                                      <TableHead className="pl-6">Lead ID</TableHead>
                                      <TableHead>Customer</TableHead>
                                      <TableHead>Category</TableHead>
                                      <TableHead>Date</TableHead>
                                      <TableHead className="text-right pr-6">Actions</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {filteredLeads.map((app) => (
                                      <TableRow key={app.id} className="hover:bg-primary/10 group animate-in slide-in-from-left-2 duration-300">
                                          <TableCell className="font-mono text-xs pl-6">{app.id}</TableCell>
                                          <TableCell className="font-medium">{app.clientName}</TableCell>
                                          <TableCell className="text-xs">{app.clientType}</TableCell>
                                          <TableCell className="text-xs text-muted-foreground">{app.submittedDate}</TableCell>
                                          <TableCell className="text-right pr-6">
                                              <Button variant="default" size="sm" onClick={() => setSelectedApplication(app)}>Process</Button>
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      ) : (
                          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                              <Inbox className="h-12 w-12 mb-2 opacity-20" />
                              <p>No new customer leads.</p>
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
