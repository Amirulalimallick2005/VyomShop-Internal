"use client";

import React, { useContext } from "react";
import {
  Layout,
  Menu,
  Grid,
  Drawer,
  Button,
  theme,
  ConfigProvider,
  type MenuProps,
} from "antd";
import {
  LogoutOutlined,
  BarsOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  useMenu,
  useLogout,
  useIsExistAuthentication,
  useLink,
} from "@refinedev/core";
import { ThemedTitle, useThemedLayoutContext } from "@refinedev/antd";

const drawerButtonStyles: React.CSSProperties = {
  borderStartStartRadius: 0,
  borderEndStartRadius: 0,
  position: "fixed",
  top: 64,
  zIndex: 999,
};

export const RefineThemedSider: React.FC<{
  Title?: React.FC<{ collapsed: boolean }>;
}> = ({ Title: TitleFromProps }) => {
  const { token } = theme.useToken();
  const {
    siderCollapsed,
    setSiderCollapsed,
    mobileSiderOpen,
    setMobileSiderOpen,
  } = useThemedLayoutContext();

  const isExistAuthentication = useIsExistAuthentication();
  const direction = useContext(ConfigProvider.ConfigContext)?.direction;
  const Link = useLink();
  const { menuItems, selectedKey } = useMenu();
  const breakpoint = Grid.useBreakpoint();
  const { mutate: mutateLogout } = useLogout();

  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  const RenderToTitle = TitleFromProps ?? ThemedTitle;

  const items: MenuProps["items"] = menuItems.map((item) => ({
    key: item.key,
    icon: item.meta?.icon ?? item.icon,
    label: (
      <Link to={item.route ?? item.list ?? ""}>
        {item.meta?.label ?? item.label ?? item.name}
      </Link>
    ),
  }));

  if (isExistAuthentication) {
    items.push({
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => mutateLogout(),
      danger: true,
    });
  }

  const renderMenu = () => (
    <Menu
      selectedKeys={selectedKey ? [selectedKey] : []}
      mode="inline"
      items={items}
      style={{
        paddingTop: "8px",
        border: "none",
        overflow: "auto",
        height: "calc(100% - 72px)",
      }}
      onClick={() => {
        setMobileSiderOpen(false);
      }}
    />
  );

  const renderDrawerSider = () => (
    <>
      <Drawer
        open={mobileSiderOpen}
        onClose={() => setMobileSiderOpen(false)}
        placement={direction === "rtl" ? "right" : "left"}
        closable={false}
        width={200}
        styles={{
          body: {
            padding: 0,
          },
        }}
        maskClosable={true}
      >
        <Layout>
          <Layout.Sider
            style={{
              height: "100vh",
              backgroundColor: token.colorBgContainer,
              borderRight: `1px solid ${token.colorBgElevated}`,
            }}
          >
            <div
              style={{
                width: "200px",
                padding: "0 16px",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                height: "64px",
                backgroundColor: token.colorBgElevated,
              }}
            >
              <RenderToTitle collapsed={false} />
            </div>
            {renderMenu()}
          </Layout.Sider>
        </Layout>
      </Drawer>
      <Button
        style={drawerButtonStyles}
        size="large"
        onClick={() => setMobileSiderOpen(true)}
        icon={<BarsOutlined />}
      />
    </>
  );

  if (isMobile) {
    return renderDrawerSider();
  }

  const renderClosingIcons = () => {
    const iconProps = { style: { color: token.colorPrimary } };
    const OpenIcon = direction === "rtl" ? RightOutlined : LeftOutlined;
    const CollapsedIcon = direction === "rtl" ? LeftOutlined : RightOutlined;
    const IconComponent = siderCollapsed ? CollapsedIcon : OpenIcon;

    return <IconComponent {...iconProps} />;
  };

  return (
    <Layout.Sider
      style={{
        backgroundColor: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBgElevated}`,
      }}
      collapsible
      collapsed={siderCollapsed}
      onCollapse={(collapsed, type) => {
        if (type === "clickTrigger") {
          setSiderCollapsed(collapsed);
        }
      }}
      collapsedWidth={80}
      breakpoint="lg"
      trigger={
        <Button
          type="text"
          style={{
            borderRadius: 0,
            height: "100%",
            width: "100%",
            backgroundColor: token.colorBgElevated,
          }}
        >
          {renderClosingIcons()}
        </Button>
      }
    >
      <div
        style={{
          width: siderCollapsed ? "80px" : "200px",
          padding: siderCollapsed ? "0" : "0 16px",
          display: "flex",
          justifyContent: siderCollapsed ? "center" : "flex-start",
          alignItems: "center",
          height: "64px",
          backgroundColor: token.colorBgElevated,
          fontSize: "14px",
        }}
      >
        <RenderToTitle collapsed={siderCollapsed} />
      </div>
      {renderMenu()}
    </Layout.Sider>
  );
};
