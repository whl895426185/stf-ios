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
          title: '系统: ',
          name: 'platform',
          values: [{name: 'Android',status: true}, {name: 'iOS',status: true}],
          showStatus : true
        },
        {
          title: '版本分类：',
          name: 'result_version',
          values: [{name: 'All', status: true}],
          showStatus : true
        },
        {
          title: 'version',
          name: 'version',
          values: [],
          showStatus : false
        },
        {
          title: '版本分类：',
          name: 'result_ios_os',
          values: [{name: 'All', status: true}],
          showStatus : false
        },
        {
          title: 'ios_os',
          name: 'ios_os',
          values: [],
          showStatus : false
        },
        {
          title: '状态: ',
          name: 'state',
          values: [{name: 'All',status: true}, {name: 'Available', status: true},{name: 'Unavailable', status: true}],
          showStatus : true
        },
        {
          title: '分辨率: ',
          name: 'display',
          values: [{name: 'All',status:true}],
          showStatus : true
        },
        {
          title: '品牌: ',
          name: 'manufacturer',
          values: [{name: 'All',status: true}],
          showStatus : true
        },
        {
          title: '自动部署: ',
          name: 'supportAutomation',
          values: [{name: 'All',status:true},{name: 'Supported',status:true},{name: 'Unsupported',status:true}],
          showStatus : true
        }
      ]

      //数据存储结果
      var androidOs = []
      var iosOs = []
      var dispaly = []


      //去除重复数据
      var manufacturerArray = []
      var androidOsNameArray = []
      var androidOsArray = []
      var iosOsNameArray = []
      var iosOsArray = []
      var displayArray = []


      for(var i = 0; i < devices.length; i++) {
        var obj = devices[i]
        //系统
        var platform = obj.platform

        //动态填充品牌信息
        if(obj.manufacturer && manufacturerArray.indexOf(obj.manufacturer) === -1) {
          var item = {
            name: obj.manufacturer,
            status: (platform === 'Android' ? true : false)
          }
          filters[7].values.push(item)
          manufacturerArray.push(obj.manufacturer)
        }

        //动态填充Android系统版本信息
        if(platform === 'Android' && obj.version && androidOsArray.indexOf(obj.version) === -1) {
          var name = obj.version.split(".")[0]
          if(androidOsNameArray.indexOf(name) === -1){
            var item = {
              name: name,
              values: [obj.version],
              status: true
            }

            androidOsNameArray.push(name)

            androidOs.push(item)
            androidOsArray.push(obj.version)
          }else{
            androidOs.forEach(function (item) {
              if(item.name === name){
                item.values.push(obj.version)
              }
            })
          }
        }

        //动态填充ios系统版本信息
        if(platform === 'iOS' && obj.version && iosOsArray.indexOf(obj.version) === -1) {
          var name = obj.version.split(".")[0]
          if(iosOsNameArray.indexOf(name) === -1){
            var item = {
              name: name,
              values: [obj.version],
              status: true
            }
            iosOsNameArray.push(name)

            iosOs.push(item)
            iosOsArray.push(obj.version)
          }else{
            iosOs.forEach(function (item) {
              if(item.name === name){
                item.values.push(obj.version)
              }
            })
          }
        }

        //动态填充分辨率信息
        if(obj.display) {
          var s = obj.display.width + 'x' + obj.display.height
          if(displayArray.indexOf(s) === -1) {
            var item = {
              name: s,
              status: (platform === 'Android' ? true : false)
            }
            dispaly.push(item)
            displayArray.push(s)
          }
        }
      }

      androidOs = sortByVersion(androidOs, '.')

      filters[1].values = filters[1].values.concat(androidOs)

      iosOs = sortByVersion(iosOs, '.')
      filters[3].values = filters[3].values.concat(iosOs)

      dispaly = sortByHuya(dispaly, 'x')
      filters[6].values = filters[6].values.concat(dispaly)


      //初始化筛选信息
      filterData("platform", "Android")

      return filters
    })

  }

  $scope.initfilters().then(function(filters) {

    $scope.defaultfilters = filters

    //版本分类加载版本
    versionPush('All', null,'version', 'result_version', 'ios_os')

    return $scope.defaultfilters

  })

  function change(item) {
    item.values.forEach(function (params) {
      if(params.name !== 'All'){
        if(!params.status){
          params.status = true
        }else{
          params.status = false
        }
      }
    })
  }

  function changeShowStatus(name, item){
    var value = item.name
    if(name === 'platform'){
      $scope.defaultfilters.forEach(function (item) {
        if(item.name == 'manufacturer'){//品牌
          change(item)

        }
        if(value === 'Android'){
          if(item.name == 'result_version'){//安卓版本
            item.showStatus = true
          }
          if(item.name == 'version'){//安卓版本
            item.showStatus = false
          }
          if(item.name == 'result_ios_os' || item.name == 'ios_os'){//苹果版本
            item.showStatus = false
          }

          versionPush('All', null,'version', 'result_version', 'ios_os')
        }
        if(value === 'iOS'){
          if(item.name == 'result_ios_os'){//苹果版本
            item.showStatus = true
          }
          if(item.name == 'ios_os'){//苹果版本
            item.showStatus = false
          }
          if(item.name == 'result_version' || item.name == 'version'){//安卓版本
            item.showStatus = false
          }
          versionPush('All', null,'ios_os', 'result_ios_os', 'version')

        }

        if(item.name == 'display'){//分辨率
          change(item)
        }
      })

      //筛选条件清除之前选择的数据
      clear(name)

    }

    if(name === 'result_version'){
      versionPush(value, item.values,'version', 'result_version', 'ios_os')
    }

    if(name === 'result_ios_os'){
      versionPush(value, item.values,'ios_os', 'result_ios_os', 'version')
    }
  }



  function versionPush(value, valuesArr, text, text2, text3) {
    $scope.defaultfilters.forEach(function (litt) {
      if(litt.name === text){
        litt.showStatus = true
        litt.values = []

        if(value === 'All'){
          var arr = []
          $scope.defaultfilters.forEach(function (e) {
            if(e.name === text2){
              arr = e.values
            }
          })
          arr.forEach(function (a) {
            if(a.name !== 'All'){
              a.values.forEach(function (b) {
                var params = {
                  name: b,
                  status: true
                }
                litt.values.push(params)
              })
            }

          })
        }else{
          valuesArr.forEach(function (item) {
            var params = {
              name: item,
              status: true
            }
            litt.values.push(params)
          })
        }

        $scope.boxData = litt

      }
      if(litt.name === text3) {
        litt.showStatus = false
        litt.values = []
        litt.values.push({name: 'All', status: true})
      }
    })
  }

  function clear(name) {
    $scope.filter = []
    if(name === 'platform'){
      $scope.defaultfilters.forEach(function (e) {
        if(name !== e.name){
          e.values.forEach(function (f) {
            var key = e.name + "_" +f.name
            if(f.status && e.name !== 'version' && e.name !== 'ios_os'){
              document.getElementById(key).removeAttribute("class")

              if(f.name === 'All'){
                document.getElementById(key).setAttribute("class", 'stf-a-click')
              }else{
                document.getElementById(key).setAttribute("class", 'stf-a-search')
              }
            }

          })
        }
      })
    }
  }

  function filterData(name, value){
    var lowname = angular.lowercase(name)
    var lowvalue = angular.lowercase(value)

    for(var i = 0; i < $scope.filter.length; i++) {
      if($scope.filter[i].field === name) {
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
      field: (lowname === 'all' ? lowname : name),
      op: null,
      query: lowvalue
    }

    // $log.log('new_filter: ' + angular.toJson(object))
    $scope.filter.push(object)
  }

  $scope.applyFilter = function(name, item) {
    if(null === item || undefined === item){
      return
    }
    var value = item.name

    if(name !== 'version' && name !== 'ios_os'){
      //动态改变显示样式
      changeCss(name, value)

    }

    //动态变动下查询条件显示
    changeShowStatus(name, item)

    //筛选数据
    if(name === 'result_version' || name === 'result_ios_os'){
      if(name === 'result_version'){
        name = 'version'
      }else{
        name = 'ios_os'
      }
    }

    filterData(name, value)

  }

  function changeCss(name, value) {
    $scope.defaultfilters.forEach(function (e) {
      if(name === e.name){
        e.values.forEach(function (f) {
          var key = name + "_" +f.name
          if(f.status){
            document.getElementById(key).removeAttribute("class")

            if(f.name === value){
              document.getElementById(key).setAttribute("class", 'stf-a-click')
            }else{
              document.getElementById(key).setAttribute("class", 'stf-a-search')
            }
          }

        })
      }

    })

  }

  function sortBy2wei(aParam, bParam) {
    var a = aParam.name
    var b = bParam.name

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
    arr.forEach(function(item, index){
      var tmp = item.name.split(separator)
      tmp.forEach(function(value, index){
        tmp[index] = parseInt(value)
      })
      arr[index] = {name : tmp, status: item.status}
    })
    arr.sort(sortBy2wei)
    arr.forEach(function(item, index) {
      var name = ""
      item.name.forEach(function (value) {
        name += value + separator
      })
      name = name.substring(0, name.length -1)
      arr[index] = {name: name, status: item.status}
    })

    return arr
  }


  function sortByVersion(arr, separator) {
    //版本大类先排序
    arr.sort(sortBy2wei)

    //版本小类再排序
    arr.forEach(function(item, aindex){
      var brr = item.values

      brr.forEach(function(item, index){
        var tmp = item.split(separator)
        tmp.forEach(function(value, index){
          tmp[index] = parseInt(value)
        })
        brr[index] = {name : tmp}
      })
      brr.sort(sortBy2wei)
      brr.forEach(function(item, index) {
        var name = ""
        item.name.forEach(function (value) {
          name += value + separator
        })
        name = name.substring(0, name.length -1)
        brr[index] = name
      })
      arr[aindex] = {name: item.name, values: brr, status: item.status}

    })

    return arr
  }

}
