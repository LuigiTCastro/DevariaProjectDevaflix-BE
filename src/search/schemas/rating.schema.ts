import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type RatingDocument = HydratedDocument<Rating>

@Schema()
export class Rating {

    @Prop({ required: true })
    imdbID: string

    @Prop({ required: true, type: [String], default: [] })
    likes: string[]

    @Prop({ required: true, type: Number, default: 0 })
    totalLikes: number

    @Prop({ required: true, type: [String], default: [] })
    dislikes: string[]

    @Prop({ required: true, type: Number, default: 0 })
    totalDislikes: number

    @Prop({ required: true, type: Number, default: 0 })
    percentageLikes: number

}

export const RatingSchema = SchemaFactory.createForClass(Rating)