(function () {
  'use strict';

  angular
    .module('app')
    .controller('SemPlacaController', SemPlacaController);

  SemPlacaController.$inject = ['$http', '$state', 'toaster', '$rootScope', 'fipeService', 'api'];

  function SemPlacaController($http, $state, toaster, $rootScope, fipeService, api) {
    var vm = this;

    $rootScope.usuario = {
      'data': '',
      'especial': false,
      'modelo': '',
      'preco': '',
      'veiculo': ''
    };

    vm.anoEscolhido = '';
    vm.carregando = true;
    vm.fipePasso = 'passo1';
    vm.franquia = undefined;
    vm.isTaxi = false;
    vm.isUber = false;
    vm.listaAnos = [];
    vm.listaCarros = [];
    vm.listaModelos = [];
    vm.listaMotos = [];
    vm.marcaEscolhida = '';
    vm.modeloEscolhido = '';
    vm.veiculo = '';
    vm.rejeitados = [];

    vm.GetAnos = GetAnos;
    vm.GetModelos = GetModelos;
    vm.GetPreco = GetPreco;

    Activate();

    ////////////////

    function Activate() {
      GetRejeitados();

      fipeService.GetMotos().then(function (resp) {
        vm.listaMotos = resp;
      });
      fipeService.GetCarros().then(function (resp) {
        vm.listaCarros = resp;
        vm.carregando = false;
      });
    }

    function GetAnos() {
      vm.carregando = true;
      var isValido = true;
      var modeloNome = '';
      var marcaNome = '';

      angular.forEach(vm.listaModelos, function (value, key) {
        if (value.codigo == vm.modeloEscolhido) {
          modeloNome = value.nome;
        }
      });

      if ($rootScope.usuario.veiculo == 'AUTOMOVEL') {
        angular.forEach(vm.listaCarros, function (value, key) {
          if (value.codigo == vm.marcaEscolhida) {
            marcaNome = value.nome;
          }
        });
      } else {
        angular.forEach(vm.listaMotos, function (value, key) {
          if (value.codigo == vm.marcaEscolhida) {
            marcaNome = value.nome;
          }
        });
      }

      angular.forEach(vm.rejeitados, function (value, key) {
        if (value.Fabricante == marcaNome) {
          var modeloTeste = modeloNome;
          var modeloRejeitado = value.Modelo;

          modeloTeste = modeloTeste.toUpperCase();
          modeloRejeitado = modeloRejeitado.toUpperCase();

          if (modeloTeste.includes(modeloRejeitado)) {
            toaster.pop({
              type: 'error',
              title: 'Atenção!',
              body: 'Não fazemos cotação para esse modelo de veículo.',
              timeout: 20000
            });
            isValido = false;
          }
        }
      });

      if (isValido) {
        fipeService.Consultar(vm.veiculo + '/marcas/' + vm.marcaEscolhida + '/modelos/' + vm.modeloEscolhido + '/anos').then(function (resp) {
          vm.fipePasso = 'passo4';
          vm.listaAnos = resp;
        });
      }
      vm.carregando = false;
    }

    function GetModelos() {
      vm.carregando = true;
      //Pega o veiculo escolhido(moto ou carro) e o modelo escolhido (atraves da lista de um dos dois) e envia a requisicao 
      fipeService.Consultar(vm.veiculo + '/marcas/' + vm.marcaEscolhida + '/modelos').then(function (resp) {
        vm.listaModelos = resp.modelos;

        if (vm.veiculo == 'carros') {
          $rootScope.usuario.veiculo = 'AUTOMOVEL';
        } else {
          $rootScope.usuario.veiculo = 'MOTOCICLETA';
        }

        vm.fipePasso = 'passo3';
        vm.carregando = false;
      });
    }

    function GetPreco() {
      vm.carregando = true;
      fipeService.Consultar(vm.veiculo + '/marcas/' + vm.marcaEscolhida + '/modelos/' + vm.modeloEscolhido + '/anos/' + vm.anoEscolhido).then(function (resp) {
        var yearsApart = new Date(new Date() - new Date(resp.AnoModelo + '-01-01')).getFullYear() - 1970;
        var fabricante = resp.Marca;
        $rootScope.usuario.preco = resp.Valor;

        if (yearsApart > 20) {
          toaster.pop({
            type: 'error',
            title: 'Atenção!',
            body: 'Não fazemos cotações em veículos com mais de 20 anos.',
            timeout: 50000
          });
          vm.carregando = false;
          return;
        }
        $rootScope.usuario.modelo = resp.Modelo;

        if (vm.isUber || vm.isTaxi) {
          $rootScope.usuario.especial = true;
          vm.carregando = false;
          $state.go('cotacao');
        } else {
          $http.get(api + 'importado?filter=nome,eq,' + fabricante).then(function (resp) {
            var retorno = php_crud_api_transform(resp.data).importado;

            if (retorno.length > 0) {
              $rootScope.usuario.especial = true;
            }

            vm.carregando = false;
            $state.go('cotacao');
          });
        }

      });
    }

    function GetRejeitados() {
      $http.get(api + 'rejeitado').then(function (resp) {
        vm.rejeitados = php_crud_api_transform(resp.data).rejeitado;
      });
    }

  }
})();