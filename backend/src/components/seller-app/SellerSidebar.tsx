import { createElement } from "react";
import {
  useCreatePath,
  useGetResourceLabel,
  useHasDashboard,
  useResourceDefinitions,
  useTranslate,
  LinkBase,
  useMatch,
  useGetIdentity,
} from "ra-core";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { House, List } from "lucide-react";
import { useSellerShop } from "@/hooks/useSellerShop";

/**
 * Custom seller navigation sidebar with role-based menu filtering
 * - Hides Products and Analytics tabs when role or shop status is REJECTED, SUSPENDED, or PENDING
 * - Only shows Shop Application and Dashboard for non-approved sellers
 */
export function SellerSidebar({
  title = "Vyom Shop",
  icon,
}: {
  title?: string;
  icon?: React.ReactNode;
} = {}) {
  const hasDashboard = useHasDashboard();
  const resources = useResourceDefinitions();
  const { openMobile, setOpenMobile } = useSidebar();
  const { shopStatus } = useSellerShop();
  const { data: identity } = useGetIdentity();

  const handleClick = () => {
    if (openMobile) {
      setOpenMobile(false);
    }
  };

  const currentStatus = (shopStatus || (identity as any)?.shop?.status || "").toUpperCase();
  const userRole = ((identity as any)?.role || "").toUpperCase();

  // Check if status or role is REJECTED, SUSPENDED, or PENDING
  const isRestricted =
    currentStatus === "PENDING" ||
    currentStatus === "REJECTED" ||
    currentStatus === "SUSPENDED" ||
    userRole === "PENDING" ||
    userRole === "REJECTED" ||
    userRole === "SUSPENDED" ||
    currentStatus !== "APPROVED";

  // Determine which resources to show based on shop/role approval status
  const shouldShowResource = (resourceName: string): boolean => {
    // Always show "shop" resource (application / profile page)
    if (resourceName === "shop") return true;

    // When status or role is "REJECTED", "SUSPENDED", or "PENDING",
    // sellers won't be able to see the Products or Analytics buttons on the left panel
    if (resourceName === "products" || resourceName === "analytics") {
      return !isRestricted;
    }

    // Show all other resources by default
    return true;
  };

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<LinkBase to="/" />}
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              {icon}
              <span className="text-base font-semibold">{title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {hasDashboard ? (
                <DashboardMenuItem onClick={handleClick} />
              ) : null}
              {Object.keys(resources)
                .filter((name) => resources[name].hasList)
                .filter((name) => shouldShowResource(name))
                .map((name) => (
                  <SellerResourceMenuItem
                    key={name}
                    name={name}
                    onClick={handleClick}
                  />
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}

/**
 * Dashboard menu item for seller sidebar
 */
export const DashboardMenuItem = ({ onClick }: { onClick?: () => void }) => {
  const translate = useTranslate();
  const label = translate("ra.page.dashboard", {
    _: "Dashboard",
  });
  const match = useMatch({ path: "/", end: true });
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<LinkBase to="/" onClick={onClick} />}
        isActive={!!match}
      >
        <House />
        {label}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

/**
 * Resource menu item for seller sidebar
 */
export const SellerResourceMenuItem = ({
  name,
  onClick,
}: {
  name: string;
  onClick?: () => void;
}) => {
  const resources = useResourceDefinitions();
  const getResourceLabel = useGetResourceLabel();
  const createPath = useCreatePath();
  const to = createPath({
    resource: name,
    type: "list",
  });
  const match = useMatch({ path: to, end: false });

  if (!resources || !resources[name]) return null;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={
          <LinkBase to={to} state={{ _scrollToTop: true }} onClick={onClick} />
        }
        isActive={!!match}
      >
        {resources[name].icon ? createElement(resources[name].icon) : <List />}
        {getResourceLabel(name, 2)}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
