import { IsEmail, IsOptional, IsString } from 'omac';

export class UserSaveBody {
  @IsString()
  @IsOptional()
  public id!: string;

  @IsString()
  public name!: string;

  @IsEmail()
  public email!: string;
}
