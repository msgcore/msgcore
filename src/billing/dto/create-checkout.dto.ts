import { IsEnum, IsNotEmpty } from 'class-validator';
import { SubscriptionTier } from '../enums/subscription.enum';

export class CreateCheckoutDto {
  @IsEnum(SubscriptionTier)
  @IsNotEmpty()
  tier: SubscriptionTier;

  @IsEnum(['monthly', 'annual'])
  @IsNotEmpty()
  interval: 'monthly' | 'annual';
}
