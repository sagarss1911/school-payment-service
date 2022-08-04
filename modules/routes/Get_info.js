'use strict';

let express = require("express"),
    router = express.Router(),
    controller = require("../controllers/Get_info"),
    fileUploadHelper  = require("../helpers/file_upload"),
    auth = require('../middleware/auth'),
    validateAccess = require('../policies/Validate_request_access');


router.get("/get_financial_year",auth.validateApiKey, controller.getFinancialYear);
router.post("/get_info",auth.validateApiKey, controller.getInfo);
router.post("/get_transaction_details",auth.validateApiKey, controller.getTransactionDetails);
router.post("/generate_checksum",auth.validateApiKey, controller.generateCheckSum);
router.post("/generate_checksum_for_retry",auth.validateApiKey, controller.getCheckSumRetry);

router.post("/process_payment",auth.validateApiKey, controller.processPayment);
router.post("/mark_payments_success", controller.markPaymentSuccess);


module.exports = router;
