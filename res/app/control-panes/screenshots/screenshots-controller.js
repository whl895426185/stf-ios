module.exports = function ScreenshotsCtrl($scope, $log) {
  $scope.screenshots = []
  $scope.screenShotSize = 400

  $scope.clear = function() {
    $scope.screenshots = []
  }

  $scope.shotSizeParameter = function(maxSize, multiplier) {
    var finalSize = $scope.screenShotSize * multiplier
    var finalMaxSize = maxSize * multiplier

    return (finalSize === finalMaxSize) ? '' :
    '?crop=' + finalSize + 'x'
  }

  $scope.takeScreenShot = function() {
    $scope.control.screenshot().then(function(result) {
      // $log.log('screenshoot result: ' + angular.toJson(result))
      $scope.$apply(function() {
        $scope.screenshots.unshift(result)
        // $log.log('screenshots: ' + angular.toJson($scope.screenshots))
      })
    })
  }

  $scope.zoom = function(param) {
    var newValue = parseInt($scope.screenShotSize, 10) + param.step
    if (param.min && newValue < param.min) {
      newValue = param.min
    } else if (param.max && newValue > param.max) {
      newValue = param.max
    }
    $scope.screenShotSize = newValue
  }
}
