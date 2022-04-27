'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

module.exports = sequelize_mysql.define("t_stu_students",
    {
        t_stu_sudent_id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        t_ins_institute_id : {
            type: Sequelize.INTEGER,        
        },
        t_adm_admission_id : {
            type: Sequelize.INTEGER,        
        },
        t_gur_guardian_id : {
            type: Sequelize.INTEGER,        
        },
        t_add_address_id : {
            type: Sequelize.INTEGER,        
        },
        t_stu_student_status : {
            type: Sequelize.STRING,          
        },
        stu_first_name : {
            type: Sequelize.STRING,          
        },
        stu_middle_name : {
            type: Sequelize.STRING,          
        },
        stu_last_name : {
            type: Sequelize.STRING,          
        },
        stu_gender : {
            type: Sequelize.STRING,          
        },
        stu_dob : {
            type: Sequelize.STRING,          
        },
        stu_email : {
            type: Sequelize.STRING,          
        },
        stu_phone_number : {
            type: Sequelize.STRING,          
        },
        stu_phone_number2 : {
            type: Sequelize.STRING,          
        },
        stu_allergy : {
            type: Sequelize.STRING,          
        },
        stu_is_diabetic : {
            type: Sequelize.STRING,          
        },
        stu_is_blood_presure : {
            type: Sequelize.STRING,          
        },
        stu_is_heart_patient : {
            type: Sequelize.STRING,          
        },
        stu_any_other : {
            type: Sequelize.STRING,          
        },
        stu_medication : {
            type: Sequelize.STRING,          
        },
        stu_upload_file_name : {
            type: Sequelize.STRING,          
        },
        stu_dr_no : {
            type: Sequelize.STRING,          
        },
        stu_admission_no : {
            type: Sequelize.STRING,          
        },
        stu_father_name : {
            type: Sequelize.STRING,          
        },
        stu_mother_name : {
            type: Sequelize.STRING,          
        },
        stu_last_school_name : {
            type: Sequelize.STRING,          
        },
        stu_brosis_name : {
            type: Sequelize.STRING,          
        },
        stu_brosis_class_id : {
            type: Sequelize.INTEGER,        
        },
        stu_brosis_section_id : {
            type: Sequelize.INTEGER,        
        },
        stu_adhar_card_no : {
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
        tableName: 't_stu_students'
    }
);


