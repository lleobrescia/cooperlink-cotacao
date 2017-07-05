(function () {
  'use strict';

  angular
    .module('app')
    .controller('CotacaoController', CotacaoController);

  CotacaoController.$inject = ['$rootScope', '$state'];

  function CotacaoController($rootScope, $state) {
    var vm = this;

    vm.preco = {
      basico: 'R$29,90',
      bronze: undefined,
      ouro: undefined,
      prata: undefined
    };
    Activate();

    ////////////////

    function Activate() {
      if (!$rootScope.usuario) {
        $state.go('placa');
      }
    }
  }
})();