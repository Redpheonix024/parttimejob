"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Clock, MapPin } from "lucide-react"

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <DashboardLayout activeRoute="calendar">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <Button>Add Event</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{event.title}</h3>
                    <Badge variant={event.type === "interview" ? "default" : "secondary"}>
                      {event.type === "interview" ? "Interview" : "Task"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.company}</p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        {event.date}, {event.time}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

const events = [
  {
    title: "Interview: UX Designer",
    company: "Creative Agency",
    date: "May 12, 2023",
    time: "10:00 AM",
    location: "Video Call",
    type: "interview",
  },
  {
    title: "Submit Portfolio",
    company: "Design Studio",
    date: "May 15, 2023",
    time: "11:59 PM",
    type: "task",
  },
  {
    title: "Interview: Web Developer",
    company: "Tech Solutions",
    date: "May 18, 2023",
    time: "2:30 PM",
    location: "In-person",
    type: "interview",
  },
  {
    title: "Follow-up Call",
    company: "Digital Marketing Co.",
    date: "May 20, 2023",
    time: "4:00 PM",
    location: "Phone Call",
    type: "interview",
  },
]

