/**
 * @swagger
 * resourcePath: /Customer
 * description: All Customer related api
 */
'use strict';

let getInforManager = require('../manager/Get_info');



let getInfo = (req, res, next) => {

    return getInforManager
        .getInfo(req)
        .then(data => {
            let result = {
                status: 200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}


let processPayment = (req, res, next) => {

    return getInforManager
        .processPayment(req)
        .then(data => {
            let result = {
                status: 200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}
let markPaymentSuccess = (req, res, next) => {

    return getInforManager
        .markPaymentSuccess(req)
        .then(data => {
            let result = {
                status: 200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}
let getFinancialYear = (req, res, next) => {

    return getInforManager
        .getFinancialYear(req)
        .then(data => {
            let result = {
                status: 200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}
let getTransactionDetails = (req, res, next) => {

    return getInforManager
        .getTransactionDetails(req)
        .then(data => {
            let result = {
                status: 200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}
let generateCheckSum = (req, res, next) => {

    return getInforManager
        .generateCheckSum(req)
        .then(data => {
            let result = {
                status: 200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}
let getCheckSumRetry = (req, res, next) => {

    return getInforManager
        .getCheckSumRetry(req)
        .then(data => {
            let result = {
                status: 200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

module.exports = {
    getInfo: getInfo,
    processPayment: processPayment,
    markPaymentSuccess: markPaymentSuccess,
    getFinancialYear:getFinancialYear,
    getTransactionDetails:getTransactionDetails,
    generateCheckSum:generateCheckSum,
    getCheckSumRetry:getCheckSumRetry
};