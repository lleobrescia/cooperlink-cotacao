(function () {
  'use strict';

  angular
    .module('app')
    .controller('InfoBasicController', InfoBasicController);

  InfoBasicController.$inject = ['$http', '$rootScope', '$state', '$window', 'api', 'toaster', 'pipedrive'];

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
   * @param {constant} api                     - url do api
   * @param {service}  toaster                 - Seviço para mostrar mensagens
   *
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/controller} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#controllers} Para melhores praticas
   */
  function InfoBasicController($http, $rootScope, $state, $window, api, toaster, pipedrive) {
    var vm = this;

    $rootScope.usuario = {
      'codigoTabelaFipe': '',
      'disel':            false,
      'estado':           'Brasil',
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
    vm.importados      = [];
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

    Activate();

    ////////////////

    /**
     * @function Activate
     * @desc Setup do controlador. Exetuca assim que o controlador inicia
     * @memberof InfoBasicController
     */
    function Activate() {
      var leo = {
        "cp_produto": {
          "columns": ["id", "idCliente", "adesao", "ano", "codigoFipe", "disel", "especial", "fabricante", "importado", "mensalidade", "modelo", "opcionais", "trabalho", "valorFipe", "veiculo"],
          "records": [
            [1, 1, "R$ 350,00", null, "002111-3", 0, 0, null, 0, "R$ 310,09", "Corolla XEi 2.0 Flex 16V Aut.", "Carro reserva 30 dias, ", 0, "R$ 54.378,00", "Carro"]
          ]
        },
        "cp_cliente": {
          "relations": {
            "id": "cp_produto.idCliente"
          },
          "columns": ["id", "idRegiao", "idDados", "cadastro", "email", "ip", "nome"],
          "records": [
            [1, 3, 1, "2017-11-22 12:03:43", "murilofdiniz@hotmail.com", "181.213.76.113", "Murilo Diniz"]
          ]
        },
        "cp_dados": {
          "relations": {
            "id": "cp_cliente.idDados"
          },
          "columns": ["id", "bairro", "cep", "cidade", "complemento", "cpf", "estado", "logradouro", "numero", "telefone"],
          "records": [
            [1, "Jardim Camburi", "29090060", "Vit\u00f3ria", "loja", "06846895612", "ES", "Rua Carlos Martins", "100", "27999022874"]
          ]
        }
      };
      var brescia = php_crud_api_transform(leo);
      console.log(brescia);
      GetImportados();
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

    function GetImportados() {
      $http.get(api + 'cp_importado').then(function (resp) {
        vm.importados = php_crud_api_transform(resp.data).importado;
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
          $rootScope.usuario.segmento = 'Carro';
        } else {
          $rootScope.usuario.veiculo = 'MOTOCICLETA';
          $rootScope.usuario.segmento = 'Moto';
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
      var combustivel = vm.anoEscolhido.combustivel;
      var isImportado = false;
      var marca       = vm.marcaEscolhida.marca;
      var modelo      = vm.modeloEscolhido.modelo;

      //Armazena os dados da consulta para mostrar na tela de cotacao
      $rootScope.usuario.preco            = vm.anoEscolhido.valor.toString();
      $rootScope.usuario.ano              = vm.anoEscolhido.ano;
      $rootScope.usuario.modelo           = vm.modeloEscolhido.modelo;
      $rootScope.usuario.fabricante       = vm.marcaEscolhida.marca;
      $rootScope.usuario.codigoTabelaFipe = vm.anoEscolhido.codigo_fipe;

      //Verifica se o veiculo eh para trabalho
      if (vm.isUber) {
        console.info('Taxi');
        $rootScope.usuario.taxi = true;
        $rootScope.usuario.segmento = 'Taxi';
      }

      //Verifica se o combustivel eh disel
      if (combustivel.toUpperCase() === 'DISEL') {
        console.info('Disel');
        $rootScope.usuario.disel = true;
        $rootScope.usuario.segmento = 'Especial';
      }

      angular.forEach(vm.importados, function (value, key) {
        var upperImportado = value.nome.toUpperCase();

        if (marca.toUpperCase() == upperImportado ||
            modelo.toUpperCase() == upperImportado) {
          isImportado = true;
        }
      });

      if (isImportado) {
        console.info('Importado');
        $rootScope.usuario.importado = true;
        $rootScope.usuario.segmento = 'Especial';
      }

      $rootScope.usuario.estado   = vm.usuario.estado;
      $rootScope.usuario.nome     = vm.usuario.nome;
      $rootScope.usuario.email    = vm.usuario.email;
      $rootScope.usuario.telefone = vm.usuario.telefone;

      console.log('Usuario ', $rootScope.usuario);
      $state.go('verificar');
    }
  }
})();