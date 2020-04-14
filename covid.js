/* 25/março/2020 14:59:59 by sgnyjohn
*/

//*******************************
function covid(Id) { 
	var id = Id;
	var doc = document;
	var ds,dsC;
	var bd; // bd ativo 
	var bdOms; //bd val abs
	var bdPop; //bd por população
	var bdC; //bd paises
	var div = 1000000;
	var casas = 100; 
	var opTipo = 'cases';
	var cmp = 'new_cases,new_deaths,total_cases,total_deaths'.split(',');
	var Pais = 'Brazil';
	var dt; //data max do país
	var fs = function(a,b) {
			return fSort(strZero(a[6]*1000,8)+strZero(a[4]*1000,8),strZero(b[6]*1000,8)+strZero(b[4]*1000,8),true);
		};
	var days = [
		['days+10md5','day (average_5d_new_deaths > 10)'
			,function(bd) {return bd.get('average_5d_new_deaths')*bd.mult>10?bd.get('days+10md5',0,-1)*1+1:0} ]
		,['days+100c','day (total_cases > 100)'
			,function(bd) {return bd.get('total_cases')*bd.mult>100?bd.get('days+100c',0,-1)*1+1:0} ]
		//,['days+20d','day (total_deaths > 20)'
		//	,function(bd) {return bd.get('total_deaths')*bd.mult>20?bd.get('days+20d',0,-1)*1+1:0} ]
	];
	var tag = [['américa do sul','~Argentina~Bolivia~Bouvet Island~Brazil~Chile~Colombia~Ecuador~Falkland Islands~French Guiana~Guyana~Paraguay~Peru~South Georgia~South Sandwich Islands~Suriname~Uruguay~Venezuela~']
		,['américa central','~Belize~Costa Rica~El Salvador~Guatemala~Honduras~Nicaragua~Panama~']
		,['américa do norte','~Anguilla~Antigua and Barbuda~Aruba~The Bahamas~Barbados~Belize~Bermuda~Bonaire~British Virgin Islands~Canada~Cayman Islands~Clipperton Island~Costa Rica~Cuba~Curaçao~Dominica~Dominican Republic~El Salvador~Federal Dependencies of Venezuela~Greenland~Grenada~Guadeloupe~Guatemala~Haiti~Honduras~Jamaica~Martinique~Mexico~Montserrat~Nicaragua~Nueva Esparta~Panama~Puerto Rico~Saba~San Andrés and Providencia~Saint Barthélemy~Saint Kitts and Nevis~Saint Lucia~Saint Martin~Saint Pierre and Miquelon~Saint Vincent and the Grenadines~Sint Eustatius~Sint Maarten~Trinidad and Tobago~Turks and Caicos Islands~United States~United States Virgin Islands~']
		,['africa','~Algeria~Angola~Benin~Botswana~Burkina Faso~Burundi~Cameroon~Canary Islands~Cape Verde~Central African Republic~Ceuta~Chad~Comoros~Democratic Republic of the Congo~Djibouti~Egypt~Equatorial Guinea~Eritrea~Eswatini~Ethiopia~French Southern and Antarctic Lands~Gabon~Ghana~Guinea~Guinea-Bissau~Ivory Coast~Kenya~Lesotho~Liberia~Libya~Madagascar~Madeira~Malawi~Mali~Mauritania~Mauritius~Mayotte~Melilla~Morocco~Mozambique~Namibia~Niger~Nigeria~Republic of the Congo~Réunion~Rwanda~Saint Helena, Ascension and Tristan da Cunha~São Tomé and Príncipe~Senegal~Seychelles~Sierra Leone~Somalia~South Africa~South Sudan~Sudan~Tanzania~The Gambia~Togo~Tunisia~Uganda~Western Sahara~Zambia~Zimbabwe~']
		,['asia','Afghanistan~Armenia~Azerbaijan~Bahrain~Bangladesh~Bhutan~Brunei~Cambodia~China~Cyprus~East Timor~Georgia~India~Indonesia~Iran~Iraq~Israel~Japan~Jordan~Kazakhstan~Kuwait~Kyrgyzstan~Laos~Lebanon~Malaysia~Maldives~Mongolia~Myanmar~Nepal~North Korea~Oman~Pakistan~Palestine~Papua New Guinea~Philippines~Qatar~Russia~Saudi Arabia~Singapore~South Korea~Sri Lanka~Syria~Taiwan~Tajikistan~Thailand~Turkey~Turkmenistan~United Arab Emirates~Uzbekistan~Vietnam~Yemen~']
		,['nato','~Albania~Belgium~Bulgaria~Canada~Croatia~Czechia~Denmark~Estonia~France~Germany~Greece~Hungary~Iceland~Italy~Latvia~Lithuania~Luxembourg~Montenegro~Netherlands~North Macedonia~Norway~Poland~Portugal~Romania~Slovakia~Slovenia~Spain~Turkey~United Kingdom~United States~']
		,['oecd','Australia~Austria~Belgium~Canada~Chile~Czech Republic~Denmark~Estonia~Finland~France~Germany~Greece~Hungary~Iceland~Ireland~Israel~Italy~Japan~Korea, South~Latvia~Lithuania~Luxembourg~Mexico~Netherlands~New Zealand~Norway~Poland~Portugal~Slovakia~Slovenia~Spain~Sweden~Switzerland~Turkey~United Kingdom~United States~Abkhazia~Artsakh~Northern Cyprus~South Ossetia~']
	]
	//lert('days='+days);
	setTimeout(init,1000);
	//***************************
	function click(ev) {
		var o = targetEvent(ev);
		//lert('o='+o.tagName+' '+o);
		if (o.name=='Pais') {
			Pais = o.value;
			ds.innerHTML = '';
			mostra();
			return;
		} else if (o.name=='opTipo') {
			ds.innerHTML = '';
			//só paises ?
			if (o.value=='countries') {
				ds.appendChild(bdC.toDom());
				return;
			}
			opTipo = o.value;
			bd = (opTipo=='cases'?bdOms:bdPop);
			mostra();
			return;
		} else if (o.tagName == 'TD') {
			p = o.innerHTML;
			//lert('po='+p);
		} else if (o.tagName != 'TR') {
			//bjNav(o);alert(1);
			o = getParentByTagName(o,'tr');
			var p = o.cells.item(1).innerHTML; //pega coluna 2...
			return;
		}
		//bjNav(o);alert(2);
		if (bdC.idx[p]) {
			Pais = p;
			ds.innerHTML = '';
			mostra();
		//} else {
		//	alert('desconhecido '+p);
		}
	}
	//***************************
	function mostra1() {
		var v = doc.getElementsByClassName('bdToDom');
		for (var i=0;i<v.length;i++) {
			v[i].addEventListener('click',click,true);
			var tr = v[i].getElementsByTagName('tr');
			for (var c=0;c<tr.length;c++) {
				if (tr[c].childNodes.item(1).innerHTML==Pais) {
					tr[c].className = 'B';
					break;
				}
			}
		}
	}
	//***************************
	function getPos(pais,vr,day) {
		//seleciona o dia 
		var vc=[],vc1=[];
		bd.top();
		while (bd.next()) {
			if (bd.get(vr)==day && 
				( bd.get('location')!='World' && bd.get('location').charAt(0)!='*' ) ) {
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
			if (rr.indexOf('>'+bd.get('location')+'~')==-1)
				rr += '<option>'+bd.get('location')+'~';
		});
		//select country
		domObj({tag:'select',name:'Pais',style:'xfloat:right;fontx-size:80%;color:blue;'
			,'':troca(rr,'~','')
			,ev_change:click
		,targ:dsC});
		//opTipo
		domObj({tag:'select',name:'opTipo',style:'xfloat:right;fontx-size:80%;color:blue;'
			,'':'<option>(view)<option>cases<option'+(equals(opTipo,'per mi')?' selected':'')
				+'>per million inhabitants<option>countries'
			,ev_change:click
		,targ:dsC});
	}
	//***************************
	function mostra() {
		//procura pais e pega dt, days maximos do país
		//	e monta option selects
		dt=''; 
		bd.top();
		bd.eval(function(){
			//dt e max dias
			if (bd.get('location')==Pais && dt<bd.get('date') ) {
				dt = bd.get('date');
				aeval(days,function(x) {x[3] = bd.get(x[0]);}); //days maximos
			} 
		});
		
		//mostra data
		domObj({tag:'h1',style:'margin:0;color:red;'
			,'':dt
		,targ:ds});

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
		var vd=[],vp=[],vr=[];
		aeval(days,function(x){x[4]=[];});
		while (bd.next()) {
			
			//dados pais
			if (bd.get('location')==Pais && bd.get('new_cases'  ,0)*1+bd.get('new_deaths'  ,0)*1
					+bd.get('total_cases',0)*1+bd.get('total_deaths',0)*1>0 ) {
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
		}
		
		//monta e mostra grafico
		var vg = [];
		var vv = 7;//days[0][0];
		aeval(vp,function(x){
			if (x[vv]>0) {
				vg[vg.length] = [ x[vv], 1*x[6] ];
			}
		});
		//date	location	new_cases	new_deaths	total_cases	total_deaths	
		//lert('vv='+vv+' vg='+vg);
		vg.sort(function(a,b){return fSort(1*a[0],1*b[0]);});
		domObj({tag:'h2','':Pais+' - average_5d_new_deaths - ('+opTipo+')',targ:ds})
		domObj({tag:'div',targ:ds,'':(new graphBar(vg,{})).getHtml()});
		
		//mostra resumo world
		vr.sort(fs);
		vr.length = 20;
		domObj({tag:'h2','':'World Summary - ('+opTipo+')',targ:ds});bd.toDom(ds,20,vr);		
		
		//ranking dias do país
		domObj({tag:'h2','':'Evolution of the position: '+Pais+' - ('+opTipo+')',targ:ds});bl.toDom(ds,999);		

		//mostra dias
		aeval(days,function(x,nc) {
			x[4].sort(fs);
			domObj({tag:'h2','':Pais+' <b style="color:blue;">'+x[3]+'º</b> '+x[1]+' - ('+opTipo+')',targ:ds});
			bd.toDom(ds,999,x[4]);
			var tb = ds.lastChild;
			tb.className += ' days_'+nc;
		});
		
		//dados país
		vp.sort(function(a,b) { return fSort(a[0],b[0],true); });
		domObj({tag:'h2','':Pais+' - ('+opTipo+')',targ:ds});bd.toDom(ds,999,vp);

		//dados do mundo
		vd.sort(fs);
		domObj({tag:'h2','':'world '+dt+'  - ('+opTipo+')',targ:ds});bd.toDom(ds,999,vd);

		//fonte dados
		var u = 'https://ourworldindata.org';
		domObj({tag:'p',style:'float:right;font-size:80%;text-alignx:right;'
			,'':'fonte: <a href='+u+'>'+u+'</a>'
		,targ:ds});

		setTimeout(mostra1,500);
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
				
		//carrega dados oms / ourworldindata.org
		(new carregaUrl()).abre('dados/last.csv?dt'+format(ms()/(1000*60*10),0),function(a,b,tx) {
			//lert('tx='+tx);
			//date,location,new_cases,new_deaths,total_cases,total_deaths+days_c50+days_Nzero
			bdOms = new bancoDados();
			bdOms.dlCol = ',';
			bdOms.mult = 1; 
			bdOms.setTxt(tx);

			//totTag();
			tot(bdOms);
			
			bd = bdOms; //bd ativo
			setTimeout(mostra,1000);
			
			//carrega controles
			mostraContr();
		
			//carrega dados paises
			(new carregaUrl()).abre('dados/countries.csv?dtx'+format(ms()/(1000*60*10),0),function(a,b,tx) {
				//Rank 	Country	obs	Population 	Date 	Source
				bdC = new bancoDados();
				bdC.setTxt(tx);
				bdC.idx = bdC.index('Country',true);
				//lert(typeof(idx['China'])+' idx='+obj(idx));

				//ds.innerHTML = ''; 
				//bdC.toDom(ds,999);
				
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

				//totTag();
				tot(bdPop,true);

				//bd = bdPop;
				//setTimeout(mostra,1000);
				
			});		
		
		});
	}
	
	//***************************
	function tot(bd,tp) {
		
		tp = tp?casas:1;
		
		
		// ORDENA
		//		(a>b?1:(a<b?-1:0));
		bd.sort(function(a,b) {return a[1]>b[1]?1:(a[1]<b[1]?-1:
				(a[0]>b[0]?1:(a[0]<b[0]?-1:0)) //se 1a coluna ENTAO sort 2a coluna
		);});
		

		//calcula dias,media
		bd.top();
		var md,tn,l;
		while (bd.next()) {
			var lo = bd.get('location');
			var ig = lo==bd.get('location','?',-1); //loc atual igual anterior

			if (true) {
				//média 5 dias 2 antes e 2 depois
				tn=0;
				md=0;
				if (bd.get('location','?',-2)==lo) {tn++;md+=bd.get('new_deaths',0,-2)*1};
				if (bd.get('location','?',-1)==lo) {tn++;md+=bd.get('new_deaths',0,-1)*1};
				tn++;md+=bd.get('new_deaths',0)*1;
				if (bd.get('location','?', 1)==lo) {tn++;md+=bd.get('new_deaths',0, 1)*1};
				if (bd.get('location','?', 2)==lo) {tn++;md+=bd.get('new_deaths',0, 2)*1};
				bd.set('average_5d_new_deaths',Math.floor(md/tn*tp+0.5)/tp);				
				
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
				bd.set(days[i][0],(days[i][2])(bd));
			}
		
			
		}
	}
	//***************************
	function totTag(bd) {
		aeval(tag,function(e){e[2] = {};}); //add totalizador por tag
		bd.top();
		while (bd.next()) {
			aeval(tag,function(e){
				if (e[1].indexOf('~'+bd.get('location')+'~')!=-1) {
					var ch = bd.get('date');
					var t = e[2][ch];
					if (!t) {
						t = Array(0,0,0,0);
						e[2][ch] = t;
					}
					t[0] += bd.get('new_cases',0)*1;
					t[1] += bd.get('new_deaths',0)*1;
					t[2] += bd.get('total_cases',0)*1;
					t[3] += bd.get('total_deaths',0)*1;
				}
			});
		}
		//guarda no bd
		aeval(tag,function(e) {
			//lert('e='+e);
			aeval(e[2],function(v,dt) {
				//lert('dt='+dt+' '+e[0]+' '+v);
				bd.addReg();
				bd.set('date',dt);
				bd.set('location','*'+e[0]);
				bd.set('new_cases',v[0]);
				bd.set('new_deaths',v[1]);
				bd.set('total_cases',v[2]);
				bd.set('total_deaths',v[3]);
			});
		});
	}

}
