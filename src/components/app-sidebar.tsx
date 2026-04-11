import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "src/components/nav-documents"
import { NavMain } from "src/components/nav-main"
import { NavSecondary } from "src/components/nav-secondary"
import { NavUser } from "src/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "src/components/ui/sidebar"

const data = {
  user: {
    name: "Admin Flat Checker",
    email: "admin@flatchecker.fr",
    avatar: "",
  },
  navMain: [
    {
      title: "Tableau de bord",
      url: "/app/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Missions",
      url: "/app/missions",
      icon: IconListDetails,
    },
    {
      title: "Parc immobilier",
      url: "/app/patrimoine",
      icon: IconFolder,
    },
    {
      title: "Tiers",
      url: "/app/tiers",
      icon: IconUsers,
    },
  ],
  navClouds: [],
  navSecondary: [
    {
      title: "Paramètres",
      url: "/app/parametres",
      icon: IconSettings,
    },
    {
      title: "Aide",
      url: "#",
      icon: IconHelp,
    },
  ],
  documents: [
    {
      name: "Templates",
      url: "/app/parametres/templates",
      icon: IconDatabase,
    },
    {
      name: "Catalogue",
      url: "/app/parametres/catalogue",
      icon: IconReport,
    },
    {
      name: "Critères",
      url: "/app/parametres/criteres",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <div className="flex items-center justify-center w-5 h-5 rounded-md" style={{background:'#2d526c'}}><IconDashboard className="size-3 text-white" /></div>
                <span className="text-base font-semibold">ImmoChecker</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
