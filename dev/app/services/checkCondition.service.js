(function () {
  'use strict';

  angular
    .module('app')
    .factory('CheckConditionService', CheckConditionService);

  CheckConditionService.$inject = ['anoCarro', 'anoMoto'];

  /**
   * @memberof app
   * @ngdoc factory
   * @name CheckConditionService
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Serviço para checar se o carro ou a moto eh valido
   * 
   * @param {constant} anoCarro  - ano do carro para validação
   * @param {constant} anoMoto   - ano da moto para validação
   * 
   * TODO: Validar modelos de motos
   * 
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/providers#factory-recipe} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#factories} Para melhores praticas
   */
  function CheckConditionService(anoCarro, anoMoto) {
    var ano        = '';
    var fabricante = '';
    var modelo     = '';
    var rejeitados = [];

    var service = {
      Activate:          Activate,
      CarHasValidModel:  CarHasValidModel,
      CarHasValidYear:   CarHasValidYear,
      MotoHasValidModel: MotoHasValidModel,
      MotoHasValidYear:  MotoHasValidYear
    };

    return service;

    ////////////////

    /**
     * @function Activate
     * @desc Construtor do service. 
     * @param {string} modelo - modelo do veiculo
     * @param {string} fabricante - fabricante do veiculo
     * @param {string} ano - ano do veiculo
     * @param {json}   rej - lista de veiculos rejeitados
     * @memberof CheckConditionService
     */
    function Activate(modelo, fabricante, ano, rej) {
      this.ano        = ano;
      this.fabricante = fabricante;
      this.modelo     = modelo;
      this.rejeitados = rej;
    }

    /**
     * @function CarHasValidModel
     * @desc Verifica se o modelo do carro eh valido
     * @return {boolean} 
     * @memberof CheckConditionService
     */
    function CarHasValidModel() {
      var retorno = true;

      switch (this.fabricante.toUpperCase()) {
        case 'AUDI':
          retorno = (parseInt(this.ano) > 2008);
          break;
        case 'BMW':
          retorno = (parseInt(this.ano) > 2008);
          break;
        case 'FIAT':
          retorno = (parseInt(this.ano) > 2000);
          break;
        case 'FORD':
          retorno = (parseInt(this.ano) > 2000);
          break;
        case 'GM - CHEVROLET':
          retorno = (parseInt(this.ano) > 2000);
          break;
        case 'HONDA':
          retorno = (parseInt(this.ano) > 2002);
          break;
        case 'HYUNDAI':
          retorno = (parseInt(this.ano) > 2008);
          break;
        case 'JAC MOTORS':
          retorno = (parseInt(this.ano) > 2008);
          break;
        case 'KIA MOTORS':
          retorno = (parseInt(this.ano) > 2008);
          break;
        case 'MERCEDES':
          retorno = (parseInt(this.ano) > 2008);
          break;
        case 'MITSUBISHI':
          retorno = (parseInt(this.ano) > 2009);
          break;
        case 'NISSAN':
          retorno = (parseInt(this.ano) > 2007);
          break;
        case 'TOYOTA':
          retorno = (parseInt(this.ano) > 2003);
          break;
        case 'VM - VOLKSWAGEN':
          retorno = (parseInt(this.ano) > 2000);
          break;
        case 'VOLVO':
          retorno = (parseInt(this.ano) > 2008);
          break;

        default:
          retorno = true;
          break;
      }

      if (retorno) {
        angular.forEach(rejeitados, function (value, key) {
          if (value.Fabricante.toUpperCase() === this.fabricante.toUpperCase()) {
            var modeloTeste     = this.modelo;
            var modeloRejeitado = value.Modelo;

            modeloTeste     = modeloTeste.toUpperCase();
            modeloRejeitado = modeloRejeitado.toUpperCase();

            if (modeloTeste.includes(modeloRejeitado)) {
              retorno = false;
            }
          }
        });
      }
      return retorno;
    }

    /**
     * @function CarHasValidYear
     * @desc Verifica se o ano do carro eh valido
     * @return {boolean}
     * @memberof CheckConditionService
     */
    function CarHasValidYear() {
      // var yearsApart = new Date(new Date() - new Date(this.ano + '-01-01')).getFullYear() - 1970;

      // return (yearsApart < anoCarro);
      return true;
    }

    /**
     * @function MotoHasValidModel
     * @desc Verifica se o modelo da moto eh valido
     * @return {boolean}
     * @memberof CheckConditionService
     */
    function MotoHasValidModel() {
      return true;
    }

    /**
     * @function MotoHasValidYear
     * @desc Verifica se o ano da moto eh valido
     * @return {boolean} 
     * @memberof CheckConditionService
     */
    function MotoHasValidYear() {
      return (parseInt(this.ano) > anoMoto);
    }

  }
})();