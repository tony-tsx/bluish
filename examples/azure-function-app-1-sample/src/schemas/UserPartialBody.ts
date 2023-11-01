import { IsSchema } from '@bluish/omac';
import { IsEmail, IsOptional, IsString } from 'omac';

@IsSchema()
export class UserPartialBody {
  @IsOptional()
  @IsString()
  public name?: string;

  @IsEmail()
  @IsOptional()
  public email?: string;
}
