import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { UserModule } from '../user/user.module'
import { MessageController } from './message.controller'
import { MessageGateway } from './message.gateway'
import { MessageService } from './message.service'

@Module({
	imports: [PrismaModule, UserModule],
	controllers: [MessageController],
	providers: [MessageService, MessageGateway]
})
export class MessageModule {}
