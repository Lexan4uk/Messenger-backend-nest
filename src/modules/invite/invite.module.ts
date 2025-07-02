import { Module } from '@nestjs/common'
import { ChatModule } from '../chat/chat.module'
import { ChatUsersModule } from '../chat_users/chat-users.module'
import { PrismaModule } from '../prisma/prisma.module'
import { UserModule } from '../user/user.module'
import { InviteController } from './invite.controller'
import { InviteService } from './invite.service'

@Module({
	imports: [PrismaModule, UserModule, ChatModule, ChatUsersModule],
	controllers: [InviteController],
	providers: [InviteService]
})
export class InviteModule {}
