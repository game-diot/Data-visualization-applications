import { modificationOp } from "../constant/userModificiationOp.constant";

export interface UserModificationItemDTO {
  op: modificationOp;
  path: string;
  before?: any;
  after?: any;
}

export interface CreateUserModificationDTO {
  sessionId: string;
  modifications: UserModificationItemDTO[];
}
