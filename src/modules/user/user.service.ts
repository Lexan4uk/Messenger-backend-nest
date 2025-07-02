import { Injectable, NotFoundException } from '@nestjs/common'
import { hash } from 'argon2'
import { AuthDto } from 'src/modules/auth/dto/auth.dto'
import { PrismaService } from 'src/prisma.service'
import { ProfileResponseDto, UserResponseDto } from './dto/user-response.dto'
import { UpdateUserDto } from './dto/user.dto'

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	// Внутренний метод: получить пользователя без пароля и с чатами
	private async findUserWithChats(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			include: { chats: true }
		})
		if (!user) throw new NotFoundException('User not found')
		return user
	}

	async getProfile(id: string): Promise<ProfileResponseDto> {
		const user = await this.findUserWithChats(id)

		// вычисляем имя: если пусто — префикс @login
		const displayName = user.name?.trim() ? user.name.trim() : `@${user.login}`

		// отбираем только незакрытые чаты и убираем userId
		const chats = user.chats
			.filter(c => !c.hidden)
			.map(({ userId, ...rest }) => rest)

		const result: ProfileResponseDto = {
			user: {
				login: user.login,
				name: displayName,
				imgUrl: user.imgUrl,
				chats
			}
		}
		return result
	}

	// Обновление профиля
	async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
		const data: UpdateUserDto = { ...dto }

		if (dto.password) {
			data.password = await hash(dto.password)
		}
		// Prisma обновит только переданные поля
		const updated = await this.prisma.user.update({
			where: { id },
			data,
			select: {
				login: true,
				name: true,
				imgUrl: true
			}
		})

		// снова декорируем name
		const displayName = updated.name?.trim()
			? updated.name.trim()
			: `@${updated.login}`

		return {
			login: updated.login,
			name: displayName,
			imgUrl: updated.imgUrl
		}
	}
	async getLoginById(userId: string): Promise<string> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { login: true }
		})
		if (!user) throw new NotFoundException('User not found')
		return user.login
	}

	async getNameById(userId: string): Promise<string> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { name: true, login: true }
		})
		if (!user) throw new NotFoundException('User not found')
		return user.name?.trim() ? user.name.trim() : `@${user.login}`
	}
	/** Для AuthService.validateUser */
	async findByLoginWithPassword(
		login: string
	): Promise<{ id: string; login: string; password: string }> {
		const user = await this.prisma.user.findUnique({
			where: { login },
			select: { id: true, login: true, password: true }
		})
		if (!user) throw new NotFoundException('User not found')
		return user
	}

	/** Для getNewTokens и JwtStrategy */
	async findByIdWithPassword(
		id: string
	): Promise<{ id: string; login: string; password: string }> {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: { id: true, login: true, password: true }
		})
		if (!user) throw new NotFoundException('User not found')
		return user
	}

	async getByLogin(
		login: string
	): Promise<{ id: string; login: string } | null> {
		return this.prisma.user.findUnique({
			where: { login },
			select: {
				id: true,
				login: true
			}
		})
	}

	/** Создать нового пользователя (для регистрации) */
	async create(dto: AuthDto): Promise<{ id: string; login: string }> {
		const hashed = await hash(dto.password)
		const user = await this.prisma.user.create({
			data: {
				login: dto.login,
				name: '', // храним без "@"
				password: hashed
			},
			select: {
				id: true,
				login: true
			}
		})
		return user
	}
}
