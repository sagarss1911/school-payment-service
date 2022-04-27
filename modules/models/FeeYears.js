'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

module.exports = sequelize_mysql.define("t_feeyr_class_fee_years",
    {
        t_feeyr_class_fee_year_id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        t_cls_class_id : {
            type: Sequelize.INTEGER,        
        },
        t_feeyr_admission_fee : {
            type: Sequelize.STRING,
        },
        t_feeyr_yrly_one_tm_fee : {
            type: Sequelize.STRING,          
        },
        t_feeyr_misc_fee : {
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
        tableName: 't_feeyr_class_fee_years'
    }
);


