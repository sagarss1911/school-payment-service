'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

module.exports = sequelize_mysql.define("temp_transaction",
    {
        id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        transaction_id :{
            type: Sequelize.STRING,
        },
        t_adm_admission_id : {
            type: Sequelize.INTEGER,        
        },
        t_cls_class_id : {
            type: Sequelize.INTEGER,        
        },
        t_sec_section_id : {
            type: Sequelize.INTEGER,        
        },
        t_mon_roll_number : {
            type: Sequelize.STRING,
        },
        t_mon_collection_date : {
            type: Sequelize.DATE,
        },
        t_mon_collection_date_time : {
            type: Sequelize.DATE,
        },
        t_mon_entry_date_time : {
            type: Sequelize.DATE,
        },
        t_mon_paid_month_dt : {
            type: Sequelize.DATE,
        },
        t_mon_fee_type : {
            type: Sequelize.INTEGER,        
        },
        t_mon_fee_value : {
            type: Sequelize.INTEGER,        
        },
        t_mon_concession : {
            type: Sequelize.STRING,          
        },
        t_mon_misc_fee  : {
            type: Sequelize.INTEGER,             
        },
        t_mon_due_amount : {
            type: Sequelize.INTEGER,          
        },
        t_mon_comment : {
            type: Sequelize.STRING,          
        },
        t_mon_yearly_one_time_fee : {
            type: Sequelize.INTEGER,          
        },
        t_mon_total_fee : {
            type: Sequelize.INTEGER,          
        },
        t_mis_upload_id : {
            type: Sequelize.INTEGER,          
        },
        status : {
            type: Sequelize.STRING,          
        },
        parent_name : {
            type: Sequelize.STRING,          
        },
        parent_email : {
            type: Sequelize.STRING,          
        },
        parent_mobile : {
            type: Sequelize.STRING,          
        },
        txn_no : {
            type: Sequelize.STRING,          
        },
        txn_amount_received : {
            type: Sequelize.STRING,          
        },
        txn_date : {
            type: Sequelize.STRING,          
        },
        txt_mode : {
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
        tableName: 'temp_transaction'
    }
);


