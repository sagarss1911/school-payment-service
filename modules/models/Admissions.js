'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

module.exports = sequelize_mysql.define("t_adm_admissions",
    {
        t_adm_admission_id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        t_stu_sudent_id : {
            type: Sequelize.INTEGER,        
        },
        t_cls_class_id : {
            type: Sequelize.INTEGER,        
        },
        t_sec_section_id : {
            type: Sequelize.INTEGER,        
        },
        t_adm_roll_number : {
            type: Sequelize.STRING,          
        },
        t_adm_id_card_number : {
            type: Sequelize.STRING,          
        },
        t_adm_session : {
            type: Sequelize.STRING,          
        },
        is_100_concession : {
            type: Sequelize.STRING,          
        },
        t_adm_admission_date : {
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
        tableName: 't_adm_admissions'
    }
);


