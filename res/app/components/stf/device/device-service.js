var oboe = require('oboe')
var _ = require('lodash')
var EventEmitter = require('eventemitter3')

module.exports = function DeviceServiceFactory($http, socket, EnhanceDeviceService, $log, $window) {

  var deviceService = {}

  function Tracker($scope, options) {
    var devices = []
    var devicesBySerial = Object.create(null)
    var scopedSocket = socket.scoped($scope)
    var digestTimer, lastDigest

    $scope.$on('$destroy', function() {
      clearTimeout(digestTimer)
    })

    function digest() {
      // Not great. Consider something else
      if (!$scope.$$phase) {
        //执行digest循环，触发所有的watchers，更新数据
        $scope.$digest()
      }

      lastDigest = Date.now()
      digestTimer = null
    }

    //刷新网页
    function notify(event) {
      if (!options.digest) {
        return
      }

      if (event.important) {
        // Handle important updates immediately.
        //digest()
        //刷新网页，并在刷新网页前调用diges函数
        window.requestAnimationFrame(digest)
      }
      else {
        if (!digestTimer) {
          var delta = Date.now() - lastDigest
          if (delta > 1000) {
            // It's been a while since the last update, so let's just update
            // right now even though it's low priority.
            digest()
          }
          else {
            // It hasn't been long since the last update. Let's wait for a
            // while so that the UI doesn't get stressed out.
            digestTimer = setTimeout(digest, delta)
          }
        }
      }
    }

    //同步设备状态
    function sync(data) {
      // usable IF device is physically present AND device is online AND
      // preparations are ready AND the device has no owner or we are the
      // owner
      data.usable = data.present && data.status === 3 && data.ready &&
        (!data.owner || data.using)

      // Make sure we don't mistakenly think we still have the device
      if (!data.usable || !data.owner) {
        data.using = false
      }
      //更新设备状态
      EnhanceDeviceService.enhance(data)
    }

    function get(data) {
      return devices[devicesBySerial[data.serial]]
    }

    var insert = function insert(data) {
      devicesBySerial[data.serial] = devices.push(data) - 1
      sync(data)
      this.emit('add', data)
    }.bind(this)

    var modify = function modify(data, newData) {
      _.merge(data, newData, function(a, b) {
        // New Arrays overwrite old Arrays
        if (_.isArray(b)) {
          return b
        }
      })
      sync(data)
      this.emit('change', data)
    }.bind(this)

    var remove = function remove(data) {
      var index = devicesBySerial[data.serial]
      if (index >= 0) {
        devices.splice(index, 1)
        delete devicesBySerial[data.serial]
        this.emit('remove', data)
      }
    }.bind(this)

    function fetch(data) {
      deviceService.load(data.serial)
        .then(function(device) {
          return changeListener({
            important: true
          , data: device
          })
        })
        .catch(function() {})
    }

    function addListener(event) {
      var device = get(event.data)
      if (device) {
        modify(device, event.data)
        notify(event)
      }
      else {
        if (options.filter(event.data)) {
          insert(event.data)
          notify(event)
        }
      }
    }

    function changeListener(event) {
      var device = get(event.data)
      if (device) {
        modify(device, event.data)
        if (!options.filter(device)) {
          remove(device)
        }
        notify(event)
      }
      else {
        if (options.filter(event.data)) {
          insert(event.data)
          // We've only got partial data
          fetch(event.data)
          notify(event)
        }
      }
    }

    scopedSocket.on('device.add', addListener)
    scopedSocket.on('device.remove', changeListener)
    scopedSocket.on('device.change', changeListener)

    this.add = function(device) {
      addListener({
        important: true
      , data: device
      })
    }

    this.devices = devices
  }

  Tracker.prototype = new EventEmitter()

  //更新所有设备
  deviceService.trackAll = function($scope) {
    var tracker = new Tracker($scope, {
      filter: function() {
        return true
      }
    , digest: false
    })

    //获取所有设备
    oboe('/api/v1/devices')
      .node('devices[*]', function(device) {
        // $log.log('In oboe node callback :' + device)
        tracker.add(device)
      })
    // $log.log('tracker: ' + angular.toJson(tracker))
    return tracker
  }

  //更新群组设备
  deviceService.trackGroup = function($scope) {
    var tracker = new Tracker($scope, {
      filter: function(device) {
        return device.using
      }
    , digest: true
    })
    oboe('/api/v1/user/devices/')
      .node('devices[*]', function(device) {
        tracker.add(device)
      })
    return tracker
  }

  deviceService.load = function(serial) {
    return $http.get('/api/v1/devices/' + serial)
      .then(function(response) {
        return response.data.device
      })
  }

  deviceService.get = function(serial, $scope) {
    var tracker = new Tracker($scope, {
      filter: function(device) {
        return device.serial === serial
      }
    , digest: true
    })

    return deviceService.load(serial)
      .then(function(device) {
        tracker.add(device)
        return device
      })
  }

  deviceService.updateNote = function(serial, note) {
    socket.emit('device.note', {
      serial: serial,
      note: note
    })
  }

  deviceService.deleteDevice = function (serial) {
    $http.delete('/api/v1/devices/' + serial)
      .then(function (response) {
        if (response.data.success) {
          $window.top.location.reload()
        } else {
          alert("删除失败")
        }
      })
  }

  deviceService.supportAutomation = function (serial, checked) {

    if("" === serial || null === serial || undefined === serial){
      return
    }

    var data = {
      serial: serial,
      supportAutomation: (checked == true ? 1 : 2)
    }

    $http.post('/api/v1/devices', data)
      .success(function(response) {
        if (response.success) {
          $window.top.location.reload()
        }else{
          alert('更新失败')
        }

      })
  }

  return deviceService
}
