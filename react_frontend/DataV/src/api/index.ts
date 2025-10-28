import mainClient from './mainClient';
import uploadClient, { uploadWithProgress } from './uploadClient';

export const apiClient = mainClient;
export const fileClient = uploadClient;
export { uploadWithProgress };
