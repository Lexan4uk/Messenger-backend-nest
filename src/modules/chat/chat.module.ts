import { Module } from '@nestjs/common'
import { ChatUsersModule } from '../chat_users/chat-users.module'
import { PrismaModule } from '../prisma/prisma.module'
import { UserModule } from '../user/user.module'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'

@Module({
	imports: [PrismaModule, UserModule, ChatUsersModule],
	controllers: [ChatController],
	providers: [ChatService],
	exports: [ChatService]
})
export class ChatModule {}
