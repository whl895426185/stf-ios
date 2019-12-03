var React = require('react')
var ReactDom = require('react-dom')
var APP = require('./components/index.jsx')
const e = React.createElement

module.exports = function HuyaInspectorTabDirective($log) {
  return {
    restrict: 'E'
   , scope: {
       platform: '='
     , img: '='
     , file: '='
     , id: '='
    }
   , link: function(scope, element) {
      $log.log('init file: ' + scope.file)
      $log.log('init img: ' + scope.img)

      var isIOS = scope.platform === 'ios'
      $log.log('isIOS: ' + isIOS)
      $log.log('id: ' + scope.id)

      scope.$watch(
        function() {
          return scope.img
        }
      , function(newValue) {

          $log.log('new img watch: ' + newValue)
          scope.img = newValue
            $log.log('img改变，重新加载')
            ReactDom.render(React.createElement(APP, {isIOS: scope.isIOS, img: scope.img,
              jsonFile: scope.file, id: scope.id}), element[0])
        }
      , true
      )

      scope.$watch(
        function() {
          return scope.file
        }
      , function(newValue) {
          $log.log('new dumpFile watch: ' + newValue)
          scope.file = newValue
            $log.log('file改变，重新加载')
            ReactDom.render(React.createElement(APP, {isIOS: isIOS, img: scope.img,
              jsonFile: scope.file, id: scope.id}), element[0])
        }
      , true
      )
    }
  }

}
