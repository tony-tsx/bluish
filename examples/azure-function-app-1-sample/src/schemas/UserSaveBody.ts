import { IsGuard } from '@bluish/ornate-guard';
import { IsEmail, IsOptional, IsString } from 'ornate-guard';

@IsGuard()
export class UserSaveBody {
  @IsString()
  @IsOptional()
  public id!: string;

  @IsString()
  public name!: string;

  @IsEmail()
  public email!: string;
}
