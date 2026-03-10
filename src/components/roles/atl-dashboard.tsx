
'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, applicationsAtom, ApplicationStatus } from '@/lib/mock-data';
import { PlusCircle, Search, MapPin, Inbox, UserCheck, AlertCircle, MessageSquare, Activity, Clock, RefreshCw } from 'lucide-react';
import OnboardingFlow from '@/components/onboarding/onboarding-flow';
import ApplicationReview from '../onboarding/application-review';
import { User } from '@/lib/users';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '../ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

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

  // Extract all activity for the "Live Feed"
  const globalActivity = React.useMemo(() => {
    return applications
        .flatMap(app => app.history.map(h => ({ 
            ...h, 
            clientName: app.clientName, 
            appId: app.id,
            status: app.status 
        })))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
  }, [applications]);

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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
            <div className="mb-8 flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold">ATL Dashboard</h2>
                <p className="text-muted-foreground">Submit, track, and process customer self-service applications.</p>
            </div>
            <Button onClick={() => setIsCreatingApplication(true)} className="shadow-lg hover:scale-105 transition-transform bg-primary text-primary-foreground">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Application
            </Button>
            </div>

            <Tabs defaultValue="my-apps" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="my-apps" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <UserCheck className="h-4 w-4" />
                        My Pipeline ({filteredApplications.length})
                    </TabsTrigger>
                    <TabsTrigger value="leads" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Inbox className="h-4 w-4" />
                        Customer Applications ({filteredLeads.length})
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
                <Card className="border-none shadow-md overflow-hidden">
                    <CardHeader className="bg-muted/30">
                        <CardTitle>Application Tracking</CardTitle>
                        <CardDescription>View status and address feedback from Back Office.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filteredApplications.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/10">
                                        <TableHead className="pl-6">App ID</TableHead>
                                        <TableHead>Client Name</TableHead>
                                        <TableHead>Region</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Recent Activity</TableHead>
                                        <TableHead className="text-right pr-6">Actions</TableHead>
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
                                                    <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
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
                                                                        <p className="font-bold mb-1">Feedback Note:</p>
                                                                        <p className="text-xs">{lastHistory.notes}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>
                                                        {app.status === 'Returned to ATL' ? 'Fix & Resubmit' : 'View'}
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
                            Self-Service Customer Applications
                        </CardTitle>
                        <CardDescription className="text-primary/80">Applications submitted by customers via separate portal. Please verify and claim these applications.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filteredLeads.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-primary/5">
                                        <TableHead className="pl-6">Application ID</TableHead>
                                        <TableHead>Customer / Company</TableHead>
                                        <TableHead>Region</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead className="text-right pr-6">Actions</TableHead>
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
                                                <Button variant="default" size="sm" onClick={() => setSelectedApplication(app)}>Review Application</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                <Inbox className="h-12 w-12 mb-2 opacity-20" />
                                <p>No incoming customer applications at this time.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            </Tabs>
        </div>

        <div className="space-y-6">
            <Card className="shadow-lg border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-white/5">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                        <Activity className="h-4 w-4" />
                        Live Activity Monitoring
                    </CardTitle>
                    <CardDescription className="text-[10px]">Real-time updates from the system.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[600px]">
                        <div className="p-4 space-y-4">
                            {globalActivity.map((act, idx) => (
                                <div key={`${act.appId}-${idx}`} className="relative pl-4 border-l-2 border-primary/20 pb-2">
                                    <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="text-[11px] font-bold text-foreground leading-tight">{act.clientName}</p>
                                            <span className="text-[9px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                                <Clock className="h-2 w-2" />
                                                {formatDistanceToNow(new Date(act.timestamp), { addSuffix: true }).replace('about ', '')}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-primary/80 font-medium">{act.action}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] text-muted-foreground bg-white/5 px-1 rounded">by {act.user}</span>
                                            <Badge variant="outline" className="text-[8px] h-4 py-0 border-primary/10 font-mono">{act.appId}</Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {globalActivity.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <RefreshCw className="h-8 w-8 mx-auto opacity-10 animate-spin-slow mb-2" />
                                    <p className="text-xs italic">Waiting for incoming activity...</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
