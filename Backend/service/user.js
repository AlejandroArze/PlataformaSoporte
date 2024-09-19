const bcrypt = require("bcryptjs") // Requiere bcryptjs para encriptar contraseñas
const { User, sequelize } = require("../models") // Requiere el modelo 'usuarios' y la instancia de sequelize para las transacciones
const storeDTO = require("../http/request/user/storeDTO") // DTO para validar los datos del usuario en la operación de almacenamiento
const updateDTO = require("../http/request/user/updateDTO") // DTO para validar los datos del usuario en la operación de actualización
const idDTO = require("../http/request/user/idDTO") // DTO para validar los identificadores de usuarios

class UserService {

    // Método para almacenar un nuevo usuario
    static async store(data) {

        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos con sequelize

        console.log("Servicer: ",data)
        try {
            // Valida los datos de entrada usando storeDTO (con Joi)
            await storeDTO.validateAsync(data, { abortEarly: false })

            // Encripta la contraseña del usuario
            const hashedPassword = await bcrypt.hash(data.password, 10)

            // Crea un nuevo usuario en la base de datos usando los campos correspondientes
            const newUser = await User.create({
                usuario: data.usuario, // Se asigna el campo 'usuario'
                password: hashedPassword, // Se asigna la contraseña encriptada
                email: data.email, // Se asigna el campo 'email'
                nombres: data.nombres, // Se asigna el nombre
                apellidos: data.apellidos, // Se asigna el apellido
                role: data.role, // Se asigna el rol
                estado: 1 // Estado por defecto al crear un usuario (activo)
            })

            await DB.commit() // Confirma la transacción

            return newUser // Retorna el nuevo usuario

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para mostrar un usuario por su ID
    static async show(id) {

        try {
            // Valida el ID del usuario
            await idDTO.validateAsync({ usuarios_id: id })

            // Busca el usuario por su ID (campo usuarios_id)
            const user = await User.findByPk(id);

            return user; // Retorna el usuario

        } catch (error) {
            throw error; // Lanza el error para manejarlo
        }

    }

    // Método para actualizar un usuario por su ID
    static async update(data, id) {

        const DB = await sequelize.transaction() // Inicia una transacción de base de datos
        console.log("Servicer: ",data)
        console.log("Servicer2: ",id)
        try {

            data.usuarios_id = id // Asigna el ID al objeto de datos

            // Valida los datos de entrada usando updateDTO
            await updateDTO.validateAsync(
                data, { abortEarly: false }
            )

            // Encripta la nueva contraseña del usuario
            const hashedPassword = await bcrypt.hash(data.password, 10)

            // Actualiza los campos del usuario con los datos proporcionados
            const user = await User.update({
                usuario: data.usuario, // Actualiza el campo 'usuario'
                nombres: data.nombres, // Actualiza el campo 'nombres'
                apellidos: data.apellidos, // Actualiza el campo 'apellidos'
                email: data.email, // Actualiza el campo 'email'
                password: hashedPassword, // Actualiza la contraseña encriptada
                role: data.role, // Actualiza el campo 'role'
                estado: data.estado // Actualiza el estado del usuario
            }, { where: { usuarios_id: id } }); // Condición para actualizar el registro por ID

            await DB.commit() // Confirma la transacción

            return user // Retorna el usuario actualizado

        } catch (error) {
            await DB.rollback() // Deshace los cambios si hay un error
            throw error // Lanza el error para manejarlo
        }
    }

    // Método para eliminar un usuario por su ID
    static async destroy(id) {
        console.log("Servicer3: ",id)
        const DB = await sequelize.transaction() // Inicia una transacción de base de datos
        
        try {

            // Valida el ID del usuario
            await idDTO.validateAsync({ usuarios_id: id })

            // Elimina el usuario por su ID (campo usuarios_id)
            await User.destroy({ where: { usuarios_id: id } })

            await DB.commit() // Confirma la transacción

        } catch (error) {
            await DB.rollback() // Deshace los cambios si hay un error
            throw error // Lanza el error para manejarlo
        }
    }
}

module.exports = UserService // Exporta la clase UserService
