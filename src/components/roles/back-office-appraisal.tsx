'use client';
import * as React from 'react';
import { differenceInHours, parseISO, isSameMonth, isSameQuarter } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Application } from '@/lib/mock-data';
import { Briefcase } from 'lucide-react';
import { User } from '@/lib/users';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BackOfficeAppraisalProps {
  applications: Application[];
  team: User[];
}

type AppraisalData = {
  name: string;
  initials: string;
  processed: number;
  escalated: number;
  returned: number;
  avgProcessingHours: number | null;
};

export default function BackOfficeAppraisal({ applications, team }: BackOfficeAppraisalProps) {
  const [period, setPeriod] = React.useState('all-time');

  const appraisalData: AppraisalData[] = React.useMemo(() => {
    if (!team) return [];

    const now = new Date();
    // Filter applications based on when they were last updated for relevance to the period
    const filteredApps = applications.filter(app => {
        if (period === 'all-time') return true;
        const updatedDate = parseISO(app.lastUpdated);
        if (period === 'monthly') return isSameMonth(updatedDate, now);
        if (period === 'quarterly') return isSameQuarter(updatedDate, now);
        return true;
    });

    return team.map((member) => {
      // Find all applications this clerk has an action on
      const processedApps = new Set<Application>();
      let totalHours = 0;
      let appCountWithTat = 0;
      let escalatedCount = 0;
      let returnedCount = 0;
      
      filteredApps.forEach(app => {
        // Find the first action by a back-office user
        const boAction = app.history.find(h => h.user === member.name && (h.action === 'Pending Supervisor' || h.action === 'Returned to ATL'));
        
        if (boAction) {
          processedApps.add(app);

          if (boAction.action === 'Pending Supervisor') escalatedCount++;
          if (boAction.action === 'Returned to ATL') returnedCount++;
          
          // Calculate TAT from submission to this action
          const submittedLog = app.history.find(h => h.action === 'Submitted');
          if (submittedLog) {
            const startTime = parseISO(submittedLog.timestamp);
            const endTime = parseISO(boAction.timestamp);
            totalHours += differenceInHours(endTime, startTime);
            appCountWithTat++;
          }
        }
      });
      
      const avgProcessingHours = appCountWithTat > 0 ? Math.round(totalHours / appCountWithTat) : null;

      return {
        name: member.name,
        initials: member.initials,
        processed: processedApps.size,
        escalated: escalatedCount,
        returned: returnedCount,
        avgProcessingHours,
      };
    });
  }, [applications, team, period]);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
        <div>
            <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Back Office Appraisal
            </CardTitle>
            <CardDescription>
                Performance metrics for each Back Office Clerk on your team.
            </CardDescription>
        </div>
         <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-[180px] mt-4 sm:mt-0">
                <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="quarterly">This Quarter</SelectItem>
            </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clerk</TableHead>
              <TableHead className="text-center">Apps Processed</TableHead>
              <TableHead className="text-center">Escalated</TableHead>
              <TableHead className="text-center">Returned</TableHead>
              <TableHead className="text-right">Avg. Processing TAT (Hours)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appraisalData.map(data => (
              <TableRow key={data.name}>
                <TableCell className="font-medium flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{data.initials}</AvatarFallback>
                    </Avatar>
                    {data.name}
                </TableCell>
                <TableCell className="text-center font-semibold">{data.processed}</TableCell>
                <TableCell className="text-center font-semibold text-green-500">{data.escalated}</TableCell>
                <TableCell className="text-center font-semibold text-amber-500">{data.returned}</TableCell>
                <TableCell className="text-right font-semibold">{data.avgProcessingHours !== null ? `${data.avgProcessingHours}h` : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
         {appraisalData.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
                No Back Office data to appraise for the selected period.
            </div>
         )}
      </CardContent>
    </Card>
  );
}
