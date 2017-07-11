(function () {
  'use strict';

  angular
    .module('app')
    .controller('CotacaoController', CotacaoController);

  CotacaoController.$inject = ['$filter', '$http', '$rootScope', '$state', 'api', 'rastreadorCarro', 'rastreadorMoto', 'toaster'];

  function CotacaoController($filter, $http, $rootScope, $state, api, rastreadorCarro, rastreadorMoto, toaster) {
    var vm = this;

    // vm.carregando = true;
    vm.email = undefined;
    vm.envelope = {
      'check': 'umapalavrarealmentemuitograndeparaserlembradafeitapormim',
      'modelo': '',
      'to': '',
      'valorBronze': '',
      'valorCarro': '',
      'valorOuro': '',
      'valorPrata': ''
    };
    vm.hasRastreador = false;
    vm.preco = {
      basico: 'R$29,90',
      bronze: undefined,
      ouro: undefined,
      prata: undefined
    };

    vm.EnviarEmail = EnviarEmail;

    Activate();

    ////////////////

    function Activate() {
      // if (!$rootScope.usuario) {
      //   $state.go('placa');
      // } else {
      //   GetPrecos();
      // }
    }

    function EnviarEmail() {
      vm.envelope.to = vm.email;

      vm.email = undefined;

      $http.post('php/emailCotacao.php', vm.envelope);

      toaster.pop({
        type: 'error',
        body: 'E-mail enviado.',
        timeout: 30000
      });
    }

    function GetPrecos() {
      var filtro = 'Carro';
      var valores = [];
      var valorFipe = $rootScope.usuario.preco.replace('R$ ', ' ');
      valorFipe = valorFipe.replace(',00', ' ');
      valorFipe = parseInt(valorFipe);

      vm.envelope.valorCarro = $rootScope.usuario.preco;
      vm.envelope.modelo = $rootScope.usuario.modelo;

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
                vm.envelope.valorBronze = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Prata':
                vm.preco.prata = value.valor;
                vm.envelope.valorPrata = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Ouro':
                vm.preco.ouro = value.valor;
                vm.envelope.valorOuro = $filter('currency')(value.valor, 'R$ ');
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