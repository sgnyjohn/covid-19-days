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
	https://coronavirus.jhu.edu/map.html

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
	var bdOms; //bd DADOS val abs
	var bdPop; //bd DADOS por população 
	var bdLoc; //bd Locais
	var div = 1000000;
	var casas = 100; 
	var cmp = 'new_cases,new_deaths,total_cases,total_deaths'.split(',');
	var dti='999',dtf='0'; //data maximo e minimo dos dados
	var dt; //data max do país
	var cron = new Cron('tempos');
	//ORDEM PADRÃO... era 6 e 4 -> 7 e 6 -- md new deat+tot cases -> md new deat+md new case
	var fs = function(a,b) {
			return fSort(strZero(a[7]*1000,8)+strZero(a[6]*1000,8)
				,strZero(b[7]*1000,8)+strZero(b[6]*1000,8)
				,true
			);
		};
	var popMinV = [20000,50000,100000,200000,500000,1000000,2000000,5000000,20000000,50000000,100000000];
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
	var tag=[];
	//lert('days='+days);
	var map;
	var tb;
	var vDia;
	var rn;
	var vPais = [];

	var pd = new pedido();pd.updUrlJ = true;
	var opTipo = pd.getJ('opTipo','per million inhabitants');
	var Pais = pd.getJ('Pais','Brazil');
	var popMin = pd.getNum('popMin',200000);
	var dMd = pd.get('dMd',7);
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
	var filtro = pd.get('filtro','2'); //filtrar bd
	var paisClick;
	var addRebanhoO;
	var abaVarO;
	setTimeout(init,1000);
	//***************************
	// log, debug
	function log(a) {
		console.log(a);
	}
	//***************************
	// retorna população
	function getPop(lo) {
		if (!bdLoc.idxLoc) {
			bdLoc.idxLoc = bdLoc.index('loc',true);
		}
		var pop;
		var rg = bdLoc.idxLoc[lo];
		//lert('l='+l+' rg='+rg);
		if (typeof(rg)=='number') {
			bdLoc.reg(rg);
			pop = bdLoc.getNum('pop');
			if (!pop) deb(lo+' existe mas pop='+pop+' rg='+rg,1);
		} else {
			deb(lo+' não existe',1);		
		}
		return pop;
	}
	//***************************
	// aba variações
	function abaVariacoes(ds) {
		//f conta quantas semanas subindo vr
		function abaVarSemanas(vr) {
			//var l = bdOms.get('location');
			var r = 0;
			while (bdOms.get('location',0,-r*7-1)==l) {
				if (bdOms.getNum(vr,0,-r*7)<=bdOms.getNum(vr,0,-r*7-7)) break;
				r++;
			}
			//vlr atual/-r*7+7
			var percent_medio = Math.pow(bdOms.getNum(vr,0,0)/bdOms.getNum(vr,0,-r*7),1/r)*100-100;
			console.log(vr+' '+l+' '+bdOms.getNum(vr,0,0)+'/'+bdOms.getNum(vr,0,-r*7)+' %'+percent_medio+' r='+r);
			return [r,percent_medio];			
		}
		if (!abaVarO) {
			//ds.innerHTML = '<h1>vra</h1>';
			var b = [];
			//bd ordenado location,data. procura datas pre escolhidas.
			bdOms.top();
			var sErro = '';
			var l,nv=0;
			while (bdOms.next()) {
				var l1 = bdOms.get('location',0,1);
				//eb(l+' '+l1)
				//quebra na proxima? e tem inf 14 dias atras?
				if ( l1 != l && bdOms.get('location',0,-14)==l ) {
					var vd = [bdOms.getNum(vMd),bdOms.getNum(vMd,0,-7),bdOms.getNum(vMd,0,-14)];
					var pop = getPop(l);
					if (pop==0) {
						sErro += 'pop zero '+l+'\n';
					} else if (l && vd[0]>0 && vd[1]>0 && vd[2]>0) {
						//compara -2 semanas
						var rg = b.length;
						b[rg] = {};
						b[rg].loc = l;
						var vd = [bdOms.getNum(vMd),bdOms.getNum(vMd,0,-7),bdOms.getNum(vMd,0,-14)];
						b[rg].vd = vd;
						var vc = [bdOms.getNum(vMd1),bdOms.getNum(vMd1,0,-7),bdOms.getNum(vMd1,0,-14)];
						b[rg].vc = vc;
						b[rg].ds = abaVarSemanas(vMd);
						b[rg].cs = abaVarSemanas(vMd1);
						//guarda datas ref
						b[rg].vdt = [bdOms.get('date'),bdOms.get('date',0,-7),bdOms.get('date',0,-14)];
						b[rg].c0 = vc[0]/vc[1];
						b[rg].d0 = vd[0]/vd[1];
						b[rg].c1 = vc[1]/vc[2];
						b[rg].d1 = vd[1]/vd[2];
						b[rg].c = vc[0]/vc[2];
						b[rg].d = vd[0]/vd[2];
						b[rg].dm = vd[0]/pop*1000000;
						b[rg].cm = vc[0]/pop*1000000;
						nv++;
					}
				}
				l = l1;
			}
			var cb = '<tr><th rowspan=2>local<th rowspan=2>população<th colspan=5>% variação<br>@@<th colspan=4>@@'
				+'<tr><th>nro<br>semamas<br>em alta<th>% medio<br>p/semana'
					+'<th>ult<br>semana<th>semana<br>anterior<th>2 últimas<br>semanas'
				+'<th>'+dtf+'<th>-7 dias<th>-14 dias<th>'+dtf+'<br>milhão/hab.'
			;
			var t = '';
			b = b.sort((a1,b1)=>{return fSort(a1.d,b1.d,true);});
			aeval(b,(vl)=>{
				if (vl.d0>1 && vl.d1>1 ) {
					t += '<tr>'
						+'<td>'+vl.loc
						+'<td>'+format(getPop(vl.loc),0) //vl.vdt
						+'<td>'+format(vl.ds[0],0)
						+'<td>'+format(vl.ds[1],2)
						+'<td>'+format(vl.d0*100-100,2)
						+'<td>'+format(vl.d1*100-100,2)
						+'<td>'+format(vl.d*100-100,2)
						+'<td>'+format(vl.vd[0],0)
						+'<td>'+format(vl.vd[1],0)
						+'<td>'+format(vl.vd[2],0)
						+'<td>'+format(vl.dm,2)
					;
				}
			});
			var t1 = '';
			b = b.sort((a1,b1)=>{return fSort(a1.c,b1.c,true);});
			aeval(b,(vl)=>{
				if (vl.c0>1 && vl.c1>1 ) {
					t1 += '<tr>'
						+'<td>'+vl.loc
						+'<td>'+format(getPop(vl.loc),0) //vl.vdt
						+'<td>'+format(vl.cs[0],0)
						+'<td>'+format(vl.cs[1],2)
						+'<td>'+format(vl.c0*100-100,2)
						+'<td>'+format(vl.c1*100-100,2)
						+'<td>'+format(vl.c*100-100,2)
						+'<td>'+format(vl.vc[0],0)
						+'<td>'+format(vl.vc[1],0)
						+'<td>'+format(vl.vc[2],0)
						+'<td>'+format(vl.cm,2)
					;
				}
			});
			//deb('nv loc: '+nv);
			//_c(b);
			abaVarO = domObj({tag:'div'
				,'':'<br><h2>locais onde o % aumenta há 2 semanas</h2>'
				+'<br><table class=bdToDom border=1>'+troca(cb,'@@',vMd)+t+'</table><br>'
				+'<br><table class=bdToDom border=1>'+troca(cb,'@@',vMd1)+t1+'</table><br>'
				+'<pre>'+sErro+'</pre>'
			});
		}
		//_c(abaVarO.getElementsByTagName('table'));
		aeval(abaVarO.getElementsByTagName('table'),(vl)=>{
			//deb('add evento tab aumentos...');
			vl.className += ' aum';
			tabEventos(vl);
		});
		ds.appendChild(abaVarO);
	}
	//***************************
	// MONTA análise rebanho
	function abaRebanho(ds) {
		if (!addRebanhoO) {
			var tbe = '';
			bdOms.top();
			var b = {};
			var erPop = '';
			//pega dados da data mais recente de cada location
			while (bdOms.next()) {
				var l = bdOms.get('location');
				var d = bdOms.get('date');
				var r = b[l];
				// chars loc > 6 
				if (
					(!r || r[1]<d)   //loc já ou data menor
					&& (l.charAt(0)!='*'||l.length>6) //se br apenas cidade
					&& l.indexOf('<')==-1 // não tot de locais.
					) 
					{
					var p = getPop(l);
					if (!isNumber(p)) erPop+=', '+l;
					b[l] = [l,d,p
						,bdOms.getNum('total_deaths')
						,bdOms.getNum(vMd)
						,'?' //5 fx
						,bdOms.getNum('total_deaths')/p //6 mortandade
					];
				}
			}
			//transf VET
			var vb = [];
			var tPop = 0;
			aeval(b,(vl)=>{vb[vb.length] = vl,tPop+=vl[2];});
			b={};
			//ordena população
			tbe += '◦ '+vb.length+' localizações selecionadas ('
				+format(tPop,0)+' habitantes) ordenadas por população\n'
			;
			vb.sort((a,b)=>{return fSort(b[2],a[2]);});
			//lert(vb.length+' '+vb);
			//cria 7 faixas e marca nos regs
			tPop = tPop/7; //7 faixas
			tbe += '◦ localizações divididas em 7 faixas de população de aproximadamente '
				+format(tPop,0)+' habitantes cada\n'
			;
			var fx = 0, tp = 0 ;
			var ef = new estat('fx');
			aeval(vb,(v,i)=>{
				//acumula pop
				tp += v[2];
				v[5] = fx;
				ef.inc(''+fx,1);
				if (tp>tPop) {
					fx++ ; 
					tp = 0;
				}			
			});
		
			//reordena por faixa / total mortes
			tbe += '◦ localizações ordenadas por faixa e total de mortos/habitantes\n';
			vb.sort((a,b)=>{
				var r=fSort(a[5],b[5]); //fx 
				if (r==0) r=fSort(b[6],a[6]); //total death desc
				return r;
			});
			//divide faixas ao meio
			tbe += '◦ divide faixas ao meio (+mais mortos/hab) e (-menos mortos/hab)\n';
			var hf = ef.getVetor(); //hash contagem faixa
			//console.log(hf);
			var nf = 0;
			fx=0;
			aeval(vb,(v)=>{
				if (v[5]==fx) {
					nf++;
				} else {
					nf=0;
					fx=v[5];
				}
				//eb(fx+' '+v[5]+' '+hf[v[5]]);
				v[5] = v[5]+(nf==0||nf<Math.floor(hf[v[5]]/2)?'+':'-');
			});
			//////////////////////////
			//monta TOTAIS e MOSTRA
			var tb = '<table class=bdToDom border=1>'
				+'<tr><th>fx<th>nLoc<th>tPop<th>minPop'
				+'<th>maxPop<th>total_deaths<th>'+vMd+'<br>por milhão'
				+'<th>vidas poupadas'
			;
			var t; // pop,td*pop,d*pop,nv
			var mi = 1000000;
			fx = '0+';
			var fxM,fxA=''; //vlr + da fx e fx ant
			var vo=[];
			aeval(vb,(v,i)=>{
				//acumula
				if (!t) t={p:0,pmi:9999999999999,pmx:0,td:0,d:0,n:0};
				t.p+=v[2];
				t.pmi=Math.min(v[2],t.pmi);
				t.pmx=Math.max(v[2],t.pmx);
				t.td+=v[3];
				t.d+=v[4];
				t.n++;
				if (i+1==vb.length || vb[i+1][5]!=fx ) {
					//guarda em vo
					t.fx = fx;
					vo[vo.length] = clone(t);
					if (i+1!=vb.length) fx = vb[i+1][5];
					fxA = v[5].charAt(0);
					t=false;
				}
			});

			//mostra res.
			aeval(vo,(t,i)=>{
				var tr = i%2==0?vo[i+1]:vo[i-1];
				tb += (i%2==0?'<tr><td colspan=8>':'')
					+'<tr '+(t.fx.indexOf('+')!=-1?'class="plus"':'')+'>'
					+'<td>'+t.fx
					+'<td>'+format(t.n)
					+'<td>'+format(t.p) 
					+'<td>'+format(t.pmi)
					+'<td>'+format(t.pmx)
					+'<td>'+format(t.td/t.p*mi,2)
					+'<td>'+format(t.d/t.p*mi,2)
					+'<td>'+format((t.td/t.p-tr.td/tr.p)*t.p,0)
				;
			});


			addRebanhoO = [vb,domObj({tag:'div'
				,'':'<pre>'+tbe+'</pre>'
					+tb+'</table><br><hr>'
				,ev_click: (ev)=>{
					var fx = trimm(getParentByTagName(ev,'tr').childNodes.item(0).innerHTML,'+-');
					var t = '<table class=bdToDom style="border:14px solid #eeeeee;background-color:#444444;"'
						+'<tr><th>fx<th>loc<th>date<th>pop<th>mortos<th>tot mortos/mi<th>mortos dia'
					;
					aeval(addRebanhoO[0],(v)=> {
						if (trimm(v[5],'+-')==fx) {
							t += '<tr><td>'+v[5]+'<td>'+v[0]
								+'<td>'+v[1]
								+'<td>'+format(v[2],0)
								+'<td>'+format(v[3],0)
								+'<td>'+format(v[6]*1000000,0)
								+'<td>'+format(v[4]/v[2]*1000000,2)
							;
						}
					});
					if (addRebanhoO[2]) addRebanhoO[2].hide();
					addRebanhoO[2] = new contextDiv({
						dom:domObj({
							tag:'div'
							,class:'menuV'
							,'':t+'</table>'
							,ev_click:(a)=>{addRebanhoO[2].close();}
						})
					});
					addRebanhoO[2].center();						
				}
			}),false];
		}
		ds.appendChild(addRebanhoO[1]);	
			
	}
	//***************************
	// colore o mapa.
	var arqMap = 'BlankMap-World.svg?x=ef';
	//var arqMap = 'mundo2.svg';
	function mapaa(ev) {
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
				var s2 = bdLoc.get('s2','xx',''+bdLoc.idxLoc[loc]).toLowerCase(); //sigla pais 2x
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
		//campos
		if (o.name=='go') {
			window.location = pd.atalho();
			return;
		} else if (o.name=='Pais') {
			//selecionou country
			pais(o.value);
			return;
		} else if ('-filtro-'.indexOf('-'+o.name+'-')!=-1) {
			pd.put(o.name,trimm(o.value).toUpperCase());
			return;
		} else if ('-popMin-dMd-'.indexOf('-'+o.name+'-')!=-1) {
			pd.putNum(o.name,trimm(o.value));
			return;
		} else if (o.name=='opTipo') {
			//ds.innerHTML = '';
			//só paises ?
			if (o.value=='countries') {
				pd.putJ('opTipo',o.value);
				ds.appendChild(bdLoc.toDom());
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
		if (getPop(p)) { 
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
		var pos = tb.className.indexOf('aum')==-1?1:0;
		//negrita linhas país & colore tipo ugeo
		var tr = tb.getElementsByTagName('tr');
		for (var c=1;c<tr.length;c++) {
			try {
				var cp = tr[c].childNodes.item(pos);
				var p = cp.innerHTML;
				cp.setAttribute('title'
					,format(getPop(htmlDecode(p)),0)
						+' hab. ('+c+'º)'
						//+' fonte: '+getFonte(htmlDecode(p))
				);
				//negrita linha país
				if (p==Pais) {
					//eb('pais '+p);
					tr[c].className = 'B';
					if (tb.className.indexOf('latest')!=-1) {
						//eb(Pais+' cl='+tb.className);
						if (!paisClick) {
							paisClick = domObj({tag:'table'
									,class:'bdToDom paisClick'
									,'':tr[0].cloneNode(true)
							});
						}
						var nv=tr[c].cloneNode(true);
						nv.className = '';
						paisClick.appendChild(nv);
					}
					//break;
				}
				if (p.substring(1).indexOf('*')!=-1) {
					cp.style.cssText += 'background-color:#8f8f8f;';//#CFEFFF
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
			,title:'filtrar FONTE: 1=ourworldindata 2=covid.saude.gov.br 3=coronavirus.jhu.edu'
			,ev_change:click
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
			,targ:dsC}
		);
		domObj({tag:'input',type:'button',name:'go'
			,style:'font-size:70%;max-width:40px;background:green;'
			,title:'days to calculate the moving average'
			,value:' ✔ ',ev_click:click
			,targ:dsC}
		);

	}
	//***************************
	function mostra() {
		estatWWW();
		var n = !tb;
		//lert('novo='+n+' '+pd);
		if (n) {
			ds.innerHTML = '';
			//mostra data
			domObj({tag:'h1',style:'margin:0;color:red;'
				,'':'covid-19'
			,targ:ds});

			//add tab
			tb = new tabs({dst:domObj({tag:'div',targ:ds}),ped:pd,tab:pd.getJ('tabs','0')});

			//projeto
			var u = 'https://github.com/sgnyjohn/covid-19-days';
			domObj({tag:'p',style:'font-size:80%;text-align:right;'
				,'':'project: <a href='+u+'>'+u+'</a>'
			,targ:ds});
			//fonte dados
			var u = 'https://coronavirus.jhu.edu/map.html';
			domObj({tag:'p',style:'font-size:80%;text-align:right;'
				,'':'data world and US: <a href='+u+'>'+u+'</a>'
			,targ:ds});
			var u = 'https://ourworldindata.org';
			domObj({tag:'p',style:'font-size:80%;text-align:right;'
				,'':'data world: <a href='+u+'>'+u+'</a>'
			,targ:ds});
			var u = 'https://covid.saude.gov.br/';
			domObj({tag:'p',style:'font-size:80%;text-align:right;'
				,'':'data .br: <a href='+u+'>'+u+'</a>'
			,targ:ds});		
		}
		mostraGeral(tb);
		mostraPais(tb);
		tb.show();
	}
	//***************************
	function mostraGeral() {
		// dados mundo, ultimo dia
		//lertDev('regs='+bd.count());
		vDia = [bd.getRow(bd.count()-1)];var loa;
		bd.top();
		while (bd.next()) {
			var lo = bd.get('location');
			//dados mundo - ultima informação por local - bd ordenado local, data
			if (loa!=lo) {
				if (loa && bd.getNum('total_cases',0,-1)>-1) 
					vDia[vDia.length] = bd.getVetor(bd.reg()-1);
				loa = lo;
			}
		}		
		
		//mostra mapa
		if (bdLoc && false) {
			mapa = domObj({tag:'div',style:'width:100%;',style:''});
			(new carregaUrl()).abre(arqMap,function(a,b,tx) {
				//lert('tx='+tx.length);
				domObj({tag:'p','':'???',targ:mapa});
				domObj({tag:'div',targ:mapa}).innerHTML = tx;
				setTimeout(map,100);
			});
			tb.addTop({label:'map',obj:mapa});
		}
		
		/*/mostra resumo world
		vr.sort(fs);
		vr.length = Math.min(vr.length,20);
		domObj({tag:'h2','':'World Summary - ('+opTipo+')',targ:ds});bd.toDom(ds,20,vr);
		*/
		
		//dados todo mundo
		//lert('vDia:'+vDia);
		vDia.sort(fs);
		var tit='latest data - ('+opTipo+')<br>'
			+' population greater '+format(popMin,0)
		;
		//eb(vDia,vDia);
		tb.add({label:'latest',title:tit, obj:[
			domObj({tag:'h2','':tit})
			,tabEventos(bd.toDom({class:'latest',limit:999,values:vDia,fields:(a,i)=>{return i<8;}}))
		]});
		
		/////////////////////
		tb.addTop({label:'&nbsp;⬆⬇&nbsp;' ,obj:[
			abaVariacoes
		]});//			domObj({tag:'h2','':'maiores variações'})

		/////////////////////
		tb.addTop({label:'rebanho',obj:[
			domObj({tag:'h2','':'rebanho'})
			,abaRebanho
		]});
		
	}
	//***************************
	function mostraPais(tb) {
		//mostra país
		deb('pais='+Pais);
		//calcula data máxima do país
		if (!dt) {
			dt=''; 
			bd.top();
			bd.eval(function(){
				//dt e max dias - bd está em ordem data.
				if (bd.get('location')==Pais && dt<bd.get('date') ) {
					dt = bd.get('date');
					//alert(Pais+' '+dt);
					aeval(days,function(x) {x[3] = bd.get(x[0]);}); //days maximos
				} 
			});
		}
		//pop
		var pop = getPop(Pais);
		if (pop<1) {
			alert(Pais+' missing population');
			return;
		}
		var tPais = Pais+' - '+format(pop,0)+' hab. - '+dt ;
		//lert('dt='+dt+' pop='+pop+' tPais: '+tPais);

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
		var vp=[],vr=[],ods = new total(2),totD=-1;
		// dados mundo, ultimo dia
		//vDia = [bd.getRow(bd.count()-1)];var loa;
		aeval(days,function(x){x[4]=[];});
		bd.top();
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
			/*/dados mundo - ultima informação por local - bd ordenado local, data
			if (loa!=lo) {
				if (loa && bd.getNum('total_cases',0,-1)>-1) vDia[vDia.length] = bd.getVetor(bd.reg()-1);
				loa = lo;
			}*/
			//vr resumo?
			if (bd.get('date')==dt && bd.getNum('total_cases',0)>-1) {
				//resumo
				if (bd.get(days[0][0])>0) {
					vr[vr.length] = bd.getVetor();
				}
				//vDia[vDia.length] = bd.getVetor();
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
		//lert('vp='+vp.length+'\n\n'+vp);

		//não há localização selecionada válida
		if (vazio(dt)) {
			return;
		}

		//monta e mostra grafico país
		var fdt = 5;
		var vg = [],vg1 = [],vg2 = [];
		var vv = 9;//days[0][0];
		aeval(vp,function(x){
			//if (x[vv]>0) {
				//var p = ;
				//lert('x='+x+' '+strToDate(x[0]));
				var lb = '<b>'+strToDate(x[0]).getDayStr3()+'</b> '+x[0]+'<br><b>'+x[vv]+'</b>º day'
				//vg[p] = [ x[0]+'\n'+strToDate(x[0]).getDayStr3()+' '+x[vv]+'º day', 1*x[7] ];
				//vg1[p] = [ vg[p][0], 1*x[6] ];
				vg2[vg2.length] = [ lb, 1*x[6], 20*x[7], x[5]/fdt ];//, 50*x[10] ];
				
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
			,color:['blue','red','#ff00ff','#00ffff']
			,title:['covid-19 - '+Pais
				, '<tspan style="fill:red;">'+cmp[1]+' - '+format(vg2[vg2.length-1][2]/20,2)+'</tspan>'
					+' X <tspan style="fill:blue;">'+cmp[0]+' - '+format(vg2[vg2.length-1][1],2)+'</tspan>'
					+' X <tspan style="fill:#ff00ff;">'+cmp[3]+' - '+format(vg2[vg2.length-1][3]*fdt,2)+'</tspan>'
					//+' X <tspan style="fill:#00ffff;">'+cmp[3]+'/days - '+format(vg2[vg2.length-1][4]/50,2)+'</tspan>'
				,	opTipo+' - averange '+dMd+' days - until: '+dt+' inhab.: '+format(pop,0)//+' '+cmp[3]+': '+format(totD,0)	
			]
			,labelData: [''
				,function(vd){return vd[0]+'<br><br>'+cmp[0]+': <b>'+format(vd[1],d)+'</b>';}
				,function(vd){return vd[0]+'<br><br>'+cmp[1]+': <b>'+format(vd[2]/20,d)+'</b>';}
				,function(vd){return vd[0]+'<br><br>'+cmp[3]+': <b>'+format(vd[3]*fdt,d)+'</b>';}
				,function(vd){return vd[0]+'<br><br>'+cmp[3]+'/days: <b>'+format(vd[4]/50,d)+'</b>';}
			]
			,mxInit: 2*500
			,yScale: [{y:500,label:'new_cases: <b>500</b><br>new_deaths:<b>25</b><br>total_deaths:<b>2500</b>'}
				,{y:1000,label:'new_cases: <b>1000</b><br>new_deaths:<b>50</b><br>total_deaths:<b>5000</b>|'}]
		});	
		if (vg2.length==0) {
			alert('vp.l='+vp.length+' vp='+vp);
		}

		//objeto titulo/space
		tb.addTop({label:'Graph',obj:[
			//domObj({tag:'h2','':tPais+' - ('+opTipo+')'})
			domObj({tag:'p','':'&nbsp;'})
			,domObj({tag:'div',class:'graf','':[paisClick,domObj({tag:'br'}),gr.toDom()]})
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
			//,tabEventos(bd.toDom({limit:999,values:vp}))
			,(bd.toDom({limit:999,values:vp}))
		]});

		//if (verDias) {
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
		//}
		
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
		op[nop++] = {url:'dados/pop.csv?k1'+format(ms()/(1000*60*10),0),callback:carregaLoc};
		if (filtro.indexOf('1')!=-1) {
			//op[nop++] = {url:'dados/countries.csv?k1'+format(ms()/(1000*60*10),0),callback:carregaGeo};
			op[nop++] = {url:'dados/last.csv?dt'+format(ms()/(1000*60*10),0),callback:carregaOms};
		}
		if (filtro.indexOf('2')!=-1) {
			//op[nop++] = {timeout:120,url:'dados/pop.csv?dt'+format(ms()/(1000*60*10),0),callback:carregaBRpop};
			op[nop++] = {timeout:120,url:'dados/lastbr.csv?dt'+format(ms()/(dev()?1:1000*60*10),0),callback:carregaBR};
		}
		if (filtro.indexOf('3')!=-1) {
			//op[nop++] = {timeout:120,url:'dados/pop.csv?dt'+format(ms()/(1000*60*10),0),callback:carregaBRpop};
			op[nop++] = {timeout:120,url:'dados/hop.csv?dt'+format(ms()/(1000*60*10),0),callback:carregaBR};
		}
		if (true) {
			new loader(op);
		} else {
			/*new loader({timeout:60
				,0:{url:'dados/countries.csv?k1'+format(ms()/(1000*60*10),0),callback:carregaGeo}
				,1:{url:x+'?dt'+format(ms()/(1000*60*10),0),callback:carregaOms}
				,2:{url:'dados/BrPop.csv?dt'+format(ms()/(1000*60*10),0),callback:carregaBRpop}
				,3:{url:'dados/lastbr.csv?dt'+format(ms()/(1000*60*10),0),callback:carregaBR}
				,callback:carregaFim
			});
			*/
		}
	}
	//***************************
	function carregaLoc(tx) {
		//antigo -> Rank 	Country	obs	Population 	Date 	Source	s2
		//novo -> loc pop lat lon nv
		bdLoc = new bancoDados();
		bdLoc.addTxt(tx);
		if (bdLoc.count()<5000) {
			alert('ERROR database location, rows='+bdLoc.count());
		}
	}
	//***************************
	function carregaOms(tx) {
		//carrega dados oms / ourworldindata.org
		//lert('tx='+tx);
		//date,location,new_cases,new_deaths,total_cases,total_deaths+days_c50+days_Nzero
		var v = 'date,location,new_cases,new_deaths,total_cases,total_deaths'.split(',');
		var bdOms1 = new bancoDados();
		bdOms1.dlCol = ',';
		//lert('tx='+tx);
		bdOms1.addTxt(tx);
		//CRIA BD
		bdOms = new bancoDados();
		bdOms.mult = 1; 
		bdOms1.top();
		var pop=0,la='?';
		while (bdOms1.next()) {
			var l = bdOms1.get('location','');
			//linhas sem informações ignora
			if (l!=la) {
				la = l;
				pop = getPop(l);
			}
			if (pop<popMin) continue;
			if (bdOms1.getNum("total_cases")>0&&bdOms1.getNum("total_deaths")>0) {
				bdOms.addReg();
				aeval(v,function(v) {
					bdOms.set(v,bdOms1.get(v));
				});
			}
			/*alert(bdOms.reg()+' = '+bdOms.getRow()
				+'\n'+bdOms1.reg()+' = '+bdOms1.getRow()
			);
			*/
		}
	}
	//***************************
	function carregaBR(tx) {
		//lert(tx.length+'\n\n'+tx);
		//dados paises não carregados.
		
		if (!bdOms) {
			bdOms = new bancoDados();
		}		

		//import tx
		br = new bancoDados();
		br.dlCol = '\t';
		br.addTxt(tx);
	
		br.sort('location,date');
		
		var fil = false;
		if (filtro.length>3) {
			fil = true;
			filtro = ' '+trimm(filtro.toUpperCase())+' ';
		}		
		
		try {
			br.top();
			var nv=0,nb=0;
			var pop,la='';
			var vI = {};
			var vIn=0;
			while (br.next()) {
				nv++;
				var l = br.get('location');
				// *BR RS
				if (fil && l.charAt(0)=='*' && l.length>6 && filtro.indexOf(l.substring(3,7))==-1) {
					continue;
				}
				
				//houve quebra de local, carrega apenas com pop > que ...
				if (l!=la) {
					pop = getPop(l);
				}
				//corrige
				var fCorr = (t) => {
					//outro loc anterior ou posterior
					if (l!=la || l!=br.get('location','',1)) return;
					var c = 'total_'+t;
					// atual/ant >1.8 && prox/ant <1.8
					var v = br.getNum(c);
					var va = br.getNum(c,0,-1);
					var vp = br.getNum(c,0,1);
					/*if (l+br.get('date')=='*BR RS Porto Alegre2021-05-31') {
						alert(br.get('date')+' '+t+' '+l+' '+va+' '+v+' '+vp);
					}
					*/
					if (v/va>1.8 && vp/va<1.8) {
						nb++;
						debJ('data bug '
							+br.get('date')+' '+t+' loc='+l+' va='+va+' v='+v+' vp='+vp
						);
						br.set(c,br.getNum(c,0,1)); //atual igual ao prox
						//antecipa mortes.
						br.set('new_'+t,vp-va); //novos = prox-ant
						var ra = br.reg();
						br.next();
						br.set('new_'+t,0); //ZERA novos prox
						br.reg(ra);
					}
				}
				fCorr('cases');
				fCorr('deaths');

				if (vI[br.get('date')+l]) {
					//duplo, ignora.
					vIn++;
				} else if (pop>=popMin) {
					bdOms.addReg();
					vI[br.get('date')+l] = bdOms.reg()+1;
					bdOms.set('date',br.get('date'));
					bdOms.set('location',l);
					bdOms.set('new_cases',br.get('new_cases'));
					bdOms.set('new_deaths',br.get('new_deaths'));
					bdOms.set('total_cases',br.get('total_cases'));
					bdOms.set('total_deaths',br.get('total_deaths'));
				}
				//lert(br.getRow()+'\n\n'+bdOms.getRow());
				la = l;			
			}
			debJ('FIM carregaGOV.BR - nv='+nv+' bugs='+nb);
			//lert('fim br nv='+nv);
			alert(vIn+' registros duplos em BR\n\n'+objText(vI,'\n',':'));
		} catch (e) {
			alert('error bd br '+erro(e));
		}
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
		} else {
			cron.ev('loader');
		}

		//tit ?
		if (filtro.indexOf('1')!=-1) {
			totTag(bdOms);
			cron.ev('Country tags');
		}
		calcMediaDias(bdOms);
		cron.ev('averanges bd...');

		//calcula bd por habitantes
		bdPop = new bancoDados('por '+div+' habitantes');
		bdPop.mult = 50000000/div; //multiplicador de limites
		var la,pop;
		bdOms.eval(function() {
			bdPop.addReg();
			var l = bdOms.get('location');
			bdPop.set('date',bdOms.get('date'));
			bdPop.set('location',l);
			if (la!=l) {
				pop = getPop(l);
				la = l;
			}
			//arredonda em casas
			aeval(cmp,function(x) {
				bdPop.set(x,Math.floor(bdOms.getNum(x,0)*div*casas/pop+0.5)/casas);
			});
		});
		cron.ev('new bdHab');

		calcMediaDias(bdPop,true);
		cron.ev('averanges bdHab');
		if (dev()) {
			deb('cron='+cron.txt());
		}
		
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
			if (cmp==0) {
				return rg[cmp]+' '+strToDate(rg[cmp]).getDayStr3();
			} else if ( (cmp<2 || cmp>7) && cmp!=10 ) {
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
					var p = getPop(lo);
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
			bdLoc.addReg();
			bdLoc.set('loc','*'+e[0]);
			bdLoc.set('pop',pop);
			
		});
		//reindexa bdLoc
		bdLoc.idxLoc = bdLoc.index('loc',true);
	}

}
