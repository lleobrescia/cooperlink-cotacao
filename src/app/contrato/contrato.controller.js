(function () {
  'use strict';

  angular
    .module('app')
    .controller('ContratoController', ContratoController);

  ContratoController.$inject = ['$http', '$rootScope', '$state', 'api', 'projectDev'];

  function ContratoController($http, $rootScope, $state, api, projectDev) {
    var vm = this;


    vm.Contratar = Contratar;

    Activate();

    ////////////////

    function Activate() {
      if (!$rootScope.usuario) {
        $state.go('placa');
      }
    }

    function Contratar() {
      vm.carregando = true;

      var dados = {
        'bairro': $rootScope.usuario.bairro,
        'cep': $rootScope.usuario.cep,
        'cidade': $rootScope.usuario.cidade,
        'complemento': $rootScope.usuario.complemento,
        'cpf': $rootScope.usuario.cpf,
        'estado': $rootScope.usuario.estado,
        'logradouro': $rootScope.usuario.logradouro,
        'numero': $rootScope.usuario.numero
      };

      var cliente = {
        'idRegiao': $rootScope.usuario.idRegiao,
        'idDados': '',
        'email': $rootScope.usuario.email,
        'nome': $rootScope.usuario.nome,
        'ip': ''
      };

      var produto = {
        'adesao': $rootScope.usuario.adesao,
        'ano': $rootScope.usuario.ano,
        'codigoFipe': $rootScope.usuario.codigoTabelaFipe,
        'disel': $rootScope.usuario.disel ? 1 : 0,
        'especial': $rootScope.usuario.especial ? 1 : 0,
        'fabricante': $rootScope.usuario.fabricante,
        'idCliente': '',
        'importado': $rootScope.usuario.importado ? 1 : 0,
        'mensalidade': $rootScope.usuario,
        'modelo': $rootScope.usuario.modelo,
        'opcionais': $rootScope.usuario.opcionais,
        'plano': $rootScope.usuario.plano,
        'trabalho': $rootScope.usuario.taxi ? 1 : 0,
        'valorFipe': $rootScope.usuario.preco,
        'veiculo': $rootScope.usuario.veiculo
      };

      $http.get(projectDev + 'php/ipvisitor.php').then(function (resp) {
        $rootScope.usuario.ip = cliente.ip = resp.data;

        $http.post(api + 'cp_dados', dados).then(function (respDados) {
          cliente.idDados = respDados.data;

          $http.post(api + 'cp_cliente', cliente).then(function (respCliente) {
            produto.idCliente = respCliente.data;

            $http.post(api + 'cp_produto', produto).then(function (respProduto) {
              $rootScope.usuario.idProduto = respProduto.data;
              vm.carregando = false;
              $state.go('checkout');
            });
          });
        });
      });
    }
  }
})();