'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { applicationsAtom, Application } from '@/lib/mock-data';
import { users as allUsers, User } from '@/lib/users';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Clock, 
  ShieldCheck,
  LayoutDashboard,
  Server
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO } from 'date-fns';

interface AdminDashboardProps {
  user: User;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [applications] = useAtom(applicationsAtom);

  const stats = React.useMemo(() => {
    const approved = applications.filter(a => a.status === 'Signed' || a.status === 'Archived').length;
    const rejected = applications.filter(a => a.status === 'Rejected').length;
    
    return {
      totalUsers: allUsers.length,
      totalApps: applications.length,
      approved,
      rejected,
      pending: applications.length - (approved + rejected)
    };
  }, [applications]);

  const globalActivity = React.useMemo(() => {
    const allLogs = applications.flatMap(app => 
      app.history.map(log => ({
        ...log,
        clientName: app.clientName,
        appId: app.id
      }))
    );
    return allLogs.sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()).slice(0, 20);
  }, [applications]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Portal</h2>
          <p className="text-muted-foreground">System-wide monitoring and audit controls.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1">
            <Server className="mr-2 h-3 w-3" />
            System Live
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total System Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold">Active profiles</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Approved Apps</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.approved}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold">Success rate: {Math.round((stats.approved / stats.totalApps) * 100)}%</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rejected Apps</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold">Risk mitigation</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Pipeline</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.pending}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold">Processing load</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            System Overview
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6">
            <Card className="shadow-md">
              <CardHeader className="border-b border-white/5 bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Recent System Activity
                </CardTitle>
                <CardDescription>Live feed of onboarding events across all regions.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="pl-6">Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead className="text-right pr-6">Ref ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {globalActivity.map((log, idx) => (
                      <TableRow key={`${log.appId}-${idx}`} className="hover:bg-muted/5">
                        <TableCell className="pl-6 font-mono text-[10px] text-muted-foreground">
                          {format(parseISO(log.timestamp), 'yyyy-MM-dd HH:mm')}
                        </TableCell>
                        <TableCell className="font-bold">{log.user}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-5">
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{log.clientName}</TableCell>
                        <TableCell className="text-right pr-6 font-mono text-[10px]">{log.appId}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Logs</CardTitle>
              <CardDescription>Full history of transactional changes.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">Extended audit logs are available for CSV export in the "Audit Reports" module (Coming Soon).</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
