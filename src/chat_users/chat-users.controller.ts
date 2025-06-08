import { Controller } from '@nestjs/common'
import { ChatUsersService } from './chat-users.service'

@Controller('chat-users')
export class ChatUsersController {
	constructor(private readonly chatUsersService: ChatUsersService) {}
}
