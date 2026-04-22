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
import { Search, Archive, ScanLine, Briefcase, FileSearch, Send, Fingerprint, Key } from 'lucide-react';
import DailyActivityTracker from './daily-activity-tracker';
import DigitizeApplicationFlow from '../onboarding/digitize-application-flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStateLabel } from '@/lib/state-machine';

const getStatusVariant = (status: ApplicationStatus) => {
  switch (status) {
    case 'Locked':
    case 'Dispatched':
    case 'Approved':
        return 'success';
    case 'Under Review':
    case 'Pending Documents':
      return 'secondary';
    case 'Rejected':
      return 'destructive';
    case 'Draft':
    case 'In Progress':
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
        pendingReview: applications.filter(a => a.status === 'Under Review').length,
        pendingDispatch: applications.filter(a => a.status === 'Approved').length,
        dispatched: applications.filter(a => a.status === 'Dispatched').length,
        locked: applications.filter(a => a.status === 'Locked').length,
    }), [applications]);

    const pipelineApplications = React.useMemo(() => {
        return applications.filter(app => 
            ['Under Review', 'Approved', 'Rejected', 'Pending Documents'].includes(app.status) &&
            (app.id.toLowerCase().includes(searchTerm.toLowerCase()) || app.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [applications, searchTerm]);

    const archivedApplications = React.useMemo(() => {
        return applications.filter(app => 
            ['Dispatched', 'Locked'].includes(app.status) &&
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
                    <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Manage lifecycle verification and dispatch.</p>
                </div>
                <Button onClick={() => setIsDigitizing(true)} variant="secondary" className="h-14 px-10 font-black shadow-2xl rounded-xl border-2">
                    <ScanLine className="mr-2 h-6 w-6" />
                    DIGITALIZE APPLICATION
                </Button>
            </div>
            
            <DailyActivityTracker applications={applications} />
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white/5 border-white/10 rounded-2xl group hover:bg-white/10 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[10px] font-black uppercase text-white/40">Review Queue</CardTitle>
                        <Fingerprint className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white">{summaryStats.pendingReview}</div>
                        <p className="text-[10px] text-white/30 font-bold uppercase mt-2">In verification</p>
                    </CardContent>
                </Card>
                <Card className="bg-primary/10 border-primary/20 rounded-2xl transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[10px] font-black uppercase text-primary">Dispatch</CardTitle>
                        <Key className="h-8 w-8 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-primary">{summaryStats.pendingDispatch}</div>
                        <p className="text-[10px] text-primary/60 font-black uppercase mt-2">Ready to finish</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[10px] font-black uppercase text-white/40">Total Dispatched</CardTitle>
                        <Send className="h-8 w-8 text-white/20" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white">{summaryStats.dispatched}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[10px] font-black uppercase text-white/40">Locked Archive</CardTitle>
                        <Archive className="h-8 w-8 text-white/20" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white">{summaryStats.locked}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-6">
                    <TabsList className="bg-white/5 p-1.5 rounded-xl border border-white/5">
                        <TabsTrigger value="pipeline" className="flex items-center gap-3 px-8 h-10 font-black uppercase text-xs">
                            <Briefcase className="h-4 w-4" />
                            LIFECYCLE PIPELINE ({pipelineApplications.length})
                        </TabsTrigger>
                        <TabsTrigger value="archive" className="flex items-center gap-3 px-8 h-10 font-black uppercase text-xs">
                            <Archive className="h-4 w-4" />
                            ARCHIVES ({archivedApplications.length})
                        </TabsTrigger>
                    </TabsList>
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                        <Input placeholder="Search..." className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <TabsContent value="pipeline" className="animate-in fade-in duration-500">
                    <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-2xl">
                        <CardHeader className="bg-white/5 py-6 px-8 border-b border-white/5">
                            <CardTitle className="text-xl font-black uppercase">Active Registry</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {pipelineApplications.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                                            <TableHead className="pl-8 text-white/40 uppercase text-[10px] font-black">ID</TableHead>
                                            <TableHead className="text-white/40 uppercase text-[10px] font-black">NAME</TableHead>
                                            <TableHead className="text-white/40 uppercase text-[10px] font-black">STATE</TableHead>
                                            <TableHead className="text-right pr-8 text-white/40 uppercase text-[10px] font-black">ACTION</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pipelineApplications.map((app) => (
                                            <TableRow key={app.id} className="hover:bg-white/5 border-white/5 transition-colors group">
                                                <TableCell className="font-mono text-xs pl-8 text-white/60 font-bold">{app.id}</TableCell>
                                                <TableCell className="py-5">
                                                    <div className="font-black text-white text-md uppercase group-hover:text-primary transition-colors">{app.clientName}</div>
                                                    <div className="text-[10px] text-white/40 uppercase font-black mt-1.5">{app.clientType}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusVariant(app.status)} className="px-3 py-1 uppercase text-[10px] font-black shadow-sm">{getStateLabel(app.status)}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <Button variant="outline" size="sm" className="font-black uppercase h-9 px-6 rounded-lg shadow-lg" onClick={() => setSelectedApplication(app)}>
                                                        {app.status === 'Approved' ? 'DISPATCH' : 'PROCESS'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex items-center justify-center p-24 text-center">
                                    <Briefcase className="h-16 w-16 text-white/10 mb-4" />
                                    <p className="text-white/40 font-black uppercase tracking-widest">Queue is clear.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="archive" className="animate-in fade-in duration-500">
                    <Card className="border-none shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md rounded-2xl">
                        <CardHeader className="bg-white/5 py-6 px-8 border-b border-white/5">
                            <CardTitle className="flex items-center gap-3 text-xl font-black uppercase">
                                <Archive className="h-6 w-6 text-white/60" />
                                ARCHIVES
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {archivedApplications.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                                            <TableHead className="pl-8 text-white/40 uppercase text-[10px] font-black">REF</TableHead>
                                            <TableHead className="text-white/40 uppercase text-[10px] font-black">NAME</TableHead>
                                            <TableHead className="text-white/40 uppercase text-[10px] font-black">BR ACCT</TableHead>
                                            <TableHead className="text-right pr-8 text-white/40 uppercase text-[10px] font-black">ACTION</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {archivedApplications.map((app) => (
                                            <TableRow key={app.id} className="hover:bg-white/10 border-white/5 group">
                                                <TableCell className="font-mono text-xs pl-8 text-white/40">{app.id}</TableCell>
                                                <TableCell className="py-5 font-black text-white/80 uppercase">{app.clientName}</TableCell>
                                                <TableCell className="font-mono text-md text-primary font-black">{app.details.brAccountNumber || 'PENDING'}</TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <Button variant="ghost" size="sm" className="h-9 px-5 rounded-lg font-black uppercase text-[10px] hover:bg-white/10" onClick={() => setSelectedApplication(app)}>
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
                                    <p className="text-white/20 font-black uppercase tracking-widest italic">Vault is empty.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
