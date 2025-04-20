"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { auth } from "@/app/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUser, updateUserSettings } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

interface Settings {
  account: {
    username: string;
    email: string;
  };
  notifications: {
    email: {
      jobRecommendations: boolean;
      applicationUpdates: boolean;
      messages: boolean;
      marketing: boolean;
    };
    push: {
      newJobMatches: boolean;
      interviewReminders: boolean;
      applicationDeadlines: boolean;
    };
  };
  privacy: {
    profileVisibility: "everyone" | "employers" | "private";
    showOnlineStatus: boolean;
    showApplicationHistory: boolean;
    personalizedRecommendations: boolean;
    analytics: boolean;
  };
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    account: {
      username: "",
      email: "",
    },
    notifications: {
      email: {
        jobRecommendations: true,
        applicationUpdates: true,
        messages: true,
        marketing: false,
      },
      push: {
        newJobMatches: true,
        interviewReminders: true,
        applicationDeadlines: false,
      },
    },
    privacy: {
      profileVisibility: "everyone",
      showOnlineStatus: true,
      showApplicationHistory: true,
      personalizedRecommendations: true,
      analytics: true,
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userData = await getUser(user.uid);
          if (userData) {
            setSettings((prev) => ({
              ...prev,
              account: {
                username: userData.username || user.displayName || "",
                email: user.email || "",
              },
              notifications:
                userData.settings?.notifications || prev.notifications,
              privacy: userData.settings?.privacy || prev.privacy,
            }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast({
            title: "Error",
            description: "Failed to load user data. Please try again later.",
            variant: "destructive",
          });
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleSave = async (section: keyof Settings) => {
    try {
      setIsSaving(true);
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      await updateUserSettings(user.uid, {
        [section]: settings[section],
      });

      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout activeRoute="settings" userData={settings} user={user}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeRoute="settings" userData={settings} user={user}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>View your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={settings.account.username}
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.account.email}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </CardContent>
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
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable your account
                  </p>
                </div>
                <Button variant="outline">Deactivate</Button>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-destructive">
                    Delete Account
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
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
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Email Notifications</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="job-recommendations">
                      Job Recommendations
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive personalized job recommendations
                    </p>
                  </div>
                  <Switch
                    id="job-recommendations"
                    checked={settings.notifications.email.jobRecommendations}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: {
                            ...settings.notifications.email,
                            jobRecommendations: checked,
                          },
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="application-updates">
                      Application Updates
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about your job application status
                    </p>
                  </div>
                  <Switch
                    id="application-updates"
                    checked={settings.notifications.email.applicationUpdates}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: {
                            ...settings.notifications.email,
                            applicationUpdates: checked,
                          },
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="messages">Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails when you get new messages
                    </p>
                  </div>
                  <Switch
                    id="messages"
                    checked={settings.notifications.email.messages}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: {
                            ...settings.notifications.email,
                            messages: checked,
                          },
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing">Marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails and newsletters
                    </p>
                  </div>
                  <Switch
                    id="marketing"
                    checked={settings.notifications.email.marketing}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: {
                            ...settings.notifications.email,
                            marketing: checked,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Push Notifications</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="new-job-matches">New Job Matches</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new jobs match your profile
                    </p>
                  </div>
                  <Switch
                    id="new-job-matches"
                    checked={settings.notifications.push.newJobMatches}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          push: {
                            ...settings.notifications.push,
                            newJobMatches: checked,
                          },
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="interview-reminders">
                      Interview Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders about upcoming interviews
                    </p>
                  </div>
                  <Switch
                    id="interview-reminders"
                    checked={settings.notifications.push.interviewReminders}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          push: {
                            ...settings.notifications.push,
                            interviewReminders: checked,
                          },
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="application-deadlines">
                      Application Deadlines
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about approaching deadlines
                    </p>
                  </div>
                  <Switch
                    id="application-deadlines"
                    checked={settings.notifications.push.applicationDeadlines}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          push: {
                            ...settings.notifications.push,
                            applicationDeadlines: checked,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSave("notifications")}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control your privacy and visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Profile Visibility</h3>

                <div className="space-y-2">
                  <Label htmlFor="profile-visibility">
                    Who can see your profile
                  </Label>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onValueChange={(
                      value: "everyone" | "employers" | "private"
                    ) =>
                      setSettings({
                        ...settings,
                        privacy: {
                          ...settings.privacy,
                          profileVisibility: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger id="profile-visibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="employers">Employers Only</SelectItem>
                      <SelectItem value="private">
                        Private (Only when you apply)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-online">Show Online Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Display when you're active on the platform
                    </p>
                  </div>
                  <Switch
                    id="show-online"
                    checked={settings.privacy.showOnlineStatus}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        privacy: {
                          ...settings.privacy,
                          showOnlineStatus: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-applications">
                      Show Application History
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow employers to see your past applications
                    </p>
                  </div>
                  <Switch
                    id="show-applications"
                    checked={settings.privacy.showApplicationHistory}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        privacy: {
                          ...settings.privacy,
                          showApplicationHistory: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Data Usage</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="personalized-recommendations">
                      Personalized Recommendations
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow us to use your data for job recommendations
                    </p>
                  </div>
                  <Switch
                    id="personalized-recommendations"
                    checked={settings.privacy.personalizedRecommendations}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        privacy: {
                          ...settings.privacy,
                          personalizedRecommendations: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analytics">Analytics & Improvements</Label>
                    <p className="text-sm text-muted-foreground">
                      Help us improve by sharing usage data
                    </p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={settings.privacy.analytics}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        privacy: {
                          ...settings.privacy,
                          analytics: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave("privacy")} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Privacy Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
