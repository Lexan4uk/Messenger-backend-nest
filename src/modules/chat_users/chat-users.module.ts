import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { UserModule } from '../user/user.module'
import { ChatUsersService } from './chat-users.service'

@Module({
	imports: [PrismaModule, UserModule],
	providers: [ChatUsersService],
	exports: [ChatUsersService]
})
export class ChatUsersModule {}
