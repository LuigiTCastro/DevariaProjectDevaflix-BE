import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type TempSearchDocument = HydratedDocument<TempSearch>;

@Schema()
export class TempSearch {
    @Prop({required: true})
    title:string;
}

export const TempSearchSchema = SchemaFactory.createForClass(TempSearch);