'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Application } from '@/lib/mock-data';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Users } from 'lucide-react';

interface TeamPerformanceChartProps {
  applications: Application[];
  team: string[];
}

const chartConfig = {
  approved: {
    label: 'Approved',
    color: 'hsl(var(--chart-2))',
  },
  rejected: {
    label: 'Rejected',
    color: 'hsl(var(--destructive))',
  },
} satisfies ChartConfig;

export default function TeamPerformanceChart({ applications, team }: TeamPerformanceChartProps) {
  const performanceData = React.useMemo(() => {
    return team.map(atlName => {
      const submittedByAtl = applications.filter(app => app.submittedBy === atlName);
      const approved = submittedByAtl.filter(app => app.status === 'Approved').length;
      const rejected = submittedByAtl.filter(app => app.status === 'Rejected').length;
      return {
        name: atlName,
        approved,
        rejected,
        total: approved + rejected,
      };
    });
  }, [applications, team]);
  
  if (team.length === 0) {
    return null; // Don't render the chart if there's no team
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Performance Analytics
        </CardTitle>
        <CardDescription>
            A breakdown of completed applications (approved vs. rejected) by team member.
        </CardDescription>
      </CardHeader>
      <CardContent>
         <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <ResponsiveContainer>
                <BarChart data={performanceData} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="name"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.split(' ')[0]} // Show only first name
                    />
                    <YAxis />
                    <ChartTooltip 
                        cursor={false}
                        content={<ChartTooltipContent />} 
                    />
                    <Bar dataKey="approved" fill="var(--color-approved)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rejected" fill="var(--color-rejected)" radius={[4, 4, 0, 0]}/>
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
