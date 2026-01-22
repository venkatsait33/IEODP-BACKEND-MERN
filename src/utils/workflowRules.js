export const WORKFLOW_RULES = {
  SUBMITTED: {
    allowedRoles: ["leadership"],
    allowedActions: ["LEADERSHIP_REVIEW"],
    nextStatus: "FORWARDED_TO_MANAGEMENT",
  },

  FORWARDED_TO_MANAGEMENT: {
    allowedRoles: ["management"],
    allowedActions: ["MANAGEMENT_ACTION"],
    nextStatus: "ACTION_TAKEN",
  },

  ACTION_TAKEN: {
    allowedRoles: ["auditor"],
    allowedActions: [
      "AUDITOR_APPROVED",
      "AUDITOR_REJECTED",
      "AUDITOR_REVERIFY",
    ],
  },

  REVERIFY: {
    allowedRoles: ["operator", "leadership", "management"],
    allowedActions: ["REVERIFY_RESPONSE"],
    nextStatus: "FORWARDED_TO_MANAGEMENT",
  },
};
