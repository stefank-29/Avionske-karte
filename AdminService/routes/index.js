const express = require('express');
const router = express.Router();
const axios = require('axios');
const adminController = require('../controllers/adminController');

router.get('/admin', (req, res) => {
    res.render('layout');
});

router.get('/admin/dashboard');

router.get('/admin/add/airplane', adminController.addAirplaneForm);

router.get('/admin/add/flight', adminController.addFlightForm);

module.exports = router;
