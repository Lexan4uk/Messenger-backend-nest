import { Injectable, NotFoundException } from '@nestjs/common'
import { Role, Type } from '@prisma/client'
import { ChatUsersService } from 'src/modules/chat_users/chat-users.service'
import { PrismaService } from 'src/prisma.service'
import {
	CreateChatDto,
	GetChatMiniaturesDto,
	GetChatUsersDto,
	LeaveChatDto
} from './dto/chat.dto'

@Injectable()
export class ChatService {
	constructor(
		private prisma: PrismaService,
		private chatUsersService: ChatUsersService
	) {}

	async createChat(dto: CreateChatDto, userId: string) {
		const chat = await this.prisma.chat.create({
			data: {
				...dto
			}
		})
		await this.chatUsersService.linkUserToChat({
			chatId: chat.id,
			userId: userId,
			role: chat.type === Type.private ? Role.user : Role.admin
		})

		return chat
	}

	async getChatMiniatures(dto: GetChatMiniaturesDto, userId: string) {
		const chats = await this.prisma.chat.findMany({
			where: {
				id: { in: dto.ids }
			},
			select: {
				id: true,
				type: true,
				title: true,
				description: true,
				imgUrl: true,
				createdAt: true,
				users: {
					where: {
						hidden: false
					},
					select: {
						userId: true,
						role: true,
						user: {
							select: {
								id: true,
								name: true,
								login: true,
								imgUrl: true
							}
						}
					}
				}
			}
		})
		return chats.map(chat => {
			const currentUserEntry = chat.users.find(u => u.userId === userId)
			const role = currentUserEntry?.role || null

			//creating name for private chats
			if (chat.type === Type.private) {
				const secondUser = chat.users.find(u => u.user.id !== userId)?.user
				const title = secondUser?.name || `@${secondUser?.login || 'unknown'}`
				const description = `DM with ${title}`

				return {
					id: chat.id,
					type: chat.type,
					description: description,
					title: title,
					imgUrl: secondUser?.imgUrl || null,
					role: role,
					usersCount: null,
					createdAt: chat.createdAt
				}
			}
			//for group chats, return the title as is
			return {
				id: chat.id,
				type: chat.type,
				description: chat.description,
				title: chat.title,
				imgUrl: chat.imgUrl || null,
				role: role,
				usersCount: chat.users.length,
				createdAt: chat.createdAt
			}
		})
	}
	async leaveChat(dto: LeaveChatDto, userId: string) {
		await this.chatUsersService.hideUserFromChat({
			userId,
			chatId: dto.chatId
		})
		return { message: 'Successfully left the chat' }
	}

	async existingChat(
		userId: string,
		targetId: string
	): Promise<{ id: string } | null> {
		return this.prisma.chat.findFirst({
			where: {
				type: Type.private,
				AND: [
					{ users: { some: { userId } } },
					{ users: { some: { userId: targetId } } }
				]
			},
			select: { id: true }
		})
	}
	async getChatUsers(dto: GetChatUsersDto) {
		const chat = await this.prisma.chat.findUnique({
			where: { id: dto.chatId },
			select: {
				users: {
					where: { hidden: false },
					select: {
						role: true,
						user: {
							select: {
								name: true,
								login: true,
								imgUrl: true
							}
						}
					}
				}
			}
		})

		if (!chat) throw new NotFoundException('Chat not found')

		const transformedUsers = chat.users.map(user => ({
			name: user.user.name || `@${user.user.login}`,
			login: user.user.login,
			imgUrl: user.user.imgUrl || null,
			role: user.role
		}))

		transformedUsers.sort((a, b) => {
			if (a.role === Role.admin && b.role !== Role.admin) return -1
			if (a.role !== Role.admin && b.role === Role.admin) return 1

			return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
		})

		return transformedUsers
	}
}
