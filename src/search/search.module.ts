import { Module } from '@nestjs/common';
import { AxiosService } from './AxiosService';
import { SearchService } from './search.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller';
import { Search, SearchSchema } from './schemas/search.schema';
import { TempSearch, TempSearchSchema } from './schemas/tempsearch.schema';
import { Rating, RatingSchema } from './schemas/rating.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Search.name, schema: SearchSchema },
      { name: TempSearch.name, schema: TempSearchSchema },
      { name: Rating.name, schema: RatingSchema }
    ])
  ],
  providers: [SearchService, AxiosService],
  controllers: [SearchController]
})
export class SearchModule { }