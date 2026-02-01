import { JsonController, Post, Body, BadRequestError, Get, Authorized, CurrentUser, UploadedFile } from "routing-controllers";
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

    /**
     * Récupère le profil de l'utilisateur connecté avec ses photos de trombinoscope
     */
    @Get("/profile")
    getProfile(@CurrentUser() user: User) {
        return userService.getUserProfile(user.id);
    }

    /**
     * Met à jour l'email de l'utilisateur connecté
     */
    @Post("/profile/email")
    updateEmail(@Body() body: any, @CurrentUser() user: User) {
        if (!body.email) {
            throw new BadRequestError("Email requis");
        }
        return userService.updateEmail(user.id, body.email);
    }

    /**
     * Ajoute ou remplace une photo du trombinoscope pour l'utilisateur connecté
     */
    @Post("/profile/trombi")
    saveTrombi(@UploadedFile("image") image: any, @Body() body: any, @CurrentUser() user: User) {
        if (!image) {
            throw new BadRequestError("Image requise");
        }
        if (!body.year) {
            throw new BadRequestError("Année requise");
        }
        return userService.saveUserTrombi(user.id, body.year, image);
    }

    /**
     * Met à jour les informations personnelles de l'utilisateur connecté
     */
    @Post("/profile/info")
    updateProfile(@Body() body: any, @CurrentUser() user: User) {
        return userService.updateUserProfile(user.id, body);
    }
}
