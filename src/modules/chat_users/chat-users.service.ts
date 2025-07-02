import { Injectable } from '@nestjs/common'
import { UserService } from 'src/modules/user/user.service'
import { PrismaService } from 'src/prisma.service'
import {
	CreateChatUserDto,
	CutChatUserDto,
	KickUserDto
} from './dto/chat-user.dto'

@Injectable()
export class ChatUsersService {
	constructor(
		private prisma: PrismaService,
		private userService: UserService
	) {}

	async linkUserToChat(data: CreateChatUserDto) {
		return this.prisma.chatUsers.upsert({
			where: {
				chatId_userId: {
					chatId: data.chatId,
					userId: data.userId
				}
			},
			update: {
				hidden: false
			},
			create: {
				...data
			}
		})
	}

	async hideUserFromChat(data: CutChatUserDto) {
		return this.prisma.chatUsers.update({
			where: {
				chatId_userId: {
					chatId: data.chatId,
					userId: data.userId
				}
			},
			data: {
				hidden: true
			}
		})
	}

	async kickUserFromChat(dto: KickUserDto): Promise<{ message: string }> {
		const { chatId, requesterId, targetLogin } = dto
		const targetUser = await this.userService.getByLogin(targetLogin)
		if (!targetUser) {
			return { message: 'Target user not found' }
		}
		const targetId = targetUser.id

		if (requesterId === targetId) {
			return { message: 'You cannot kick yourself' }
		}

		const [requester, target] = await Promise.all([
			this.prisma.chatUsers.findUnique({
				where: { chatId_userId: { chatId, userId: requesterId } }
			}),
			this.prisma.chatUsers.findUnique({
				where: { chatId_userId: { chatId, userId: targetId } }
			})
		])

		if (!requester || !target) {
			return { message: 'Invalid chat or users' }
		}

		if (requester.role !== 'admin') {
			return { message: 'Only admins can kick users' }
		}

		if (target.role === 'admin') {
			return { message: 'You cannot kick another admin' }
		}

		await this.hideUserFromChat({ chatId, userId: targetId })
		return { message: 'User kicked' }
	}

	async getUserChatLink(chatId: string, userId: string) {
		return this.prisma.chatUsers.findUnique({
			where: { chatId_userId: { chatId, userId } }
		})
	}
}
