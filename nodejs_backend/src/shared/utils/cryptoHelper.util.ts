import crypto from "crypto";

export const md5 = (text: string): string =>
  crypto.createHash("md5").update(text).digest("hex");

export const sha256 = (text: string): string =>
  crypto.createHash("sha256").update(text).digest("hex");

export const randomId = (length = 16): string =>
  crypto.randomBytes(length).toString("hex");
