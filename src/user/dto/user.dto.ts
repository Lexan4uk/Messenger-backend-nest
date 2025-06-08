import { IsOptional, IsString, MinLength } from 'class-validator'

export class UserDto {
	@IsOptional()
	@IsString()
	@MinLength(4, {
		message: 'Login must be at least 4 characters long'
	})
	login?: string

	@IsOptional()
	@IsString()
	name?: string

	@IsOptional()
	@IsString()
	@MinLength(6, {
		message: 'Password must be at least 6 characters long'
	})
	password?: string

	@IsOptional()
	@IsString()
	imgUrl?: string
}
