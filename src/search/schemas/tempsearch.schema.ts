import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type TempSearchDocument = HydratedDocument<TempSearch>;

@Schema()
export class TempSearch {
    @Prop({required: true})
    title:string;

    @Prop({required: true})
    imdbID:string;

    @Prop({required: true})
    videos:string;
}

export const TempSearchSchema = SchemaFactory.createForClass(TempSearch);