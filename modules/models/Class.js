'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

module.exports = sequelize_mysql.define("t_cls_class",
    {
        t_cls_class_id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        t_ins_institute_id : {
            type: Sequelize.INTEGER,        
        },
        cls_class_name : {
            type: Sequelize.STRING,
        },
        cls_class_session : {
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
        tableName: 't_cls_class'
    }
);


