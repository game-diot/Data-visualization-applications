import mongoose from "mongoose";
import { ICleaningSession } from "./interfaces/cleaningSession.interface";
import { CleaningSessionSchema } from "../schema/cleaningSession.schema";

export const CleaningSessionModel = mongoose.model<ICleaningSession>(
  "CleaningSession",
  CleaningSessionSchema
);
