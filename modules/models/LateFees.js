'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

module.exports = sequelize_mysql.define("late_fees",
    {
        id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        month : {
            type: Sequelize.INTEGER,        
        },
        late_fees : {
            type: Sequelize.INTEGER,
        },
        grace_period_in_days : {
            type: Sequelize.INTEGER,          
        }
    },
    {
        freezeTableName: true,
        tableName: 'late_fees'
    }
);


