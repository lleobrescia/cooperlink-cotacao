(function () {
  'use strict';

  angular
    .module('app')
    .controller('InfoBasicController', InfoBasicController);

  InfoBasicController.$inject = ['$http', '$rootScope', '$state', '$window', 'CheckConditionService', 'api', 'fipeService', 'toaster', 'pipedrive'];

  /**
   * @ngdoc controller
   * @scope {}
   * @name InfoBasicController
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
  function InfoBasicController($http, $rootScope, $state, $window, CheckConditionService, api, fipeService, toaster, pipedrive) {
    var vm = this;
    var leo = 'leo';

    $rootScope.usuario = {
      'codigoTabelaFipe': '',
      'data':             '',
      'deal':             '',
      'disel':            false,
      'estado':           'brasil',
      'importado':        false,
      'modelo':           '',
      'preco':            '',
      'taxi':             false,
      'veiculo':          ''
    };

    vm.altura       = $window.innerHeight;
    vm.anoEscolhido = '';
    vm.estado = [{
        "ID": "1",
        "Sigla": "AC",
        "Nome": "Acre"
      },
      {
        "ID": "2",
        "Sigla": "AL",
        "Nome": "Alagoas"
      },
      {
        "ID": "3",
        "Sigla": "AM",
        "Nome": "Amazonas"
      },
      {
        "ID": "4",
        "Sigla": "AP",
        "Nome": "Amapá"
      },
      {
        "ID": "5",
        "Sigla": "BA",
        "Nome": "Bahia"
      },
      {
        "ID": "6",
        "Sigla": "CE",
        "Nome": "Ceará"
      },
      {
        "ID": "7",
        "Sigla": "DF",
        "Nome": "Distrito Federal"
      },
      {
        "ID": "8",
        "Sigla": "ES",
        "Nome": "Espírito Santo"
      },
      {
        "ID": "9",
        "Sigla": "GO",
        "Nome": "Goiás"
      },
      {
        "ID": "10",
        "Sigla": "MA",
        "Nome": "Maranhão" 
      },
      {
        "ID": "11",
        "Sigla": "MG",
        "Nome": "Minas Gerais"
      },
      {
        "ID": "12",
        "Sigla": "MS",
        "Nome": "Mato Grosso do Sul"
      },
      {
        "ID": "13",
        "Sigla": "MT",
        "Nome": "Mato Grosso"
      },
      {
        "ID": "14",
        "Sigla": "PA",
        "Nome": "Pará"
      },
      {
        "ID": "15",
        "Sigla": "PB",
        "Nome": "Paraíba"
      },
      {
        "ID": "16",
        "Sigla": "PE",
        "Nome": "Pernambuco"
      },
      {
        "ID": "17",
        "Sigla": "PI",
        "Nome": "Piauí"
      },
      {
        "ID": "18",
        "Sigla": "PR",
        "Nome": "Paraná"
      },
      {
        "ID": "19",
        "Sigla": "RJ",
        "Nome": "Rio de Janeiro"
      },
      {
        "ID": "20",
        "Sigla": "RN",
        "Nome": "Rio Grande do Norte"
      },
      {
        "ID": "21",
        "Sigla": "RO",
        "Nome": "Rondônia"
      },
      {
        "ID": "22",
        "Sigla": "RR",
        "Nome": "Roraima"
      },
      {
        "ID": "23",
        "Sigla": "RS",
        "Nome": "Rio Grande do Sul"
      },
      {
        "ID": "24",
        "Sigla": "SC",
        "Nome": "Santa Catarina"
      },
      {
        "ID": "25",
        "Sigla": "SE",
        "Nome": "Sergipe"
      },
      {
        "ID": "26",
        "Sigla": "SP",
        "Nome": "São Paulo"
      },
      {
        "ID": "27",
        "Sigla": "TO",
        "Nome": "Tocantins"
      }
    ];
    vm.carregando      = true;
    vm.fipePasso       = 'estado';
    vm.isUber          = false;
    vm.listaAnos       = [];
    vm.listaCarros     = [];
    vm.listaModelos    = [];
    vm.listaMotos      = [];
    vm.marcaEscolhida  = '';
    vm.modeloEscolhido = '';
    vm.veiculo         = '';
    vm.rejeitados      = [];
    vm.usuario = {
      'email':    '',
      'estado':   '',
      'nome':     '',
      'telefone': ''
    };

    /**
     * Atribuição das funções no escopo
     */
    vm.GetAnos     = GetAnos;
    vm.GetModelos  = GetModelos;
    vm.GetPreco    = GetPreco;
    vm.SalvarDados = SalvarDados;

    Activate();

    ////////////////

    /**
     * @function Activate
     * @desc Setup docontrolador. Exetuca assim que o controlador inicia
     * @memberof InfoBasicController
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

    function AddInPipedrive() {
      var deal;
      var person;
      var token = '';

      $rootScope.usuario.estado = vm.usuario.estado;

      switch (vm.usuario.estado) {
        case 'Minas Gerais':
          token = 'd535ffdcda8a98f665d3a1a2159b7e332513775d';
          person = {
            'name':  vm.usuario.nome,
            'email': [vm.usuario.email],
            'phone': [vm.usuario.telefone],
            '2cc51f5cb5c89ffd428481a4c296dbf395ce5294': vm.usuario.estado //Campo parsonalizado (estado)
          };
          deal = {
            'title':     vm.usuario.nome,
            'person_id': '',
            'stage_id':  1,
            '258b7d5cf86ad57473eb3dbe64d7dcca65daf2d5': $rootScope.usuario.veiculo,
            'ef95f5a9f47cd53c037ddce2b04d67036331721f': $rootScope.usuario.modelo,
            '47dbd96f143b98b35b4a61ed58674fb2f26ad6f7': vm.marcaEscolhida.marca,
            'eb2119cbebb4f7a2bae1cf5a8fcfddde95cc5508': vm.anoEscolhido.ano,
            '972181c3b150add2d615edd6acdcd08fdd0843c0': $rootScope.usuario.importado ? 'Sim': 'Não',
            '8f22047a93ee12281b29bc783f08de314bf795f5': $rootScope.usuario.taxi ? 'Sim': 'Não',
            '1c20066faf18c40a6b8c005a759579c2b8a8b4bc': $rootScope.usuario.disel ? 'Sim': 'Não',
            '2ccd17ea1d7ecc8727006907de12fe3ba14fe2c2': $rootScope.usuario.codigoTabelaFipe,
            '0772a58c3baaced0b9179d03cab515d436ba0a22': 'R$ '+ $rootScope.usuario.preco
          };
          break;

        default:
          token = '826f5328bd2a1aa1c10626f78d541f8f3172da26';
          person = {
            'name':  vm.usuario.nome,
            'email': [vm.usuario.email],
            'phone': [vm.usuario.telefone],
            '68ef00258bf9c719624253313124607fa6436745': vm.usuario.estado //Campo parsonalizado (estado)
          };
          deal = {
            'title':     vm.usuario.nome,
            'person_id': '',
            'stage_id':  1,
            'aeddb7951a05180ed6785a697a0a66a43a86bf50': $rootScope.usuario.veiculo,
            'e4cb5efc6a1a3054d9f9abc9a46ad713ee4ff646': $rootScope.usuario.modelo,
            '96d2da8799b4642c80018ef5531fdce265967060': vm.marcaEscolhida.marca,
            'a0f7ce2aa1ccad1d6924c4c271943bac5c94b078': vm.anoEscolhido.ano,
            'c936add5130f549d30fcafc042b55c13bbed7966': $rootScope.usuario.importado ? 'Sim': 'Não',
            'dcfda0244349aaf7ebff1b5ced1d455d019ff407': $rootScope.usuario.taxi ? 'Sim': 'Não',
            'dcaf48d963b86002431f3a4aee7042ccebc727a3': $rootScope.usuario.disel ? 'Sim': 'Não',
            '79a6a5f577b37d6c66b1c840b2152d5c91d7179d': $rootScope.usuario.codigoTabelaFipe,
            '44081ae9682eee268633545d939a7b3162f90d2c': 'R$ '+ $rootScope.usuario.preco
          };
          break;
      }

      $http.post(pipedrive + 'persons/?api_token=' + token, person).then(function (resp) {
        deal.person_id = resp.data.data.id;
        console.log('Pipedrive person ', resp);

        $http.post(pipedrive + 'deals/?api_token=' + token, deal).then(function (resp2) {
          $rootScope.usuario.deal = resp2.data.data.id;
          console.log('Pipedrive deal ', resp2);
          $state.go('cotacao');
        });
      });
    }

    /**
     * @function GetAnos
     * @desc Busca os anos do modelo escolhido. Sai do passo3 e vai para o passo4
     * @memberof InfoBasicController
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
     * @memberof InfoBasicController
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
     * @memberof InfoBasicController
     */
    function GetPreco() {
      vm.anoEscolhido = angular.fromJson(vm.anoEscolhido);

      console.info('Passo 4');
      console.info('Ano escolhido ', vm.anoEscolhido);
      vm.carregando = true;

      var ano         = vm.anoEscolhido.ano;
      var marca       = vm.marcaEscolhida.marca;
      var modelo      = vm.modeloEscolhido.modelo;
      var testeAno    = '';
      var testeModelo = '';

      var combustivel = vm.anoEscolhido.combustivel;

      //Armazena os dados da consulta para mostrar na tela de cotacao
      $rootScope.usuario.preco            = vm.anoEscolhido.valor.toString();
      $rootScope.usuario.modelo           = vm.modeloEscolhido.modelo;
      $rootScope.usuario.codigoTabelaFipe = vm.anoEscolhido.codigo_fipe;

      CheckConditionService.Activate(modelo, marca, ano, vm.rejeitados);

      //Verifica se o veiculo eh para trabalho
      if (vm.isUber) {
        console.info('Taxi');
        $rootScope.usuario.taxi = true;
      }

      //Verifica se o combustivel eh disel
      if (combustivel.toUpperCase() === 'DISEL') {
        console.info('Disel');
        $rootScope.usuario.disel = true;
      }

      if ($rootScope.usuario.veiculo === 'AUTOMOVEL') { // Verifica os carros
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
          $http.get(api + 'importado').then(function (resp) {
            var retorno = php_crud_api_transform(resp.data).importado;
            var isImportado = false; //marca

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
            AddInPipedrive();
          });

        }
      } else if ($rootScope.usuario.veiculo === 'MOTOCICLETA') { //Verifica as motos
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
          AddInPipedrive();
        }
      }
    }

    /**
     * @function GetRejeitados
     * @desc Busca no banco de dados os veiculos rejeitados
     * @memberof InfoBasicController
     */
    function GetRejeitados() {
      $http.get(api + 'rejeitado').then(function (resp) {
        vm.rejeitados = php_crud_api_transform(resp.data).rejeitado;
      });
    }

    function SalvarDados() {
      $http.post(api + 'cliente', vm.usuario).then(function (resp) {
        $rootScope.usuario.idUsuario = resp.data;
        console.info('Dados salvos ', $rootScope.usuario);
      }).catch(function (error) {
        toaster.pop({
          type:    'error',
          title:   'Erro #701',
          body:    'Não foi possível completar a requisição.',
          timeout: 50000
        });
        console.warn('Erro ao salvar dados do usuario = >' + error);
        $state.go('placa');
      });
    }
  }
})();