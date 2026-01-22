import { WORKFLOW_RULES } from "./workflowRules.js";

export const validateWorkflowAction = ({
  ticketStatus,
  userRole,
  actionType,
}) => {
  const rule = WORKFLOW_RULES[ticketStatus];

  if (!rule) {
    throw new Error("Invalid ticket state");
  }

  if (!rule.allowedRoles.includes(userRole)) {
    throw new Error("Role not allowed to perform this action");
  }

  if (!rule.allowedActions.includes(actionType)) {
    throw new Error("Action not allowed in this state");
  }

  return rule;
};
