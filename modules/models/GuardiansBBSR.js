'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

module.exports = sequelize_mysql.define("t_gur_guardians",
    {
        t_gur_guardian_id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        t_add_address_id : {
            type: Sequelize.INTEGER,        
        },
        gur_first_name : {
            type: Sequelize.STRING,          
        },
        gur_middle_name : {
            type: Sequelize.STRING,          
        },
        gur_last_name : {
            type: Sequelize.STRING,          
        },
        gur_occupation : {
            type: Sequelize.STRING,          
        },
        gur_nationality : {
            type: Sequelize.STRING,          
        },
        gur_phone_number : {
            type: Sequelize.STRING,          
        },
        gur_phone_number2 : {
            type: Sequelize.STRING,          
        },
        gur_email_id : {
            type: Sequelize.STRING,          
        },
        gur_type : {
            type: Sequelize.STRING,          
        },
        created : {
            type: Sequelize.DATE,
            defaultValue: ()=>new Date()
        },
        modified : {
            type: Sequelize.DATE,          
            defaultValue: ()=>new Date()
        },
    },
    {
        freezeTableName: true,
        tableName: 't_gur_guardians'
    }
);


