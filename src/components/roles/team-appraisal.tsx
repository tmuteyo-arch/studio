'use client';
import * as React from 'react';
import { differenceInHours, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Application } from '@/lib/mock-data';
import { Award } from 'lucide-react';
import { User } from '@/lib/users';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface TeamAppraisalProps {
  applications: Application[];
  team: User[];
}

type AppraisalData = {
  name: string;
  initials: string;
  submitted: number;
  approved: number;
  rejected: number;
  avgTurnaroundHours: number | null;
};

export default function TeamAppraisal({ applications, team }: TeamAppraisalProps) {
  const appraisalData: AppraisalData[] = React.useMemo(() => {
    if (!team) return [];
    return team.map((member) => {
      const memberApps = applications.filter(app => app.submittedBy === member.name);
      
      const processedApps = memberApps.filter(app => app.status === 'Approved' || app.status === 'Rejected');

      let totalHours = 0;
      let appCountWithTurnaround = 0;

      processedApps.forEach(app => {
        const submittedLog = app.history.find(h => h.action === 'Submitted');
        // Find the final approval or rejection log
        const finalLog = app.history.slice().reverse().find(h => h.action === 'Approved' || h.action === 'Rejected');
        
        if (submittedLog && finalLog) {
          const startTime = parseISO(submittedLog.timestamp);
          const endTime = parseISO(finalLog.timestamp);
          totalHours += differenceInHours(endTime, startTime);
          appCountWithTurnaround++;
        }
      });
      
      const avgTurnaroundHours = appCountWithTurnaround > 0 ? Math.round(totalHours / appCountWithTurnaround) : null;

      return {
        name: member.name,
        initials: member.initials,
        submitted: memberApps.length,
        approved: memberApps.filter(app => app.status === 'Approved').length,
        rejected: memberApps.filter(app => app.status === 'Rejected').length,
        avgTurnaroundHours: avgTurnaroundHours,
      };
    });
  }, [applications, team]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Team Appraisal
        </CardTitle>
        <CardDescription>
          Performance metrics for each Account Taking Leader on your team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ATL</TableHead>
              <TableHead className="text-center">Submitted</TableHead>
              <TableHead className="text-center">Approved</TableHead>
              <TableHead className="text-center">Rejected</TableHead>
              <TableHead className="text-right">Avg. Turnaround (Hours)</TableHead>
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
                <TableCell className="text-center font-semibold">{data.submitted}</TableCell>
                <TableCell className="text-center font-semibold text-green-500">{data.approved}</TableCell>
                <TableCell className="text-center font-semibold text-red-500">{data.rejected}</TableCell>
                <TableCell className="text-right font-semibold">{data.avgTurnaroundHours !== null ? `${data.avgTurnaroundHours}h` : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
         {appraisalData.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
                No team data to appraise.
            </div>
         )}
      </CardContent>
    </Card>
  );
}
