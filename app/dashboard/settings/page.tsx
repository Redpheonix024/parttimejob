"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Settings() {
  return (
    <DashboardLayout activeRoute="settings">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button>Save Changes</Button>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="johndoe" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Account</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Deactivate Account</h3>
                  <p className="text-sm text-muted-foreground">Temporarily disable your account</p>
                </div>
                <Button variant="outline">Deactivate</Button>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-destructive">Delete Account</h3>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive">Delete</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Email Notifications</h3>

                {emailNotifications.map((notification, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor={`email-${index}`}>{notification.title}</Label>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                    <Switch id={`email-${index}`} defaultChecked={notification.enabled} />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Push Notifications</h3>

                {pushNotifications.map((notification, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor={`push-${index}`}>{notification.title}</Label>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                    <Switch id={`push-${index}`} defaultChecked={notification.enabled} />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your privacy and visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Profile Visibility</h3>

                <div className="space-y-2">
                  <Label htmlFor="profile-visibility">Who can see your profile</Label>
                  <Select defaultValue="everyone">
                    <SelectTrigger id="profile-visibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="employers">Employers Only</SelectItem>
                      <SelectItem value="private">Private (Only when you apply)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-online">Show Online Status</Label>
                    <p className="text-sm text-muted-foreground">Display when you're active on the platform</p>
                  </div>
                  <Switch id="show-online" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-applications">Show Application History</Label>
                    <p className="text-sm text-muted-foreground">Allow employers to see your past applications</p>
                  </div>
                  <Switch id="show-applications" defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Data Usage</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="personalized-recommendations">Personalized Recommendations</Label>
                    <p className="text-sm text-muted-foreground">Allow us to use your data for job recommendations</p>
                  </div>
                  <Switch id="personalized-recommendations" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analytics">Analytics & Improvements</Label>
                    <p className="text-sm text-muted-foreground">Help us improve by sharing usage data</p>
                  </div>
                  <Switch id="analytics" defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Privacy Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Current Plan: Free</h3>
                    <p className="text-sm text-muted-foreground">Basic job search and application features</p>
                  </div>
                  <Button variant="outline">Upgrade</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Payment Methods</h3>
                <p className="text-sm text-muted-foreground">No payment methods added yet.</p>
                <Button variant="outline">Add Payment Method</Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Billing History</h3>
                <p className="text-sm text-muted-foreground">No billing history available.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

const emailNotifications = [
  {
    title: "Job Recommendations",
    description: "Receive personalized job recommendations",
    enabled: true,
  },
  {
    title: "Application Updates",
    description: "Get notified about your job application status",
    enabled: true,
  },
  {
    title: "Messages",
    description: "Receive emails when you get new messages",
    enabled: true,
  },
  {
    title: "Marketing",
    description: "Receive promotional emails and newsletters",
    enabled: false,
  },
]

const pushNotifications = [
  {
    title: "New Job Matches",
    description: "Get notified when new jobs match your profile",
    enabled: true,
  },
  {
    title: "Interview Reminders",
    description: "Receive reminders about upcoming interviews",
    enabled: true,
  },
  {
    title: "Application Deadlines",
    description: "Get notified about approaching deadlines",
    enabled: false,
  },
]

