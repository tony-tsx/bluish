import { plainToClass, Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import 'reflect-metadata';

class B {
  @IsNumber()
  public number!: number;
}

class A {
  @Type(() => B)
  public b!: B;
}

plainToClass(A, { b: { number: '1' } }, {});
