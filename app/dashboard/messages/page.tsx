"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import MessageCard from "@/components/dashboard/message-card";

export default function Messages() {
  return (
    <DashboardLayout activeRoute="messages">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Button variant="outline">Mark All as Read</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
          <CardDescription>Your conversations with employers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <MessageCard key={index} message={message} />
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View All Messages
          </Button>
        </CardFooter>
      </Card>
    </DashboardLayout>
  );
}

const messages = [
  {
    sender: "Sarah Johnson",
    subject: "Interview Invitation: UX Designer Position",
    preview:
      "Hi John, We've reviewed your application and would like to invite you for an interview...",
    time: "10:30 AM",
    unread: true,
  },
  {
    sender: "Michael Chen",
    subject: "Follow-up: Frontend Developer Application",
    preview:
      "Thank you for applying to the Frontend Developer position. We have a few additional questions...",
    time: "Yesterday",
    unread: true,
  },
  {
    sender: "Tech Solutions Inc.",
    subject: "Application Received: Frontend Developer",
    preview:
      "Thank you for applying to the Frontend Developer position at Tech Solutions Inc. We've received your application...",
    time: "2 days ago",
    unread: false,
  },
  {
    sender: "Parttimejob Support",
    subject: "Your profile is getting noticed!",
    preview:
      "Your profile has been viewed by 12 employers in the last week. Here are some tips to increase your chances...",
    time: "1 week ago",
    unread: false,
  },
];
