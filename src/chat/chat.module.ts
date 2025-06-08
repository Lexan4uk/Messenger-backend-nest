import { Module } from '@nestjs/common'
import { ChatUsersService } from 'src/chat_users/chat-users.service'
import { PrismaService } from 'src/prisma.service'
import { UserService } from 'src/user/user.service'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'

@Module({
	controllers: [ChatController],
	providers: [ChatService, ChatUsersService, PrismaService, UserService]
})
export class ChatModule {}
