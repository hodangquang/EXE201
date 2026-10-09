// Rains / Scandinavian Editorial Theme Token Configuration for Ant Design
// Derived strictly from DESIGN (1).md
export const themeConfig = {
  token: {
    colorPrimary: '#26292a', // Charcoal - Filled action surface
    colorInfo: '#26292a',
    colorSuccess: '#2b593f', // Forest eco-accent
    colorWarning: '#9e621e',
    colorError: '#991b1b',
    colorTextBase: '#10100f', // Ink
    colorTextSecondary: '#70706f',
    colorBgBase: '#efefef', // Fog
    colorBgContainer: '#ffffff', // Paper
    colorBorder: '#e2e2e2',
    colorBorderSecondary: '#efefef',
    borderRadius: 0, // Flat design as per DESIGN (1).md
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
  },
  components: {
    Layout: {
      bodyBg: '#efefef',
      headerBg: '#ffffff',
      siderBg: '#10100f', // Ink
    },
    Menu: {
      darkItemBg: '#10100f',
      darkItemSelectedBg: '#26292a',
      darkItemHoverBg: '#1d1f20',
      darkItemSelectedColor: '#ffffff',
      itemBorderRadius: 9999, // Pill nav items
    },
    Card: {
      headerFontSize: 15,
      borderRadiusLG: 0, // Flat cards
      colorBorderSecondary: '#e8e8e8',
    },
    Button: {
      borderRadius: 9999, // Pill buttons strictly from DESIGN (1).md
      controlHeight: 38,
      fontWeight: 500,
      primaryColor: '#ffffff',
      defaultBorderColor: '#10100f',
      defaultColor: '#10100f',
    },
    Table: {
      borderRadiusLG: 0,
      headerBg: '#f8f8f8',
      headerColor: '#10100f',
      borderColor: '#efefef',
    },
    Tag: {
      borderRadiusSM: 9999, // Pill tags
    },
    Input: {
      borderRadius: 0,
      colorBorder: '#d4d4d3',
    },
    Select: {
      borderRadius: 0,
      colorBorder: '#d4d4d3',
    },
    Tabs: {
      inkBarColor: '#10100f',
      itemSelectedColor: '#10100f',
      itemHoverColor: '#40403f',
    },
    Modal: {
      borderRadiusLG: 0,
    }
  },
};
