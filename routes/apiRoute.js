const express = require("express");
const apiController = require("../controller/apiController");
const { getUser, getAllOrg, createOrg, getOrg, addOrgUser } = apiController;
const { protect } = require("../controller/authController");

const router = express.Router();

router.use(protect);

router.post("/organisations/:orgId/users", addOrgUser);

router.route("/users/:id").get(getUser);

router.get("/organisations/:orgId", getOrg);

router.route("/organisations").get(getAllOrg).post(createOrg);

module.exports = router;
