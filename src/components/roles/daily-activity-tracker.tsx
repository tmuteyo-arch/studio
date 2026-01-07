'use client';
import * as React from 'react';
import { isToday, isSameDay, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Application } from '@/lib/mock-data';
import { Activity, ArrowDown, ArrowUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DailyActivityTrackerProps {
  applications: Application[];
}

export default function DailyActivityTracker({ applications }: DailyActivityTrackerProps) {
  const todayStats = React.useMemo(() => {
    const now = new Date();
    const submittedToday = applications.filter(app => isSameDay(parseISO(app.submittedDate), now)).length;
    
    const processedToday = applications.filter(app => {
        // Check if lastUpdated is today and the status is not 'Submitted'
        const lastUpdatedDate = parseISO(app.lastUpdated);
        return isToday(lastUpdatedDate) && app.status !== 'Submitted';
    }).length;

    const total = submittedToday + processedToday;
    const submittedPercentage = total > 0 ? (submittedToday / total) * 100 : 0;

    return {
      submittedToday,
      processedToday,
      totalToday: total,
      submittedPercentage,
    };
  }, [applications]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Daily Activity Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                <ArrowDown className="h-4 w-4 text-blue-500"/>
                Submitted Today
            </h3>
            <p className="text-3xl font-bold">{todayStats.submittedToday}</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                <ArrowUp className="h-4 w-4 text-green-500"/>
                Processed Today
            </h3>
            <p className="text-3xl font-bold">{todayStats.processedToday}</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="text-sm font-medium text-muted-foreground">Total Actions Today</h3>
            <p className="text-3xl font-bold">{todayStats.totalToday}</p>
          </div>
        </div>
         {todayStats.totalToday > 0 && (
            <div className='mt-4'>
                <Progress value={todayStats.submittedPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{todayStats.submittedToday} New</span>
                    <span>{todayStats.processedToday} Processed</span>
                </div>
            </div>
         )}
      </CardContent>
    </Card>
  );
}
