import { Body, Controller, Get, HttpCode, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Auth } from 'src/modules/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/modules/auth/decorators/user.decorator'
import { ProfileResponseDto, UserResponseDto } from './dto/user-response.dto'
import { UpdateUserDto } from './dto/user.dto'
import { UserService } from './user.service'

@ApiBearerAuth('access-token')
@Auth()
@Controller('user/profile')
export class UserController {
	constructor(private readonly userService: UserService) {}
	@Get()
	@ApiOperation({ summary: 'Получить профиль текущего пользователя' })
	@ApiResponse({ status: 200, type: ProfileResponseDto })
	async profile(@CurrentUser('id') id: string): Promise<ProfileResponseDto> {
		return this.userService.getProfile(id)
	}

	@Put()
	@HttpCode(200)
	@ApiOperation({ summary: 'Обновить профиль' })
	@ApiResponse({ status: 200, type: UserResponseDto })
	async update(
		@CurrentUser('id') id: string,
		@Body() dto: UpdateUserDto
	): Promise<UserResponseDto> {
		return this.userService.update(id, dto)
	}
}
