import {
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { hash } from 'argon2'
import { AuthDto } from 'src/auth/dto/auth.dto'
import { PrismaService } from 'src/prisma.service'
import { ProfileResponseDto, UserResponseDto } from './dto/user-response.dto'
import { UserDto } from './dto/user.dto'

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async getById(id: string): Promise<UserResponseDto | null> {
		return this.prisma.user.findUnique({
			where: { id },
			include: { chats: true }
		})
	}

	async getByLogin(login: string): Promise<UserResponseDto | null> {
		return this.prisma.user.findUnique({
			where: { login }
		})
	}

	async create(dto: AuthDto): Promise<UserResponseDto> {
		const user = {
			login: dto.login,
			name: '',
			password: await hash(dto.password)
		}
		return this.prisma.user.create({
			data: user
		})
	}

	async getProfile(id: string): Promise<ProfileResponseDto> {
		const profile = await this.getById(id)

		if (!profile) throw new UnauthorizedException('Profile not found')

		const { password, chats = [], ...rest } = profile
		return {
			user: {
				...rest,
				chats: chats
					.filter(chat => !chat.hidden)
					.map(({ userId, ...chat }) => chat)
			}
		}
	}

	async update(id: string, dto: UserDto) {
		let data = dto

		if (dto.password) {
			data = {
				...dto,
				password: await hash(dto.password)
			}
		}
		if (dto.imgUrl) {
			data = {
				...data,
				imgUrl: dto.imgUrl
			}
		}

		return this.prisma.user.update({
			where: { id },
			data,
			select: {
				login: true,
				name: true,
				imgUrl: true
			}
		})
	}
	async getNameById(userId: string): Promise<string> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { name: true, login: true }
		})

		if (!user) throw new NotFoundException('User not found')

		return user.name || `@${user.login}`
	}
}
