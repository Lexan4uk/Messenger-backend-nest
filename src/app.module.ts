import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { ChatModule } from './chat/chat.module'
import { ChatUsersModule } from './chat_users/chat-users.module'
import { InviteModule } from './invite/invite.module'
import { MessageModule } from './message/message.module'
import { UserModule } from './user/user.module'

@Module({
	imports: [
		AuthModule,
		UserModule,
		ConfigModule.forRoot(),
		ChatModule,
		ChatUsersModule,
		MessageModule,
		InviteModule
	]
})
export class AppModule {}
