import { IsSchema } from '@bluish/omac';
import { IsEmail, IsOptional, IsString } from 'omac';

@IsSchema()
export class UserSaveBody {
  @IsString()
  @IsOptional()
  public id!: string;

  @IsString()
  public name!: string;

  @IsEmail()
  public email!: string;
}
