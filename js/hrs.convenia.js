
(function(){
    $(document).ready(function(){

        function callPoint() {
            let url  = window.location.pathname;
            const REGEX = new RegExp(/^(\/meu\-ponto\/fechamento\/\d*)/g);
            let res = REGEX.test(url);
            if(res){
                getPoints();
            }
        }

        callPoint();

        $(document).on('click','.time-register-cards .time-register-card', () => {
            setTimeout(() => {
                callPoint();
            },1000)
        });




        function convertToTimeStamp(year, month, day, hours, minutes, seconds) {
            let date = new Date(year, month, day, hours, minutes, seconds);
            let timestamp = date.getTime();
            return timestamp;
        }
        //depreciado - funcionava na versao antiga do convenia
        function doIt () {
            let btn = $('.my-period');
            if (!!btn.length > 0) {
                let $container = $('.my-period');
                $container.prepend('<div class="c-button button -alternative -lg cp-import"><span class="text">Importar dados para CP</span></div>');

                $('.cp-import').on('click', function () {
                    $('.time-register-row').each(function(){
                        let dia= $(this).find('td:first-child').text();

                        dia = dia.substr(dia.indexOf(",") + 1);
                        dia = dia.split("/");
                        //0 - dia 1 - mes 2-ano
                        //converte dia para timestamp
                        let date = new Date(dia[2], dia[1] -1, dia[0]);
                        let timestamp = date.getTime();
                        let keyDia = timestamp;

                        let horaentrada =  $(this).find('td:nth-child(2) .time-register-cell-double .group span:first-child').text();
                        horaentrada = horaentrada.split(":");
                        horaentrada =  convertToTimeStamp(dia[2], dia[1] -1, dia[0], horaentrada[0], horaentrada[1], horaentrada[2]);

                        let horadoalmoco = $(this).find('td:nth-child(2) .time-register-cell-double .group span:nth-child(2)').text();
                        horadoalmoco = horadoalmoco.split(":");
                        horadoalmoco = convertToTimeStamp(dia[2], dia[1] -1, dia[0], horadoalmoco[0], horadoalmoco[1], horadoalmoco[2]);

                        let voltadoalmoco = $(this).find('td:nth-child(3) .time-register-cell-double .group span:first-child').text();
                        voltadoalmoco = voltadoalmoco.split(":");
                        voltadoalmoco = convertToTimeStamp(dia[2], dia[1] -1, dia[0], voltadoalmoco[0], voltadoalmoco[1], voltadoalmoco[2]);

                        let horasaida = $(this).find('td:nth-child(3) .time-register-cell-double .group span:nth-child(2)').text();
                        horasaida = horasaida.split(":");
                        horasaida = convertToTimeStamp(dia[2], dia[1] -1, dia[0], horasaida[0], horasaida[1], horasaida[2]);

                        let dados = {
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
                let auth = "Bearer "+ getCookie('colaborador_token');
                let period = window.location.pathname.replace('/meu-ponto/fechamento/','');
                let employee_id = getCookie('colaborador_employee_id');
                let company_id = getCookie('colaborador_company_id');
                let settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": 'https://core.convenia.com.br/api/v1/companies/'+company_id+'/employees/'+employee_id+'/points/periods/'+period+'/points',
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
                let request = $.ajax(settings);

                request.done(function(response) {
                    let datas =response.data.dates;
                    let totalHoras = 0;
                    for(data of datas) {

                        let hora = parseInt(data.hours.toString().split('.')[0]);
                        let min =  parseInt(data.hours.toString().split('.')[1]) || 0;
                        let extra =0;
                        let lossHour = 0;
                        let minutes = 0;
                        let extrahour  = 0;

                        if(hora>=8) {
                            let extrahour = hora - 8;
                            let minutes = parseInt(min) + parseInt(convertToMin(extrahour));
                            totalHoras += minutes;
                            extra = (minutes>0)?convertToHour(minutes):0;
                        }else{
                            let lossHour = 7 - hora;
                            let minutes = parseInt(min) + parseInt(convertToMin(lossHour));
                            totalHoras -= minutes;
                            extra =  (minutes>0)? " - "+ convertToHour(minutes):0;
                        }
                        //console.log('TOT'+totalHoras);
                        //console.log('horas: '+data.hours +' dia: '+data.date+' extra:'+ extra);
                    }
                   // console.log('Horas Totais: '+convertToHour(totalHoras));
                   $('.my-period').prepend(`<div class="c-input field -error">
                                                <label for="diasDeFolga" class="label">
                                                    <span>Dia de Folga</span>
                                                </label>
                                                <div class="inner">
                                                    <input id="diasDeFolga" placeholder="" autocomplete="off" class="input" type="text">
                                                </div>
                                            </div>`);
                    $('.my-period').prepend(`<button class="c-button button -alternative -lg">
                                                <span class="text">${convertToHour(totalHoras)}</span>
                                            </button>`);



                });

                request.fail(function( jqXHR, textStatus ) {
                   console.log(jqXHR);
                });
            } catch(err){
                console.log('erro',err);
            }

        }

        function handleDates () {

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
            let value = "; " + document.cookie;
            let parts = value.split("; " + name + "=");
            if (parts.length == 2) return parts.pop().split(";").shift();
        }
    });

})();


