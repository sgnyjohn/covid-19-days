/* 25/março/2020 14:59:59 by sgnyjohn
*/

/*
 * msft.it/6012T9Pmp
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
	var dti='999',dtf; //data maximo e minimo dos dados
	var dt; //data max do país
	var fs = function(a,b) {
			return fSort(strZero(a[6]*1000,8)+strZero(a[4]*1000,8),strZero(b[6]*1000,8)+strZero(b[4]*1000,8),true);
		};
	var days = [
		['days+100c','day (total_cases > 100)'
			,function(bd,va) {return bd.get('total_cases')*bd.mult>100||va>0 ? va+1 : 0 } ]
		,['days+10md5','day (average_5d_new_deaths > 10)'
			,function(bd,va) {return bd.get('average_5d_new_deaths')*bd.mult>10||va>0 ? va+1 : 0 } ]
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
	var map;
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
		function LIXOsel(ev) {
			
			tpFx=getFx; // V;
			

			bd = bdPop;
			varSel = 'average_5d_new_deaths';
			varSel = 'total_deaths';
			varSelMin = 0.1;
			
			varSel1 = 'total_cases';
			varSel1Min = 1.0;
			
		}
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
			opTipo = equals(o.value,'(') ? 'cases' : o.value;
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
		if (!vazio(bdC.idx[p])) {
			Pais = p;
			ds.innerHTML = '';
			mostra();
		} else {
			//lert('desconhecido ('+p+')');
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

		//projeto
		var u = 'https://github.com/sgnyjohn/covid-19-days';
		domObj({tag:'p',style:'font-size:80%;text-align:right;'
			,'':'project: <a href='+u+'>'+u+'</a>'
		,targ:ds});
		
		//fonte dados
		var u = 'https://ourworldindata.org';
		domObj({tag:'p',style:'font-size:80%;text-align:right;'
			,'':'data: <a href='+u+'>'+u+'</a>'
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
		
		//carrega dados
		new loader({timeout:30
			,0:{url:'dados/countries.csv?k1'+format(ms()/(1000*60*10),0),callback:carregaGeo}
			,1:{url:'dados/last.csv?dt'+format(ms()/(1000*60*10),0),callback:carregaOms}
			,2:{url:'dados/lastbr.csv?dt'+format(ms()/(1000*60*10),0),callback:carregaBR}
			,callback:carregaFim
		});
	}
	//***************************
	function carregaGeo(a,b,tx) {
		//Rank 	Country	obs	Population 	Date 	Source	s2
		bdC = new bancoDados();
		bdC.setTxt(tx);
		//lert(typeof(idx['China'])+' idx='+obj(idx));

		//ds.innerHTML = ''; 
		//bdC.toDom(ds,999);
	}
	//***************************
	function carregaOms(a,b,tx) {
		//carrega dados oms / ourworldindata.org
		//lert('tx='+tx);
		//date,location,new_cases,new_deaths,total_cases,total_deaths+days_c50+days_Nzero
		bdOms = new bancoDados();
		bdOms.dlCol = ',';
		bdOms.mult = 1; 
		bdOms.setTxt(tx);
	}
	//***************************
	function carregaBR(a,b,tx) {
		//lert('br='+tx.length);
		br = new bancoDados();
		br.dlCol = '\t';
		br.setTxt(tx);
		
		//população mínima
		var minPop = 200000;
		var p = new pedido();
		if (p.getJ('minPop')*1>1000) {
			minPop = p.getJ('minPop')*1;
		}

		//formato regiao	estado	municipio	coduf	codmun	codRegiaoSaude	nomeRegiaoSaude	data	semanaEpi	populacaoTCU2019	casosAcumulado	obitosAcumulado	Recuperadosnovos	emAcompanhamentoNovos
		var t = new total(2);
		var tc = {};
		br.top();
		while (br.next()) {
			var uf = br.get('estado');
			var mu = br.get('municipio');
			var pop = br.getNum('populacaoTCU2019');
			if ( (mu!=''&&pop<minPop) || uf=='') {
			} else { //dados ufs
				if (!vazio(mu)) uf += '*'+mu;
				t.inc([uf,br.get('data'),br.getNum('casosAcumulado'),br.getNum('obitosAcumulado')]);
				if (!tc[uf]) tc[uf] = pop;
			}
		}
		
		var v = t.getVector();
		//lert('vs.tam='+v.length+' '+bdOms.count());
		var qb='?z',va1,va2;
		aeval(v,function(v) {
			if (v[0]!=qb) {
				va1=0;va2=0;
				qb=v[0];
			}
			bdOms.addReg();
			var d = dataSql(strToData(v[1]).getTime()+1000*60*60*24);
			bdOms.set('date',leftAt(d,' ') );
			bdOms.set('location','*BR*'+v[0]);
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
			bdC.set('Country','*BR*'+k);
			bdC.set('Population',v);
		});
		
	}
	//***************************
	function carregaFim(ld) {	
		//lert('br='+ld);
		//totTag();

		//indexa Geo
		bdC.idx = bdC.index('Country',true);

		tot(bdOms);

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

		//MOSTRA
		bd = bdOms; //bd ativo
		//carrega controles
		mostraContr();
		//mostra
		setTimeout(mostra,1000);
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
			
			dti = dti>bd.get('date')?bd.get('date'):dti;
			dtf = dtf<bd.get('date')?bd.get('date'):dtf;
			
			var lo = bd.get('location');
			var ig = lo==bd.get('location','?',-1); //loc atual igual ao anterior

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
				//bd.get('days+10md5',0,-1)*1
				var va = (ig?bd.get(days[i][0],0,-1)*1:0); //valor anterior
				bd.set(days[i][0],(days[i][2])(bd,va));
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
