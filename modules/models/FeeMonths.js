'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

module.exports = sequelize_mysql.define("t_feemnt_class_fee_months",
    {
        t_feemnt_class_fee_month_id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        t_cls_class_id : {
            type: Sequelize.INTEGER,        
        },
        t_feemnt_tution_fee : {
            type: Sequelize.STRING,
        },
        t_feemnt_bus_fee : {
            type: Sequelize.STRING,          
        },
        t_feemnt_fine : {
            type: Sequelize.STRING,          
        },
        t_feemnt_tc : {
            type: Sequelize.STRING,          
        },
        t_feemnt_icse : {
            type: Sequelize.STRING,          
        },
        t_feemnt_misc_fee : {
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
        tableName: 't_feemnt_class_fee_months'
    }
);


