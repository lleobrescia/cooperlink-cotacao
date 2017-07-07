(function () {
  'use strict';

  angular
    .module('app')
    .controller('PlacaController', PlacaController);

  PlacaController.$inject = ['$http', '$rootScope', '$state', 'CheckConditionService', 'api', 'conversorService', 'toaster'];

  /**
   * @ngdoc controller
   * @scope {}
   * @name PlacaController
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Verifica a placa do usuario e recebe o valor da tabela Fipe
   * 
   * @property {object}   vm                 - A named variable for the `this` keyword representing the ViewModel
   * @property {json}     consulta           - Dados para consulta na Chekauto
   * @property {json}     $rootScope.usuario - Dados do veiculo do usuario
   * @property {boolean}  vm.carregando      - Usado para controlar o loading
   * @property {boolean}  vm.isTaxi          - Usado para saber se o carro eh um taxi
   * @property {boolean}  vm.isUber          - Usado para saber se o carro eh uber
   * @property {string}   vm.placa           - Placa do carro
   * @property {json}     vm.rejeitados      - Lista de carros rejeitados
   * 
   * @param {service}  $http                   - Usado para comunicação HTTP {@link https://docs.angularjs.org/api/ng/service/$http}
   * @param {service}  $rootScope              - Escopo principal do angular {@link https://docs.angularjs.org/api/ng/service/$rootScope}
   * @param {service}  $state                  - Status da transição {@link https://github.com/angular-ui/ui-router/wiki/Quick-Reference#state-1}
   * @param {service}  CheckConditionService   - Servico para velidação do veículo (Veja fipeService.service.js)
   * @param {constant} api                     - url do api
   * @param {service}  conversorService        - Converte xml para json e virce versa
   * @param {service}  toaster                 - Seviço para mostrar mensagens
   * 
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/controller} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#controllers} Para melhores praticas
   */
  function PlacaController($http, $rootScope, $state, CheckConditionService, api, conversorService, toaster) {
    var vm = this;
    var consulta = {
      "xml": {
        "CONSULTA": {
          "ACESSO": {
            "USUARIO": null,
            "SENHA": null
          },
          "VEICULO": {
            "CHASSI": null,
            "UF": null,
            "PLACA": null,
            "RENAVAM": null,
            "MOTOR": null,
            "CRLV": null,
            "UF_CRLV": null
          },
          "DADOSPESSOAIS": {
            "TIPOPESSOARESTRICOES": null,
            "CPFCNPJRESTRICOES": null,
            "DDD1RESTRICOES": null,
            "TEL1RESTRICOES": null,
            "DDD2RESTRICOES": null,
            "TEL2RESTRICOES": null
          },
          "PERMISSOES": {
            "CONTRATOID": null,
            "PACOTEID": null,
            "OPCIONAIS": {
              "Precificador": null
            }
          },
          "CONSULTAID": null,
          "NRCONTROLECLIENTE": null
        }
      }
    };

    $rootScope.usuario = {
      'data':     '',
      'especial': false,
      'modelo':   '',
      'preco':    '',
      'veiculo':  ''
    };

    vm.carregando = false;
    vm.isTaxi     = false;
    vm.isUber     = false;
    vm.placa      = '';
    vm.rejeitados = [];

    /**
     * Atribuição das funções no escopo
     */
    vm.GetDadosRequisicao = GetDadosRequisicao;

    Activate();

    ////////////////

    /**
     * @function Activate
     * @desc Setup docontrolador. Exetuca assim que o controlador inicia
     * @memberof PlacaController
     */
    function Activate() {
      GetRejeitados();
    }

    /**
     * @function GetDadosRequisicao
     * @desc Pega os dados para a autorização da consulta, coloca-os no json consulta e depois executa PesquisarPlaca
     * @memberof PlacaController
     */
    function GetDadosRequisicao() {
      vm.carregando = true;

      /**
       * Pega os dados para fazer a requisição.
       * Eles ficam no PHP para dificultar a visualização de pessoas nao autorizadas.
       */
      $http({
        method: 'GET',
        url: 'php/dados.php'
      }).then(function (resp) {
        consulta.xml.CONSULTA.ACESSO.SENHA          = resp.data.senha;
        consulta.xml.CONSULTA.ACESSO.USUARIO        = resp.data.usuario;
        consulta.xml.CONSULTA.PERMISSOES.CONTRATOID = resp.data.contrato;
        consulta.xml.CONSULTA.PERMISSOES.PACOTEID   = resp.data.pacote;

        PesquisarPlaca(resp.data.url);
      });
    }

    /**
     * @function GetDadosRequisicao
     * @desc Pega os veiculos rejeitados no banco de dados
     * @memberof PlacaController
     */
    function GetRejeitados() {
      $http.get(api + 'rejeitado').then(function (resp) {
        vm.rejeitados = php_crud_api_transform(resp.data).rejeitado;
      });
    }

    /**
     * @function PesquisarPlaca
     * @desc Armazena a plca do usuario no json consulta, converte json para xml, pois o serviço
     * só aceita xml e envia a requisição.
     * @param {string} url - url do sistema Chekauto para requisição
     * @memberof PlacaController
     */
    function PesquisarPlaca(url) {
      var xml = '';

      consulta.xml.CONSULTA.VEICULO.PLACA = vm.placa;
      xml                                 = conversorService.Json2Xml(consulta);

      $.get(url + xml, function (data) {
        var ano               = ''; //Ano do modelo
        var codigoConsulta    = ''; //Usado para validar a consulta
        var codigoRetornoFipe = ''; // Usado para validar o acesso à tabela fipe
        var especieVeiculo    = ''; //Usado para verificar se eh taxi
        var fabricante        = ''; // Fabricante do veiculo
        var fipe              = ''; //Armazena os dados da tabela fipe
        var isValido          = true; //Usado para validar o processo todo
        var retorno           = $(data).find('string'); // Recebe a resposta do servico
        var testeAno          = ''; // Usado para verificar se o ano eh aceito
        var testeModelo       = ''; //Usado para verificar se o modelo eh aceito
        var veiculo           = ''; // Usado para ver qual o tipo de veiculo (moto ou carro) 

        retorno = $.parseXML(retorno[0].textContent); // Converte string xml para objeto xml

        ano               = $(retorno).find('Veiculo').find('RegistroFederal').find('AnoModelo')[0].textContent;
        codigoConsulta    = $(retorno).find('ConsultaID')[0].textContent;
        codigoRetornoFipe = $(retorno).find('Precificador').find('TabelaFipe').find('CodigoRetorno')[0].textContent;
        especieVeiculo    = $(retorno).find('RegistroFederal').find('EspecieVeiculo')[0].textContent;
        fipe              = $(retorno).find('Precificador').find('TabelaFipe').find('Registro')[$(retorno).find('Precificador').find('TabelaFipe').find('Registro').length - 1];
        fabricante        = $(fipe).find('Fabricante')[0].textContent;
        veiculo           = $(retorno).find('RegistroFederal').find('TipoVeiculo')[0].textContent;

        //Armazenamento para consultas em outros controladores
        $rootScope.usuario.data    = $(retorno).find('DataHoraConsulta')[0].textContent;
        $rootScope.usuario.modelo  = $(fipe).find('Modelo')[0].textContent;
        $rootScope.usuario.preco   = 'R$ ' + $(fipe).find('Valor')[0].textContent + ',00';
        $rootScope.usuario.veiculo = veiculo;

        //Setup do servico de validação
        CheckConditionService.Activate($rootScope.usuario.modelo, fabricante, ano, vm.rejeitados);

        //Se a consulta falhou envia o usuario para a preencher os dados do carro
        if (codigoConsulta !== '0001') {
          $state.go('fipe');
        }

        //Não da proseguimento se não for moto ou carro
        if (veiculo != 'AUTOMÓVEL' && veiculo != 'MOTOCICLETA') {
          isValido = false;
        }

        if (veiculo == 'AUTOMÓVEL') {
          testeAno    = CheckConditionService.CarHasValidYear(); //Valida o ano
          testeModelo = CheckConditionService.CarHasValidModel(); //Valida o modelo

          if (!testeAno) {
            isValido = false;
          }

          if (!testeModelo) {
            isValido = false;
          }
        } else if (veiculo == 'MOTOCICLETA') {
          testeAno    = CheckConditionService.MotoHasValidYear();
          testeModelo = CheckConditionService.MotoHasValidYear();

          if (!testeAno) {
            isValido = false;
          }
          if (!testeModelo) {
            isValido = false;
          }
        }

        //Verifica se o carro eh taxi
        if (especieVeiculo != 'PASSAGEIRO' && especieVeiculo != 'NAO INFORMADO') {
          vm.carregando = false;
          vm.isTaxi     = true;
        }

        //Nao ha dados da tabela fipe. Entao envia o usuario para a preencher os dados do carro
        if (codigoRetornoFipe !== '1') {
          vm.carregando = false;
          $state.go('fipe');
        }

        /**
         * Se o carro eh uber ou o taxi o modelo eh especial
         */
        if (vm.isUber || vm.isTaxi) {
          $rootScope.usuario.especial = true;
          vm.carregando = false;

          if (isValido) {
            //Se nao houve erro, da continuidade 
            $state.go('cotacao');
          } else {
            //Houve algum erro no porcesso. O vaiculo nao eh aceito
            toaster.pop({
              type:    'error',
              title:   'Atenção!',
              body:    'Não é possível fazer cotação para esse veículo.',
              timeout: 50000
            });
          }

        } else {
          $http.get(api + 'importado?filter=nome,eq,' + fabricante).then(function (resp) {
            var retorno = php_crud_api_transform(resp.data).importado;

            if (retorno.length > 0) {
              $rootScope.usuario.especial = true;
            }

            vm.carregando = false;

            if (isValido) {
              $state.go('cotacao');
            } else {
              toaster.pop({
                type:    'error',
                title:   'Atenção!',
                body:    'Não é possível fazer cotação para esse veículo.',
                timeout: 50000
              });
            }
          });
        }
      });
    }
  }
})();