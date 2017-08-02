(function () {
  'use strict';

  angular
    .module('app')
    .controller('PlacaController', PlacaController);

  PlacaController.$inject = ['$http', '$rootScope', '$state', 'CheckConditionService', 'api', 'conversorService', 'toaster', 'projectDir', 'projectDev'];

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
  function PlacaController($http, $rootScope, $state, CheckConditionService, api, conversorService, toaster, projectDir, projectDev) {
    var vm = this;
    var consulta = {
      "xml": {
        "CONSULTA": {
          "ACESSO": {
            "USUARIO": null,
            "SENHA"  : null
          },
          "VEICULO": {
            "CHASSI" : null,
            "UF"     : null,
            "PLACA"  : null,
            "RENAVAM": null,
            "MOTOR"  : null,
            "CRLV"   : null,
            "UF_CRLV": null
          },
          "DADOSPESSOAIS": {
            "TIPOPESSOARESTRICOES": null,
            "CPFCNPJRESTRICOES"   : null,
            "DDD1RESTRICOES"      : null,
            "TEL1RESTRICOES"      : null,
            "DDD2RESTRICOES"      : null,
            "TEL2RESTRICOES"      : null
          },
          "PERMISSOES": {
            "CONTRATOID": null,
            "PACOTEID"  : null,
            "OPCIONAIS": {
              "Precificador": null
            }
          },
          "CONSULTAID"       : null,
          "NRCONTROLECLIENTE": null
        }
      }
    };

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

    function CheckTipoCarro(fabricante, combustivel) {
      combustivel = combustivel.toUpperCase();

      // Verifica se eh taxi.
      if (vm.isUber) {
        console.log('Carro é taxi');
        $rootScope.usuario.taxi = true;
      } else {
        $rootScope.usuario.taxi = false;
      }

      // Verificar se o carro eh a disel
      if (combustivel.indexOf('DISEL') !== -1) {
        console.log('Carro é a disel');
        $rootScope.usuario.disel = true;
      } else {
        $rootScope.usuario.disel = false;
      }

      // Verifica se o carro eh importado
      $http.get(api + 'importado?filter=nome,eq,' + fabricante).then(function (resp) {
        var retorno = php_crud_api_transform(resp.data).importado;

        if (retorno.length > 0) {
          console.log('Carro é importado');
          $rootScope.usuario.importado = true;
        } else {
          $rootScope.usuario.importado = false;
        }

        console.log($rootScope.usuario);
        vm.carregando = false;
        $state.go('cotacao');
      }).catch(function (error) {
        // Erro na conexao
        vm.carregando = false;
        toaster.pop({
          type   : 'error',
          title  : 'Erro ao conectar com o servidor',
          body   : 'Não foi possível completar a requisição.',
          timeout: 50000
        });
        console.warn('Erro ao comparar com os importados = >' + error);
      });
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
        url: projectDev + 'php/dados.php'
      }).then(function (resp) {
        consulta.xml.CONSULTA.ACESSO.SENHA          = resp.data.senha;
        consulta.xml.CONSULTA.ACESSO.USUARIO        = resp.data.usuario;
        consulta.xml.CONSULTA.PERMISSOES.CONTRATOID = resp.data.contrato;
        consulta.xml.CONSULTA.PERMISSOES.PACOTEID   = resp.data.pacote;

        PesquisarPlaca(resp.data.url);
      }).catch(function (error) {
        vm.carregando = false;
        toaster.pop({
          type   : 'error',
          title  : 'Erro ao conectar com o servidor',
          body   : 'Não foi possível completar a requisição.',
          timeout: 50000
        });
        console.warn('Erro ao pegar os dados de consulta = >' + error);
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
      }).catch(function (error) {
        vm.carregando = false;
        toaster.pop({
          type   : 'error',
          title  : 'Erro ao conectar com o servidor',
          body   : 'Não foi possível completar a requisição.',
          timeout: 50000
        });
        console.warn('Erro ao pegar os rejeitados = >', error);
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
      xml = conversorService.Json2Xml(consulta);

      $.get(url + xml, function (data) {
        var ano                 = '';                      // Ano do modelo
        var combustivel         = '';                      // Tipo de combustivel do veiculo
        var codigoConsulta      = '';                      // Usado para validar a consulta
        var codigoDecodificador = '';                      // Usado para validar a segunda consulta
        var fabricante          = '';                      // Fabricante do veiculo
        var fipe                = '';                      // Armazena os dados da tabela fipe
        var isValido            = true;                    // Usado para validar o processo todo
        var modelo              = '';                      // Modelo do veiculo
        var retorno             = $(data).find('string');  // Recebe a resposta do servico
        var testeAno            = '';                      // Usado para verificar se o ano eh aceito
        var testeModelo         = '';                      // Usado para verificar se o modelo eh aceito
        var veiculo             = '';                      // Usado para ver qual o tipo de veiculo (moto ou carro) 

        retorno = $.parseXML(retorno[0].textContent); // Converte string xml para objeto xml

        console.log(retorno);
        
        codigoConsulta      = $(retorno).find('Precificador').find('CodigoRetorno')[0].textContent || null;
        codigoDecodificador = $(retorno).find('AgregadoCompleto').find('CodigoRetorno')[0].textContent || null;

        console.log('Codigo Consulta => ', codigoConsulta);
        console.log('Codigo Decodificador => ', codigoDecodificador);

        //Se a consulta falhou envia o usuario para a preencher os dados do carro
        if (codigoConsulta !== '1' || codigoDecodificador !== '1') {
          console.info('Consulta falhou');

          vm.carregando = false;
          $state.go('fipe');
        } else { // Dados Encontrados
          console.info('Consulta deu certo');

          var marcaModelo = $(retorno).find('AgregadoCompleto').find('MarcaModelo')[0].textContent || null;

          ano         = $(retorno).find('AgregadoCompleto').find('AnoModelo')[0].textContent || null;
          combustivel = $(retorno).find('AgregadoCompleto').find('Combustivel')[0].textContent || 'GASOLINA';
          veiculo     = $(retorno).find('AgregadoCompleto').find('TipoVeiculo')[0].textContent || null;

          console.log('Ano => ', ano);
          console.log('Combustivel => ', combustivel);
          console.log('Veiculo => ', veiculo);

          if (!marcaModelo && !ano && !veiculo) {
            /**
             * Nao foi possivel encontrar alguma informacao
             * portando o usuario esta sendo mandado para procurar os dados do carro
             */
            console.info('Alguma informação não foi encontrada');

            vm.carregando = false;
            $state.go('fipe');
          } else {
            console.info('Tudo certo');

            //Formata os dados para ficar mais facil a busca
            veiculo     = veiculo.toUpperCase();
            marcaModelo = marcaModelo.split('/');
            fabricante  = marcaModelo[0];
            modelo      = marcaModelo[1];

            //Salva os dados do usuario
            $rootScope.usuario.data    = $(retorno).find('DataHoraConsulta')[0].textContent;
            $rootScope.usuario.modelo  = modelo;
            $rootScope.usuario.preco   = 'R$ ' + $(retorno).find('Precificador').find('Valor')[0].textContent + ',00';
            $rootScope.usuario.veiculo = veiculo;

            console.log('Dados do usuario => ', $rootScope.usuario);

            //Startup o servico para verificar se o veiculo eh aceito
            CheckConditionService.Activate(modelo, fabricante, ano, vm.rejeitados);

            if (veiculo === 'AUTOMOVEL') { // Se o veiculo for carro
              console.info('Carro');

              testeAno    = CheckConditionService.CarHasValidYear();   //Valida o ano
              testeModelo = CheckConditionService.CarHasValidModel();  //Valida o modelo

              console.log('Ano teste => ', testeAno);
              console.log('Modelo teste => ', testeModelo);

              if (!testeAno || !testeModelo) {
                /**
                 * O ano ou modelo foi rejeitado
                 * Nao eh possivel fazer cotacao para esse veiculo
                 */
                vm.carregando = false;
                toaster.pop({
                  type   : 'error',
                  title  : 'Atenção!',
                  body   : 'Não é possível fazer cotação para esse veículo.',
                  timeout: 50000
                });
              } else { // Modelo e ano aceitos
                /**
                 * Se o usuario nao marcou se o carro eh taxi ou uber
                 * eh necessario verificar se o veiculo eh importado
                 * se for o carro eh especial
                 */
                fabricante = fabricante.toUpperCase();
                CheckTipoCarro(fabricante, combustivel);
              }
            } else if (veiculo === 'MOTOCICLETA') { // Se o veiculo eh moto
              console.info('Moto');

              testeAno    = CheckConditionService.MotoHasValidYear();
              testeModelo = CheckConditionService.MotoHasValidYear();

              console.log('Ano teste => ', testeAno);
              console.log('Modelo teste => ', testeModelo);

              if (!testeAno || !testeModelo) {
                console.info('Alguma informação não foi encontrada');

                /**
                 * O ano ou modelo foi rejeitado
                 * Nao eh possivel fazer cotacao para esse veiculo
                 */
                vm.carregando = false;
                toaster.pop({
                  type   : 'error',
                  title  : 'Atenção!',
                  body   : 'Não é possível fazer cotação para esse veículo.',
                  timeout: 50000
                });
              } else {
                vm.carregando = false;
                $state.go('cotacao');
              }
            } else {
              console.info('Nem carro nem moto');

              /**
               * Se o veiculo nao for moto nem carro envio o usuario para escolher
               * os dados do veiculo
               */
              vm.carregando = false;
              $state.go('fipe');
            }
          }
        }
      });
    }
  }
})();