
(function(){
    $(document).ready(function(){
        console.log('funcionou');
        getPoints()
        $('.time-register-cell-double .group').each(function(item){
            console.log(item);
        });

        function convertToTimeStamp(year, month, day, hours, minutes, seconds) {
            var date = new Date(year, month, day, hours, minutes, seconds);
            var timestamp = date.getTime();
            return timestamp;
        }

        function doIt () {
            var btn = $('.my-period');
            if (!!btn.length > 0) {
                var $container = $('.my-period');
                $container.prepend('<div class="c-button button -alternative -lg cp-import"><span class="text">Importar dados para CP</span></div>');

                $('.cp-import').on('click', function () {
                    $('.time-register-row').each(function(){
                        var dia= $(this).find('td:first-child').text();

                        dia = dia.substr(dia.indexOf(",") + 1);
                        dia = dia.split("/");
                        //0 - dia 1 - mes 2-ano
                        //converte dia para timestamp
                        var date = new Date(dia[2], dia[1] -1, dia[0]);
                        var timestamp = date.getTime();
                        var keyDia = timestamp;

                        var horaentrada =  $(this).find('td:nth-child(2) .time-register-cell-double .group span:first-child').text();
                        horaentrada = horaentrada.split(":");
                        horaentrada =  convertToTimeStamp(dia[2], dia[1] -1, dia[0], horaentrada[0], horaentrada[1], horaentrada[2]);

                        var horadoalmoco = $(this).find('td:nth-child(2) .time-register-cell-double .group span:nth-child(2)').text();
                        horadoalmoco = horadoalmoco.split(":");
                        horadoalmoco = convertToTimeStamp(dia[2], dia[1] -1, dia[0], horadoalmoco[0], horadoalmoco[1], horadoalmoco[2]);

                        var voltadoalmoco = $(this).find('td:nth-child(3) .time-register-cell-double .group span:first-child').text();
                        voltadoalmoco = voltadoalmoco.split(":");
                        voltadoalmoco = convertToTimeStamp(dia[2], dia[1] -1, dia[0], voltadoalmoco[0], voltadoalmoco[1], voltadoalmoco[2]);

                        var horasaida = $(this).find('td:nth-child(3) .time-register-cell-double .group span:nth-child(2)').text();
                        horasaida = horasaida.split(":");
                        horasaida = convertToTimeStamp(dia[2], dia[1] -1, dia[0], horasaida[0], horasaida[1], horasaida[2]);

                        var dados = {
                            "entrada":horaentrada,
                            "ida_almoco":horadoalmoco,
                            "volta_almoco":voltadoalmoco,
                            "saida":horasaida,
                            "vpn":"",
                            "obs":"",
                            "ausent":false
                        }
                        console.log(dados);
                        chrome.runtime.sendMessage({ type: "UPDATE_FROM_CONVENIA", data: dados, dia:keyDia}, function(response) {
                            //console.log(response.import);
                        });
                    });
                });
            } else {
                setTimeout(function() {
                    doIt();
                }, 5000);
            }
        }

        function getPoints() {
            try{
                var auth = "Bearer "+ getCookie('colaborador_token');
                var settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": 'https://core.convenia.com.br/api/v1/companies/3973/employees/18828/points/periods/1405/points',
                    "method": "GET",
                    "headers": {
                        "Authorization": auth,
                        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                        "conten": "application/json",
                        "content-type": "application/json",
                        "cache-control": "no-cache",
                    },
                    "processData": false,
                }
                var request = $.ajax(settings);

                request.done(function( msg) {
                    var datas =msg.data.dates;
                    var totalHoras = 0;
                    for(data of datas) {
                        if(data.date = '2017-11-17'){
                            debugger;
                        }

                        var hora = parseInt(data.hours.toString().split('.')[0]);
                        var min =  parseInt(data.hours.toString().split('.')[1]) || 0;
                        var extra =0;
                        var lossHour = 0;
                        var minutes = 0;
                        var extrahour  = 0;

                        if(hora>=8) {
                            var extrahour = hora - 8;
                            var minutes = parseInt(min) + parseInt(convertToMin(extrahour));
                            totalHoras += minutes;
                            extra = (minutes>0)?convertToHour(minutes):0;
                        }else{
                            var lossHour = 7 - hora;
                            var minutes = parseInt(min) + parseInt(convertToMin(lossHour));
                            totalHoras -= minutes;
                            extra =  (minutes>0)? " - "+ convertToHour(minutes):0;
                        }
                        //console.log('TOT'+totalHoras);
                        //console.log('horas: '+data.hours +' dia: '+data.date+' extra:'+ extra);
                    }
                   // console.log('Horas Totais: '+convertToHour(totalHoras));
                    $('.my-period').prepend('<button class="c-button button -alternative -lg"><!----> <span class="text">'+ convertToHour(totalHoras) + '</span> <!----></button>');
                });

                request.fail(function( jqXHR, textStatus ) {
                   console.log(jqXHR);
                });
            } catch(err){
                console.log('erro',err);
            }

        }

        function convertToMin(horas) {
            return horas * 60;
        }

        function convertToHour(mins) {
            let h = Math.floor(mins / 60);
            let m = mins % 60;
            h = h < 10 ? '0' + h : h;
            m = m < 10 ? '0' + m : m;
            return `${h}:${m}`;
        }

        function getCookie(name) {
            var value = "; " + document.cookie;
            var parts = value.split("; " + name + "=");
            if (parts.length == 2) return parts.pop().split(";").shift();
        }
    });

})();


