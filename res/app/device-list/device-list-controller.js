var QueryParser = require('./util/query-parser')

module.exports = function DeviceListCtrl(
  $scope
, $http
, DeviceService
, DeviceColumnService
, GroupService
, ControlService
, SettingsService
, $location
, $log
) {
  $scope.tracker = DeviceService.trackAll($scope)
  $scope.control = ControlService.create($scope.tracker.devices, '*ALL')

  $scope.columnDefinitions = DeviceColumnService

  var defaultColumns = [
    {
      name: 'state'
    , selected: true
    }
  , {
      name: 'model'
    , selected: true
    }
  , {
      name: 'name'
    , selected: true
    }
  , {
      name: 'serial'
    , selected: false
    }
  , {
      name: 'operator'
    , selected: true
    }
  , {
      name: 'releasedAt'
    , selected: true
    }
  , {
      name: 'version'
    , selected: true
    }
  , {
      name: 'network'
    , selected: false
    }
  , {
      name: 'display'
    , selected: false
    }
  , {
      name: 'manufacturer'
    , selected: false
    }
  , {
      name: 'marketName'
    , selected: false
    }
  , {
      name: 'sdk'
    , selected: false
    }
  , {
      name: 'abi'
    , selected: false
    }
  , {
      name: 'cpuPlatform'
    , selected: false
    }
  , {
      name: 'openGLESVersion'
    , selected: false
    }
  , {
      name: 'browser'
    , selected: false
    }
  , {
      name: 'phone'
    , selected: false
    }
  , {
      name: 'imei'
    , selected: false
    }
  , {
      name: 'imsi'
    , selected: false
    }
  , {
      name: 'iccid'
    , selected: false
    }
  , {
      name: 'batteryHealth'
    , selected: false
    }
  , {
      name: 'batterySource'
    , selected: false
    }
  , {
      name: 'batteryStatus'
    , selected: false
    }
  , {
      name: 'batteryLevel'
    , selected: false
    }
  , {
      name: 'batteryTemp'
    , selected: false
    }
  , {
      name: 'provider'
    , selected: true
    }
  , {
      name: 'notes'
    , selected: true
    }
  , {
      name: 'owner'
    , selected: true
    }
  ]

  $scope.columns = defaultColumns

  SettingsService.bind($scope, {
    target: 'columns'
  , source: 'deviceListColumns'
  })

  var defaultSort = {
    fixed: [
      {
        name: 'state'
        , order: 'asc'
      }
    ]
    , user: [
      {
        name: 'name'
        , order: 'asc'
      }
    ]
  }

  $scope.sort = defaultSort

  SettingsService.bind($scope, {
    target: 'sort'
  , source: 'deviceListSort'
  })

  $scope.filter = []

  $scope.activeTabs = {
    icons: true
  , details: false
  }

  SettingsService.bind($scope, {
    target: 'activeTabs'
  , source: 'deviceListActiveTabs'
  })

  $scope.toggle = function(device) {
    if (device.using) {
      $scope.kick(device)
    } else {
      $location.path('/control/' + device.serial)
    }
  }

  $scope.invite = function(device) {
    return GroupService.invite(device).then(function() {
      $scope.$digest()
    })
  }

  $scope.search = {
    deviceFilter: '',
    focusElement: false
  }


  $scope.focusSearch = function() {
    if (!$scope.basicMode) {
      $scope.search.focusElement = true
    }
  }

  $scope.reset = function() {
    $scope.search.deviceFilter = ''
    $scope.filter = []
    $scope.sort = defaultSort
    $scope.columns = defaultColumns
  }


  $scope.initfilters = function() {
    return $http.get('/api/v1/devices').then(function(response) {
      var devices = response.data.devices
      // $log.log('devices: ' + devices)
      var filters = [
        {
          title: '品牌',
          name: 'manufacturer',
          values: ['All']
        },
        {
          title: 'Android OS',
          name: 'version',
          values: ['All']
        },
        {
          title: 'iOS OS',
          name: 'ios_os',
          values: ['All']
        },
        {
          title: '分辨率',
          name: 'display',
          values: ['All']
        },
        {
          title: '状态',
          name: 'state',
          values: ['All', 'Available', 'Unavailable']
        },
        {
          title: '系统',
          name: 'platform',
          values: ['All', 'Android', 'iOS']
        }
      ]

      var androidOs = []
      var iosOs = []
      var dispaly = []

      for(var i = 0; i < devices.length; i++) {
        if(devices[i].manufacturer && filters[0].values.indexOf(devices[i].manufacturer) === -1) {
          filters[0].values.push(devices[i].manufacturer)
        }
        if(devices[i].platform && devices[i].platform === 'Android' && devices[i].version
          && androidOs.indexOf(devices[i].version) === -1) {
          androidOs.push(devices[i].version)
          // filters[1].values.push(devices[i].version)
        }

        if(devices[i].platform && devices[i].platform.toLowerCase() === 'ios' && devices[i].version
          && iosOs.indexOf(devices[i].version) === -1) {
          iosOs.push(devices[i].version)
          // filters[2].values.push(devices[i].version)
        }

        if(devices[i].display) {
          var s = devices[i].display.width + 'x' + devices[i].display.height
          if(dispaly.indexOf(s) === -1) {
            dispaly.push(s)
            // filters[3].values.push(s)
          }
        }
      }

      androidOs = sortByHuya(androidOs, '.')
      filters[1].values = filters[1].values.concat(androidOs)
      // $log.log('Android OS: ' + androidOs)

      iosOs = sortByHuya(iosOs, '.')
      filters[2].values = filters[2].values.concat(iosOs)
      // $log.log('iOS OS:' + iosOs)

      dispaly = sortByHuya(dispaly, 'x')
      filters[3].values = filters[3].values.concat(dispaly)
      // $log.log('Display: ' + dispaly)

      // $log.log('filters: ' + filters)
      return filters
    })

  }

  $scope.initfilters().then(function(filters) {
    return $scope.defaultfilters = filters
  })

  $scope.applyFilter = function(name, value) {

    var lowname = angular.lowercase(name)
    var lowvalue = angular.lowercase(value)

    for(var i = 0; i < $scope.filter.length; i++) {
      if($scope.filter[i].field === lowname) {
        if(lowvalue === 'all') {
          $scope.filter.splice(i, 1)
        }else {
          $scope.filter[i].query = lowvalue
        }

        // $log.log('filter:' + angular.toJson($scope.filter))
        return
      }
    }

    //最开始filter为空，且选择'all'时
    if(lowvalue === 'all') {
      return
    }
    var object = {
      field: lowname,
      op: null,
      query: lowvalue
    }

    // $log.log('new_filter: ' + angular.toJson(object))
    $scope.filter.push(object)

  }

  function sortBy2wei(a, b) {
    var diff = a.length - b.length
    if(diff > 0) {
      b = b.concat(NewArr(diff))
    }else if(diff < 0) {
      a = a.concat(NewArr((0 - diff)))
    }
    for(var i = 0; i < a.length; i++) {
      if(a[i] > b[i]) return 1
      if(a[i] < b[i]) return -1
      if(a[i] === b[i] && i === a.length -1) return 0
      continue
    }
  }

  function NewArr(number) {
    var arr = []
    for(var i = 0; i < number; i++) {
      arr.push(0)
    }
    return arr
  }

  function sortByHuya(arr, separator) {
    arr.forEach(function(value, index){
      var tmp = value.split(separator)
      tmp.forEach(function(value, index){
        tmp[index] = parseInt(value)
      })
      arr[index] = tmp
    })
    arr.sort(sortBy2wei)
    arr.forEach(function(value, index) {
      arr[index] = value.join(separator)
    })

    return arr
  }

}
