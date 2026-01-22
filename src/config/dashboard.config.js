export const getDashboardConfigByRole = (role) => {
  switch (role) {
    case "admin":
      return [
        {
          id: "kpi-total-users",
          type: "KPI",
          title: "Total Users",
          metric: "totalUsers",
          source: "users",
        },
        {
          id: "kpi-active-users",
          type: "KPI",
          title: "Active Users",
          metric: "activeUsers",
          source: "users",
        },
        {
          id: "pie-user-roles",
          type: "PIE_CHART",
          title: "Users by Role",
          groupBy: "role",
          source: "users",
        },
      ];

    case "operator":
      return [
        {
          id: "kpi-active-tickets",
          type: "KPI",
          title: "Active Tickets",
          metric: "active",
          source: "tickets",
        },
        {
          id: "pie-ticket-status",
          type: "PIE_CHART",
          title: "Ticket Status",
          groupBy: "status",
          source: "tickets",
        },
      ];

    case "management":
      return [
        {
          id: "kpi-pending",
          type: "KPI",
          title: "Pending Actions",
          metric: "managementPending",
          source: "tickets",
        },
        {
          id: "bar-priority",
          type: "BAR_CHART",
          title: "Tickets by Priority",
          groupBy: "priority",
          source: "tickets",
        },
      ];

    case "auditor":
      return [
        {
          id: "kpi-audit-pending",
          type: "KPI",
          title: "Pending Audit",
          metric: "auditorPending",
          source: "tickets",
        },
        {
          id: "pie-audit-status",
          type: "PIE_CHART",
          title: "Audit Outcomes",
          groupBy: "auditorDecision",
          source: "tickets",
        },
      ];

    default:
      return [];
  }
};
