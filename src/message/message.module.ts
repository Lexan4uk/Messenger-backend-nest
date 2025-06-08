import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { MessageController } from './message.controller'
import { MessageGateway } from './message.gateway'
import { MessageService } from './message.service'

@Module({
	controllers: [MessageController],
	providers: [MessageService, PrismaService, MessageGateway]
})
export class MessageModule {}
