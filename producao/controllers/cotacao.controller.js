(function () {
  'use strict';

  angular
    .module('app')
    .controller('CotacaoController', CotacaoController);

  CotacaoController.$inject = ['$rootScope', '$state', 'rastreadorCarro', 'rastreadorMoto', '$http', 'api'];

  function CotacaoController($rootScope, $state, rastreadorCarro, rastreadorMoto, $http, api) {
    var vm = this;

    vm.carregando = true;
    vm.hasRastreador = false;
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
      } else {
        GetPrecos();
      }
    }

    function GetPrecos() {
      var filtro = 'Carro';
      var valores = [];
      var valorFipe = $rootScope.usuario.preco.replace('R$ ', ' ');
      valorFipe = valorFipe.replace(',00', ' ');
      valorFipe = parseInt(valorFipe);

      console.log($rootScope.usuario);

      if ($rootScope.usuario.veiculo === 'AUTOMÓVEL') {

        if (valorFipe > rastreadorCarro) {
          vm.hasRastreador = true;
        }

        if ($rootScope.usuario.especial) {
          filtro = 'Especial';
        }
      } else {
        filtro = 'Moto';
        if (valorFipe > rastreadorMoto) {
          vm.hasRastreador = true;
        }
      }

      $http.get(api + 'preco?filter=veiculo,eq,' + filtro).then(function (resp) {
        valores = php_crud_api_transform(resp.data).preco;
        
        angular.forEach(valores, function (value, key) {
          if (valorFipe >= parseInt(value.min) && valorFipe <= parseInt(value.max)) {
            switch (value.plano) {
              case 'Bronze':
                vm.preco.bronze = value.valor;
                break;

              case 'Prata':
                vm.preco.prata = value.valor;
                break;

              case 'Ouro':
                vm.preco.ouro = value.valor;
                break;

              default:
                break;
            }
          }
        });
        vm.carregando = false;
      });
    }
  }
})();