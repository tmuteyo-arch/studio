'use client';
import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { applicationsAtom, ApplicationStatus } from '@/lib/mock-data';
import { User } from '@/lib/users';
import { CheckCircle2, AlertCircle, Inbox, BarChart, FileSignature } from 'lucide-react';


interface RetailExecutiveDashboardProps {
    user: User;
}

export default function RetailExecutiveDashboard({ user }: RetailExecutiveDashboardProps) {
    const [applications] = useAtom(applicationsAtom);

    const summaryStats = React.useMemo(() => {
        const pendingStatuses: ApplicationStatus[] = ['Submitted', 'In Review', 'Returned to ATL', 'Pending Supervisor'];
        return {
            totalPending: applications.filter(a => pendingStatuses.includes(a.status)).length,
            totalApproved: applications.filter(a => a.status === 'Approved').length,
            totalRejected: applications.filter(a => a.status === 'Rejected').length,
            totalApplications: applications.length,
        };
    }, [applications]);

    
    return (
        <div>
            <div className="mb-8 flex justify-between items-start">
                <div>
                <h2 className="text-3xl font-bold">Retail Executive Dashboard</h2>
                <p className="text-muted-foreground">High-level summary of onboarding activity.</p>
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
                        <Inbox className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalPending}</div>
                        <p className="text-xs text-muted-foreground">Applications currently in the pipeline</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalApproved}</div>
                        <p className="text-xs text-muted-foreground">Successfully onboarded applications</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rejected</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalRejected}</div>
                        <p className="text-xs text-muted-foreground">Applications that did not proceed</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalApplications}</div>
                        <p className="text-xs text-muted-foreground">All records in the system</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSignature />
                        Signed Agency Agreements
                    </CardTitle>
                    <CardDescription>
                        A list of all signed agency agreements for wallet account creation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center p-12 text-center border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">
                            No signed agency agreements yet.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
      )
}
