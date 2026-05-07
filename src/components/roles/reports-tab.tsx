'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';

import { Application } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { FileDown, FileSpreadsheet, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ReportsTabProps {
  applications: Application[];
}

const chartConfig = {
  count: {
    label: 'Volume',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function ReportsTab({ applications }: ReportsTabProps) {
  const processedApplications = React.useMemo(() =>
    applications.filter(app => ['Locked', 'Dispatched', 'Approved', 'Rejected'].includes(app.status))
  , [applications]);

  const monthlyData = React.useMemo(() => {
    const months: Record<string, number> = {};
    processedApplications.forEach(app => {
      const month = format(new Date(app.lastUpdated), 'MMM yyyy');
      months[month] = (months[month] || 0) + 1;
    });
    return Object.keys(months).map(month => ({
      month,
      count: months[month],
    })).sort((a, b) => new Date(a.month).valueOf() - new Date(b.month).valueOf());
  }, [processedApplications]);
  
  const handleDownloadCsv = () => {
    const headers = ['APP_ID', 'CLIENT', 'TYPE', 'STATUS', 'DATE_FINALIZED', 'STAFF'];
    const rows = processedApplications.map(app => [
        app.id,
        app.clientName,
        app.clientType,
        app.status,
        format(new Date(app.lastUpdated), 'yyyy-MM-dd'),
        app.submittedBy
    ].map(field => `"${(field || '').replace(/"/g, '""')}"`).join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Registry_Onboarding_Report_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card className="border-none bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/5 p-8">
          <div>
            <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
                Registry Final Report
            </CardTitle>
            <CardDescription className="text-xs uppercase font-bold tracking-widest text-white/40 mt-1">Official export of processed agent records for regulatory compliance.</CardDescription>
          </div>
          <Button onClick={handleDownloadCsv} className="h-12 bg-primary text-primary-foreground font-black uppercase tracking-widest px-8 shadow-xl rounded-xl" disabled={processedApplications.length === 0}>
            <Download className="mr-2 h-5 w-5" />
            EXPORT REGISTRY (CSV)
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-black/20 border-white/5">
                <TableHead className="pl-8 text-[10px] font-black uppercase text-white/40">Processed Date</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40">Entity Name</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40">Staff Member</TableHead>
                <TableHead className="text-right pr-8 text-[10px] font-black uppercase text-white/40">Regulatory State</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedApplications.length > 0 ? processedApplications.map(app => (
                <TableRow key={app.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell className="pl-8 py-5 text-xs text-white/40 font-mono">
                      {format(new Date(app.lastUpdated), 'yyyy-MM-dd')}
                  </TableCell>
                  <TableCell>
                      <div className="font-black text-white uppercase group-hover:text-primary transition-colors">{app.clientName}</div>
                      <div className="text-[10px] text-white/20 font-mono uppercase">{app.id}</div>
                  </TableCell>
                  <TableCell>
                      <Badge variant="outline" className="text-[9px] border-white/10 uppercase text-white/40">{app.submittedBy}</Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                      <Badge variant={app.status === 'Rejected' ? 'destructive' : 'success'} className="font-black uppercase text-[9px] tracking-widest px-3 py-1">
                          {app.status}
                      </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-48 text-center text-white/20 font-black uppercase tracking-widest">
                        No processed records for this period.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card className="border-none bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
        <CardHeader className="bg-white/5 p-8 border-b border-white/5">
          <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Onboarding Volume Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10">
            {monthlyData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-64 w-full">
                    <ResponsiveContainer>
                        <BarChart data={monthlyData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.05} />
                            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} className="text-[10px] font-black uppercase text-white/30" />
                            <YAxis tickLine={false} axisLine={false} className="text-[10px] font-black text-white/30" />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={6} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center text-white/10">
                  <TrendingUp className="h-12 w-12 mb-4" />
                  <p className="font-black uppercase tracking-widest">Awaiting technical growth data.</p>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

