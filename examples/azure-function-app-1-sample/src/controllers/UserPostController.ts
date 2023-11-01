import { Controller } from '@bluish/core';
import { DELETE, GET, Param, Path, PUT, Req, Request } from '@bluish/http';

import { dataSource } from '../services/dataSource.js';
import { Post } from '../entities/Post.js';
import { User } from '../entities/User.js';

@Controller
@Path('/posts')
@Param('post', (id, request) =>
  dataSource.getRepository(Post).findOneOrFail({
    where: { id, user: request.params.user as User },
  }),
)
export class UserPostController {
  public get repository() {
    return dataSource.getRepository(Post);
  }

  @GET
  public find(@Param('user') user: User) {
    return this.repository.find({
      where: { user },
    });
  }

  @PUT
  public save(@Param('user') user: User, @Req request: Request) {
    return this.repository.save(
      this.repository.create({
        // @ts-expect-error: TODO
        ...request.body,
        user,
      }),
    );
  }

  @DELETE('/{post}')
  public remove(@Param('post') post: Post) {
    return this.repository.softRemove(post);
  }
}
