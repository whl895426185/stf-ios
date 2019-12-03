module.exports = function RemoteDebugCtrl($scope, $timeout, gettext) {
  function startRemoteConnect() {
    if ($scope.control) {
      $scope.control.startRemoteConnect().then(function(result) {
        var url = result.lastData
        var command = 'adb connect ' + url
        if(result.device.platform=='iOS'){
          command = '1.安装socat：brew install socat\n'
          command += '2.mv /var/run/usbmuxd /var/run/usbmuxx\n'
          command += '3.socat UNIX-LISTEN:/var/run/usbmuxd,mode=777,reuseaddr,fork TCP:'+url+'\n'
          command += '最后，使用完成后需要把usbmuxd恢复：mv /var/run/usbmuxx /var/run/usbmuxd'
        }
        $scope.$apply(function() {
          $scope.debugCommand = command
        })
      })

      return true
    }
    return false
  }

  // TODO: Remove timeout and fix control initialization
  if (!startRemoteConnect()) {
    $timeout(function() {
      if (!startRemoteConnect()) {
        $timeout(startRemoteConnect, 1000)
      }
    }, 200)
  }

  $scope.$watch('platform', function(newValue) {
    if (newValue === 'native') {
      $scope.remoteDebugTooltip =
        gettext('Run the following on your command line to debug the device from your IDE')
    } else {
      $scope.remoteDebugTooltip =
        gettext('Run the following on your command line to debug the device from your Browser')
    }

  })

}
