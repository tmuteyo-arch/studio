'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Application } from '@/lib/mock-data';
import { BarChart, Folder, CheckSquare } from 'lucide-react';
import { accountTypes } from '@/lib/types';

interface AccountSummaryReportProps {
  applications: Application[];
}

export default function AccountSummaryReport({ applications }: AccountSummaryReportProps) {
  const reportData = React.useMemo(() => {
    const totalReceived = applications.length;
    const totalCompleted = applications.filter(app => app.status === 'Approved').length;
    
    const breakdown = applications.reduce((acc, app) => {
      acc[app.clientType] = (acc[app.clientType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalReceived, totalCompleted, breakdown };
  }, [applications]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><BarChart /> Account Summary Report</CardTitle>
        <CardDescription>A summary of accounts received, completed, and breakdown by client category.</CardDescription>
      </CardHeader>
      <CardContent>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-muted/30 rounded-lg flex items-center gap-4">
                <Folder className="h-8 w-8 text-primary" />
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Accounts Received</h4>
                    <p className="text-2xl font-bold">{reportData.totalReceived}</p>
                </div>
            </div>
             <div className="p-4 bg-muted/30 rounded-lg flex items-center gap-4">
                <CheckSquare className="h-8 w-8 text-green-500" />
                 <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Accounts Completed</h4>
                    <p className="text-2xl font-bold">{reportData.totalCompleted}</p>
                 </div>
            </div>
        </div>

        <h3 className="font-semibold mb-2">Breakdown by Client Category</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Category</TableHead>
              <TableHead className="text-right">Total Accounts Opened</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountTypes.map(type => (
              <TableRow key={type}>
                <TableCell className="font-medium">{type}</TableCell>
                <TableCell className="text-right font-semibold">{reportData.breakdown[type] || 0}</TableCell>
              </TableRow>
            ))}
             <TableRow className="bg-muted/50 font-bold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{reportData.totalReceived}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
