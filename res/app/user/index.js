require('./user-list.css')

module.exports = angular.module('user-list', [
  require('stf/user').name,
  require('stf/user/group').name,
  require('stf/common-ui').name,
])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/users', {
        controller: 'UserListCtrl',
        template: require('./user-list.pug')
      })
  }])
  .run(function(editableOptions) {
    editableOptions.theme = 'bs3'
  })
  .controller('UserListCtrl', require('./user-list-controller'))



