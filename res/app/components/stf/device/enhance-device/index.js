module.exports = angular.module('stf/device/enhance-device', [
  require('stf/app-state').name,
  require('stf/control').name
])
  .factory('EnhanceDeviceService', require('./enhance-device-service'))
