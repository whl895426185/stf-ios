module.exports = function MenuCtrl($scope, $rootScope, SettingsService, $location, $window, UserService) {

  SettingsService.bind($scope, {
    target: 'lastUsedDevice'
  })

  SettingsService.bind($rootScope, {
    target: 'platform',
    defaultValue: 'native'
  })

  $scope.$on('$routeChangeSuccess', function() {
    $scope.isControlRoute = $location.path().search('/control') !== -1
  })

  //当前登陆用户
  $scope.currentUser = UserService.currentUser

  //跳转时刷新用户管理页面
  $scope.refreshUserPage = function () {
    var url = $location.$$protocol + "://" + $location.$$host + ":" + $location.$$port + "/#!/users"

    var refresh = $window.top.location
    refresh.href = url
    refresh.reload()
  }
}
