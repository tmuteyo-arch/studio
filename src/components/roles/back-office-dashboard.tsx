'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function BackOfficeDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Back Office Dashboard</h2>
        <p className="text-muted-foreground">Review and validate incoming applications.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Application Queue</CardTitle>
          <CardDescription>Applications waiting for your review and validation.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-12 text-center">
          <p className="text-lg text-muted-foreground">There are no pending applications in your queue.</p>
        </CardContent>
      </Card>
    </div>
  );
}
