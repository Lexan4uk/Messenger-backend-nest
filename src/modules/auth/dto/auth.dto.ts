import { IsString, MinLength } from 'class-validator'

export class AuthDto {
	@MinLength(4, {
		message: 'Login must be at least 4 characters long'
	})
	@IsString()
	login: string

	@MinLength(6, {
		message: 'Password must be at least 6 characters long'
	})
	@IsString()
	password: string
}
