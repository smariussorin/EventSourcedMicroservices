'use strict';

app
  .directive('navCollapse', function () {
    return {
      restrict: 'A',
      link: function($scope, $el) {

        var $dropdowns = $el.find('ul').parent('li'),
            $a = $dropdowns.children('a'),
            $notDropdowns = $el.children('li').not($dropdowns),
            $notDropdownsLinks = $notDropdowns.children('a'),
            app = angular.element('.appWrapper'),
            sidebar = angular.element('#sidebar'),
            controls = angular.element('#controls');

        $dropdowns.addClass('dropdown');

        var $submenus = $dropdowns.find('ul >.dropdown');
        $submenus.addClass('submenu');

        $a.append('<i class="fa fa-plus"></i>');

        $a.on('click', function(event) {
          if (app.hasClass('sidebar-sm') || app.hasClass('sidebar-xs') || app.hasClass('hz-menu')) {
            return false;
          }

          var $this = angular.element(this),
              $parent = $this.parent('li'),
              $openSubmenu = angular.element('.submenu.open');

          if (!$parent.hasClass('submenu')) {
            $dropdowns.not($parent).removeClass('open').find('ul').slideUp();
          }

          $openSubmenu.not($this.parents('.submenu')).removeClass('open').find('ul').slideUp();
          $parent.toggleClass('open').find('>ul').stop().slideToggle();
          event.preventDefault();
        });

        $dropdowns.on('mouseenter', function() {
          sidebar.addClass('dropdown-open');
          controls.addClass('dropdown-open');
        });

        $dropdowns.on('mouseleave', function() {
          sidebar.removeClass('dropdown-open');
          controls.removeClass('dropdown-open');
        });

        $notDropdownsLinks.on('click', function() {
          $dropdowns.removeClass('open').find('ul').slideUp();
        });

        var $activeDropdown = angular.element('.dropdown>ul>.active').parent();

        $activeDropdown.css('display', 'block');

      }
    };
  });
