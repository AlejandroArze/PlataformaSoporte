// Importa el servicio 'user' desde la carpeta 'service'
const userService = require("../service/user");
// Importa una utilidad para responder en formato JSON
const jsonResponse = require("../http/response/jsonResponse");
// Importa el Data Transfer Object (DTO) que define la estructura de un usuario
const UserDTO = require("../http/request/user/responseDTO");
const { updateDTO } = require('../http/request/user/updateDTO');
const { User } = require('../models'); 
const bcrypt = require('bcrypt');
const loginSchema = require("../http/request/user/loginDTO");
// Importa Joi para validación de datos
const Joi = require("joi");

const jwt = require('jsonwebtoken');



class UserController {

    // Método para iniciar sesión
    static async login(req, res) {
        try {
            // Valida el cuerpo de la solicitud   
            await loginSchema.validateAsync(req.body);

            const { email, password } = req.body;

            // Verifica si el correo electrónico existe en la base de datos
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(404).json({ message: 'El usuario no existe con ese correo electrónico' });
            }

            // Verifica la contraseña
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ message: 'La contraseña es incorrecta' });
            }

            // Genera el token
            const token = jwt.sign(
                { id: user.usuarios_id, email: user.email, role: user.role},
                process.env.JWT_SECRET || 'default_secret', // Clave secreta
                { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } // Duración del token despues poner 1h
            );
            console.log("JWT Token:", token);
            // Devuelve el usuario y el token 
            // Devuelve el usuario, el token y un mensaje de éxito
            return res.status(200).json({
                message: 'Inicio de sesión exitoso', // Mensaje adicional
                user: {
                    id: user.usuarios_id,
                    email: user.email,
                    role: user.role
                },
                token
            });

        } catch (error) {
            if (error.isJoi) {
                return res.status(400).json({
                    message: 'Error de validación',
                    details: error.details.map(err => err.message)
                });
            }
            console.error('Error durante el inicio de sesión:', error);
            return res.status(500).json({ message: 'Ocurrió un error inesperado' });
        }
    }
    //Método para iniciar sesion con el token
    static async loginToken(req, res) {
        try {
            const { accessToken } = req.body;

            // Verificar si se envió el token
            if (!accessToken) {
                return res.status(400).json({ message: 'Token de acceso requerido' });
            }

            // Verificar y decodificar el token
            jwt.verify(accessToken, process.env.JWT_SECRET || 'default_secret', async (err, decoded) => {
                if (err) {
                    return res.status(401).json({ message: 'Token no válido o expirado' });
                }

                // Buscar al usuario en la base de datos usando la información del token
                const user = await User.findOne({ where: { usuarios_id: decoded.id } });

                if (!user) {
                    return res.status(404).json({ message: 'Usuario no encontrado' });
                }

                // Si el token es válido, devolver la información del usuario
                return res.status(200).json({
                    message: 'Autenticación exitosa con el token',
                    user: {
                        id: user.usuarios_id,
                        email: user.email,
                        role: user.role
                    },
                    accessToken  // Devolver el token actual
                });
            });

        } catch (error) {
            console.error('Error durante la autenticación con token:', error);
            return res.status(500).json({ message: 'Ocurrió un error inesperado' });
        }
    }


       /* // Método estático asíncrono para crear un nuevo usuario
        static async store(req, res) {
            try {
                // Desestructura los campos necesarios para el nuevo usuario desde req.body
                const { email, usuario, nombres, apellidos, password, role, image, estado } = req.body;
                //console.log(req.body)
                // Asegura que el campo `estado` sea tratado como número
                const estadoInt = parseInt(estado, 10);

                let imagePath = null;
                if (req.file) {
                   imagePath = req.file.path; // Aquí obtienes el path del archivo subido
                }
    
                // Crea un nuevo usuario utilizando el servicio 'userService'
                const { usuarios_id } = await userService.store({ email, usuario, nombres, apellidos, password, role, image: imagePath, estado: estadoInt });
    
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
        }*/

    // 
    static async store(req, res) {
    try {
        const { email, usuario, nombres, apellidos, password, role, estado } = req.body;
        const estadoInt = parseInt(estado, 10);

        // Verifica si se subió una imagen; si no, usa la predeterminada
        //const imagePath = req.file ? req.file.path : "/uploads/default-profile.png";
        // Guarda solo el nombre del archivo en la base de datos
        //const imagePath = req.file ? `/uploads/${req.file.filename}` : "/uploads/default-profile.png";
        // Verifica si se subió un archivo
        if (!req.file) {
            console.log("No se ha subido ningún archivo");
        } else {
            console.log("Archivo recibido:", req.file);  // Muestra el archivo recibido
        }

        const imagePath = req.file ? `/uploads/${req.file.filename}` : (req.body.image || "/uploads/default-profile.png");
    

        console.log("Ruta de la imagen guardada:", imagePath);

        // Crea el usuario
        const { usuarios_id } = await userService.store({
            email,
            usuario,
            nombres,
            apellidos,
            password,
            role,
            image: imagePath,
            estado: estadoInt
        });

        // Retorna los datos del nuevo usuario
        const newUser = new UserDTO(usuarios_id, email, usuario, nombres, apellidos, role, imagePath, estadoInt);
        return jsonResponse.successResponse(res, 201, "User has been registered successfully", newUser);
    } catch (error) {
        return Joi.isError(error)
            ? jsonResponse.validationResponse(res, 409, "Validation error", error.details.map(err => err.message))
            : jsonResponse.errorResponse(res, 500, error.message);
    }
}

    

    // Método estático asíncrono para obtener información de un usuario 
    /*static async show(req, res) {
        try {
            // Obtiene el ID del usuario a través de req.params
            const { usuarios_id, nombres, apellidos, usuario, email, role, image, estado } = await userService.show(req.params.usuarios_id);

            // Crea un DTO con los datos obtenidos del usuario, asegurando que `estado` sea número
            const user = new UserDTO(usuarios_id, nombres, apellidos, usuario, email, role, image, parseInt(estado, 10));

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
    }*/
       /* static async show(req, res) {
            try {
                const userData = await userService.show(req.params.usuarios_id);
                const { usuarios_id, nombres, apellidos, usuario, email, role, image, estado } = userData;
                console.log('Datos del usuario antes de enviar:', userData);
                const user = {
                    usuarios_id,
                    nombres,
                    apellidos,
                    usuario,
                    email,
                    role,
                    image,
                    estado
                };
        
                return jsonResponse.successResponse(res, 200, "User exists", user);
            } catch (error) {
                return Joi.isError(error) ? 
                    jsonResponse.validationResponse(res, 409, "Validation error", error.details.map(err => err.message)) :
                    jsonResponse.errorResponse(res, 500, error.message);
            }
        }*/
            static async show(req, res) {
                try {
                    // Obtiene el ID del usuario a través de req.params
                    console.log('ID del usuario en la solicitud:', req.params.usuarios_id);
            
                    const { usuarios_id, nombres, apellidos, usuario, email, role, image, estado } = await userService.show(req.params.usuarios_id);
                    
                    console.log('Datos del usuario obtenidos:', { usuarios_id, nombres, apellidos, usuario, email, role, image, estado });
            
                    // Crea un DTO con los datos obtenidos del usuario, asegurando que `estado` sea número
                    const user = new UserDTO(usuarios_id, nombres, apellidos, usuario, email, parseInt(estado, 10), role, image);
                    
                    console.log('DTO creado con los datos del usuario:', user);
            
                    // Retorna una respuesta exitosa en formato JSON indicando que el usuario existe
                    return jsonResponse.successResponse(
                        res,
                        200,
                        "User exists",
                        user
                    );
                } catch (error) {
                    console.error('Error al obtener los datos del usuario:', error);
                    
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
            
        
        

    // Método para obtener todos los usuarios
    
static async getAll(req, res) {
    try {
        // Obtén todos los usuarios desde la base de datos
        const usuarios = await User.findAll(); // Cambia esto si usas otro ORM

        // Si no hay usuarios, retorna una respuesta con un mensaje adecuado
        if (!usuarios || usuarios.length === 0) {
            return jsonResponse.successResponse(
                res,
                200,
                "No users found",
                []
            );
        }

        // Si hay usuarios, retorna la lista
        return jsonResponse.successResponse(
            res,
            200,
            "Users retrieved successfully",
            usuarios
        );
    } catch (error) {
        // Maneja el error adecuadamente
        return jsonResponse.errorResponse(
            res,
            500,
            error.message
        );
    }
}



    // Método estático asíncrono para actualizar la información de un usuario
    // Método estático asíncrono para actualizar la información de un usuario

    static async update(req, res) {
        try {
            const { email, usuario, nombres, apellidos, password, role, estado } = req.body;
            const estadoInt = parseInt(estado, 10);
            const id = req.params.usuarios_id;

            console.log("ID del usuario:", id);

            // Verifica si se subió una nueva imagen; si no, conserva la imagen existente
            let imagePath = req.file ? `/uploads/${req.file.filename}` : (req.body.image || "/uploads/default-profile.png");

            console.log("Ruta de la imagen guardada:", imagePath);

            // Actualiza el usuario en la base de datos
            await userService.update({
                email,
                usuario,
                nombres,
                apellidos,
                password,
                role,
                image: imagePath,
                estado: estadoInt
            }, id);

            // Crea un DTO con los datos actualizados del usuario
            const updatedUser = new UserDTO(id, email, usuario, nombres, apellidos, role, imagePath, estadoInt);

            // Retorna una respuesta exitosa
            return jsonResponse.successResponse(res, 200, "User has been updated", updatedUser);
        } catch (error) {
            console.error('Error al actualizar el usuario:', error);
            return Joi.isError(error)
                ? jsonResponse.validationResponse(res, 409, "Validation error", error.details.map(err => err.message))
                : jsonResponse.errorResponse(res, 500, error.message);
        }
    }

    // Controlador para actualizar el estado
static async updateStatus(req, res) {
    try {
        const { estado } = req.body;
        const estadoInt = parseInt(estado, 10);
        const id = req.params.usuarios_id;

        console.log("ID del usuario:", id);
        console.log("Nuevo estado:", estadoInt);

        // Validar el nuevo estado
        const estadoSchema = Joi.object({
            estado: Joi.number().integer().required()
        });

        try {
            await estadoSchema.validateAsync({ estado: estadoInt }, { abortEarly: false });
        } catch (validationError) {
            console.error("Errores de validación:", validationError);
            return jsonResponse.validationResponse(
                res,
                409,
                "Validation error",
                validationError.details.map(err => err.message)
            );
        }

        // Actualiza solo el estado del usuario en la base de datos
        const updatedState = await userService.updateStatus({ estado: estadoInt }, id);

        // Retorna una respuesta exitosa con el estado actualizado
        return jsonResponse.successResponse(
            res,
            200,
            "User status has been updated",
            updatedState
        );
    } catch (error) {
        console.error('Error al actualizar el estado del usuario:', error);
        return jsonResponse.errorResponse(res, 500, error.message);
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
