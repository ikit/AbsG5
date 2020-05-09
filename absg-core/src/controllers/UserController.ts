import { JsonController, Post, Body, BadRequestError, Get, Authorized, CurrentUser } from "routing-controllers";
import { User } from "../entities";
import { userService } from "../services";

@Authorized()
@JsonController("/users")
export class UserController {

    @Get("/list")
    list() {
        return userService.getUsers();
    }

    @Post("/")
    save(@Body() user: any, @CurrentUser() currentUser: User) {
        if (user && user.id === -1 && currentUser.roles.contains("Admin")) {
            return userService.createUser(user);
        } else if (user && user.id > -1 && (currentUser.roles.contains("Admin") || currentUser.id === user.id)) {
            return userService.saveUser(user);
        }
        throw new BadRequestError("informations incomplètes");
    }

    @Post("/change-pwd")
    changePwd(@Body() body: any, @CurrentUser() user: User) {
        return userService.changePassword(user, body.pwd);
    }
}
