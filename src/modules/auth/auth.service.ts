import {
	BadRequestException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { verify } from 'argon2'
import { Response } from 'express'
import { UserService } from 'src/modules/user/user.service'
import { AuthDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
	EXPIRE_DAY_REFRESH_TOKEN = 1
	REFRESH_TOKEN_NAME = 'refreshToken'
	DOMAIN = 'localhost'
	constructor(
		private jwt: JwtService,
		private userService: UserService
	) {}

	async login(dto: AuthDto) {
		// 1) найдём id/login/password
		const { id, login, password } =
			await this.userService.findByLoginWithPassword(dto.login)

		// 2) проверяем пароль
		const valid = await verify(password, dto.password)
		if (!valid) throw new UnauthorizedException('Invalid credentials')

		// 3) issue tokens
		const { accessToken, refreshToken } = this.issueTokens(id)
		return {
			user: { login },
			accessToken,
			refreshToken
		}
	}

	async register(dto: AuthDto) {
		// 1) проверка на занятость логина
		const exists = await this.userService.getByLogin(dto.login)
		if (exists) throw new BadRequestException('User already exists')

		// 2) создаём пользователя
		const { id, login } = await this.userService.create(dto)

		// 3) выдаём токены
		const { accessToken, refreshToken } = this.issueTokens(id)
		return {
			user: { login },
			accessToken,
			refreshToken
		}
	}

	async getNewTokens(refreshToken: string) {
		let payload: { id: string }
		try {
			payload = await this.jwt.verifyAsync(refreshToken)
		} catch {
			throw new UnauthorizedException('Invalid refresh token')
		}

		// возьмём только id/login
		const { id, login } = await this.userService.findByIdWithPassword(
			payload.id
		)

		const { accessToken, refreshToken: newRefresh } = this.issueTokens(id)

		return {
			user: { login },
			accessToken,
			refreshToken: newRefresh
		}
	}

	private issueTokens(userId: string) {
		const payload = { id: userId }
		const accessToken = this.jwt.sign(payload, { expiresIn: '1h' })
		const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' })
		return { accessToken, refreshToken }
	}

	addRefreshTokenToResponse(res: Response, refreshToken: string) {
		const expiresIn = new Date()
		expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN)
		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			httpOnly: true,
			domain: this.DOMAIN,
			expires: expiresIn,
			sameSite: 'none',
			secure: true
		})
	}
	removeRefreshTokenFromResponse(res: Response) {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			domain: this.DOMAIN,
			expires: new Date(0),
			sameSite: 'none',
			secure: true
		})
	}
}
