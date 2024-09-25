// Importa el servicio 'equipment' desde la carpeta 'service'
const equipmentService = require("../service/equipment");
// Importa una utilidad para responder en formato JSON
const jsonResponse = require("../http/response/jsonResponse");
// Importa el Data Transfer Object (DTO) que define la estructura de un 'equipo'
const EquipmentDTO = require("../http/request/equipment/responseDTO");
// Importa Joi para validación de datos
const Joi = require("joi");

class EquipmentController {

    // Método estático asíncrono para crear un nuevo equipo
    static async store(req, res) {
        try {
            // Desestructura los campos necesarios para el nuevo equipo desde req.body
            const { 
                ip, procesador, funcionariousuario, lector, tarjetavideo, funcionarioasignado, oficina, 
                fecharegistro, codigo, memoria, tarjetamadre, antivirus, garantia, discoduro, marca, tipo, 
                modelo, serie, so, responsable, mac 
            } = req.body;

            // Crea un nuevo equipo utilizando el servicio 'equipmentService'
            const { equipos_id } = await equipmentService.store({
                ip, procesador, funcionariousuario, lector, tarjetavideo, funcionarioasignado, oficina, 
                fecharegistro, codigo, memoria, tarjetamadre, antivirus, garantia, discoduro, marca, tipo, 
                modelo, serie, so, responsable, mac
            });

            // Crea un nuevo DTO del equipo con los datos creados
            const newEquipment = new EquipmentDTO(equipos_id, ip, procesador, funcionariousuario, lector, tarjetavideo, 
                funcionarioasignado, oficina, fecharegistro, codigo, memoria, tarjetamadre, antivirus, garantia, 
                discoduro, marca, tipo, modelo, serie, so, responsable, mac);

            // Retorna una respuesta exitosa en formato JSON indicando que el equipo ha sido registrado
            return jsonResponse.successResponse(
                res,
                201,
                "Equipment has been registered successfully",
                newEquipment
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

    // Método estático asíncrono para obtener información de un equipo
    static async show(req, res) {
        try {
            // Obtiene el ID del equipo a través de req.params
            const equipment = await equipmentService.show(req.params.equipos_id);

            if (!equipment) {
                return jsonResponse.errorResponse(res, 404, "Equipment not found");
            }

            // Crea un DTO con los datos obtenidos del equipo
            const equipmentDTO = new EquipmentDTO(
                equipment.equipos_id, equipment.ip, equipment.procesador, equipment.funcionariousuario, 
                equipment.lector, equipment.tarjetavideo, equipment.funcionarioasignado, equipment.oficina, 
                equipment.fecharegistro, equipment.codigo, equipment.memoria, equipment.tarjetamadre, 
                equipment.antivirus, equipment.garantia, equipment.discoduro, equipment.marca, equipment.tipo, 
                equipment.modelo, equipment.serie, equipment.so, equipment.responsable, equipment.mac
            );

            // Retorna una respuesta exitosa en formato JSON indicando que el equipo existe
            return jsonResponse.successResponse(
                res,
                200,
                "Equipment exists",
                equipmentDTO
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

    // Método estático asíncrono para actualizar la información de un equipo
    static async update(req, res) {
        try {
            // Desestructura los campos del equipo desde req.body
            const { 
                ip, procesador, funcionariousuario, lector, tarjetavideo, funcionarioasignado, oficina, 
                fecharegistro, codigo, memoria, tarjetamadre, antivirus, garantia, discoduro, marca, tipo, 
                modelo, serie, so, responsable, mac 
            } = req.body;
            const id = req.params.equipos_id;

            console.log("id ", id);

            // Actualiza el equipo en la base de datos
            await equipmentService.update({
                ip, procesador, funcionariousuario, lector, tarjetavideo, funcionarioasignado, oficina, 
                fecharegistro, codigo, memoria, tarjetamadre, antivirus, garantia, discoduro, marca, tipo, 
                modelo, serie, so, responsable, mac
            }, id);

            // Crea un nuevo DTO con los datos actualizados del equipo
            const updatedEquipment = new EquipmentDTO(
                id, ip, procesador, funcionariousuario, lector, tarjetavideo, funcionarioasignado, oficina, 
                fecharegistro, codigo, memoria, tarjetamadre, antivirus, garantia, discoduro, marca, tipo, 
                modelo, serie, so, responsable, mac
            );

            // Retorna una respuesta exitosa en formato JSON indicando que el equipo ha sido actualizado
            return jsonResponse.successResponse(
                res,
                200,
                "Equipment has been updated",
                updatedEquipment
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

    // Método estático asíncrono para eliminar un equipo
    static async destroy(req, res) {
        try {
            const id = req.params.equipos_id;
            console.log("id ", id);

            // Elimina al equipo mediante el servicio 'equipmentService'
            await equipmentService.destroy(id);

            // Retorna una respuesta exitosa en formato JSON indicando que el equipo ha sido eliminado
            return jsonResponse.successResponse(
                res,
                200,
                "Equipment has been deleted"
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

// Exporta la clase EquipmentController para que pueda ser utilizada en otros archivos
module.exports = EquipmentController;