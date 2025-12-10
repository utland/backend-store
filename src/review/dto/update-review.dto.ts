import { OmitType } from "@nestjs/mapped-types";
import { CreateReviewDto } from "./create-review.dto";

export class UpdateReviewDto extends OmitType(CreateReviewDto, ["productId"] as const) {}
