'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

module.exports = sequelize_mysql.define("t_sec_sections",
    {
        t_sec_section_id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        t_cls_class_id : {
            type: Sequelize.INTEGER,        
        },       
        t_sec_section_name : {
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
        tableName: 't_sec_sections'
    }
);


