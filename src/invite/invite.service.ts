import { Injectable, NotFoundException } from '@nestjs/common'
import { InviteStatus, Role, Type } from '@prisma/client'
import { ChatService } from 'src/chat/chat.service'
import { ChatUsersService } from 'src/chat_users/chat-users.service'
import { PrismaService } from 'src/prisma.service'
import { UserService } from 'src/user/user.service'
import {
	CreateDMInviteDto,
	CreateInviteDto,
	UpdateInviteDto
} from './dto/invite.dto'

@Injectable()
export class InviteService {
	constructor(
		private prisma: PrismaService,
		private chatUsersService: ChatUsersService,
		private chatService: ChatService,
		private userService: UserService
	) {}

	async newInvite(dto: CreateInviteDto, userId: string) {
		const targetUser = await this.userService.getByLogin(dto.targetLogin)
		if (!targetUser)
			throw new NotFoundException('User with this login was not found!')

		const existingLink = await this.prisma.chatUsers.findUnique({
			where: {
				chatId_userId: {
					chatId: dto.chatId,
					userId: targetUser.id
				}
			},
			select: {
				hidden: true
			}
		})

		if (existingLink && !existingLink.hidden) {
			return { message: 'User is already a member of this chat' }
		}

		const existingInvite = await this.prisma.invite.findFirst({
			where: {
				chatId: dto.chatId,
				targetId: targetUser.id,
				status: InviteStatus.pending
			}
		})
		if (existingInvite) {
			return { message: 'Invite to this user is already pending' }
		}

		const invite = await this.prisma.invite.create({
			data: {
				chatId: dto.chatId,
				senderId: userId,
				targetId: targetUser.id
			}
		})
		if (!invite) {
			throw new NotFoundException('Invite creation error!')
		}
		return { message: 'Invite sent', invite }
	}

	async newDMInvite(dto: CreateDMInviteDto, userId: string) {
		const targetUser = await this.userService.getByLogin(dto.targetLogin)

		if (!targetUser)
			throw new NotFoundException('User with this login was not found!')

		const privateChat = await this.chatService.existingChat(
			userId,
			targetUser.id
		)

		if (privateChat) {
			const link = await this.prisma.chatUsers.findUnique({
				where: {
					chatId_userId: {
						chatId: privateChat.id,
						userId
					}
				},
				select: {
					hidden: true
				}
			})

			if (link && !link.hidden) {
				return { message: 'DM with this user is already open' }
			}

			await this.prisma.chatUsers.update({
				where: {
					chatId_userId: {
						chatId: privateChat.id,
						userId
					}
				},
				data: { hidden: false }
			})
			return { message: 'DM restored' }
		}

		const chat = await this.prisma.chat.create({
			data: {
				type: Type.private,
				title: 'DM'
			}
		})

		const senderLink = await this.chatUsersService.linkUserToChat({
			chatId: chat.id,
			userId: userId,
			role: Role.user
		})

		if (!senderLink) throw new NotFoundException('Sender link error!')
		const newInvite = this.prisma.invite.create({
			data: {
				chatId: chat.id,
				senderId: userId,
				targetId: targetUser.id
			}
		})
		if (!newInvite) throw new NotFoundException('Invite creation error!')
		return { message: 'Invite sent' }
	}

	async updateStatus(inviteId: string, dto: UpdateInviteDto) {
		const invite = await this.prisma.invite.findUnique({
			where: { id: inviteId },
			select: { chatId: true, targetId: true }
		})

		if (!invite) {
			throw new NotFoundException('Invite not found')
		}

		//if invite is declined
		if (dto.status === InviteStatus.declined) {
			await this.prisma.invite.update({
				where: { id: inviteId },
				data: { status: InviteStatus.declined, updatedAt: new Date() }
			})
			return { message: 'Invite declined' }
		} else {
			//if invite is accepted
			await this.chatUsersService.linkUserToChat({
				chatId: invite.chatId,
				userId: invite.targetId,
				role: Role.user
			})

			return this.prisma.invite.update({
				where: { id: inviteId },
				data: { status: dto.status }
			})
		}
	}

	async getUserInvites(userId: string) {
		return await this.prisma.invite.findMany({
			where: {
				targetId: userId,
				status: InviteStatus.pending
			},
			select: {
				id: true,
				chat: {
					select: {
						title: true
					}
				},
				sender: {
					select: {
						name: true,
						login: true
					}
				}
			}
		})
	}
}
