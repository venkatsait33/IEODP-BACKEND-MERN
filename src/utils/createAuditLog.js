import { AuditLog } from "../model/auditLog.model.js";

export const createAuditLog = async ({
  session,
  entity,
  entityId,
  action,
  performedBy,
  role,
  previousState,
  newState,
}) => {
  await AuditLog.create(
    [
      {
        entity,
        entityId,
        action,
        performedBy,
        role,
        previousState,
        newState,
      },
    ],
    { session },
  );
};
