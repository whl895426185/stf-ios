require('./inspect.css')

module.exports = angular.module('stf.inspect', [

])
  .run(['$templateCache', function($templateCache) {
    $templateCache.put('control-panes/inspect/inspect.pug',
      require('./huya-inspect.pug')
    )
  }])
  .directive('huyaInspectorTab', require('./huya-inspector-tab-directive'))
  .controller('InspectCtrl', require('./inspect-controller'))

