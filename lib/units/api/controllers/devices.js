var _ = require('lodash')
var Promise = require('bluebird')

var dbapi = require('../../../db/api')
var logger = require('../../../util/logger')
var datautil = require('../../../util/datautil')

var log = logger.createLogger('api:controllers:devices')

module.exports = {
  getDevices: getDevices
, getDeviceBySerial: getDeviceBySerial
, deleteDevice : deleteDevice
, setDeviceSupportAutomation: setDeviceSupportAutomation
}

function getDevices(req, res) {
  var fields = req.swagger.params.fields.value

  dbapi.loadDevices()
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          var deviceList = []

          list.forEach(function(device) {
            datautil.normalize(device, req.user)
            var responseDevice = device

            if (fields) {
              responseDevice = _.pick(device, fields.split(','))
            }
            deviceList.push(responseDevice)
          })

          res.json({
            success: true
          , devices: deviceList
          })
        })
    })
    .catch(function(err) {
      log.error('Failed to load device list: ', err.stack)
      res.status(500).json({
        success: false
      })
    })
}

function getDeviceBySerial(req, res) {
  var serial = req.swagger.params.serial.value
  var fields = req.swagger.params.fields.value

  dbapi.loadDevice(serial)
    .then(function(device) {
      if (!device) {
        return res.status(404).json({
          success: false
        , description: 'Device not found'
        })
      }

      datautil.normalize(device, req.user)
      var responseDevice = device

      if (fields) {
        responseDevice = _.pick(device, fields.split(','))
      }

      res.json({
        success: true
      , device: responseDevice
      })
    })
    .catch(function(err) {
      log.error('Failed to load device "%s": ', req.params.serial, err.stack)
      res.status(500).json({
        success: false
      })
    })
}


function deleteDevice(req, res) {
  var serial = req.swagger.params.serial.value

  dbapi.loadDevice(serial)
    .then(function(device) {
      if (!device) {
        return res.status(404).json({
          success: false
          , description: 'Device not found'
        })
      }

      dbapi.deleteDevice(serial)
        .then(function() {
          res.json({
            success: true, status: 'SUCCESS'
          })
        })
    })
    .catch(function(err) {
      log.error('Failed to load device "%s": ', req.params.serial, err.stack)
      res.status(500).json({
        success: false
      })
    })
}

function setDeviceSupportAutomation(req, res) {
  var serial = req.body.serial
  var supportAutomation = req.body.supportAutomation

  log.info("参数serial = " + serial)
  log.info("参数supportAutomation = " + supportAutomation)

  dbapi.loadDevice(serial)
    .then(function (device) {
      if (!device) {
        return res.status(404).json({
          success: false
          , description: 'Device not found'
        })
      }

      dbapi.setDeviceSupportAutomation(serial, supportAutomation)
        .then(function () {
          return res.json({success: true, status: 'SUCCESS'})
        })
    })
    .catch(function (err) {
      log.error('Failed to load user by "%s": ', email, err.stack)
      res.status(500).json({
        success: false
      })
    })
}
