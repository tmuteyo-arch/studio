'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, applicationsAtom, ApplicationStatus } from '@/lib/mock-data';
import { AlertCircle, AreaChart, CheckCircle2, ClipboardList, Inbox, Search, Users, FileDown, ShieldCheck, UserCheck, Archive, FileSearch, Key, Fingerprint, ShieldAlert, Clock, ClipboardCheck, Gavel, FileSpreadsheet, ListFilter } from 'lucide-react';
import ApplicationReview from '../onboarding/application-review';
import { User, usersAtom } from '@/lib/users';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { differenceInDays, format, startOfDay, endOfDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import KpiTracker from './kpi-tracker';
import AccountSummaryReport from './account-summary-report';
import ReportsTab from './reports-tab';
import BackOfficeAppraisal from './back-office-appraisal';
import { getStateLabel } from '@/lib/state-machine';
import { useToast } from '@/hooks/use-toast';

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
    case 'Safe to Continue':
    case 'Approved by Management':
    case 'Pending Executive Signature':
      return 'secondary';
    case 'Rejected':
    case 'Not Safe to Proceed':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function SupervisorDashboard({ user }: SupervisorDashboardProps) {
    const { toast } = useToast();
    const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
    const [applications] = useAtom(applicationsAtom);
    const [allUsers] = useAtom(usersAtom);
    const [searchTerm, setSearchTerm] = React.useState('');

    // Filters for Reporting
    const [dateRange, setDateRange] = React.useState({ start: '', end: '' });
    const [staffFilter, setStaffFilter] = React.useState('all');

    const backOfficeTeam = React.useMemo(() => 
        allUsers.filter(u => u.role === 'back-office'), 
    [allUsers]);

    const filteredQueue = React.useMemo(() => {
        return applications.filter(app => {
            const isTarget = app.status === 'Safe to Continue' || app.status === 'Approved by Management';
            const matchesSearch = app.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                               app.clientName.toLowerCase().includes(searchTerm.toLowerCase());
            return isTarget && matchesSearch;
        }).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    }, [applications, searchTerm]);

    const reportingData = React.useMemo(() => {
        return applications.filter(app => {
            let matches = true;
            if (dateRange.start || dateRange.end) {
                const appDate = parseISO(app.submittedDate);
                if (dateRange.start && appDate < startOfDay(parseISO(dateRange.start))) matches = false;
                if (dateRange.end && appDate > endOfDay(parseISO(dateRange.end))) matches = false;
            }
            if (staffFilter !== 'all' && app.submittedBy !== staffFilter) matches = false;
            return matches;
        });
    }, [applications, dateRange, staffFilter]);

    const reportStats = React.useMemo(() => {
        const approved = reportingData.filter(a => ['Locked', 'Dispatched', 'Approved'].includes(a.status)).length;
        const rejected = reportingData.filter(a => a.status === 'Rejected' || a.status === 'Not Safe to Proceed').length;
        return {
            total: reportingData.length,
            approved,
            rejected,
            pending: reportingData.length - (approved + rejected),
            processed: approved + rejected
        };
    }, [reportingData]);

    const handleExportRegistry = () => {
        const headers = ['APP_ID', 'CLIENT_NAME', 'ACCOUNT_TYPE', 'SUBMITTED_BY', 'STATUS', 'DATE'];
        const csv = reportingData.map(app => [
            app.id,
            app.clientName,
            app.clientType,
            app.submittedBy,
            app.status,
            app.submittedDate
        ].join(',')).join('\n');

        const blob = new Blob([headers.join(',') + '\n' + csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Supervisor_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast({ title: "Report Exported", description: `${reportingData.length} records processed.` });
    };

    const applicationForReview = selectedApplication ? applications.find(app => app.id === selectedApplication.id) : null;
    
    if (applicationForReview) {
        return <ApplicationReview application={applicationForReview} onBack={() => setSelectedApplication(null)} user={user} />;
    }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 border-b border-white/5 pb-8">
        <div>
            <h2 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
                <ShieldCheck className="h-10 w-10 text-primary" />
                Supervisor Portal
            </h2>
            <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Team audit and regulatory reporting.</p>
        </div>
        <div className="flex gap-3">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="h-12 bg-white/5 border-white/10 text-white font-bold px-6 rounded-xl shadow-xl">
                        <ListFilter className="mr-2 h-4 w-4 text-primary" /> Filter Reports
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-[#1e1b4b] border-white/10 p-6 space-y-6 shadow-2xl rounded-2xl" align="end">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Report Range</label>
                        <div className="grid grid-cols-2 gap-2">
                            <Input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))} className="bg-black/20 border-white/10 text-[10px]" />
                            <Input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))} className="bg-black/20 border-white/10 text-[10px]" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">ASL Staff Member</label>
                        <Select value={staffFilter} onValueChange={setStaffFilter}>
                            <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="All Staff" /></SelectTrigger>
                            <SelectContent className="bg-[#1e1b4b] text-white">
                                <SelectItem value="all">All Staff</SelectItem>
                                {allUsers.filter(u => u.role === 'asl').map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full font-black uppercase tracking-widest bg-primary text-primary-foreground h-10" onClick={() => {
                        setDateRange({start: '', end: ''});
                        setStaffFilter('all');
                    }}>Reset All Filters</Button>
                </PopoverContent>
            </Popover>
            <Button onClick={handleExportRegistry} variant="secondary" className="h-12 px-6 font-black rounded-xl border-2 shadow-2xl">
                <FileSpreadsheet className="mr-2 h-5 w-5" /> EXPORT REPORT
            </Button>
        </div>
      </div>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-primary/10 border-primary/20 shadow-2xl rounded-2xl">
                <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">In Reporting Window</CardTitle></CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-primary">{reportStats.total}</div>
                    <p className="text-[10px] text-primary/40 font-black uppercase mt-2 tracking-widest">New Submissions</p>
                </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 shadow-xl rounded-2xl">
                <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Approved</CardTitle></CardHeader>
                <CardContent><div className="text-4xl font-black text-green-500">{reportStats.approved}</div></CardContent>
            </Card>
             <Card className="bg-white/5 border-white/10 shadow-xl rounded-2xl">
                <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Rejected</CardTitle></CardHeader>
                <CardContent><div className="text-4xl font-black text-destructive">{reportStats.rejected}</div></CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 shadow-xl rounded-2xl">
                <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Processed</CardTitle></CardHeader>
                <CardContent><div className="text-4xl font-black text-white/80">{reportStats.processed}</div></CardContent>
            </Card>
        </div>

      <Tabs defaultValue="regulation" className="w-full">
          <TabsList className="bg-white/5 p-1.5 rounded-xl border border-white/5 mb-10 w-full sm:w-auto overflow-x-auto justify-start h-auto">
              <TabsTrigger value="regulation" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] transition-all relative">
                <Gavel className="mr-2 h-4 w-4"/>AUDIT DESK
                {filteredQueue.length > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-white text-[8px] flex items-center justify-center rounded-full border-2 border-background animate-pulse">{filteredQueue.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="vault" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] transition-all"><Archive className="mr-2 h-4 w-4"/>VAULT</TabsTrigger>
              <TabsTrigger value="analytics" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] transition-all"><AreaChart className="mr-2 h-4 w-4"/>REPORTING</TabsTrigger>
              <TabsTrigger value="team" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] transition-all"><Users className="mr-2 h-4 w-4"/>CLERKS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="regulation" className="animate-in fade-in duration-500">
             <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div>
                        <CardTitle className="text-2xl font-black uppercase tracking-tight">Technical Review Queue</CardTitle>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Audit team submissions and issue activation codes.</p>
                      </div>
                      <div className="relative w-full sm:w-80">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                          <Input placeholder="Search Audit Queue..." className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                  </div>
                  <Card className="border-none shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md rounded-2xl">
                      <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-black/20 border-white/5">
                                    <TableHead className="pl-8 text-white/40 uppercase text-[10px] font-black tracking-widest">ID</TableHead>
                                    <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">NAME</TableHead>
                                    <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">BR REF</TableHead>
                                    <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">STATE</TableHead>
                                    <TableHead className="text-right pr-8 text-white/40 uppercase text-[10px] font-black tracking-widest">ACTION</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredQueue.map((app) => (
                                    <TableRow key={app.id} className="hover:bg-white/5 border-white/5 transition-colors group">
                                        <TableCell className="font-mono text-xs pl-8 text-white/40 font-bold group-hover:text-white">{app.id}</TableCell>
                                        <TableCell className="py-5">
                                            <div className="font-black text-white text-md uppercase group-hover:text-primary transition-colors">{app.clientName}</div>
                                            <div className="text-[10px] text-white/40 uppercase font-black mt-1.5">{app.clientType}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono font-bold px-3 py-1">{app.details.brIdentity || 'Awaiting ID'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(app.status)} className="px-3 py-1 uppercase text-[10px] font-black shadow-sm">{getStateLabel(app.status)}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <Button className="bg-primary text-primary-foreground font-black uppercase tracking-widest h-10 px-6 rounded-lg shadow-lg" size="sm" onClick={() => setSelectedApplication(app)}>
                                                {app.status === 'Approved by Management' ? 'FINALIZE' : 'AUDIT'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                      </CardContent>
                  </Card>
             </div>
          </TabsContent>

          <TabsContent value="vault" className="animate-in fade-in duration-500">
              <Card className="border-none shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md rounded-2xl">
                  <CardHeader className="bg-white/5 py-6 px-8 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <Archive className="h-6 w-6 text-primary" />
                        <div>
                            <CardTitle className="text-xl font-black uppercase tracking-tight text-white">Archives</CardTitle>
                            <CardDescription className="text-xs uppercase font-bold tracking-widest text-white/40 mt-1">Regulatory vault for finalized records.</CardDescription>
                        </div>
                      </div>
                  </CardHeader>
                  <CardContent className="p-0">
                      <Table>
                          <TableHeader>
                              <TableRow className="bg-black/20 border-white/5">
                                  <TableHead className="pl-8 text-white/40 uppercase text-[10px] font-black">REF</TableHead>
                                  <TableHead className="text-white/40 uppercase text-[10px] font-black">NAME</TableHead>
                                  <TableHead className="text-white/40 uppercase text-[10px] font-black">CLASS</TableHead>
                                  <TableHead className="text-white/40 uppercase text-[10px] font-black">CORE CODE</TableHead>
                                  <TableHead className="text-right pr-8 text-white/40 uppercase text-[10px] font-black">ACTION</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {applications.filter(a => ['Archived', 'Locked', 'Dispatched'].includes(a.status)).map((app) => (
                                  <TableRow key={app.id} className="hover:bg-white/10 border-white/5 transition-colors">
                                      <TableCell className="font-mono text-xs pl-8 text-white/40">{app.id}</TableCell>
                                      <TableCell className="py-5 font-black text-white/80 uppercase tracking-tight">{app.clientName}</TableCell>
                                      <TableCell className="text-white/40 uppercase text-[10px] font-black">{app.clientType}</TableCell>
                                      <TableCell className="font-mono text-md text-green-500 font-black">{app.details.activationCode || 'SAVED'}</TableCell>
                                      <TableCell className="text-right pr-8">
                                          <Button variant="ghost" size="sm" className="h-9 px-5 rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-white/10" onClick={() => setSelectedApplication(app)}>VIEW</Button>
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-10 animate-in fade-in duration-500">
            <div className="space-y-10">
                <KpiTracker applications={reportingData} />
                <AccountSummaryReport applications={reportingData} />
                <ReportsTab applications={reportingData} />
            </div>
          </TabsContent>
          <TabsContent value="team" className="animate-in fade-in duration-500">
            <div className="space-y-6">
                <BackOfficeAppraisal applications={reportingData} team={backOfficeTeam} />
            </div>
          </TabsContent>
      </Tabs>
    </div>
  );
}

