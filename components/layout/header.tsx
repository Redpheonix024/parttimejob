import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/app/config/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

interface HeaderProps {
  showNav?: boolean;
  activeLink?: string;
  userData: any;
  toggleMobileSidebar?: () => void;
}

export default function Header({
  showNav = true,
  activeLink,
  userData,
  toggleMobileSidebar,
}: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          {isMounted && user && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={toggleMobileSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <img 
                src="/icons/PTJ SVG.svg" 
                alt="Parttimejob Logo" 
                className="h-8 w-auto drop-shadow-lg"
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Parttimejob
            </span>
          </Link>
        </div>

        {showNav && (
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={
                activeLink === "jobs"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              Browse Jobs
            </Link>
            <Link
              href="/how-it-works"
              className={
                activeLink === "how-it-works"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              How it Works
            </Link>
            <Link
              href="/about"
              className={
                activeLink === "about"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              About
            </Link>
          </nav>
        )}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div className="flex items-center gap-4">
            {isMounted ? (
              <>
                {user ? (
                  <>
                    {/* <Link href="/post-job">
                      <Button>Post a Job</Button>
                    </Link> */}
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              userData?.profilePicture ||
                              userData?.photoURL ||
                              user?.photoURL ||
                              "/placeholder-user.jpg"
                            }
                            alt={
                              userData?.firstName || user?.displayName || "User"
                            }
                            style={{ objectFit: "cover" }}
                          />
                          <AvatarFallback>
                            {userData?.firstName?.[0]?.toUpperCase() ||
                              user?.displayName?.[0] ||
                              ""}
                          </AvatarFallback>
                        </Avatar>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard">Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <Link href="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <div className="w-[72px] h-[32px]" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
