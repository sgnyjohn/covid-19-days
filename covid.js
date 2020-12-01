/*   
Copyright (c) 2020 Signey John

                    GNU GENERAL PUBLIC LICENSE
                       Version 3, 29 June 2007

 Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.

25/março/2020 14:59:59


dados	
 	https://ourworldindata.org/coronavirus-source-data
	https://ourworldindata.org/coronavirus

oms	
	https://www.who.int/emergencies/diseases/novel-coronavirus-2019/situation-reports/

europa
	https://www.ecdc.europa.eu/en/publications-data/download-todays-data-geographic-distribution-covid-19-cases-worldwide
	https://opendata.ecdc.europa.eu/covid19/casedistribution/csv

brasil
	https://www.saude.gov.br/boletins-epidemiologicos
	https://covid.saude.gov.br/
	https://mobileapps.saude.gov.br/esus-vepi/files/unAFkcaNDeXajurGB7LChj8SgQYS2ptm/dfe64e164c58c05c77afdd5ecbe8c689_Download_COVID19_20200413.csv
brasil csv	
	blob:https://covid.saude.gov.br/30a1d296-d6e2-49a5-8c28-daf12561f595
 
rs	
 	https://saude.rs.gov.br/boletins-e-informes

fiocruz	
 	http://info.gripe.fiocruz.br/
	https://agencia.fiocruz.br/sites/agencia.fiocruz.br/files/u91/boletim_infogripe_se202014.pdf
	https://bigdata-covid19.icict.fiocruz.br/
	https://rfsaldanha.shinyapps.io/monitoracovid19/

Johns Hopkins CSSE	
	https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_daily_reports

covid19br	
	https://github.com/covid19br/covid19br.github.io/tree/master/dados
	https://covid19br.github.io/fontes.html

worldometers	
	https://www.worldometers.info/coronavirus/#countries

registro civil	
	https://transparencia.registrocivil.org.br/especial-covid
	https://transparencia.registrocivil.org.br/api/covid?data_type=data_ocorrido&search=death-respiratory&state=RS&start_date=2020-01-01&end_date=2020-04-07&causa=pneumonia
	https://transparencia.registrocivil.org.br/api/covid?data_type=data_ocorrido&search=death-respiratory&state=all&start_date=2020-01-01&end_date=2020-04-07&causa=pneumonia

dev fiocruz	
	https://a.basemaps.cartocdn.com/rastertiles/voyager/5/20/16.png
	https://www.shinyapps.io/
	https://github.com/rstudio

pe seplag mapas	
	https://dados.seplag.pe.gov.br/apps/corona.html#mapas

yandex
	https://yandex.ru/web-maps/covid19

 

*/

/* toDo
 * - table sort - concurrency, loop. 
 * - change md, popMin
 */

/*
 * msft.it/6012T9Pmp
*/


//*******************************
function covid(Id) {
	var eu = this; 
	var id = Id;
	var doc = document;
	var ds,dsC;
	var bd; // bd ativo 
	var bdOms; //bd val abs
	var bdPop; //bd por população 
	var bdC; //bd paises
	var div = 1000000;
	var casas = 100; 
	var pd = new pedido();pd.updUrlJ = true;
	var opTipo = pd.getJ('opTipo','per million inhabitants');
	var cmp = 'new_cases,new_deaths,total_cases,total_deaths'.split(',');
	var Pais = pd.getJ('Pais','Brazil');
	var dti='999',dtf; //data maximo e minimo dos dados
	var dt; //data max do país
	//ORDEM PADRÃO... era 6 e 4 -> 7 e 6 -- md new deat+tot cases -> md new deat+md new case
	var fs = function(a,b) {
			return fSort(strZero(a[10]*1000,8)+strZero(a[6]*1000,8),strZero(b[10]*1000,8)+strZero(b[6]*1000,8),true);
		};
	var popMinV = [20000,50000,100000,200000,500000,1000000,2000000,5000000];
	var popMin = pd.getNum('popMin',200000);
	var dMd = pd.get('dMd',21);
	var vMd1 = 'average_'+dMd+'d_new_cases';//'average_5d_new_deaths'
	var vMd = 'average_'+dMd+'d_new_deaths';//'average_5d_new_deaths'
	var daysMd=10;
	var days = [
		['days+100c','days(total_cases>100)'
			,function(bd,va) {return bd.get('total_cases')*bd.mult>100||va>0 ? va+1 : 0 } ]
		,['days+'+daysMd+'md'+dMd,'days('+vMd+'>'+daysMd+')'
			,function(bd,va) {return bd.get(vMd)*bd.mult>daysMd||va>0 ? va+1 : 0 } ]
		//,['days+20d','day (total_deaths > 20)'
		//	,function(bd) {return bd.get('total_deaths')*bd.mult>20?bd.get('days+20d',0,-1)*1+1:0} ]
	];
	var tag = [
		['américa do sul','~Argentina~Bolivia~Bouvet Island~Brazil~Chile~Colombia~Ecuador~Falkland Islands~French Guiana~Guyana~Paraguay~Peru~South Georgia~South Sandwich Islands~Suriname~Uruguay~Venezuela~']
		,['américa central','~Belize~Costa Rica~El Salvador~Guatemala~Honduras~Nicaragua~Panama~']
		,['américa do norte','~Anguilla~Antigua and Barbuda~Aruba~The Bahamas~Barbados~Belize~Bermuda~Bonaire~British Virgin Islands~Canada~Cayman Islands~Clipperton Island~Costa Rica~Cuba~Curaçao~Dominica~Dominican Republic~El Salvador~Federal Dependencies of Venezuela~Greenland~Grenada~Guadeloupe~Guatemala~Haiti~Honduras~Jamaica~Martinique~Mexico~Montserrat~Nicaragua~Nueva Esparta~Panama~Puerto Rico~Saba~San Andrés and Providencia~Saint Barthélemy~Saint Kitts and Nevis~Saint Lucia~Saint Martin~Saint Pierre and Miquelon~Saint Vincent and the Grenadines~Sint Eustatius~Sint Maarten~Trinidad and Tobago~Turks and Caicos Islands~United States~United States Virgin Islands~']
		,['africa','~Algeria~Angola~Benin~Botswana~Burkina Faso~Burundi~Cameroon~Canary Islands~Cape Verde~Central African Republic~Ceuta~Chad~Comoros~Democratic Republic of the Congo~Djibouti~Egypt~Equatorial Guinea~Eritrea~Eswatini~Ethiopia~French Southern and Antarctic Lands~Gabon~Ghana~Guinea~Guinea-Bissau~Ivory Coast~Kenya~Lesotho~Liberia~Libya~Madagascar~Madeira~Malawi~Mali~Mauritania~Mauritius~Mayotte~Melilla~Morocco~Mozambique~Namibia~Niger~Nigeria~Republic of the Congo~Réunion~Rwanda~Saint Helena, Ascension and Tristan da Cunha~São Tomé and Príncipe~Senegal~Seychelles~Sierra Leone~Somalia~South Africa~South Sudan~Sudan~Tanzania~The Gambia~Togo~Tunisia~Uganda~Western Sahara~Zambia~Zimbabwe~']
		,['asia','~Afghanistan~Armenia~Azerbaijan~Bahrain~Bangladesh~Bhutan~Brunei~Cambodia~China~Cyprus~East Timor~Georgia~India~Indonesia~Iran~Iraq~Israel~Japan~Jordan~Kazakhstan~Kuwait~Kyrgyzstan~Laos~Lebanon~Malaysia~Maldives~Mongolia~Myanmar~Nepal~North Korea~Oman~Pakistan~Palestine~Papua New Guinea~Philippines~Qatar~Russia~Saudi Arabia~Singapore~South Korea~Sri Lanka~Syria~Taiwan~Tajikistan~Thailand~Turkey~Turkmenistan~United Arab Emirates~Uzbekistan~Vietnam~Yemen~']
		,['nato','~Albania~Belgium~Bulgaria~Canada~Croatia~Czechia~Denmark~Estonia~France~Germany~Greece~Hungary~Iceland~Italy~Latvia~Lithuania~Luxembourg~Montenegro~Netherlands~North Macedonia~Norway~Poland~Portugal~Romania~Slovakia~Slovenia~Spain~Turkey~United Kingdom~United States~']
		,['oecd','~Australia~Austria~Belgium~Canada~Chile~Czech Republic~Denmark~Estonia~Finland~France~Germany~Greece~Hungary~Iceland~Ireland~Israel~Italy~Japan~Korea, South~Latvia~Lithuania~Luxembourg~Mexico~Netherlands~New Zealand~Norway~Poland~Portugal~Slovakia~Slovenia~Spain~Sweden~Switzerland~Turkey~United Kingdom~United States~Abkhazia~Artsakh~Northern Cyprus~South Ossetia~']
		,['balkans','~Bulgaria~Serbia~Croatia~Greece~North Macedonia~Albania~Bulgaria~Greece~Slovenia~Romania~Serbia~Bosnia and Herzegovina~Turkey~']
		,['middle east','~Akrotiri and Dhekelia~Bahrain~Cyprus~Egypt~Iran~Iraq~Israel~Jordan~Kuwait~Lebanon~Oman~Palestine~Qatar~Saudi Arabia~Syria~Turkey~United Arab Emirates~Yemen~']
		,['oceanian','~Australia~Papua New Guinea~New Zealand~Fiji~Solomon Islands~Vanuatu~New Caledonia~French Polynesia~Samoa~Guam~Kiribati~Federated States of Micronesia~Tonga~American Samoa~Northern Mariana Islands~Marshall Islands~Palau~Cook Islands~Wallis and Futuna~Tuvalu~Nauru~Norfolk Island~Niue~Tokelau~Pitcairn Islands~']
		,['europa','~Russia~Ukraine~France~Spain~Sweden~Norway~Germany~Finland~Poland~Italy~United Kingdom~Romania~Belarus~Kazakhstan~Greece~Bulgaria~Iceland~Hungary~Portugal~Austria~Czechia~Serbia~Ireland~Lithuania~Latvia~Croatia~Bosnia and Herzegovina~Slovakia~Estonia~Denmark~Switzerland~Netherlands~Moldova~Belgium~Armenia~Albania~North Macedonia~Turkey~Slovenia~Montenegro~Kosovo~Cyprus~Azerbaijan~Luxembourg~Georgia~Andorra~Malta~Liechtenstein~San Marino~Monaco~Vatican City~']
		,['european union','~Austria~Belgium~Bulgaria~Croatia~Cyprus~Czech Republic~Denmark~Estonia~Finland~France~Germany~Greece~Hungary~Republic of Ireland~Italy~Latvia~Lithuania~Luxembourg~Malta~Netherlands~Poland~Portugal~Romania~Slovakia~Slovenia~Spain~Sweden~']
	]
	//lert('days='+days);
	var map;
	var tb;
	var vDia;
	var rn;
	var vPais = [];
	var filtro = pd.get('filtro','1 2 RS SC'); //filtrar bd
	setTimeout(init,1000);
	//***************************
	// log, debug
	function log(a) {
		console.log(a);
	}
	function dev() {
		return (new pedido()).host().indexOf('intranet') != -1;
	}
	function alertDev(s) {
		if (dev()) {
			alert(s);
		} else {
			log(s);
		}
	}
	//***************************
	// colore o mapa.
	var arqMap = 'BlankMap-World.svg?x=ef';
	//var arqMap = 'mundo2.svg';
	function map(ev) {
		//bjNav(mapa);
		var titG = mapa.getElementsByTagName('p')[0];
		var dtVar = strToData(dtf).getTime()-strToData(dti).getTime();
		var svg = mapa.getElementsByTagName('svg')[0];
		if (true) {
			var wo = 2754;//mapa.getAttribute('width')*1;
			var ho = 1398;//mapa.getAttribute('height')*1;
		} else {
			var wo = 1920;
			var ho = 1255;
		}
		//para resize css em 100% e apenas set viewBox tam original
		var st = svg.getElementsByTagName('style')[0];
		var stt = st.innerHTML;
		var dd;//mx,mi,mx1,mi1,div,div1;
		//var varSel,varSelMin,varSel1,varSel1Min,bd;
		var vTit;	//title dos países
		//sel();
		//cores e faixas
		var pos;
		var nf = 7;
		var maxCor = 222;
		var Zoom = 1,wia=0,hia=0;
		var vFx = [
			{nome:'total_deaths',v:[],mi:20,vp:3,fx:{},cor:function(x){return 'ff'+x+x;}}
			,{nome:'total_cases',v:[],mi:100,vp:4,fx:{},cor:function(x){return x+x+'ff';}}
			,{nome:'total_cases',v:[],mi:-1,vp:4,fx:{},cor:function(x){return x+'ff'+x;}}
		];
		resize(); 
		init();
		//***************************
		function zoom(ev) {
			if (!ev.ctrlKey) return;
			//ev.stopPropagation();
			const delta = Math.sign(event.deltaY);
			Zoom = Math.floor(Zoom*10+delta)/10;
			Zoom = Zoom<1?1:Zoom;
			svg.setAttribute('transform','scale('+Zoom+')');
			//ajusta view - aquele ponto onde estava o mouse deve ficar no centro do zoom
			//calcula qual a largura de vai caber
			var w = Math.floor(wo/Zoom+0.5);
			var wi = wia+ev.x-browse.getTX(mapa)/2;
			wi = wi<0?0:(wi+w>wo?wo-w:wi); //incremento w inicial e final
			wia = wi;
			var h = Math.floor(ho/Zoom+0.5);
			var hi = hia+ev.y-browse.getTY(mapa)/2;
			hi = hi<0?0:(h+hi>ho?ho-h:wi); //incremento h inicial e final
			hia = hi;
			var vb=wi+' '+hi+' '+(w+wi)+' '+(h+hi);
			log('zoom='+Zoom+' vb='+vb);
			svg.setAttribute('viewBox',vb);
			//svg.setAttribute('transform','scale('+Zoom+')');

			//screenX: 2488 screenY: 503 pageX: 513 pageY: 435 clientX: 513 clientY: 378 x: 513 y: 378 offsetX: 509 offsetY: 327 layerX: 513 layerY: 435	
			//screenX: 2010 screenY: 254 pageX: 35 pageY: 129 clientX: 35 clientY: 129 x: 35 y: 129 offsetX: -32 offsetY: -20 layerX: 35 layerY: 129		

			//log(delta); 
			//bjNav(ev);
			//lert('ev='+ev);
			ev.preventDefault();
			return true;
		}
		//***************************
		function init() {
			st.innerHTML = stt+'\n .br {fill:#ff0000;}';
			
			svg.addEventListener('wheel',zoom);
			
			vTit = {};
			dd = [];
			var refresh = 0;
			bd.top();
			var e = new estat('');
			while (bd.next()) {
				var loc = bd.get('location');
				//procura codigo 2
				var s2 = bdC.get('s2','xx',''+bdC.idx[loc]).toLowerCase(); //sigla pais 2x
				if (s2=='xx') {
					e.inc(s2+' '+loc,1);
				} else {
					//procura obj tit no mapa
					if (!vTit[s2]) {
						vTit[s2] = s2+' '+loc;
						var g = svg.getElementById(s2);
						//não tenta corrigir mapa path
						if (g) {// && g.tagName.toLowerCase()=='g') {
							var t = g.getElementsByTagName('title')[0];
							//log(vTit[s2]+' g='+g+' t='+t.tagName);
							if (t) {
								vTit[s2] = t;
							}
						} else if (g && g.tagName.toLowerCase()=='path') {
							if (refresh==-1) {
								alertDev('id em path='+s2);
							} else {
								//add title
								var g1 = domObj({tag:'g',id:s2,class:s2})
								g.parentNode.insertBefore(g1,g);
								vTit[s2] = domObj({tag:'title','':loc,targ:g1});
								g1.appendChild(g);
								g.removeAttribute('id');
								//g.className = s2;
								var es = ' '+seVazio(g.getAttribute('class'),'')+' ';
								if (es.indexOf(' '+s2+' ')==-1) {
									g.setAttribute('class',trimm(g.getAttribute('class'))+' '+s2);
								}
								refresh = 1;
							}
						}
					}
					//guarda no vetor dados
					dd[dd.length] = [ bd.get('date')
						,bd.get('location'),s2
						,bd.getNum(vFx[0].nome) 
						,bd.getNum(vFx[1].nome) 
					];
				}
			}
			//ordena data e averange.
			dd.sort(function(a,b) {return a[0]>b[0]?1:(a[0]<b[0]?-1:
					(a[3]>b[3]?1:(a[3]<b[3]?-1:0)) //se 1a coluna ENTAO sort 2a coluna
			);});
			
			//refresh
			if (dev() && refresh==1) {
				svg.innerHTML = svg.innerHTML + ' ';
				alertDev('svg ALTERADO... copiar...');
				//svg = mapa.getElementsByTagName('svg')[0];
				st = svg.getElementsByTagName('style')[0];
				stt = st.innerHTML;
			}
		
			//log erros
			log('não encontrados na tabela paises ou cod2 xx '+e.toTxt());
			aeval(vTit,function(x,k) {
				if (!x.tagName) {
					log('falta mapa '+x);
				}
			});
			
			pos=0;
			//lert('div='+div);
			setTimeout(pinta,500);
		}
		//***************************
		// divide paises em grupo de numero constantes de membros iguais
		function getFx(data) {
			var fx;
			var Div = (opTipo=='cases'?1.0:50.0); //se for por mi divide minimo por 50
			//inicializa
			aeval(vFx,function(x) {
				x.v = []; //registros
				x.fx = {}; //paises
			});
			//separa dados por sit
			while (pos<dd.length && data==dd[pos][0]) {
				var ok=false;
				//por o registro em apenas uma cor
				aeval(vFx,function(x) {
					if (!ok && dd[pos][x.vp]>x.mi/Div) {
						x.v[x.v.length] = dd[pos];
						ok = true; //coloca em apenas 1...
					}
				});
				pos++;
			}
			
			//monta faixas para cada cor
			aeval(vFx,function(x) {
				//prox 1
				var div = Math.max(1,Math.floor(x.v.length/nf));
				//ordena cresc
				x.v.sort(function(a,b) { fSort(a[x.vp],b[x.vp],true) });
				var va = -1,fxa; //para não mudar faixa caso valor é o mesmo
				aeval(x.v,function(e,i) {
					var fx = Math.floor(i/div);
					if (va==e[x.vp]) {
						//vlr ant =, mantem faixa
						fx = fxa;
					} else {
						fxa = fx;
						va = e[x.vp];
					}
					var id = e[2];
					x.fx[fx] = (x.fx[fx]?x.fx[fx]+', ':'')+'.'+id;
					//TIT
					if (vTit[id] && vTit[id].tagName) {
						vTit[id].innerHTML = leftAt(vTit[id].innerHTML,' = ')
							+' = ('+x.nome+"="+e[x.vp]+')'
							+(x.mi<0?'':'>'+format(x.mi/Div,(Div==1?0:2)))+' - '+e[1]+' f'+fx
						;
					}
				});
			});
			
		}
		//***************************
		// divide paises em grupo por valor apenas
		function getFxV(data) {
			var fs = {}; //folha estilo
			var fx;
			while (pos<dd.length && data==dd[pos][0]) {
				var id = dd[pos][2].toLowerCase();
				var tit = '';
				if (dd[pos][3]>=varSelMin) {
					fx = '+'+Math.floor((dd[pos][3]-mi)/div);
					fs[fx] = (fs[fx]?fs[fx]+', ':'')+'.'+id;
					//altera title
					tit = dd[pos][3]+' ('+varSel+'>'+varSelMin+')';
				} else if (dd[pos][4]>=varSel1Min) {
					fx = '-'+Math.floor((dd[pos][4]-mi1)/div1);
					fs[fx] = (fs[fx]?fs[fx]+', ':'')+'.'+id;
					//altera title
					tit = dd[pos][4]+' ('+varSel1+'>'+varSel1Min+')';
				} else { 
					fx = 'v';
					fs[fx] = (fs[fx]?fs[fx]+', ':'')+'.'+id;
				}
				if (tit && vTit[id] && vTit[id].tagName) {
					vTit[id].innerHTML = leftAt(vTit[id].innerHTML,' = ')
						+(tit==''?'':' = '+tit+' '+fx)
					;
				}
				pos++;
			}
			return fs;
		}
		//***************************
		function pinta() {
			if (pos>=dd.length) {
				/*setTimeout(function(){
					pos=0;
					st.innerHTML = stt;
					setTimeout(pinta,1500);
				},2000);
				*/
				return;
			}
			//processa um dia e timeout para proximo
			// 0=data 1=loc 2=l2 3=v1 4=v2
			var data = dd[pos][0];
			//gera object indexado por faixa para montar folha estiloi
			getFx(data);
			//lert(fs.v+' '+fs['v']);
			
			//monta a folha de estilo
			var tfs = '';
			aeval(vFx,function(x) {
				aeval(x.fx,function(v,k) {
					var cor = decToHex(maxCor-maxCor/nf*k);
					tfs += v+'  {fill:#'+x.cor(cor)+';}\n';
				});
			});

			titG.innerHTML = data;//+' '+nvd+' '+troca(tfs,'\n','<br>');
			var per = (strToData(data).getTime()-strToData(dti).getTime())/dtVar*100;
			titG.style.cssText='color:#ffffff;background-color:#ff2222;'
				+'width:'+(per)+'%;padding:7px;'
			;
			//lert('dtVar='+dtVar+' per='+per+' '+titG.style.cssText);
			
			
			//lert('data='+data+' stt='+tfs);
			st.innerHTML = stt+'\n\n'+tfs;
			setTimeout(pinta,500);
		}
		//***************************
		function resize() {
			svg.setAttribute('viewBox','0 0 '+wo+' '+ho);
			return;
			//para resize css em 100% e apenas set viewBox tam original
			var pr = wo/ho;
			var nw = window.innerWidth;
			var nh = window.innerHeight;
			//svg.setAttribute('currentScale',0.5);
			//svg.currentScale = 0.5;
			//svg.forceRedraw();
			if (nw/pr>nh) {
				nw = nh*pr;
			} else {
				nh = nw/pr;
			}
			//svg.width = nw;
			//svg.height = nh;
			//svg.style.cssText = 'width:'+nw+'px;';//height:'+nh+'px;';
			//mapa.innerHTML = troca(troca(mapa.innerHTML,'"2754"','"'+nw+'"'),'"1398"','"'+nh+'"');
			//svg.setAttribute('viewBox','0 0 '+nw+' '+ng);
			svg = mapa.getElementsByTagName('svg')[0];
			svg.setAttribute("transform", "scale(0.5)");
			svg.forceRedraw();
			objNav(svg);
			alert(nw+' '+nh+' teste='+mapa.getElementsByTagName('svg').length);
		}
	}
	//***************************
	var estatWWWurl;
	function estatWWW() {
		var s = ''+window.location;
		if (s == estatWWWurl) return;
		estatWWWurl = s;
		s = '?dt='+ms()+'&Pais='+Pais+'&opTipo='+opTipo+'&tabs='+pd.getJ('tabs','7')
			+'&popMin='+popMin+'&dMd='+dMd
		;
		/*var p = s.indexOf('?');
		p = p==-1?s.indexOf('#'):p;
		s = p==-1?'':s.substring(p);*/
		(new carregaUrl()).abre('estat.html'+s,function(a,b,tx) {
			var v = cookieGet('clicks');
			cookiePut('clicks',(Number.isInteger(v)?v:0)+1);
		});
	}
	//***************************
	function pais(n) {
		Pais = n;
		pd.putJ('Pais',Pais);
		//ds.innerHTML = '';
		mostra();
	}
	//***************************
	function click(ev) {
		var o = targetEvent(ev);
		//lert('o='+o.tagName+' '+o);
		if (o.name=='Pais') {
			//selecionou country
			pais(o.value);
			return;
		} else if (o.name=='popMin') {
			pd.putNum('popMin',o.value);
			window.location = pd.atalho();
			return;
		} else if (o.name=='dMd') {
			pd.putNum('dMd',o.value);
			window.location = pd.atalho();
			return;
		} else if (o.name=='opTipo') {
			//ds.innerHTML = '';
			//só paises ?
			if (o.value=='countries') {
				pd.putJ('opTipo',o.value);
				ds.appendChild(bdC.toDom());
				return;
			}
			opTipo = equals(o.value,'(') ? 'cases' : o.value;
			pd.putJ('opTipo',opTipo);
			bd = (opTipo=='cases'?bdOms:bdPop);
			mostra();
			return;
		} else if (o.tagName == 'TD') {
			//lert('clicou nome país');
			p = o.innerHTML;
			//lert('po='+p);
		} else if (o.tagName != 'TR') {
			//bjNav(o);alert(1);
			o = getParentByTagName(o,'tr');
			var p = o.cells.item(1).innerHTML; //pega coluna 2...
			return;
		}
		//bjNav(o);alert(2);
		if (!vazio(bdC.idx[p])) {
			//click country name
			//select posiciona
			var v = document.querySelectorAll('select')[0].querySelectorAll('option');
			for (var i=0;i<v.length;i++) {
				var x = v[i];
				if (x.innerHTML==p) {
					x.selected = true;
				}
			}
			pais(p);
		} else {
			//lert('desconhecido ('+p+')');
		}
	}
	//***************************
	function tabEventos(tb) {
		if (tb.className.indexOf('bdToDom')==-1) 
			return;
		//click
		tb.addEventListener('click',click,true);
		//sort
		//tabelaSort(tb);//lert('sort'+tb);
		//negrita linhas país & colore tipo ugeo
		var tr = tb.getElementsByTagName('tr');
		for (var c=1;c<tr.length;c++) {
			try {
				var cp = tr[c].childNodes.item(1);
				var p = cp.innerHTML;
				cp.setAttribute('title'
					,format(bdC.getNum('Population','xx',''+bdC.idx[p]),0)
						+' hab. ('+c+'º)'
				);
				//negrita linha país
				if (p==Pais) {
					tr[c].className = 'B';
					//break;
				}
				if (p.charAt(0)=='*') {
					cp.style.cssText += 'background-color:#CFEF8F';//#CFEFFF
					//cp.innerHTML = trimm(troca(p,'*',' '));
				}
			} catch (e) {
				//erro, dados corrompidos ?
			}
		}
		return tb;
	}
	//***************************
	function getPos(pais,vr,day) {
		//seleciona o dia 
		var vc=[],vc1=[];
		bd.top();
		while (bd.next()) {
			if (bd.get(vr)==day && 
				( bd.get('location')!='World' && bd.get('location').charAt(0)!='*' )) {
				//( bd.get('location')!='World' && (bd.get('location').charAt(0)!='*' || pais.charAt(0)=='*') )) {
				vc[vc.length] = bd.getVetor();
			}
		}
		//ordena
		vc.sort(fs);
		//find pos pais
		for (var i=0;i<vc.length;i++) {
			if (vc[i][1]==pais) {
				return i+1;
			}
		}
		return -1;
	}
	//***************************
	function mostraContr() {
		//	e monta option selects
		bd.top();
		var rr='<option>(country)~';
		bd.eval(function(){
			//options
			var loc = bd.get('location');
			if (rr.indexOf('>'+loc+'~')==-1)
				rr += '<option'+(loc==Pais?' selected':'')+'>'+loc+'~';
		});
		//select country
		domObj({tag:'input',name:'filtro',style:'font-size:80%;max-width:110px;'
			,value:filtro
			,title:'filtrar'
			,ev_change:function(ev){
					var v = trimm(ev.target.value);
					if (v!=filtro) {
						pd.put('filtro',ev.target.value);
						window.location = pd.atalho();
					}
				}
		,targ:dsC});		//select country
		domObj({tag:'select',name:'Pais',style:'font-size:80%;max-width:110px;'
			,'':troca(rr,'~','')
			,title:'select location'
			,ev_change:click
		,targ:dsC});
		//opTipo
		domObj({tag:'select',name:'opTipo',style:'font-size:80%;max-width:60px;'
			,'':'<option>cases<option'+(equals(opTipo,'per mi')?' selected':'')
				+'>per million inhabitants<option>countries'
			,title:'select values'
			,ev_change:click
		,targ:dsC});

		// pop min 
		var rr='';
		aeval(popMinV,function(v){
			rr += '<option'+(popMin==v?' selected':'')+'>'+format(v,0);
		});
		domObj({tag:'select',name:'popMin',style:'font-size:70%;max-width:40px;'
			,'':rr
			,title:'Brazilian municipalities with a population greater than'
			,ev_change:click
		,targ:dsC});

		// dias media 
		var rr='';
		feval(14,function(v){
			rr += '<option'+(dMd==v+1?' selected':'')+'>'+(v+1);
		});
		domObj({tag:'select',name:'dMd',style:'font-size:70%;max-width:40px;'
			,'':rr+'<option'+(dMd==21?' selected':'')+'>21'
				+'<option'+(dMd==28?' selected':'')+'>28'
				+'<option'+(dMd==-5?' selected':'')+' value=-5>5 [n-2 .. n+2]'
			,title:'days to calculate the moving average'
			,ev_change:click
		,targ:dsC});

	}
	//***************************
	function mostra() {
		estatWWW();
		if (tb==null) {
			ds.innerHTML = '';
			//mostra data
			domObj({tag:'h1',style:'margin:0;color:red;'
				,'':'covid-19'
			,targ:ds});

			//add tab
			tb = new tabs({dst:domObj({tag:'div',targ:ds}),ped:pd,tab:pd.getJ('tabs','7')});

			//projeto
			var u = 'https://github.com/sgnyjohn/covid-19-days';
			domObj({tag:'p',style:'font-size:80%;text-align:right;'
				,'':'project: <a href='+u+'>'+u+'</a>'
			,targ:ds});
			//fonte dados
			var u = 'https://ourworldindata.org';
			domObj({tag:'p',style:'font-size:80%;text-align:right;'
				,'':'data world: <a href='+u+'>'+u+'</a>'
			,targ:ds});
			var u = 'https://covid.saude.gov.br/';
			domObj({tag:'p',style:'font-size:80%;text-align:right;'
				,'':'data .br: <a href='+u+'>'+u+'</a>'
			,targ:ds});		
		}
		mostraPais(tb);
		mostraGeral(tb);
		tb.show();
	}
	//***************************
	function mostraGeral() {
		//mostra mapa
		mapa = domObj({tag:'div',style:'width:100%;',style:''});
		(new carregaUrl()).abre(arqMap,function(a,b,tx) {
			//lert('tx='+tx.length);
			domObj({tag:'p','':'???',targ:mapa});
			domObj({tag:'div',targ:mapa}).innerHTML = tx;
			setTimeout(map,100);
		});
		tb.addTop({label:'map',obj:mapa});
		
		/*/mostra resumo world
		vr.sort(fs);
		vr.length = Math.min(vr.length,20);
		domObj({tag:'h2','':'World Summary - ('+opTipo+')',targ:ds});bd.toDom(ds,20,vr);
		*/
		
		//dados do mundo
		vDia.sort(fs);
		tb.add({label:dt,obj:[
			domObj({tag:'h2','':'world '+dt+'  - ('+opTipo+')'})
			,tabEventos(bd.toDom({limit:999,values:vDia}))
		]});
		
	}
	//***************************
	function mostraPais(tb) {
		dt=''; 
		bd.top();
		bd.eval(function(){
			//dt e max dias - bd está em ordem data.
			if (bd.get('location')==Pais && dt<bd.get('date') ) {
				dt = bd.get('date');
				aeval(days,function(x) {x[3] = bd.get(x[0]);}); //days maximos
			} 
		});

		var pop = bdC.getNum('Population','xx',''+bdC.idx[Pais]);
		var tPais = Pais+' - '+format(pop,0)+' hab. - '+dt ;

		//monta evol ranking pais ult ne days
		var ne = 14;
		var bl = new bancoDados('evol '+Pais);
		bl.className = 'eGeral';
		//lert('dt='+dt);
		for (var i=0;i<ne;i++) {
			bl.addReg(); 
			aeval(days,function(x) {
					var ne1 = ne-i-1; //6-i
					bl.set('date',leftAt(dataSql(strToData(dt).getTime()-ne1*1000*3600*24),' '));
					var d = x[3]-ne1;
					bl.set('day '+x[0],(d<1?'-':d+'º day'));
					bl.set('position '+x[0],(d<1?'-':getPos(Pais,x[0],x[3]-ne1)+'º'));
			});
		}
		
		// monta resumo pais, mundo e dias
		// date 0,location 1,new_cases 2,new_deaths 3,total_cases 4,total_deaths 5+days_c50 6+days_Nzero 7
		bd.top();
		var vp=[],vr=[],ods = new total(2),totD=-1;
		vDia = [];
		aeval(days,function(x){x[4]=[];});
		while (bd.next()) {
			var lo = bd.get('location');
			var nc = bd.getNum('new_cases',0);
			var nd = bd.getNum('new_deaths',0);
						
			//dados pais
			if (lo==Pais && nc+nd
					+bd.getNum('total_cases',0)+bd.getNum('total_deaths',0)>0 ) {
				vp[vp.length] = bd.getVetor();
				totD = bd.getNum('total_deaths',0);
			}
			//dados mundo
			if (bd.get('date')==dt && bd.getNum('total_cases',0)>-1) {
				//resumo
				if (bd.get(days[0][0])>0) {
					vr[vr.length] = bd.getVetor();
				}
				vDia[vDia.length] = bd.getVetor();
			}
			//dados dias
			aeval(days,function(x) {
				if (bd.get(x[0])==x[3] && x[3] > 0) { //igual ao days do pais
					x[4][x[4].length] = bd.getVetor();
				}
			});
			//dia semana
			var dds = bd.getDate('date').getDayStr();
			if (Pais==lo || 'World'==lo) {
				ods.inc([lo,dds,nc,nd]);
				ods.inc([lo,'*',nc,nd]);
			}
		}

		//monta e mostra grafico país
		var vg = [],vg1 = [],vg2 = [];
		var vv = 9;//days[0][0];
		aeval(vp,function(x){
			//if (x[vv]>0) {
				//var p = ;
				var lb = '<b>'+strToDate(x[0]).getDayStr3()+'</b> '+x[0]+'<br><b>'+x[vv]+'</b>º day'
				//vg[p] = [ x[0]+'\n'+strToDate(x[0]).getDayStr3()+' '+x[vv]+'º day', 1*x[7] ];
				//vg1[p] = [ vg[p][0], 1*x[6] ];
				vg2[vg2.length] = [ lb, 1*x[6], 20*x[7], 20*x[10] ];
				
			//}
		});
		//date	location	new_cases	new_deaths	total_cases	total_deaths	
		//lert(' vg='+vg2);
		var d = opTipo.indexOf('cases')!=-1?0:2;
		var gr = new graphLine({
			scales:false
			//,title:'meu gráfico dsf'
			,data:vg2
			,label:['data','casos','mortes','mortes/dias']
			,color:['blue','red','#ff00ff']
			,title:['covid-19 - '+Pais
				,'<tspan style="fill:red;">'+cmp[1]+' - '+format(vg2[vg2.length-1][2]/20,2)+'</tspan>'
					+' X <tspan style="fill:#ff00ff;">'+cmp[3]+'/days - '+format(vg2[vg2.length-1][3]/20,2)+'</tspan>'
					+' X <tspan style="fill:blue;">'+cmp[0]+' (1/20) - '+format(vg2[vg2.length-1][1],2)+'</tspan>'
					+' - averange '+dMd+' days'
				,'until: '+dt+' inhab.: '+format(pop,0)+' '+cmp[3]+': '+format(totD,0)
			]
			,labelData: [''
				,function(vd){return vd[0]+'<br><br>'+cmp[0]+': <b>'+format(vd[1],d)+'</b>';}
				,function(vd){return vd[0]+'<br><br>'+cmp[1]+': <b>'+format(vd[2]/20,d)+'</b>';}
				,function(vd){return vd[0]+'<br><br>'+cmp[3]+'/days: <b>'+format(vd[3]/20,d)+'</b>';}
			]
		});	

		if (vg2.length==0) {
			alert('vp.l='+vp.length+' vp='+vp);
		}

			
		tb.addTop({label:'Graph',obj:[
			//domObj({tag:'h2','':tPais+' - ('+opTipo+')'})
			domObj({tag:'p','':'&nbsp;'})
			,gr.toDom()
			//,domObj({tag:'h3','':vMd1})
			//,domObj({tag:'div','':(new graphLine(vg,{min:0,label:false,scalesx:true,titles:'teste'})).toHtml()})
			//,domObj({tag:'div','':(new graphBar(vg1,{label:false})).getHtml()})
			// se perde ,(new graphBar(vg,{label:false,scales:true,min:5})).toDom()
			//,domObj({tag:'h3','':vMd})
			//,domObj({tag:'div','':(new graphBar(vg,{label:false})).getHtml()})
		]});

		//dados país
		vp.sort(function(a,b) { return fSort(a[0],b[0],true); });
		tb.addTop({label:'Data',obj:[
			domObj({tag:'h2','':tPais+' - ('+opTipo+')'})
			,tabEventos(bd.toDom({limit:999,values:vp}))
		]});

		//ranking dias do país
		tb.addTop({label:'ranking',obj:[
			domObj({tag:'h2','':'Evolution of the position: '+tPais+' - ('+opTipo+')'})
			,bl.toDom({limit:999})
		]});		

		//mostra dias
		aeval(days,function(x,nc) {
			x[4].sort(fs);
			var axa=tabEventos(bd.toDom({limit:999,values:x[4]}));
			axa.className += ' days_'+nc;
			tb.addTop({label:x[1],obj:[
				domObj({tag:'h2','':tPais+' <b style="color:blue;">'+x[3]+'º</b> '+x[1]+' - ('+opTipo+')'})
				,axa
			]});
		});
		
		//show dow
		// totais
		var tp = ods.getRow([Pais,'*']);
		var tw = ods.getRow(['World','*']);
		//add %
		ods.aeval(function(v) {
			var t = equals(v[0],Pais)?tp:tw;
			v[4] = v[2]/t[2]*100;
			v[5] = v[3]/t[3]*100;
		});
		ods.sort(function(a,b){return fSortCols(a,b,[5,4],[1,1]);});
		ods.cab = '<th>loc<th>dow<th>new cases<th>new deaths<th>% cases<th>% deaths';
		ods.dec = [0,0,1,1];
		tb.addTop({label:'dow',obj:[
			domObj({tag:'h2','':tPais+' notifications by day of the week'})
			,ods.show()
		]});

	}
	//***************************
	function mostraA() {
		//procura pais e pega dt, days maximos do país
		//	e monta option selects
		dt=''; 
		bd.top();
		bd.eval(function(){
			//dt e max dias - bd está em ordem data.
			if (bd.get('location')==Pais && dt<bd.get('date') ) {
				dt = bd.get('date');
				aeval(days,function(x) {x[3] = bd.get(x[0]);}); //days maximos
			} 
		});

		var pop = bdC.getNum('Population','xx',''+bdC.idx[Pais]);
		var tPais = Pais+' - '+format(pop,0)+' inhab.';
		
		//mostra data
		domObj({tag:'h1',style:'margin:0;color:red;'
			,'':dt
		,targ:ds});
		
		//mostra mapa
		if (true) {
		mapa = domObj({tag:'div',style:'width:100%;',targ:ds,style:''});
		(new carregaUrl()).abre(arqMap,function(a,b,tx) {
			//lert('tx='+tx.length);
			domObj({tag:'p','':'???',targ:mapa});
			domObj({tag:'div',targ:mapa}).innerHTML = tx;
			setTimeout(map,100);
		});
		}
			
		//monta evol ranking pais ult ne days
		var ne = 14;
		var bl = new bancoDados('evol '+Pais);
		bl.className = 'eGeral';
		//lert('dt='+dt);
		for (var i=0;i<ne;i++) {
			bl.addReg(); 
			aeval(days,function(x) {
					var ne1 = ne-i-1; //6-i
					bl.set('date',leftAt(dataSql(strToData(dt).getTime()-ne1*1000*3600*24),' '));
					var d = x[3]-ne1;
					bl.set('day '+x[0],(d<1?'-':d+'º day'));
					bl.set('position '+x[0],(d<1?'-':getPos(Pais,x[0],x[3]-ne1)+'º'));
			});
		}
		
		// monta resumo pais, mundo e dias
		// date 0,location 1,new_cases 2,new_deaths 3,total_cases 4,total_deaths 5+days_c50 6+days_Nzero 7
		bd.top();
		var vd=[],vp=[],vr=[],ods = new total(2);
		aeval(days,function(x){x[4]=[];});
		while (bd.next()) {
			var lo = bd.get('location');
			var nc = bd.getNum('new_cases',0);
			var nd = bd.getNum('new_deaths',0);
						
			//dados pais
			if (lo==Pais && nc+nd
					+bd.getNum('total_cases',0)+bd.getNum('total_deaths',0)>0 ) {
				vp[vp.length] = bd.getVetor();
			}
			//dados mundo
			if (bd.get('date')==dt) {
				//resumo
				if (bd.get(days[0][0])>0) {
					vr[vr.length] = bd.getVetor();
				}
				vd[vd.length] = bd.getVetor();
			}
			//dados dias
			aeval(days,function(x) {
				if (bd.get(x[0])==x[3] && x[3] > 0) { //igual ao days do pais
					x[4][x[4].length] = bd.getVetor();
				}
			});
			//dia semana
			var dds = bd.getDate('date').getDayStr();
			if (Pais==lo || 'World'==lo) {
				ods.inc([lo,dds,nc,nd]);
				ods.inc([lo,'*',nc,nd]);
			}
		}
		
		//monta e mostra grafico
		var vg = [];
		var vv = 7;//days[0][0];
		aeval(vp,function(x){
			if (x[vv]>0) {
				vg[vg.length] = [ strToDate(x[0]).getDayStr3()+'\n\n'+x[0]+
					+'\n'+x[vv]+'º day', 1*x[6] 
				];
			}
		});
		//date	location	new_cases	new_deaths	total_cases	total_deaths	
		//lert('vv='+vv+' vg='+vg);
		vg.sort(function(a,b){return fSort(1*a[0],1*b[0]);});
		domObj({tag:'h2','':tPais+' - '+vMd+' - ('+opTipo+')',targ:ds})
		domObj({tag:'div',targ:ds,'':(new graphBar(vg,{label:false})).getHtml()});
		
		//mostra resumo world
		vr.sort(fs);
		vr.length = Math.min(vr.length,20);
		domObj({tag:'h2','':'World Summary - ('+opTipo+')',targ:ds});bd.toDom(ds,20,vr);

		//show dow
		// totais
		var tp = ods.getRow([Pais,'*']);
		var tw = ods.getRow(['World','*']);
		//add %
		ods.aeval(function(v) {
			var t = equals(v[0],Pais)?tp:tw;
			v[4] = v[2]/t[2]*100;
			v[5] = v[3]/t[3]*100;
		});
		ods.sort(function(a,b){return fSortCols(a,b,[5,4],[1,1]);});
		domObj({tag:'h2','':'notifications by day of the week',targ:ds});
		ods.cab = '<th>loc<th>dow<th>new cases<th>new deaths<th>% cases<th>% deaths';
		ods.dec = [0,0,1,1];
		ds.appendChild(ods.show());

		
		//ranking dias do país
		domObj({tag:'h2','':'Evolution of the position: '+tPais+' - ('+opTipo+')',targ:ds});bl.toDom(ds,999);		

		//mostra dias
		aeval(days,function(x,nc) {
			x[4].sort(fs);
			domObj({tag:'h2','':tPais+' <b style="color:blue;">'+x[3]+'º</b> '+x[1]+' - ('+opTipo+')',targ:ds});
			bd.toDom(ds,999,x[4]);
			var tb = ds.lastChild;
			tb.className += ' days_'+nc;
		});
		
		//dados país
		vp.sort(function(a,b) { return fSort(a[0],b[0],true); });
		domObj({tag:'h2','':tPais+' - ('+opTipo+')',targ:ds});bd.toDom(ds,999,vp);

	}
	//***************************
	function on(s) {
		if (!ds) {
			document.body.innerHTML += '<p>'+s+'</p>';
			return;
		}
		var p = doc.createElement(p);
		p.innerHTML = s;
		ds.appendChild(p);
	}
	//***************************
	function init() {
		/*pd.putJk = pd.putJ;
		pd.putJ = function(n,v) {
			pd.putJk(n,v);
			estatWWW();
		}
		*/
		window.addEventListener( "hashchange", function( event ) {
			//lert('alterou');
			estatWWW();
		});
		
		/*
		var obs = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (eu.oldHref != document.location.href) {
                    eu.oldHref = document.location.href;
                    estatWWW();
                }
            });
        });
		obs.observe(document.querySelector("body")
			, {childList: true,subtree: true}
		);
		*/
		
		//inicio
		ds = browse.getId(id);
		if (!ds) { 
			on('nenhum id='+id+'...');
			return;
		}
		
		//destino controles
		dsC = domObj({tag:'div',class:'covidCtrl',targ:ds});
		//destino 
		ds = domObj({tag:'div',class:'covidRes',targ:ds});
		
		rn = new running(ds,true);
		
		//carrega dados
		if (!pd.get('filtro')) {
			filtro = trimm(prompt('load database'
				+'\n'
				+'\n1 - países'
				+'\n2 - brasil'
				+'\n2 xx xx xx= UF br'
				,filtro
			));
		}
		eu.ti = ms();
		var op = {},nop=0;
		op.timeout = 60;
		op.callback = carregaFim;
		if (filtro.indexOf('1')!=-1) {
			op[nop++] = {url:'dados/countries.csv?k1'+format(ms()/(1000*60*10),0),callback:carregaGeo};
			op[nop++] = {url:'dados/last.csv?dt'+format(ms()/(1000*60*10),0),callback:carregaOms};
		}
		if (filtro.indexOf('2')!=-1) {
			op[nop++] = {url:'dados/lastbr.csv?dt'+format(ms()/(1000*60*10),0),callback:carregaBR}
		}
		if (true) {
			new loader(op);
		} else {
			new loader({timeout:60
				,0:{url:'dados/countries.csv?k1'+format(ms()/(1000*60*10),0),callback:carregaGeo}
				,1:{url:x+'?dt'+format(ms()/(1000*60*10),0),callback:carregaOms}
				,2:{url:'dados/lastbr.csv?dt'+format(ms()/(1000*60*10),0),callback:carregaBR}
				,callback:carregaFim
			});
		}
	}
	//***************************
	function carregaGeo(tx) {
		//Rank 	Country	obs	Population 	Date 	Source	s2
		bdC = new bancoDados();
		bdC.setTxt(tx);
		//lert(typeof(idx['China'])+' idx='+obj(idx));

		//ds.innerHTML = ''; 
		//bdC.toDom(ds,999);
	}
	//***************************
	function carregaOms(tx) {
		//carrega dados oms / ourworldindata.org
		//lert('tx='+tx);
		//date,location,new_cases,new_deaths,total_cases,total_deaths+days_c50+days_Nzero
		var v = 'date,location,new_cases,new_deaths,total_cases,total_deaths'.split(',');
		var bdOms1 = new bancoDados();
		bdOms1.dlCol = ',';
		bdOms1.setTxt(tx);
		//CRIA BD
		bdOms = new bancoDados();
		bdOms.mult = 1; 
		bdOms1.top();
		while (bdOms1.next()) {
			bdOms.addReg();
			aeval(v,function(v) {
				bdOms.set(v,bdOms1.get(v));
			});
		}
	}
	//***************************
	// exclui dias duplos duplos
	function carregaBRbugRegDuplos(br) {
		var r = 0;
		aeval(br,function() {r++; br.put('_reg',r);});
		var vord = ['regiao','coduf','codmun','data','_reg'];
		br.sort(vord);
		var qb = [],xxi=0,xxd=0;
		br.eval(function(x){
			var ch = br.getArr(vord);
			if (qb==ch) {
				xxi++;
			} else {
				qb = br.getArr(vord);
				xxd++;
			}
		});
		alert('ig='+xxi+' dif='+xxd);
	}
	//***************************
	function carregaBR(tx) {

		//dados paises não carregados.
		if (!bdC) {
			bdC = new bancoDados();
			bdOms = new bancoDados();
		}
		
		//return;
		// blob:https://covid.saude.gov.br/bfe25a06-731e-4063-97aa-648840ab26ef
		// blob:https://covid.saude.gov.br/a615cf8c-346e-42f2-b6ea-0449f41a26f5
		//lert('br='+tx.length);
		br = new bancoDados();
		br.dlCol = '\t';
		br.dlCol = ';';
		br.setTxt(tx);//,function(v){return v[1]=='RS'});
		//return;
		
		//bug 2
		//carregaBRbugRegDuplos(br);
		var rrr = 0;
		br.eval(function() {rrr++; br.set('_reg',rrr);});
		br.sort('regiao,coduf,codmun,data,_reg');
		/*br.sort('regiao,coduf,codmun,data,_reg');
		//br.sort('regiao,coduf,codmun,data');
		br.eval(function(){ var 
			ch=br.getArr(['regiao','coduf','codmun','data']);
			if (ch==rrr) alert('rrr='+rrr+' ch='+ch);
			rrr=ch
		});
		*/

		//formato regiao	estado	municipio	coduf	codmun	codRegiaoSaude	nomeRegiaoSaude	data	semanaEpi	populacaoTCU2019	casosAcumulado	obitosAcumulado	Recuperadosnovos	emAcompanhamentoNovos
		var t = new total(2);
		var tc = {};
		br.top();
		var mua='?',cma='?',popa,vtp={};
		var caa,oaa,tr1=0,tr2=0;
		var corr = false;//confirm('fazer correções acumulados "dobrados" ou zerados dos municípios br?');
		var ecorr=new estat('municipios corrigidos');
		var fil = false;
		if (filtro.length>5) {
			fil = true;
			filtro = ' '+trimm(filtro.toUpperCase())+' ';
		}
		//lert(filtro+' '+filtro.length);
		try {
		while (br.next()) {
			//padroniza data
			var dt = dateSql(strToDate(br.get('data')));
			//ignora bugs, lixo?...
			if ((equals(dt,'2020-05-30') && br.getNum('semanaEpi')==22)||br.get('data')=='') {
				continue;
			}
			var uf = br.get('estado');
			if (fil && filtro.indexOf(' '+uf+' ')==-1) {
				continue;
			}
			var mu = br.get('municipio');
			var pop = br.getNum('populacaoTCU2019');
			var ca = br.getNum('casosAcumulado');
			var oa = br.getNum('obitosAcumulado');
			
			
			var cm = br.get('codmun');
			//REMENDO 1 erro planilha.
			if (cm!='') {
				//alert(mu+' mua='+mua+'\n'+cm.substring(0,6)+'=='+cma.substring(0,6));
				cm = cm.substring(0,6);
				if (mu==''&&cm==cma) {
					mu = mua;
					pop = popa;
					tr1++;
				}
				//REMENDO acumulados muns após apagão de dados 5a12/11/2020 e véspera 1o turno 15/11
				// foi lançado em 10/11 acumulados muns como novos
				if (corr && cma==cm) {
					if (ca>200 && ca-caa>caa*0.9) { ecorr.inc(uf+' '+mu,1);ca = ca/2;tr2++;} //se QSE duplicou pega metade
					if (ca==0 && caa>10) {ecorr.inc(uf+' '+mu,1);ca = caa;tr2++}; //se 0 pega anterior
					if (oa>200 && oa-oaa>oaa*0.9) {ecorr.inc(uf+' '+mu,1);oa = oa/2;tr2++;}
					if (oa==0 && oaa>10) {ecorr.inc(uf+' '+mu,1);oa = oaa;tr2++};
				}
			}
			mua = mu;
			cma = cm;
			popa = pop;
			//remendo 2
			caa = ca;
			oaa = oa;
			
			
			//lert(br.get('data')+' -> '+dataSql(br.get('data'))+' -> '+dt);
			if (false&&mu==''&&cm!='') {
				//eu estava filtrando pelo nome do mun vazio e somando como tot uf dados
				//   estaduais sem classificação de municipio. é o codmun tem q ser vazio 
				//	 para totais uf e br
				/*uf = uf+'*sem*nome';
				t.inc([uf,dt,ca,oa]);
				if (!tc[uf]) tc[uf] = pop;
				uf = substrAt(uf,'*');
				t.inc([uf,dt,ca,oa]);
				if (!tc[uf]) tc[uf] = pop;*/
			} else if (br.get('coduf')==76) {
				//tot br
				t.set([uf,dt,ca,oa]);
				if ( !tc[uf] && pop>0 ) tc[uf] = pop;
			} else if ( cm!='' && (pop<popMin||isNaN(pop)) ) {
				// dados municipio menores, por intervalos
				uf = '?';
				var ii=0;
				for (var i=0;i<popMinV.length;i++) {
					if (pop<popMinV[i]) {
						uf = format(ii,0)+' a '+format(popMinV[i],0)+' inhab.';
						break
					}
					ii = popMinV[i];
				}
				t.inc([uf,dt,ca,oa]);
				//soma pop
				if (pop>0 && !vtp[uf+mu]) {
					vtp[uf+mu] = true;
					if (!tc[uf]) {
						tc[uf] = 0;
					}
					tc[uf] += pop;
				}
			} else if (uf=='') {
			} else { //dados ufs
				if (!vazio(mu)) uf += ' '+mu;//+'*'+cm;
				t.set([uf,dt,ca,oa]);
				if ( !tc[uf] && pop>0 ) tc[uf] = pop;
			}
		} //fim bd.next
		} catch (e) {
			alertDev('erro carregaBr '+e+' '+br.getVetor()+'\n\n'+erro(e));
		}
		
		//if (tr1>0) alert(tr1+' correções feitas relativo identificação dos municipios br');
		if (tr2>0) {
			alert(tr2+' correções feitas acumulado lançado como novos nos municipios br');
			alert('corrigidos - valores %\n\n'+ecorr.toTxt());
		}
		
		var v = t.getVector();
		v.sort(function(a,b) {return fSortCols(a,b,[0,1])});
		//var db = '';
		//aeval(v,function(v) {db+=v+'~';});
		//bjNav(domObj({tag:'pre',targ:doc.body,'':db}));
		var qb='?z',va1,va2;
		aeval(v,function(v) {
			if (v[0]!=qb) {
				va1=0;va2=0;
				qb=v[0];
			}
			bdOms.addReg();
			var d = dataSql(strToData(v[1]).getTime()+1000*60*60*24);
			bdOms.set('date',leftAt(d,' ') );
			bdOms.set('location','*BR '+v[0]);
			bdOms.set('new_cases',v[2]-va1);
			bdOms.set('new_deaths',v[3]-va2);
			bdOms.set('total_cases',v[2]);
			bdOms.set('total_deaths',v[3]);
			//lert(v[1]+' '+bdOms.getVetor()+' '+strToData(v[1]));
			va1 = v[2];
			va2 = v[3];
		});
		//lert('vs.tam='+v.length+' '+bdOms.count());
		
		//bd populaçao
		aeval(tc,function(v,k) {
			bdC.addReg();
			bdC.set('Country','*BR '+k);
			bdC.set('Population',v);
		});
		
	}
	//***************************
	function carregaFim(ld) {
		//lert('tempo ='+(ms()-eu.ti));	
		//lert('br='+ld);
		//erro load ?
		if (ld.error) {
			if (confirm('error: loading data !\n'+ld.error+'\n\nReload ?')) {
				window.location = (new pedido()).set('ms',ms()).atalho();
				return;
			}
		} 

		//indexa Geo
		bdC.idx = bdC.index('Country',true);

		//tit ?
		if (filtro.indexOf('1')!=-1) totTag(bdOms);
		calcMediaDias(bdOms);

		//calcula bd por habitantes
		bdPop = new bancoDados('por '+div+' habitantes');
		bdPop.mult = 50000000/div; //multiplicador de limites
		bdOms.eval(function() {
			bdPop.addReg();
			var l = bdOms.get('location');
			bdPop.set('date',bdOms.get('date'));
			bdPop.set('location',l);
			var pop = -1;
			var rg = bdC.idx[l];
			//lert('l='+l+' rg='+rg);
			if (typeof(rg)=='number') {
				bdC.reg(rg);
				pop = bdC.getNum('Population');
				if (l=='dsfBrazil') {
					alert('l='+l+' rg='+rg+' pop='+bdC.getVetor());
				}
			}
			//arredonda em casas
			aeval(cmp,function(x) {
				bdPop.set(x,Math.floor(bdOms.getNum(x,0)*div*casas/pop+0.5)/casas);
			});
		});

		calcMediaDias(bdPop,true);
		
		//redefine mostrar campo
		bdOms.showField = function(rg,cmp) {
			if (cmp==0) {
				return rg[cmp]+' '+strToDate(rg[cmp]).getDayStr3();
			} else if (cmp==1) {
				return rg[cmp];
			}
			//lert('mult='+bdPop.mult);
			return format(rg[cmp]*1,0);
		}		
		bdPop.showField = function(rg,cmp) {
			if ( (cmp<2 || cmp>7) && cmp!=10 ) {
				return rg[cmp];
			}
			return format(rg[cmp]*1,2);
		}		

		//MOSTRA
		bd = (opTipo=='cases'?bdOms:bdPop); //bd ativo
		//carrega controles
		mostraContr();
		
		//load fim
		rn.end();
		
		//mostra
		setTimeout(mostra,1000);
	}
	//***************************
	function calcMediaDias(bd,tp) {
		
		tp = tp?casas:1;
		
		// ORDENA paisDias
		//		(a>b?1:(a<b?-1:0));
		bd.sort(function(a,b) {return a[1]>b[1]?1:(a[1]<b[1]?-1:
				(a[0]>b[0]?1:(a[0]<b[0]?-1:0)) //se 1a coluna ENTAO sort 2a coluna
		);});
		
		//calcula dias,media
		bd.top();
		var md,tn,l;
		while (bd.next()) {
			
			dti = dti>bd.get('date')?bd.get('date'):dti;
			dtf = dtf<bd.get('date')?bd.get('date'):dtf;
			
			var lo = bd.get('location');
			var ig = lo==bd.get('location','?',-1); //loc atual igual ao anterior

			//média [ 7 dias n ... n-6 ]
			if (dMd!=-5) {
				var ff = function(vMd,vr) {
					var tn=0;
					var md=0;
					for (var i=0;i<dMd;i++) {
						if (bd.get('location','?',-i)==lo) {
							tn++;
							md+=bd.getNum(vr,0,-i)
						};
					}
					bd.set(vMd,Math.floor(md/tn*tp+0.5)/tp);				
				}
				ff(vMd1,'new_cases');
				ff(vMd,'new_deaths');
				
			} else if (true) {
				var ff = function(vMd,vr) {
					//média 5 dias 2 antes e 2 depois
					var tn=0;
					var md=0;
					if (bd.get('location','?',-2)==lo) {tn++;md+=bd.get(vr,0,-2)*1};
					if (bd.get('location','?',-1)==lo) {tn++;md+=bd.get(vr,0,-1)*1};
					tn++;md+=bd.get(vr,0)*1;
					if (bd.get('location','?', 1)==lo) {tn++;md+=bd.get(vr,0, 1)*1};
					if (bd.get('location','?', 2)==lo) {tn++;md+=bd.get(vr,0, 2)*1};
					bd.set(vMd,Math.floor(md/tn*tp+0.5)/tp);
				}
				ff(vMd1,'new_cases');
				ff(vMd,'new_deaths');
				
			} else {
				//média ultimos 4 dias  new_deaths
				if (!ig) {
					md=[];
				}
				md[md.length] = bd.get('new_deaths',0)*1;
				var t = 0;
				for (var i=0;i<4;i++) {
					if (i<md.length) {
						t += md[md.length-i-1];
					}
				}
				bd.set('new_deaths_av_4d',Math.floor(t/Math.min(md.length,4)+0.5));
								
			}

			//incrementa contadores conforme vetor
			for (var i=0;i<days.length;i++) {
				//lert(days.length+' '+i);
				//bd.get('days+10md5',0,-1)*1
				var va = (ig?bd.get(days[i][0],0,-1)*1:0); //valor anterior
				bd.set(days[i][0],(days[i][2])(bd,va));
			}
			
			//md deaths / days
			bd.set("t.deaths /days+"+daysMd+"md"+dMd,
				bd.getNum("days+"+daysMd+"md"+dMd)==0?0:Math.floor(bd.getNum("total_deaths")/bd.getNum("days+"+daysMd+"md"+dMd)*100+0.5)/100
			);
		
			
		}
	}
	//***************************
	function totTag(bd) {
		aeval(tag,function(e){e[2] = {};}); //add totalizador por tag
		bd.top();
		while (bd.next()) {
			aeval(tag,function(e){
				var lo = bd.get('location');
				if (e[1].indexOf('~'+lo+'~')!=-1) {
					var ch = bd.get('date');
					var t = e[2][ch];
					if (!t) {
						t = Array(0,0,0,0,0);
						e[2][ch] = t;
					}
					t[0] += bd.get('new_cases',0)*1;
					t[1] += bd.get('new_deaths',0)*1;
					t[2] += bd.get('total_cases',0)*1;
					t[3] += bd.get('total_deaths',0)*1;
					var p = bdC.getNum('Population','xx',''+bdC.idx[lo]);
					if (p>100) t[4] += p;
				}
			});
		}
		//guarda no bd
		aeval(tag,function(e) {
			//lert('e='+e);
			var pop = 0;
			aeval(e[2],function(v,dt) {
				//lert('dt='+dt+' '+e[0]+' '+v);
				bd.addReg();
				bd.set('date',dt);
				bd.set('location','*'+e[0]);
				bd.set('new_cases',v[0]);
				bd.set('new_deaths',v[1]);
				bd.set('total_cases',v[2]);
				bd.set('total_deaths',v[3]);
				//max população da tag
				pop = Math.max(pop,v[4]);
			});
			//add tot população da tag
			bdC.addReg();
			bdC.set('Country','*'+e[0]);
			bdC.set('Population',pop);
			
		});
		//reindexa bdC
		bdC.idx = bdC.index('Country',true);
	}

}
