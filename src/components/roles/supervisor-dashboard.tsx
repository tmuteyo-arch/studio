
'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, applicationsAtom, ApplicationStatus } from '@/lib/mock-data';
import { AlertCircle, AreaChart, CheckCircle2, ClipboardList, Inbox, Search, Users, FileDown, ShieldCheck, UserCheck, Archive, FileSearch, Key, Fingerprint } from 'lucide-react';
import ApplicationReview from '../onboarding/application-review';
import { User, usersAtom } from '@/lib/users';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import KpiTracker from './kpi-tracker';
import AccountSummaryReport from './account-summary-report';
import ReportsTab from './reports-tab';
import BackOfficeAppraisal from './back-office-appraisal';

interface SupervisorDashboardProps {
    user: User;
}

const getStatusVariant = (status: ApplicationStatus) => {
  switch (status) {
    case 'Signed':
    case 'Archived':
    case 'Approved':
      return 'success';
    case 'Pending Supervisor':
    case 'Pending Compliance':
      return 'secondary';
    case 'Rejected':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function SupervisorDashboard({ user }: SupervisorDashboardProps) {
    const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
    const [applications] = useAtom(applicationsAtom);
    const [allUsers] = useAtom(usersAtom);
    const [searchTerm, setSearchTerm] = React.useState('');

    const backOfficeTeam = React.useMemo(() => 
        allUsers.filter(u => u.role === 'back-office'), 
    [allUsers]);

    const myApprovalQueue = applications.filter(app => app.status === 'Pending Supervisor');
    const archivedVault = applications.filter(app => app.status === 'Archived');
    
    const teamApplications = applications
        .filter(app => user.team?.includes(app.submittedBy) && app.status !== 'Archived');
    
    const teamPending = teamApplications
        .filter(app => ['Submitted', 'In Review', 'Returned to ATL'].includes(app.status));
        
    const completedToday = teamApplications
        .filter(app => (app.status === 'Signed' || app.status === 'Approved') && differenceInDays(new Date(), new Date(app.lastUpdated)) === 0).length;

    const filteredApprovalQueue = myApprovalQueue.filter(app => app.id.toLowerCase().includes(searchTerm.toLowerCase()) || app.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredVault = archivedVault.filter(app => app.id.toLowerCase().includes(searchTerm.toLowerCase()) || app.clientName.toLowerCase().includes(searchTerm.toLowerCase()));

    const applicationForReview = selectedApplication ? applications.find(app => app.id === selectedApplication.id) : null;
    
    if (applicationForReview) {
        return <ApplicationReview application={applicationForReview} onBack={() => setSelectedApplication(null)} user={user} />;
    }

    const totalTasks = myApprovalQueue.length;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Back Office Supervisor Home</h2>
        <p className="text-muted-foreground">Final audit stage: Issuing activation codes for wallet creation.</p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Audit Queue</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{myApprovalQueue.length}</div>
                    <p className="text-xs text-muted-foreground">Awaiting activation codes</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Legacy IDs Linked</CardTitle>
                    <Fingerprint className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{applications.filter(a => a.details.brIdentity).length}</div>
                    <p className="text-xs text-muted-foreground">Total BR Identities created</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{completedToday}</div>
                    <p className="text-xs text-muted-foreground">Codes issued today</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vault Assets</CardTitle>
                    <Archive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{archivedVault.length}</div>
                    <p className="text-xs text-muted-foreground">Finalized wallet records</p>
                </CardContent>
            </Card>
        </div>

      <Tabs defaultValue="regulation" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="regulation">
                <ClipboardList className="mr-2 h-4 w-4"/>Workflow
                {totalTasks > 0 && <Badge variant="destructive" className="ml-2 animate-pulse">{totalTasks}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="vault"><Archive className="mr-2 h-4 w-4"/>Archive Vault</TabsTrigger>
              <TabsTrigger value="analytics"><AreaChart className="mr-2 h-4 w-4"/>Appraisal</TabsTrigger>
              <TabsTrigger value="team"><Users className="mr-2 h-4 w-4"/>Clerk Results</TabsTrigger>
              <TabsTrigger value="reports"><FileDown className="mr-2 h-4 w-4"/>Audit Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="regulation">
             <div className="space-y-4">
                  <div className="flex justify-between items-center">
                      <CardTitle>Final Audit & Activation Code Issuance</CardTitle>
                      <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input placeholder="Search ID or Client..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                  </div>
                  <Card>
                      <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>BR Identity</TableHead>
                                    <TableHead>Clerk</TableHead>
                                    <TableHead>Last Action</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredApprovalQueue.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-mono text-xs">{app.id}</TableCell>
                                        <TableCell className="font-medium">{app.clientName}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700">{app.details.brIdentity}</Badge>
                                        </TableCell>
                                        <TableCell>{app.history.find(h => h.action.includes('BR Identity'))?.user || 'Clerk'}</TableCell>
                                        <TableCell>{new Date(app.lastUpdated).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button className="bg-primary text-primary-foreground font-bold" size="sm" onClick={() => setSelectedApplication(app)}>
                                                <Key className="mr-2 h-4 w-4" /> Review & Issue Code
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {filteredApprovalQueue.length === 0 && <div className="text-center p-12 text-muted-foreground">{searchTerm ? 'No matches.' : 'Queue is empty.'}</div>}
                      </CardContent>
                  </Card>
             </div>
          </TabsContent>

          <TabsContent value="vault">
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                          <Archive className="h-5 w-5 text-primary" />
                          Archive Vault Audit
                      </CardTitle>
                      <CardDescription>Audit-ready finalized records and digitized documents.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      {filteredVault.length > 0 ? (
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>Archive ID</TableHead>
                                      <TableHead>Customer</TableHead>
                                      <TableHead>Type</TableHead>
                                      <TableHead>Activation Code</TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {filteredVault.map((app) => (
                                      <TableRow key={app.id}>
                                          <TableCell className="font-mono text-xs">{app.id}</TableCell>
                                          <TableCell className="font-bold">{app.clientName}</TableCell>
                                          <TableCell className="text-xs">{app.clientType}</TableCell>
                                          <TableCell className="font-mono text-xs text-green-600 font-bold">{app.details.activationCode}</TableCell>
                                          <TableCell className="text-right">
                                              <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(app)}>
                                                  <FileSearch className="mr-2 h-4 w-4" />
                                                  Full Audit
                                              </Button>
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      ) : (
                          <div className="p-20 text-center text-muted-foreground">
                              <Archive className="h-12 w-12 opacity-10 mx-auto mb-4" />
                              <p>No archived records found.</p>
                          </div>
                      )}
                  </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
                <KpiTracker applications={applications} />
                <AccountSummaryReport applications={applications} />
            </div>
          </TabsContent>
          <TabsContent value="team">
            <div className="space-y-6">
             <div className="grid grid-cols-1 gap-6">
                <BackOfficeAppraisal applications={applications} team={backOfficeTeam} />
             </div>
            </div>
          </TabsContent>
           <TabsContent value="reports">
             <ReportsTab applications={applications} />
          </TabsContent>
      </Tabs>
    </div>
  );
}
