import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor
} from '@nestjs/common'

import { UsersService } from './users.service'

import { User } from './user.entity'

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers()
  }

  @Get('/:id')
  getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.getUserById(id)
  }
}
