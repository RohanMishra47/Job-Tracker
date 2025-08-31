import { Edit, Menu, PlusSquare, Trash2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from './ui/sidebar';

const items = [
  {
    title: 'Create Job',
    url: '/createJob',
    icon: PlusSquare,
  },
  {
    title: 'Update Job',
    url: '#',
    icon: Edit,
  },
  {
    title: 'Delete Job',
    url: '#',
    icon: Trash2,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-lg font-bold">Job Tracker</h2>
      </SidebarHeader>

      <SidebarContent>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              Job Actions <Menu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40">
            {items.map((item) => (
              <DropdownMenuItem key={item.title}>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarContent>

      <SidebarFooter>
        <p className="text-xs text-muted-foreground">© 2025</p>
      </SidebarFooter>
    </Sidebar>
  );
}
