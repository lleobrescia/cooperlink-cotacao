(function () {
  'use strict';

  angular
    .module('app')
    .controller('SemPlacaController', SemPlacaController);

  SemPlacaController.$inject = ['$http', '$rootScope', '$state', 'CheckConditionService', 'api', 'fipeService', 'toaster'];

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
  function SemPlacaController($http, $rootScope, $state, CheckConditionService, api, fipeService, toaster) {
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

      fipeService.GetMotos().then(function (resp) {
        vm.listaMotos = resp;
        console.log('Motos carregadas =>', vm.listaMotos);
      });
      fipeService.GetCarros().then(function (resp) {
        vm.listaCarros = resp;
        console.log('Carros carregados =>', vm.listaCarros);
        vm.carregando = false;
      });
    }

    /**
     * @function GetAnos
     * @desc Busca os anos do modelo escolhido. Sai do passo3 e vai para o passo4
     * @memberof SemPlacaController
     */
    function GetAnos() {
      console.info('Passo 3');
      vm.carregando = true;

      fipeService.Consultar(vm.veiculo + '/marcas/' + vm.marcaEscolhida + '/modelos/' + vm.modeloEscolhido + '/anos').then(function (resp) {
        vm.listaAnos  = resp;
        console.log('Anos =>', vm.listaAnos);

        vm.carregando = false;
        vm.fipePasso  = 'passo4';
      }).catch(function (error) {
        toaster.pop({
         type   : 'error',
         title  : 'Erro #802',
         body   : 'Não foi possível completar a requisição.',
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
      console.info('Passo 2');
      vm.carregando = true;
      //Pega o veiculo escolhido(moto ou carro) e o modelo escolhido (atraves da lista de um dos dois) e envia a requisicao
      fipeService.Consultar(vm.veiculo + '/marcas/' + vm.marcaEscolhida + '/modelos').then(function (resp) {
        vm.listaModelos = resp.modelos;

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
         type   : 'error',
         title  : 'Erro #802',
         body   : 'Não foi possível completar a requisição.',
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
      console.info('Passo 4');
      vm.carregando   = true;
      var testeAno    = '';
      var testeModelo = '';

      fipeService.Consultar(vm.veiculo + '/marcas/' + vm.marcaEscolhida + '/modelos/' + vm.modeloEscolhido + '/anos/' + vm.anoEscolhido).then(function (resp) {
        var combustivel = resp.Combustivel;

        //Armazena os dados da consulta para mostrar na tela de cotacao
        $rootScope.usuario.preco            = resp.Valor;
        $rootScope.usuario.preco            = $rootScope.usuario.preco.replace('R$ ','').replace('.','').replace(',00','');
        $rootScope.usuario.modelo           = resp.Modelo;
        $rootScope.usuario.codigoTabelaFipe = resp.CodigoFipe;

         console.log('Preco =>', resp);

        CheckConditionService.Activate(resp.Modelo, resp.Marca, resp.AnoModelo, vm.rejeitados);

        if ($rootScope.usuario.veiculo === 'AUTOMOVEL') {
          console.info('Carro');

          testeAno    = CheckConditionService.CarHasValidYear(); //Valida o ano
          testeModelo = CheckConditionService.CarHasValidModel(); //Valida o modelo

          console.log('Teste Ano =>', testeAno);
          console.log('Teste Modelo =>', testeModelo);

          if (!testeAno || !testeModelo) {
            console.warn('Carro Invalido');
            vm.carregando = false;
            toaster.pop({
              type:    'error',
              title:   'Atenção!',
              body:    'Não é possível fazer cotação para esse veículo.',
              timeout: 50000
            });
          }else{
            if (vm.isUber) {
              console.info('Taxi');
              $rootScope.usuario.taxi = true;
              $state.go('cotacao');

            }else if(combustivel.toUpperCase() === 'DISEL'){
               console.info('Disel');

              $rootScope.usuario.disel = true;
              $state.go('cotacao');
            } else {
              $http.get(api + 'importado?filter=nome,eq,' + resp.Marca).then(function (resp) {
                var retorno = php_crud_api_transform(resp.data).importado;

                if (retorno.length > 0) {
                   console.info('Importado');
                  $rootScope.usuario.importado = true;
                }
                $state.go('cotacao');
              });
            }
          }
        } else if ($rootScope.usuario.veiculo === 'MOTOCICLETA') {
          console.info('Moto');

          testeAno    = CheckConditionService.MotoHasValidYear();
          testeModelo = CheckConditionService.MotoHasValidYear();

          console.log('Teste Ano =>', testeAno);
          console.log('Teste Modelo =>', testeModelo);

          if (!testeAno || !testeModelo) {
            console.warn('Moto Invalida');

            vm.carregando = false;
            toaster.pop({
              type:    'error',
              title:   'Atenção!',
              body:    'Não é possível fazer cotação para esse veículo.',
              timeout: 50000
            });
          }else{
            $state.go('cotacao');
          }
        }
      }).catch(function (error) {
        toaster.pop({
         type   : 'error',
         title  : 'Erro #802',
         body   : 'Não foi possível completar a requisição.',
         timeout: 50000
       });
       console.warn('Erro passo 4 = >' + error);
     });
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