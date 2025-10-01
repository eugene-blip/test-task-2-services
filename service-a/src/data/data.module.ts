import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { FileService } from './file.service';

@Module({
  controllers: [DataController],
  providers: [DataService, FileService],
  exports: [DataService],
})
export class DataModule {}
