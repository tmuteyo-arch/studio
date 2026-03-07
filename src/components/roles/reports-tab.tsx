'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';

import { Application } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { FileDown, FileSpreadsheet } from 'lucide-react';

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
  const signedApplications = React.useMemo(() =>
    applications.filter(app => app.status === 'Signed')
  , [applications]);

  const monthlyData = React.useMemo(() => {
    const months: Record<string, number> = {};
    signedApplications.forEach(app => {
      const month = format(new Date(app.lastUpdated), 'MMM yyyy');
      months[month] = (months[month] || 0) + 1;
    });
    return Object.keys(months).map(month => ({
      month,
      count: months[month],
    })).sort((a, b) => new Date(a.month).valueOf() - new Date(b.month).valueOf());
  }, [signedApplications]);
  
  const handleDownloadCsv = () => {
    const headers = ['DATE', 'CONTACT PERSON', 'REGION', 'ADDRESS'];
    const rows = signedApplications.map(app => {
        const isCorporate = !['Personal Account', 'Proprietorship / Sole Trader'].includes(app.clientType);
        
        const date = format(new Date(app.lastUpdated), 'yyyy-MM-dd');
        const contactPerson = app.clientName;
        const region = app.region;
        const address = isCorporate ? app.details.physicalAddress : app.details.individualAddress;
        
        return [date, contactPerson, region, address].map(field => `"${(field || '').replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Final_Onboarding_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                Final Onboarding Report
            </CardTitle>
            <CardDescription>Detailed export of finalized agent agreements for regulatory filing.</CardDescription>
          </div>
          <Button onClick={handleDownloadCsv} className="bg-green-600 hover:bg-green-700 text-white font-bold" disabled={signedApplications.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            Download Final Report (Excel/CSV)
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Finalized</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signedApplications.length > 0 ? signedApplications.map(app => {
                const isCorporate = !['Personal Account', 'Proprietorship / Sole Trader'].includes(app.clientType);
                return (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{format(new Date(app.lastUpdated), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>{app.clientName}</TableCell>
                    <TableCell>{app.region}</TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[250px]">
                        {isCorporate ? app.details.physicalAddress : app.details.individualAddress}
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No signed applications to report.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Bar Graphs</CardTitle>
          <CardDescription>Visual summary of finalized onboarding per month.</CardDescription>
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
