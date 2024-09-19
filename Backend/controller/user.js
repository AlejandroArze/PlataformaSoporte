// Importa el servicio 'user' desde la carpeta 'service'
const userService = require("../service/user");
// Importa una utilidad para responder en formato JSON
const jsonResponse = require("../http/response/jsonResponse");
// Importa el Data Transfer Object (DTO) que define la estructura de un usuario
const UserDTO = require("../http/request/user/responseDTO");
// Importa Joi para validación de datos
const Joi = require("joi");

class UserController {

    // Método estático asíncrono para crear un nuevo usuario
    static async store(req, res) {
        try {
            // Desestructura los campos necesarios para el nuevo usuario desde req.body
            const { email, usuario, nombres, apellidos, password, role, image, estado } = req.body;
            //console.log(req.body)
            // Asegura que el campo `estado` sea tratado como número
            const estadoInt = parseInt(estado, 10);

            // Crea un nuevo usuario utilizando el servicio 'userService'
            const { usuarios_id } = await userService.store({ email, usuario, nombres, apellidos, password, role, image, estado: estadoInt });

            // Crea un nuevo DTO del usuario con los datos creados
            const newUser = new UserDTO(usuarios_id, email, usuario, nombres, apellidos, role, image, estadoInt);

            // Retorna una respuesta exitosa en formato JSON indicando que el usuario ha sido registrado
            return jsonResponse.successResponse(
                res,
                201,
                "User has been registered successfully",
                newUser
            );
        } catch (error) {
            // Si hay un error de validación de Joi, retorna una respuesta de validación
            return Joi.isError(error) ? jsonResponse.validationResponse(
                res,
                409,
                "Validation error",
                error.details.map(err => err.message)
            ) : jsonResponse.errorResponse(
                res,
                500,
                error.message
            );
        }
    }

    // Método estático asíncrono para obtener información de un usuario
    static async show(req, res) {
        try {
            // Obtiene el ID del usuario a través de req.params
            const { usuarios_id, email, usuario, nombres, apellidos, role, image, estado } = await userService.show(req.params.usuarios_id);

            // Crea un DTO con los datos obtenidos del usuario, asegurando que `estado` sea número
            const user = new UserDTO(usuarios_id, email, usuario, nombres, apellidos, role, image, parseInt(estado, 10));

            // Retorna una respuesta exitosa en formato JSON indicando que el usuario existe
            return jsonResponse.successResponse(
                res,
                200,
                "User exists",
                user
            );
        } catch (error) {
            // Si hay un error de validación de Joi, retorna una respuesta de validación
            return Joi.isError(error) ? jsonResponse.validationResponse(
                res,
                409,
                "Validation error",
                error.details.map(err => err.message)
            ) : jsonResponse.errorResponse(
                res,
                500,
                error.message
            );
        }
    }

    // Método estático asíncrono para actualizar la información de un usuario
    static async update(req, res) {
        try {
            // Asegura que el campo `estado` sea tratado como número
            const { email, usuario, nombres, apellidos, password, role, image, estado } = req.body;
            const estadoInt = parseInt(estado, 10);
            const id= req.params.usuarios_id;
            console.log("id ",id)

            // Actualiza el usuario en la base de datos
            await userService.update({ usuarios_id: req.params.usuarios_id,email, usuario, nombres, apellidos, password, role, image, estado: estadoInt }, req.params.usuarios_id);
            
            // Crea un nuevo DTO con los datos actualizados del usuario
            const updatedUser = new UserDTO(id, email, usuario, nombres, apellidos, role, image, estadoInt);

            // Retorna una respuesta exitosa en formato JSON indicando que el usuario ha sido actualizado
            return jsonResponse.successResponse(
                res,
                200,
                "User has been updated",
                updatedUser
            );
        } catch (error) {
            // Si hay un error de validación de Joi, retorna una respuesta de validación
            return Joi.isError(error) ? jsonResponse.validationResponse(
                res,
                409,
                "Validation error",
                error.details.map(err => err.message)
            ) : jsonResponse.errorResponse(
                res,
                500,
                error.message
            );
        }
    }

    // Método estático asíncrono para eliminar un usuario
    static async destroy(req, res) {
        try {
            const id= req.params.usuarios_id;
            console.log("id ",id)
            // Elimina al usuario mediante el servicio 'userService'
            await userService.destroy(req.params.usuarios_id);

            // Retorna una respuesta exitosa en formato JSON indicando que el usuario ha sido eliminado
            return jsonResponse.successResponse(
                res,
                200,
                "User has been deleted"
            );
        } catch (error) {
            // Si hay un error de validación de Joi, retorna una respuesta de validación
            return Joi.isError(error) ? jsonResponse.validationResponse(
                res,
                409,
                "Validation error",
                error.details.map(err => err.message)
            ) : jsonResponse.errorResponse(
                res,
                500,
                error.message
            );
        }
    }

}

// Exporta la clase UserController para que pueda ser utilizada en otros archivos
module.exports = UserController;
