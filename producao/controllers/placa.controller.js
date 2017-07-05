(function () {
  'use strict';

  angular
    .module('app')
    .controller('PlacaController', PlacaController);

  PlacaController.$inject = ['$http', 'conversorService', '$state', 'toaster', '$rootScope', 'api'];

  function PlacaController($http, conversorService, $state, toaster, $rootScope, api) {
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

    $rootScope.preco = {
      basico: 'R$29,90',
      bronze: undefined,
      ouro: undefined,
      prata: undefined
    };
    $rootScope.usuario = {
      'data': '',
      'especial': false,
      'modelo': '',
      'preco': '',
      'veiculo': ''
    };

    vm.carregando = false;
    vm.isTaxi = false;
    vm.isUber = false;
    vm.placa = '';
    vm.rejeitados = [];

    vm.GetDadosRequisicao = GetDadosRequisicao;

    Activate();

    ////////////////

    function Activate() {
      GetRejeitados();
    }

    /**
     * @function GetDadosRequisicao
     * @desc Pega os dados para a autorização da consulta, coloca-os no json consulta e depois executa PesquisarPlaca
     * @memberof MainController
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
        consulta.xml.CONSULTA.ACESSO.SENHA = resp.data.senha;
        consulta.xml.CONSULTA.ACESSO.USUARIO = resp.data.usuario;
        consulta.xml.CONSULTA.PERMISSOES.CONTRATOID = resp.data.contrato;
        consulta.xml.CONSULTA.PERMISSOES.PACOTEID = resp.data.pacote;

        PesquisarPlaca(resp.data.url);
      });
    }

    function GetRejeitados() {
      $http.get(api + 'rejeitado').then(function (resp) {
        vm.rejeitados = php_crud_api_transform(resp.data).rejeitado;
      });
    }

    /**
     * @function PesquisarPlaca
     * @desc Armazena a plca do usuario no json consulta, converte json para xml, pois o serviço
     * só aceita xml e envia a requisição.
     * @memberof MainController
     */
    function PesquisarPlaca(url) {
      var xml = '';

      consulta.xml.CONSULTA.VEICULO.PLACA = vm.placa;
      xml = conversorService.Json2Xml(consulta);

      $.get(url + xml, function (data) {
        var codigoConsulta = '';
        var codigoRetornoFipe = '';
        var especieVeiculo = ''; //Usado para verificar se eh taxi
        var fabricante = '';
        var fipe = ''; //Armazena os dados da tabela fipe
        var retorno = $(data).find('string'); // Recebe a resposta do servico
        var veiculo = ''; // usado para ver qual o tipo de veiculo (moto ou carro) 

        retorno = $.parseXML(retorno[0].textContent); // Converte string xml para objeto xml
        codigoConsulta = $(retorno).find('ConsultaID')[0].textContent; //Confirmação que deu tudo ok

        console.log(retorno);

        //Se a consulta falhou envia o usuario para a preencher os dados do carro
        if (codigoConsulta !== '0001') {
          $state.go('fipe');
        }

        $rootScope.usuario.data = $(retorno).find('DataHoraConsulta')[0].textContent; //Armazena a data da consulta

        //Codigo de confirmação de retorno. Se for 1, ha retorno
        codigoRetornoFipe = $(retorno).find('Precificador').find('TabelaFipe').find('CodigoRetorno')[0].textContent;
        veiculo = $(retorno).find('RegistroFederal').find('TipoVeiculo')[0].textContent;
        $rootScope.usuario.veiculo = veiculo;
        especieVeiculo = $(retorno).find('RegistroFederal').find('EspecieVeiculo')[0].textContent;

        //Não da proseguimento se não for moto ou carro
        if (veiculo != 'AUTOMOVEL' && veiculo != 'MOTOCICLETA') {
          vm.carregando = false;
          toaster.pop({
            type: 'error',
            title: 'Atenção!',
            body: 'Tipo de veículo não aceito.',
            timeout: 50000
          });
          return;
        }

        //Verifica se o carro eh taxi
        if (especieVeiculo != 'PASSAGEIRO' && especieVeiculo != 'NAO INFORMADO') {
          vm.carregando = false;
          vm.isTaxi = true;
        }

        //Nao ha dados da tabela fipe. Entao envia o usuario para a preencher os dados do carro
        if (codigoRetornoFipe !== '1') {
          vm.carregando = false;
          $state.go('fipe');
        }

        //Armazena em uma variavel para ficar mais facil a consulta
        fipe = $(retorno).find('Precificador').find('TabelaFipe').find('Registro')[$(retorno).find('Precificador').find('TabelaFipe').find('Registro').length - 1];

        //Armazena os dados relevantes para dar continuidade a cotação
        $rootScope.usuario.modelo = $(fipe).find('Modelo')[0].textContent;
        fabricante = $(fipe).find('Fabricante')[0].textContent;
        $rootScope.usuario.preco = 'R$ ' + $(fipe).find('Valor')[0].textContent + ',00';

        //Verifica se o modelo eh rejeitado
        angular.forEach(vm.rejeitados, function (value, key) {
          if (value.Fabricante == fabricante) {
            var modeloTeste = $rootScope.usuario.modelo;
            var modeloRejeitado = value.Modelo;

            modeloTeste = modeloTeste.toUpperCase();
            modeloRejeitado = modeloRejeitado.toUpperCase();

            if (modeloTeste.includes(modeloRejeitado)) {
              toaster.pop({
                type: 'error',
                title: 'Atenção!',
                body: 'Não fazemos cotação para esse modelo de veículo.',
                timeout: 50000
              });
              return;
            }
          }
        });

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
  }
})();