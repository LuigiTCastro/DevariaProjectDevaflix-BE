import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ScoreDocument = HydratedDocument<Score>;

@Schema()
export class Score {
    @Prop({ required: true })
    imdbID: string;

    @Prop({ required: true })
    likes: string;

    @Prop({ required: true })
    dislikes: string;

    @Prop({ required: true })
    average: number;

}
export const ScoreSchema = SchemaFactory.createForClass(Score);