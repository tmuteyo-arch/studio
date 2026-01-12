'use client';
import * as React from 'react';
import { isToday, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Application } from '@/lib/mock-data';
import { Activity, ArrowDown, ArrowUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

interface DailyActivityTrackerProps {
  applications: Application[];
}

export default function DailyActivityTracker({ applications }: DailyActivityTrackerProps) {
  const { submittedToday, processedToday } = React.useMemo(() => {
    const submittedToday = applications.filter(app => isToday(parseISO(app.submittedDate))).length;
    
    const processedToday = applications.filter(app => {
        return isToday(parseISO(app.lastUpdated)) && app.status !== 'Submitted';
    }).length;

    return {
      submittedToday,
      processedToday,
    };
  }, [applications]);

  const chartData = [
    { name: 'Submitted', value: submittedToday, fill: 'hsl(var(--chart-1))' },
    { name: 'Processed', value: processedToday, fill: 'hsl(var(--chart-2))' },
  ];

  const chartConfig = {
    value: {
      label: 'Applications',
    },
    Submitted: {
      label: 'Submitted',
      color: 'hsl(var(--chart-1))',
    },
    Processed: {
      label: 'Processed',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;
  
  const totalToday = submittedToday + processedToday;
  const submittedPercentage = totalToday > 0 ? (submittedToday / totalToday) * 100 : 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Daily Activity Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                <ArrowDown className="h-4 w-4 text-blue-500"/>
                Submitted Today
            </h3>
            <p className="text-3xl font-bold">{submittedToday}</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                <ArrowUp className="h-4 w-4 text-green-500"/>
                Processed Today
            </h3>
            <p className="text-3xl font-bold">{processedToday}</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg flex flex-col items-center justify-center">
             <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Actions Today: {totalToday}</h3>
            {totalToday > 0 ? (
               <ChartContainer config={chartConfig} className="h-24 w-24">
                <ResponsiveContainer>
                    <PieChart>
                    <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={25}
                        strokeWidth={5}
                    />
                    </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-2xl font-bold">-</p>
            )}
          </div>
        </div>
         {totalToday > 0 && (
            <div className='mt-4'>
                <Progress value={submittedPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{submittedToday} New</span>
                    <span>{processedToday} Processed</span>
                </div>
            </div>
         )}
      </CardContent>
    </Card>
  );
}
