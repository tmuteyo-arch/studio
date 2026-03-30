'use client';
import * as React from 'react';
import { differenceInHours, parseISO, isSameMonth, isSameQuarter } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Application } from '@/lib/mock-data';
import { Briefcase, Clock, CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';
import { User } from '@/lib/users';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface BackOfficeAppraisalProps {
  applications: Application[];
  team: User[];
}

type AppraisalData = {
  name: string;
  initials: string;
  processed: number;
  approved: number; // Escalated to supervisor
  returned: number;
  completed: number; // Finalized records
  avgProcessingHours: number | null;
};

export default function BackOfficeAppraisal({ applications, team }: BackOfficeAppraisalProps) {
  const [period, setPeriod] = React.useState('all-time');

  const appraisalData: AppraisalData[] = React.useMemo(() => {
    if (!team) return [];

    const now = new Date();
    const filteredApps = applications.filter(app => {
        if (period === 'all-time') return true;
        const updatedDate = parseISO(app.lastUpdated);
        if (period === 'monthly') return isSameMonth(updatedDate, now);
        if (period === 'quarterly') return isSameQuarter(updatedDate, now);
        return true;
    });

    return team.map((member) => {
      const processedAppIds = new Set<string>();
      let totalHours = 0;
      let appCountWithTat = 0;
      let approvedCount = 0;
      let returnedCount = 0;
      let completedCount = 0;
      
      filteredApps.forEach(app => {
        // Find actions by this specific clerk
        const clerkActions = app.history.filter(h => h.user === member.name);
        
        if (clerkActions.length > 0) {
          processedAppIds.add(app.id);

          // Count specific outcomes
          if (clerkActions.some(h => h.action === 'Sent to Supervisor' || h.action === 'Pending Supervisor')) {
            approvedCount++;
          }
          if (clerkActions.some(h => h.action === 'Returned to ATL' || h.action === 'Returned to ASL')) {
            returnedCount++;
          }
          
          // Total Completed: clerk touched it AND it's now Archived
          if (app.status === 'Archived') {
            completedCount++;
          }
          
          // Calculate TAT: Time from "Submitted" to the clerk's first action
          const submittedLog = app.history.find(h => h.action === 'Submitted' || h.action === 'Sent to Back Office');
          const firstClerkAction = clerkActions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
          
          if (submittedLog && firstClerkAction) {
            const startTime = parseISO(submittedLog.timestamp);
            const endTime = parseISO(firstClerkAction.timestamp);
            const diff = differenceInHours(endTime, startTime);
            if (diff >= 0) {
                totalHours += diff;
                appCountWithTat++;
            }
          }
        }
      });
      
      const avgProcessingHours = appCountWithTat > 0 ? Math.round(totalHours / appCountWithTat) : null;

      return {
        name: member.name,
        initials: member.initials,
        processed: processedAppIds.size,
        approved: approvedCount,
        returned: returnedCount,
        completed: completedCount,
        avgProcessingHours,
      };
    });
  }, [applications, team, period]);

  return (
    <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md overflow-hidden rounded-2xl">
      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/5 pb-6">
        <div>
            <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight text-white">
                <BarChart3 className="h-6 w-6 text-primary" />
                Clerk Performance KPIs
            </CardTitle>
            <CardDescription className="text-white/40 uppercase text-[10px] font-bold tracking-widest mt-1">
                Productivity tracking for the Back Office team.
            </CardDescription>
        </div>
         <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-[180px] mt-4 sm:mt-0 bg-black/20 border-white/10 text-white font-bold">
                <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="all-time" className="font-bold">All Time</SelectItem>
                <SelectItem value="monthly" className="font-bold">This Month</SelectItem>
                <SelectItem value="quarterly" className="font-bold">This Quarter</SelectItem>
            </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-black/20 border-white/5 hover:bg-black/20">
              <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest pl-8">Clerk</TableHead>
              <TableHead className="text-center text-white/40 uppercase text-[10px] font-black tracking-widest">Processed</TableHead>
              <TableHead className="text-center text-white/40 uppercase text-[10px] font-black tracking-widest">Approved</TableHead>
              <TableHead className="text-center text-white/40 uppercase text-[10px] font-black tracking-widest">Returned</TableHead>
              <TableHead className="text-center text-white/40 uppercase text-[10px] font-black tracking-widest">Total Completed</TableHead>
              <TableHead className="text-right text-white/40 uppercase text-[10px] font-black tracking-widest pr-8">Avg. TAT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appraisalData.map(data => (
              <TableRow key={data.name} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="font-medium flex items-center gap-3 py-5 pl-8">
                    <Avatar className="h-9 w-9 border-2 border-white/10 shadow-sm">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">{data.initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-black text-white uppercase tracking-tight">{data.name}</span>
                </TableCell>
                <TableCell className="text-center">
                    <Badge variant="outline" className="font-mono text-white/60 border-white/10">{data.processed}</Badge>
                </TableCell>
                <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                        <span className="font-black text-green-500 text-lg">{data.approved}</span>
                        <span className="text-[8px] text-white/20 uppercase font-bold">Verified</span>
                    </div>
                </TableCell>
                <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                        <span className="font-black text-amber-500 text-lg">{data.returned}</span>
                        <span className="text-[8px] text-white/20 uppercase font-bold">Corrections</span>
                    </div>
                </TableCell>
                <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                        <Badge className="bg-white/10 text-white font-black hover:bg-white/20">{data.completed}</Badge>
                        <span className="text-[8px] text-white/20 uppercase font-bold mt-1">Archived</span>
                    </div>
                </TableCell>
                <TableCell className="text-right pr-8">
                    {data.avgProcessingHours !== null ? (
                        <div className="flex flex-col items-end">
                            <span className={cn(
                                "font-black text-lg flex items-center gap-1.5",
                                data.avgProcessingHours > 24 ? "text-destructive" : "text-primary"
                            )}>
                                <Clock className="h-3 w-3" />
                                {data.avgProcessingHours}h
                            </span>
                            <span className="text-[8px] text-white/20 uppercase font-bold">Per Application</span>
                        </div>
                    ) : (
                        <span className="text-white/20 italic text-xs">No Data</span>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
         {appraisalData.length === 0 && (
            <div className="flex flex-col items-center justify-center p-24 text-center">
                <BarChart3 className="h-12 w-12 text-white/5 mb-4" />
                <p className="text-white/20 font-black uppercase tracking-widest italic">No data found for this period.</p>
            </div>
         )}
      </CardContent>
    </Card>
  );
}
