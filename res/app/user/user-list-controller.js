module.exports = function UserListCtrl($scope, $http, GroupService, UserService, $window) {

  $scope.resdata = UserService.getUsersList()

  //定义table header
  var defaultColumns = [
    {name: '姓名'}
    , {name: '邮箱'}
    , {name: '所属组'}
    , {name: '创建时间'}
    , {name: '最后登陆时间'}
  ]

  $scope.columns = defaultColumns

  //删除用户信息
  $scope.deleteUser = function(obj) {
    var email = obj[1].name;
    if(email == undefined){
      return alert("参数不正确")
    }
    UserService.deleteUserByEmail(email)
  }

  //当前登陆用户
  $scope.currentUser = UserService.currentUser

  //新增用户信息
  $scope.addUser = function() {
    if(undefined == userinfo){
      return
    }
    var nameParam = userinfo.addName.value
    var emailParam = userinfo.addEmail.value
    var passwordParam = userinfo.addPassword.value

    if(undefined === nameParam || undefined === emailParam || undefined === passwordParam) {
      return
    }

    if(emailParam.indexOf("@") == -1 || emailParam.indexOf(".com") == -1){
      return alert("邮箱格式不正确")
    }

    var data = {
      name: nameParam,
      email: emailParam,
      password: passwordParam,
      ip: $scope.currentUser.ip
    }

    UserService.addUser(data)
  }


  //用户列表查询
  $scope.search = function(){
    $scope.columnDefinitions = []

    if(null == $scope.resdata || $scope.resdata.length == 0){
      $scope.columnDefinitions = UserService.getUsersList()
      return
    }

    var username = ""
    var useremail = ""

    if (null != searchinfo && undefined != searchinfo) {
      username = searchinfo.searchName.value
      useremail = searchinfo.searchEmail.value
    }

    for(var i = 0;i <$scope.resdata.length; i++){
      var data = $scope.resdata[i]
      if(null != username && undefined != username && "" != username){
        var resultName = data[0].name
        if(resultName.indexOf(username) == -1){
          continue
        }
      }
      if(null != useremail && undefined != useremail && "" != useremail){
        var resultEmail = data[1].name
        if(resultEmail.indexOf(useremail) == -1){
          continue
        }
      }
      $scope.columnDefinitions.push(data)
    }
  }


  //重置
  $scope.resetSearch = function () {
    searchinfo.searchName.value = ""
    searchinfo.searchEmail.value = ""
  }

}
