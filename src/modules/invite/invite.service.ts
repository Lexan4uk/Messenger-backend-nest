import { Injectable, NotFoundException } from '@nestjs/common'
import { InviteStatus, Role, Type } from '@prisma/client'
import { ChatService } from 'src/modules/chat/chat.service'
import { ChatUsersService } from 'src/modules/chat_users/chat-users.service'
import { UserService } from 'src/modules/user/user.service'
import { PrismaService } from 'src/prisma.service'
import { UserInviteItemDto } from './dto/invite-response.dto'
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

	/**
	 * Создание инвайта в групповой чат
	 */
	async newInvite(dto: CreateInviteDto, userId: string) {
		const targetUser = await this.userService.getByLogin(dto.targetLogin)
		if (!targetUser)
			throw new NotFoundException('User with this login was not found!')

		const existingLink = await this.chatUsersService.getUserChatLink(
			dto.chatId,
			targetUser.id
		)

		// Если пользователь уже в чате и не скрыт
		if (existingLink && !existingLink.hidden) {
			return { message: 'User is already a member of this chat' }
		}

		// Проверка на уже отправленный инвайт
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
		return {
			message: 'Invite sent',
			invite: {
				chatId: invite.chatId,
				status: invite.status,
				senderLogin: await this.userService.getLoginById(userId),
				targetLogin: await this.userService.getLoginById(targetUser.id)
			}
		}
	}

	/**
	 * Создание инвайта в личный чат (DM)
	 */
	async newDMInvite(dto: CreateDMInviteDto, userId: string) {
		const targetUser = await this.userService.getByLogin(dto.targetLogin)

		if (!targetUser)
			throw new NotFoundException('User with this login was not found!')

		// Проверяем наличие существующего личного чата
		const privateChat = await this.chatService.existingChat(
			userId,
			targetUser.id
		)

		if (privateChat) {
			const link = await this.chatUsersService.getUserChatLink(
				privateChat.id,
				userId
			)

			// Если DM уже открыт
			if (link && !link.hidden) {
				return { message: 'DM with this user is already open' }
			}

			// Восстанавливаем скрытый DM
			await this.chatUsersService.linkUserToChat({
				chatId: privateChat.id,
				userId: userId,
				role: Role.user
			})
			return { message: 'DM restored' }
		}

		// Создаём новый личный чат
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

		const newInvite = await this.prisma.invite.create({
			data: {
				chatId: chat.id,
				senderId: userId,
				targetId: targetUser.id
			}
		})
		if (!newInvite) throw new NotFoundException('Invite creation error!')
		return { message: 'Invite sent' }
	}

	/**
	 * Обновление статуса инвайта (принят/отклонён)
	 */
	async updateStatus(inviteId: string, dto: UpdateInviteDto) {
		const invite = await this.prisma.invite.findUnique({
			where: { id: inviteId },
			select: { chatId: true, targetId: true }
		})

		if (!invite) {
			throw new NotFoundException('Invite not found')
		}

		// Если инвайт отклонён
		if (dto.status === InviteStatus.declined) {
			await this.prisma.invite.update({
				where: { id: inviteId },
				data: {
					status: InviteStatus.declined,
					updatedAt: new Date()
				}
			})
			return { message: 'Invite declined' }
		}

		// Если инвайт принят — добавляем пользователя в чат
		await this.chatUsersService.linkUserToChat({
			chatId: invite.chatId,
			userId: invite.targetId,
			role: Role.user
		})

		const updated = await this.prisma.invite.update({
			where: { id: inviteId },
			data: { status: dto.status }
		})

		return {
			message: 'Invite accepted',
			invite: {
				chatId: updated.chatId,
				status: updated.status,
				senderLogin: await this.userService.getLoginById(updated.senderId),
				targetLogin: await this.userService.getLoginById(updated.targetId)
			}
		}
	}

	/**
	 * Получение всех входящих инвайтов для пользователя
	 */
	async getUserInvites(
		userId: string
	): Promise<{ invites: UserInviteItemDto[] }> {
		const invites = await this.prisma.invite.findMany({
			where: {
				targetId: userId,
				status: InviteStatus.pending
			},
			select: {
				id: true,
				chat: {
					select: { title: true }
				},
				sender: {
					select: { name: true, login: true }
				}
			}
		})

		// Формируем корректное имя отправителя (name или @login)
		const normalizedInvites = invites.map(invite => ({
			id: invite.id,
			chatName: invite.chat.title,
			senderName: invite.sender.name?.trim()
				? invite.sender.name.trim()
				: `@${invite.sender.login}`
		}))

		// Возвращаем результат в ожидаемой обёртке
		return { invites: normalizedInvites }
	}
}
