import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import {
	CreateDMInviteDto,
	CreateInviteDto,
	UpdateInviteDto
} from './dto/invite.dto'
import { InviteService } from './invite.service'

@Controller('invite')
export class InviteController {
	constructor(private readonly inviteService: InviteService) {}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post()
	@Auth()
	async newInvite(
		@Body() dto: CreateInviteDto,
		@CurrentUser('id') userId: string
	) {
		return this.inviteService.newInvite(dto, userId)
	}
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('/dm')
	@Auth()
	async newDMInvite(
		@Body() dto: CreateDMInviteDto,
		@CurrentUser('id') userId: string
	) {
		return this.inviteService.newDMInvite(dto, userId)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Patch(':id')
	@Auth()
	async updateInvite(@Param('id') id: string, @Body() dto: UpdateInviteDto) {
		return this.inviteService.updateStatus(id, dto)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Get()
	@Auth()
	async getUserInvites(@CurrentUser('id') userId: string) {
		return this.inviteService.getUserInvites(userId)
	}
}
