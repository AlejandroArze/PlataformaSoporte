const { Type, sequelize } = require("../models"); // Requiere el modelo 'Type' y la instancia de sequelize para las transacciones
const storeDTO = require("../http/request/type/storeDTO"); // DTO para validar los datos del tipo en la operación de almacenamiento
const updateDTO = require("../http/request/type/updateDTO"); // DTO para validar los datos del tipo en la operación de actualización
const idDTO = require("../http/request/type/idDTO"); // DTO para validar los identificadores de tipos

class TypeService {

    // Método para almacenar un nuevo tipo
    static async store(data) {
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos con sequelize
        console.log("Service Data: ", data);

        try {
            // Valida los datos de entrada usando storeDTO (con Joi)
            await storeDTO.validateAsync(data, { abortEarly: false });

            // Crea un nuevo tipo en la base de datos usando los campos correspondientes
            const newType = await Type.create({
                descripcion: data.descripcion, // Se asigna el campo 'descripcion'
                formulario: data.formulario, // Se asigna el campo 'formulario'
                estado: data.estado // Se asigna el campo 'estado'
            });

            await DB.commit(); // Confirma la transacción

            return newType; // Retorna el nuevo tipo

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para mostrar un tipo por su ID
    static async show(id) {
        try {
            // Valida el ID del tipo
            await idDTO.validateAsync({ tipos_id: id });

            // Busca el tipo por su ID (campo tipos_id)
            const type = await Type.findByPk(id);

            return type; // Retorna el tipo

        } catch (error) {
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para actualizar un tipo por su ID
    static async update(data, id) {
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos
        console.log("Service Data: ", data);
        console.log("Service ID: ", id);

        try {
            data.tipos_id = id; // Asigna el ID al objeto de datos

            // Valida los datos de entrada usando updateDTO
            await updateDTO.validateAsync(data, { abortEarly: false });

            // Actualiza los campos del tipo con los datos proporcionados
            const updatedType = await Type.update({
                descripcion: data.descripcion, // Actualiza el campo 'descripcion'
                formulario: data.formulario, // Actualiza el campo 'formulario'
                estado: data.estado // Actualiza el estado del tipo
            }, { where: { tipos_id: id } }); // Condición para actualizar el registro por ID

            await DB.commit(); // Confirma la transacción

            return updatedType; // Retorna el tipo actualizado

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para eliminar un tipo por su ID
    static async destroy(id) {
        console.log("Service Destroy ID: ", id);
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos
        
        try {
            // Valida el ID del tipo
            await idDTO.validateAsync({ tipos_id: id });

            // Elimina el tipo por su ID (campo tipos_id)
            await Type.destroy({ where: { tipos_id: id } });

            await DB.commit(); // Confirma la transacción

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }
}

module.exports = TypeService; // Exporta la clase TypeService
