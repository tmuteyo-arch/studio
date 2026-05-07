'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { format, parseISO, differenceInHours, differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { applicationsAtom, Application, activityLogsAtom } from '@/lib/mock-data';
import { User, usersAtom } from '@/lib/users';
import { 
  ShieldCheck, 
  Search, 
  AlertTriangle,
  History,
  XCircle,
  CalendarDays,
  BarChart3,
  TrendingUp,
  Archive,
  Eye,
  FileSearch,
  Wallet,
  Clock,
  Filter,
  ArrowRight,
  ShieldAlert,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ApplicationReview from '../onboarding/application-review';
import { rejectionReasons } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type MonthStat = {
    total: number;
    approved: number;
    dispatched: number;
    rejected: number;
    pending: number;
};

type AuditEntry = {
    timestamp: string;
    user: string;
    action: string;
    appId?: string;
    clientName?: string;
    notes?: string;
    type: 'application' | 'system';
};

export default function ComplianceRiskDashboard({ user }: { user: User }) {
  const { toast } = useToast();
  const [applications] = useAtom(applicationsAtom);
  const [activityLogs] = useAtom(activityLogsAtom);
  const [allUsers] = useAtom(usersAtom);
  
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [staffFilter, setStaffFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [reasonFilter, setRejectionReasonFilter] = React.useState('all');
  const [dateRange, setDateRange] = React.useState({ start: '', end: '' });

  const getAppDuration = (app: Application) => {
    const start = parseISO(app.history[0]?.timestamp || app.submittedDate);
    const end = app.status === 'Locked' ? parseISO(app.lastUpdated) : new Date();
    const hours = differenceInHours(end, start);
    if (hours < 24) return `${hours}h`;
    const days = differenceInDays(end, start);
    return `${days}d ${hours % 24}h`;
  };

  const fullAuditTrail: AuditEntry[] = React.useMemo(() => {
    const entries: AuditEntry[] = [];
    activityLogs.forEach(log => entries.push({ timestamp: log.timestamp, user: log.userName, action: log.action, type: 'system' }));
    applications.forEach(app => {
        app.history.forEach(log => {
            entries.push({
                timestamp: log.timestamp,
                user: log.user,
                action: log.action,
                appId: app.id,
                clientName: app.clientName,
                notes: log.notes,
                type: 'application'
            });
        });
    });
    return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [applications, activityLogs]);

  const filteredArchive = React.useMemo(() => {
    return applications.filter(app => {
        const matchesSearch = app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (app.details.brAccountNumber && app.details.brAccountNumber.includes(searchTerm));
        
        const matchesStaff = staffFilter === 'all' || app.submittedBy === staffFilter;
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        const matchesReason = reasonFilter === 'all' || app.history.some(h => h.notes && h.notes.includes(reasonFilter));

        let matchesDate = true;
        if (dateRange.start || dateRange.end) {
            const appDate = parseISO(app.submittedDate);
            if (dateRange.start && appDate < startOfDay(parseISO(dateRange.start))) matchesDate = false;
            if (dateRange.end && appDate > endOfDay(parseISO(dateRange.end))) matchesDate = false;
        }

        return matchesSearch && matchesStaff && matchesStatus && matchesReason && matchesDate;
    });
  }, [applications, searchTerm, staffFilter, statusFilter, reasonFilter, dateRange]);

  const stats = React.useMemo(() => {
    const approved = filteredArchive.filter(a => ['Locked', 'Dispatched', 'Approved'].includes(a.status)).length;
    const rejected = filteredArchive.filter(a => a.status === 'Rejected' || a.status === 'Not Safe to Proceed').length;
    return {
      total: filteredArchive.length,
      approved,
      rejected,
      pending: filteredArchive.length - (approved + rejected),
      processed: approved + rejected
    };
  }, [filteredArchive]);

  const handleExportForensics = () => {
    const headers = ['APP_ID', 'CLIENT', 'STATUS', 'STAFF', 'DURATION', 'REASON'];
    const csv = filteredArchive.map(app => [
        app.id,
        app.clientName,
        app.status,
        app.submittedBy,
        getAppDuration(app),
        app.history.find(h => h.action.includes('Rejected'))?.notes || '-'
    ].join(',')).join('\n');

    const blob = new Blob([headers.join(',') + '\n' + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Forensic_Audit_${format(new Date(), 'yyyyMMdd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: "Forensic Export Ready", description: "CSV file saved for regulatory filing." });
  };

  if (selectedApplication) {
    const appForReview = applications.find(a => a.id === selectedApplication.id) || selectedApplication;
    return <ApplicationReview application={appForReview} onBack={() => setSelectedApplication(null)} user={user} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Regulatory Compliance
          </h2>
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold">Risk management and forensic network auditing.</p>
        </div>
        <div className="flex gap-3">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="h-12 bg-white/5 border-white/10 text-white font-bold px-6 rounded-xl shadow-xl">
                        <Filter className="mr-2 h-4 w-4 text-primary" /> Audit Filters
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-slate-900 border-white/10 p-6 space-y-6 shadow-2xl rounded-2xl" align="end">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Review Period</label>
                        <div className="grid grid-cols-2 gap-2">
                            <Input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))} className="bg-black/20 border-white/10 text-[10px]" />
                            <Input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))} className="bg-black/20 border-white/10 text-[10px]" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Assigned Staff</label>
                        <Select value={staffFilter} onValueChange={setStaffFilter}>
                            <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="All Staff" /></SelectTrigger>
                            <SelectContent className="bg-slate-900 text-white">
                                <SelectItem value="all">All Staff</SelectItem>
                                {allUsers.map(u => <SelectItem key={u.id} value={u.name}>{u.name} ({u.role})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Rejection Reason</label>
                        <Select value={reasonFilter} onValueChange={setRejectionReasonFilter}>
                            <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="All Reasons" /></SelectTrigger>
                            <SelectContent className="bg-slate-900 text-white">
                                <SelectItem value="all">All Reasons</SelectItem>
                                {rejectionReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full font-black uppercase tracking-widest bg-primary text-primary-foreground h-10" onClick={() => {
                        setDateRange({start: '', end: ''});
                        setStaffFilter('all');
                        setRejectionReasonFilter('all');
                        setStatusFilter('all');
                    }}>Reset Audit Filters</Button>
                </PopoverContent>
            </Popover>
            <Button onClick={handleExportForensics} variant="secondary" className="h-12 px-6 font-black rounded-xl border-2 shadow-2xl">
                <FileSpreadsheet className="mr-2 h-5 w-5" /> FORENSIC EXPORT
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Network Created</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-black text-white">{stats.total}</div></CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Approved Records</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-black text-green-500">{stats.approved}</div></CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Regulatory Blocks</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-black text-destructive">{stats.rejected}</div></CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/20 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-primary font-bold tracking-widest">Total Processed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-black text-primary">{stats.processed}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="archive" className="w-full">
        <TabsList className="bg-black/20 p-1 mb-6 rounded-xl border border-white/5 w-full sm:w-auto overflow-x-auto justify-start h-auto">
          <TabsTrigger value="archive" className="px-8 h-10 font-black uppercase text-[10px] tracking-widest"><Archive className="mr-2 h-4 w-4" /> FORENSIC VAULT</TabsTrigger>
          <TabsTrigger value="audit-log" className="px-8 h-10 font-black uppercase text-[10px] tracking-widest"><History className="mr-2 h-4 w-4" /> ACTIVITY LOG</TabsTrigger>
          <TabsTrigger value="summary" className="px-8 h-10 font-black uppercase text-[10px] tracking-widest"><BarChart3 className="mr-2 h-4 w-4" /> MONTHLY REPORT</TabsTrigger>
        </TabsList>

        <TabsContent value="archive" className="animate-in fade-in duration-500">
          <Card className="border-none bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
            <CardHeader className="bg-white/5 border-b border-white/5 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                        <FileSearch className="h-5 w-5 text-primary" /> Registry Audit
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase text-white/40 mt-1">Forensic lookup of application history and staff actions.</CardDescription>
                </div>
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <Input placeholder="Client name or Trace ID..." className="pl-9 bg-black/40 border-white/10 text-white h-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                    <TableHead className="pl-8 text-[10px] font-bold uppercase text-white/40">Entity & Trace ID</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/40">Assigned Staff</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/40 text-center">Process Time</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/40">Dispatch</TableHead>
                    <TableHead className="pr-8 text-right text-[10px] font-bold uppercase text-white/40">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArchive.map((app) => (
                    <TableRow key={app.id} className="border-white/5 hover:bg-white/10 transition-colors group">
                      <TableCell className="pl-8 py-5">
                        <p className="font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">{app.clientName}</p>
                        <p className="text-[10px] text-white/30 font-mono mt-1">{app.id} • {app.clientType}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-white/10 text-white/60 font-bold uppercase text-[9px]">{app.submittedBy}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono text-[10px]">{getAppDuration(app)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(app.status)} className="uppercase text-[9px] font-black">{app.status}</Badge>
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <Button variant="ghost" size="sm" className="font-black uppercase tracking-widest h-9 hover:bg-primary hover:text-primary-foreground rounded-lg" onClick={() => setSelectedApplication(app)}>REVIEW</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit-log" className="animate-in fade-in duration-500">
            <Card className="border-none bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-black/20 border-white/5">
                                <TableHead className="pl-8 text-[10px] font-bold uppercase text-white/40">Timestamp</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase text-white/40">Staff Member</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase text-white/40">Action</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase text-white/40">Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fullAuditTrail.slice(0, 100).map((entry, idx) => (
                                <TableRow key={idx} className="border-white/5 hover:bg-white/5 text-[11px]">
                                    <TableCell className="pl-8 py-4 text-white/40 font-mono">{format(parseISO(entry.timestamp), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                                    <TableCell className="font-bold text-white uppercase">{entry.user}</TableCell>
                                    <TableCell><Badge variant="outline" className="text-[9px] border-white/10 uppercase">{entry.action}</Badge></TableCell>
                                    <TableCell className="pr-8 text-white/60 italic truncate max-w-[300px]">{entry.notes || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getStatusVariant(status: string) {
    if (['Locked', 'Dispatched', 'Approved'].includes(status)) return 'success';
    if (['Rejected', 'Not Safe to Proceed'].includes(status)) return 'destructive';
    return 'outline';
}
