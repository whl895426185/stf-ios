var patchArray = require('./../util/patch-array')

module.exports = function DeviceListIconsDirective(
  $filter
, gettext
, DeviceColumnService
, GroupService
, StandaloneService
, $log
, $rootScope
) {
  function DeviceItem() {
    //返回一个Object
    return {
      // build: function() {
      //   var li = document.createElement('li')
      //   li.className = 'cursor-select pointer thumbnail'
      //
      //   // the whole li is a link
      //   var a = document.createElement('a')
      //   li.appendChild(a)
      //
      //   // .device-photo-small
      //   var photo = document.createElement('div')
      //   photo.className = 'device-photo-small'
      //   var img = document.createElement('img')
      //   photo.appendChild(img)
      //   a.appendChild(photo)
      //
      //   // .device-name
      //   var name = document.createElement('div')
      //   name.className = 'device-name'
      //   name.appendChild(document.createTextNode(''))
      //   a.appendChild(name)
      //
      //   // button
      //   var button = document.createElement('button')
      //   button.appendChild(document.createTextNode(''))
      //   a.appendChild(button)
      //
      //   return li
      // }
    build: function() {
        var li = document.createElement('li')
        li.className = 'device-item-huya thumbnail'

        //device-status
        var top = document.createElement('div')
        top.className = 'device-top-huya'
        li.appendChild(top)

        var status = document.createElement('div')
        status.className = 'device-status-huya'
        status.appendChild(document.createTextNode('空闲'))
        top.appendChild(status)

        var a = document.createElement('a')
        var remind = document.createElement('button')
        remind.appendChild(document.createTextNode('立即使用'))
        remind.className = 'pull-right-huya'
        // remind.innerHTML = '立即使用'
        a.appendChild(remind)
        top.appendChild(a)

        //device-name
        var name = document.createElement('div')
        name.className = 'device-name-huya'
        name.appendChild(document.createTextNode(''))
        li.appendChild(name)

        //.device-instruction
        var dl = document.createElement('dl')
        dl.className = 'device-info'
        li.appendChild(dl)

        var dt = document.createElement('dt')
        var photo = document.createElement('div')
        photo.className = 'device-photo-small-huya'
        var img = document.createElement('img')
        img.className = 'huya_ico'
        photo.appendChild(img)
        dt.appendChild(photo)
        dl.appendChild(dt)

        var dd = document.createElement('dd')
        var info = document.createElement('div')
        info.className = 'device-info-huya'
        dd.appendChild(info)
        dl.appendChild(dd)

        var manufacturer = document.createElement('p')
        manufacturer.appendChild(document.createTextNode('品牌: Unknown'))
        var os = document.createElement('p')
        os.appendChild(document.createTextNode('系统: Unknown'))
        var screen = document.createElement('p')
        screen.appendChild(document.createTextNode('分辨率: Unknown'))
        var provider = document.createElement('p')
        provider.appendChild(document.createTextNode('位置： 无'))
        info.appendChild(manufacturer)
        info.appendChild(os)
        info.appendChild(screen)
        info.appendChild(provider)
        return li
      }

    , update: function(li, device) {
        // $log.log('device: ' + angular.toJson(device))

        var top = li.firstChild
        var status = top.firstChild.firstChild
        status.nodeValue = $filter('statusHuya')(device.state)

        if(device.owner && device.state !== 'automation' && device.present === true) {
         status.nodeValue = status.nodeValue + ' by ' + device.owner.name
        }

        var remind = top.firstChild.nextSibling.firstChild.firstChild
        remind.nodeValue = $filter('translate')(device.enhancedStateAction)

        var a = top.firstChild.nextSibling
        //判断设备是否可用
        if (device.usable) {
          a.href = '#!/control/' + device.serial
          a.firstChild.classList.remove('device-is-busy')
        }
        else {
          a.removeAttribute('href')
          a.firstChild.classList.add('device-is-busy')
        }

        var name = top.nextSibling
        var nt = name.firstChild
        nt.nodeValue = device.enhancedName

        var dl = name.nextSibling

        var img = dl.firstChild.firstChild.firstChild
        img.setAttribute('src', device.enhancedImg)

        var dd = dl.firstChild.nextSibling
        var info = dd.firstChild

        var manufactor = info.firstChild
        if(device.manufacturer) {
          manufactor.firstChild.nodeValue = '品牌： ' + device.manufacturer
        }

        var os = manufactor.nextSibling
        if(device.version && device.platform) {
          os.firstChild.nodeValue = '系统： ' + device.platform + ' ' + device.version
        }


        var screen = os.nextSibling
        if(device.display) {
          screen.firstChild.nodeValue = '分辨率：' + device.display.width + '*' + device.display.height
        }

        if(device.provider) {
          var provider = screen.nextSibling
          provider.firstChild.nodeValue = '位置：' + device.provider.name
        }

        return li

      }

    // , update: function(li, device) {
    //     var a = li.firstChild
    //     var img = a.firstChild.firstChild
    //     var name = a.firstChild.nextSibling
    //     var nt = name.firstChild
    //     var button = name.nextSibling
    //     var at = button.firstChild
    //     var classes = 'btn btn-xs device-status '
    //
    //     // .device-photo-small
    //     if (img.getAttribute('src') !== device.enhancedImage120) {
    //       img.setAttribute('src', device.enhancedImage120)
    //     }
    //
    //     // .device-name
    //     nt.nodeValue = device.enhancedName
    //
    //     // button
    //     at.nodeValue = $filter('translate')(device.enhancedStateAction)
    //
    //     function getStateClasses(state) {
    //       var stateClasses = {
    //         using: 'state-using btn-primary',
    //         busy: 'state-busy btn-warning',
    //         available: 'state-available btn-primary-outline',
    //         ready: 'state-ready btn-primary-outline',
    //         present: 'state-present btn-primary-outline',
    //         preparing: 'state-preparing btn-primary-outline btn-success-outline',
    //         unauthorized: 'state-unauthorized btn-danger-outline',
    //         offline: 'state-offline btn-warning-outline',
    //         automation: 'state-automation btn-info'
    //       }[state]
    //       if (typeof stateClasses === 'undefined') {
    //         stateClasses = 'btn-default-outline'
    //       }
    //       return stateClasses
    //     }
    //
    //     button.className = classes + getStateClasses(device.state)
    //
    //     if (device.state === 'available') {
    //       name.classList.add('state-available')
    //     } else {
    //       name.classList.remove('state-available')
    //     }
    //
    //     if (device.usable) {
    //       a.href = '#!/control/' + device.serial
    //       li.classList.remove('device-is-busy')
    //     }
    //     else {
    //       a.removeAttribute('href')
    //       li.classList.add('device-is-busy')
    //     }
    //
    //     return li
    //   }
    }
  }

  return {
    restrict: 'E'
  , template: require('./device-list-icons.pug')
  , scope: {
      tracker: '&tracker'
    , columns: '&columns'
    , sort: '=sort'
    , filter: '&filter'
    }
  , link: function(scope, element) {
      var tracker = scope.tracker()
      // $log.log('tracker.devices: ' + tracker.devices)
      $log.log(element)
      var activeColumns = []
      var activeSorting = []
      var activeFilters = []
      var list = element.find('ul')[0]
      var items = list.childNodes
      var prefix = 'd' + Math.floor(Math.random() * 1000000) + '-'
      // var prefix = ''
      var mapping = Object.create(null)
      var builder = DeviceItem()


      function kickDevice(device, force) {
        return GroupService.kick(device, force).catch(function(e) {
          alert($filter('translate')(gettext('Device cannot get kicked from the group')))
          throw new Error(e)
        })
      }

      function inviteDevice(device) {
        return GroupService.invite(device).then(function() {
          scope.$digest()
        })
      }

      element.on('click', function(e) {

        var id

        //点击'使用'或者'停止使用'按钮
        if(e.target.classList.contains('pull-right-huya')) {
          id = e.target.parentNode.parentNode.parentNode.id
        }

        $log.log('id : ' + id)

        if (id) {
          var device = mapping[id]
          // $log.log('mapping device : ' + angular.toJson(device))

          if (e.altKey && device.state === 'available') {
            $log.log('in inviteDevice')
            inviteDevice(device)
            e.preventDefault()
          }

          if (e.shiftKey && device.state === 'available') {
            StandaloneService.open(device)
            e.preventDefault()
          }

          if (device.using) {
            kickDevice(device)
            e.preventDefault()
          }
        }
      })

      $rootScope.$on('$routeChangeSuccess', function(evt, next, previous) {
        if(previous.params.serial) {
          var id = prefix + previous.params.serial
          if(mapping[id]) {
            kickDevice(mapping[id])
          }

        }


      })

      // Import column definitions
      scope.columnDefinitions = DeviceColumnService

      // Sorting
      scope.sortBy = function(column, multiple) {
        function findInSorting(sorting) {
          for (var i = 0, l = sorting.length; i < l; ++i) {
            if (sorting[i].name === column.name) {
              return sorting[i]
            }
          }
          return null
        }

        var swap = {
          asc: 'desc'
        , desc: 'asc'
        }

        var fixedMatch = findInSorting(scope.sort.fixed)
        if (fixedMatch) {
          fixedMatch.order = swap[fixedMatch.order]
          return
        }

        var userMatch = findInSorting(scope.sort.user)
        if (userMatch) {
          userMatch.order = swap[userMatch.order]
          if (!multiple) {
            scope.sort.user = [userMatch]
          }
        }
        else {
          if (!multiple) {
            scope.sort.user = []
          }
          scope.sort.user.push({
            name: column.name
          , order: scope.columnDefinitions[column.name].defaultOrder || 'asc'
          })
        }
      }

      // Watch for sorting changes
      scope.$watch(
        function() {
          return scope.sort
        }
      , function(newValue) {
          activeSorting = newValue.fixed.concat(newValue.user)
          scope.sortedColumns = Object.create(null)
          activeSorting.forEach(function(sort) {
            scope.sortedColumns[sort.name] = sort
          })
          sortAll()
        }
      , true
      )

      // Watch for column updates
      scope.$watch(
        function() {
          return scope.columns()
        }
      , function(newValue) {
          updateColumns(newValue)
        }
      , true
      )

      // Update now so that we don't have to wait for the scope watcher to
      // trigger.
      updateColumns(scope.columns())

      // Updates visible columns. This method doesn't necessarily have to be
      // the fastest because it shouldn't get called all the time.
      function updateColumns(columnSettings) {
        var newActiveColumns = []

        // Check what we're supposed to show now
        columnSettings.forEach(function(column) {
          if (column.selected) {
            newActiveColumns.push(column.name)
          }
        })

        // Figure out the patch
        var patch = patchArray(activeColumns, newActiveColumns)

        // Set up new active columns
        activeColumns = newActiveColumns

        return patchAll(patch)
      }

      // Updates filters on visible items.
      function updateFilters(filters) {
        // $log.log('updateFilters' + angular.toJson(filters))
        activeFilters = filters
        return filterAll()
      }

      // Applies filteItem() to all items.
      function filterAll() {
        for (var i = 0, l = items.length; i < l; ++i) {
          filterItem(items[i], mapping[items[i].id])
        }
      }

      // Filters an item, perhaps removing it from view.
      function filterItem(item, device) {
        // $log.log(angular.toJson(device))
        // $log.log(match(device))
        // $log.log(item)
        if (match(device)) {
          item.classList.remove('filter-out')
        }
        else {

          item.classList.add('filter-out')
        }
      }

      // Checks whether the device matches the currently active filters.
      function match(device) {
        for (var i = 0, l = activeFilters.length; i < l; ++i) {
          var filter = activeFilters[i]
          var column
          if (filter.field) {
            column = scope.columnDefinitions[filter.field]
            if (column && !column.filter(device, filter)) {
              return false
            }
          }
          else {
            var found = false
            for (var j = 0, k = activeColumns.length; j < k; ++j) {
              column = scope.columnDefinitions[activeColumns[j]]
              if (column && column.filter(device, filter)) {
                found = true
                break
              }
            }
            if (!found) {
              return false
            }
          }
        }
        return true
      }

      // Update now so we're up to date.
      updateFilters(scope.filter())

      // Watch for filter updates.
      scope.$watch(
        function() {
          return scope.filter()
        }
      , function(newValue) {
          updateFilters(newValue)
        }
      , true
      )

      // Calculates a DOM ID for the device. Should be consistent for the
      // same device within the same table, but unique among other tables.
      function calculateId(device) {
        return prefix + device.serial
      }

      // Compares two devices using the currently active sorting. Returns <0
      // if deviceA is smaller, >0 if deviceA is bigger, or 0 if equal.
      var compare = (function() {
        var mapping = {
          asc: 1
        , desc: -1
        }
        return function(deviceA, deviceB) {
          var diff

          // Find the first difference
          for (var i = 0, l = activeSorting.length; i < l; ++i) {
            var sort = activeSorting[i]
            diff = scope.columnDefinitions[sort.name].compare(deviceA, deviceB)
            if (diff !== 0) {
              diff *= mapping[sort.order]
              break
            }
          }

          return diff
        }
      })()

      // Creates a completely new item for the device. Means that this is
      // the first time we see the device.
      function createItem(device) {
        var id = calculateId(device)
        var item = builder.build()

        item.id = id
        builder.update(item, device)
        mapping[id] = device

        return item
      }

      // Patches all items.
      function patchAll(patch) {
        for (var i = 0, l = items.length; i < l; ++i) {
          patchItem(items[i], mapping[items[i].id], patch)
        }
      }

      // Patches the given item by running the given patch operations in
      // order. The operations must take into account index changes caused
      // by previous operations.
      function patchItem(/*item, device, patch*/) {
        // Currently no-op
      }

      // Updates all the columns in the item. Note that the item must be in
      // the right format already (built with createItem() and patched with
      // patchItem() if necessary).
      function updateItem(item, device) {
        $log.log('In updateItem function')
        var id = calculateId(device)

        item.id = id
        builder.update(item, device)

        return item
      }

      // Inserts an item into the table into its correct position according to
      // current sorting.
      function insertItem(item, deviceA) {
        return insertItemToSegment(item, deviceA, 0, items.length - 1)
      }

      // Inserts an item into a segment of the table into its correct position
      // according to current sorting. The value of `hi` is the index
      // of the last item in the segment, or -1 if none. The value of `lo`
      // is the index of the first item in the segment, or 0 if none.
      function insertItemToSegment(item, deviceA, low, high) {
        var total = items.length
        var lo = low
        var hi = high

        if (lo > hi) {
          // This means that `lo` refers to the first item of the next
          // segment (which may or may not exist), and we should put the
          // row before it.
          list.insertBefore(item, lo < total ? items[lo] : null)
        }
        else {
          var after = true
          var pivot = 0
          var deviceB

          while (lo <= hi) {
            pivot = ~~((lo + hi) / 2)
            deviceB = mapping[items[pivot].id]

            var diff = compare(deviceA, deviceB)

            if (diff === 0) {
              after = true
              break
            }

            if (diff < 0) {
              hi = pivot - 1
              after = false
            }
            else {
              lo = pivot + 1
              after = true
            }
          }

          if (after) {
            list.insertBefore(item, items[pivot].nextSibling)
          }
          else {
            list.insertBefore(item, items[pivot])
          }
        }
      }

      // Compares an item to its siblings to see if it's still in the correct
      // position. Returns <0 if the device should actually go somewhere
      // before the previous item, >0 if it should go somewhere after the next
      // item, or 0 if the position is already correct.
      function compareItem(item, device) {
        var prev = item.previousSibling
        var next = item.nextSibling
        var diff

        if (prev) {
          diff = compare(device, mapping[prev.id])
          if (diff < 0) {
            return diff
          }
        }

        if (next) {
          diff = compare(device, mapping[next.id])
          if (diff > 0) {
            return diff
          }
        }

        return 0
      }

      // Sort all items.
      function sortAll() {
        // This could be improved by getting rid of the array copying. The
        // copy is made because items can't be sorted directly.
        var sorted = [].slice.call(items).sort(function(itemA, itemB) {
          return compare(mapping[itemA.id], mapping[itemB.id])
        })

        // Now, if we just append all the elements, they will be in the
        // correct order in the table.
        for (var i = 0, l = sorted.length; i < l; ++i) {
          list.appendChild(sorted[i])
        }
      }

      // Triggers when the tracker sees a device for the first time.
      function addListener(device) {
        var item = createItem(device)
        filterItem(item, device)
        insertItem(item, device)
      }

      // Triggers when the tracker notices that a device changed.
      function changeListener(device) {
        // $log.log('In changeListener : ' + angular.toJson(device))
        var id = calculateId(device)
        var item = list.children[id]

        if (item) {
          // First, update columns
          updateItem(item, device)

          // Maybe the item is not sorted correctly anymore?
          var diff = compareItem(item, device)
          if (diff !== 0) {
            // Because the item is no longer sorted correctly, we must
            // remove it so that it doesn't confuse the binary search.
            // Then we will simply add it back.
            list.removeChild(item)
            insertItem(item, device)
          }
        }
      }

      // Triggers when a device is removed entirely from the tracker.
      function removeListener(device) {
        var id = calculateId(device)
        var item = list.children[id]

        if (item) {
          list.removeChild(item)
        }

        delete mapping[id]
      }

      tracker.on('add', addListener)
      tracker.on('change', changeListener)
      tracker.on('remove', removeListener)

      // Maybe we're already late
      tracker.devices.forEach(addListener)

      scope.$on('$destroy', function() {
        tracker.removeListener('add', addListener)
        tracker.removeListener('change', changeListener)
        tracker.removeListener('remove', removeListener)
      })
    }
  }
}
