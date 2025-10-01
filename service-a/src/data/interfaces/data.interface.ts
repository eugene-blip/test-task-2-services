export interface DataRecord {
  _id?: any;
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  company?: any;
  address?: any;
  username?: string;
  [key: string]: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FetchResult {
  recordCount: number;
  filePath: string;
  format: string;
  duration: number;
}

export interface UploadResult {
  recordCount: number;
  insertedCount: number;
  duration: number;
  errors?: string[];
}
