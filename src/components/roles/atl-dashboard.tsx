'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AtlDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">ATL Dashboard</h2>
        <p className="text-muted-foreground">Submit and track new account applications.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, ATL!</CardTitle>
          <CardDescription>You can start a new application or view the status of your existing submissions.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-lg text-muted-foreground mb-6">No active applications. Start by creating a new one.</p>
            <Button>New Application</Button>
        </CardContent>
      </Card>
    </div>
  );
}
