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
  $scope.boxData = []

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
    , {
      name: 'supportAutomation'
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

  $scope.toggle = function (device) {
    if (device.using) {
      $scope.kick(device)
    } else {
      $location.path('/control/' + device.serial)
    }
  }

  $scope.invite = function (device) {
    return GroupService.invite(device).then(function () {
      $scope.$digest()
    })
  }

  $scope.search = {
    deviceFilter: '',
    focusElement: false
  }


  $scope.focusSearch = function () {
    if (!$scope.basicMode) {
      $scope.search.focusElement = true
    }
  }

  $scope.reset = function () {
    $scope.search.deviceFilter = ''
    $scope.filter = []
    $scope.sort = defaultSort
    $scope.columns = defaultColumns
  }


  $scope.initfilters = function () {
    return $http.get('/api/v1/devices').then(function (response) {
      var devices = response.data.devices
      // $log.log('devices: ' + devices)
      var filters = [
        {
          title: '系统',
          name: 'platform',
          values: [{name: 'Android'}, {name: 'iOS'}],
          showStatus: true
        },
        {
          title: '版本',
          name: 'version_type',
          values: [],
          showStatus: false
        },
        {
          title: '状态',
          name: 'state',
          values: [{name: 'Available'}, {name: 'Unavailable'}],
          showStatus: true
        },
        {
          title: '分辨率',
          name: 'display',
          values: [],
          showStatus: true
        },
        {
          title: '品牌',
          name: 'manufacturer',
          values: [],
          showStatus: true
        },
        {
          title: '自动部署',
          name: 'supportAutomation',
          values: [{name: 'Supported'}, {name: 'Unsupported'}],
          showStatus: true
        }
      ]

      //数据存储结果
      var manufacturer = []
      var versionType = []
      var androidOs = []
      var iosOs = []
      var dispaly = []


      //去除重复数据
      var manufacturerArray = []
      var versionTypeArray = []
      var androidOsArray = []
      var iosOsArray = []
      var displayArray = []


      for (var i = 0; i < devices.length; i++) {
        var obj = devices[i]
        //系统
        var platform = obj.platform

        //动态填充系统版本信息
        if (platform === 'Android' && obj.version && androidOsArray.indexOf(obj.version) === -1) {
          var name = obj.version.split(".")[0]
          var item = {
            type: 1,
            name: name,
            values: [obj.version],
            status: false
          }
          if (versionTypeArray.indexOf(name + '-' + 1) === -1) {
            versionType.push(item)
            versionTypeArray.push(name + '-' + 1)

            androidOs.push(item)
            androidOsArray.push(obj.version)
          } else {
            androidOs.forEach(function (item) {
              if (item.name === name) {
                item.values.push(obj.version)
              }
            })
          }

        }

        //动态填充ios系统版本信息
        if (platform === 'iOS' && obj.version && iosOsArray.indexOf(obj.version) === -1) {
          var name = obj.version.split(".")[0]
          var item = {
            type: 2,
            name: name,
            values: [obj.version],
            status: false
          }
          if (versionTypeArray.indexOf(name + '-' + 2) === -1) {

            versionType.push(item)
            versionTypeArray.push(name + '-' + 2)

            iosOs.push(item)
            iosOsArray.push(obj.version)
          } else {
            iosOs.forEach(function (item) {
              if (item.name === name) {
                item.values.push(obj.version)
              }
            })
          }

        }

        //动态填充分辨率信息
        if (obj.display) {
          var s = obj.display.width + 'x' + obj.display.height
          if (displayArray.indexOf(s) === -1) {
            var item = {
              type: (platform === 'Android' ? 1 : 2),
              name: s,
              status: true
            }
            dispaly.push(item)
            displayArray.push(s)
          }
        }
        //动态填充品牌信息
        if (obj.manufacturer && manufacturerArray.indexOf(obj.manufacturer) === -1) {
          var item = {
            type: (platform === 'Android' ? 1 : 2),
            name: obj.manufacturer,
            status: true
          }
          manufacturer.push(item)
          manufacturerArray.push(obj.manufacturer)
        }
      }

      versionType = sortByVersion(versionType, '.')
      filters[1].values = filters[1].values.concat(versionType)

      dispaly = sortByPublic(dispaly, 'x')
      filters[3].values = filters[3].values.concat(dispaly)

      filters[4].values = manufacturer


      return filters
    })

  }

  $scope.initfilters().then(function (filters) {

    $scope.defaultfilters = filters

    return $scope.defaultfilters

  })


  $scope.versionArray = []

  function changeSearchShow(value, item) {
    if (item.name === 'platform') {
      $scope.filter = []
      clear()
      if (value === '') {
        $scope.defaultfilters[1].showStatus = false

        //品牌
        $scope.defaultfilters[4].values.forEach(function (e) {
          e.status = true
        })
        //分辨率
        $scope.defaultfilters[3].values.forEach(function (e) {
          e.status = true
        })
      } else if (value === 'Android') {
        $scope.defaultfilters[1].showStatus = true

        $scope.defaultfilters[1].values.forEach(function (e) {
          if (e.type === 1) {
            e.status = true
          } else {
            e.status = false
          }
        })
        //品牌
        $scope.defaultfilters[4].values.forEach(function (e) {
          e.status = (e.type === 1 ? true : false)
        })
        //分辨率
        $scope.defaultfilters[3].values.forEach(function (e) {
          e.status = (e.type === 1 ? true : false)
        })
      } else if (value === 'iOS') {
        $scope.defaultfilters[1].showStatus = true

        $scope.defaultfilters[1].values.forEach(function (e) {
          if (e.type === 2) {
            e.status = true
          } else {
            e.status = false
          }
        })
        //品牌
        $scope.defaultfilters[4].values.forEach(function (e) {
          e.status = (e.type === 2 ? true : false)
        })
        //分辨率
        $scope.defaultfilters[3].values.forEach(function (e) {
          e.status = (e.type === 2 ? true : false)
        })
      }
    }

    var fieldValue = ""
    $scope.filter.forEach(function (e) {
      if (e.query === 'platform') {
        fieldValue = (e.field === 'Android' ? 1 : 2)
      }
    })
    if (item.name === 'version_type') {

      if (null !== document.getElementById('version')) {
        document.getElementById('version').value = ""
      }

      $scope.versionArray = []
      $scope.defaultfilters[1].values.forEach(function (e) {
        if (e.name === value) {
          e.values.forEach(function (a) {
              var item = {
                name: 'version',
                values: a
              }
              $scope.versionArray.push(item)
          })

        }
      })

    }
  }


  function clear() {
    document.getElementById($scope.defaultfilters[4].name).value = ""
    document.getElementById($scope.defaultfilters[2].name).value = ""
    document.getElementById($scope.defaultfilters[3].name).value = ""
    document.getElementById($scope.defaultfilters[5].name).value = ""
    $scope.versionArray = []
  }

  //name 查询条件传参选择的value，item当前对象
  $scope.applyFilter = function (value, item) {
    if (null === item || undefined === item) {
      return
    }

    //控制栏位的展示
    changeSearchShow(value, item)

    //数据筛选
    var lowvalue = angular.lowercase(value)

    //特殊处理版本传参
    var nameParams = item.name
    if (nameParams === 'version_type') {
      $scope.defaultfilters[1].values.forEach(function (e) {
        if(value !== "" && e.name === value){
          nameParams = (e.type === 1 ? 'version' : 'ios_os')
        }
      })

      if(value === ""){
        nameParams = ""
        var i = 0
        $scope.filter.forEach(function (e, index) {
          if(e.field === 'version' || e.field === 'ios_os'){
            i = index
          }
        })
        $scope.filter.splice(i, 1)
      }
    }

    if (undefined === nameParams && undefined !== item[0] && item[0].name === 'version') {
      //版本大类肯定不为空，则type从大类中取值
      $scope.filter.forEach(function (e) {
        if(e.field === 'version' || e.field === 'ios_os'){
          if(value !== ""){
            e.query = value
          }else{
            e.query = e.query.split(".")[0]
          }
        }
      })
    }

    if (value === "") {
      value = 'All'
    }

    for (var i = 0; i < $scope.filter.length; i++) {
      if ($scope.filter[i].field === nameParams) {
        if (lowvalue === 'all') {
          $scope.filter.splice(i, 1)
        } else {
          $scope.filter[i].query = lowvalue
        }

        // $log.log('filter:' + angular.toJson($scope.filter))
        return
      }
    }

    //最开始filter为空，且选择'all'时
    if (lowvalue === 'all') {
      return
    }
    if(nameParams !== undefined && nameParams !== null && nameParams !== ""){
      var object = {
        field: nameParams,
        op: null,
        query: lowvalue
      }

      // $log.log('new_filter: ' + angular.toJson(object))
      $scope.filter.push(object)
    }

  }

  function sortBy2wei(aParam, bParam) {
    var a = aParam.name
    var b = bParam.name

    var diff = a.length - b.length
    if (diff > 0) {
      b = b.concat(NewArr(diff))
    } else if (diff < 0) {
      a = a.concat(NewArr((0 - diff)))
    }
    for (var i = 0; i < a.length; i++) {
      if (a[i] > b[i]) return 1
      if (a[i] < b[i]) return -1
      if (a[i] === b[i] && i === a.length - 1) return 0
      continue
    }
  }

  function NewArr(number) {
    var arr = []
    for (var i = 0; i < number; i++) {
      arr.push(0)
    }
    return arr
  }

  function sortByPublic(arr, separator) {
    arr.forEach(function (item, index) {
      var tmp = item.name.split(separator)
      tmp.forEach(function (value, index) {
        tmp[index] = parseInt(value)
      })
      arr[index] = {type: item.type, name: tmp, status: item.status}
    })
    arr.sort(sortBy2wei)
    arr.forEach(function (item, index) {
      var name = ""
      item.name.forEach(function (value) {
        name += value + separator
      })
      name = name.substring(0, name.length - 1)
      arr[index] = {type: item.type, name: name, status: item.status}
    })

    return arr
  }


  function sortByVersion(arr, separator) {
    //版本大类先排序
    arr.sort(sortBy2wei)

    //版本小类再排序
    arr.forEach(function (item, aindex) {
      var brr = item.values

      brr.forEach(function (item, index) {
        var tmp = item.split(separator)
        tmp.forEach(function (value, index) {
          tmp[index] = parseInt(value)
        })
        brr[index] = {name: tmp}
      })
      brr.sort(sortBy2wei)
      brr.forEach(function (item, index) {
        var name = ""
        item.name.forEach(function (value) {
          name += value + separator
        })
        name = name.substring(0, name.length - 1)
        brr[index] = name
      })
      arr[aindex] = {type: item.type, name: item.name, values: brr, status: item.status}

    })

    return arr
  }

}
