import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	Patch,
	Post
} from '@nestjs/common'
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'
import { Auth } from 'src/modules/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/modules/auth/decorators/user.decorator'
import {
	InviteResponseDto,
	InviteResponseMessageDto,
	UserInvitesResponseDto
} from './dto/invite-response.dto'
import {
	CreateDMInviteDto,
	CreateInviteDto,
	UpdateInviteDto
} from './dto/invite.dto'
import { InviteService } from './invite.service'

@ApiTags('invite')
@ApiBearerAuth('access-token')
@Auth()
@Controller('invite')
export class InviteController {
	constructor(private readonly inviteService: InviteService) {}

	@Post()
	@HttpCode(200)
	@ApiOperation({ summary: 'Создать групповое приглашение в чат' })
	@ApiResponse({ status: 200, type: InviteResponseDto })
	async newInvite(
		@Body() dto: CreateInviteDto,
		@CurrentUser('id') userId: string
	): Promise<InviteResponseDto> {
		return this.inviteService.newInvite(dto, userId)
	}

	@Post('dm')
	@HttpCode(200)
	@ApiOperation({ summary: 'Создать или восстановить личное приглашение (DM)' })
	@ApiResponse({ status: 200, type: InviteResponseDto })
	async newDMInvite(
		@Body() dto: CreateDMInviteDto,
		@CurrentUser('id') userId: string
	): Promise<InviteResponseDto> {
		return this.inviteService.newDMInvite(dto, userId)
	}

	@Patch(':id')
	@HttpCode(200)
	@ApiOperation({ summary: 'Обновить статус приглашения (accept/decline)' })
	@ApiResponse({ status: 200, type: InviteResponseMessageDto })
	@ApiResponse({
		status: 200,
		type: InviteResponseDto,
		description: 'Принимаем приглашение и возвращаем его детали'
	})
	async updateInvite(
		@Param('id') id: string,
		@Body() dto: UpdateInviteDto
	): Promise<InviteResponseMessageDto | InviteResponseDto> {
		return this.inviteService.updateStatus(id, dto)
	}

	@Get()
	@HttpCode(200)
	@ApiOperation({ summary: 'Получить список входящих приглашений' })
	@ApiResponse({ status: 200, type: UserInvitesResponseDto })
	async getUserInvites(
		@CurrentUser('id') userId: string
	): Promise<UserInvitesResponseDto> {
		return this.inviteService.getUserInvites(userId)
	}
}
