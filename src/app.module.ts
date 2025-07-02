import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './modules/auth/auth.module'
import { ChatModule } from './modules/chat/chat.module'
import { ChatUsersModule } from './modules/chat_users/chat-users.module'
import { InviteModule } from './modules/invite/invite.module'
import { MessageModule } from './modules/message/message.module'
import { UserModule } from './modules/user/user.module'

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
