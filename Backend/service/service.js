const { Service, sequelize } = require("../models"); // Requiere el modelo 'Service' y la instancia de sequelize para las transacciones
const storeDTO = require("../http/request/service/storeDTO"); // DTO para validar los datos del servicio en la operación de almacenamiento
const updateDTO = require("../http/request/service/updateDTO"); // DTO para validar los datos del servicio en la operación de actualización
const idDTO = require("../http/request/service/idDTO"); // DTO para validar los identificadores de servicios

class ServiceService {

    // Método para almacenar un nuevo servicio
    static async store(data) {
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos con sequelize
        console.log("Service Data: ", data);

        try {
            // Valida los datos de entrada usando storeDTO (con Joi)
            await storeDTO.validateAsync(data, { abortEarly: false });

            // Crea un nuevo servicio en la base de datos usando los campos correspondientes
            const newService = await Service.create({
                nombreResponsableEgreso: data.nombreResponsableEgreso, // Se asigna el campo 'nombreResponsableEgreso'
                cargoSolicitante: data.cargoSolicitante, // Se asigna el campo 'cargoSolicitante'
                informe: data.informe, // Se asigna el campo 'informe'
                cargoResponsableEgreso: data.cargoResponsableEgreso, // Se asigna el campo 'cargoResponsableEgreso'
                oficinaSolicitante: data.oficinaSolicitante, // Se asigna el campo 'oficinaSolicitante'
                fechaRegistro: data.fechaRegistro, // Se asigna el campo 'fechaRegistro'
                equipo: data.equipo, // Se asigna el campo 'equipo'
                problema: data.problema, // Se asigna el campo 'problema'
                telefonoResponsableEgreso: data.telefonoResponsableEgreso, // Se asigna el campo 'telefonoResponsableEgreso'
                gestion: data.gestion, // Se asigna el campo 'gestion'
                telefonoSolicitante: data.telefonoSolicitante, // Se asigna el campo 'telefonoSolicitante'
                tecnicoAsignado: data.tecnicoAsignado, // Se asigna el campo 'tecnicoAsignado'
                observaciones: data.observaciones, // Se asigna el campo 'observaciones'
                tipoResponsableEgreso: data.tipoResponsableEgreso, // Se asigna el campo 'tipoResponsableEgreso'
                estado: data.estado, // Se asigna el campo 'estado'
                tipoSolicitante: data.tipoSolicitante, // Se asigna el campo 'tipoSolicitante'
                fechaTerminado: data.fechaTerminado, // Se asigna el campo 'fechaTerminado'
                oficinaResponsableEgreso: data.oficinaResponsableEgreso, // Se asigna el campo 'oficinaResponsableEgreso'
                numero: data.numero, // Se asigna el campo 'numero'
                fechaInicio: data.fechaInicio, // Se asigna el campo 'fechaInicio'
                fechaEgreso: data.fechaEgreso, // Se asigna el campo 'fechaEgreso'
                ciSolicitante: data.ciSolicitante, // Se asigna el campo 'ciSolicitante'
                nombreSolicitante: data.nombreSolicitante, // Se asigna el campo 'nombreSolicitante'
                tipo: data.tipo, // Se asigna el campo 'tipo'
                tecnicoRegistro: data.tecnicoRegistro, // Se asigna el campo 'tecnicoRegistro'
                tecnicoEgreso: data.tecnicoEgreso, // Se asigna el campo 'tecnicoEgreso'
                ciResponsableEgreso: data.ciResponsableEgreso // Se asigna el campo 'ciResponsableEgreso'
            });

            await DB.commit(); // Confirma la transacción

            return newService; // Retorna el nuevo servicio

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para mostrar un servicio por su ID
    static async show(id) {
        try {
            // Valida el ID del servicio
            await idDTO.validateAsync({ servicios_id: id });

            // Busca el servicio por su ID (campo servicios_id)
            const service = await Service.findByPk(id);

            return service; // Retorna el servicio

        } catch (error) {
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para actualizar un servicio por su ID
    static async update(data, id) {
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos
        console.log("Service Data: ", data);
        console.log("Service ID: ", id);

        try {
            data.servicios_id = id; // Asigna el ID al objeto de datos

            // Valida los datos de entrada usando updateDTO
            await updateDTO.validateAsync(data, { abortEarly: false });

            // Actualiza los campos del servicio con los datos proporcionados
            const updatedService = await Service.update({
                nombreResponsableEgreso: data.nombreResponsableEgreso,
                cargoSolicitante: data.cargoSolicitante,
                informe: data.informe,
                cargoResponsableEgreso: data.cargoResponsableEgreso,
                oficinaSolicitante: data.oficinaSolicitante,
                fechaRegistro: data.fechaRegistro,
                equipo: data.equipo,
                problema: data.problema,
                telefonoResponsableEgreso: data.telefonoResponsableEgreso,
                gestion: data.gestion,
                telefonoSolicitante: data.telefonoSolicitante,
                tecnicoAsignado: data.tecnicoAsignado,
                observaciones: data.observaciones,
                tipoResponsableEgreso: data.tipoResponsableEgreso,
                estado: data.estado,
                tipoSolicitante: data.tipoSolicitante,
                fechaTerminado: data.fechaTerminado,
                oficinaResponsableEgreso: data.oficinaResponsableEgreso,
                numero: data.numero,
                fechaInicio: data.fechaInicio,
                fechaEgreso: data.fechaEgreso,
                ciSolicitante: data.ciSolicitante,
                nombreSolicitante: data.nombreSolicitante,
                tipo: data.tipo,
                tecnicoRegistro: data.tecnicoRegistro,
                tecnicoEgreso: data.tecnicoEgreso,
                ciResponsableEgreso: data.ciResponsableEgreso
            }, { where: { servicios_id: id } }); // Condición para actualizar el registro por ID

            await DB.commit(); // Confirma la transacción

            return updatedService; // Retorna el servicio actualizado

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para eliminar un servicio por su ID
    static async destroy(id) {
        console.log("Service Destroy ID: ", id);
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos
        
        try {
            // Valida el ID del servicio
            await idDTO.validateAsync({ servicios_id: id });

            // Elimina el servicio por su ID (campo servicios_id)
            await Service.destroy({ where: { servicios_id: id } });

            await DB.commit(); // Confirma la transacción
            

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }
     
}

module.exports = ServiceService; // Exporta la clase ServiceService
