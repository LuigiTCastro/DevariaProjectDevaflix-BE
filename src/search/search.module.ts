import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Search, SearchSchema } from './schemas/search.schema';
import { TempSearch, TempSearchSchema } from './schemas/tempsearch.schema';
import { AxiosService } from './AxiosService';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: Search.name, schema: SearchSchema },
      { name: TempSearch.name, schema: TempSearchSchema }
    ])
  ],
  providers: [SearchService, AxiosService, UserService],
  controllers: [SearchController]
})
export class SearchModule { }