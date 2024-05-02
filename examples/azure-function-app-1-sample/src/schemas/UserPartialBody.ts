import { IsGuard } from '@bluish/ornate-guard';
import { IsEmail, IsOptional, IsString } from 'ornate-guard';

@IsGuard()
export class UserPartialBody {
  @IsOptional()
  @IsString()
  public name?: string;

  @IsEmail()
  @IsOptional()
  public email?: string;
}
