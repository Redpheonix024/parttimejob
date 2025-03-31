export default function SimpleFooter() {
  return (
    <footer className="bg-background border-t py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Parttimejob. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
