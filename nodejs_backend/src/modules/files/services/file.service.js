import { File } from "../models/File.model.js";

export const fileService = {
  async createFile(data) {
    const file = new File(data);
    return await file.save();
  },

  async getAllFiles() {
    return await File.find().sort({ createdAt: -1 });
  },

  async getFileById(id) {
    return await File.findById(id);
  },

  async updateFile(id, updates) {
    return await File.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteFile(id) {
    return await File.findByIdAndDelete(id);
  },
};
