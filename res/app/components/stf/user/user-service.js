var oboe = require('oboe')
var _ = require('lodash')
var EventEmitter = require('eventemitter3')

module.exports = function UserServiceFactory($http, AddAdbKeyModalService, AppState, socket, $log, $window) {
  var UserService = {}

  var user = UserService.currentUser = AppState.user

  UserService.getAdbKeys = function () {
    return (user.adbKeys || (user.adbKeys = []))
  }

  UserService.addAdbKey = function (key) {
    socket.emit('user.keys.adb.add', key)
  }

  UserService.acceptAdbKey = function (key) {
    socket.emit('user.keys.adb.accept', key)
  }

  UserService.removeAdbKey = function (key) {
    socket.emit('user.keys.adb.remove', key)
  }

  socket.on('user.keys.adb.error', function (error) {
    $rootScope.$broadcast('user.keys.adb.error', error)
  })

  socket.on('user.keys.adb.added', function (key) {
    UserService.getAdbKeys().push(key)
    $rootScope.$broadcast('user.keys.adb.updated', user.adbKeys)
    $rootScope.$apply()
  })

  socket.on('user.keys.adb.removed', function (key) {
    user.adbKeys = UserService.getAdbKeys().filter(function (someKey) {
      return someKey.fingerprint !== key.fingerprint
    })
    $rootScope.$broadcast('user.keys.adb.updated', user.adbKeys)
    $rootScope.$apply()
  })

  socket.on('user.keys.adb.confirm', function (data) {
    AddAdbKeyModalService.open(data).then(function (result) {
      if (result) {
        UserService.acceptAdbKey(data)
      }
    })
  })


  //获取用户列表信息
  UserService.getUsersList = function () {
    var tracker = []
    oboe('/api/v1/users')
      .node('users[*]', function (user) {
        var userArray = [
          {name: user.name}
          , {name: user.email}
          , {name: user.group}
          , {name: user.createdAt.split("T")[0]}
          , {name: user.lastLoggedInAt.split("T")[0]}
        ]

        tracker.push(userArray)
      })
    return tracker
  }

  //删除用户信息
  UserService.deleteUserByEmail = function (email) {
    $http.delete('/api/v1/user/' + email)
      .then(function (response) {
        if (response.data.success) {
          alert("用户删除成功")
          $window.top.location.reload()
        } else {
          alert("用户删除失败")
        }
      })
  }

  //新增用户信息
  UserService.addUser = function (user) {
    $http.post('/api/v1/user', user)
      .success(function (response) {
        if (response.success) {
          alert("用户新增成功")
          $window.top.location.reload()
        } else {
          alert("用户新增失败：" + response.description)
        }
      })
  }

  return UserService
}
