'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Application } from '@/lib/mock-data';
import { Pie, PieChart, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Users } from 'lucide-react';

interface TeamPerformanceChartProps {
  applications: Application[];
  team: string[];
}

const chartConfig = {
  applications: {
    label: 'Applications',
  },
} satisfies ChartConfig;

export default function TeamPerformanceChart({ applications, team }: TeamPerformanceChartProps) {
  const performanceData = React.useMemo(() => {
    return team.map((atlName, index) => {
      const processedByAtl = applications.filter(app => app.submittedBy === atlName && (app.status === 'Approved' || app.status === 'Rejected')).length;
      return {
        name: atlName,
        total: processedByAtl,
        fill: `hsl(var(--chart-${index + 1}))`,
      };
    }).filter(d => d.total > 0);
  }, [applications, team]);
  
  if (team.length === 0 || performanceData.length === 0) {
    return null;
  }
  
  // Dynamically add team members to chart config for tooltips
  performanceData.forEach(item => {
    chartConfig[item.name as keyof typeof chartConfig] = {
      label: item.name,
      color: item.fill,
    }
  });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Workload Distribution
        </CardTitle>
        <CardDescription>
            A breakdown of the total applications processed by each team member.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
         <ChartContainer config={chartConfig} className="h-40 w-full max-w-xs">
            <ResponsiveContainer>
              <PieChart>
                <ChartTooltip 
                  cursor={false}
                  content={<ChartTooltipContent nameKey="name" hideLabel />} 
                />
                <Pie 
                  data={performanceData} 
                  dataKey="total" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={60} 
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
