'use client';

import * as React from 'react';
import { Application, Comment } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Check, FileText, History, MessageSquare, Send, User, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface ApplicationReviewProps {
  application: Application;
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  onBack: () => void;
  showActions?: boolean;
}

const DetailItem = ({ label, value }: { label: string; value: string | undefined }) => (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || '-'}</p>
    </div>
);

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
}

export default function ApplicationReview({ application, setApplications, onBack, showActions = false }: ApplicationReviewProps) {
  const [newComment, setNewComment] = React.useState('');

  const handleAddComment = () => {
    if (newComment.trim() === '') return;

    const comment: Comment = {
      id: `c${application.comments.length + 10}`,
      user: 'Current User', // This would be dynamic in a real app
      role: 'ATL', // This would also be dynamic
      timestamp: new Date().toISOString(),
      content: newComment.trim(),
    };

    setApplications(prevApps => 
        prevApps.map(app => 
            app.id === application.id 
            ? { ...app, comments: [...app.comments, comment] } 
            : app
        )
    );
    setNewComment('');
  };


  return (
    <div>
        <div className="mb-6 flex items-center justify-between">
            <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            {showActions && (
                 <div className="space-x-2">
                    <Button variant="destructive"><X className="mr-2 h-4 w-4" />Reject</Button>
                    <Button className="bg-green-600 hover:bg-green-700"><Check className="mr-2 h-4 w-4" />Approve</Button>
                </div>
            )}
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Review Application: {application.id}</CardTitle>
          <CardDescription>
            Reviewing application for <strong>{application.clientName}</strong> submitted on {application.submittedDate}.
          </CardDescription>
        </CardHeader>
        <CardContent>
             <Tabs defaultValue="details" className="w-full">
                <TabsList>
                    <TabsTrigger value="details"><User className="mr-2 h-4 w-4"/>Customer Details</TabsTrigger>
                    <TabsTrigger value="documents"><FileText className="mr-2 h-4 w-4"/>Documents</TabsTrigger>
                    <TabsTrigger value="communication"><MessageSquare className="mr-2 h-4 w-4"/>Communication</TabsTrigger>
                    <TabsTrigger value="history"><History className="mr-2 h-4 w-4"/>Activity Log</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="pt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Applicant Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             <DetailItem label="Client Name" value={application.clientName} />
                             <DetailItem label="Client Type" value={application.clientType} />
                             <DetailItem label="Submission Date" value={application.submittedDate} />
                             <DetailItem label="Submitted By" value={application.submittedBy} />
                             <DetailItem label="Status" value={application.status} />
                             <DetailItem label="Last Updated" value={application.lastUpdated} />
                           </div>
                           <Separator/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <DetailItem label="Address" value={application.details.address} />
                               <DetailItem label="Date of Birth" value={application.details.dateOfBirth} />
                               <DetailItem label="Contact Number" value={application.details.contactNumber} />
                               <DetailItem label="Email" value={application.details.email} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="documents" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Uploaded Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {application.documents.map(doc => (
                                    <li key={doc.type} className="flex items-center justify-between p-3 rounded-md border">
                                        <div>
                                            <p className="font-medium">{doc.type}</p>
                                            <p className="text-sm text-muted-foreground">{doc.fileName}</p>
                                        </div>
                                        <Button variant="outline" size="sm">View Document</Button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="communication" className="pt-4">
                   <Card>
                        <CardHeader>
                            <CardTitle>Internal Communication</CardTitle>
                            <CardDescription>Discuss the application with other team members.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                                {application.comments.map((comment) => (
                                    <div key={comment.id} className="flex items-start gap-4">
                                        <Avatar>
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.user}`} />
                                            <AvatarFallback>{getInitials(comment.user)}</AvatarFallback>
                                        </Avatar>
                                        <div className="w-full rounded-md border p-3">
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold">{comment.user} <span className="text-xs text-muted-foreground ml-2">{comment.role}</span></p>
                                                <p className="text-xs text-muted-foreground">{new Date(comment.timestamp).toLocaleString()}</p>
                                            </div>
                                            <p className="text-sm mt-1">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {application.comments.length === 0 && (
                                    <div className="text-center text-muted-foreground py-8">
                                        No comments yet.
                                    </div>
                                )}
                                </div>
                                <Separator />
                                <div className="flex items-start gap-4">
                                    <Avatar>
                                        <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=Current User" />
                                        <AvatarFallback>CU</AvatarFallback>
                                    </Avatar>
                                    <div className="w-full space-y-2">
                                        <Textarea 
                                          placeholder="Type your comment here..."
                                          value={newComment}
                                          onChange={(e) => setNewComment(e.target.value)}
                                        />
                                        <Button onClick={handleAddComment} size="sm">
                                            <Send className="mr-2 h-4 w-4"/>
                                            Post Comment
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="history" className="pt-4">
                   <Card>
                        <CardHeader>
                            <CardTitle>Application History</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ul className="space-y-4">
                                {application.history.map((entry, index) => (
                                    <li key={index} className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                                                {entry.action === 'Submitted' ? <FileText className="h-5 w-5"/> : <User className="h-5 w-5"/>}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="font-medium">{entry.action} by {entry.user}</p>
                                            <p className="text-sm text-muted-foreground">{entry.timestamp}</p>
                                            {entry.notes && <p className="text-sm mt-1">{entry.notes}</p>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
