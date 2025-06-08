import { Module } from '@nestjs/common'
import { ChatService } from 'src/chat/chat.service'
import { ChatUsersService } from 'src/chat_users/chat-users.service'
import { PrismaService } from 'src/prisma.service'
import { UserService } from 'src/user/user.service'
import { InviteController } from './invite.controller'
import { InviteService } from './invite.service'

@Module({
	controllers: [InviteController],
	providers: [
		InviteService,
		ChatUsersService,
		UserService,
		PrismaService,
		ChatService
	]
})
export class InviteModule {}
