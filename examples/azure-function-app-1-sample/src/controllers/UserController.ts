import { Controller } from '@bluish/core';
import { DELETE, GET, Param, PATCH, Path, PUT, Req } from '@bluish/http';
import createHttpError from 'http-errors';
import { Transaction, UseTransaction } from '@bluish/typeorm';

import { dataSource } from '../services/dataSource.js';
import { User } from '../entities/User.js';
import UserFindQuery from '../schemas/UserFindQuery.js';
import { UserSaveBody } from '../schemas/UserSaveBody.js';

@Controller
@Path('/users')
@Param('user', id =>
  dataSource
    .getRepository(User)
    .findOneOrFail({ where: { id } })
    .catch(cause => {
      throw createHttpError(404, `Not Found User With ID '${id}'`, { cause });
    }),
)
export class UserController {
  public get repository() {
    return dataSource.getRepository(User);
  }

  @GET
  public async find(@Req.Query query: UserFindQuery) {
    const offset = query.page * query.limit - query.limit;

    const [users, count] = await this.repository.findAndCount({
      take: query.limit,
      skip: offset,
    });

    return { count, users };
  }

  @PUT
  public save(@Req.Body body: UserSaveBody, @UseTransaction(dataSource) transaction: Transaction) {
    return transaction.save(transaction.create(User, body));
  }

  @GET('/{user}')
  public findOne(@Param('user') user: User) {
    return user;
  }

  @PATCH('/{user}')
  public update(
    @Param('user') user: User,
    @Req.Body body: object,
    @UseTransaction(dataSource) transaction: Transaction,
  ) {
    return transaction.save(Object.assign(user, body));
  }

  @DELETE('/{user}')
  public remove(@Param('user') user: User, @UseTransaction(dataSource) transaction: Transaction) {
    return transaction.softRemove(user);
  }
}
