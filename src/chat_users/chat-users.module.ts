import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { UserService } from 'src/user/user.service'
import { ChatUsersController } from './chat-users.controller'
import { ChatUsersService } from './chat-users.service'

@Module({
	controllers: [ChatUsersController],
	providers: [ChatUsersService, UserService, PrismaService]
})
export class ChatUsersModule {}
