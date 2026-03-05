'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, applicationsAtom, ApplicationStatus } from '@/lib/mock-data';
import { PlusCircle, Search, MapPin, Inbox, UserCheck } from 'lucide-react';
import OnboardingFlow from '@/components/onboarding/onboarding-flow';
import ApplicationReview from '../onboarding/application-review';
import { User } from '@/lib/users';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold">ATL Dashboard</h2>
            <p className="text-muted-foreground">Submit, track, and process customer self-service applications.</p>
        </div>
        <Button onClick={() => setIsCreatingApplication(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Application
        </Button>
      </div>

      <Tabs defaultValue="my-apps" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <TabsList>
                <TabsTrigger value="my-apps" className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    My Applications ({filteredApplications.length})
                </TabsTrigger>
                <TabsTrigger value="leads" className="flex items-center gap-2">
                    <Inbox className="h-4 w-4" />
                    Customer Inbox ({filteredLeads.length})
                    {filteredLeads.length > 0 && <Badge variant="destructive" className="ml-1 h-2 w-2 p-0 rounded-full animate-pulse" />}
                </TabsTrigger>
            </TabsList>
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search ID, Client, or Region..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <TabsContent value="my-apps">
            <Card>
                <CardHeader>
                    <CardTitle>Application Pipeline</CardTitle>
                    <CardDescription>Applications you initiated and are currently tracking.</CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredApplications.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>App ID</TableHead>
                                    <TableHead>Client Name</TableHead>
                                    <TableHead>Region</TableHead>
                                    <TableHead>Client Type</TableHead>
                                    <TableHead>Submission Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredApplications.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-mono text-xs">{app.id}</TableCell>
                                        <TableCell className="font-medium">{app.clientName}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs">{app.region}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{app.clientType}</TableCell>
                                        <TableCell>{app.submittedDate}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>View</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
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
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Inbox className="h-5 w-5" />
                        Incoming Customer Leads
                    </CardTitle>
                    <CardDescription>Applications submitted by customers via the self-service portal. Review and forward them to Back Office.</CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredLeads.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>App ID</TableHead>
                                    <TableHead>Client Name</TableHead>
                                    <TableHead>Region</TableHead>
                                    <TableHead>Client Type</TableHead>
                                    <TableHead>Submission Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLeads.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-mono text-xs">{app.id}</TableCell>
                                        <TableCell className="font-medium">{app.clientName}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{app.region}</Badge>
                                        </TableCell>
                                        <TableCell>{app.clientType}</TableCell>
                                        <TableCell>{app.submittedDate}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="default" size="sm" onClick={() => setSelectedApplication(app)}>Review & Claim</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                            <p>No incoming customer leads at this time.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
