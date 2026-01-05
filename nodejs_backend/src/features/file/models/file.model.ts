import mongoose, { Document, Schema, Model } from "mongoose";

import { fileSchema } from "../schemas/file.schema";
import { IFile, IFileDocument } from "./interface/ifile.interface";

export const FileModel = mongoose.model<IFile>("File", fileSchema);
