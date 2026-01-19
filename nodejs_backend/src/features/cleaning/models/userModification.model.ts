import mongoose from "mongoose";
import { IUserMondification } from "./interfaces/userModification.interface";
import { userModificationSchema } from "../schema/userModification.schema";

export const UserModificationModel = mongoose.model<IUserMondification>(
  "userModification",
  userModificationSchema
);
