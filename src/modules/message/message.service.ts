import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { UserService } from '../user/user.service'
import { MessageSentDto } from './dto/message-response.dto'
import { GetMessagesDto, InternalMessageDto } from './dto/message.dto'
import { MessageGateway } from './message.gateway'

@Injectable()
export class MessageService {
	constructor(
		private prisma: PrismaService,
		private gateway: MessageGateway,
		private userService: UserService
	) {}

	async newMessage(dto: InternalMessageDto): Promise<MessageSentDto> {
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

		if (!message) {
			throw new Error('Failed to create message')
		}
		this.gateway.sendMessageToChat(dto.chatId, message)

		return { message: 'Message sent' }
	}

	async getChatMessages(dto: GetMessagesDto) {
		const take = dto.take || 10

		const messages = await this.prisma.message.findMany({
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

		// Преобразуем в формат ответа
		return messages.map(m => ({
			id: m.id,
			content: m.content,
			createdAt: m.createdAt,
			sender: {
				name: m.sender.name?.trim()
					? m.sender.name.trim()
					: `@${m.sender.login}`,
				login: m.sender.login,
				imgUrl: m.sender.imgUrl
			}
		}))
	}
}
