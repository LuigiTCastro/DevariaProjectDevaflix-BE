import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Search, SearchSchema } from './schemas/search.schema';
import { TempSearch, TempSearchSchema } from './schemas/tempsearch.schema';
import { Rating, RatingSchema } from './schemas/Rating.schema';
import { AxiosService } from './AxiosService';

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: Search.name, schema: SearchSchema},
      { name: Rating.name, schema: RatingSchema},
      { name: TempSearch.name, schema: TempSearchSchema}
    ])
  ],
  providers: [SearchService, AxiosService],
  controllers: [SearchController]
})
export class SearchModule {}
