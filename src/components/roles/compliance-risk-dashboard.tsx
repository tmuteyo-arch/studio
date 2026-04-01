'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { format, parseISO, differenceInHours, differenceInDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { applicationsAtom, Application, activityLogsAtom, UserActivityLog, HistoryLog } from '@/lib/mock-data';
import { User, usersAtom } from '@/lib/users';
import { 
  ShieldCheck, 
  Search, 
  AlertTriangle,
  UserSearch,
  History,
  CheckCircle2,
  XCircle,
  CalendarDays,
  BarChart3,
  TrendingUp,
  FileText,
  PieChart,
  Archive,
  Eye,
  FileSearch,
  Wallet,
  Clock,
  Filter,
  Users,
  Calendar,
  ChevronRight,
  Download,
  ArrowRight
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
  const [applications] = useAtom(applicationsAtom);
  const [activityLogs] = useAtom(activityLogsAtom);
  const [allUsers] = useAtom(usersAtom);
  
  // State for Navigation & Review
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = React.useState('');
  const [staffFilter, setStaffFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [reasonFilter, setRejectionReasonFilter] = React.useState('all');
  const [dateRange, setDateRange] = React.useState({ start: '', end: '' });

  // Calculate Application Duration (Turnaround Time)
  const getAppDuration = (app: Application) => {
    const start = parseISO(app.history[0]?.timestamp || app.submittedDate);
    const end = app.status === 'Archived' ? parseISO(app.lastUpdated) : new Date();
    
    const hours = differenceInHours(end, start);
    if (hours < 24) return `${hours}h`;
    const days = differenceInDays(end, start);
    return `${days}d ${hours % 24}h`;
  };

  // Logic for the full audit trail (System Logs + App History)
  const fullAuditTrail: AuditEntry[] = React.useMemo(() => {
    const entries: AuditEntry[] = [];

    // Add activity logs (logins, etc)
    activityLogs.forEach(log => {
        entries.push({
            timestamp: log.timestamp,
            user: log.userName,
            action: log.action,
            type: 'system'
        });
    });

    // Flatten application history
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

  // Filter Logic for Network Archive
  const filteredArchive = React.useMemo(() => {
    return applications.filter(app => {
        const matchesSearch = app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (app.details.accountNumber && app.details.accountNumber.includes(searchTerm));
        
        const matchesStaff = staffFilter === 'all' || 
                            app.submittedBy === staffFilter || 
                            app.history.some(h => h.user === staffFilter);
        
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        
        const matchesReason = reasonFilter === 'all' || 
                             app.history.some(h => h.notes && h.notes.includes(reasonFilter));

        let matchesDate = true;
        if (dateRange.start || dateRange.end) {
            const appDate = parseISO(app.submittedDate);
            if (dateRange.start && appDate < startOfDay(parseISO(dateRange.start))) matchesDate = false;
            if (dateRange.end && appDate > endOfDay(parseISO(dateRange.end))) matchesDate = false;
        }

        return matchesSearch && matchesStaff && matchesStatus && matchesReason && matchesDate;
    });
  }, [applications, searchTerm, staffFilter, statusFilter, reasonFilter, dateRange]);

  const monthlyStats = React.useMemo(() => {
    const summary: Record<string, MonthStat> = {};
    
    applications.forEach(app => {
      try {
        const monthKey = format(parseISO(app.submittedDate), 'MMMM yyyy');
        if (!summary[monthKey]) {
            summary[monthKey] = { total: 0, approved: 0, dispatched: 0, rejected: 0, pending: 0 };
        }
        
        summary[monthKey].total += 1;
        
        if (app.status === 'Archived' || app.status === 'Signed') {
            summary[monthKey].approved += 1;
            if (app.details.isDispatched) {
                summary[monthKey].dispatched += 1;
            }
        } else if (app.status === 'Rejected' || app.status === 'Rejected by Supervisor' || app.status === 'Rejected by ASL') {
            summary[monthKey].rejected += 1;
        } else {
            summary[monthKey].pending += 1;
        }
      } catch (e) {
        const key = 'Unknown Period';
        if (!summary[key]) summary[key] = { total: 0, approved: 0, dispatched: 0, rejected: 0, pending: 0 };
        summary[key].total += 1;
      }
    });

    return Object.entries(summary).sort((a, b) => {
      if (a[0] === 'Unknown Period') return 1;
      if (b[0] === 'Unknown Period') return -1;
      return new Date(b[0]).getTime() - new Date(a[0]).getTime();
    });
  }, [applications]);

  const stats = React.useMemo(() => {
    return {
      pendingAudit: applications.filter(a => a.status === 'Pending Compliance' || a.status === 'Sent to Risk & Compliance').length,
      totalRejections: applications.filter(a => a.status === 'Rejected' || a.status === 'Rejected by Supervisor').length,
      totalDispatched: applications.filter(a => a.details.isDispatched).length,
      totalAccounts: applications.length
    };
  }, [applications]);

  if (selectedApplication) {
    const appForReview = applications.find(a => a.id === selectedApplication.id) || selectedApplication;
    return <ApplicationReview application={appForReview} onBack={() => setSelectedApplication(null)} user={user} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Regulatory Audit Dashboard
          </h2>
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold">End-to-End Traceability & System Governance.</p>
        </div>
        <div className="flex gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1">
                <ShieldCheck className="mr-2 h-3 w-3" />
                Network Oversight Active
            </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">In Review</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{stats.pendingAudit}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase font-bold">Waitlist</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Active Accounts</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-green-500">{stats.totalDispatched}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase font-bold">Total Dispatches</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Rejections</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-destructive">{stats.totalRejections}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase font-bold">Regulatory Blocks</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/20 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-primary font-bold tracking-widest">Global Volume</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary">{stats.totalAccounts}</div>
            <p className="text-[10px] text-primary/40 mt-1 uppercase font-bold">All Submissions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="archive" className="w-full">
        <TabsList className="bg-black/20 p-1 mb-6 rounded-xl border border-white/5 w-full sm:w-auto overflow-x-auto justify-start h-auto flex-wrap">
          <TabsTrigger value="archive" className="flex items-center gap-2 px-6 h-10">
            <Archive className="h-4 w-4" /> 
            Network Archive
          </TabsTrigger>
          <TabsTrigger value="audit-log" className="flex items-center gap-2 px-6 h-10">
            <History className="h-4 w-4" /> 
            Full Activity Log
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2 px-6 h-10">
            <BarChart3 className="h-4 w-4" /> 
            Monthly Growth
          </TabsTrigger>
          <TabsTrigger value="rejections" className="flex items-center gap-2 px-6 h-10">
            <XCircle className="h-4 w-4" /> 
            Rejection Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="archive" className="animate-in fade-in duration-500">
          <Card className="border-none bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
            <CardHeader className="bg-white/5 border-b border-white/5 pb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                        <FileSearch className="h-5 w-5 text-primary" /> Forensic Archive
                    </CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-white/40 mt-1">Audit every document, dispatch, and assigned staff member.</CardDescription>
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                        <Input placeholder="Client, ID, or Account #..." className="pl-9 bg-black/40 border-white/10 text-white h-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="bg-black/40 border-white/10 text-white font-bold h-10">
                                <Filter className="mr-2 h-4 w-4 text-primary" /> Advanced Filters
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-slate-900 border-white/10 p-6 space-y-6 shadow-2xl">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Assigned Staff</label>
                                <Select value={staffFilter} onValueChange={setStaffFilter}>
                                    <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="All Staff" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Staff</SelectItem>
                                        {allUsers.map(u => <SelectItem key={u.id} value={u.name}>{u.name} ({u.role})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Regulatory Status</label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="Submitted">Originated</SelectItem>
                                        <SelectItem value="Pending Supervisor">Pending Audit</SelectItem>
                                        <SelectItem value="Archived">Dispatched</SelectItem>
                                        <SelectItem value="Rejected">Declined</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Start Date</label>
                                    <Input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))} className="bg-black/20 border-white/10 text-xs" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">End Date</label>
                                    <Input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))} className="bg-black/20 border-white/10 text-xs" />
                                </div>
                            </div>
                            <Button className="w-full font-black uppercase tracking-widest bg-primary text-primary-foreground h-10" onClick={() => {
                                setStaffFilter('all');
                                setStatusFilter('all');
                                setDateRange({start: '', end: ''});
                            }}>Reset Filters</Button>
                        </PopoverContent>
                    </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                    <TableHead className="pl-8 text-[10px] font-bold uppercase text-white/40 tracking-widest">Entity & Trace ID</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Staff Member</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/40 tracking-widest text-center">Process Duration</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Dispatch Status</TableHead>
                    <TableHead className="pr-8 text-right text-[10px] font-bold uppercase text-white/40 tracking-widest">Audit File</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArchive.map((app) => (
                    <TableRow key={app.id} className="border-white/5 hover:bg-white/10 transition-colors group">
                      <TableCell className="pl-8 py-5">
                        <div>
                          <p className="font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">{app.clientName}</p>
                          <p className="text-[10px] text-white/30 font-mono mt-1">{app.id} • {app.clientType}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-white/10 text-white/60 font-bold uppercase text-[9px]">{app.submittedBy}</Badge>
                            <ArrowRight className="h-2 w-2 text-white/20" />
                            <span className="text-[9px] text-white/20 font-mono uppercase tracking-tighter">{new Date(app.submittedDate).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex flex-col items-center p-2 rounded-lg bg-black/20 border border-white/5">
                            <span className="text-xs font-mono font-black text-primary">{getAppDuration(app)}</span>
                            <span className="text-[8px] uppercase font-bold text-white/20 tracking-widest">Time-In-Process</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {app.details.accountNumber ? (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-primary font-mono font-black tracking-tighter">
                                    <Wallet className="h-3 w-3" /> {app.details.accountNumber}
                                </div>
                                <span className="text-[8px] font-black uppercase text-green-500 tracking-[0.2em]">Dispatched OK</span>
                            </div>
                        ) : (
                            <Badge variant="outline" className="uppercase text-[9px] font-black tracking-widest border-amber-500/30 text-amber-500/60">
                                {app.status}
                            </Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <Button variant="ghost" size="sm" className="font-black uppercase tracking-widest h-9 hover:bg-primary hover:text-primary-foreground rounded-lg" onClick={() => setSelectedApplication(app)}>
                            <Eye className="mr-2 h-4 w-4" /> REVIEW
                        </Button>
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
                <CardHeader className="bg-white/5 border-b border-white/5">
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" /> Full Traceability Log
                    </CardTitle>
                    <CardDescription className="text-xs uppercase font-bold tracking-widest text-white/40 mt-1">Audit every discrete system action, login, and data mutation.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-[600px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-black/20 border-white/5">
                                    <TableHead className="pl-8 text-[10px] font-bold uppercase text-white/40">Timestamp</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase text-white/40">Staff Member</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase text-white/40">Action Performed</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase text-white/40">Record Target</TableHead>
                                    <TableHead className="pr-8 text-[10px] font-bold uppercase text-white/40">Regulatory Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fullAuditTrail.map((entry, idx) => (
                                    <TableRow key={idx} className="border-white/5 hover:bg-white/5 transition-colors group">
                                        <TableCell className="pl-8 py-4 text-[11px] text-white/40 font-mono">
                                            {new Date(entry.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-black text-primary border border-primary/20">{entry.user.substring(0,2)}</div>
                                                <span className="font-bold text-xs uppercase text-white/80">{entry.user}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={entry.type === 'system' ? 'secondary' : 'outline'} className="text-[9px] font-black uppercase tracking-widest py-0.5 px-2 border-white/10">
                                                {entry.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {entry.clientName ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black uppercase text-white/60 truncate max-w-[150px]">{entry.clientName}</span>
                                                    <span className="text-[9px] font-mono text-white/20">{entry.appId}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-white/20 uppercase font-black tracking-widest italic">System Level</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="pr-8 text-[11px] text-white/40 italic max-w-[250px] truncate">
                                            {entry.notes || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="summary" className="animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
              <CardHeader className="border-b border-white/5 pb-6 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black uppercase tracking-tight">Onboarding Velocity</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Growth trends and regulatory success rates by month.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                      <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-white/40">Calendar Month</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">Submissions</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">Final Accounts</TableHead>
                      <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-white/40">Audit Clearance Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyStats.map(([month, data]) => {
                      const rate = data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0;
                      return (
                        <TableRow key={month} className="border-white/5 hover:bg-white/5 transition-colors group">
                          <TableCell className="pl-8 py-6">
                            <span className="font-black text-white text-lg uppercase tracking-tight">{month}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                                <span className="text-xl font-black text-white">{data.total}</span>
                                <span className="text-[8px] text-white/20 uppercase font-bold tracking-widest mt-1">Requests</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                                <span className="text-xl font-black text-green-500">{data.dispatched}</span>
                                <span className="text-[8px] text-green-500/30 uppercase font-bold tracking-widest mt-1">Dispatches</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-8">
                            <Badge variant={rate > 70 ? 'success' : 'outline'} className="font-black text-sm px-3 shadow-md">
                              {rate}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="border-none bg-primary/5 border-primary/10 rounded-2xl shadow-xl overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                        <TrendingUp className="h-4 w-4" />
                        Clearance Efficiency
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        <div className="p-5 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Overall Conversion</p>
                                <Badge variant="secondary" className="text-[9px] font-black">{Math.round((stats.totalDispatched / stats.totalAccounts) * 100) || 0}%</Badge>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-1000" 
                                    style={{ width: `${(stats.totalDispatched / stats.totalAccounts) * 100 || 0}%` }} 
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Avg Onboarding TAT</span>
                                </div>
                                <span className="font-mono font-black text-white text-md">42.5h</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rejections" className="animate-in fade-in duration-500">
          <Card className="border-none bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
            <CardHeader className="bg-white/5 border-b border-white/5 pb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-destructive">
                        <ShieldAlert className="h-5 w-5" /> Rejection Audit Logs
                    </CardTitle>
                    <CardDescription className="text-xs uppercase font-bold tracking-widest text-white/40 mt-1">Audit trail of regulatory rejections and associated reasoning.</CardDescription>
                </div>
                <Select value={reasonFilter} onValueChange={setRejectionReasonFilter}>
                    <SelectTrigger className="w-full md:w-[250px] bg-black/20 border-white/10 text-white font-bold">
                        <SelectValue placeholder="Filter by Reason" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Reasons</SelectItem>
                        {rejectionReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                    <TableHead className="pl-8 text-[10px] font-bold uppercase text-white/40 tracking-widest">Applicant Detail</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Risk Category</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Rejection Reason</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Audit Date</TableHead>
                    <TableHead className="pr-8 text-right text-[10px] font-bold uppercase text-white/40 tracking-widest">File</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.filter(a => (a.status === 'Rejected' || a.status === 'Rejected by Supervisor') && (reasonFilter === 'all' || a.history.some(h => h.notes && h.notes.includes(reasonFilter)))).map((app) => {
                    const rejectionLog = app.history.find(h => h.action.includes('Rejected'));
                    return (
                      <TableRow key={app.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                        <TableCell className="pl-8 py-5">
                          <div>
                            <p className="font-black text-white/70 uppercase tracking-tight">{app.clientName}</p>
                            <p className="text-[10px] text-white/30 font-mono mt-1">{app.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="uppercase text-[9px] border-destructive/30 text-destructive font-black tracking-widest px-3">
                            {app.fcbStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                            <p className="text-[11px] text-white/60 font-bold uppercase leading-tight line-clamp-2">
                                {rejectionLog?.notes?.replace('Reason: ', '') || 'Regulatory Document Discrepancy'}
                            </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-white/40 font-mono">{rejectionLog ? new Date(rejectionLog.timestamp).toLocaleDateString() : 'N/A'}</p>
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                          <Button variant="ghost" size="sm" className="h-9 hover:bg-white/10" onClick={() => setSelectedApplication(app)}>
                            <FileSearch className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
