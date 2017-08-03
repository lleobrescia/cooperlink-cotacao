(function () {
  'use strict';

  angular
    .module('app')
    .controller('ContratoController', ContratoController);

  ContratoController.$inject = ['$http', '$rootScope', '$state', 'api'];

  function ContratoController($http, $rootScope, $state, api) {
    var vm = this;


    Activate();

    ////////////////

    function Activate() {
      console.log($rootScope);
    }
  }
})();