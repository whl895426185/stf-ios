module.exports = function InspectCtrl($scope, $sce, $log) {
  $scope.platform = $scope.device.platform.toLowerCase()
  $scope.id = $scope.device.serial
  $scope.file = 'test'
  $scope.screenresult = 'test'
  $scope.getInspect = function() {
      $scope.control.screendump().then(function(res) {
        $scope.file = res.body.href
        $log.log('file: ' + $scope.file)
        $scope.control.screenshot().then(function(result) {
          $scope.screenresult = result.body.href
          $log.log('screenshoot: ' + result.body.href)
          $scope.$digest()
        })
      })

  }
}
