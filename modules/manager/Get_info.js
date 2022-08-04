'use strict';

const e = require('express');
let BadRequestError = require('../errors/badRequestError'),
    StudentModal = require('../models/Students'),
    ClassModal = require('../models/Class'),
    SectionModal = require('../models/Sections'),
    FeeMonthsModal = require('../models/FeeMonths'),
    TempTransactionsModal = require('../models/TempTransaction'),
    FeePaidModal = require('../models/FeePaids'),
    LateFeesModal = require('../models/LateFees'),
    moment = require('moment'),
    CryptoJS = require("crypto-js"),
    AdmissionModal = require('../models/Admissions');

let getFinancialYear = async (req) => {
    var financial_year = "";
    var today = new Date();
    if ((today.getMonth() + 1) <= 3) {
        financial_year = (today.getFullYear() - 1) + "-" + today.getFullYear()
    } else {
        financial_year = today.getFullYear() + "-" + (today.getFullYear() + 1)
    }
    let financialYears = []
    let initialYear = financial_year.substring(0, 4)
    let FirstYear = (parseInt(initialYear) - 2).toString() + "-" + parseInt(initialYear - 1).toString()
    financialYears.push({ type: "A", financial_year: FirstYear })
    let SecondYear = (parseInt(initialYear) - 1).toString() + "-" + parseInt(initialYear).toString()
    financialYears.push({ type: "A", financial_year: SecondYear })
    let thirdYear = financial_year
    financialYears.push({ type: "N", financial_year: thirdYear })

    return financialYears
}
let getInfo = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (!body) {
        throw new BadRequestError('Body comes empty');
    }
    if (!body.stu_dr_no) {
        throw new BadRequestError('Student DR number can not be empty');
    }
    if (body.selectedFees == "N") {
        return getFeesInfo(body.stu_dr_no, body.selectedFinancialYear)
    } else if (body.selectedFees == "A") {
        return getArrerFeesInfo(body.stu_dr_no, body.selectedFinancialYear)
    }
}
let getFeesInfo = async (stu_dr_no, financial_year) => {

    if (!stu_dr_no) {
        throw new BadRequestError('Student DR number can not be empty');
    }
    let student_record = await StudentModal.findOne({ where: { stu_dr_no: stu_dr_no }, raw: true })
    if (!student_record) {
        throw new BadRequestError('Student record not found.');
    }
    let admission_record = await AdmissionModal.findOne({ where: { t_adm_admission_id: student_record.t_adm_admission_id }, raw: true })
    if (!admission_record) {
        throw new BadRequestError('Admission record not found.');
    }
    student_record.admission_record = admission_record
    let section_record = await SectionModal.findOne({ where: { t_sec_section_id: admission_record.t_sec_section_id }, raw: true })
    student_record.section_record = section_record
    student_record.t_sec_section_name = section_record.t_sec_section_name
    let class_record = await ClassModal.findOne({ where: { t_cls_class_id: admission_record.t_cls_class_id }, raw: true })
    student_record.class_record = class_record
    if (!class_record) {
        throw new BadRequestError('Class record not found.');
    }
    let month_fee_record = await FeeMonthsModal.findOne({ where: { t_cls_class_id: class_record.t_cls_class_id }, raw: true })
    if (!month_fee_record) {
        throw new BadRequestError('Monthly fee record not found.');
    }

    /* Get financial Year */


    let financial_year_array = []
    financial_year_array.push(financial_year.substring(0, 4) + '-04')
    financial_year_array.push(financial_year.substring(0, 4) + '-05')
    financial_year_array.push(financial_year.substring(0, 4) + '-06')
    financial_year_array.push(financial_year.substring(0, 4) + '-07')
    financial_year_array.push(financial_year.substring(0, 4) + '-08')
    financial_year_array.push(financial_year.substring(0, 4) + '-09')
    financial_year_array.push(financial_year.substring(0, 4) + '-10')
    financial_year_array.push(financial_year.substring(0, 4) + '-11')
    financial_year_array.push(financial_year.substring(0, 4) + '-12')
    financial_year_array.push(financial_year.substring(5, 9) + '-01')
    financial_year_array.push(financial_year.substring(5, 9) + '-02')
    financial_year_array.push(financial_year.substring(5, 9) + '-03')

    let paid_fee_records = await FeePaidModal.findAll({ where: { t_mon_paid_month_dt: { $gte: financial_year_array[0] + '-01', $lte: financial_year_array[financial_year_array.length - 1] + '-31' }, t_adm_admission_id: admission_record.t_adm_admission_id, t_cls_class_id: admission_record.t_cls_class_id, t_sec_section_id: admission_record.t_sec_section_id, t_mon_fee_type: 1 }, raw: true })

    let pending_month_fees = financial_year_array.filter(x => !paid_fee_records.map(x => x.t_mon_paid_month_dt.substring(0, 7)).includes(x))
    let summary = []
    let totalPaidAmount = 0
    paid_fee_records.forEach(x => {
        totalPaidAmount = totalPaidAmount + x.t_mon_total_fee
        summary.push({ 'paid': 1, "unpaid": 0, 'paidFeesAmount': x.t_mon_total_fee, 'feeDate': x.t_mon_paid_month_dt, 'collectionDate': x.t_mon_collection_date })
    })
    for (var i = 0; i < pending_month_fees.length; i++) {


        let endOfMonth = moment(pending_month_fees[i] + '-01', 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD');
        var start = moment(endOfMonth, "YYYY-MM-DD");
        // change end date here as current date
        var end = moment(new Date(), "YYYY-MM-DD");
        //var end = moment("2022-11-11", "YYYY-MM-DD");
        let overdueDays = moment.duration(end.diff(start)).asDays()
        let penalty = await LateFeesModal.findOne({ where: { month: Number(pending_month_fees[i].substring(5, 10)) }, raw: true })
        overdueDays = overdueDays - penalty.grace_period_in_days

        if (overdueDays > 0) {
            let overDueMonths = 0
            if (penalty.grace_period_in_days > 0) {
                overDueMonths = (overdueDays / penalty.grace_period_in_days)
            } else {
                var dateStart = start;
                var dateEnd = end;
                var timeValues = [];
                while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
                    timeValues.push(dateStart.format('YYYY-MM'));
                    dateStart.add(1, 'month');
                }
                summary.push({ 'paid': 0, "unpaid": 1, 'feesAmount': month_fee_record.t_feemnt_tution_fee, 'feeDate': pending_month_fees[i] + '-01', 'penalty': 100 })
            }
            if (overDueMonths > 1) {
                summary.push({ 'paid': 0, "unpaid": 1, 'feesAmount': month_fee_record.t_feemnt_tution_fee, 'feeDate': pending_month_fees[i] + '-01', 'penalty': 100 })
            }
        } else if (overdueDays < 0) {
            summary.push({ 'paid': 0, "unpaid": 1, 'feesAmount': month_fee_record.t_feemnt_tution_fee, 'feeDate': pending_month_fees[i] + '-01', 'penalty': 0 })
        }


    }
    let paidFees = summary.filter(x => x.paid == 1)
    let unPaidFees = summary.filter(x => x.unpaid == 1)
    let totalPaidFees = 0
    let totalUnPaidFees = 0
    let totalPenalty = 0
    paidFees.forEach(x => {
        totalPaidFees = totalPaidFees + x.paidFeesAmount
    })

    unPaidFees.forEach(x => {
        totalUnPaidFees = totalUnPaidFees + Number(x.feesAmount)
        totalPenalty = totalPenalty + Number(x.penalty)
        x.totalFeesNeedstoPay = Number(x.feesAmount) + Number(x.penalty)
    })
    let totalFees = totalPaidFees + totalUnPaidFees + totalPenalty

    let finalSummary = [...paidFees, ...unPaidFees]
    student_record.className = class_record.cls_class_name

    let _result = { studentInfo: student_record, totalFees: totalFees, totalPaidFees: totalPaidFees, feesSummary: finalSummary, totalUnpaidFees: totalUnPaidFees, totalPenalty: totalPenalty, totalPendingFees: totalUnPaidFees + totalPenalty }

    return _result;
}

let getArrerFeesInfo = async (stu_dr_no, financial_year) => {

    if (!stu_dr_no) {
        throw new BadRequestError('Student DR number can not be empty');
    }
    let student_record = await StudentModal.findOne({ where: { stu_dr_no: stu_dr_no }, raw: true })
    if (!student_record) {
        throw new BadRequestError('Student record not found.');
    }
    let admission_record = await AdmissionModal.findOne({ where: { t_adm_admission_id: student_record.t_adm_admission_id }, raw: true })
    if (!admission_record) {
        throw new BadRequestError('Admission record not found.');
    }
    student_record.admission_record = admission_record
    let section_record = await SectionModal.findOne({ where: { t_sec_section_id: admission_record.t_sec_section_id }, raw: true })
    student_record.section_record = section_record
    student_record.t_sec_section_name = section_record.t_sec_section_name
    let class_record = await ClassModal.findOne({ where: { t_cls_class_id: admission_record.t_cls_class_id }, raw: true })
    student_record.class_record = class_record
    if (!class_record) {
        throw new BadRequestError('Class record not found.');
    }
    let month_fee_record = await FeeMonthsModal.findOne({ where: { t_cls_class_id: class_record.t_cls_class_id }, raw: true })
    if (!month_fee_record) {
        throw new BadRequestError('Monthly fee record not found.');
    }

    /* Get financial Year */


    let financial_year_array = []
    financial_year_array.push(financial_year.substring(0, 4) + '-04')
    financial_year_array.push(financial_year.substring(0, 4) + '-05')
    financial_year_array.push(financial_year.substring(0, 4) + '-06')
    financial_year_array.push(financial_year.substring(0, 4) + '-07')
    financial_year_array.push(financial_year.substring(0, 4) + '-08')
    financial_year_array.push(financial_year.substring(0, 4) + '-09')
    financial_year_array.push(financial_year.substring(0, 4) + '-10')
    financial_year_array.push(financial_year.substring(0, 4) + '-11')
    financial_year_array.push(financial_year.substring(0, 4) + '-12')
    financial_year_array.push(financial_year.substring(5, 9) + '-01')
    financial_year_array.push(financial_year.substring(5, 9) + '-02')
    financial_year_array.push(financial_year.substring(5, 9) + '-03')

    let paid_fee_records = await FeePaidModal.findAll({ where: { t_mon_paid_month_dt: { $gte: financial_year_array[0] + '-01', $lte: financial_year_array[financial_year_array.length - 1] + '-31' }, t_adm_admission_id: admission_record.t_adm_admission_id, t_cls_class_id: admission_record.t_cls_class_id, t_sec_section_id: admission_record.t_sec_section_id, t_mon_fee_type: 1 }, raw: true })

    let pending_month_fees = financial_year_array.filter(x => !paid_fee_records.map(x => x.t_mon_paid_month_dt.substring(0, 7)).includes(x))
    let summary = []
    let totalPaidAmount = 0
    paid_fee_records.forEach(x => {
        totalPaidAmount = totalPaidAmount + x.t_mon_total_fee
        summary.push({ 'paid': 1, "unpaid": 0, 'paidFeesAmount': x.t_mon_total_fee, 'feeDate': x.t_mon_paid_month_dt, 'collectionDate': x.t_mon_collection_date })
    })
    for (var i = 0; i < pending_month_fees.length; i++) {


        let endOfMonth = moment(pending_month_fees[i] + '-01', 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD');
        var start = moment(endOfMonth, "YYYY-MM-DD");
        //var end = moment(todaysDate, "YYYY-MM-DD");        


        var end = moment(financial_year.split('-')[1] + "-04-01", "YYYY-MM-DD");
        let overdueDays = moment.duration(end.diff(start)).asDays()
        let penalty = await LateFeesModal.findOne({ where: { month: Number(pending_month_fees[i].substring(5, 10)) }, raw: true })
        overdueDays = overdueDays - penalty.grace_period_in_days


        if (overdueDays > 0) {
            let overDueMonths = 0
            if (penalty.grace_period_in_days > 0) {
                overDueMonths = (overdueDays / penalty.grace_period_in_days)

            } else {
                var dateStart = start;
                var dateEnd = end;
                var timeValues = [];
                while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
                    timeValues.push(dateStart.format('YYYY-MM'));
                    dateStart.add(1, 'month');
                }
                summary.push({ 'paid': 0, "unpaid": 1, 'feesAmount': month_fee_record.t_feemnt_tution_fee, 'feeDate': pending_month_fees[i] + '-01', 'penalty': 100 })
            }
            if (overDueMonths > 1) {
                summary.push({ 'paid': 0, "unpaid": 1, 'feesAmount': month_fee_record.t_feemnt_tution_fee, 'feeDate': pending_month_fees[i] + '-01', 'penalty': 100 })
            }
        } else if (overdueDays < 0) {
            summary.push({ 'paid': 0, "unpaid": 1, 'feesAmount': month_fee_record.t_feemnt_tution_fee, 'feeDate': pending_month_fees[i] + '-01', 'penalty': 0 })
        }


    }
    let paidFees = summary.filter(x => x.paid == 1)
    let unPaidFees = summary.filter(x => x.unpaid == 1)
    let totalPaidFees = 0
    let totalUnPaidFees = 0
    let totalPenalty = 0
    paidFees.forEach(x => {
        totalPaidFees = totalPaidFees + x.paidFeesAmount
    })

    unPaidFees.forEach(x => {
        totalUnPaidFees = totalUnPaidFees + Number(x.feesAmount)
        totalPenalty = totalPenalty + Number(x.penalty)
        x.totalFeesNeedstoPay = Number(x.feesAmount) + Number(x.penalty)
    })
    let totalFees = totalPaidFees + totalUnPaidFees + totalPenalty

    let finalSummary = [...paidFees, ...unPaidFees]
    student_record.className = class_record.cls_class_name

    let _result = { studentInfo: student_record, totalFees: totalFees, totalPaidFees: totalPaidFees, feesSummary: finalSummary, totalUnpaidFees: totalUnPaidFees, totalPenalty: totalPenalty, totalPendingFees: totalUnPaidFees + totalPenalty }

    return _result;
}

let getTransactionDetails = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (!body) {
        throw new BadRequestError('Body comes empty');
    }
    if (!body.transaction_id) {
        throw new BadRequestError('Transaction Id can not be empty');
    }
    let tempTransactions = await TempTransactionsModal.findAll({ where: { transaction_id: body.transaction_id }, raw: true })
    if (!tempTransactions) {
        throw new BadRequestError('Invalid Transaction Id');
    }
    let total = 0
    for (let i = 0; i < tempTransactions.length; i++) {
        total += tempTransactions[i].t_mon_total_fee
    }

    return {
        months: tempTransactions,
        total: total
    }
}
let processPayment = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;

    if (!body) {
        throw new BadRequestError('Body comes empty');
    }
    if (!body.stu_dr_no) {
        throw new BadRequestError('Student DR number can not be empty');
    }
    if (!body.selected_months.length) {
        throw new BadRequestError('Please select months to pay.');
    }
    let StudentInfo = {}
    if (body.selectedFees == "N") {
        StudentInfo = await getFeesInfo(body.stu_dr_no, body.selectedFinancialYear)
    } else if (body.selectedFees == "A") {
        StudentInfo = await getArrerFeesInfo(body.stu_dr_no, body.selectedFinancialYear)
    }

    let transaction_id = await getUniqueTransactionId();
    await TempTransactionsModal.destroy({ where: { t_mon_fee_type: 1, status: 'pending' }, raw: true })
    await TempTransactionsModal.destroy({ where: { t_mon_fee_type: 6, status: 'pending' }, raw: true })
    for (var i = 0; i < body.selected_months.length; i++) {
        let feesDetails = StudentInfo.feesSummary.filter(x => x.feeDate == body.selected_months[i])[0]
        if (body.selectedFees == "N" && feesDetails.unpaid == 1 && Number(feesDetails.feesAmount) > 0) {
            let createData = {
                transaction_id: transaction_id,
                t_adm_admission_id: StudentInfo.studentInfo.admission_record.t_adm_admission_id,
                t_cls_class_id: StudentInfo.studentInfo.admission_record.t_cls_class_id,
                t_sec_section_id: StudentInfo.studentInfo.admission_record.t_sec_section_id,
                t_mon_roll_number: StudentInfo.studentInfo.admission_record.t_adm_roll_number,
                t_mon_collection_date: moment(new Date()).format("YYYY-MM-DD"),
                t_mon_collection_date_time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                t_mon_entry_date_time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                t_mon_paid_month_dt: body.selected_months[i],
                t_mon_fee_type: 1,
                t_mon_fee_value: Number(feesDetails.feesAmount),
                t_mon_concession: '0 %',
                t_mon_misc_fee: 0,
                t_mon_due_amount: 0,
                t_mon_comment: '',
                t_mon_yearly_one_time_fee: 0,
                t_mon_total_fee: Number(feesDetails.feesAmount),
                t_mis_upload_id: 0
            }
            await TempTransactionsModal.create(createData);
        }
        if (body.selectedFees == "A" && feesDetails.unpaid == 1 && Number(feesDetails.feesAmount) > 0) {
            let createData = {
                transaction_id: transaction_id,
                t_adm_admission_id: StudentInfo.studentInfo.admission_record.t_adm_admission_id,
                t_cls_class_id: StudentInfo.studentInfo.admission_record.t_cls_class_id,
                t_sec_section_id: StudentInfo.studentInfo.admission_record.t_sec_section_id,
                t_mon_roll_number: StudentInfo.studentInfo.admission_record.t_adm_roll_number,
                t_mon_collection_date: moment(new Date()).format("YYYY-MM-DD"),
                t_mon_collection_date_time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                t_mon_entry_date_time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                t_mon_paid_month_dt: body.selected_months[i],
                t_mon_fee_type: 9,
                t_mon_fee_value: Number(feesDetails.feesAmount),
                t_mon_concession: '0 %',
                t_mon_misc_fee: 0,
                t_mon_due_amount: 0,
                t_mon_comment: '',
                t_mon_yearly_one_time_fee: 0,
                t_mon_total_fee: Number(feesDetails.feesAmount),
                t_mis_upload_id: 0
            }
            await TempTransactionsModal.create(createData);
        }
        if (feesDetails.unpaid == 1 && Number(feesDetails.penalty) > 0) {
            let createData = {
                transaction_id: transaction_id,
                t_adm_admission_id: StudentInfo.studentInfo.admission_record.t_adm_admission_id,
                t_cls_class_id: StudentInfo.studentInfo.admission_record.t_cls_class_id,
                t_sec_section_id: StudentInfo.studentInfo.admission_record.t_sec_section_id,
                t_mon_roll_number: StudentInfo.studentInfo.admission_record.t_adm_roll_number,
                t_mon_collection_date: moment(new Date()).format("YYYY-MM-DD"),
                t_mon_collection_date_time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                t_mon_entry_date_time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                t_mon_paid_month_dt: body.selected_months[i],
                t_mon_fee_type: 6,
                t_mon_fee_value: Number(feesDetails.penalty),
                t_mon_concession: '0 %',
                t_mon_misc_fee: 0,
                t_mon_due_amount: 0,
                t_mon_comment: '',
                t_mon_yearly_one_time_fee: 0,
                t_mon_total_fee: Number(feesDetails.penalty),
                t_mis_upload_id: 0
            }
            await TempTransactionsModal.create(createData);
        }


    }
    return transaction_id;


}
let getUniqueTransactionId = async () => {
    return (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2);
}
let markPaymentSuccess = async (req) => {
    let body = req.body
    let resp = await responseMsg(body.msg)
    console.log(resp)
    if(!resp){
    return {status: false,txn_id:resp.OrderID}
    }
    if(resp.TStat != "0300"){
        return {status: false,txn_id:resp.OrderID}
    }
    let tempTransactions = await TempTransactionsModal.findAll({ where: { transaction_id: resp.OrderID}, raw: true })
    let total = 0
    for (let i = 0; i < tempTransactions.length; i++) {
        total += tempTransactions[i].t_mon_total_fee
    }
    if(Number(resp.AMNT) != Number(total)){
        return {status: false,txn_id:resp.OrderID}
    }

    for (let i = 0; i < tempTransactions.length; i++) {
        let createData = tempTransactions[i]
        delete createData.status
        delete createData.created
        delete createData.modified
        delete createData.parent_name
        delete createData.parent_email
        delete createData.parent_mobile
        delete createData.txn_no
        delete createData.txn_amount_received
        delete createData.txn_date
        delete createData.txt_mode
        createData.t_mon_collection_date_time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        createData.t_mon_entry_date_time= moment(new Date()).format("YYYY-MM-DD HH:mm:ss");        
        await FeePaidModal.create(createData);
    }
    await TempTransactionsModal.update({ status: 'success',txn_no:resp.TaxnNo,txn_amount_received:Number(resp.AMNT),txn_date:resp.DnT,txt_mode:resp.TMode }, { where: { transaction_id: resp.OrderID } })
    return {status: true,txn_id:resp.OrderID};
}
let generateCheckSum = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (!body) {
        throw new BadRequestError('Body comes empty');
    }
    if (!body.transaction_id) {
        throw new BadRequestError('Transaction Id can not be empty');
    }
    let tempTransactions = await TempTransactionsModal.findAll({ where: { transaction_id: body.transaction_id }, raw: true })
    if (!tempTransactions) {
        throw new BadRequestError('Invalid Transaction Id');
    }
    await TempTransactionsModal.update({ parent_name: body.parent_name, parent_email: body.parent_email, parent_mobile: body.parent_mobile }, { where: { transaction_id: body.transaction_id } })
    let total = 0
    for (let i = 0; i < tempTransactions.length; i++) {
        total += tempTransactions[i].t_mon_total_fee
    }
    let msg = await get_message(body.transaction_id,total,body.parent_email,body.parent_name,body.parent_mobile)
    //let msg = await get_message(body.transaction_id, 1, body.parent_email, body.parent_name, body.parent_mobile)
   
    return msg;

}

let get_message = async (uniqueID, amount, mail, fname, mnumber) => {
    let msg = `${process.env.BILLDESK_MERCHANT_ID}|${uniqueID}|NA|${amount.toFixed(2)}|NA|NA|NA|INR|NA|R|${process.env.BILLDESK_SECRET_ID}|NA|NA|F|${fname}|${mail}|${mnumber}|NA|NA|NA|NA|NA`;
    let checksum = await get_checksum(msg);
    return (msg + '|' + checksum);
}
let get_checksum = async (msg) => {
    return CryptoJS.HmacSHA256(msg, process.env.BILLDESK_CHECKSUM).toString(CryptoJS.enc.Hex).toUpperCase();
}
let verify_checksum = async (message) => {
    let l_index = message.lastIndexOf("|");
    let to_be_verified = message.substring(l_index + 1);
    let my_checksum = await get_checksum(message.substring(0, l_index));
    return my_checksum === to_be_verified;
}
let responseMsg = async (response) => {

    let returnArray = {}
    response = response.replace(/[()]/g, '');
    response = response.replace(/[\n]/, '');
    let valid_payment = await verify_checksum(response)
    if (!valid_payment) {
        return false;
    }

    let pipeind1 = await findNthOccur(response, '|', 1)
    let pipeind2 = await findNthOccur(response, '|', 2)
    let pipeind3 = await findNthOccur(response, '|', 3)
    let pipeind4 = await findNthOccur(response, '|', 4)
    let pipeind5 = await findNthOccur(response, '|', 5)
    let pipeind7 = await findNthOccur(response, '|', 7)
    let pipeind8 = await findNthOccur(response, '|', 8)
    let pipeind9 = await findNthOccur(response, '|', 9)
    let pipeind10 = await findNthOccur(response, '|', 10)
    let pipeind12 = await findNthOccur(response, '|', 13)
    let pipeind13 = await findNthOccur(response, '|', 14)
    let pipeind14 = await findNthOccur(response, '|', 15)
    returnArray.MID = response.substring(0, pipeind1);
    returnArray.OrderID = response.substring(pipeind1 + 1, pipeind2);
    returnArray.TaxnNo = response.substring(pipeind2 + 1, pipeind3);
    returnArray.AMNT = response.substring(pipeind4 + 1, pipeind5);
    returnArray.TStat = response.substring(pipeind13 + 1, pipeind14);
    returnArray.DnT = response.substring(pipeind12 + 1, pipeind13);
    returnArray.TMode = await get_mode(response.substring(pipeind7 + 1, pipeind8));
    //returnArray.mode = this.get_mode(mode)
    return returnArray;
}
let findNthOccur = async (string, ch, N) => {

    let occur = 0;
    for (let i = 0; i < string.length; i++) {
        if (string[i] === ch) {
            occur += 1
        }
        if (occur === N) {
            return (i);
        }

    }
    return (-1);
}
let get_mode = async (s) => {

    if (s == '01') {
      return 'Netbanking';
    } else if (s == '02') {
      return 'Credit Card';
    } else if (s == '03') {
      return 'Debit Card';
    } else if (s == '04') {
      return 'Cash Card';
    } else if (s == '05') {
      return 'Mobile Wallet';
    } else if (s == '06') {
      return 'IMPS';
    } else if (s == '07') {
      return 'Reward Points';
    } else if (s == '08') {
      return 'Rupay';
    } else if (s == '09') {
      return 'Others';
    } else if (s == '10') {
      return 'UPI';
    }
  }
let getCheckSumRetry = async (req) =>{
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (!body) {
        throw new BadRequestError('Body comes empty');
    }
    if (!body.transaction_id) {
        throw new BadRequestError('Transaction Id can not be empty');
    }
    let tempTransactions = await TempTransactionsModal.findAll({ where: { transaction_id: body.transaction_id,status: {$ne: 'success'} }, raw: true })
    
    if (!tempTransactions.length) {
        throw new BadRequestError('Invalid Transaction Id');
    }
    
    let total = 0
    for (let i = 0; i < tempTransactions.length; i++) {
        total += tempTransactions[i].t_mon_total_fee
    }    
    let msg = await get_message(body.transaction_id, total, tempTransactions[0].parent_email, tempTransactions[0].parent_name, tempTransactions[0].parent_mobile)
    
    return msg;
}
module.exports = {
    getInfo: getInfo,
    processPayment: processPayment,
    markPaymentSuccess: markPaymentSuccess,
    getFinancialYear: getFinancialYear,
    getTransactionDetails: getTransactionDetails,
    generateCheckSum: generateCheckSum,
    getCheckSumRetry:getCheckSumRetry
};
