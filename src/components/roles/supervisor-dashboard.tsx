'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, applicationsAtom, ApplicationStatus } from '@/lib/mock-data';
import { AlertCircle, AreaChart, CheckCircle2, ClipboardList, Inbox, Search, Users, FileDown, ShieldCheck, UserCheck } from 'lucide-react';
import ApplicationReview from '../onboarding/application-review';
import { User, users as allUsers } from '@/lib/users';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import TeamPerformanceChart from './team-performance-chart';
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
      return 'success';
    case 'Pending Supervisor':
    case 'Pending Executive Signature':
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
    const [searchTerm, setSearchTerm] = React.useState('');

    const backOfficeTeam = allUsers.filter(u => u.role === 'back-office');

    const myApprovalQueue = applications.filter(app => app.status === 'Pending Supervisor');
    
    const teamApplications = applications
        .filter(app => user.team?.includes(app.submittedBy) && app.status !== 'Archived');
    
    const teamPending = teamApplications
        .filter(app => ['Submitted', 'In Review', 'Returned to ATL'].includes(app.status));
        
    const completedToday = teamApplications
        .filter(app => app.status === 'Signed' && differenceInDays(new Date(), new Date(app.lastUpdated)) === 0).length;

    const pendingOver3Days = applications
        .filter(app => 
            ['Submitted', 'In Review', 'Pending Supervisor', 'Returned to ATL'].includes(app.status) 
            && differenceInDays(new Date(), new Date(app.lastUpdated)) > 3
        ).length;

    const filteredApprovalQueue = myApprovalQueue.filter(app => app.id.toLowerCase().includes(searchTerm.toLowerCase()) || app.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredTeamApps = teamApplications.filter(app => app.id.toLowerCase().includes(searchTerm.toLowerCase()) || app.clientName.toLowerCase().includes(searchTerm.toLowerCase()));

    const applicationForReview = selectedApplication ? applications.find(app => app.id === selectedApplication.id) : null;
    
    if (applicationForReview) {
        return <ApplicationReview application={applicationForReview} onBack={() => setSelectedApplication(null)} user={user} />;
    }

    const totalTasks = myApprovalQueue.length;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Back Office Supervisor Home</h2>
        <p className="text-muted-foreground">Managing ASL submissions and Clerical output performance.</p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Supervisor Queue</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{myApprovalQueue.length}</div>
                    <p className="text-xs text-muted-foreground">Ready for final sign-off</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">ASL Active Load</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{teamPending.length}</div>
                    <p className="text-xs text-muted-foreground">New ASL submissions</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Finalized Today</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{completedToday}</div>
                    <p className="text-xs text-muted-foreground">Sign-offs completed today</p>
                </CardContent>
            </Card>
            <Card className={pendingOver3Days > 0 ? "bg-destructive/10 border-destructive" : ""}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">SLA Alerts (&gt;3 Days)</CardTitle>
                    <AlertCircle className={cn("h-4 w-4 text-muted-foreground", pendingOver3Days > 0 && "text-destructive")} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingOver3Days}</div>
                    <p className="text-xs text-muted-foreground">Stalled requests needing help</p>
                </CardContent>
            </Card>
        </div>

      <Tabs defaultValue="regulation" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="regulation">
                <ClipboardList className="mr-2 h-4 w-4"/>Workflow Oversight
                {totalTasks > 0 && <Badge variant="destructive" className="ml-2 animate-pulse">{totalTasks}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="analytics"><AreaChart className="mr-2 h-4 w-4"/>Appraisal</TabsTrigger>
              <TabsTrigger value="team"><Users className="mr-2 h-4 w-4"/>Clerk Performance</TabsTrigger>
              <TabsTrigger value="reports"><FileDown className="mr-2 h-4 w-4"/>Audit Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="regulation">
             <Tabs defaultValue="approval" className="w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                      <TabsList className="w-full sm:w-auto">
                          <TabsTrigger value="approval">Review Queue ({filteredApprovalQueue.length})</TabsTrigger>
                          <TabsTrigger value="team">ASL Monitor ({filteredTeamApps.length})</TabsTrigger>
                      </TabsList>
                      <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input placeholder="Search ID or Client..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                  </div>
                  <TabsContent value="approval">
                      <Card>
                          <CardHeader>
                              <CardTitle>Clerk Output Validation</CardTitle>
                              <CardDescription>Check and sign off on requests processed by Back Office Clerks.</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>From ASL</TableHead>
                                        <TableHead>Last Action</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredApprovalQueue.map((app) => (
                                        <TableRow key={app.id}>
                                            <TableCell className="font-mono text-xs">{app.id}</TableCell>
                                            <TableCell className="font-medium">{app.clientName}</TableCell>
                                            <TableCell>{app.submittedBy}</TableCell>
                                            <TableCell>{new Date(app.lastUpdated).toLocaleDateString()}</TableCell>
                                            <TableCell><Badge variant="secondary">{app.status}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>Review & Sign</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {filteredApprovalQueue.length === 0 && <div className="text-center p-12 text-muted-foreground">{searchTerm ? 'No matches.' : 'Queue is empty.'}</div>}
                          </CardContent>
                      </Card>
                  </TabsContent>
                  <TabsContent value="team">
                      <Card>
                          <CardHeader>
                              <CardTitle>ASL Performance Monitor</CardTitle>
                              <CardDescription>Oversight of requests coming in from Area Sales Leaders (ASL).</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>ASL Name</TableHead>
                                        <TableHead>Date Sent</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTeamApps.map((app) => (
                                        <TableRow key={app.id}>
                                            <TableCell className="font-mono text-xs">{app.id}</TableCell>
                                            <TableCell className="font-medium">{app.clientName}</TableCell>
                                            <TableCell>{app.submittedBy}</TableCell>
                                            <TableCell>{app.submittedDate}</TableCell>
                                            <TableCell><Badge variant={getStatusVariant(app.status)}>{app.status}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(app)}>View Details</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                               {filteredTeamApps.length === 0 && <div className="text-center p-12 text-muted-foreground">{searchTerm ? 'No results.' : "No active ASL requests to monitor."}</div>}
                          </CardContent>
                      </Card>
                  </TabsContent>
              </Tabs>
          </TabsContent>
          <TabsContent value="analytics">
            <div className="space-y-6">
                <KpiTracker applications={applications} />
                <AccountSummaryReport applications={applications} />
                <div className="w-full">
                    <TeamPerformanceChart applications={teamApplications} team={user.team || []} />
                </div>
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
