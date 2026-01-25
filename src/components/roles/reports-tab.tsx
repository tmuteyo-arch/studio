'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';

import { Application } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { FileDown } from 'lucide-react';

interface ReportsTabProps {
  applications: Application[];
}

const chartConfig = {
  count: {
    label: 'Applications',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function ReportsTab({ applications }: ReportsTabProps) {
  const approvedApplications = React.useMemo(() =>
    applications.filter(app => app.status === 'Approved' || app.status === 'Signed')
  , [applications]);

  const monthlyData = React.useMemo(() => {
    const months: Record<string, number> = {};
    approvedApplications.forEach(app => {
      const month = format(new Date(app.lastUpdated), 'MMM yyyy');
      months[month] = (months[month] || 0) + 1;
    });
    return Object.keys(months).map(month => ({
      month,
      count: months[month],
    })).sort((a, b) => new Date(a.month).valueOf() - new Date(b.month).valueOf());
  }, [approvedApplications]);
  
  const handleDownloadCsv = () => {
    const headers = ['Name', 'Address', 'Mobile Number', 'Date Opened'];
    const rows = approvedApplications.map(app => {
        const isCorporate = !['Personal Account', 'Proprietorship / Sole Trader'].includes(app.clientType);
        const name = app.clientName;
        const address = isCorporate ? app.details.physicalAddress : app.details.individualAddress;
        const mobile = isCorporate ? app.details.businessTelNumber : app.details.individualMobileNumber;
        const dateOpened = format(new Date(app.lastUpdated), 'yyyy-MM-dd');
        return [name, address, mobile, dateOpened].map(field => `"${(field || '').replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `approved_applications_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Approved Applications Report</CardTitle>
            <CardDescription>A detailed list of all approved and signed applications.</CardDescription>
          </div>
          <Button onClick={handleDownloadCsv} variant="outline" size="sm" disabled={approvedApplications.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Date Opened</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedApplications.length > 0 ? approvedApplications.map(app => {
                const isCorporate = !['Personal Account', 'Proprietorship / Sole Trader'].includes(app.clientType);
                return (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.clientName}</TableCell>
                    <TableCell>{isCorporate ? app.details.physicalAddress : app.details.individualAddress}</TableCell>
                    <TableCell>{isCorporate ? app.details.businessTelNumber : app.details.individualMobileNumber}</TableCell>
                    <TableCell>{format(new Date(app.lastUpdated), 'PPP')}</TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No approved applications to report.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Application Volume</CardTitle>
          <CardDescription>A summary of approved applications per month.</CardDescription>
        </CardHeader>
        <CardContent>
            {monthlyData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-64 w-full">
                    <ResponsiveContainer>
                        <BarChart data={monthlyData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            ) : (
                <div className="flex items-center justify-center p-12 text-center">
                  <p className="text-muted-foreground">No data available for chart.</p>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
