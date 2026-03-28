'use client';
import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, applicationsAtom, ApplicationStatus } from '@/lib/mock-data';
import ApplicationReview from '../onboarding/application-review';
import { User } from '@/lib/users';
import { Input } from '../ui/input';
import { Search, CheckCircle2, Inbox, Archive, ScanLine, Briefcase, FileSearch, Send, Fingerprint, Key } from 'lucide-react';
import DailyActivityTracker from './daily-activity-tracker';
import DigitizeApplicationFlow from '../onboarding/digitize-application-flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getStatusVariant = (status: ApplicationStatus) => {
  switch (status) {
    case 'Signed':
    case 'Archived':
        return 'success';
    case 'Approved':
    case 'Approved by Supervisor':
        return 'success';
    case 'Pending Supervisor':
    case 'Sent to Supervisor':
    case 'Pending Compliance':
    case 'In Review':
    case 'Sent to Back Office':
      return 'secondary';
    case 'Rejected':
    case 'Returned to ATL':
    case 'Returned to ASL':
    case 'Returned to Back Office':
      return 'destructive';
    case 'Submitted':
      return 'outline';
    default:
      return 'outline';
  }
};

interface BackOfficeDashboardProps {
    user: User;
}

export default function BackOfficeDashboard({ user }: BackOfficeDashboardProps) {
    const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
    const [applications] = useAtom(applicationsAtom);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [activeTab, setActiveTab] = React.useState<string>('pipeline');
    const [isDigitizing, setIsDigitizing] = React.useState<boolean>(false);

    const summaryStats = React.useMemo(() => ({
        pendingReview: applications.filter(a => a.status === 'Submitted' || a.status === 'Returned to ATL' || a.status === 'Returned to ASL' || a.status === 'Sent to Back Office' || a.status === 'Returned to Back Office').length,
        pendingSupervisor: applications.filter(a => a.status === 'Pending Supervisor' || a.status === 'Sent to Supervisor').length,
        readyToFinalize: applications.filter(a => a.status === 'Approved by Supervisor' && !a.details.isDispatched).length,
        archived: applications.filter(a => a.status === 'Archived').length,
    }), [applications]);

    const pipelineApplications = React.useMemo(() => {
        return applications.filter(app => 
            ['Submitted', 'Returned to ATL', 'Returned to ASL', 'Pending Supervisor', 'Sent to Supervisor', 'Pending Compliance', 'Approved', 'Approved by Supervisor', 'Signed', 'Rejected', 'Sent to Back Office', 'Returned to Back Office'].includes(app.status) &&
            (app.id.toLowerCase().includes(searchTerm.toLowerCase()) || app.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [applications, searchTerm]);

    const archivedApplications = React.useMemo(() => {
        return applications.filter(app => 
            app.status === 'Archived' &&
            (app.id.toLowerCase().includes(searchTerm.toLowerCase()) || app.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [applications, searchTerm]);

    if (isDigitizing) {
        return <DigitizeApplicationFlow user={user} onCancel={() => setIsDigitizing(false)} />;
    }

    if (selectedApplication) {
        return (
            <ApplicationReview 
                application={selectedApplication}
                onBack={() => setSelectedApplication(null)}
                user={user}
            />
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
                        <Briefcase className="h-10 w-10 text-primary" />
                        Office Dashboard
                    </h2>
                    <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Manage files and final checks.</p>
                </div>
                <Button onClick={() => setIsDigitizing(true)} variant="secondary" className="h-14 px-10 font-black shadow-2xl transition-all active:scale-95 text-lg rounded-xl border-2 border-secondary/50 shadow-secondary/20">
                    <ScanLine className="mr-2 h-6 w-6" />
                    SCAN PAPER
                </Button>
            </div>
            
            <DailyActivityTracker applications={applications} />
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white/5 border-white/10 shadow-xl rounded-2xl overflow-hidden group hover:bg-white/10 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Waiting</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Fingerprint className="h-4 w-4" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white">{summaryStats.pendingReview}</div>
                        <p className="text-[10px] text-white/30 font-bold uppercase mt-2 tracking-widest">Need ID creation</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 shadow-xl rounded-2xl overflow-hidden group hover:bg-white/10 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Checking</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform"><Briefcase className="h-4 w-4" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white">{summaryStats.pendingSupervisor}</div>
                        <p className="text-[10px] text-white/30 font-bold uppercase mt-2 tracking-widest">With Supervisor</p>
                    </CardContent>
                </Card>
                <Card className="bg-primary/10 border-primary/20 shadow-xl rounded-2xl overflow-hidden group hover:bg-primary/20 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Finish</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform shadow-lg"><Key className="h-4 w-4" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-primary">{summaryStats.readyToFinalize}</div>
                        <p className="text-[10px] text-primary/60 font-black uppercase mt-2 tracking-widest">Ready to finish</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 shadow-xl rounded-2xl overflow-hidden group hover:bg-white/10 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Archives</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 group-hover:scale-110 transition-transform"><Archive className="h-4 w-4" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white">{summaryStats.archived}</div>
                        <p className="text-[10px] text-white/30 font-bold uppercase mt-2 tracking-widest">All finished records</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-6">
                    <TabsList className="bg-white/5 p-1.5 rounded-xl border border-white/5">
                        <TabsTrigger value="pipeline" className="flex items-center gap-3 px-8 h-10 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase text-xs tracking-widest transition-all">
                            <Briefcase className="h-4 w-4" />
                            ACCOUNTS ({pipelineApplications.length})
                        </TabsTrigger>
                        <TabsTrigger value="archive" className="flex items-center gap-3 px-8 h-10 rounded-lg data-[state=active]:bg-foreground data-[state=active]:text-background font-black uppercase text-xs tracking-widest transition-all">
                            <Archive className="h-4 w-4" />
                            ARCHIVES ({archivedApplications.length})
                        </TabsTrigger>
                    </TabsList>
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                        <Input
                            placeholder="Search..."
                            className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary text-white placeholder:text-white/20 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value="pipeline" className="animate-in fade-in duration-500">
                    <Card className="border-none shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md rounded-2xl">
                        <CardHeader className="bg-white/5 py-6 px-8 border-b border-white/5">
                            <CardTitle className="text-xl font-black uppercase tracking-tight">To Do</CardTitle>
                            <CardDescription className="text-xs uppercase font-bold tracking-widest text-white/40 mt-1">Applications moving through check steps.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {pipelineApplications.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                                            <TableHead className="pl-8 text-white/40 uppercase text-[10px] font-black tracking-widest">ID</TableHead>
                                            <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">NAME</TableHead>
                                            <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">BR ID</TableHead>
                                            <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">STAGE</TableHead>
                                            <TableHead className="text-right pr-8 text-white/40 uppercase text-[10px] font-black tracking-widest">ACTION</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pipelineApplications.map((app) => (
                                            <TableRow key={app.id} className="hover:bg-white/5 border-white/5 transition-colors group">
                                                <TableCell className="font-mono text-xs pl-8 text-white/60 font-bold">{app.id}</TableCell>
                                                <TableCell className="py-5">
                                                    <div className="font-black text-white text-md uppercase tracking-tight group-hover:text-primary transition-colors">{app.clientName}</div>
                                                    <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1.5">{app.clientType}</div>
                                                </TableCell>
                                                <TableCell>
                                                    {app.details.brIdentity ? (
                                                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 font-mono font-bold">{app.details.brIdentity}</Badge>
                                                    ) : (
                                                        <span className="text-[10px] text-white/30 uppercase font-black tracking-widest italic">None</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusVariant(app.status)} className="px-3 py-1 uppercase text-[10px] font-black tracking-wider shadow-sm">{app.status}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <Button variant="outline" size="sm" className="font-black uppercase tracking-widest h-9 border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all active:scale-95 px-6 rounded-lg shadow-lg" onClick={() => setSelectedApplication(app)}>
                                                        {app.status === 'Approved by Supervisor' ? 'FINISH' : 'PROCESS'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex items-center justify-center p-24 text-center">
                                    <Briefcase className="h-16 w-16 text-white/10 mb-4" />
                                    <p className="text-white/40 font-black uppercase tracking-widest">No work found.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="archive" className="animate-in fade-in duration-500">
                    <Card className="border-none shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md rounded-2xl">
                        <CardHeader className="bg-white/5 py-6 px-8 border-b border-white/5">
                            <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight">
                                <Archive className="h-6 w-6 text-white/60" />
                                ARCHIVES
                            </CardTitle>
                            <CardDescription className="text-xs uppercase font-bold tracking-widest text-white/40 mt-1">Finished records.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {archivedApplications.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                                            <TableHead className="pl-8 text-white/40 uppercase text-[10px] font-black tracking-widest">REF</TableHead>
                                            <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">NAME</TableHead>
                                            <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">ACCOUNT #</TableHead>
                                            <TableHead className="text-right pr-8 text-white/40 uppercase text-[10px] font-black tracking-widest">ACTION</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {archivedApplications.map((app) => (
                                            <TableRow key={app.id} className="hover:bg-white/10 border-white/5 transition-colors">
                                                <TableCell className="font-mono text-xs pl-8 text-white/40">{app.id}</TableCell>
                                                <TableCell className="py-5 font-black text-white/80 uppercase tracking-tight">{app.clientName}</TableCell>
                                                <TableCell className="font-mono text-md text-primary font-black tracking-tighter">{app.details.accountNumber}</TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <Button variant="ghost" size="sm" className="h-9 px-5 rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-white/10" onClick={() => setSelectedApplication(app)}>
                                                        <FileSearch className="mr-2 h-4 w-4" />
                                                        VIEW
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-24 text-center">
                                    <Archive className="h-16 w-16 opacity-5 text-white mb-4" />
                                    <p className="text-white/20 font-black uppercase tracking-widest italic">No records found.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}