import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
} from './ui/sidebar';

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-lg font-bold">My App</h2>
      </SidebarHeader>

      <SidebarContent>
        {/* Example: Dropdown inside sidebar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              <span>Select Workspace</span>
              <ChevronDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="min-w-[--radix-dropdown-menu-trigger-width]"
          >
            <DropdownMenuItem className="w-full">Profile</DropdownMenuItem>
            <DropdownMenuItem className="w-full">Preferences</DropdownMenuItem>
            <DropdownMenuItem className="w-full">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarContent>

      <SidebarFooter>
        <p className="text-xs text-muted-foreground">© 2025</p>
      </SidebarFooter>
    </Sidebar>
  );
}
