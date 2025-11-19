// modules/files/services/file.service.ts
import fs from "fs/promises";
import { File, IFile, IFileDocument } from "../models/File.model";
import { CreateFileDTO } from "../dto";

export interface GetAllFilesOptions {
  page?: number;
  limit?: number;
  filter?: Record<string, any>;
}

export const fileService = {
  async createFile(data: CreateFileDTO): Promise<IFileDocument> {
    // ✅ 这里改一下
    const file = new File(data);
    return await file.save();
  },

  async getAllFiles({
    page = 1,
    limit = 10,
    filter = {},
  }: GetAllFilesOptions = {}): Promise<IFile[]> {
    const skip = (page - 1) * limit;
    return await File.find(filter)
      .select("-__v -updatedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  },

  async countFiles(filter: Record<string, any> = {}): Promise<number> {
    if (Object.keys(filter).length) {
      return await File.countDocuments(filter);
    }
    return await File.estimatedDocumentCount();
  },

  async getFileById(id: string): Promise<IFile | null> {
    return await File.findById(id);
  },

  async updateFile(
    id: string,
    updates: Partial<CreateFileDTO>
  ): Promise<IFile | null> {
    return await File.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteFile(id: string): Promise<IFile | null> {
    const deletedFile = await File.findByIdAndDelete(id);
    if (!deletedFile) return null;

    // 删除物理文件
    try {
      await fs.unlink(deletedFile.path);
    } catch (err) {
      console.warn(
        `[deleteFile] File not found or already deleted: ${deletedFile.path}`
      );
    }

    return deletedFile;
  },
};
