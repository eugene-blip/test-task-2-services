import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as ExcelJS from 'exceljs';
import axios from 'axios';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly dataDir = join(process.cwd(), 'data');

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      this.logger.error('Error creating data directory:', error);
    }
  }

  async fetchAndSaveData(
    url: string,
    format: 'json' | 'excel' = 'json',
    options?: { enrich?: Record<string, any> }
  ): Promise<{ filePath: string; data: any[] }> {
    await this.ensureDataDirectory();
    
    try {
      // Fetch data from public API
      this.logger.log(`Fetching data from: ${url}`);
      const response = await axios.get(url);

      let data: any[];
      const raw = response.data;

      // If enrich metadata is provided and the payload has a `prices` array (CoinGecko market_chart),
      // save a single object that includes the request parameters + prices
      if (options?.enrich && raw && typeof raw === 'object' && Array.isArray(raw.prices)) {
        data = [{ ...options.enrich, prices: raw.prices }];
      } else {
        data = Array.isArray(raw) ? raw : [raw];
      }

      // Generate filename
      const timestamp = Date.now();
      const filename = format === 'json' 
        ? `data_${timestamp}.json`
        : `data_${timestamp}.xlsx`;
      const filePath = join(this.dataDir, filename);

      // Save to file
      if (format === 'json') {
        await this.saveAsJson(filePath, data);
      } else {
        await this.saveAsExcel(filePath, data);
      }

      this.logger.log(`Data saved to: ${filePath}`);
      return { filePath, data };
    } catch (error) {
      this.logger.error('Error fetching and saving data:', error);
      throw error;
    }
  }

  private async saveAsJson(filePath: string, data: any[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private async saveAsExcel(filePath: string, data: any[]): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    if (data.length > 0) {
      // Get all unique keys from all objects
      const allKeys = new Set<string>();
      data.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key));
      });

      const columns = Array.from(allKeys).map(key => ({
        header: key,
        key: key,
        width: 15,
      }));

      worksheet.columns = columns;

      // Add rows
      data.forEach(item => {
        const row: any = {};
        allKeys.forEach(key => {
          const value = item[key];
          // Flatten nested objects
          row[key] = typeof value === 'object' ? JSON.stringify(value) : value;
        });
        worksheet.addRow(row);
      });

      // Style header
      worksheet.getRow(1).font = { bold: true };
      const fgColor = 'FFE0E0E0';
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: fgColor },
      };
    }

    await workbook.xlsx.writeFile(filePath);
  }

  async parseJsonFile(filePath: string): Promise<any[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      this.logger.error('Error parsing JSON file:', error);
      throw error;
    }
  }

  async parseExcelFile(filePath: string): Promise<any[]> {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const worksheet = workbook.worksheets[0];
      const data: any[] = [];

      const headers: string[] = [];
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value?.toString() || `column_${colNumber}`;
      });

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          let value = cell.value;

          // Try to parse JSON strings
          if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
            try {
              value = JSON.parse(value);
            } catch {
              // Keep as string if not valid JSON
            }
          }

          rowData[header] = value;
        });

        data.push(rowData);
      });

      return data;
    } catch (error) {
      this.logger.error('Error parsing Excel file:', error);
      throw error;
    }
  }

  async parseUploadedFile(buffer: Buffer, mimetype: string): Promise<any[]> {
    await this.ensureDataDirectory();
    
    const tempPath = join(this.dataDir, `temp_${Date.now()}`);

    try {
      await fs.writeFile(tempPath, buffer);

      let data: any[];
      if (mimetype === 'application/json' || mimetype === 'text/json') {
        data = await this.parseJsonFile(tempPath);
      } else if (
        mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        mimetype === 'application/vnd.ms-excel'
      ) {
        data = await this.parseExcelFile(tempPath);
      } else {
        throw new Error(`Unsupported file type: ${mimetype}`);
      }

      // Clean up temp file
      await fs.unlink(tempPath);

      return data;
    } catch (error) {
      // Clean up temp file on error
      try {
        await fs.unlink(tempPath);
      } catch {}
      throw error;
    }
  }
}
