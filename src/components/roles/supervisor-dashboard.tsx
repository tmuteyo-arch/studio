'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SupervisorDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Supervisor Dashboard</h2>
        <p className="text-muted-foreground">Review, approve, or reject applications.</p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Approval Queue</CardTitle>
          <CardDescription>Applications waiting for your final approval.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-12 text-center">
          <p className="text-lg text-muted-foreground">There are no applications pending your approval.</p>
        </CardContent>
      </Card>
    </div>
  );
}
