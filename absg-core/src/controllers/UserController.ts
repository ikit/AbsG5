import { getRepository } from "typeorm";
import { JsonController, Post, Body, BadRequestError, Get, Authorized } from "routing-controllers";
import { User } from "../entities";
import { userService } from "../services";

@Authorized()
@JsonController("/users")
export class UserController {
    private userRepo = getRepository(User);

    @Get("/list")
    async list() {
        return await userService.getUsers();
    }

    @Post("/")
    async save(@Body() user: any) {
        if (user && user.id === -1) {
            return await userService.createUser(user);
        } else if (user && user.id > -1) {
            return await userService.saveUser(user);
        }
        throw new BadRequestError("informations incomplètes");
    }
}
