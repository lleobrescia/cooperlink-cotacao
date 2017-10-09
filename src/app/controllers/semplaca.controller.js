(function () {
  'use strict';

  angular
    .module('app')
    .controller('SemPlacaController', SemPlacaController);

  SemPlacaController.$inject = ['$http', '$rootScope', '$state','$window', 'CheckConditionService', 'api', 'fipeService', 'toaster'];

  /**
   * @ngdoc controller
   * @scope {}
   * @name SemPlacaController
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Force opções de veiculos para o usuario escolher a que se adequa a ele e retornar o valor na tabela Fipe
   *
   * @property {object}   vm                  - A named variable for the `this` keyword representing the ViewModel
   * @property {json}     $rootScope.usuario  - Dados do veiculo do usuario
   * @property {string}   vm.anoEscolhido     - Ano do veiculo
   * @property {boolean}  vm.carregando       - Usado para controlar o loading
   * @property {string}   vm.fipePasso        - Usado para controlar as telas que aparecem
   * @property {string}   vm.isUber           - Usado para saber se o carro eh uber
   * @property {json}     vm.listaAnos        - Lista dos anos do modelo escolhido
   * @property {json}     vm.listaCarros      - Lista de carros para escolher
   * @property {json}     vm.listaModelos     - Lista de modelos de veiculos
   * @property {json}     vm.listaMotos       - Lista de motos
   * @property {string}   vm.marcaEscolhida   - Fabricante do veiculo escolhido
   * @property {string}   vm.modeloEscolhido  - Modelo do fabricante escolhido
   * @property {string}   vm.veiculo          - Veiculo escolhido
   * @property {json}     vm.rejeitados       - Lista de carros rejeitados
   *
   * @param {service}  $http                   - Usado para comunicação HTTP {@link https://docs.angularjs.org/api/ng/service/$http}
   * @param {service}  $rootScope              - Escopo principal do angular {@link https://docs.angularjs.org/api/ng/service/$rootScope}
   * @param {service}  $state                  - Status da transição {@link https://github.com/angular-ui/ui-router/wiki/Quick-Reference#state-1}
   * @param {service}  CheckConditionService   - Servico para velidação do veículo (Veja fipeService.service.js)
   * @param {constant} api                     - url do api
   * @param {service}  fipeService             - Serviço para consulta na tabela fipe
   * @param {service}  toaster                 - Seviço para mostrar mensagens
   *
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/controller} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#controllers} Para melhores praticas
   */
  function SemPlacaController($http, $rootScope, $state, $window, CheckConditionService, api, fipeService, toaster) {
    var vm = this;

    $rootScope.usuario = {
      'codigoTabelaFipe': '',
      'data'            : '',
      'disel'           : false,
      'importado'       : false,
      'modelo'          : '',
      'preco'           : '',
      'taxi'            : false,
      'veiculo'         : ''
    };

    vm.altura          = $window.innerHeight;
    vm.anoEscolhido    = '';
    vm.carregando      = true;
    vm.fipePasso       = 'passo1';
    vm.isUber          = false;
    vm.listaAnos       = [];
    vm.listaCarros     = [];
    vm.listaModelos    = [];
    vm.listaMotos      = [];
    vm.marcaEscolhida  = '';
    vm.modeloEscolhido = '';
    vm.veiculo         = '';
    vm.rejeitados      = [];

    /**
     * Atribuição das funções no escopo
     */
    vm.GetAnos    = GetAnos;
    vm.GetModelos = GetModelos;
    vm.GetPreco   = GetPreco;

    Activate();

    ////////////////

    /**
     * @function Activate
     * @desc Setup docontrolador. Exetuca assim que o controlador inicia
     * @memberof SemPlacaController
     */
    function Activate() {
      GetRejeitados();

      $http.get(api + 'fp_marca').then(function (resp) {
        var resposta = php_crud_api_transform(resp.data).fp_marca;

        angular.forEach(resposta, function (value, key) {
          if (value.tipo == '1') {
            vm.listaCarros.push(value);
          } else {
            vm.listaMotos.push(value);
          }
        });
        console.log('Carros', vm.listaCarros);
        console.log('Motos', vm.listaMotos);
        vm.carregando = false;
      }).catch(function (error) {
        toaster.pop({
          type:    'error',
          title:   'Erro #802',
          body:    'Não foi possível completar a requisição.',
          timeout: 50000
        });
        console.warn('Passo 1 = >' + error);
      });
    }

    /**
     * @function GetAnos
     * @desc Busca os anos do modelo escolhido. Sai do passo3 e vai para o passo4
     * @memberof SemPlacaController
     */
    function GetAnos() {
      vm.modeloEscolhido = angular.fromJson(vm.modeloEscolhido);

      console.info('Passo 3');
      vm.carregando = true;

      $http.get(api + 'fp_ano?filter=codigo_modelo,eq,' + vm.modeloEscolhido.codigo_modelo).then(function (resp) {
        vm.listaAnos = php_crud_api_transform(resp.data).fp_ano;
        console.log('Anos =>', vm.listaAnos);

        vm.carregando = false;
        vm.fipePasso = 'passo4';
      }).catch(function (error) {
        toaster.pop({
          type:    'error',
          title:   'Erro #802',
          body:    'Não foi possível completar a requisição.',
          timeout: 50000
        });
        console.warn('Passo 3 = >' + error);
      });

    }

    /**
     * @function GetModelos
     * @desc Busca os modelos baseado no veiculo e fabricante escolhidos. Sai do passo2 e vai para o passo3
     * @memberof SemPlacaController
     */
    function GetModelos() {
      vm.marcaEscolhida = angular.fromJson(vm.marcaEscolhida);
      console.info('Passo 2');
      console.info('Marca escolhida ', vm.marcaEscolhida);

      vm.carregando = true;
      //Pega o veiculo escolhido(moto ou carro) e o modelo escolhido (atraves da lista de um dos dois) e envia a requisicao
      $http.get(api + 'fp_modelo?filter=codigo_marca,eq,' + vm.marcaEscolhida.codigo_marca).then(function (resp) {
        vm.listaModelos = php_crud_api_transform(resp.data).fp_modelo;

        console.log('Modelos =>', vm.listaModelos);

        if (vm.veiculo === 'carros') {
          $rootScope.usuario.veiculo = 'AUTOMOVEL';
        } else {
          $rootScope.usuario.veiculo = 'MOTOCICLETA';
        }

        console.log('Veiculo =>', $rootScope.usuario.veiculo);

        vm.fipePasso  = 'passo3';
        vm.carregando = false;
      }).catch(function (error) {
        toaster.pop({
          type:    'error',
          title:   'Erro #802',
          body:    'Não foi possível completar a requisição.',
          timeout: 50000
        });
        console.warn('Erro passo2 = >' + error);
      });
    }

    /**
     * @function GetPreco
     * @desc Ultimo passo antes de mostrar a cotação. Busca o valor na tabela fipe, verifica se o modelo é aceitavel
     * @memberof SemPlacaController
     */
    function GetPreco() {
      vm.anoEscolhido = angular.fromJson(vm.anoEscolhido);
      
      console.info('Passo 4');
      console.info('Ano escolhido ',vm.anoEscolhido);
      vm.carregando = true;

      var ano = vm.anoEscolhido.ano;
      var marca = vm.marcaEscolhida.marca;
      var modelo = vm.modeloEscolhido.modelo;
      var testeAno = '';
      var testeModelo = '';

      var combustivel = vm.anoEscolhido.combustivel;

      //Armazena os dados da consulta para mostrar na tela de cotacao
      $rootScope.usuario.preco = vm.anoEscolhido.valor.toString();
      $rootScope.usuario.modelo = vm.modeloEscolhido.modelo;
      $rootScope.usuario.codigoTabelaFipe = vm.anoEscolhido.codigo_fipe;

      CheckConditionService.Activate(modelo, marca, ano, vm.rejeitados);

      if ($rootScope.usuario.veiculo === 'AUTOMOVEL') {
        console.info('Carro');

        testeAno = CheckConditionService.CarHasValidYear(); //Valida o ano
        testeModelo = CheckConditionService.CarHasValidModel(); //Valida o modelo

        console.log('Teste Ano =>', testeAno);
        console.log('Teste Modelo =>', testeModelo);

        if (!testeAno || !testeModelo) {
          console.warn('Carro Invalido');
          vm.carregando = false;
          toaster.pop({
            type: 'error',
            title: 'Atenção!',
            body: 'Não é possível fazer cotação para esse veículo.',
            timeout: 50000
          });
        } else {
          if (vm.isUber) {
            console.info('Taxi');
            $rootScope.usuario.taxi = true;
            $state.go('cotacao');

          } else if (combustivel.toUpperCase() === 'DISEL') {
            console.info('Disel');

            $rootScope.usuario.disel = true;
            $state.go('cotacao');
          } else {
            $http.get(api + 'importado').then(function (resp) {
              var retorno = php_crud_api_transform(resp.data).importado;
              var isImportado = false;//marca

              angular.forEach(retorno, function (value, key) {
                var upperImportado = value.nome.toUpperCase();

                if (marca.toUpperCase() == upperImportado) {
                  isImportado = true;
                }
              });

              if (isImportado) {
                console.info('Importado');
                $rootScope.usuario.importado = true;
              }
              $state.go('cotacao');
            });
          }
        }
      } else if ($rootScope.usuario.veiculo === 'MOTOCICLETA') {
        console.info('Moto');

        testeAno = CheckConditionService.MotoHasValidYear();
        testeModelo = CheckConditionService.MotoHasValidYear();

        console.log('Teste Ano =>', testeAno);
        console.log('Teste Modelo =>', testeModelo);

        if (!testeAno || !testeModelo) {
          console.warn('Moto Invalida');

          vm.carregando = false;
          toaster.pop({
            type: 'error',
            title: 'Atenção!',
            body: 'Não é possível fazer cotação para esse veículo.',
            timeout: 50000
          });
        } else {
          $state.go('cotacao');
        }
      }
    }

    /**
     * @function GetRejeitados
     * @desc Busca no banco de dados os veiculos rejeitados
     * @memberof SemPlacaController
     */
    function GetRejeitados() {
      $http.get(api + 'rejeitado').then(function (resp) {
        vm.rejeitados = php_crud_api_transform(resp.data).rejeitado;
      });
    }
  }
})();