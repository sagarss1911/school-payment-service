'use strict';

let express = require("express"),
    router = express.Router(),
    controller = require("../controllers/Get_info"),
    fileUploadHelper  = require("../helpers/file_upload"),
    auth = require('../middleware/auth'),
    validateAccess = require('../policies/Validate_request_access');



router.post("/get_info",auth.validateApiKey, controller.getInfo);
router.post("/process_payment",auth.validateApiKey, controller.processPayment);
router.post("/mark_payments_success", controller.markPaymentSuccess);


module.exports = router;
