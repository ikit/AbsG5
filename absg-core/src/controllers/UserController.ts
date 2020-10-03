import { JsonController, Post, Body, BadRequestError, Get, Authorized, CurrentUser, Param } from "routing-controllers";
import { User } from "../entities";
import { userService, agendaService } from "../services";

@Authorized()
@JsonController("/users")
export class UserController {

    @Get("/list")
    list() {
        return userService.getUsers();
    }

    @Post("/")
    save(@Body() user: any, @CurrentUser() currentUser: User) {
        if (user && user.id === -1 && currentUser.is("admin")) {
            return userService.createUser(user);
        } else if (user && user.id > -1 && (currentUser.is("admin") || currentUser.id === user.id)) {
            return userService.saveUser(user);
        }
        throw new BadRequestError("informations incomplètes");
    }

    @Post("/change-pwd")
    changePwd(@Body() body: any, @CurrentUser() user: User) {
        return userService.changePassword(user, body.pwd);
    }

    @Post("/:id([0-9]+)/updateGPS")
    updateGPS(@Param("id") id: number, @Body() body: any, @CurrentUser() user: User) {
        if (user && user.id === id) {
            return userService.updateGPS(id, body);
        }
        throw new BadRequestError("Impossible de mettre à jour les données l'utilisateur");
    }
}
