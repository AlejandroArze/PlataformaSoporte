const { Management, sequelize } = require("../models"); // Requiere el modelo 'Management' y la instancia de sequelize para las transacciones
const storeDTO = require("../http/request/management/storeDTO"); // DTO para validar los datos de la tarea en la operación de almacenamiento
const updateDTO = require("../http/request/management/updateDTO"); // DTO para validar los datos de la tarea en la operación de actualización
const idDTO = require("../http/request/management/idDTO"); // DTO para validar los identificadores de gestions

class ManagementService {

    // Método para almacenar una nueva tarea
    static async store(data) {
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos con sequelize
        console.log("Management Data: ", data);

        try {
            // Valida los datos de entrada usando storeDTO (con Joi)
            await storeDTO.validateAsync(data, { abortEarly: false });

            // Crea una nueva tarea en la base de datos usando los campos correspondientes
            const newManagement = await Management.create({
                descripcion: data.descripcion, // Se asigna el campo 'descripcion'
                servicio: data.servicio, // Se asigna el campo 'servicio' (clave foránea)
                fecha: data.fecha // Se asigna el campo 'fecha'
            });

            await DB.commit(); // Confirma la transacción

            return newManagement; // Retorna la nueva tarea

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para mostrar una tarea por su ID
    static async show(id) {
        try {
            // Valida el ID de la tarea
            await idDTO.validateAsync({ gestions_id: id });

            // Busca la tarea por su ID (campo gestions_id)
            const management = await Management.findByPk(id);

            return management; // Retorna la tarea

        } catch (error) {
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para actualizar una tarea por su ID
    static async update(data, id) {
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos
        console.log("Management Data: ", data);
        console.log("Management ID: ", id);

        try {
            data.gestions_id = id; // Asigna el ID al objeto de datos

            // Valida los datos de entrada usando updateDTO
            await updateDTO.validateAsync(data, { abortEarly: false });

            // Actualiza los campos de la tarea con los datos proporcionados
            const updatedManagement = await Management.update({
                descripcion: data.descripcion, // Actualiza el campo 'descripcion'
                servicio: data.servicio, // Actualiza el campo 'servicio'
                fecha: data.fecha // Actualiza el campo 'fecha'
            }, { where: { gestions_id: id } }); // Condición para actualizar el registro por ID

            await DB.commit(); // Confirma la transacción

            return updatedManagement; // Retorna la tarea actualizada

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para eliminar una tarea por su ID
    static async destroy(id) {
        console.log("Management Destroy ID: ", id);
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos
        
        try {
            // Valida el ID de la tarea
            await idDTO.validateAsync({ gestions_id: id });

            // Elimina la tarea por su ID (campo gestions_id)
            await Management.destroy({ where: { gestions_id: id } });

            await DB.commit(); // Confirma la transacción

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }
}

module.exports = ManagementService; // Exporta la clase ManagementService
