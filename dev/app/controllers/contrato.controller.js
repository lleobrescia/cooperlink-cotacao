(function () {
  'use strict';

  angular
    .module('app')
    .controller('ContratoController', ContratoController);

  ContratoController.$inject = ['$http', '$rootScope', '$state', 'api'];

  function ContratoController($http, $rootScope, $state, api) {
    var vm = this;


    vm.Contratar = Contratar;

    Activate();

    ////////////////

    function Activate() {
      console.log($rootScope);
      if (!$rootScope.usuario) {
        $state.go('placa');
      }
    }

    function Contratar() {
      $state.go('checkout');
    }
  }
})();