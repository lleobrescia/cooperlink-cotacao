(function () {
  'use strict';

  angular
    .module('app')
    .factory('CheckConditionService', CheckConditionService);

  CheckConditionService.$inject = ['anoCarro', 'anoMoto'];

  function CheckConditionService(anoCarro, anoMoto) {
    var ano = '';
    var fabricante = '';
    var modelo = '';
    var rejeitados = [];

    var service = {
      Activate: Activate,
      CarHasValidModel: CarHasValidModel,
      CarHasValidYear: CarHasValidYear,
      MotoHasValidModel: MotoHasValidModel,
      MotoHasValidYear: MotoHasValidYear
    };

    return service;

    ////////////////

    function Activate(modelo, fabricante, ano, rej) {
      this.ano = ano;
      this.fabricante = fabricante;
      this.modelo = modelo;
      this.rejeitados = rej;
    }

    function CarHasValidModel() {
      var retorno = true;
      console.log(this.fabricante);
      switch (this.fabricante) {
        case 'Audi':
          retorno = (parseInt(this.ano) > 2008);
          break;
        case 'BMW':
          retorno = (parseInt(this.ano) > 2008);
          break;
        case 'Fiat':
          retorno = (parseInt(this.ano) > 2000);
          break;
        case 'Ford':
          retorno = (parseInt(this.ano) > 2000);
          break;
        case 'GM - Chevrolet':
          retorno = (parseInt(this.ano) > 2000);
          break;
        case 'Honda':
          retorno = (parseInt(this.ano) > 2002);
          break;
        case 'Hyundai':
          retorno = (parseInt(this.ano) > 2008);
          break;
        case 'JAC Motors':
          retorno = (parseInt(this.ano) > 2008);
          break;
        case 'Kia Motors':
          retorno = (parseInt(this.ano) > 2008);
          break;
        case 'Mercedes':
          retorno = (parseInt(this.ano) > 2008);
          break;
        case 'Mitsubishi':
          retorno = (parseInt(this.ano) > 2009);
          break;
        case 'Nissan':
          retorno = (parseInt(this.ano) > 2007);
          break;
        case 'Toyota':
          retorno = (parseInt(this.ano) > 2003);
          break;
        case 'VM - VolksWagen':
          retorno = (parseInt(this.ano) > 2000);
          console.log((parseInt(this.ano) > 2000));
          break;
        case 'Volvo':
          retorno = (parseInt(this.ano) > 2008);
          break;

        default:
          retorno = true;
          break;
      }

      if (retorno) {
        angular.forEach(rejeitados, function (value, key) {
          if (value.Fabricante == this.fabricante) {
            var modeloTeste = this.modelo;
            var modeloRejeitado = value.Modelo;

            modeloTeste = modeloTeste.toUpperCase();
            modeloRejeitado = modeloRejeitado.toUpperCase();

            if (modeloTeste.includes(modeloRejeitado)) {
              retorno = false;
            }
          }
        });
      }
      return retorno;
    }

    function CarHasValidYear() {
      var yearsApart = new Date(new Date() - new Date(this.ano + '-01-01')).getFullYear() - 1970;

      return (yearsApart < anoCarro);
    }

    function MotoHasValidModel() {
      return true;
    }

    function MotoHasValidYear() {
      return (parseInt(this.ano) > anoMoto);
    }

  }
})();