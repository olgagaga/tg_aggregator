import { Link } from 'react-router-dom';
import { Menu, Bookmark, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold">TG Aggregator</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/bookmarks">
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmarks
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Navigate through the app</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col space-y-3 mt-6">
                <Button variant="ghost" className="justify-start" asChild>
                  <Link to="/">
                    <Menu className="h-4 w-4 mr-2" />
                    All Posts
                  </Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <Link to="/bookmarks">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Bookmarks
                  </Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <Link to="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
