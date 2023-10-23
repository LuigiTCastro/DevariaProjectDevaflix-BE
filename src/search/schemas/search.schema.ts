import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SearchDocument = HydratedDocument<Search>;

@Schema()
export class Search {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    translatedTitle: string;

    @Prop({ required: true })
    poster: string;

    @Prop({ required: true })
    imdbID: string;

    @Prop({required: true})
    duracao:string;

    @Prop({ required: true })
    year: string;

    @Prop({ required: true })
    genre: string;

    @Prop({ required: true })
    director: string;

    @Prop({ required: true })
    actor: string;

    @Prop({ required: true })
    imdbRating: number;

    @Prop({ required: true })
    plot: string;

    @Prop({ required: true })
    videos: string[];
}
export const SearchSchema = SchemaFactory.createForClass(Search);