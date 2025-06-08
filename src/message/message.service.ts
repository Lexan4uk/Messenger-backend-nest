import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { GetMessagesDto, MessageDto } from './dto/message.dto'
import { MessageGateway } from './message.gateway'

@Injectable()
export class MessageService {
	constructor(
		private prisma: PrismaService,
		private gateway: MessageGateway
	) {}

	async newMessage(dto: MessageDto) {
		const message = await this.prisma.message.create({
			data: {
				chatId: dto.chatId,
				senderId: dto.senderId,
				content: dto.content
			},
			include: {
				sender: {
					select: {
						name: true,
						login: true,
						imgUrl: true
					}
				}
			}
		})
		this.gateway.sendMessageToChat(dto.chatId, message)

		return message
	}
	async getChatMessages(dto: GetMessagesDto) {
		const take = dto.take || 10

		return this.prisma.message.findMany({
			where: {
				chatId: dto.chatId
			},
			orderBy: {
				createdAt: 'desc'
			},
			take,
			...(dto.lastMessage && {
				skip: 1,
				cursor: {
					id: dto.lastMessage
				}
			}),
			include: {
				sender: {
					select: {
						name: true,
						login: true,
						imgUrl: true
					}
				}
			}
		})
	}
}
